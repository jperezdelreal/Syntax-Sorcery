# Multi-Squad Azure VM R&D — Architecture Proposal

**Date:** 2026-03-25  
**Author:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** 🔬 R&D PROPOSAL — Awaiting founder discussion  
**Roadmap:** Phase 10, Item #37

---

## Resumen Ejecutivo

Propuesta de arquitectura para operar múltiples sesiones Copilot CLI (una por repo downstream) en una sola VM Azure, ejecutando squads de forma autónoma 24/7. Esto es R&D — hay incógnitas críticas que requieren validación experimental antes de comprometer infraestructura.

---

## 1. Arquitectura: Multi-Terminal con tmux

**Decisión: tmux (ya aprobado) — sin Docker, sin systemd por sesión.**

```
┌──────────────── Azure VM (B2s_v2) ────────────────┐
│                                                     │
│  tmux server                                        │
│  ├── ss-flora          → copilot (Ralph, go)        │
│  ├── ss-ComeRosquillas → copilot (Ralph, go)        │
│  ├── ss-pixel-bounce   → copilot (Ralph, go)        │
│  ├── ss-ffs-squad-monitor → copilot (Ralph, go)     │
│  ├── ss-FirstFrameStudios → copilot (Ralph, go)     │
│  └── ss-hub            → watchdog/monitoring         │
│                                                     │
│  systemd                                            │
│  ├── ss-satellites.service  (auto-start on boot)    │
│  └── ss-watchdog.timer      (30min health checks)   │
└─────────────────────────────────────────────────────┘
```

**Por qué tmux y no Docker/systemd:**
- Ya tenemos `start-constellation.sh` y `session-watchdog.sh` diseñados para tmux
- Copilot CLI necesita PTY interactivo — tmux se lo da
- Docker añade overhead de memoria (~200MB/contenedor) que no podemos permitir
- systemd services no proveen PTY — Copilot no arranca sin terminal interactiva
- Simplicidad > complejidad. Si tmux funciona, no hay razón para más capas

**Lo que ya tenemos listo:**
- `scripts/azure/start-constellation.sh` — lanza 5 sesiones tmux
- `scripts/azure/session-watchdog.sh` — monitorización + reciclaje cada 6h
- `scripts/azure/satellites.service` — systemd auto-start
- `scripts/azure/session-watchdog.timer` — watchdog cada 30min

---

## 2. El Elefante en la Habitación: Rate Limits de Copilot

**⚠️ RIESGO CRÍTICO IDENTIFICADO**

Investigación revela que los rate limits de Copilot CLI son **por cuenta, no por sesión**:

| Factor | Valor | Impacto |
|--------|-------|---------|
| Completions/hora (Individual) | ~50-80 | Compartido entre TODAS las sesiones |
| 5 sesiones concurrentes | ~10-16 completions/hora cada una | Muy limitado |
| Context window | ~200K tokens | Compactación automática al 95% |
| Throttling | HTTP 429 | Copilot para temporalmente |

**Esto significa:** Si 5 sesiones trabajan activamente a la vez, cada una tiene **~10-16 turnos por hora**. Si una sesión consume mucho (e.g., Trinity haciendo un refactor grande), las otras se quedan sin cuota.

**Estrategias de mitigación:**
1. **Staggering temporal:** Las sesiones no deberían trabajar todas a la vez. Turno rotativo: solo 2-3 activas simultáneamente.
2. **Priorización:** Repos con issues críticos obtienen más cuota.
3. **Back-off inteligente:** Si una sesión recibe 429, esperar progresivamente (ya implementado en watchdog).
4. **Plan Copilot Business/Enterprise:** Si Individual no alcanza, evaluar upgrade (~$19→$39/user/mes). Esto es una decisión de coste.

**EXPERIMENTO NECESARIO:** Medir cuota real con 1 sesión activa durante 24h. Luego escalar.

---

## 3. Recursos del VM: ¿Puede con 5-6 sesiones?

### B2s_v2 — Specs Reales

