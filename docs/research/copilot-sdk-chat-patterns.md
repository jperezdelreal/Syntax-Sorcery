# Copilot SDK como Motor Conversacional — Investigación Profunda

> **Autor:** Oracle (Product & Docs)  
> **Fecha:** 2026-07-08  
> **Estado:** Investigación completa  
> **Solicitado por:** joperezd  
> **Input:** `docs/research/copilot-sdk-research.md` (investigación previa)

---

## TLDR

**El Copilot SDK NO es la herramienta adecuada como motor conversacional para productos de usuario final (AUTONOMO.AI, AccesoPulse, FORJA, CAMBIAZO).** La razón técnica es contundente: el SDK funciona lanzando Copilot CLI como subproceso (~2.5s overhead por ciclo de vida), está diseñado para agentes de código (filesystem, Git, terminal), y su valor añadido sobre una API directa es mínimo cuando lo que necesitas es un chatbot de dominio específico con herramientas propias.

**La recomendación es: Vercel AI SDK + MCP + Azure OpenAI.** Esta combinación ofrece streaming nativo para React, soporte MCP para herramientas de dominio (datos bancarios, reglas fiscales, escaneo WCAG), es provider-agnostic, corre nativamente en Node.js/Azure Functions sin overhead de subproceso, y tiene el ecosistema más maduro para exactamente lo que SS necesita construir. El Copilot SDK sigue siendo valioso para FORJA (extensiones Copilot) y Squad (orquestación headless), pero no como motor de chat para usuarios finales.

---

## 1. SDK vs API Directa: ¿Merece la Pena?

### Qué da el SDK que una API directa no da

| Capacidad | Copilot SDK | API Directa (OpenAI/Azure) |
|-----------|-------------|---------------------------|
| **Orquestación agéntica** | ✅ Planificación, multi-step, tool loops | ❌ Hay que codificarlo |
| **Gestión de contexto** | ✅ Compactación automática de historial | ❌ Manual |
| **Multi-modelo** | ✅ Cambiar modelo por sesión | ⚠️ Depende del provider |
| **MCP nativo** | ✅ Servidores MCP locales y remotos | ❌ Hay que integrarlo |
| **Streaming** | ✅ Token por token | ✅ Token por token |
| **Herramientas built-in** | ✅ Filesystem, Git, HTTP, terminal | ❌ N/A |

### Lo que el SDK NO da para productos de usuario final

Aquí viene la verdad incómoda:

1. **Overhead de subproceso:** El SDK lanza Copilot CLI como subproceso y se comunica via JSON-RPC. Esto añade ~0.4s para arranque del CLI, ~1.2s para crear sesión, ~1s para teardown = **~2.5s de overhead por ciclo de vida**. En una API directa, la primera respuesta llega en <500ms.

2. **Diseñado para código:** Las herramientas built-in (filesystem, Git, terminal) son irrelevantes para un autónomo preguntando sobre IVA. El valor del SDK está en su orquestación de *código*, no de *conocimiento de dominio*.

3. **BYOK anula el valor principal:** Si usas BYOK (necesario para usuarios sin GitHub), pierdes los modelos Copilot y usas tu propia clave de Azure/OpenAI/Anthropic. En ese punto, el SDK es solo un wrapper sobre una API que ya podrías llamar directamente con menos overhead.

4. **Sin hooks para UI:** El SDK no tiene `useChat()`, no tiene componentes React, no tiene gestión de estado del lado cliente. Todo lo que necesitas para una UI de chat hay que construirlo.

5. **Dependencia del CLI:** La arquitectura `App → SDK → CLI (subproceso) → API` tiene un eslabón extra vs `App → API`. Más puntos de fallo, más latencia, más complejidad operativa.

### Veredicto honesto

> **Para productos donde usuarios chatean con IA de dominio (fiscal, accesibilidad, bancario), el SDK añade complejidad sin valor proporcional.** La orquestación agéntica es valiosa, pero hay formas más ligeras de conseguirla para este caso de uso.

