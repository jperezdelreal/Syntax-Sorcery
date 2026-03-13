# Guía de Activación — Motor Perpetuo Autónomo

**Preparado por:** Morpheus (Lead/Architect)  
**Fecha:** 2026-03-17  
**Versión:** 1.0  
**Propósito:** Encender el sistema de autonomía completo de Syntax Sorcery (Fase 2)

---

## 🎯 Resumen Ejecutivo

Esta guía te lleva paso a paso desde código local → GitHub → motor autónomo funcionando 24/7 con <15min/semana de intervención humana.

**Los 3 bloques de trabajo:**
1. **Pre-requisitos** (Tank está terminando 3 gaps) → Git limpio, constellation.json correcto, workflows listos
2. **Push a GitHub** (manual, tú decides cuándo) → 6 repos con todo el código
3. **Activación** (manual, una sola vez) → Encender el interruptor, verificar que funciona

**Arquitectura — 3 Capas:**
- **Layer 1 (Cloud):** perpetual-motion.yml ejecuta roadmaps automáticamente (€0, GitHub Actions)
- **Layer 2 (Watch):** ralph-watch.ps1 recarga roadmaps cuando se agotan (local background)
- **Layer 3 (Manual):** Ralph (tú) sólo para casos extremos (<15min/semana)

**Tiempo estimado:** 1-2 horas para push + activación completa

---

## 📋 PARTE 1: Pre-Requisitos (lo que Tank está arreglando)

Tank está completando estos 3 gaps antes de que puedas hacer push:

### Gap 1: Git Limpio en Todos los Repos ✅

**Estado:** Tank verificando que no hay cambios sin commit en los 6 repos.

**Cómo verificar tú mismo:**
```powershell
# En cada repo (SS, FFS, flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor):
cd "C:\ruta\al\repo"
git status
```

**Output esperado:**
```
On branch main
nothing to commit, working tree clean
```

**Si ves cambios:** Commitea antes de push.

---

### Gap 2: constellation.json con Owners Correctos ✅

**Estado:** Tank actualizando el owner de "jperezdelreal" → "joperezd" en constellation.json

**Archivo:** `.squad/constellation.json` (en Syntax Sorcery)

**Contenido esperado:**
```json
{
  "repos": [
    "joperezd/Syntax-Sorcery",
    "joperezd/FirstFrameStudios",
    "joperezd/flora",
    "joperezd/ComeRosquillas",
    "joperezd/ffs-squad-monitor"
  ],
  "metadata": {
    "description": "Repository constellation monitored by safety-net workflow",
    "updated": "2026-03-17",
    "owner": "joperezd"
  }
}
```

**Por qué importa:** ralph-watch.ps1 y safety-net.yml usan esto para saber qué repos monitorear.

---

### Gap 3: Workflows Desplegados en Todos los Repos ✅

**Estado:** Tank creando estos workflows (aún no existen):

**Archivos que deben existir:**

1. **perpetual-motion.yml** (en los 6 repos)
   - Ruta: `.github/workflows/perpetual-motion.yml`
   - Trigger: `on: issues: types: [closed]`
   - Acción: Lee roadmap.md → crea siguiente issue → asigna @copilot
   - Si roadmap vacío: crea issue "📋 Define next roadmap"

2. **safety-net.yml** (en Syntax Sorcery)
   - Ruta: `.github/workflows/safety-net.yml`
   - Trigger: Cron diario 00:00 UTC
   - Acción: Detecta repos atascados >72h → escala a .squad/escalations/

3. **Issue template** (en los 6 repos)
   - Ruta: `.github/ISSUE_TEMPLATE/copilot-ready.md`
   - Estructura: 🎯 Objetivo, ✅ Acceptance Criteria, 📁 Files Involved, 🔍 Context Hints

**Cómo verificar:**
```powershell
# Verifica que existen los workflows
Get-ChildItem -Path ".\.github\workflows\" -Filter "perpetual-motion.yml" -Recurse
Get-ChildItem -Path ".\.github\workflows\" -Filter "safety-net.yml" -Recurse
```

**Si faltan:** Tank debe crearlos antes del push.

---

## 🚀 PARTE 2: Push a GitHub (Manual — Tú decides cuándo)

