# Decisión T1: Rediseño del Mecanismo de Refueling

**Por:** Morpheus (Lead/Architect)
**Tier:** T1
**Fecha:** 2026-03-21
**Estado:** 📐 DISEÑO PROPUESTO — pendiente aprobación del founder

---

## 1. Evaluación de la Propuesta

### Veredicto: ✅ SÓLIDA — con safeguards obligatorios

La propuesta del founder es arquitectónicamente superior al mecanismo anterior. Paso de evaluarla:

**Problemas que resuelve:**

| Problema (perpetual-motion.yml) | Cómo lo resuelve el nuevo enfoque |
|---|---|
| Race condition: N issues cerrados → N workflows → N duplicados | Eliminado de raíz. Ralph es single-threaded por terminal. Un solo actor decide cuándo refueling. |
| Acoplamiento externo: GitHub Actions como motor de autonomía | Internalizado. El ciclo vive dentro de la sesión Squad, donde tiene contexto completo. |
| Dedup guard frágil: requería buscar issues existentes bajo presión de concurrencia | Innecesario. No hay concurrencia — el Lead spawneado por Ralph es el único que crea issues. |
| Falta de contexto: el workflow creaba un issue genérico "Define next roadmap" sin saber qué se acababa de completar | El Lead tiene acceso a history.md, PRs recientes, roadmap.md, issues cerrados — contexto total. |
| Cadena de dependencias: workflow → issue → ralph-watch.ps1 → Squad session → Lead | Colapsado a: Ralph → Lead → issues. Dos pasos, cero intermediarios. |

**Riesgos nuevos que introduce:**

| Riesgo | Severidad | Mitigación (ver §2) |
|---|---|---|
| **Loop infinito**: Ralph → Lead → issues → Ralph → Lead → ... sin fin | 🔴 CRÍTICO | Contador de ciclos de refueling por sesión. Máximo configurable. |
| **Degradación de calidad**: el Lead propone trabajo repetitivo o de bajo valor | 🟡 MEDIO | El prompt del Lead incluye instrucciones anti-repetición + revisa issues recién cerrados. |
| **Contexto acumulado**: sesiones largas con muchos ciclos saturan la ventana de contexto | 🟡 MEDIO | Límite de ciclos de refueling + el Lead es spawneado (contexto aislado). |
| **Sin señal externa de parada**: antes, desactivar el workflow paraba todo | 🟢 BAJO | Ralph ya responde a "idle"/"stop". Además, el límite de ciclos para automáticamente. |
| **Cada terminal genera su propio refueling en multi-terminal**: posible conflicto en Test 3 | 🟡 MEDIO | Cada terminal es un repo distinto → no hay conflicto. Diseño hub/spoke lo previene. |

**Conclusión:** La propuesta elimina el defecto fundamental (concurrencia descontrolada) moviendo la decisión de refueling a un punto single-threaded (Ralph). Los riesgos nuevos son todos mitigables con safeguards en el prompt y un contador simple.

---

## 2. Diseño Detallado del Mecanismo

### 2.1 Cambio en el Comportamiento de Ralph

**Antes (línea 1004 de squad.agent.md):**
```
| **No work found** | All clear | Report: "📋 Board is clear. Ralph is idling."
                                   Suggest `npx github:bradygaster/squad watch` for persistent polling. |
```

**Después:**
```
| **No work found** | All clear | Execute REFUELING PROTOCOL (see §Refueling Protocol below). |
```

El cambio es quirúrgico: solo la fila "No work found" de la tabla Step 2. Todo lo demás de Ralph permanece idéntico.

### 2.2 Protocolo de Refueling (nueva sección en squad.agent.md)

```markdown
### Refueling Protocol

When Ralph's scan finds NO work (board is clear), execute this protocol instead of idling:

**Pre-conditions — check ALL before proceeding:**
1. `refuel_count` < `max_refuel_cycles` (default: 3 per session)
2. At least 1 issue was completed since the last refueling (prevents empty-loop spinning)
3. No open issues with label `squad` exist (prevents creating work when work exists but was missed)

**If ANY pre-condition fails → HARD STOP:**
```
📋 Board is clear. Ralph is idling.
   ♻️ Refueling limit reached ({refuel_count}/{max_refuel_cycles} cycles this session).
   💡 Say "Ralph, go" in a new session to continue, or create issues manually.
