# CHANGELOG — VIGÍA

> **TLDR:** Historial de versiones desde el MVP inicial (v0.1.0) hasta la release pública (v1.0.0).

Todos los cambios notables de este proyecto se documentan aquí.  
Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)

---

## [1.0.0] — 2026-07-15

### Added
- README.md completo con ASCII banner, todos los flags documentados, ejemplos, arquitectura, limitaciones del SDK y guía de contribución
- CHANGELOG.md (este archivo)
- `package.json` preparado para npm publish: `bin` entry, `files`, `keywords`, `engines`, `repository`, `license`

### Changed
- Versión bumpeada a `1.0.0` para marcar la release pública
- `private: true` eliminado — el paquete es ahora publicable

---

## [0.9.0] — 2026-07-14

### Added
- **Modo regresión** (`--regression <report.json>`): carga un informe anterior, re-testea las URLs que tuvieron issues, y clasifica cada uno como `resolved`, `persists` o `new`
- `lib/regression.js`: `loadBaselineReport`, `buildRegressionPlan`, `categorizeRegressionResults`, `generateRegressionReport`, `formatRegressionOutput`
- Informe de regresión guardado como `reports/vigia-regression-{timestamp}.json`
- El modo regresión abre una sesión SDK nueva por URL (aislamiento limpio de contexto)

### Fixed
- `vigia.js` refactorizado: las variables `regressionBaseline` movidas de `globalThis` a módulo-level para evitar contaminación de estado

---

## [0.8.0] — 2026-07-13

### Added
- **GitHub Action** compuesta en `.github/actions/vigia/action.yml`: instala dependencias, ejecuta VIGÍA, publica el informe como comentario en el PR, sube screenshots como artefactos (14 días), falla el check si hay issues críticos
- **Workflow `vigia-pr.yml`**: dispara VIGÍA automáticamente cuando se añade el label `vigia` a un PR; también dispatable manualmente desde Actions
- Outputs de la Action: `report`, `exit-code`, `issue-count`
- Soporte para `maxTurns` en la Action (configurable vía input `max-turns`)
- Generación automática de `vigia-ci.config.json` dentro de la Action para pasar `maxTurns` (no disponible como flag CLI directo)

---

## [0.7.0] — 2026-07-12

### Added
- **CLI profesional**: flags `--url`, `--visible`, `--config`, `--severity-threshold`, `--output-format`, `--quiet`, `--help`
- `lib/config.js`: `parseArgs`, `loadConfigFile`, `mergeConfig`, `filterBySeverity`, `getExitCode`, `printHelp` — zero SDK dependencies
- Soporte para archivo de configuración `vigia.config.json` (CLI gana sobre config file)
- `viewportPresets` configurables en el archivo de config
- Códigos de salida: `0` = limpio, `1` = issues críticos
- Modo quiet (`--quiet` / `-q`): suprime terminal, solo escribe informe
- Validación de `severityThreshold` y `outputFormat` con errores descriptivos

---

## [0.6.0] — 2026-07-11

### Added
- **Modo comparación** (`--compare <f1> <f2>`): diff estructurado entre dos informes JSON
- `lib/compare.js`: `loadReport`, `extractIssueMap`, `compareReports`, `formatComparisonOutput`
- Categorías de diff: `new`, `resolved`, `persistent`, `regressions` (issues que vuelven tras resolverse)
- Fingerprinting estable de issues: hash de `title|severity` para comparar entre ejecuciones
- JSON export paralelo al Markdown: `reports/vigia-data-{timestamp}.json` con `sessions[]` para comparación
- Normalización de formato plano → formato estructurado en `loadReport` (backward compat)
- Indicador de tendencia (📈/📉) en el output de comparación

---

## [0.5.0] — 2026-07-10