Una vez que Tank confirme "Pre-requisitos ✅", haz push de los 6 repos.

### Orden de Push

**NO importa el orden** — puedes hacer push de todos en paralelo. Los workflows no se activan hasta que crees el primer issue manualmente.

### Comandos de Push

```powershell
# Repo 1: Syntax Sorcery (hub, orquestador)
cd "C:\Users\joperezd\GitHub Repos\Syntax Sorcery"
git push origin main

# Repo 2: FirstFrameStudios (hub de juegos)
cd "C:\Users\joperezd\GitHub Repos\FirstFrameStudios"
git push origin main

# Repo 3: flora (juego satélite)
cd "C:\Users\joperezd\GitHub Repos\flora"
git push origin main

# Repo 4: ComeRosquillas (juego satélite)
cd "C:\Users\joperezd\GitHub Repos\ComeRosquillas"
git push origin main

# Repo 5: ffs-squad-monitor (dashboard)
cd "C:\Users\joperezd\GitHub Repos\ffs-squad-monitor"
git push origin main

# Repo 6: pixel-bounce (si existe, opcional)
cd "C:\Users\joperezd\GitHub Repos\pixel-bounce"
git push origin main
```

### Verificar Push Exitoso

```powershell
# En cada repo después del push:
git status
# Esperado: "Your branch is up to date with 'origin/main'"
```

**Si hay errores de push:**
- **Rejected (non-fast-forward):** Alguien más hizo push. Haz `git pull --rebase` y luego `git push`.
- **Authentication failed:** Configura tus credenciales de GitHub CLI: `gh auth login`

---

## 🌐 PARTE 3: Verificar GitHub Pages

Algunos repos necesitan GitHub Pages activado para que los juegos sean accesibles públicamente.

### Repos que Necesitan GitHub Pages

1. **FirstFrameStudios** (hub de juegos con iframes)
2. **flora** (juego jugable)
3. **ComeRosquillas** (juego jugable)
4. **ffs-squad-monitor** (dashboard en tiempo real)
5. **Syntax Sorcery** (página corporativa — opcional)

### Cómo Activar GitHub Pages (por repo)

**Paso 1:** Ve a GitHub.com → tu repo → **Settings** (⚙️)

**Paso 2:** Scroll hasta sección **"Pages"** (sidebar izquierdo)

**Paso 3:** Configura:
- **Source:** Deploy from a branch
- **Branch:** `main` (o `gh-pages` si existe)
- **Folder:** `/root` (o `/docs` según estructura del repo)

**Paso 4:** Click **Save**

**Paso 5:** Espera 1-2 minutos. Verás URL como:
```
https://joperezd.github.io/FirstFrameStudios/
```

### URLs Esperadas (después de activar)

| Repo | URL Esperada | Contenido |
|------|--------------|-----------|
| FirstFrameStudios | `https://joperezd.github.io/FirstFrameStudios/` | Hub con 3 juegos en iframes |
| flora | `https://joperezd.github.io/flora/` | Juego jugable directamente |
| ComeRosquillas | `https://joperezd.github.io/ComeRosquillas/` | Juego jugable directamente |
| ffs-squad-monitor | `https://joperezd.github.io/ffs-squad-monitor/` | Dashboard en tiempo real |
| Syntax Sorcery | `https://joperezd.github.io/Syntax-Sorcery/` | Página corporativa (opcional) |

**Prueba:** Abre cada URL en navegador. Debe cargar sin error 404.

---

## ✅ PARTE 4: Verificar Workflows Activos

GitHub debe ejecutar los workflows automáticamente. Verifica que están habilitados.

### Cómo Verificar

**Paso 1:** Ve a GitHub.com → tu repo → tab **"Actions"**

**Paso 2:** Verifica que ves workflows listados:
- `perpetual-motion.yml` (en los 6 repos)
- `safety-net.yml` (en Syntax Sorcery)

**Paso 3:** Si NO aparecen:
- Click **"I understand my workflows, go ahead and enable them"** (botón verde)

### Expected Workflows por Repo