```

**If ALL pre-conditions pass → REFUEL:**

1. Report status:
```
♻️ Ralph: Board clear after {issues_completed} issues completed.
   Spawning Lead for roadmap refueling... (cycle {refuel_count + 1}/{max_refuel_cycles})
```

2. Spawn the Lead agent with the Refueling Prompt (see §2.3).

3. After Lead completes:
   - Verify new issues were created: `gh issue list --label "squad" --state open`
   - If issues exist → increment `refuel_count` → report → return to Step 1 (scan for work)
   - If NO issues created (Lead decided project is complete) → HARD STOP with:
```
📋 Board is clear. Lead reports no further work needed.
   🏁 Project may be at a natural endpoint. Ralph is idling.
```

4. Between refueling and the next scan, wait 30 seconds (cooldown to let GitHub API propagate).
```

### 2.3 Prompt Exacto para Spawnar al Lead

Este es el prompt que Ralph (el coordinator) usa para spawnar al Lead cuando el board está vacío:

```
You are {lead_name}, the Lead/Architect on this project.

Read your charter: .squad/agents/{lead_name}/charter.md
Read your history: .squad/agents/{lead_name}/history.md  
Read team decisions: .squad/decisions.md

TASK: The work board is empty. All current issues are completed. Define the next evolution cycle for this project.

ANALYSIS STEPS (do ALL before creating issues):
1. Read roadmap.md — what has been completed? What was the original vision?
2. Run: gh issue list --state closed --limit 20 --json number,title,closedAt — what was recently delivered?
3. Run: gh pr list --state merged --limit 10 --json number,title,mergedAt — what PRs shipped?
4. Read README.md — what does the project do today?
5. Check: are there any open issues already? Run: gh issue list --state open --json number,title,labels
6. If open issues exist with label "squad" → DO NOT create new ones. Report back that work exists.

CREATION RULES:
- Create exactly 3 issues (not more, not fewer). Quality over quantity.
- Each issue MUST have label "squad" (for Ralph to detect).
- Each issue MUST have concrete acceptance criteria (files to create/modify, tests to add, measurable outcomes).
- Each issue MUST be achievable by @copilot (well-defined, scoped, no architecture decisions).
- Issues should EVOLVE the project — not repeat what was already done.
- Issues should have NATURAL ENDPOINTS — not open-ended work.
- Check titles of recently closed issues to avoid proposing the same work.
- Follow .squad/guides/writing-copilot-issues.md if it exists.

ANTI-PATTERNS (do NOT do these):
- Do NOT create vague issues like "Improve performance" or "Refactor code"
- Do NOT create issues that duplicate recently completed work
- Do NOT create more than 3 issues
- Do NOT modify roadmap.md (Ralph will track via issues, not roadmap file)
- If the project genuinely has no more useful work → create ZERO issues and report: "Project is at a natural endpoint. No further issues needed."

FORMAT for each issue (use gh issue create):
  Title: [Concise, actionable title]
  Body: ## Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n...\n\n## Files\n- file1 (create/modify)\n...\n\n## Context\n[Why this matters for the project]
  Labels: squad

Execute now.
```

### 2.4 Cuántos Issues por Ciclo

**Fijo: 3 issues por ciclo de refueling.** No configurable.

Justificación:
- **¿Por qué no 5?** Demasiados. Si el Lead crea 5 y son de calidad mediocre, Ralph trabaja en basura. 3 fuerza priorización.
- **¿Por qué no 1?** Demasiado poco. 1 issue se completa en minutos y dispara otro ciclo de refueling — overhead excesivo.
- **¿Por qué no configurable?** Complejidad innecesaria. 3 es el balance entre throughput y calidad. Si el founder quiere ajustarlo en el futuro, es un cambio de una línea en el prompt.

### 2.5 Máximo de Ciclos de Refueling por Sesión

**Fijo: 3 ciclos por sesión.** = 9 issues máximo por sesión.

Esto significa:
- Ciclo 1: Lead crea 3 issues → Ralph los ejecuta → board vacío
- Ciclo 2: Lead crea 3 issues más → Ralph los ejecuta → board vacío
- Ciclo 3: Lead crea 3 issues más → Ralph los ejecuta → board vacío
- Ciclo 4: **BLOQUEADO** → Ralph idle, sugiere nueva sesión