---

## 2. Patrones de Chat con el SDK

### Cómo funciona (si decides usarlo)

```typescript
import { CopilotClient } from "@github/copilot-sdk";

// Singleton — reutilizar en toda la app
const client = new CopilotClient();
await client.start();

// Una sesión por conversación de usuario
const session = await client.createSession({
  model: "gpt-4.1",
  mcpServers: {
    "tax-rules": {
      type: "remote",
      url: "https://mi-mcp-fiscal.azurewebsites.net/mcp",
      tools: ["*"]
    }
  }
});

// Streaming con event listeners
session.on((event) => {
  if (event.type.value === "assistant.message_delta") {
    // Enviar chunk al WebSocket del cliente
    ws.send(JSON.stringify({ delta: event.data.content }));
  }
  if (event.type.value === "session.idle") {
    // Turno completado
  }
});

await session.send("¿Cuánto IVA debo declarar este trimestre?");
```

### Gestión de sesiones

| Patrón | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **Sesión por conversación** | Una `CopilotSession` por thread de chat | Chat estándar |
| **Pool de sesiones** | Pre-crear N sesiones, asignar a usuarios | Alta concurrencia |
| **External Server Mode** | CLI como servicio persistente, conexión TCP | Multi-tenant producción |
| **Sesión efímera** | Crear → query → destruir | Consultas one-shot |

### Streaming a Web UI

El flujo sería:
```
React UI → WebSocket → Node.js Backend → CopilotSession.send()
                                              ↓ eventos
React UI ← WebSocket ← Node.js Backend ← assistant.message_delta
```

**Problema:** Esto es mucho wiring manual. Hay que gestionar WebSockets, reconectar, buffering, estado del chat — todo desde cero. Compárese con Vercel AI SDK donde un `useChat()` hook hace todo esto automáticamente.

### Multi-turn

La sesión acumula historial automáticamente. Cada `session.send()` incluye el contexto previo. El SDK compacta el contexto cuando se acerca al límite de la ventana.

---

## 3. MCP como Diferenciador

### Por qué MCP importa para SS

MCP (Model Context Protocol) es el verdadero game-changer, **pero no es exclusivo del Copilot SDK**. Es un protocolo abierto que funciona con cualquier SDK/framework que lo implemente.

### Comparativa: MCP vs Function Calling vs Tool Use

| Aspecto | MCP | OpenAI Function Calling | Anthropic Tool Use |
|---------|-----|------------------------|-------------------|
| **Vendor lock-in** | Ninguno (protocolo abierto) | Solo OpenAI | Solo Anthropic |
| **Descubrimiento** | Runtime (tools/list) | Compile-time | Compile-time |
| **Transporte** | HTTP, SSE, WebSocket, stdio | API HTTPS | API HTTPS |
| **Reutilización** | Mismo servidor para N clientes | Reimplementar por provider | Reimplementar por provider |
| **Ecosistema** | Creciente (estándar en 2026) | Maduro pero propietario | Maduro pero propietario |
| **Persistencia** | Sesiones stateful | Sin contexto persistente | Por llamada |

### MCP servers que SS necesitaría

Para los productos de SS, estos serían los MCP servers de dominio:

| Producto | MCP Server | Herramientas |
|----------|-----------|-------------|
| **AUTONOMO.AI** | `mcp-fiscal-es` | `calcular_iva`, `categorizar_gasto`, `modelo_303`, `consultar_normativa` |
| **AUTONOMO.AI** | `mcp-banca` | `leer_movimientos`, `clasificar_ingreso`, `detectar_factura` |
| **AUTONOMO.AI** | `mcp-ocr` | `extraer_factura`, `leer_ticket`, `parsear_certificado` |
| **AccesoPulse** | `mcp-wcag` | `auditar_pagina`, `verificar_contraste`, `evaluar_aria`, `generar_informe` |
| **CAMBIAZO** | `mcp-scraper` | `crawlear_sitio`, `extraer_estilos`, `capturar_screenshot` |
| **FORJA** | `mcp-deploy` | `crear_repo`, `configurar_ci`, `desplegar_swa` |