| Repo | Workflows Esperados |
|------|---------------------|
| Syntax Sorcery | `perpetual-motion.yml`, `safety-net.yml` |
| FirstFrameStudios | `perpetual-motion.yml`, `deploy-pages.yml` (si existe) |
| flora | `perpetual-motion.yml` |
| ComeRosquillas | `perpetual-motion.yml` |
| pixel-bounce | `perpetual-motion.yml` |
| ffs-squad-monitor | `perpetual-motion.yml` |

### Trigger Manual de Prueba (Opcional)

Para probar que un workflow funciona SIN cerrar un issue:

```powershell
# Desde PowerShell, con GitHub CLI
gh workflow run perpetual-motion.yml --repo joperezd/flora
```

**Output esperado:**
```
✓ Created workflow_run
```

**Verificar ejecución:**
```powershell
gh run list --repo joperezd/flora --limit 1
```

---

## 🔥 PARTE 5: Smoke Test — Encender el Motor (Prueba en 1 Repo)

**Repo recomendado:** `flora` (el más simple, menos dependencias)

Este es el momento en que enciendes el motor perpetuo por primera vez.

### Paso 1: Verifica que flora Tiene Roadmap

```powershell
cd "C:\Users\joperezd\GitHub Repos\flora"
cat roadmap.md
```

**Esperado:** Debes ver una lista ordenada con items marcados como `- [ ]` (sin completar):

```markdown
# Roadmap

1. [ ] Add power-up system
   - Acceptance Criteria: ...
   - Files: src/powerups.js
   
2. [ ] Implement level progression
   - Acceptance Criteria: ...
   - Files: src/levels.js
```

**Si NO existe roadmap.md:**
- Crea uno manualmente con al menos 1 item
- Commit y push: `git add roadmap.md && git commit -m "Add roadmap" && git push`

---

### Paso 2: Crea el Primer Issue Manualmente

Ve a GitHub.com → flora → **Issues** → **New Issue**

**Opción A: Usar template "copilot-ready"**
- Si Tank ya desplegó el template, selecciónalo
- Rellena las secciones según el primer item del roadmap

**Opción B: Issue manual (si no hay template)**

**Título:**
```
Add power-up system
```

**Body:**
```markdown
## 🎯 Objective
Implement collectible power-ups that enhance player abilities temporarily.

## ✅ Acceptance Criteria
- [ ] Power-ups spawn randomly on map every 10 seconds
- [ ] Player collects power-up on collision
- [ ] Power-up effects last 5 seconds (speed boost, invincibility, etc.)
- [ ] Visual feedback shows active power-up (icon + timer)

## 📁 Files Involved
- `src/powerups.js` — power-up logic and spawning
- `src/player.js` — collision detection with power-ups
- `src/ui.js` — display active power-up timer

## 🔍 Context Hints
- Follow existing collision pattern in src/player.js (lines 45-60)
- Use existing timer utility in src/utils.js
```

**Labels:** Añade `copilot-ready`, `pipeline:implementation`

**Assignee:** Selecciona **@copilot** (GitHub Copilot)

**Click:** "Submit new issue"

---

### Paso 3: @copilot Debe Auto-Asignarse (si no estaba asignado)

**Esperado:** Si el workflow de auto-assignment está activo:
- Issue aparece con @copilot asignado automáticamente
- @copilot comenta en el issue: "I'll work on this"
- En ~1-5 minutos, @copilot abre un PR

**Si NO se asigna:**
- Asigna manualmente a @copilot desde la interfaz de GitHub
- @copilot debe responder igualmente

---

### Paso 4: Cierra el Issue (simula que @copilot terminó)

**IMPORTANTE:** Este paso simula el ciclo completo. En producción, @copilot cierra el issue al mergear su PR.

**Manual closure (para prueba):**
- Ve al issue → Click "Close issue" (botón abajo)

**Comando CLI:**
```powershell
gh issue close 1 --repo joperezd/flora --comment "Test: Simulating completion"
```

---

### Paso 5: Verifica que Se Crea el Siguiente Issue (30 segundos)

**Esperado:**
1. El workflow `perpetual-motion.yml` se activa al cerrar el issue
2. Lee `roadmap.md` → encuentra el siguiente item sin marcar
3. Crea automáticamente un nuevo issue con ese contenido
4. Asigna a @copilot
5. TODO en ~30 segundos