**9 issues por sesión es un throughput excelente.** Test 2 demostró ~17 PRs por sesión en SS en 5 horas. 9 issues con ejecución completa es más que suficiente para una sesión productiva.

### 2.6 Labels y Formato

Los issues creados por el Lead DEBEN tener:

| Campo | Valor | Razón |
|---|---|---|
| **Label obligatorio** | `squad` | Ralph escanea por esta label en Step 1. Sin ella, el issue es invisible. |
| **Label opcional** | `squad:{member}` | Si el Lead sabe qué agente debe ejecutarlo. Si no, Ralph triagea. |
| **Título** | Accionable, concreto | "Add rate limiting to API endpoints" ✅ / "Improve things" ❌ |
| **Body** | Acceptance criteria + Files + Context | Formato estándar de issues @copilot-ready |

### 2.7 Estado de Ralph — Nuevas Variables de Sesión

Añadir al Ralph State (session-scoped):

```
- refuel_count — number of refueling cycles completed this session (starts at 0)
- max_refuel_cycles — maximum allowed (default: 3)
- issues_since_last_refuel — count of issues completed since last refueling (must be >0 to refuel)
```

---

## 3. Cambios Necesarios en squad.agent.md

### 3.1 Cambio 1: Tabla Step 2 — Fila "No work found"

**Ubicación:** Sección "Ralph — Work Monitor" → "Step 2 — Categorize findings"

**Texto actual (línea ~1004):**
```markdown
| **No work found** | All clear | Report: "📋 Board is clear. Ralph is idling." Suggest `npx github:bradygaster/squad watch` for persistent polling. |
```

**Texto nuevo:**
```markdown
| **No work found** | All clear | Execute **Refueling Protocol** (see below). If refueling limit reached or Lead reports no work needed, then report: "📋 Board is clear. Ralph is idling." |
```

### 3.2 Cambio 2: Fila 6 del flujo de integración

**Ubicación:** Sección "Integration with Follow-Up Work" (línea ~1082)

**Texto actual:**
```markdown
6. No more work → "📋 Board is clear. Ralph is idling." (suggest `npx github:bradygaster/squad watch` for persistent polling)
```

**Texto nuevo:**
```markdown
6. No more work → Execute **Refueling Protocol**. If refueling succeeds, go to step 4. If limit reached or project complete, "📋 Board is clear. Ralph is idling."
```

### 3.3 Cambio 3: Línea 1084 — comportamiento final

**Texto actual:**
```markdown
**Ralph does NOT ask "should I continue?" — Ralph KEEPS GOING.** Only stops on explicit "idle"/"stop" or session end. A clear board → idle-watch, not full stop. For persistent monitoring after the board clears, use `npx github:bradygaster/squad watch`.
```

**Texto nuevo:**
```markdown
**Ralph does NOT ask "should I continue?" — Ralph KEEPS GOING.** Only stops on explicit "idle"/"stop", session end, or refueling limit reached. A clear board triggers the Refueling Protocol — Ralph spawns the Lead to create new work, then continues the loop. After `max_refuel_cycles` (default: 3), Ralph truly idles.
```

### 3.4 Cambio 4: Nueva sección "Refueling Protocol"

**Insertar DESPUÉS de la sección "Ralph State" (después de línea ~1055), ANTES de "Ralph on the Board":**

Contenido: El protocolo completo descrito en §2.2 y §2.3 de este documento.

### 3.5 Cambio 5: Ralph State — nuevas variables

**Ubicación:** Sección "Ralph State" (línea ~1051)

**Añadir al final de la lista:**
```markdown
- **Refuel count** — how many refueling cycles completed this session (starts at 0, max: 3)
- **Issues since last refuel** — count of issues completed since last refueling (must be >0 to allow refueling)
```

### 3.6 Universalidad: Todos los Repos de la Constelación

Estos cambios van en `squad.agent.md`, que es el agent file de Squad. **Squad es un paquete instalado globalmente** — el archivo `.github/agents/squad.agent.md` se instala en cada repo via `npx github:bradygaster/squad install`.