### El punto clave

> **Estos MCP servers son el mismo esfuerzo de desarrollo independientemente del SDK/framework que uses.** La diferencia es cómo los conectas. El Copilot SDK los conecta vía subproceso CLI. Vercel AI SDK los conecta vía `createMCPClient()` directamente. OpenAI Agents SDK requiere adaptadores. **MCP es ortogonal al SDK.**

---

## 4. Ejemplos Reales y Early Movers

### Lo que existe hoy (julio 2026)

| Ejemplo | Tipo | Relevancia para SS |
|---------|------|-------------------|
| **microsoft/copilot-sdk-samples** | Repo oficial de samples | Issue labelers, security triagers, bots — todos dev-focused |
| **Tech Update Tracker** (MS Tech Community) | Agente que analiza repos y genera blog posts | Interesante pero es content gen, no chat |
| **React Native Issue Triage** (GitHub Blog) | Resúmenes de issues en app móvil | Más cercano a chat pero sigue siendo dev-tool |
| **DevLeader C# patterns** | Arquitectura production-scale en .NET | Patrones buenos pero orientados a developer tools |
| **Squad (nosotros)** | Multi-agent orchestration | Ya lo hacemos, pero vía CLI no SDK |

### Lo que NO existe

❌ **Nadie está usando el Copilot SDK para productos B2C de chat general.**  
❌ No hay case studies de chatbots de atención al cliente con Copilot SDK.  
❌ No hay SaaS de dominio (fiscal, legal, médico) construidos sobre el SDK.  
❌ No hay apps donde el usuario final sea un no-programador.

### ¿Por qué?

Porque el SDK está diseñado para **developer tools**. El nombre lo dice: *Copilot*. Su motor es un asistente de programación. Usarlo para un chatbot fiscal es como usar un Ferrari de Fórmula 1 para repartir pizza — técnicamente puede, pero hay mejores opciones.

### ¿Early mover advantage?

Sí, pero **en el espacio equivocado** para este caso de uso. El early mover advantage del SDK está en:
- Extensiones Copilot para el marketplace (FORJA) ✅
- Herramientas para desarrolladores ✅
- Squad headless runtime ✅

No en: chatbots de dominio para usuarios finales ❌

---

## 5. Autenticación para Usuarios Finales

### El problema

El Copilot SDK usa autenticación GitHub por defecto. Un autónomo español que busca ayuda con su IVA **no tiene ni quiere tener** cuenta de GitHub.

### Las opciones

| Método | Requiere GitHub | Ideal para |
|--------|----------------|-----------|
| **GitHub OAuth** | ✅ Sí | Productos para devs |
| **Token de entorno (GH_TOKEN)** | ✅ Sí (del operador) | CI/CD, headless |
| **BYOK (Bring Your Own Key)** | ❌ No | Productos para usuarios finales |

### BYOK en detalle

Con BYOK, el SDK se conecta directamente al provider del modelo (Azure OpenAI, OpenAI, Anthropic, Ollama) usando tu clave API. **No necesita autenticación GitHub.**

```typescript
const session = await client.createSession({
  model: "gpt-4.1",
  provider: {
    type: "azure",
    baseUrl: "https://mi-openai.openai.azure.com/",
    apiKey: process.env.AZURE_OPENAI_KEY
  }
});
```

### ¿Es bloqueante?

**No técnicamente, pero sí estratégicamente.** BYOK funciona — pero al usarlo:
- Pierdes acceso a los modelos GitHub Copilot (y sus optimizaciones para código)
- Gestionas tus propias cuotas, billing y rate limits
- El SDK se convierte en un wrapper sobre Azure OpenAI con overhead de subproceso CLI
- **La pregunta es: ¿por qué no llamar a Azure OpenAI directamente?**