| Recurso | Disponible | Por sesión (estimado) | 5 sesiones |
|---------|------------|----------------------|------------|
| vCPU | 2 (burst) | ~0.1-0.3 (idle) | ✅ OK |
| RAM | 8 GiB | ~300-500 MB | ~1.5-2.5 GB ✅ |
| RAM (tests) | 8 GiB | ~600-1000 MB (pico) | ⚠️ ~3-5 GB pico |
| Disco | 30 GB | ~2-4 GB (repo+deps) | ~10-20 GB ✅ |
| CPU credits | Burst model | Solo en picos | ⚠️ Monitorizar |

**Análisis:**
- **RAM idle:** 5 sesiones Copilot CLI (Node.js) ≈ 1.5-2.5 GB. Con OS + tmux ≈ 3-3.5 GB total. De 8 GB, queda margen.
- **RAM pico:** Si 2+ repos ejecutan `npm test` simultáneamente, el pico puede llegar a 5-6 GB. Manejable, pero apretado.
- **CPU:** Copilot CLI es mayormente I/O-bound (espera respuesta API). CPU idle es bajo. Pero `npm test` en paralelo puede agotar CPU credits rápidamente.
- **Disco:** 30 GB para 5 repos + node_modules cada uno. Ajustado si los repos son grandes. Monitorizar.

**Mitigación:**
- `npm ci --prefer-offline` para reducir I/O de red
- Tests no deberían ejecutarse en la VM — eso lo hace CI/CD en GitHub Actions
- Swap de 2GB como red de seguridad (el watchdog ya monitoriza memoria >90%)

### Precio Real

| Opción | Precio/mes | RAM |
|--------|-----------|-----|
| B2s_v2 (on-demand) | ~€36 | 8 GiB |
| B2s_v2 (reserved 1yr) | ~€22-25 | 8 GiB |
| B2s (original) | ~€28 | 4 GiB ⚠️ |

**Recomendación:** B2s_v2 on-demand para R&D (~€36/mes). Si funciona → reserved instance (€22-25/mes). El B2s original (4GB) es insuficiente para 5 sesiones.

---

## 4. Ciclo de Vida de Sesiones

### Arranque (ya diseñado)
```
VM boot → systemd satellites.service
        → start-constellation.sh
        → 5x tmux new-session → copilot → "Ralph, go"
```

### Operación Normal
```
Ralph detecta issue → Squad trabaja → PR → CI valida → merge
Ralph detecta board limpio → "Define next roadmap" issue
```

### Reciclaje (cada 6h — ya diseñado en watchdog)
```
watchdog detecta session >6h de edad
→ Verifica si hay trabajo en progreso (¿cómo?)
→ Kill tmux session
→ Recrear: tmux new-session → copilot → "Ralph, go"
→ Reset failure counter
```

**⚠️ PROBLEMA ABIERTO: Reciclaje graceful.** El watchdog actual mata sesiones por edad, pero ¿qué pasa si Copilot está a mitad de una tarea? Podría dejar:
- PRs a medio hacer
- Issues en estado inconsistente
- Archivos con cambios sin commit

**Propuesta:** Antes de reciclar, inyectar un mensaje de "cierre graceful":
```bash
tmux send-keys -t "$session" "Finish what you're doing. Save state. Exit." Enter
sleep 120  # 2 minutos de gracia
# Si sigue viva, kill
```

Esto es R&D — hay que ver si Copilot respeta la instrucción de cierre.

---

## 5. Orquestación y Estado

**Decisión: Sesiones independientes, zero estado compartido.**

Cada repo tiene su propio:
- `.squad/` directory (si usa Squad)
- Issues de GitHub (fuente de verdad)
- CI/CD pipeline
- Rate limit compartido (pero prioridad independiente)

**No necesitan coordinarse entre sí.** El hub (SS) observa via:
- `gh issue list -R jperezdelreal/<repo>` — estado del board
- `gh pr list -R jperezdelreal/<repo>` — PRs en vuelo
- Métricas (velocity, throughput) — ya implementadas

**Esto es clave:** Multi-squad ≠ multi-agent coordination en el mismo repo. Son squads completamente independientes trabajando en repos diferentes. La complejidad es de INFRAESTRUCTURA, no de coordinación.

---