Para que funcione en toda la constelación:
1. **Opción A (recomendada): PR a Brady** — proponer el Refueling Protocol como feature upstream de Squad. Esto lo distribuye a todos los usuarios, no solo a SS.
2. **Opción B (pragmática): Override local** — modificar `.github/agents/squad.agent.md` en cada repo manualmente. Funciona pero se pierde en upgrades de Squad.
3. **Opción C (híbrida): Skill que inyecta el comportamiento** — crear un skill `.squad/skills/refueling-protocol.md` que el Lead lee cuando es spawneado. Ralph solo necesita saber "spawna al Lead con el skill refueling-protocol". El prompt del Lead se parametriza vía el skill, no vía squad.agent.md.

**Recomendación: Opción C** — mínimo acoplamiento con Squad upstream, portable entre repos via `.squad/skills/`, y se puede ajustar sin tocar squad.agent.md.

Para la Opción C:
- Ralph necesita UNA línea cambiada en squad.agent.md: la fila "No work found" apunta a "spawn Lead with refueling skill"
- El skill `.squad/skills/refueling-protocol.md` contiene el prompt completo del §2.3
- Se copia a cada repo via el mecanismo de skills heredados (ver `downstream-management.md`)

---

## 4. Qué Pasa con perpetual-motion.yml

### Veredicto: 🗑️ ELIMINAR COMPLETAMENTE

**No mantener como fallback.** Razones:

1. **El defecto es fundamental, no un bug.** No es que le faltara dedup — es que event-driven con concurrencia en issues.closed es inherentemente propenso a race conditions. Parchear con dedup es poner tiritas en una arteria.

2. **El nuevo mecanismo lo reemplaza completamente.** perpetual-motion.yml hacía dos cosas:
   - Detectar que el roadmap se agotó → ahora Ralph lo detecta (board vacío)
   - Crear issue "Define next roadmap" → ahora Ralph spawna al Lead directamente (sin issue intermediario)

3. **Mantenerlo como fallback crea confusión.** Dos mecanismos de refueling = dos fuentes de verdad = bugs de coordinación.

**Acción:**
- Eliminar `.github/workflows/perpetual-motion.yml` de TODOS los repos de la constelación
- Eliminar el test `scripts/__tests__/perpetual-motion-e2e.test.js` (o refactorizarlo para testear el nuevo protocolo)
- Actualizar `now.md` y documentación que referencie "perpetual-motion.yml"

**¿Qué pasa con ralph-watch.ps1?**

`ralph-watch.ps1` (Layer 2) era el complemento de perpetual-motion.yml — detectaba issues "Define next roadmap" y abría sesiones Squad. Con el nuevo diseño:

- **El rol de ralph-watch.ps1 cambia:** ya no necesita detectar issues de refueling, porque el refueling es interno a la sesión Squad.
- **Nuevo rol potencial:** monitor de salud puro — verificar que las sesiones Squad en tmux están vivas, que hay issues moviéndose, que no hay stalls. Pero esto es una decisión separada.
- **Acción inmediata:** No eliminar ralph-watch.ps1 todavía. Marcarlo como `DEPRECATED` en su header. Evaluar su nuevo rol como parte del diseño de Test 3.

---

## 5. Edge Cases

### 5.1 ¿Qué pasa si el Lead no puede proponer más trabajo?

El prompt del Lead incluye la instrucción:
> "If the project genuinely has no more useful work → create ZERO issues and report: 'Project is at a natural endpoint.'"

Ralph detecta esto (no se crearon issues) y hace hard stop:
```
📋 Board is clear. Lead reports no further work needed.
🏁 Project may be at a natural endpoint. Ralph is idling.
```

**Esto es CORRECTO.** No todos los proyectos necesitan trabajo infinito. Un proyecto "terminado" debe poder declararse como tal. El founder puede:
- Crear issues manualmente para reactivar
- Iniciar nueva sesión con instrucciones específicas
- Dejar el repo en paz

### 5.2 ¿Qué pasa si Ralph spawna al Lead pero el Lead falla?

Posibles fallos:
- El Lead no se spawna (error de contexto/herramientas)
- El Lead se spawna pero `gh issue create` falla (permisos, API, rate limit)
- El Lead crea issues malformados (sin label `squad`)

**Mitigación:**
```
After Lead spawn completes, verify:
  issues = gh issue list --label "squad" --state open
  
  if (issues.count == 0 AND lead reported success):
    → Log warning: "Lead reported success but no issues found. Possible label issue."
    → DO NOT retry. Go to hard stop. Let human investigate.
  
  if (lead spawn failed with error):
    → Log error. DO NOT retry automatically.
    → Report: "⚠️ Refueling failed: {error}. Ralph is idling."
    → The human or a new session can retry.
```

