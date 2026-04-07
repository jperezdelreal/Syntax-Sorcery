# 🧪 PoC — Vercel AI SDK + Azure OpenAI como Motor Conversacional

> **Autor:** Trinity (Full-Stack Developer)  
> **Fecha:** 2026-07-08  
> **Estado:** PoC funcional — listo para probar  
> **Comparar con:** `poc/copilot-sdk-chat/` (mismo ejercicio con Copilot SDK)

---

## ¿Qué es esto?

Prueba de concepto del [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` package) conectado a Azure OpenAI (o OpenAI estándar como fallback). Tres scripts que replican exactamente el PoC del Copilot SDK para comparación directa.

## Requisitos

- **Node.js 18+**
- **Credenciales de IA** — una de:
  - Azure OpenAI: `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_RESOURCE_NAME`
  - OpenAI: `OPENAI_API_KEY`
- **No necesita** Copilot CLI, ni GitHub auth, ni suscripción Copilot

## Instalación

```bash
cd poc/vercel-ai-chat
npm install

# Configurar credenciales (copiar y editar)
cp .env.example .env
# Editar .env con tus claves
```

## Scripts

### 1. `index.js` — Chat Básico con Streaming

```bash
node index.js
```

La interacción más simple: `streamText()` + `for await`. **Una sola llamada**, sin crear clientes, sin sesiones, sin event listeners.

### 2. `multi-turn.js` — FiscalBot Multi-Turno

```bash
node multi-turn.js
```

Mismo FiscalBot (asesor fiscal español) que el PoC de Copilot SDK. Tres turnos idénticos. La diferencia clave: **tú gestionas el array de mensajes** en lugar de que el SDK lo haga automáticamente.

### 3. `with-tools.js` — Chat con Herramientas Custom

```bash
node with-tools.js
```

Mismas 3 herramientas (consultar_iva, calcular_retencion_irpf, buscar_facturas) con mismos datos mock. **Ventaja clave:** el modelo SOLO tiene acceso a tus tools — no hay built-ins que compitan (problema real del Copilot SDK).

---

## 📊 Comparativa: Vercel AI SDK vs Copilot SDK

### Líneas de código (código real, sin comentarios ni blancos)

| Script | Copilot SDK | Vercel AI SDK | Diferencia |
|--------|:-----------:|:-------------:|:----------:|
| `index.js` (chat básico) | 32 | 24 | **Vercel -25%** |
| `multi-turn.js` | 62 | 59 | ~igual |
| `with-tools.js` | 204 | 255 | Copilot -20%* |
| `lib/provider.js` | — | 40 | Solo Vercel |
| **Total** | **298** | **378** | Copilot -21% |

\* El Copilot SDK tiene menos código en tools porque `defineTool()` + `approveAll` es más compacto. Pero Vercel incluye `maxSteps` loop automático (tool → result → respuesta) que el SDK de Copilot gestiona internamente de forma opaca.

> **Veredicto:** Más código en Vercel, pero más **explícito y controlable**. El Copilot SDK esconde complejidad (bueno para PoC, arriesgado para producción).

### Startup y latencia

| Métrica | Copilot SDK | Vercel AI SDK |
|---------|:-----------:|:-------------:|
| **Cold start** | ~2.5s (spawn CLI + crear sesión) | <100ms (import + API call) |
| **Primera respuesta** | ~3-4s (overhead + inference) | <1s (solo inference) |
| **Teardown** | `disconnect()` + `stop()` obligatorio | Nada — sin subproceso |
| **Proceso residual** | CLI como subproceso mientras dure la sesión | Ninguno |

> **Veredicto:** Vercel AI SDK es **25-40x más rápido** en cold start. Para B2C donde cada milisegundo cuenta, no hay debate.

### Soporte de herramientas (Tools)

| Aspecto | Copilot SDK | Vercel AI SDK |
|---------|:-----------:|:-------------:|
| **Definición** | `defineTool()` + Zod | `tool()` + Zod |
| **Built-in tools** | Sí (filesystem, Git, terminal, web) | No — solo los que tú defines |
| **¿Compiten con custom?** | ⚠️ **Sí** — el agente puede preferir built-ins | ✅ **No** — solo tus tools |
| **Tool loop automático** | Opaco (dentro del agente) | `maxSteps` explícito |
| **MCP nativo** | ✅ Sí | ✅ Sí (`experimental_createMCPClient`) |
| **Tool results en stream** | Via eventos | Via `onStepFinish` callback |

> **Veredicto:** Vercel gana en **predecibilidad** — tus tools son los únicos disponibles. El Copilot SDK sufre del problema "agente prefiere built-ins" documentado en nuestro PoC.

### Flexibilidad y ecosistema

| Aspecto | Copilot SDK | Vercel AI SDK |
|---------|:-----------:|:-------------:|
| **Providers** | GitHub Copilot (o BYOK) | 25+ (OpenAI, Azure, Anthropic, Google, Mistral...) |
| **Cambiar modelo** | Por sesión (`model: "gpt-4.1"`) | Por llamada (cualquier provider) |
| **React hooks** | ❌ No | ✅ `useChat()`, `useCompletion()`, `useAssistant()` |
| **Framework support** | Node.js solo | Next.js, Nuxt, SvelteKit, Express, Hono... |
| **Streaming protocol** | JSON-RPC propietario | Estándar (SSE, Data Stream Protocol) |

> **Veredicto:** Vercel AI SDK es **incomparablemente más flexible**. Un cambio de modelo es un cambio de import.

### Producción

| Aspecto | Copilot SDK | Vercel AI SDK |
|---------|:-----------:|:-------------:|
| **Madurez** | v0.2.x — pre-release | v4.x — producción |
| **Usuarios en prod** | Desconocido (mayormente dev tools) | Miles (v0, ChatGPT clones, SaaS) |
| **Documentación** | Básica (getting started) | Extensa (guías, ejemplos, cookbook) |
| **Edge/Serverless** | ❌ Requiere proceso persistente | ✅ Funciona en edge/serverless |
| **Observabilidad** | Limitada | OpenTelemetry nativo |
| **Rate limiting** | Premium requests de Copilot | Tu cuota de Azure/OpenAI (controlable) |

> **Veredicto:** Vercel AI SDK está en **producción activa** en miles de apps. El Copilot SDK es pre-release y orientado a dev tools.

### Coste

| Concepto | Copilot SDK | Vercel AI SDK |
|---------|:-----------:|:-------------:|
| **Modelo** | Copilot premium requests ($0.04/req) | Azure OpenAI (pay-per-token) |
| **3 turnos FiscalBot** | ~$0.12 (3 premium requests) | ~$0.01-0.03 (tokens reales) |
| **100 usuarios/día × 5 msgs** | ~$20/día (500 premium reqs) | ~$2-5/día (tokens) |
| **Scaling** | Limitado por plan Copilot | Ilimitado (tu crédito Azure) |
| **Overhead** | CLI subprocess = más RAM | Solo Node.js process |

> **Veredicto:** Vercel AI SDK es **4-10x más barato** a escala porque pagas tokens reales, no premium requests con overhead fijo.

---

## 🏆 Conclusión

| Para... | Usa... | Por qué |
|---------|--------|---------|
| **Productos B2C** (AUTONOMO.AI, AccesoPulse) | **Vercel AI SDK** | Más rápido, más barato, React hooks, sin overhead |
| **Dev tools** (FORJA, extensiones Copilot) | **Copilot SDK** | Acceso a herramientas de código, integración GitHub |
| **Squad headless** | **Copilot SDK** | Diseñado para orquestación de agentes |

La investigación de Oracle (ver `docs/research/copilot-sdk-chat-patterns.md`) y estos dos PoCs confirman lo mismo: **Copilot SDK es para developers, Vercel AI SDK es para usuarios finales.**

---

## Estructura del Proyecto

```
poc/vercel-ai-chat/
├── package.json          # ai + @ai-sdk/openai + @ai-sdk/azure
├── .env.example          # Template de credenciales
├── README.md             # Este archivo
├── lib/
│   └── provider.js       # Selección Azure OpenAI / OpenAI
├── index.js              # Chat básico con streaming
├── multi-turn.js         # FiscalBot multi-turno
└── with-tools.js         # Chat con herramientas custom
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `No se encontraron credenciales` | Copia `.env.example` a `.env` y rellena tus claves |
| `401 Unauthorized` | Verifica que tu API key es válida |
| `404 Deployment not found` | Para Azure: verifica `AZURE_OPENAI_DEPLOYMENT` coincide con tu deployment |
| `Module not found` | Ejecuta `npm install` en este directorio |
| `Rate limited` | Espera o ajusta tu cuota en el portal Azure/OpenAI |
