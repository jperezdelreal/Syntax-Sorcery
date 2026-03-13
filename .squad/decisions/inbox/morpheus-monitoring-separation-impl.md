# Decisión: Separación Concreta de Monitorización — 3 Capas

**Autor:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Fecha:** 2026-03-18  
**Estado:** ✅ ANÁLISIS COMPLETO — PENDIENTE EJECUCIÓN

---

## Contexto

El usuario aprobó la jerarquía de monitorización:
1. SS se auto-monitoriza
2. SS monitoriza repos DOWNSTREAM
3. Squad Monitor solo monitoriza JUEGOS FFS (flora, ComeRosquillas, pixel-bounce) — NO SS

Se investigó el estado actual de todos los ficheros involucrados.

---

## Estado Actual Encontrado

### SS — `.squad/constellation.json`
```json
{
  "repos": [
    "jperezdelreal/Syntax-Sorcery",      // ← SS mismo
    "jperezdelreal/FirstFrameStudios",
    "jperezdelreal/flora",
    "jperezdelreal/ComeRosquillas",
    "jperezdelreal/pixel-bounce",
    "jperezdelreal/ffs-squad-monitor"
  ]
}
```
**Usado por:** safety-net.yml (GitHub Actions diario) + ralph-watch.ps1 (PC local, 10min polling)

### SS — `.github/workflows/safety-net.yml`
- Cron diario 00:00 UTC, lee constellation.json
- 4 checks: inactividad >72h, build fallo >3 runs, roadmap stuck >7d, issue sin PR >5d
- Crea escalation issues + commits ficheros `.squad/escalations/`
- Monitoriza TODOS los repos en constellation.json (incluido SS mismo) ✅

### SS — `scripts/ralph-watch.ps1`
- Lee constellation.json, polling cada 10min
- Busca issues "Define next roadmap" en TODOS los repos (incluido SS) ✅

### ffs-squad-monitor — `server/config.js` (REPOS array)
```js
const REPOS = [
  { id: 'FirstFrameStudios', github: 'jperezdelreal/FirstFrameStudios' },
  { id: 'ComeRosquillas',    github: 'jperezdelreal/ComeRosquillas' },
  { id: 'flora',             github: 'jperezdelreal/flora' },
  { id: 'ffs-squad-monitor', github: 'jperezdelreal/ffs-squad-monitor' },
];
```
**Problema 1:** ❌ FALTA pixel-bounce  
**Problema 2:** ⚠️ Incluye FirstFrameStudios (hub, no juego) y a sí mismo  
**Correcto:** ✅ NO incluye Syntax-Sorcery

### ffs-squad-monitor — `vite.config.js` (REPOS array duplicado)
Mismo contenido que server/config.js — 4 repos, falta pixel-bounce.

### ffs-squad-monitor — Workflows
- squad-heartbeat.yml: Solo monitoriza su PROPIO repo (context.repo) — NO cross-repo ✅
- sync-squad-labels.yml: Solo su propio repo ✅
- No hay referencias a Syntax-Sorcery ✅

---

## Plan de Cambios Concretos

### CAPA 1: SS se auto-monitoriza

| Nº | Acción | Repo | Fichero | Cambio |
|----|--------|------|---------|--------|
| — | NINGUNO | — | — | safety-net.yml ya lee constellation.json que incluye SS. Funciona correcto. |

**Mecanismo:** `safety-net.yml` (GitHub Actions, cron diario 00:00 UTC)  
**Señales:** Inactividad >72h, builds rotos, roadmap stuck, issues sin PR  
**NO monitoriza:** Nada externo a SS (solo su propia entrada en constellation)

### CAPA 2: SS monitoriza DOWNSTREAM

| Nº | Acción | Repo | Fichero | Cambio |
|----|--------|------|---------|--------|
| — | NINGUNO | — | — | constellation.json ya incluye los 5 repos downstream + SS. ralph-watch.ps1 y safety-net.yml cubren todo. |

**Mecanismo:** `safety-net.yml` + `ralph-watch.ps1`  
**Señales (safety-net):** Mismas 4 verificaciones para cada repo downstream  
**Señales (ralph-watch):** Issues "Define next roadmap" → refueling autónomo  
**NO monitoriza:** Nada — cubre toda la constelación

### CAPA 3: Squad Monitor solo juegos FFS