### Auth para AUTONOMO.AI (lo que realmente necesitas)

```
Usuario → Login (email/password o OAuth social) → Tu backend →
  → Tu backend llama a Azure OpenAI (con tu key) → Respuesta streameada
```

No necesitas el SDK para esto. Necesitas un backend con tu propia auth y tu propia clave API.

---

## 6. Comparativa de Alternativas

### Matriz para el caso de uso específico de SS

**Contexto:** Equipo pequeño, Node.js, Azure, productos con chat para usuarios no-técnicos (autónomos, empresas), MCP para herramientas de dominio.

| Criterio | Copilot SDK + MCP | OpenAI API + Function Calling | Azure AI Agent Service | LangChain | Vercel AI SDK + MCP |
|----------|:-:|:-:|:-:|:-:|:-:|
| **Streaming a React UI** | ⚠️ Manual (WebSocket) | ⚠️ Manual (SSE) | ⚠️ Manual | ⚠️ Manual | ✅ `useChat()` nativo |
| **Latencia** | ❌ +2.5s overhead CLI | ✅ <500ms | ✅ <500ms | ⚠️ Variable | ✅ <500ms |
| **MCP nativo** | ✅ Sí | ❌ No | ❌ No (Azure tools) | ⚠️ Via adaptadores | ✅ `createMCPClient()` |
| **Multi-provider** | ✅ BYOK | ❌ Solo OpenAI | ⚠️ Azure models | ✅ 50+ providers | ✅ 25+ providers |
| **Node.js + Azure** | ✅ Sí | ✅ Sí | ✅ Nativo | ✅ Sí | ✅ Sí |
| **Auth usuarios finales** | ⚠️ BYOK requerido | ✅ Tu clave | ✅ Azure AD | ✅ Tu clave | ✅ Tu clave |
| **Complejidad setup** | ❌ Alta (CLI, subproceso) | ✅ Baja | ⚠️ Media (Azure config) | ❌ Alta (abstracciones) | ✅ Baja |
| **Madurez para chat UI** | ❌ 0 (dev tools) | ⚠️ Media | ⚠️ Media | ⚠️ Media | ✅ Alta (hooks React) |
| **Bundle size (JS)** | ❌ Grande (CLI bundled) | ✅ 34KB gzip | N/A (backend) | ❌ 101KB gzip | ⚠️ 67KB gzip |
| **Coste** | ⚠️ Copilot sub + BYOK | ✅ Solo API | ⚠️ Azure premium | ✅ Solo API | ✅ Solo API |
| **Documentación chat** | ❌ Mínima | ✅ Extensa | ⚠️ Enterprise focus | ✅ Extensa | ✅ Excelente |

### Scoring ponderado para SS

| Alternativa | Chat UI (30%) | Latencia (20%) | MCP (20%) | Simplicidad (15%) | Azure fit (15%) | **TOTAL** |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Vercel AI SDK + MCP** | 10 | 9 | 10 | 9 | 8 | **9.35** |
| **OpenAI API + FC** | 5 | 9 | 3 | 9 | 8 | **6.45** |
| **Azure AI Agent Service** | 5 | 8 | 4 | 6 | 10 | **6.20** |
| **Copilot SDK + MCP** | 2 | 4 | 10 | 4 | 7 | **4.85** |
| **LangChain** | 4 | 6 | 6 | 4 | 7 | **5.15** |

### Ganador claro: Vercel AI SDK + MCP + Azure OpenAI

**¿Por qué?**

1. **`useChat()` hook** — Streaming, estado, reconexión, abort — todo resuelto en una línea de React. Para un equipo pequeño, esto vale oro.

2. **MCP nativo** — `createMCPClient()` conecta con cualquier MCP server. Los mismos servers que construirías para el Copilot SDK funcionan aquí.

3. **Provider-agnostic** — Empieza con Azure OpenAI, migra a Anthropic o Gemini si el coste/calidad lo justifica. Cambiar es una línea de código.