**Principio: NO reintentar automáticamente.** Un fallo de refueling no es un fallo transitorio — probablemente indica un problema de contexto o permisos que reintentar no resolverá. Mejor parar limpiamente y dejar que el próximo ciclo (nueva sesión) lo intente con contexto fresco.

### 5.3 ¿Qué pasa si se crean issues que no tienen sentido?

Este es el riesgo de calidad más real. Mitigaciones:

1. **El prompt es estricto:** "concrete acceptance criteria", "achievable by @copilot", "NOT vague". Esto filtra el 80% de issues basura.

2. **El review gate existe:** Si el repo tiene branch protection (que debería post-Test 2), los PRs generados a partir de issues basura serán rechazados en review.

3. **Límite de 3 issues:** Incluso si los 3 son mediocres, el daño es limitado. 3 issues malos = ~30 minutos de trabajo perdido. Aceptable.

4. **Límite de 3 ciclos:** Máximo 9 issues mediocres por sesión. Después, hard stop. El founder revisa en la siguiente sesión.

5. **El Lead revisa issues cerrados recientes:** "Check titles of recently closed issues to avoid proposing the same work." Esto previene repetición directa.

**Lo que NO se puede prevenir:** el Lead proponiendo trabajo que es técnicamente correcto pero estratégicamente inútil. Esto requiere supervisión humana periódica — que es exactamente lo que el límite de 3 ciclos por sesión fuerza.

### 5.4 ¿Cómo evitar que el Lead proponga siempre lo mismo?

El prompt incluye:
- "Run: `gh issue list --state closed --limit 20`" → ve qué se hizo recientemente
- "Check titles of recently closed issues to avoid proposing the same work"
- "Issues should EVOLVE the project — not repeat what was already done"

Además, el Lead lee `history.md` que contiene el historial de fases y decisiones. Esto le da contexto de la trayectoria del proyecto.

**Riesgo residual:** Después de muchos ciclos (sesiones, no solo intra-sesión), el Lead podría quedarse sin ideas genuinamente nuevas. Esto es intencional — es la señal de "proyecto terminado" del §5.1.

---

## 6. Impacto en Test 3 (Azure VM)

### 6.1 Modelo de Operación: 5 tmux windows

```
┌─────────────────────────────────────────────────┐
│  Azure VM (B2s v2, Ubuntu 24.04)                │
│                                                  │
│  tmux session: squad-constellation               │
│  ┌─────────────┐  ┌─────────────┐               │
│  │ Window 0    │  │ Window 1    │               │
│  │ SS (hub)    │  │ FFS         │               │
│  │ Ralph loop  │  │ Ralph loop  │               │
│  │ ↕ refuel    │  │ ↕ refuel    │               │
│  └─────────────┘  └─────────────┘               │
│  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │ Window 2    │  │ Window 3    │  │ Win 4  │  │
│  │ flora       │  │ ComeRosq.   │  │ pixel  │  │
│  │ Ralph loop  │  │ Ralph loop  │  │ Ralph  │  │
│  │ ↕ refuel    │  │ ↕ refuel    │  │↕refuel │  │
│  └─────────────┘  └─────────────┘  └────────┘  │
└─────────────────────────────────────────────────┘
```

### 6.2 ¿Cada terminal tiene su propio ciclo Lead→issues→Ralph?

**SÍ, y esto es correcto.**

Cada terminal = un repo = un Lead local = un ciclo independiente. No hay conflicto porque:

1. **Aislamiento por repo:** Cada terminal opera en su propio directorio, su propio repo, sus propios issues. El Lead de flora no crea issues en ComeRosquillas.

2. **Sin concurrencia:** Dentro de cada terminal, Ralph es single-threaded. Refueling es secuencial. No hay race condition posible.

3. **Sin punto de coordinación central:** No necesitan coordinarse entre sí. Cada repo evoluciona independientemente. Esto fue una decisión explícita ("decentralized roadmap ownership").

4. **Limites independientes:** Cada terminal tiene su propio `refuel_count`. Si flora agota 3 ciclos, ComeRosquillas sigue operando.

### 6.3 Capacidad del VM

