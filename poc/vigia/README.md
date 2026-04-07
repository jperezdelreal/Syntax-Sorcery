```
 ██╗   ██╗██╗ ██████╗ ██╗ █████╗
 ██║   ██║██║██╔════╝ ██║██╔══██╗
 ██║   ██║██║██║  ███╗██║███████║
 ╚██╗ ██╔╝██║██║   ██║██║██╔══██║
  ╚████╔╝ ██║╚██████╔╝██║██║  ██║
   ╚═══╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═╝
 Tester Autónomo de Apps Web — v1.0.0
```

> **TLDR:** VIGÍA es un agente de QA autónomo que usa tu app como un usuario real con criterio de producto. Navega, clica, busca, mide rendimiento, detecta accesibilidad y genera un informe accionable. Zero config — solo dale una URL.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Powered by](https://img.shields.io/badge/powered%20by-Copilot%20SDK%20%2B%20Playwright-purple)](https://github.com/github/copilot-sdk)

---

## ¿Qué es VIGÍA?

VIGÍA encuentra **lo que nadie anticipó**. A diferencia de los tests tradicionales (que verifican lo que el desarrollador ya sabe), VIGÍA explora tu app de forma completamente autónoma y emite juicio sobre lo que encuentra — como un tester con criterio de producto, no solo un verificador de pass/fail.

**Diferenciadores clave:**
- 🧠 **Juicio de producto** — detecta problemas UX/usabilidad que los scripts ciegos no ven
- 👁️ **Visión** — analiza screenshots para detectar problemas de layout, contraste y responsive
- ♿ **Accesibilidad real** — auditoría WCAG con axe-core, no solo checklists manuales
- 🔄 **Evolución** — compara ejecuciones y re-testea regresiones automáticamente
- 🤖 **Zero instrucciones** — el agente decide qué testear; tú solo das la URL

---

## Instalación

### Uso local (recomendado)

```bash
git clone https://github.com/tu-org/syntax-sorcery
cd poc/vigia
npm install
npx playwright install chromium
```

### Futuro: npm global *(próximamente)*

```bash
npm install -g vigia
vigia --url https://tu-app.com
```

### Requisitos

- **Node.js** 18 o superior
- **GitHub Copilot CLI** instalado y autenticado (`gh auth login`)
- **Chromium** (se instala automáticamente con el comando anterior)

---

## Quick Start

```bash
# 1. Testear una URL
node vigia.js --url https://tu-app.com

# 2. Ver el informe
cat reports/vigia-report-*.md

# 3. Con modo visual (ver el navegador)
node vigia.js --url https://tu-app.com --visible
```

En ~3-5 minutos tendrás un informe Markdown con todos los issues encontrados, clasificados por severidad, con screenshots de evidencia.

---

## CLI — Referencia Completa

```
USAGE:
  node vigia.js [options]

OPTIONS:
  --url <url>                 URL a testear (repetible para multi-URL)
  --visible                   Ejecutar con navegador visible (default: headless)
  --config <path>             Cargar configuración desde archivo JSON
  --severity-threshold <lvl>  Solo reportar issues en este nivel o superior
                              Niveles: info < minor < major < critical
  --output-format <fmt>       Aceptado pero no funcional en v1.0 — ver nota abajo
  --quiet, -q                 Silenciar terminal, solo escribir el informe
  --compare <f1> <f2>         Comparar dos informes JSON y mostrar diff
  --regression <report.json>  Re-testear issues de un informe anterior
  --help, -h                  Mostrar esta ayuda
```

### `--url` — URL objetivo

```bash
# Una URL
node vigia.js --url https://mi-app.com

# Múltiples URLs (se testean secuencialmente, informe consolidado)
node vigia.js --url https://mi-app.com --url https://mi-app.com/dashboard
```

### `--visible` — Modo con navegador visible

```bash
node vigia.js --url https://mi-app.com --visible
```

Abre Chromium en pantalla para ver el agente en acción. Útil para debugging o demos.

### `--config` — Archivo de configuración

```bash
node vigia.js --config vigia.config.json
```

Carga opciones desde un archivo JSON. Los flags CLI siempre tienen prioridad sobre el archivo.

### `--severity-threshold` — Filtrar por severidad

```bash
# Solo reportar issues major y critical (ignorar minor e info)
node vigia.js --url https://mi-app.com --severity-threshold major
```

Niveles de severidad:
| Nivel | Descripción |
|-------|-------------|
| `info` | Observaciones, mejoras opcionales |
| `minor` | Problemas pequeños de UX o accesibilidad |
| `major` | Funcionalidad degradada, flujos rotos |
| `critical` | Bloqueante — la app no funciona correctamente |

### `--output-format` — Formato del informe

```bash
node vigia.js --url https://mi-app.com --output-format json
```

> ⚠️ **Estado actual (v1.0):** Este flag es aceptado y validado por el CLI, pero **aún no está conectado al reporter**. Independientemente del valor que pases, VIGÍA siempre genera **ambos formatos**: un `.md` legible y un `.json` estructurado. La selección de formato estará disponible en una versión futura.

| Formato | Descripción |
|---------|-------------|
| `md` | Markdown legible (default) — *siempre generado* |
| `json` | JSON estructurado para programatic use o comparación — *siempre generado* |
| `html` | HTML renderizable *(próximamente)* |

### `--quiet` — Modo silencioso

```bash
node vigia.js --url https://mi-app.com --quiet
```

Suprime toda la salida de terminal. Solo escribe el informe en disco. Ideal para CI/CD.

### `--compare` — Comparar ejecuciones

```bash
node vigia.js --compare reports/vigia-data-2026-07-10.json reports/vigia-data-2026-07-14.json
```

Compara dos informes JSON y muestra:
- 🆕 Issues nuevas
- ✅ Issues resueltas
- 🔄 Issues persistentes
- ⚠️ Regresiones (resueltas que reaparecen)
- 📈/📉 Tendencia general

### `--regression` — Re-testear regresiones

```bash
node vigia.js --regression reports/vigia-data-2026-07-10.json
```

Carga un informe anterior, re-testea solo las URLs que tuvieron issues, y clasifica cada uno:
- ✅ `resolved` — ya no aparece
- ❌ `persists` — sigue presente
- 🆕 `new` — encontrado en el re-test pero no en el baseline

---

## Archivo de configuración

Crea `vigia.config.json` en la raíz del proyecto:

```json
{
  "urls": [
    "https://mi-app.com",
    "https://mi-app.com/dashboard"
  ],
  "visible": false,
  "maxTurns": 20,
  "severityThreshold": "minor",
  "outputFormat": "md",
  "quiet": false,
  "viewportPresets": {
    "desktop": { "width": 1280, "height": 720 },
    "mobile": { "width": 375, "height": 667 },
    "tablet": { "width": 768, "height": 1024 }
  }
}
```

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `urls` | `string[]` | `[]` | URLs a testear |
| `visible` | `boolean` | `false` | Navegador visible |
| `maxTurns` | `number` | `15` | Turnos máximos del agente (más = testing más profundo) |
| `severityThreshold` | `string` | `"info"` | Filtro de severidad mínima |
| `outputFormat` | `string` | `"md"` | Formato del informe |
| `quiet` | `boolean` | `false` | Silenciar terminal |
| `viewportPresets` | `object` | *(ver arriba)* | Dimensiones de viewport por nombre |

> **CLI gana siempre.** Si un flag está en ambos sitios, el valor del CLI tiene prioridad.

---

## Ejemplos de uso

### Audit rápido de producción

```bash
node vigia.js --url https://mi-app.com --severity-threshold major
```

### Testing completo con informe JSON

```bash
node vigia.js --url https://mi-app.com --output-format json --quiet
```

### Multi-URL con configuración

```json
{
  "urls": [
    "https://mi-app.com",
    "https://mi-app.com/login",
    "https://mi-app.com/dashboard"
  ],
  "maxTurns": 20,
  "severityThreshold": "minor"
}
```

```bash
node vigia.js --config vigia.config.json
```

### Comparación entre versiones

```bash
# Correr baseline
node vigia.js --url https://mi-app.com --output-format json

# Hacer cambios en la app...

# Correr de nuevo
node vigia.js --url https://mi-app.com --output-format json

# Comparar
node vigia.js --compare reports/vigia-data-2026-07-10.json reports/vigia-data-2026-07-15.json
```

### Re-test de regresiones tras un fix

```bash
# Usar el JSON del run anterior
node vigia.js --regression reports/vigia-data-2026-07-10.json
```

---

## Herramientas del agente

VIGÍA implementa un "command loop": el agente emite JSON estructurado y el orquestador ejecuta cada comando con Playwright. Esta arquitectura evita conflictos con los built-in tools del Copilot SDK.

| Acción | Parámetros | Descripción |
|--------|-----------|-------------|
| `navigate` | `url` | Abre URL, mide tiempo de carga |
| `click` | `selector` | Click por selector CSS (con fallback a texto) |
| `click_text` | `text` | Click por texto visible (más robusto) |
| `type` | `selector, text` | Escribe en un campo de formulario |
| `type_and_select` | `selector, text` | Typing char-a-char + selección de autocomplete |
| `screenshot` | `name` | Captura screenshot y lo envía al agente como imagen |
| `get_page_info` | — | Links, botones, inputs, headings, imágenes sin alt |
| `check_performance` | — | DOM load, recursos, tamaño de transferencia |
| `check_accessibility` | — | Auditoría WCAG con axe-core (inyectado via CDN) |
| `check_links` | — | HEAD-check de todos los links, detecta 404s |
| `wait_for_stable` | — | Espera DOM quiescente (network idle + MutationObserver) |
| `set_viewport` | `width, height` | Cambia viewport (simula mobile/tablet) |
| `wait` | `ms` | Pausa (para animaciones/transiciones) |
| `report_issue` | `title, desc, severity` | Registra un problema con evidencia |
| `done` | — | Finaliza el testing (bloqueado hasta completar checklist) |

### Checklist obligatorio

El agente no puede emitir `done` hasta completar:
1. Screenshot de homepage + `get_page_info` + `check_performance`
2. `check_accessibility` (WCAG audit)
3. `check_links` (404 detection)
4. `type_and_select` en todos los inputs
5. `set_viewport` a mobile (375×667)

---

## Formato de informes

### Markdown (`.md`)

Generado en `reports/vigia-report-{timestamp}.md`. Incluye:
- Resumen ejecutivo con conteo por severidad
- Desglose por URL (en modo multi-URL)
- Cada issue con título, descripción, screenshot y severidad
- Log de acciones completo

### JSON (`.json`)

Generado en `reports/vigia-data-{timestamp}.json`. Estructura:

```json
{
  "version": "1.0.0",
  "url": "https://mi-app.com",
  "urls": ["https://mi-app.com"],
  "generatedAt": "2026-07-15T10:00:00.000Z",
  "summary": {
    "totalIssues": 7,
    "critical": 1,
    "major": 3,
    "minor": 3,
    "durationMin": 4.2,
    "actionsExecuted": 38
  },
  "issues": [
    {
      "id": 1,
      "title": "Búsqueda sin resultados",
      "description": "...",
      "severity": "major",
      "fingerprint": "vigia-a3f2c1",
      "timestamp": "2026-07-15T10:01:23.000Z"
    }
  ],
  "sessions": [...]
}
```

El campo `fingerprint` es un hash estable del título + severidad, usado para comparar issues entre ejecuciones.

### Códigos de salida

| Código | Significado |
|--------|-------------|
| `0` | Sin issues críticos |
| `1` | Issues críticos encontrados (o error) |

---

## CI/CD — GitHub Action

VIGÍA incluye una GitHub Action lista para usar en `.github/actions/vigia/`:

```yaml
# En tu workflow:
- name: Run VIGÍA
  uses: ./.github/actions/vigia
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    url: 'https://tu-app.com'
    max-turns: '15'
    severity-threshold: 'minor'
    output-format: 'md'
```

### Inputs de la Action

| Input | Default | Descripción |
|-------|---------|-------------|
| `url` | *(requerido)* | URL a testear |
| `max-turns` | `10` | Turnos máximos del agente |
| `severity-threshold` | `minor` | Severidad mínima a reportar |
| `output-format` | `md` | Aceptado pero no funcional en v1.0 — siempre genera MD + JSON |

### Outputs de la Action

| Output | Descripción |
|--------|-------------|
| `report` | Ruta al archivo de informe generado |
| `exit-code` | `0` = limpio, `1` = issues críticos |
| `issue-count` | Número de issues encontrados |

### Trigger por label en PR

El workflow `vigia-pr.yml` permite disparar VIGÍA añadiendo el label `vigia` a cualquier PR:

```yaml
on:
  pull_request:
    types: [labeled]  # label 'vigia' → dispara el scan
```

Los resultados se publican como comentario en el PR y los screenshots se guardan como artefactos (14 días).

---

## Limitaciones del SDK

VIGÍA usa el GitHub Copilot SDK como motor de razonamiento. Ten en cuenta estas limitaciones:

### Límite de tool_calls: 128 por sesión

El SDK tiene un límite de **128 tool calls por sesión**. Con el patrón command loop de VIGÍA, cada turno puede ejecutar múltiples comandos pero cuenta como una sola llamada al SDK. En la práctica:
- 15 turnos (default) ≈ 15-30 tool calls → bien dentro del límite
- Si necesitas más de 128 turnos totales, usa multi-URL (cada URL abre una sesión nueva)

### Tamaño del prompt: ~2KB recomendado

El prompt del sistema ocupa ~2KB. Si personalizas el `SYSTEM_PROMPT` en `vigia.js`, mantén el total por debajo de **4KB** para evitar truncamiento en modelos con contexto limitado.

### Modelo: gpt-4.1

VIGÍA usa `gpt-4.1` por defecto. Este modelo:
- ✅ Soporta visión (`ModelCapabilities.supports.vision`)
- ✅ Límite: 5 imágenes por turno, 5MB por imagen (base64)
- ⚠️ No es `gpt-4o` — si cambias el modelo, verifica que soporte vision

### Latencia

Cada turno del agente toma ~5-15 segundos (llamada al modelo + ejecución de comandos). Un run típico de 15 turnos dura 3-5 minutos.

---

## Arquitectura

```
vigia.js                    ← Punto de entrada. Orquesta todo.
├── lib/
│   ├── config.js           ← Parsing de args, carga de config, merge
│   ├── compare.js          ← Diff entre dos informes JSON
│   ├── regression.js       ← Re-testing de issues de un baseline
│   ├── extract-commands.js ← Parsea JSON del agente → array de comandos
│   └── execute-command.js  ← Dispatch: comando → función de browser.js
├── tools/
│   ├── browser.js          ← Wrapper de Playwright (todas las acciones)
│   └── reporter.js         ← Acumula issues, genera MD + JSON
├── tests/
│   ├── browser.test.js     ← Tests de browser.js
│   ├── reporter.test.js    ← Tests de reporter.js
│   ├── commands.test.js    ← Tests de execute-command.js
│   └── edge-cases.test.js  ← Edge cases
├── reports/                ← Informes generados (gitignored)
└── screenshots/            ← Screenshots de evidencia (gitignored)
```

### Patrón AOPR

VIGÍA implementa el patrón **AOPR** (Act → Observe → Propose → Repeat):

```
┌──────────────────────────────────────────────────┐
│  COPILOT SDK (Cerebro — gpt-4.1 + visión)        │
│                                                  │
│  1. ACT:     Decide qué acción ejecutar          │
│  2. OBSERVE: Recibe resultado + screenshot       │
│  3. PROPOSE: report_issue() si hay problema      │
│  4. REPEAT:  Siguiente acción                    │
│                                                  │
│         ↕ command loop ↕                         │
│                                                  │
│  PLAYWRIGHT (Manos — Chromium headless)          │
│  Ejecuta las acciones en el navegador real       │
└──────────────────────────────────────────────────┘
```

El SDK emite bloques JSON con comandos. El orquestador los parsea y ejecuta con Playwright. Los screenshots se envían de vuelta como `blob` attachments para análisis visual.

---

## Contributing

Las contribuciones son bienvenidas. Áreas de interés:

- **Nuevos comandos del agente** — añadir a `tools/browser.js` + `lib/execute-command.js` + el `SYSTEM_PROMPT` en `vigia.js`
- **Formatos de informe** — `html` está pendiente en `tools/reporter.js`
- **Integraciones CI** — workflows para GitLab CI, CircleCI, etc.
- **Tests** — los tests están en `tests/` con Vitest

```bash
# Correr tests
npm test

# Correr tests en modo watch
npx vitest --watch
```

---

## Licencia

MIT © Syntax Sorcery