**Cómo verificar:**

```powershell
# Lista issues del repo (debe aparecer 1 nuevo)
gh issue list --repo joperezd/flora
```

**Output esperado:**
```
#2  Implement level progression  copilot-ready  about 1 minute ago
```

**Si NO se crea el nuevo issue:**
- Ve a GitHub.com → flora → **Actions** → verifica que `perpetual-motion.yml` corrió
- Si hay error: lee los logs del workflow para diagnosticar

---

### Paso 6: Verifica Roadmap Actualizado

```powershell
# Fetch cambios del workflow (perpetual-motion marca items completados)
git pull origin main

# Lee roadmap.md
cat roadmap.md
```

**Esperado:** El primer item debe estar marcado `- [x]`:

```markdown
1. [x] Add power-up system
   - (completado)
   
2. [ ] Implement level progression
   - (siguiente)
```

**Si el roadmap NO se actualizó:**
- El workflow puede no tener permisos de escritura
- Ve a Settings → Actions → General → "Workflow permissions" → selecciona "Read and write permissions"

---

### Paso 7: Deja que @copilot Trabaje el Nuevo Issue

**NO cierres este segundo issue todavía.** Deja que @copilot trabaje realmente:

1. @copilot lee el issue
2. @copilot analiza el código del repo
3. @copilot crea un PR con cambios
4. Tú revisas el PR (opcional, o auto-merge si confías)
5. PR se mergea → issue se cierra automáticamente
6. Ciclo se repite → siguiente issue creado

**Esto es el motor perpetuo funcionando.**

---

### 🔴 Troubleshooting: Si Algo No Funciona

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Nuevo issue NO se crea | Workflow no ejecutó | Ve a Actions → verifica logs de `perpetual-motion.yml` |
| Workflow falla con "permission denied" | Sin permisos de escritura | Settings → Actions → Workflow permissions → "Read and write" |
| @copilot NO responde al issue | No tiene acceso al repo | Ve a Settings → Integrations → GitHub Copilot → habilita |
| Roadmap NO se actualiza | Workflow no commitea cambios | Verifica que workflow tiene permiso para push |
| Issue creado pero sin contenido | Formato del roadmap.md incorrecto | Verifica que roadmap.md sigue formato esperado (lista numerada con `- [ ]`) |

---

## ⚙️ PARTE 6: Arrancar ralph-watch.ps1 (Layer 2 — Refueling)

ralph-watch.ps1 es el motor que RECARGA los roadmaps cuando se agotan. Layer 1 crea issues, Layer 2 recarga fuel.

### Qué Hace ralph-watch.ps1

1. **Polling cada 10 minutos:** Consulta los 6 repos
2. **Detecta issue "📋 Define next roadmap":** Creado por perpetual-motion cuando roadmap.md está vacío
3. **Abre Squad CLI session:** Invoca al Lead del repo (Morpheus, Trinity, Oracle)
4. **Lead define nuevo roadmap:** Via Squad AI
5. **Commitea y cierra issue:** Automático
6. **Ciclo continúa:** Motor perpetuo sigue funcionando

**Sin ralph-watch.ps1:** El motor se detiene cuando roadmap.md se agota. CON ralph-watch.ps1: motor funciona 24/7 sin intervención.

---

### Comando para Arrancar ralph-watch.ps1

**IMPORTANTE:** Arranca ralph-watch.ps1 en una **terminal PowerShell SEPARADA** que permanezca abierta.

```powershell
# Abre nueva ventana PowerShell
cd "C:\Users\joperezd\GitHub Repos\Syntax Sorcery"

# Ejecuta ralph-watch en background
.\scripts\ralph-watch.ps1
```

**Output esperado (primeros segundos):**
```
[INFO] Ralph-Watch starting...
[INFO] Created log directory: C:\Users\joperezd\GitHub Repos\Syntax Sorcery\.squad\ralph-watch
[INFO] Loaded constellation: 5 repos
[INFO] Polling interval: 10 minutes
[INFO] Session timeout: 30 minutes
[INFO] Starting monitoring loop...
[INFO] Round 1 starting...
[INFO] Checking joperezd/Syntax-Sorcery...
[INFO] No refueling needed (no 'Define next roadmap' issues)
[INFO] Checking joperezd/FirstFrameStudios...
[INFO] No refueling needed
...
[INFO] Round 1 complete. Sleeping 10 minutes...
```