4. **Azure Functions** — Microsoft tiene documentación oficial de Vercel AI SDK + Azure Functions + Cosmos DB. Es un patrón de primera clase.

5. **Zero overhead** — Sin subproceso CLI. Llamada directa a la API del modelo. Streaming nativo SSE.

6. **Comunidad** — Miles de ejemplos de chat UIs con Vercel AI SDK. Cero ejemplos de chatbots B2C con Copilot SDK.

---

## 7. Arquitectura Concreta: AUTONOMO.AI con Vercel AI SDK

### Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────┐
│                     USUARIO (Autónomo)                   │
│                     ┌──────────────┐                     │
│                     │  React PWA   │                     │
│                     │  useChat()   │                     │
│                     └──────┬───────┘                     │
│                            │ HTTPS/SSE                   │
└────────────────────────────┼─────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────┐
│              Azure Functions (Node.js)                    │
│                            │                              │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │            API Route: /api/chat                     │  │
│  │                                                     │  │
│  │  import { streamText } from 'ai';                   │  │
│  │  import { azure } from '@ai-sdk/azure';             │  │
│  │  import { createMCPClient } from '@ai-sdk/mcp';     │  │
│  │                                                     │  │
│  │  → Auth middleware (JWT/session)                     │  │
│  │  → Rate limiting por usuario                        │  │
│  │  → Conectar MCP servers                             │  │
│  │  → streamText() con tools MCP                       │  │
│  │  → Return ReadableStream                            │  │
│  └────────┬──────────────┬────────────────┬───────────┘  │
│           │              │                │               │
│  ┌────────▼───┐  ┌───────▼──────┐  ┌─────▼──────────┐   │
│  │ MCP Server │  │ MCP Server   │  │ MCP Server     │   │
│  │ Fiscal     │  │ Banca        │  │ OCR            │   │
│  │            │  │              │  │                │   │
│  │ • IVA 303  │  │ • Movimientos│  │ • Leer factura │   │
│  │ • IRPF     │  │ • Categorizar│  │ • Extraer datos│   │
│  │ • Normativa│  │ • Balances   │  │ • Parsear PDF  │   │
│  └────────────┘  └──────────────┘  └────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Azure OpenAI (GPT-4.1)                │   │
│  │              system prompt: experto fiscal ES       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Cosmos DB                              │   │
│  │  • Historial de conversaciones                      │   │
│  │  • Datos del usuario (facturas, gastos)             │   │
│  │  • Configuración fiscal                             │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Código del backend (simplificado)

```typescript
// api/chat.ts — Azure Function
import { streamText } from 'ai';
import { createAzure } from '@ai-sdk/azure';
import { createMCPClient } from '@ai-sdk/mcp';

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE,
  apiKey: process.env.AZURE_OPENAI_KEY,
});

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  // Conectar MCP servers de dominio
  const fiscalMCP = await createMCPClient({
    transport: { type: 'http', url: process.env.MCP_FISCAL_URL }
  });
  const bancaMCP = await createMCPClient({
    transport: { type: 'http', url: process.env.MCP_BANCA_URL }
  });

  const fiscalTools = await fiscalMCP.tools();
  const bancaTools = await bancaMCP.tools();

  const result = streamText({
    model: azure('gpt-4.1'),
    system: `Eres un asesor fiscal experto en España para autónomos.
      Responde SIEMPRE en español. Sé preciso con la normativa.
      Usa las herramientas disponibles para consultar datos reales
      del usuario antes de responder.`,
    messages,
    tools: { ...fiscalTools, ...bancaTools },
    maxSteps: 5, // Permitir multi-step (consultar → analizar → responder)
  });

  return result.toDataStreamResponse();
}
```

### Código del frontend (simplificado)

