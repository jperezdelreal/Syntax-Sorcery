# Arquitectura: Tester Autónomo con Copilot SDK

> **Autor:** Morpheus (Lead/Architect)  
> **Fecha:** 2026-07-11  
> **Estado:** Diseño arquitectónico completo  
> **Solicitado por:** joperezd  
> **Inspiración:** jrubiosainz/LLM-Fighter — SDK como motor de decisión con loop evolutivo

---

## TLDR

Un agente autónomo que **usa tu app como un usuario real** — navega, clica, observa, mide, y juzga — generando issues priorizados con propuestas de solución. La arquitectura combina el **Copilot SDK** (orquestación agéntica + tools built-in) con **Playwright MCP** (control de browser headless) + **Axe MCP** (accesibilidad) + **visión multimodal** (GPT-4o para juicio UX visual). El loop evolutivo `Usar → Observar → Reportar → Verificar → Repetir` convierte testing manual en un proceso autónomo que mejora la app iterativamente hasta estabilizar un "quality score". MVP demostrable en **10 días**, coste operativo **€8-15/mes**, aplicación inmediata a CityPulseLabs/BiciCoruña.

---

## 1. Cómo el SDK "Usa" una Web App

### 1.1 El Problema Fundamental

Los tests tradicionales verifican lo que el desarrollador **ya sabe**. Un tester humano encuentra lo que **nadie anticipó**. El gap entre ambos es donde viven los bugs reales, los problemas de UX, y las regresiones silenciosas.

El patrón LLM-Fighter de jrubiosainz lo resolvió para juegos: el agente **juega**, observa resultados, y propone mejoras. Nosotros lo aplicamos a apps web: el agente **usa** la app, observa problemas, y genera issues.

### 1.2 Stack de Herramientas del Agente

El SDK necesita 5 categorías de tools para interactuar con una web app como lo haría un humano:

```
┌─────────────────────────────────────────────────────────┐
│                    COPILOT SDK SESSION                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Playwright  │  │   Vision     │  │  Accessibility│  │
│  │  MCP Server  │  │  (GPT-4o)    │  │  (Axe MCP)    │  │
│  │             │  │              │  │               │  │
│  │ • navigate  │  │ • screenshot │  │ • scan_page   │  │
│  │ • click     │  │ • analyze_ux │  │ • check_wcag  │  │
│  │ • fill      │  │ • compare    │  │ • aria_audit  │  │
│  │ • scroll    │  │ • judge_flow │  │ • contrast    │  │
│  │ • snapshot  │  │              │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Network     │  │   Reporter   │  │  GitHub       │  │
│  │  Monitor     │  │              │  │  MCP Server   │  │
│  │             │  │ • findings   │  │               │  │
│  │ • requests  │  │ • score      │  │ • create_issue│  │
│  │ • timing    │  │ • prioritize │  │ • read_issues │  │
│  │ • errors    │  │ • suggest    │  │ • add_comment │  │
│  │ • waterfall │  │ • compare    │  │ • close_issue │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Detalle de Cada Tool

#### 🌐 Playwright MCP Server (`@playwright/mcp`)

El servidor MCP oficial de Microsoft. Expone Playwright como tools invocables por cualquier agente MCP-compatible.

**Por qué Playwright MCP y no Playwright directo:**
- El SDK ya soporta MCP nativamente — zero integración custom
- El agente recibe **accessibility snapshots** estructurados (árbol DOM semántico), no HTML crudo
- Self-healing: el agente razona sobre la estructura, no sobre selectores frágiles
- Mobile emulation integrada (viewport, touch, device descriptors)

**Tools expuestos:**
| Tool | Descripción |
|------|-------------|
| `browser_navigate` | Navegar a URL |
| `browser_click` | Click en elemento (por ref del snapshot) |
| `browser_type` | Escribir en input |
| `browser_snapshot` | Obtener accessibility tree de la página |
| `browser_screenshot` | Capturar screenshot (para visión) |
| `browser_scroll` | Scroll arriba/abajo |
| `browser_tab_*` | Gestión de pestañas |
| `browser_network_requests` | Ver peticiones de red (timing, status) |
| `browser_console_messages` | Ver logs de consola |
| `browser_resize` | Cambiar viewport (mobile emulation) |

**Configuración:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    }
  }
}
```

#### 👁️ Visión Multimodal (GPT-4o)

No es un MCP server separado — es una **capacidad del modelo** que el agente invoca enviando screenshots como input. El flujo:

1. Agente usa `browser_screenshot` → obtiene imagen base64
2. Agente envía imagen + prompt al modelo con visión (GPT-4o)
3. Modelo analiza: layout, contraste, spacing, legibilidad, UX patterns