---

### Parámetros Opcionales

**Cambiar intervalo de polling:**
```powershell
.\scripts\ralph-watch.ps1 -PollIntervalMinutes 5
```

**Modo dry-run (prueba sin acciones reales):**
```powershell
.\scripts\ralph-watch.ps1 -DryRun
```

**Timeout de sesión personalizado:**
```powershell
.\scripts\ralph-watch.ps1 -SessionTimeoutMinutes 45
```

---

### Qué Loguea ralph-watch.ps1

**Ubicación de logs:**
```
C:\Users\joperezd\GitHub Repos\Syntax Sorcery\.squad\ralph-watch\YYYY-MM-DD.log
```

**Tipos de logs:**
- `[INFO]` — Operaciones normales (polling, detección)
- `[SUCCESS]` — Refueling exitoso (roadmap recargado)
- `[WARN]` — Problemas menores (timeout de sesión, repo sin acceso)
- `[ERROR]` — Errores críticos (falló refueling, issues de escalación creados)

**Comando para ver logs en tiempo real:**
```powershell
Get-Content -Path ".\.squad\ralph-watch\$(Get-Date -Format 'yyyy-MM-dd').log" -Wait
```

---

### Cómo Saber que ralph-watch.ps1 Está Funcionando

**Señal 1:** Logs muestran rounds completándose cada 10 minutos

**Señal 2:** Si un roadmap se agota:
1. perpetual-motion.yml crea issue "📋 Define next roadmap"
2. En <10 minutos, ralph-watch lo detecta → log muestra `[INFO] Detected refueling issue in repo X`
3. Squad session se abre → Lead define roadmap → log muestra `[SUCCESS] Refueled repo X`
4. Issue se cierra automáticamente

**Señal 3:** Verifica proceso corriendo:
```powershell
Get-Process -Name powershell | Where-Object { $_.MainWindowTitle -like "*ralph-watch*" }
```

---

### Cómo Detener ralph-watch.ps1

**Opción 1:** Ctrl+C en la terminal donde corre

**Opción 2:** Mata el proceso:
```powershell
# Encuentra el PID
Get-Process -Name powershell | Where-Object { $_.Path -like "*ralph-watch*" }

# Mata por PID (reemplaza 12345 con PID real)
Stop-Process -Id 12345
```

---

## 🎯 PARTE 7: Verificar Todo el Sistema (Checklist Completo)

Una vez que todo está corriendo, verifica que las 3 capas están operacionales.

### Checklist — Layer 1 (Cloud / Perpetual Motion)

- [ ] **Workflows activos:** Ve a GitHub.com → Actions en cada repo → `perpetual-motion.yml` aparece
- [ ] **Roadmaps existen:** Todos los repos tienen `roadmap.md` con al menos 1 item
- [ ] **Issues auto-creados:** Cierra un issue → verifica que se crea uno nuevo en <1 minuto
- [ ] **@copilot asignado:** Nuevos issues tienen @copilot como assignee automáticamente
- [ ] **Roadmap actualizado:** Después de cerrar issue, `git pull` muestra item marcado `[x]`

### Checklist — Layer 2 (Watch / Refueling)

- [ ] **ralph-watch.ps1 corriendo:** Proceso activo en PowerShell, logs generándose cada 10min
- [ ] **Logs saludables:** Sin `[ERROR]` en última hora, solo `[INFO]` o `[SUCCESS]`
- [ ] **Refueling funciona:** Simula roadmap vacío → verifica que se crea "Define next roadmap" → ralph-watch lo detecta y recarga

### Checklist — Layer 3 (Manual / Ralph)

- [ ] **Intervención <15min/semana:** En condiciones normales, sólo revisas si ralph-watch escala algo
- [ ] **Escalaciones legibles:** Si algo falla >3 veces, ralph-watch crea issue en `.squad/escalations/` para ti

### Checklist — Visibilidad (URLs Públicas)