## 6. GitHub API Rate Limits (separado de Copilot)

| Recurso | Límite | 5 sesiones |
|---------|--------|-----------|
| REST API (PAT) | 5,000 req/h | ~1,000/sesión ✅ OK |
| GraphQL API | 5,000 puntos/h | Compartido ⚠️ |
| Git clones | Sin límite duro | ✅ OK |
| GitHub Actions | Por repo (2,000 min/mes free) | ✅ OK |

**El PAT es compartido** entre todas las sesiones. 5,000 req/h para 5 sesiones = 1,000 per sesión. Para desarrollo normal (git push, gh issue create, gh pr create) esto es SOBRADO.

---

## 7. Seguridad: Gestión de Tokens

**Diseño actual (cloud-init):**
```
GH_TOKEN → /etc/profile.d/github-token.sh → todas las sesiones
```

**Evaluación:**
- ✅ Un solo PAT con scope `repo, workflow, read:org` es suficiente
- ✅ Managed identity para recursos Azure (no tokens para Azure)
- ⚠️ PAT expiration: tokens clásicos no expiran, fine-grained sí. Usar clásico para R&D.
- ⚠️ Rotación: Planificar rotación mensual manual (R&D) → automatizar después
- 🔴 NO almacenar el token en el repo. Solo en cloud-init/VM environment.

**Mejora futura:** GitHub App en lugar de PAT → rate limits más altos (5,000 → 15,000/h), tokens que se auto-renuevan, granularidad per-repo.

---

## 8. Monitorización: ¿Cómo sabe joperezd qué pasa?

### Nivel 1: Ya existe
- `ralph-watch.ps1` desde el PC — polling cada 10 min de issues/PRs
- `session-watchdog.sh` — logs JSON en `/var/log/ss-watchdog.jsonl`
- GitHub Actions notifications — PRs, CI failures

### Nivel 2: Propuesto para R&D
- **Dashboard SSH rápido:** `ssh ssadmin@<ip> 'tmux list-sessions && free -h && uptime'`
- **Watchdog summary endpoint:** El watchdog escribe un `status.json` que se puede consultar
- **GitHub Issue de estado:** Ralph (o el watchdog) actualiza un "issue pin" con el estado de la constelación

### Nivel 3: Futuro (post-R&D)
- Azure Monitor alerts (CPU >80%, memoria >90%)
- Telegram/Discord bot con resumen diario
- Dashboard web en el landing site de SS

**Para R&D:** Nivel 1 + dashboard SSH es suficiente. No sobre-engineerear la monitorización antes de validar que las sesiones funcionan.

---

## 9. Modos de Fallo y Recovery

| Fallo | Detección | Recovery |
|-------|-----------|---------|
| Sesión Copilot muere | Watchdog (30min) | Auto-restart |
| Todas las sesiones mueren | Watchdog | Restart constellation |
| VM reboot | systemd satellites.service | Auto-start |
| GitHub down | Copilot falla → sesión idle | Retry en siguiente ciclo watchdog |
| PAT expira | `gh auth status` falla | ⚠️ Manual — alertar |
| Disco lleno | Watchdog (>90%) | Limpiar node_modules, logs |
| RAM agotada | OOM killer mata procesos | Watchdog reinicia sesiones muertas |
| Rate limit Copilot (429) | Sesión recibe error | Copilot hace back-off automático |
| Context window lleno | Copilot compacta (~95%) | Transparente — pero performance degrada |

**El peor escenario:** Rate limit + context exhaustion + memory pressure simultáneos. El watchdog recicla sesiones, pero si las 5 se reciclan a la vez, hay un "thundering herd" de 5 sesiones nuevas compitiendo por rate limit.

**Mitigación:** Stagger de arranque — cada sesión arranca con 5 minutos de separación (ya implementable en start-constellation.sh con `sleep 300`).

---

## 10. Plan de Rollout Incremental

### Fase R&D-1: "¿Funciona Copilot headless?" (Semana 1)

**Objetivo:** Validar la hipótesis fundamental.