```tsx
// components/Chat.tsx
import { useChat } from '@ai-sdk/react';

export function ChatFiscal() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Pregunta sobre tus impuestos..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

### Auth flow para usuarios finales

```
1. Usuario → Registro (email/password) → Auth propia (no GitHub)
2. Login → JWT firmado por tu backend
3. React app envía JWT en header Authorization
4. Azure Function valida JWT → identifica usuario → carga contexto
5. La llamada a Azure OpenAI usa TU clave (no la del usuario)
6. El usuario nunca interactúa con GitHub ni con OpenAI directamente
```

### MCP Servers necesarios

| Server | Implementación | Hosting | Coste estimado |
|--------|---------------|---------|---------------|
| `mcp-fiscal-es` | Node.js + API AEAT + base de reglas fiscales | Azure Functions | €2/mo |
| `mcp-banca` | Node.js + Open Banking API (PSD2) | Azure Functions | €5/mo |
| `mcp-ocr` | Node.js + Azure Document Intelligence | Azure Functions | €10/mo (por uso) |
| **Total** | | | **~€17/mo** |

### Costes totales estimados

| Componente | Coste/mes |
|-----------|----------|
| Azure OpenAI (GPT-4.1, ~50K tokens/día) | ~€30 |
| Azure Functions (Consumption plan) | ~€5 |
| Azure Cosmos DB (serverless) | ~€5 |
| Azure Static Web Apps (frontend) | €0 (free tier) |
| MCP servers (Azure Functions) | ~€17 |
| Azure Document Intelligence (OCR) | ~€10 |
| **Total** | **~€67/mo** |

Bien dentro del presupuesto de €500/mo.

---

## 8. Recomendación Final

### Para cada producto de SS

| Producto | Motor conversacional recomendado | Razón |
|----------|--------------------------------|-------|
| **AUTONOMO.AI** | Vercel AI SDK + Azure OpenAI + MCP | Chat de dominio fiscal, usuarios no-técnicos, streaming React |
| **AccesoPulse** | Vercel AI SDK + Azure OpenAI + MCP | Chat de accesibilidad, informes, usuarios empresariales |
| **CAMBIAZO** | Vercel AI SDK + Azure OpenAI | Flujo más lineal (input → transform → output), menos chat |
| **FORJA** | **Copilot SDK** ✅ | Extensiones Copilot, dev tools, marketplace — aquí SÍ tiene sentido |
| **Squad headless** | **Copilot SDK** ✅ | Orquestación de agentes de código — exactamente para lo que fue diseñado |

### El veredicto brutal

1. **El Copilot SDK es excelente** — para lo que fue diseñado: agentes de código, developer tools, extensiones del ecosistema Copilot.

2. **El Copilot SDK NO es la herramienta correcta** para chatbots de dominio B2C. Añade un subproceso CLI innecesario, tiene zero soporte para UI de chat, requiere BYOK que anula su valor añadido, y nadie en el mundo lo está usando para esto.

3. **Vercel AI SDK es la respuesta correcta** para SS. Node.js nativo, React hooks para streaming, MCP nativo, provider-agnostic, documentación excelente para chat UIs, funciona con Azure Functions, y es lo que la industria usa para exactamente este caso de uso.

4. **MCP es el verdadero activo.** Los MCP servers de dominio que SS construya (fiscal, banca, WCAG, OCR) son reutilizables con CUALQUIER framework. Invierte en los servers MCP, no en el SDK que los conecta.

5. **Estrategia dual:** Usa Vercel AI SDK para productos de usuario final (AUTONOMO.AI, AccesoPulse, CAMBIAZO) y Copilot SDK para productos de developer (FORJA, Squad). No es uno u otro — son herramientas para problemas diferentes.

### Próximos pasos concretos

1. **Semana 1:** PoC de Vercel AI SDK + Azure OpenAI + un MCP server dummy (€0, unas horas)
2. **Semana 2:** MCP server `mcp-fiscal-es` con 3-4 tools básicas (reglas IVA trimestral)
3. **Semana 3:** UI de chat React con `useChat()`, streaming, historial en Cosmos DB
4. **Semana 4:** Integración con Open Banking API para datos bancarios reales
5. **En paralelo (FORJA):** Copilot SDK hello world + extensión Copilot básica

---

## Referencias

### Copilot SDK
- [GitHub Copilot SDK — Repositorio oficial](https://github.com/github/copilot-sdk)
- [Copilot SDK Docs — Getting Started](https://docs.github.com/en/copilot/how-tos/copilot-sdk/sdk-getting-started)
- [BYOK Authentication](https://docs.github.com/en/copilot/how-tos/copilot-sdk/authenticate-copilot-sdk/bring-your-own-key)
- [Streaming Events](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/streaming-events)
- [Sessions and Conversations — DeepWiki](https://deepwiki.com/github/copilot-sdk/4.2-sessions-and-conversations)
- [Copilot SDK Performance — 33% Latency Cut](https://blog.jztan.com/i-profiled-the-copilot-sdk-33-percent-latency-avoidable/)
- [Deployment Patterns and Scaling — DeepWiki](https://deepwiki.com/github/copilot-sdk/10.7-deployment-patterns-and-scaling)
- [microsoft/copilot-sdk-samples](https://github.com/microsoft/copilot-sdk-samples)

### Vercel AI SDK
- [Vercel AI SDK — Documentación oficial](https://v6.ai-sdk.dev/docs/introduction)
- [MCP Tools con Vercel AI SDK](https://ai-sdk.dev/cookbook/node/mcp-tools)
- [Vercel AI SDK + Azure Cosmos DB](https://devblogs.microsoft.com/cosmosdb/building-ai-powered-apps-azure-cosmos-db-vercel-ai-sdk/)
- [Vercel AI SDK Complete Guide](https://pockit.tools/blog/vercel-ai-sdk-nextjs-guide/)
- [vercel-labs/mcp-to-ai-sdk](https://github.com/vercel-labs/mcp-to-ai-sdk)
- [Vercel AI SDK 6 — Tool Approval](https://martinuke0.github.io/posts/2026-01-06-vercel-ai-sdk-6-revolutionizing-ai-agent-development-with-tool-approval-and-more/)

### MCP (Model Context Protocol)
- [MCP vs OpenAI Function Calling vs LangChain Tools](https://docs.gostoa.dev/blog/mcp-vs-openai-function-calling-vs-langchain)
- [MCP Is Winning — Technical Breakdown](https://www.machinebrief.com/article/mcp-is-winning-technical-breakdown-model-context-protocol)
- [Azure Functions + Remote MCP](https://techcommunity.microsoft.com/blog/appsonazureblog/build-ai-agent-tools-using-remote-mcp-with-azure-functions/4401059)

### Comparativas
- [LangChain vs Vercel AI SDK vs OpenAI SDK — 2026 Guide](https://strapi.io/blog/langchain-vs-vercel-ai-sdk-vs-openai-sdk-comparison-guide)
- [Choosing the Right AI SDK: Foundry vs Copilot vs OpenAI](https://htek.dev/articles/choosing-the-right-ai-sdk/)
- [GitHub Copilot SDK vs Azure AI Foundry Agents](https://dev.to/vevarunsharma/github-copilot-sdk-vs-azure-ai-foundry-agents-which-one-should-your-company-use-1n7n)

### Arquitectura
- [Building Real Apps with Copilot SDK in C#](https://www.devleader.ca/2026/03/03/building-real-apps-with-github-copilot-sdk-in-c-endtoend-patterns-and-architecture)
- [Managing Sessions and Context — Copilot SDK C#](https://www.devleader.ca/2026/03/21/managing-sessions-and-context-in-github-copilot-sdk-for-c-patterns-and-best-practices)
- [Building Agents with Copilot SDK — MS Tech Community](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/building-agents-with-github-copilot-sdk-a-practical-guide-to-automated-tech-upda/4488948)