- [ ] **FFS Page live:** `https://joperezd.github.io/FirstFrameStudios/` carga, muestra juegos
- [ ] **Juegos jugables:** flora y ComeRosquillas cargan en iframes, sin CORS errors
- [ ] **Squad Monitor live:** `https://joperezd.github.io/ffs-squad-monitor/` muestra dashboard
- [ ] **SS Page live (opcional):** `https://joperezd.github.io/Syntax-Sorcery/` carga

---

### Comportamiento Esperado del Sistema Completo

**Ciclo normal (sin intervención humana):**

```
1. Issue cerrado (merge de PR de @copilot)
   ↓
2. perpetual-motion.yml detecta cierre (<30s)
   ↓
3. Lee roadmap.md → encuentra siguiente item
   ↓
4. Crea nuevo issue con contenido del item
   ↓
5. Asigna a @copilot automáticamente
   ↓
6. @copilot lee issue, analiza repo, crea PR
   ↓
7. PR se mergea → issue se cierra
   ↓
8. VUELVE AL PASO 1 (perpetuo)
```

**Si roadmap se agota:**

```
1. perpetual-motion.yml detecta roadmap vacío
   ↓
2. Crea issue "📋 Define next roadmap" asignado a Lead
   ↓
3. ralph-watch.ps1 detecta issue (<10 min)
   ↓
4. Abre Squad CLI session → Lead define nuevo roadmap
   ↓
5. Commitea roadmap.md y cierra issue
   ↓
6. perpetual-motion.yml continúa con nuevo roadmap
   ↓
7. VUELVE AL CICLO NORMAL (perpetuo)
```

**Intervención humana necesaria:**
- ❌ **NO** en ciclo normal (Issues → PR → Merge → Repeat)
- ❌ **NO** en refueling (ralph-watch maneja automáticamente)
- ✅ **SÍ** si ralph-watch escala problema persistente (>3 fallos consecutivos)
- ✅ **SÍ** si @copilot no puede resolver issue (PRs rechazados repetidamente)
- ✅ **SÍ** para decisiones T0 (nuevas empresas downstream, cambios arquitectura)

**Meta:** <15min/semana = sólo chequear escalaciones de ralph-watch, todo lo demás es autónomo.

---

## 🔧 PARTE 8: Troubleshooting (Problemas Comunes)

### Problema 1: Workflow perpetual-motion.yml No Ejecuta

**Síntomas:**
- Cierras issue → NO se crea nuevo issue
- En Actions → NO aparece ejecución de workflow

**Diagnóstico:**
```powershell
gh run list --repo joperezd/flora --workflow perpetual-motion.yml --limit 5
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| Workflow deshabilitado | Settings → Actions → "Enable workflows" |
| Trigger incorrecto | Verifica `.github/workflows/perpetual-motion.yml` tiene `on: issues: types: [closed]` |
| Sin permisos de escritura | Settings → Actions → Workflow permissions → "Read and write permissions" |
| Archivo no existe | Tank debe crear el workflow (Gap 3 pendiente) |

---

### Problema 2: Nuevo Issue Creado pero Vacío o Mal Formateado

**Síntomas:**
- Se crea issue pero sin descripción
- Issue tiene título genérico como "Untitled"

**Diagnóstico:**
```powershell
# Verifica formato del roadmap.md
cat roadmap.md
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| roadmap.md no sigue formato esperado | Debe ser lista numerada: `1. [ ] Título\n   - Acceptance Criteria: ...` |
| Parser del workflow no encuentra items | Verifica que items tienen `- [ ]` (checkbox sin marcar) |
| Item del roadmap sin detalles | Añade sección "Acceptance Criteria" y "Files" a cada item |

**Formato correcto de roadmap.md:**
```markdown
# Roadmap

1. [ ] Título claro del feature
   **Acceptance Criteria:**
   - [ ] Criterio testeable 1
   - [ ] Criterio testeable 2
   
   **Files:**
   - `src/file.js` — qué cambiar
   
   **Context:**
   - Patrón existente en src/otro.js líneas 10-20

2. [ ] Siguiente feature
   ...
```

---

### Problema 3: @copilot No Responde al Issue

**Síntomas:**
- Issue creado y asignado a @copilot
- Pasan >10 minutos, @copilot NO comenta ni abre PR

