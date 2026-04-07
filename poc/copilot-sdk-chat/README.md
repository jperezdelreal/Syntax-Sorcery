# 🧪 PoC — Copilot SDK como Motor Conversacional

> **Autor:** Trinity (Full-Stack Developer)
> **Fecha:** 2026-07-08
> **Estado:** PoC funcional — listo para probar

---

## ¿Qué es esto?

Una "pruebilla" para probar el [GitHub Copilot SDK](https://github.com/github/copilot-sdk) (`@github/copilot-sdk`) como motor conversacional. Tres scripts que demuestran las capacidades clave del SDK para construir productos de chat con IA.

## Requisitos

- **Node.js 18+**
- **Copilot CLI** instalado y autenticado (`copilot auth login`)
- **Suscripción GitHub Copilot** (Pro, Pro+, o Business) — o BYOK configurado

## Instalación

```bash
cd poc/copilot-sdk-chat
npm install
```

## Scripts

### 1. `index.js` — Chat Básico con Streaming

La interacción más simple: envía un mensaje, recibe respuesta con streaming token por token.

```bash
node index.js
```

**Qué demuestra:**
- Crear `CopilotClient` y gestión del ciclo de vida
- Sesión con modelo específico (`gpt-4.1`)
- Streaming en tiempo real (`assistant.message_delta`)
- Patrón de eventos: `send()` → `message_delta` → `message` → `session.idle`

**Qué observar:**
- La respuesta aparece progresivamente (no de golpe)
- El SDK gestiona el proceso CLI automáticamente

---

### 2. `multi-turn.js` — Conversación Multi-Turno

Tres turnos de conversación donde cada mensaje referencia a los anteriores.

```bash
node multi-turn.js
```

**Qué demuestra:**
- System prompt personalizado (`mode: "replace"`) — asesor fiscal FiscalBot
- Contexto mantenido automáticamente entre turnos
- El tercer turno pide "resume los tres casos" sin que pasemos historial manualmente

**Qué observar:**
- El turno 2 pregunta "¿Y si el cliente está en Francia?" — el SDK recuerda que somos diseñador gráfico
- El turno 3 pide una tabla resumen de "los tres casos que hemos hablado"
- No hay gestión manual de historial — el SDK lo maneja todo

---

### 3. `with-tools.js` — Chat con Herramientas Custom

El agente tiene acceso a 3 herramientas que puede invocar durante la conversación.

```bash
node with-tools.js
```

**Herramientas registradas:**

| Tool | Qué hace | Cuándo se activa |
|------|----------|-----------------|
| `consultar_iva` | Devuelve tipo de IVA según actividad y localización | Preguntas sobre IVA aplicable |
| `calcular_retencion_irpf` | Calcula retención + desglose de factura | Cálculos de facturas |
| `buscar_facturas` | Busca en registro mock de facturas | Consultas sobre historial |

**Qué demuestra:**
- `defineTool()` con schemas Zod para type-safety
- El agente decide **cuándo** y **qué** herramienta usar
- Los datos vienen de los handlers (no del modelo)
- System prompt que guía al agente a usar las herramientas
- Eventos de tool execution: `tool.execution_start` / `tool.execution_complete`

**Qué observar:**
- Los logs muestran `🔧 [tool_name]` cuando se ejecutan handlers
- Las respuestas incorporan datos **reales** de las herramientas
- En producción, los handlers consultarían bases de datos o APIs

---

## Arquitectura del SDK

```
Tu Script (index.js, etc.)
       ↓
  CopilotClient (gestiona ciclo de vida)
       ↓ JSON-RPC
  Copilot CLI (server mode, bundled automáticamente)
       ↓
  GitHub Copilot Cloud (modelos IA)
```

El SDK NO es un wrapper HTTP. Levanta el CLI como subproceso y se comunica via JSON-RPC (stdin/stdout). No necesitas configurar endpoints ni API keys de OpenAI — usa tu autenticación de Copilot.

## API Patterns Demostrados

```javascript
// Crear cliente
const client = new CopilotClient();
await client.start();

// Crear sesión
const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
  tools: [...],              // herramientas custom
  systemMessage: {           // system prompt
    mode: "replace",
    content: "Eres un asesor fiscal..."
  },
});

// Enviar mensaje (async con eventos)
await session.send({ prompt: "..." });

// O enviar y esperar respuesta (síncrono)
const response = await session.sendAndWait({ prompt: "..." });

// Limpieza
await session.disconnect();
await client.stop();
```

## Costes

Cada prompt consume de tu cuota de **premium requests** de Copilot:
- **Copilot Pro:** 300 req/mes incluidos
- **Copilot Pro+:** 1.500 req/mes incluidos
- **Overage:** $0.04/request

Para este PoC, cada script usa 1-3 prompts. Coste total: ~$0.04-0.12.

## Próximos Pasos

Si el PoC demuestra que el SDK funciona:

1. **AUTONOMO.AI** — Integrar SDK como motor conversacional del producto
2. **FORJA** — SDK para orquestar agentes programáticamente (reemplazar CLI interactivo)
3. **Squad Headless** — SDK como runtime para sesiones de Squad en Azure VM

## Hallazgos del PoC (2026-07-08)

### ✅ Lo que funciona perfectamente
- **Chat básico** (`index.js`): Streaming, ciclo de vida, modelo gpt-4.1 — todo OK
- **Multi-turno** (`multi-turn.js`): Contexto mantenido entre 3 turnos, system prompt personalizado funciona
- **Streaming**: Token por token, sin problemas

### ⚠️ Lo que necesita trabajo: Custom Tools
- **El agente prefiere sus herramientas built-in** (web_fetch, powershell, etc.) sobre las custom tools
- Con `mode: "replace"` en el system prompt Y `approveAll` en permisos, el agente tiene acceso a TODOS los built-in tools + los custom
- Resultado: para preguntas que PODRÍA responder con tools built-in, ignora los custom
- **Solución probable**: Restringir tools built-in en la configuración del SDK, o ser más explícito en el prompt

### 💡 Implicaciones para AUTONOMO.AI
1. El SDK funciona como motor conversacional — chat + contexto + streaming están producción-ready
2. Para tools custom (BD de facturas, APIs fiscales), necesitamos desactivar tools built-in competidores
3. El system prompt `mode: "replace"` da control total pero el agente aún retiene sus tools
4. Considerar `mode: "customize"` con secciones específicas en lugar de reemplazo total

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Error: CLI not found` | Instala Copilot CLI: `npm install -g @anthropic/copilot-cli` o verifica que `copilot` está en PATH |
| `Error: Not authenticated` | Ejecuta `copilot auth login` |
| `Error: Rate limited` | Espera 1 min o upgrade a Pro+ |
| `Error: Module not found` | Ejecuta `npm install` en este directorio |
| Respuesta vacía | Verifica modelo disponible con `copilot model list` |