**Implementación via custom tool:**
```typescript
const analyzeScreenshot = defineTool("analyze_ux", {
  description: "Analiza un screenshot de la app para evaluar UX, layout, contraste, y usabilidad",
  parameters: z.object({
    screenshot_base64: z.string().describe("Screenshot en base64"),
    context: z.string().describe("Qué página/flujo se está evaluando"),
    device: z.enum(["desktop", "mobile"]).describe("Tipo de dispositivo"),
  }),
  handler: async ({ screenshot_base64, context, device }) => {
    // Enviar a GPT-4o via Azure OpenAI con prompt de análisis UX
    const analysis = await analyzeWithVision(screenshot_base64, {
      prompt: `Analiza esta captura de ${context} en ${device}. Evalúa:
        1. Layout y jerarquía visual
        2. Contraste y legibilidad del texto
        3. Touch targets (≥44px en mobile)
        4. Spacing y breathing room
        5. Consistencia visual
        6. Problemas obvios de UX
        Puntúa de 1-10 y lista problemas concretos.`
    });
    return analysis;
  }
});
```

#### ♿ Axe MCP Server (Accesibilidad)

El servidor MCP de Deque (`axe-mcp-server`) expone auditorías WCAG automatizadas.

**Tools expuestos:**
| Tool | Descripción |
|------|-------------|
| `scan_page` | Auditoría WCAG completa de la página actual |
| `check_element` | Verificar accesibilidad de un elemento específico |
| `get_violations` | Listar violaciones con severidad y remediation |

**Alternativa más simple (MVP):** En lugar de un MCP server dedicado, inyectar axe-core via `browser_evaluate` de Playwright MCP:
```javascript
// El agente ejecuta esto en el browser
const results = await axe.run();
return results.violations;
```

#### 📊 Network Monitor (Custom Tool)

Tool custom definido con `defineTool()` que intercepta y analiza tráfico de red:

```typescript
const networkMonitor = defineTool("analyze_network", {
  description: "Analiza el rendimiento de red de la página actual",
  parameters: z.object({
    url: z.string().describe("URL a analizar"),
    threshold_ms: z.number().default(3000).describe("Umbral de tiempo de carga aceptable"),
  }),
  handler: async ({ url, threshold_ms }) => {
    // Usa browser_network_requests de Playwright MCP
    // Agrupa por tipo (API, assets, fonts)
    // Identifica: requests lentas, errores 4xx/5xx, assets sin cache
    return {
      total_requests: 42,
      total_time_ms: 2800,
      slow_requests: [{ url: "/api/routes", time_ms: 1200 }],
      errors: [{ url: "/api/stations/99", status: 404 }],
      uncached_assets: ["bundle.js", "main.css"],
      score: total_time_ms < threshold_ms ? "PASS" : "FAIL"
    };
  }
});
```

#### 📝 Reporter (Custom Tool)

Genera el informe final con findings priorizados:

```typescript
const reporter = defineTool("generate_report", {
  description: "Genera informe de calidad con issues priorizados y propuestas de solución",
  parameters: z.object({
    findings: z.array(z.object({
      category: z.enum(["ux", "functional", "performance", "accessibility", "mobile"]),
      severity: z.enum(["critical", "major", "minor"]),
      description: z.string(),
      evidence: z.string(),
      proposed_fix: z.string(),
    }))
  }),
  handler: async ({ findings }) => {
    // Priorizar: critical > major > minor
    // Deduplicar contra issues existentes (via GitHub MCP)
    // Calcular quality score
    return { report, quality_score, new_issues };
  }
});
```

### 1.4 Por Qué Copilot SDK (No Vercel AI SDK)