**Diagnóstico:**
```powershell
# Verifica que @copilot tiene acceso al repo
gh api repos/joperezd/flora/collaborators/copilot
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| @copilot sin acceso al repo | Settings → Integrations → GitHub Copilot → Enable for this repo |
| Issue sin label `copilot-ready` | Añade label manualmente: `gh issue edit 2 --add-label copilot-ready --repo joperezd/flora` |
| Issue mal formateado | Verifica que tiene secciones: Objective, Acceptance Criteria, Files Involved |
| @copilot sobrecargado (raro) | Espera 30min, si no responde → contacta GitHub Support |

---

### Problema 4: ralph-watch.ps1 No Detecta Issues de Refueling

**Síntomas:**
- perpetual-motion crea issue "📋 Define next roadmap"
- ralph-watch corre pero NO lo detecta (logs muestran "No refueling needed")

**Diagnóstico:**
```powershell
# Verifica que el issue existe y tiene título correcto
gh issue list --repo joperezd/flora --label "status:needs-roadmap"
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| Título del issue no coincide | ralph-watch busca "📋 Define next roadmap" exacto. Verifica título. |
| constellation.json desactualizado | Verifica que repo está en `.squad/constellation.json` |
| ralph-watch.ps1 no corriendo | Verifica proceso: `Get-Process powershell` |
| Polling aún no llegó (espera <10min) | Revisa logs: debe aparecer "Checking repo X..." |

---

### Problema 5: ralph-watch.ps1 Falla al Abrir Squad Session

**Síntomas:**
- Logs muestran `[ERROR] Failed to open Squad session for repo X`
- Issue de refueling sigue abierto

**Diagnóstico:**
```powershell
# Verifica que Squad CLI está instalado
copilot --version
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| Squad CLI no instalado | Instala: `npm install -g @github/copilot-cli` |
| Sin autenticación | `gh auth login` para configurar credenciales |
| Timeout (sesión >30min) | Revisa logs, debe escalar automáticamente después de 3 intentos |
| Lead no responde en sesión | ralph-watch crea issue de escalación en `.squad/escalations/` para ti |

---

### Problema 6: GitHub Pages No Carga (Error 404)

**Síntomas:**
- Vas a URL `https://joperezd.github.io/flora/`
- Ves "404 - Page not found"