**Acciones:**
1. Desplegar VM con Bicep (ya listo)
2. SSH → lanzar UNA sesión tmux con Copilot CLI
3. Ejecutar "Ralph, go" en UN repo (flora — el más simple)
4. Observar 48h:
   - ¿Se mantiene la sesión viva?
   - ¿Cuántas completions/hora consume?
   - ¿Cuánta RAM usa idle vs activo?
   - ¿El watchdog la recicla correctamente?
   - ¿Genera PRs reales?
5. Documentar hallazgos

**Criterio de éxito:** 1 sesión sobrevive 48h, genera ≥1 PR real, watchdog funciona.

**Coste:** ~€2.40 (48h × €0.05/h)

### Fase R&D-2: "¿Escala a 3?" (Semana 2)

**Prerequisito:** R&D-1 exitoso.

**Acciones:**
1. Añadir 2 sesiones más (ComeRosquillas, pixel-bounce)
2. Stagger de 5 min entre arranques
3. Observar 48h:
   - Rate limit: ¿las sesiones compiten?
   - RAM: ¿se mantiene bajo 6 GB?
   - CPU credits: ¿se agotan?
4. Documentar hallazgos

**Criterio de éxito:** 3 sesiones coexisten 48h sin rate limiting severo.

### Fase R&D-3: "Constelación completa" (Semana 3)

**Prerequisito:** R&D-2 exitoso.

**Acciones:**
1. 5 sesiones, watchdog activo, monitoring completo
2. Observar 24h con el template `test3-monitoring-template.md`
3. Medir: PRs/día, issues cerrados, rate limit hits, memory peaks
4. Decisión: GO/NO-GO para operación continua

**Criterio de éxito:** 5 sesiones operan 24h, ≥5 PRs generados, zero intervención manual.

### Fase R&D-4: "24/7 estable" (Semana 4)

**Prerequisito:** R&D-3 exitoso.

**Acciones:**
1. Operación continua 7 días
2. Test de resiliencia: matar sesiones manualmente, rebotar VM
3. Métricas finales
4. Decisión: Production o ajustes

---

## Presupuesto R&D

| Concepto | Coste | Notas |
|----------|-------|-------|
| VM B2s_v2 (1 mes R&D) | ~€36 | On-demand |
| Disco 30GB P6 | ~€4 | Premium SSD |
| Egress | ~€1-2 | Mínimo git traffic |
| IP pública | ~€3 | Static |
| **Total R&D/mes** | **~€44** | Bien dentro de €500 budget |

Si funciona → Reserved Instance: **~€26-29/mes** total.

---

## Incógnitas Clave (Lo que NO sabemos)

1. **¿Copilot CLI se mantiene estable >6h en tmux?** — Nunca probado en producción
2. **¿El rate limit per-account permite 5 sesiones productivas?** — Teoría dice que es apretado
3. **¿La compactación de contexto degrada la calidad de las respuestas?** — Se sabe que sí, pero ¿cuánto?
4. **¿`gh auth` funciona con token environment variable headless?** — Debería, pero hay que validar
5. **¿Copilot CLI respeta instrucciones de cierre graceful?** — R&D puro
6. **¿Los CPU burst credits del B2s_v2 aguantan 24/7?** — Burst ≠ sustained
7. **¿Qué pasa con repos que no tienen .squad/ ni Squad config?** — ¿Copilot CLI funciona igualmente?

---

## Recomendación

**Go con R&D-1 esta semana.** Coste mínimo (~€2.40), riesgo bajo, máximo aprendizaje. Si falla, sabemos exactamente POR QUÉ antes de invertir más. Si funciona, escalamos progresivamente.

El mayor riesgo es el rate limit de Copilot por cuenta. Si resulta insuficiente para 5 sesiones, las opciones son:
1. Reducir a 2-3 sesiones (suficiente para empezar)
2. Upgrade a Copilot Business ($39/mes) si da más cuota
3. Stagger temporal agresivo (solo 1 sesión activa a la vez, rotando)

**Esto es R&D.** No necesitamos la respuesta perfecta — necesitamos DATOS.

---

**Firma:** Morpheus — Lead/Architect  
**Next action:** Founder aprueba → Tank despliega VM → R&D-1 empieza