Decisión clave: para **productos B2C** (AUTONOMO.AI, AccesoPulse), Vercel AI SDK gana (decisión #18, ya validada). Pero para el **tester autónomo**, el Copilot SDK es la elección correcta:

| Factor | Copilot SDK ✅ | Vercel AI SDK ❌ |
|--------|---------------|-----------------|
| **MCP nativo** | Sí — Playwright/Axe MCP directo | Requiere wrapping manual |
| **Tool orchestration** | Multi-step agéntico built-in | Hay que codificar el loop |
| **Filesystem/Git** | Built-in (para generar reports) | No tiene |
| **Cold start** | Irrelevante (batch job, no user-facing) | N/A |
| **Multi-modelo** | GPT-4o para visión, GPT-4.1 para razonamiento | Sí, pero sin orquestación |
| **BYOK** | Sí (Azure OpenAI) | Sí |

**Veredicto:** El tester autónomo es un **agente de código/infraestructura**, no un chatbot. El SDK está diseñado exactamente para esto.

---

## 2. Arquitectura del Loop de Testing

### 2.1 El Loop Fundamental

```
┌─────────────────────────────────────────────────────────────┐
│                    SESIÓN DE TESTING                         │
│                                                             │
│   Round 1: EXPLORACIÓN                                      │
│   ├── Navegar a URL raíz                                    │
│   ├── Descubrir páginas (links, nav, sitemap)               │
│   ├── Mapear flujos principales                             │
│   └── Output: mapa de la app + flujos identificados         │
│                                                             │
│   Round 2: FLUJOS CORE (Happy Path)                         │
│   ├── Para cada flujo descubierto:                          │
│   │   ├── Ejecutar paso a paso                              │
│   │   ├── Verificar que completa correctamente              │
│   │   ├── Medir tiempo de cada paso                         │
│   │   └── Capturar screenshot de cada estado                │
│   └── Output: resultados + screenshots + timing             │
│                                                             │
│   Round 3: EDGE CASES                                       │
│   ├── Inputs inválidos (formularios, búsquedas vacías)      │
│   ├── Navegación rota (back, refresh, deep links)           │
│   ├── Estados de error (red lenta, API caída)               │
│   └── Output: errores encontrados + evidencia               │
│                                                             │
│   Round 4: MOBILE                                           │
│   ├── Resize a 375x667 (iPhone SE)                          │
│   ├── Resize a 390x844 (iPhone 14)                          │
│   ├── Repetir flujos core en mobile                         │
│   ├── Verificar touch targets ≥ 44px                        │
│   ├── Screenshot + análisis visual                          │
│   └── Output: problemas mobile + comparativa desktop        │
│                                                             │
│   Round 5: ACCESIBILIDAD                                    │
│   ├── axe-core scan completo                                │
│   ├── Navegación solo teclado (Tab, Enter, Escape)          │
│   ├── Verificar ARIA labels                                 │
│   ├── Contraste de colores                                  │
│   └── Output: violaciones WCAG + severidad                  │
│                                                             │
│   Round 6: SÍNTESIS                                         │
│   ├── Consolidar findings de todos los rounds               │
│   ├── Calcular quality score                                │
│   ├── Deduplicar contra issues existentes en GitHub         │
│   ├── Priorizar (critical → major → minor)                  │
│   └── Output: INFORME FINAL + GitHub Issues creados         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Implementación con Copilot SDK

```typescript
import { CopilotClient, defineTool, approveAll } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();

const session = await client.createSession({
  model: "gpt-4.1",
  onPermissionRequest: approveAll,
  mcpServers: {
    playwright: {
      type: "local",
      command: "npx",
      args: ["@playwright/mcp@latest", "--headless"],
      tools: ["*"]
    },
    github: {
      type: "local",
      command: "npx",
      args: ["@modelcontextprotocol/server-github"],
      tools: ["*"]
    }
  },
  tools: [analyzeScreenshot, networkMonitor, reporter],
  systemMessage: {
    mode: "replace",
    content: SYSTEM_PROMPT_TESTER_AUTONOMO
  }
});
```

### 2.3 El System Prompt: Cerebro del Tester

```
Eres VIGÍA, un tester autónomo de aplicaciones web. Tu misión es usar la app
como un usuario real, descubrir problemas, y generar informes accionables.

METODOLOGÍA:
1. EXPLORAR: Navega la app sin prisa. Descubre todas las páginas y flujos.
2. USAR: Ejecuta cada flujo como lo haría un usuario. Busca rutas, consulta info.
3. OBSERVAR: Presta atención a: tiempos de carga, errores, UX confusa, 
   problemas mobile, accesibilidad.
4. MEDIR: Usa las herramientas de red y accesibilidad para datos objetivos.
5. JUZGAR: Para problemas visuales, captura screenshots y analízalos.
6. REPORTAR: Genera issues priorizados con evidencia y propuesta de fix.

PRIORIZACIÓN:
- CRITICAL: App rota, datos incorrectos, seguridad
- MAJOR: UX confusa, rendimiento > 3s, accesibilidad nivel A
- MINOR: Estética, optimizaciones, accesibilidad nivel AA/AAA

REGLAS:
- NO inventes problemas. Solo reporta lo que puedes evidenciar.
- SIEMPRE incluye screenshot o datos de red como evidencia.
- COMPARA tu experiencia desktop vs mobile.
- VERIFICA si ya existe un issue en GitHub antes de crear uno nuevo.
- SUGIERE un fix concreto (no genérico) para cada problema.
```

### 2.4 Control de Flujo: Loop Controller

El loop no es un for loop programático — es el **propio agente** ejecutando una secuencia de prompts:

```typescript
const rounds = [
  "Round 1: Explora la app en {URL}. Navega por todas las páginas. Identifica los flujos principales. Genera un mapa de la app.",
  "Round 2: Ejecuta cada flujo que descubriste como happy path. Mide tiempos. Captura screenshots.",
  "Round 3: Prueba edge cases: búsquedas vacías, URLs rotas, inputs inválidos, refresh en medio de un flujo.",
  "Round 4: Cambia a viewport mobile (375x667). Repite los flujos core. Verifica touch targets.",
  "Round 5: Ejecuta auditoría de accesibilidad. Prueba navegación por teclado.",
  "Round 6: Consolida todos los findings. Calcula quality score. Crea issues en GitHub para los problemas nuevos."
];

for (const round of rounds) {
  await session.sendAndWait({ prompt: round });
}
```

**Alternativa elegante:** Un único prompt detallado que describe toda la sesión. El agente, con su capacidad de planificación multi-step, ejecuta los rounds autónomamente. Esto es más natural y permite que el agente adapte su estrategia según lo que descubra.

---

## 3. Integración de Visión (UX Judgment)

### 3.1 Capacidad Actual

**GPT-4o soporta visión multimodal de forma nativa.** El Copilot SDK puede usar GPT-4o como modelo de sesión, y enviarle imágenes inline. Esto significa que el agente puede:

1. **Capturar screenshot** (via Playwright MCP `browser_screenshot`)
2. **Enviar al modelo** como parte del contexto (base64 inline)
3. **Recibir análisis** estructurado del modelo

### 3.2 Qué Puede "Ver" el Agente

| Capacidad | Nivel de Fiabilidad | Notas |
|-----------|---------------------|-------|
| Layout general (header, nav, content, footer) | ⭐⭐⭐⭐⭐ | Excelente |
| Contraste texto/fondo | ⭐⭐⭐⭐ | Bueno, pero no reemplaza herramientas WCAG |
| Touch targets (tamaño de botones) | ⭐⭐⭐⭐ | Estima bien, pero medir con Playwright es más preciso |
| Spacing y alignment | ⭐⭐⭐⭐ | Detecta inconsistencias obvias |
| Responsive breakage | ⭐⭐⭐⭐⭐ | Comparar desktop vs mobile screenshots es su fuerte |
| Legibilidad de texto | ⭐⭐⭐⭐ | Detecta texto demasiado pequeño, fuentes ilegibles |
| Marca/branding | ⭐⭐⭐ | Puede evaluar consistencia pero no "gusto" |
| Errores funcionales visibles | ⭐⭐⭐⭐⭐ | "Esta página muestra un error 500" → perfecto |

### 3.3 Dual-Mode: Snapshot + Screenshot

El agente tiene **dos formas de "ver"** la página, y debe usar ambas:

```
Accessibility Snapshot (Playwright)    Screenshot (Visión GPT-4o)
─────────────────────────────────     ─────────────────────────────
Datos estructurados (DOM tree)         Imagen visual real
Fiable para interacción               Fiable para juicio estético
Rápido, bajo coste de tokens          Costoso (~750 tokens/imagen)
No ve CSS, colores, layout real        Ve exactamente lo que ve el usuario
Ideal para: navegación, clicks         Ideal para: UX review, responsive
```

**Estrategia:** Usar snapshots para navegar e interactuar (80% del trabajo), screenshots para juzgar visualmente (20%, solo en puntos clave de cada flujo).

### 3.4 Comparación Visual Desktop vs Mobile

```typescript
// El agente ejecuta esto como parte del Round 4
const desktopScreenshot = await session.sendAndWait({
  prompt: "Captura screenshot de la página actual en desktop (1280x720)"
});

// Cambiar a mobile
await session.sendAndWait({
  prompt: "Cambia viewport a 375x667 (iPhone SE) y captura screenshot"
});

// Comparar
await session.sendAndWait({
  prompt: `Compara los dos screenshots (desktop vs mobile). Evalúa:
    - ¿El contenido se adapta correctamente?
    - ¿Los touch targets son suficientemente grandes?
    - ¿Se pierde información importante?
    - ¿La navegación es accesible en mobile?`
});
```

### 3.5 Limitaciones Honestas de Visión

- **No reemplaza tests de pixel-perfection** — no detecta 1px de diferencia
- **No evalúa animaciones** — solo ve estados estáticos
- **Coste de tokens elevado** — ~750 tokens por imagen, limitar a 10-15 screenshots por sesión
- **Subjetividad inherente** — el modelo tiene biases estéticos, no standards formales
- **No detecta problemas de rendimiento visual** — jank, stuttering, flickering

**Mitigación:** Usar visión como complemento, no sustituto. Los datos objetivos (axe-core, timing, network) son la base. La visión es el "juicio humano simulado" que añade la capa que los tests automatizados nunca capturan.

---

## 4. Loop de Evolución Continua

### 4.1 El Patrón LLM-Fighter Aplicado a Apps

```
┌─────────────────────────────────────────────────────────┐
│                LOOP DE EVOLUCIÓN                         │
│                                                         │
│  V1 ──────────────────────────────────────────────────  │
│  │ SDK testa app → encuentra 12 issues → crea en GitHub │
│  │ Quality Score: 4.2/10                                │
│  │                                                      │
│  V2 ──────────────────────────────────────────────────  │
│  │ Equipo/Copilot corrige 8 issues → SDK retesta        │
│  │ Issues anteriores: 4 fijos, 4 pendientes             │
│  │ Issues nuevos: 5 (descubiertos al arreglar otros)    │
│  │ Quality Score: 6.1/10                                │
│  │                                                      │
│  V3 ──────────────────────────────────────────────────  │
│  │ Equipo corrige → SDK retesta                         │
│  │ Issues anteriores: 7 fijos, 2 pendientes             │
│  │ Issues nuevos: 2                                     │
│  │ Quality Score: 7.8/10                                │
│  │                                                      │
│  V4 ──────────────────────────────────────────────────  │
│  │ Quality Score: 8.5/10 → ESTABILIZADO                 │
│  │ Solo issues menores. App lista para producción.       │
│  └──────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────┘
```

### 4.2 Quality Score: Fórmula

```
Quality Score = weighted_average(
  functional_score  × 0.35,   // Flujos core funcionan
  ux_score          × 0.25,   // UX coherente y usable
  performance_score × 0.20,   // Tiempos de carga < 3s
  accessibility_score × 0.15, // WCAG 2.1 nivel A
  mobile_score      × 0.05    // Responsive correcto
)

Donde cada sub-score = (total_checks - violations) / total_checks × 10
```

**Tracking:** El score se persiste en un JSON en el repo (o como GitHub Action artifact):

```json
{
  "app": "CityPulseLabs/BiciCoruña",
  "history": [
    { "version": "v1", "date": "2026-07-15", "score": 4.2, "issues_found": 12, "issues_fixed": 0 },
    { "version": "v2", "date": "2026-07-18", "score": 6.1, "issues_found": 5, "issues_fixed": 8 },
    { "version": "v3", "date": "2026-07-22", "score": 7.8, "issues_found": 2, "issues_fixed": 7 },
    { "version": "v4", "date": "2026-07-25", "score": 8.5, "issues_found": 0, "issues_fixed": 2 }
  ]
}
```

### 4.3 Deduplicación: No Repetir Issues

El agente tiene acceso al GitHub MCP server. Antes de crear un issue:

1. **Buscar issues existentes** con `search_issues` (keyword matching)
2. **Leer issues abiertos** con `list_issues` (label `vigia:*`)
3. **Comparar** el finding actual con issues existentes
4. **Si ya existe:** Añadir comentario con nueva evidencia, no crear duplicado
5. **Si es nuevo:** Crear issue con label `vigia:auto` y severidad

**Labels del sistema:**
- `vigia:auto` — Creado automáticamente por el tester
- `vigia:verified` — El fix fue verificado en un retesting
- `vigia:regression` — Issue que reapareció después de un fix
- `vigia:false-positive` — Descartado por el equipo (el agente aprende a no repetirlo)

### 4.4 Aprendizaje Entre Iteraciones

El agente recibe como contexto en cada iteración:
1. **Issues marcados `vigia:false-positive`** → "No reportar este tipo de cosas"
2. **Issues cerrados y verificados** → "Verificar que estos siguen funcionando"
3. **Quality score anterior** → "El score era 6.1, intenta mejorar"
4. **Áreas conocidas** → "La búsqueda de rutas ya fue testeada, enfócate en áreas nuevas"

Esto se implementa inyectando contexto en el system prompt de cada sesión:

```typescript
const previousContext = await loadPreviousRunContext(repo);
const systemMessage = `${BASE_SYSTEM_PROMPT}

CONTEXTO DE ITERACIONES ANTERIORES:
- Quality Score anterior: ${previousContext.lastScore}/10
- Issues pendientes: ${previousContext.openIssues.length}
- False positives conocidos: ${previousContext.falsePositives.join(', ')}
- Áreas ya cubiertas: ${previousContext.coveredAreas.join(', ')}

INSTRUCCIONES ESPECIALES:
- Verifica que los issues cerrados (${previousContext.closedIssues.length}) siguen resueltos
- Enfócate en áreas no cubiertas anteriormente
- NO reportes los false positives listados arriba
`;
```

---

## 5. Arquitectura para CityPulseLabs

### 5.1 Sesión de Testing Concreta: BiciCoruña

```
VIGÍA Session — BiciCoruña (https://bicicoruña.citypulselabs.com)
═══════════════════════════════════════════════════════════════

Round 1: Exploración
├── Navegar a / → página principal con mapa de estaciones
├── Descubrir: Home, Búsqueda de rutas, Detalle de estación, About
├── Flujos: buscar_ruta, ver_estación, filtrar_tipo
└── Mapa: 4 páginas, 3 flujos principales

Round 2: Happy Path
├── Flujo "buscar_ruta":
│   ├── Click en búsqueda → input origen → "Plaza de María Pita"
│   ├── Input destino → "Parque de Santa Margarita"
│   ├── Click "Buscar" → esperar resultado
│   ├── FINDING: Búsqueda tarda 4.2s (threshold: 3s) → PERFORMANCE ISSUE
│   └── Screenshot de resultado → análisis visual OK
├── Flujo "ver_estación":
│   ├── Click en marker del mapa → popup con info
│   ├── FINDING: Popup no muestra disponibilidad en tiempo real → UX ISSUE
│   └── Screenshot → "Popup demasiado pequeño en desktop"
└── Timing total: 12.3s para completar flujo principal

Round 3: Edge Cases
├── Búsqueda vacía → FINDING: No hay mensaje de error, solo spinner infinito
├── URL directa a estación inexistente → FINDING: Pantalla en blanco, no 404
└── Refresh en medio de búsqueda → OK, estado se mantiene

Round 4: Mobile (375x667)
├── Flujo "buscar_ruta" en mobile
├── FINDING: Input de búsqueda no es visible sin scroll → UX MOBILE
├── FINDING: Botón "Buscar" tiene 32x28px (< 44px mínimo) → TOUCH TARGET
├── Screenshot comparison: mapa se corta en mobile → RESPONSIVE ISSUE
└── Navegación: hamburger menu funciona correctamente

Round 5: Accesibilidad
├── axe-core scan: 3 violations nivel A, 5 nivel AA
├── FINDING: Imágenes sin alt text (3 instancias)
├── FINDING: Contraste insuficiente en texto gris (#999 sobre #fff)
├── Keyboard nav: Tab order lógico pero búsqueda no es accesible
└── FINDING: Formulario de búsqueda sin label asociado

Round 6: Síntesis
├── Quality Score: 5.8/10
├── Issues creados: 9 (2 critical, 4 major, 3 minor)
├── Top fix: Implementar caching para API de rutas (4.2s → <1s)
└── Retest recomendado en 5 días
```

### 5.2 MCP Servers Necesarios

| Server | Package | Propósito | Coste |
|--------|---------|-----------|-------|
| Playwright MCP | `@playwright/mcp` | Browser headless | €0 (npm) |
| GitHub MCP | `@modelcontextprotocol/server-github` | Issues, PRs | €0 (npm) |
| Axe MCP | `axecore-mcp-server` o inline via Playwright | Accesibilidad | €0 (npm) |

**Custom tools (defineTool):**
| Tool | Propósito |
|------|-----------|
| `analyze_ux` | Enviar screenshot a GPT-4o para análisis visual |
| `analyze_network` | Agregar métricas de red por categoría |
| `generate_report` | Consolidar findings y calcular quality score |
| `load_previous_context` | Cargar resultados de iteraciones anteriores |

### 5.3 Dónde Ejecutar

| Opción | Pros | Contras | Coste |
|--------|------|---------|-------|
| **Local (PC de dev)** | Zero setup, debugging fácil | No automatizable, depende de PC encendido | €0 |
| **GitHub Actions** | CI/CD nativo, trigger en push/schedule | Runners tienen 7GB RAM, timeout 6h | €0 (2000 min/mes free) |
| **Azure Container Instance** | On-demand, sin VM permanente | Setup inicial, facturación por minuto | €3-8/mes |

**Recomendación MVP:** **GitHub Actions** con trigger manual (`workflow_dispatch`) + schedule semanal.

```yaml
# .github/workflows/vigia.yml
name: VIGÍA — Autonomous Tester
on:
  workflow_dispatch:
    inputs:
      target_url:
        description: 'URL de la app a testear'
        required: true
        default: 'https://bicicoruña.citypulselabs.com'
  schedule:
    - cron: '0 3 * * 1'  # Lunes a las 3am

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx playwright install chromium
      - run: node scripts/vigia.js ${{ inputs.target_url || 'https://bicicoruña.citypulselabs.com' }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: vigia-report-${{ github.run_number }}
          path: reports/
```

### 5.4 Integración con Squad

```
┌─────────────────────────────────────────────────────────┐
│                    SQUAD WORKFLOW                         │
│                                                         │
│  VIGÍA (Tester Autónomo)                                │
│  ├── Ejecuta sesión de testing                          │
│  ├── Genera issues en GitHub con label `vigia:auto`     │
│  │                                                      │
│  PERPETUAL MOTION (existing workflow)                   │
│  ├── Detecta nuevos issues `vigia:auto`                 │
│  ├── Asigna a Switch (verification) o Trinity (fix)     │
│  │                                                      │
│  SWITCH / TRINITY / @copilot                            │
│  ├── Implementan fixes                                  │
│  ├── Cierran issues                                     │
│  │                                                      │
│  VIGÍA (siguiente iteración)                            │
│  ├── Verifica fixes → marca `vigia:verified`            │
│  └── Busca nuevos issues → ciclo continúa               │
└─────────────────────────────────────────────────────────┘
```

**El loop es auto-perpetuante.** VIGÍA crea issues → Squad los resuelve → VIGÍA retesta → quality score sube → repeat hasta estabilización. Es perpetual motion aplicada a QA.

---

## 6. MVP: Alcance Mínimo

### 6.1 Lo Más Simple que Demuestra el Patrón

**Un script Node.js (~200 líneas) que:**
1. Abre BiciCoruña en headless browser (Playwright MCP)
2. Navega las 4 páginas principales
3. Ejecuta el flujo de búsqueda de rutas
4. Captura 3 screenshots (home, búsqueda, resultado)
5. Mide tiempos de carga
6. Ejecuta axe-core scan
7. Genera un informe Markdown con quality score
8. Crea 1-3 issues en GitHub con evidencia

**No incluye en MVP:**
- Visión multimodal (usar solo accessibility snapshots)
- Loop de evolución (solo 1 iteración)
- Mobile testing (solo desktop)
- Deduplicación inteligente (verificación manual)

### 6.2 Timeline: 10 Días

```
Día 1-2: Setup
├── Script base con Copilot SDK + Playwright MCP
├── Conexión GitHub MCP server
└── Verificar que navega BiciCoruña correctamente

Día 3-4: Exploración + Flujos
├── Round 1: Exploración automática
├── Round 2: Happy path del flujo de búsqueda
└── Capturas de screenshot

Día 5-6: Métricas + Accesibilidad
├── Network monitoring (timing, errors)
├── axe-core integration
└── Quality score calculator

Día 7-8: Reporting + GitHub Issues
├── Generación de informe Markdown
├── Creación automática de issues en GitHub
└── Labels y priorización

Día 9-10: Demo + Polish
├── Workflow de GitHub Actions
├── README con instrucciones
├── Demo grabada para presentar
└── Documentación del quality score
```

### 6.3 El "Wow" Demo

**Escenario de demo (3 minutos):**

1. "Tengo una app de rutas en bici. No he escrito ni un solo test."
2. `node scripts/vigia.js https://bicicoruña.citypulselabs.com`
3. *El agente navega la app en tiempo real (terminal output)*
4. "Ha encontrado 7 problemas. Veamos GitHub..."
5. *7 issues creados automáticamente con screenshots y propuestas de fix*
6. "El quality score es 5.8/10. Vamos a corregir los críticos y retestear."
7. *Fix del caching, re-run de VIGÍA*
8. "Score subió a 7.2. El agente verificó los fixes y encontró 2 nuevos."
9. **Cierre:** "Esto es lo que haría un QA humano, pero corre a las 3am del lunes."

### 6.4 Extensiones Post-MVP

| Extensión | Esfuerzo | Impacto |
|-----------|----------|---------|
| Visión multimodal (GPT-4o screenshots) | 3 días | Alto — UX judgment real |
| Mobile testing (viewport resize) | 2 días | Alto — catch responsive bugs |
| Loop de evolución (multi-iteración) | 3 días | Medio — calidad sostenida |
| Deduplicación inteligente | 2 días | Medio — evitar noise |
| Dashboard de quality score | 5 días | Bajo (nice to have) |
| Integración con Squad perpetual motion | 2 días | Alto — autonomía completa |

---

## 7. Estimación de Costes

### 7.1 Desglose Mensual (MVP en producción)

| Concepto | Coste/mes | Notas |
|----------|-----------|-------|
| GitHub Copilot (ya tenemos) | €0 | SDK incluido en suscripción |
| GitHub Actions (runners) | €0 | 2000 min/mes gratis, VIGÍA usa ~30 min/run |
| Azure OpenAI GPT-4o (visión) | €3-8 | ~10-15 screenshots/run × 4 runs/mes |
| Azure OpenAI GPT-4.1 (razonamiento) | €2-5 | ~50K tokens/run × 4 runs/mes |
| Playwright MCP | €0 | npm, ejecuta en runner |
| Axe MCP | €0 | npm, ejecuta en runner |
| GitHub MCP | €0 | npm, usa GITHUB_TOKEN |
| **TOTAL** | **€5-13/mes** | |

### 7.2 Coste por Run

| Componente | Tokens/Run | Coste/Run |
|------------|-----------|-----------|
| GPT-4.1 (orquestación, 6 rounds) | ~50K input + 10K output | €0.50-0.80 |
| GPT-4o (visión, 10 screenshots) | ~7.5K tokens imagen | €0.30-0.50 |
| GitHub Actions (30 min) | N/A | €0 (free tier) |
| **TOTAL por run** | | **€0.80-1.30** |

Con 4 runs/mes (semanal): **€3.20-5.20/mes** en API calls.

### 7.3 Coste con BYOK (Azure OpenAI)

Si usamos BYOK con Azure OpenAI (más control, mismos modelos):

| Modelo | Input/1K tokens | Output/1K tokens |
|--------|-----------------|-------------------|
| GPT-4.1 | $0.002 | $0.008 |
| GPT-4o | $0.0025 | $0.01 |

Para 4 runs/mes: **~€4-8/mes** total. Bien dentro del budget de €500/mes.

### 7.4 Escala: Costes Multi-App

Si aplicamos VIGÍA a las 4 apps de CityPulseLabs:

| Apps | Runs/mes | Coste API | Coste Actions | Total |
|------|----------|-----------|---------------|-------|
| 1 (BiciCoruña) | 4 | €4-8 | €0 | €4-8 |
| 4 (CPL portfolio) | 16 | €16-32 | €0 | €16-32 |
| 10 (SS + downstream) | 40 | €40-80 | €5 | €45-85 |

Incluso a 10 apps, está muy por debajo del budget. **VIGÍA escala linealmente, no exponencialmente.**

---

## 8. Recomendación

### Decisión Arquitectónica

**CONSTRUIR VIGÍA como primer producto del patrón "Autonomous App Tester".** Las razones:

1. **El patrón es real.** LLM-Fighter demostró que un agente puede usar software, observar resultados, y mejorar iterativamente. Aplicarlo a testing web es una extensión natural con valor de mercado probado.

2. **El stack existe.** Playwright MCP + Copilot SDK + Axe MCP + GPT-4o con visión — todas las piezas son production-ready, npm-installable, y compatibles entre sí. No hay technology risk.

3. **El coste es negligible.** €5-13/mes para testear una app automáticamente cada semana. Un QA junior cuesta €1.500/mes. El ROI es absurdo.

4. **Se integra con lo que ya tenemos.** Squad, perpetual motion, GitHub Issues, CityPulseLabs — VIGÍA es la pieza que falta para cerrar el loop de QA autónoma que siempre hemos imaginado.

5. **El demo es irresistible.** "Tu app tiene 7 problemas que no sabías. Aquí están, con screenshots y propuestas de fix. Quality score: 5.8/10." Esto vende solo.

### Secuencia de Ejecución

```
FASE 1 (Semana 1-2): MVP
├── Script VIGÍA con Playwright MCP + GitHub MCP
├── Testear BiciCoruña end-to-end
├── Generar informe + crear issues
└── GATE: Demo funcional a joperezd

FASE 2 (Semana 3-4): Visión + Mobile
├── Integrar GPT-4o para análisis de screenshots
├── Añadir mobile viewport testing
├── Deduplicación contra issues existentes
└── GATE: Quality score tracking + 2 iteraciones completadas

FASE 3 (Semana 5-6): Loop + Integración
├── Loop de evolución multi-iteración
├── Integración con Squad perpetual motion
├── GitHub Actions con schedule semanal
└── GATE: VIGÍA corre autónomamente, crea y verifica issues

FASE 4 (futuro): Producto
├── Packaging como servicio (input: URL → output: report)
├── Multi-app (todas las apps de CPL + SS)
├── Dashboard web de quality score
└── GATE: Primer cliente externo usa VIGÍA
```

### El Ángulo que Nadie Tiene

La mayoría de herramientas de testing automatizado verifican **lo que el dev ya sabe** (tests escritos). VIGÍA encuentra **lo que nadie anticipó** — como un QA humano, pero que trabaja a las 3am, no se cansa, y documenta todo con evidencia. 

Esto no es "AI testing" — es **AI como usuario de tu app**. Es un cambio de paradigma.

---

*"No puedo decirte qué bugs tiene tu app. Solo puedo mostrártelos."*  
— Morpheus, 2026-07-11