Con el nuevo mecanismo:
- Cada terminal ejecuta: escaneo (5s) + spawn Lead (~1-2min) + crear issues (~30s) + ejecutar issues (~5-15min cada uno)
- 5 terminales en paralelo = ~5x CPU/memoria durante picos de ejecución
- B2s v2 (2 vCPU, 4GB RAM) puede ser justo con 5 sesiones simultáneas de Copilot CLI

**Recomendación:** Monitorear uso de recursos en Test 3. Si hay contención, escalonar los arranques (stagger: ventana 0 arranca, espera 2min, ventana 1 arranca, etc.) o usar B4s v2 (€40-50/mo, aún dentro del presupuesto de €500).

### 6.4 Reinicio de Sesiones

Con perpetual-motion.yml, si una sesión moría, el siguiente event-trigger la revivía. Con el nuevo mecanismo:

- Si una sesión tmux muere → ese repo se para. No hay mecanismo externo de recovery.
- **Solución:** Script de healthcheck que verifica que cada ventana tmux tiene un proceso vivo. Si no → reinicia la sesión Squad en esa ventana. Esto es el nuevo rol de ralph-watch.ps1 o un script más simple.

```bash
# Ejemplo: check-sessions.sh (cron cada 5 min)
for window in 0 1 2 3 4; do
  if ! tmux has-session -t squad-constellation 2>/dev/null; then
    # Toda la sesión tmux murió — reiniciar todo
    ./start-constellation.sh
    exit 0
  fi
  
  pane_pid=$(tmux list-panes -t squad-constellation:$window -F '#{pane_pid}')
  if ! kill -0 $pane_pid 2>/dev/null; then
    # Ventana muerta — reiniciar solo esa
    tmux send-keys -t squad-constellation:$window "cd /path/to/repo && copilot 'Ralph, go'" Enter
  fi
done
```

---

## 7. Plan de Implementación

| Paso | Qué | Quién | Prioridad |
|---|---|---|---|
| 1 | Crear skill `.squad/skills/refueling-protocol.md` con el prompt del Lead | Morpheus | 🔴 Crítico |
| 2 | Modificar squad.agent.md: fila "No work found" + nueva sección Refueling Protocol + Ralph State vars | Morpheus | 🔴 Crítico |
| 3 | Eliminar `.github/workflows/perpetual-motion.yml` en TODOS los repos | Tank | 🔴 Crítico |
| 4 | Deprecar ralph-watch.ps1 (header comment, no eliminar aún) | Tank | 🟡 Medio |
| 5 | Crear script de healthcheck para tmux sessions en Azure | Tank | 🟡 Medio (pre-Test 3) |
| 6 | Refactorizar `perpetual-motion-e2e.test.js` → `refueling-protocol.test.js` | Switch | 🟢 Bajo |
| 7 | Propagar skill + squad.agent.md changes a repos downstream | Morpheus | 🔴 Crítico (pre-Test 3) |

### Dependencias

```
Paso 1 ──→ Paso 2 ──→ Paso 7 (secuencial: skill primero, luego squad.agent.md, luego propagar)
Paso 3 ──→ (independiente, puede ir en paralelo con 1-2)
Paso 4 ──→ Paso 5 (deprecar antes de reemplazar)
Paso 6 ──→ (independiente, después de que el diseño esté aprobado)
```

---

## 8. Resumen Ejecutivo

El mecanismo de refueling pasa de ser **event-driven externo** (GitHub Actions reacciona a issues.closed) a ser **loop-driven interno** (Ralph detecta board vacío → spawna Lead → Lead crea issues → Ralph continúa).

Esto elimina el defecto fundamental de Test 2 (race condition por concurrencia) y simplifica la arquitectura de 3 capas (workflow + ralph-watch + squad) a 1 capa (squad session con refueling integrado).

**Safeguards: 3 issues por ciclo, 3 ciclos por sesión, verificación pre-refueling, no-retry on failure, natural endpoint detection.**

**Impacto: perpetual-motion.yml se elimina. ralph-watch.ps1 se depreca (nuevo rol por definir). squad.agent.md recibe cambios quirúrgicos en 3 puntos + 1 nueva sección. Funciona en todos los repos via skill heredado.**

---

*Decisión de Morpheus (Lead/Architect). Tier T1. Pendiente aprobación del founder para ejecución.*