**Diagnóstico:**
```powershell
gh api repos/joperezd/flora/pages
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| GitHub Pages no habilitado | Settings → Pages → Source: main branch → Save |
| Branch incorrecto seleccionado | Verifica que Source es "main" (no "gh-pages" si no existe) |
| Build de GitHub Pages falló | Ve a Actions → busca workflow "pages build and deployment" → revisa logs |
| Repo privado sin GitHub Pro | GitHub Pages en repos privados requiere GitHub Pro (upgradea o haz repo público) |

---

### Problema 7: Workflow Falla con "Rate Limit Exceeded"

**Síntomas:**
- perpetual-motion.yml falla con error "API rate limit exceeded for user..."

**Diagnóstico:**
```powershell
gh api rate_limit
```

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| Demasiadas ejecuciones en 1 hora | GitHub API limita a 5000 req/hora autenticado. Espera 1 hora o usa GITHUB_TOKEN. |
| Workflow sin autenticación | Añade `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` al workflow |
| Múltiples repos ejecutando simultáneamente | Añade rate limiting: `sleep 10` entre llamadas a GitHub API |

**Mitigación:** Tank debe añadir rate limiting en A1 (condición del audit).

---

### Problema 8: Todo Funciona pero <15min/Semana No Se Cumple

**Síntomas:**
- Motor perpetuo funciona
- Pero pasas >1 hora/semana interviniendo manualmente

**Diagnóstico:**
- ¿Qué tipo de intervenciones haces más frecuentemente?

**Causas + Soluciones:**

| Causa | Solución |
|-------|----------|
| @copilot PRs frecuentemente rechazados | Mejora calidad de issues (más contexto, ejemplos de código, acceptance criteria específicos) |
| Roadmaps convergen sin dirección | ralph-watch escala automáticamente después de 3 ciclos sin review (revisa escalaciones) |
| Issues mal definidos → @copilot confundido | Usa template `copilot-ready.md` con 5 secciones completas |
| Builds fallan frecuentemente | Añade pre-commit hooks, linters, tests que @copilot debe pasar |
| Demasiados repos evolucionando simultáneamente | Reduce a 2-3 repos activos, pausa los demás hasta estabilizar |

---

### Cómo Escalar Problemas Persistentes

**Si un problema persiste >3 intentos de solución:**

1. **Crea issue de escalación:**
   ```powershell
   gh issue create --repo joperezd/Syntax-Sorcery --title "Escalation: perpetual-motion no crea issues en flora" --body "Descripción del problema, logs relevantes, intentos de solución" --label "status:needs-attention"
   ```

2. **Consulta con Morpheus (tú):** Revisa `.squad/agents/morpheus/history.md` para patrones similares

3. **Consulta documentación:**
   - `.squad/guides/squad-watch-layer2.md` (Layer 2 troubleshooting)
   - `.squad/guides/writing-copilot-issues.md` (mejora issues para @copilot)

4. **Última opción:** Pausa ralph-watch.ps1 temporalmente, opera manualmente hasta diagnosticar

---

## ✅ Resumen Final — Sistema Operacional

**Una vez completados todos los pasos:**

✅ **Layer 1 (Cloud):** perpetual-motion.yml ejecutándose en los 6 repos, issues auto-creados en <1min  
✅ **Layer 2 (Watch):** ralph-watch.ps1 corriendo en background, recarga roadmaps automáticamente  
✅ **Layer 3 (Manual):** Tú sólo intervienes si ralph-watch escala algo (<15min/semana)

✅ **Visibilidad:** 3 URLs públicas (FFS Page, Squad Monitor, SS Page) mostrando progreso en tiempo real  
✅ **Costo:** €0 — todo en GitHub free tier, sin Azure

**Ciclo completo (sin tu intervención):**

1. Issue cerrado → nuevo issue creado (30s)
2. @copilot asignado → analiza → crea PR (5-15min)
3. PR mergeado → issue cerrado → siguiente issue creado
4. Roadmap agotado → ralph-watch recarga → ciclo continúa
5. **PERPETUO** — funciona 24/7

**Tu rol como Ralph (Layer 3):**
- Chequea logs de ralph-watch 1x/semana (5min)
- Revisa escalaciones en `.squad/escalations/` si las hay (5-10min)
- Toma decisiones T0 si el sistema propone algo grande (raro, <5min)
- **Total: <15min/semana**

---

## 📌 Próximos Pasos Después de Activación

**Semana 1-2: Observación**
- Deja que el sistema corra solo
- Monitorea logs de ralph-watch diariamente (sólo lectura, no intervengas)
- Anota patrones: ¿qué issues completa @copilot bien? ¿Cuáles necesitan re-trabajo?

**Semana 3-4: Optimización**
- Mejora formato de roadmap.md en base a patrones de éxito de @copilot
- Ajusta interval de ralph-watch si 10min es muy frecuente o lento
- Añade rate limiting si ves "rate limit exceeded" en logs

**Mes 2+: Expansión**
- Añade más features a roadmaps (si ves que @copilot las completa bien)
- Considera activar más repos (actualmente 5-6 activos)
- Comparte URLs públicas con amigos/inversores (muestra el sistema funcionando)

---

## 🎉 Conclusión

**Has construido un sistema autónomo de desarrollo de software.**

- **Layer 1** ejecuta trabajo (issues → PRs → deploys)
- **Layer 2** recarga combustible (roadmaps)
- **Layer 3** (tú) sólo supervisa casos extremos

**Esto es Syntax Sorcery — una empresa de software que opera 24/7 con <15min/semana de tu tiempo.**

**Pregunta final para confirmar activación exitosa:**

"¿Puedes cerrar un issue en flora, esperar 30 segundos, y ver un nuevo issue auto-creado?"

➡️ **SÍ** → Sistema activado ✅  
➡️ **NO** → Revisa PARTE 8 Troubleshooting

---

**Preparado por Morpheus**  
**Fecha:** 2026-03-17  
**Versión:** 1.0  
**Contacto:** @morpheus en GitHub Discussions