### Added
- **Multi-URL**: `--url` es ahora repetible; se testean todas las URLs secuencialmente
- `generateConsolidatedReport()` en `reporter.js`: informe único con desglose por URL
- `captureSession()` en `reporter.js`: snapshot de la sesión actual para multi-URL
- `endUrlSession()`: marca fin de sesión sin limpiar estado (para `captureSession`)
- Deduplicación de URLs (`new Set()`) en `mergeConfig`
- Tabla de desglose por URL en el informe consolidado

---

## [0.4.0] — 2026-07-09

### Added
- **Fallback automático** `click_text` para selectores CSS fallidos: si `click(selector)` falla y el selector contiene `:contains()` o `:has-text()`, reintenta con `clickText(text)` extrayendo el texto del selector
- `lib/execute-command.js`: función `executeCommand` extraída de `vigia.js` para testabilidad
- `lib/extract-commands.js`: función `extractCommands` extraída para testabilidad
- Suite de tests: `tests/browser.test.js`, `tests/reporter.test.js`, `tests/commands.test.js`, `tests/edge-cases.test.js` (118 tests totales)
- `vitest.config.js` actualizado para incluir patrones de tests VIGÍA
- Bug fix: `reporter.js` línea 114 — `||` → `??` en comparador de sort de severidades (critical con valor `0` era tratado como falsy y ordenaba last)

### Changed
- `vigia.js` ahora importa desde `lib/` en vez de tener funciones inline

---

## [0.3.0] — 2026-07-08

### Added
- **Accesibilidad**: `check_accessibility` — inyecta axe-core 4.9.1 via CDN (`page.addScriptTag()`), no dependency de npm; auditoría WCAG completa con violations, passes, incomplete
- **Link checking**: `check_links` — HEAD-check de hasta 20 links externos, detecta 404s y unreachable
- **Typing avanzado**: `type_and_select` — typing char-a-char (delay 50ms) + detección y click de sugerencias de autocomplete/dropdown
- **DOM quiescence**: `wait_for_stable` — network idle + MutationObserver para esperar que el DOM se estabilice
- Tests nuevos (95 → 113 tests)

### Decision
- axe-core inyectado via CDN para mantener el paquete lean y evitar version lock-in (decisión documentada en `decisions.md`)

---

## [0.2.0] — 2026-07-07

### Added
- **Visión**: screenshots enviados como `blob` attachments al agente (base64, `mimeType: "image/png"`) — el agente puede ver las pantallas, no solo el DOM
- Límite: 5 imágenes por turno, 5MB por imagen (base64)
- Base64 stripped del texto de resultados para evitar token bloat — viaja solo como attachment
- Error handling completo: `executeCommand` en try/catch → `{status: "error"}`, timeout de 2 min por turno, SIGINT handler guarda informe parcial, `session.error` listener, fatal crash handler
- `click_text` via `page.getByText()` — más robusto que selectores CSS para botones con texto

### Changed
- Modelo cambiado a `gpt-4.1` (soporta visión nativa, verificado con `ModelCapabilities.supports.vision`)

---

## [0.1.0] — 2026-07-06 *(MVP)*

### Added
- Agente autónomo VIGÍA MVP: Copilot SDK + Playwright Chromium headless
- Command loop pattern: el agente emite JSON, el orquestador ejecuta con Playwright (evita conflictos con built-in tools del SDK)
- `tools/browser.js`: `navigate`, `click`, `type`, `screenshot`, `getPageInfo`, `checkPerformance`, `setViewport`, `wait`
- `tools/reporter.js`: acumulación de issues, generación de informe Markdown
- Patrón AOPR (Act → Observe → Propose → Repeat)
- Checklist obligatorio: el agente no puede emitir `done` sin completar todos los items
- Auto-report de `type_and_select` sin sugerencias como issue `major`
- Informe Markdown en `reports/vigia-report-{timestamp}.md`
- Screenshots en `screenshots/`
- Prompt del sistema con tabla de acciones, checklist y regla anti-salida temprana