| Nº | Acción | Repo | Fichero | Cambio Exacto |
|----|--------|------|---------|---------------|
| 1 | **AÑADIR** pixel-bounce | ffs-squad-monitor | `server/config.js` | Añadir entrada al array `REPOS`: `{ id: 'pixel-bounce', emoji: '🎮', label: 'Pixel Bounce', github: 'jperezdelreal/pixel-bounce', dir: path.resolve(__dirname, '..', '..', 'pixel-bounce') }` |
| 2 | **AÑADIR** pixel-bounce | ffs-squad-monitor | `vite.config.js` | Añadir misma entrada al array `REPOS` del frontend |
| 3 | **DECISIÓN** FirstFrameStudios | ffs-squad-monitor | `server/config.js` + `vite.config.js` | ⚠️ Usuario dijo "solo juegos FFS" — FirstFrameStudios es el HUB, no un juego. ¿Quitar? Ver nota abajo. |
| 4 | **DECISIÓN** ffs-squad-monitor self | ffs-squad-monitor | `server/config.js` + `vite.config.js` | ⚠️ Squad Monitor se monitoriza a sí mismo — ¿quitar su auto-referencia del REPOS? Ver nota abajo. |

**Mecanismo:** App Vite + Express (ffs-squad-monitor repo)  
**Dónde corre:** PC local / futuro Azure VM  
**Señales:** Issues abiertos/cerrados, PRs mergeados, actividad de agentes Squad  
**NO monitoriza:** Syntax-Sorcery (confirmado ausente ✅)

---

## Puntos de Decisión del Usuario

### Decisión A: ¿FirstFrameStudios en Squad Monitor?
- **Directiva del usuario:** "Squad Monitor solo monitoriza FFS GAMES (flora, ComeRosquillas, pixel-bounce)"
- **Estado actual:** FirstFrameStudios está en REPOS de Squad Monitor
- **Recomendación Morpheus:** QUITAR. Es el hub, no un juego. SS ya lo monitoriza via safety-net + ralph-watch.
- **Alternativa:** MANTENER si el usuario quiere ver el hub en el dashboard del Squad Monitor.

### Decisión B: ¿ffs-squad-monitor se monitoriza a sí mismo?
- **Estado actual:** ffs-squad-monitor está en su propio REPOS
- **Recomendación Morpheus:** QUITAR. SS ya lo monitoriza via constellation.json. Auto-referencia circular sin valor añadido.
- **Alternativa:** MANTENER para que el dashboard muestre sus propios issues/PRs.

---

## Resumen: Qué Cambia y Qué No

| Componente | Estado Actual | ¿Cambia? | Acción |
|------------|---------------|----------|--------|
| SS `constellation.json` | 6 repos (incluye SS) | ❌ No | Correcto para Capas 1+2 |
| SS `safety-net.yml` | Monitoriza 6 repos | ❌ No | Correcto para Capas 1+2 |
| SS `ralph-watch.ps1` | Monitoriza 6 repos | ❌ No | Correcto para Capa 2 |
| Monitor `server/config.js` REPOS | 4 repos (sin pixel-bounce) | ✅ Sí | Añadir pixel-bounce, posiblemente quitar hub+self |
| Monitor `vite.config.js` REPOS | 4 repos (sin pixel-bounce) | ✅ Sí | Sincronizar con server/config.js |
| Monitor workflows | Solo self-repo | ❌ No | Correcto |

---

## Snippet de Código — Cambio en server/config.js

```js
// DESPUÉS (solo juegos FFS):
export const REPOS = [
  { id: 'flora',         emoji: '🌿', label: 'Flora',          github: 'jperezdelreal/flora',          dir: path.resolve(__dirname, '..', '..', 'flora') },
  { id: 'ComeRosquillas', emoji: '🍩', label: 'ComeRosquillas', github: 'jperezdelreal/ComeRosquillas', dir: path.resolve(__dirname, '..', '..', 'ComeRosquillas') },
  { id: 'pixel-bounce',   emoji: '🎮', label: 'Pixel Bounce',   github: 'jperezdelreal/pixel-bounce',   dir: path.resolve(__dirname, '..', '..', 'pixel-bounce') },
];
```

## Snippet de Código — Cambio en vite.config.js

```js
// DESPUÉS (solo juegos FFS):
const REPOS = [
  { id: 'flora',         emoji: '🌿', label: 'Flora',          github: 'jperezdelreal/flora',          dir: path.resolve(__dirname, '..', 'flora') },
  { id: 'ComeRosquillas', emoji: '🍩', label: 'ComeRosquillas', github: 'jperezdelreal/ComeRosquillas', dir: path.resolve(__dirname, '..', 'ComeRosquillas') },
  { id: 'pixel-bounce',   emoji: '🎮', label: 'Pixel Bounce',   github: 'jperezdelreal/pixel-bounce',   dir: path.resolve(__dirname, '..', 'pixel-bounce') },
];
```

**Nota:** Si usuario decide mantener FirstFrameStudios y/o self-monitoring, añadir esas entradas al array. El cambio MÍNIMO obligatorio es añadir pixel-bounce.

---

## Siguiente Paso

1. Usuario confirma Decisiones A y B
2. Se ejecutan los cambios en ffs-squad-monitor (PR o commit directo)
3. No hay cambios en SS — todo correcto
