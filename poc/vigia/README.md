# 🔍 VIGÍA — Tester Autónomo de Apps Web

> **v0.1.0 MVP** — Copilot SDK + Playwright

VIGÍA es un agente autónomo de QA que **usa tu app como un usuario real**. Navega, clica, busca, mide rendimiento, y genera un informe con los problemas encontrados. Todo sin instrucciones predefinidas — el agente decide qué testear.

## Cómo Funciona

```
┌─────────────────────────────────────────────┐
│           COPILOT SDK (Cerebro)              │
│                                              │
│  "Soy VIGÍA. Voy a explorar esta app..."    │
│  → navigate(url)     → get_page_info()       │
│  → click(selector)   → check_performance()   │
│  → type(selector)    → screenshot(name)       │
│  → report_issue()    → set_viewport()         │
│                                              │
│         ↕ decide qué hacer ↕                 │
│                                              │
│           PLAYWRIGHT (Manos)                  │
│  Chromium headless ejecuta las acciones       │
└─────────────────────────────────────────────┘
```

El SDK piensa. Playwright ejecuta. VIGÍA reporta.

## Instalación

```bash
cd poc/vigia
npm install
npx playwright install chromium
```

## Ejecución

```bash
# Contra la app desplegada
node vigia.js --url https://citypulselabs.azurestaticapps.net

# Contra localhost
node vigia.js --url http://localhost:5173
```

## Qué Esperar

1. **~2-5 minutos** de testing autónomo
2. El agente navega la app, toma screenshots, mide rendimiento
3. Genera un informe Markdown en `reports/vigia-report-{timestamp}.md`
4. Screenshots guardados en `screenshots/`

## Estructura

```
poc/vigia/
├── vigia.js              # Script principal — orquesta SDK + Playwright
├── tools/
│   ├── browser.js        # Wrapper de Playwright (navigate, click, screenshot...)
│   └── reporter.js       # Acumula issues y genera informe Markdown
├── reports/              # Informes generados (gitignored)
├── screenshots/          # Screenshots de evidencia (gitignored)
├── package.json
└── README.md
```

## Herramientas del Agente

| Tool | Descripción |
|------|-------------|
| `navigate(url)` | Abre una página y mide tiempo de carga |
| `click(selector)` | Click en un elemento CSS |
| `type_text(selector, text)` | Escribe en un campo |
| `screenshot(name)` | Captura screenshot completo |
| `get_page_info()` | Extrae links, botones, inputs, headings, imágenes sin alt |
| `check_performance()` | Mide DOM load, recursos, tamaño transferido |
| `report_issue(title, desc, severity)` | Registra un problema |
| `set_viewport(w, h)` | Cambia viewport (desktop/mobile) |
| `wait(ms)` | Espera (para animaciones/transiciones) |

## Requisitos

- Node.js 18+
- GitHub Copilot CLI instalado y autenticado
- Chromium (se instala con `npx playwright install chromium`)

## Arquitectura

VIGÍA implementa el patrón **AOPR** (Act-Observe-Propose-Repeat):

1. **Actuar**: Navega la app como un usuario sin instrucciones previas
2. **Observar**: Evalúa con criterio de QA, no solo pass/fail
3. **Proponer**: Genera issues accionables con evidencia
4. **Repetir**: Explora más áreas de la app

A diferencia de tests tradicionales (que verifican lo que el dev ya sabe), VIGÍA encuentra **lo que nadie anticipó**.
