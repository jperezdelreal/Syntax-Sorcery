# Vercel AI SDK + Azure OpenAI — Investigación para Productos SS

> **Autor:** Oracle (Product & Docs)  
> **Fecha:** 2026-07-08  
> **Estado:** Investigación completa  
> **Solicitado por:** joperezd  
> **Input:** `docs/research/copilot-sdk-chat-patterns.md` (recomendó este stack)

---

## TLDR

**Sí, SS puede construir AUTONOMO.AI con este stack. Es la opción correcta.** El Vercel AI SDK v6 es un toolkit TypeScript gratuito (Apache 2.0) con soporte nativo para Azure OpenAI (`@ai-sdk/azure`), integración MCP de primera clase, streaming token-por-token con hooks React (`useChat`), y tool calling con schemas Zod. Corre en cualquier runtime Node.js — incluyendo Azure Container Apps (recomendado) o Azure Functions. No requiere Vercel para hosting. Coste estimado para 1.000 usuarios/mes con 10 queries/día: **~€35-85/mes** usando GPT-4o-mini, dentro del presupuesto de €500/mo. Un prototipo funcional se puede tener en **2-3 días** con 3 paquetes npm y <50 líneas de código.

---

## 1. ¿Qué es el Vercel AI SDK?

### 1.1 Definición

El **Vercel AI SDK** es un toolkit TypeScript/JavaScript para construir aplicaciones potenciadas por IA. A pesar del nombre "Vercel", **no requiere Vercel para hosting** — es una librería npm que corre en cualquier entorno Node.js.

### 1.2 Estado Actual

| Aspecto | Detalle |
|---------|---------|
| **Versión** | v6.x (6.0.92+, febrero 2026) |
| **Licencia** | Apache 2.0 (no MIT — permite uso comercial sin restricciones) |
| **Paquete npm** | `ai` (core) + providers (`@ai-sdk/azure`, `@ai-sdk/openai`, etc.) |
| **Repositorio** | [github.com/vercel/ai](https://github.com/vercel/ai) |
| **Frameworks** | Next.js, React, Svelte, Vue, Angular, Node.js puro |
| **Providers** | 100+ modelos via AI Gateway (OpenAI, Azure, Anthropic, Google, Mistral, xAI, Groq, etc.) |
| **Madurez** | Producción. Usado por miles de apps. Documentación excelente. |

### 1.3 Capacidades Core

1. **API Unificada** — Una interfaz para todos los providers. Cambiar de OpenAI a Azure = cambiar un string.
2. **Streaming nativo** — `streamText()`, `streamObject()` devuelven streams HTTP listos para consumir.
3. **Tool Calling** — `tool()` con schemas Zod, type-safe, multi-step automático con `maxSteps`.
4. **Structured Output** — `generateObject()` fuerza respuestas JSON con schema strict.
5. **Agentes (v6)** — `ToolLoopAgent` para workflows multi-herramienta, multi-paso.
6. **Hooks UI** — `useChat()`, `useCompletion()` para React/Svelte/Vue con streaming zero-config.
7. **MCP nativo** — Cliente MCP integrado + adaptador para servir como servidor MCP.
8. **Observabilidad** — Métricas, costes, latencia integrados (opcional via AI Gateway).

### 1.4 Qué abstrae vs API directa

| Sin SDK (API directa Azure) | Con Vercel AI SDK |
|-----|-----|
| Gestionar HTTP requests manualmente | `generateText()` / `streamText()` |
| Parsear SSE streams | `.toDataStreamResponse()` automático |
| Definir tools como JSON Schema | `tool()` con Zod (type-safe + runtime validation) |
| Gestionar multi-step tool loops | `maxSteps: 5` y el SDK itera solo |
| Construir hooks React desde cero | `useChat()` listo para usar |
| Manejar errores, retries, timeouts | Built-in con configuración |
| Cambiar provider = reescribir | Cambiar `openai('gpt-4o')` por `azure('mi-deploy')` |

**Veredicto:** El SDK ahorra ~2-4 semanas de boilerplate y convierte cambios de provider en cambios de una línea.

---

## 2. Integración con Azure OpenAI

### 2.1 Configuración

```bash
npm install ai @ai-sdk/azure zod
```

```env
# .env
AZURE_API_KEY=tu-api-key-de-azure
AZURE_RESOURCE_NAME=ss-openai          # nombre del recurso en Azure Portal
AZURE_API_VERSION=2024-12-01-preview   # o la versión que uses
```

### 2.2 Código Mínimo

```typescript
import { azure } from '@ai-sdk/azure';
import { generateText } from 'ai';

const { text } = await generateText({
  model: azure('gpt-4o-mini-deploy'),  // ⚠️ nombre del DEPLOYMENT, no del modelo
  prompt: '¿Cuánto IVA pago como autónomo en España?',
});
```

### 2.3 Configuración Avanzada (Custom Provider)

```typescript
import { createAzure } from '@ai-sdk/azure';

const azureProvider = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: '2024-12-01-preview',
  // baseURL: override si usas endpoint custom
});

// Uso
const result = await streamText({
  model: azureProvider('gpt-4o-mini-deploy'),
  messages: conversationHistory,
});
```

### 2.4 Diferencias Clave vs OpenAI Directo

| Aspecto | OpenAI Directo | Azure OpenAI via SDK |
|---------|---------------|---------------------|
| **Endpoint** | api.openai.com | `<resource>.openai.azure.com` |
| **Modelo** | Nombre del modelo (`gpt-4o`) | Nombre del **deployment** (custom) |
| **Auth** | API key de OpenAI | API key de Azure |
| **Compliance** | Limitado | Enterprise (GDPR, HIPAA posible) |
| **SLA** | No garantizado | SLA Azure (99.9%) |
| **Red** | Internet público | VNet, Private Endpoints posible |
| **Coste** | Pay-as-you-go OpenAI | Pay-as-you-go Azure (mismo precio base) |

### 2.5 Autenticación para Usuarios Finales

**Crítico para AUTONOMO.AI:** Los usuarios NO necesitan cuenta Azure ni API key. La arquitectura es:

```
Usuario (email/password) → Tu App (Next.js/Express) → Tu API → Vercel AI SDK → Azure OpenAI
                                                                                    ↑
                                                                              TU API key (servidor)
```

La API key de Azure vive **solo en el servidor**. Los usuarios se autentican con tu sistema (Auth0, Clerk, NextAuth, Azure AD B2C — lo que SS elija). Zero dependencia de GitHub o Microsoft para el end user.

---

## 3. MCP y Herramientas

### 3.1 MCP en Vercel AI SDK — Soporte Nativo

A partir de v5+, el SDK tiene integración MCP de primera clase:

- **Como cliente MCP:** Conecta a servidores MCP existentes y expone sus tools al modelo.
- **Como servidor MCP:** Usa `@vercel/mcp-adapter` para exponer tus tools como servidor MCP.
- **Transportes soportados:** Streamable HTTP (recomendado), SSE (legacy), STDIO (local/CLI).

### 3.2 Conectar un Servidor MCP

```typescript
import { experimental_createMCPClient as createMCPClient } from 'ai';

// Conectar al servidor MCP fiscal de SS
const mcpClient = await createMCPClient({
  transport: {
    type: 'sse',
    url: 'https://ss-mcp-fiscal.azurewebsites.net/mcp',
  },
});

// Obtener tools del servidor MCP
const mcpTools = await mcpClient.tools();

// Usar en una llamada al modelo
const result = await generateText({
  model: azure('gpt-4o-mini-deploy'),
  tools: {
    ...mcpTools,               // Tools MCP (banco, fiscal, facturas)
    ...localTools,             // Tools locales (cálculos, formateo)
  },
  prompt: 'Calcula mis impuestos del Q3',
});
```

### 3.3 Tool Calling Nativo del SDK

Para tools que no necesitan MCP (lógica interna de la app):

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const calculaIVA = tool({
  description: 'Calcula el IVA para un autónomo español',
  parameters: z.object({
    baseImponible: z.number().describe('Importe sin IVA en euros'),
    tipoIVA: z.enum(['general', 'reducido', 'superreducido']).default('general'),
  }),
  execute: async ({ baseImponible, tipoIVA }) => {
    const tasas = { general: 0.21, reducido: 0.10, superreducido: 0.04 };
    const iva = baseImponible * tasas[tipoIVA];
    return { baseImponible, tipoIVA, iva, total: baseImponible + iva };
  },
});
```

### 3.4 Comparativa: Tool APIs

| Aspecto | Vercel `tool()` | OpenAI Function Calling | MCP Tools |
|---------|----------------|------------------------|-----------|
| **Schema** | Zod (TypeScript) | JSON Schema manual | JSON Schema |
| **Type-safety** | ✅ Compile-time | ❌ Runtime only | ❌ Runtime only |
| **Ejecución** | En tu proceso | Requiere handling manual | En servidor MCP separado |
| **Multi-step** | `maxSteps` automático | Loop manual | Depende del cliente |
| **Validación** | Zod runtime | Manual | JSON Schema |
| **Compartible** | Solo esta app | Solo esta app | ✅ Cualquier cliente MCP |

### 3.5 Estrategia para SS: Híbrido

**Recomendación:** Usar **ambos** sistemas:

- **`tool()` nativo** para lógica interna de cada producto (cálculos, formateo, validaciones).
- **MCP servers** para datos de dominio compartidos entre productos:
  - `ss-mcp-banco` — Conexión a datos bancarios (Open Banking API)
  - `ss-mcp-fiscal` — Reglas tributarias, modelos AEAT, obligaciones
  - `ss-mcp-facturas` — Generación y consulta de facturas
  - `ss-mcp-wcag` — Escaneo de accesibilidad (para AccesoPulse)

Los servidores MCP se despliegan como Azure Container Apps independientes. Cada producto (AUTONOMO.AI, AccesoPulse, CAMBIAZO) conecta a los que necesite. **Esto es un moat**: infraestructura de herramientas MCP reutilizable.

---

## 4. Streaming y UI

### 4.1 Streaming Server-Side

```typescript
// API Route (Next.js, Express, o Azure Function)
import { streamText } from 'ai';
import { azure } from '@ai-sdk/azure';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: azure('gpt-4o-mini-deploy'),
    system: 'Eres FiscalBot, asistente fiscal para autónomos españoles.',
    messages,
    tools: { calculaIVA, consultaModelo303 },
    maxSteps: 5,
  });
  
  return result.toDataStreamResponse(); // Stream HTTP directo
}
```

### 4.2 React — `useChat` (Recomendado)

```tsx
'use client';
import { useChat } from '@ai-sdk/react';

export function ChatAutonomo() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',  // Apunta a tu API route
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role === 'user' ? 'Tú' : 'FiscalBot'}:</strong>
          {msg.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} disabled={isLoading} />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
```

**Lo que `useChat` gestiona automáticamente:**
- Estado de mensajes (historial completo)
- Streaming token-por-token (actualiza UI en real-time)
- Loading states
- Abort/cancel
- Error handling
- Envío de historial al servidor en cada request

### 4.3 Non-React Frontend (Vanilla JS, Vue, Svelte)

El servidor es idéntico. Solo cambia el cliente:

```javascript
// Vanilla JS — consume el mismo stream
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
  headers: { 'Content-Type': 'application/json' },
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  document.getElementById('response').textContent += chunk;
}
```

También hay hooks oficiales para **Svelte** (`@ai-sdk/svelte`) y **Vue** (`@ai-sdk/vue`).

### 4.4 Server-Side Streaming en Azure

| Hosting | Streaming HTTP | Notas |
|---------|---------------|-------|
| **Azure Container Apps** | ✅ Completo | SSE, WebSocket, long-lived connections. **Recomendado.** |
| **Azure Functions** | ⚠️ Limitado | Timeouts (230s max), cold starts. Funciona para requests cortos. |
| **Azure App Service** | ✅ Sí | WebSocket support. Más caro que Container Apps. |
| **Vercel** | ✅ Nativo | Pero SS usa Azure, no Vercel. |

---

## 5. Arquitectura: AUTONOMO.AI

### 5.1 Diagrama

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIOS                                  │
│  (autónomos españoles, browser o mobile)                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND (Azure Static Web Apps)                    │
│                                                                  │
│  React/Next.js  ←──  useChat()  ←──  @ai-sdk/react             │
│  Auth UI (login/signup)                                          │
│  Dashboard autónomo                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS (API calls)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           BACKEND API (Azure Container Apps)                     │
│                                                                  │
│  Node.js/Express o Next.js API Routes                           │
│  ├── Auth middleware (JWT via Auth0/Clerk/Azure AD B2C)         │
│  ├── Rate limiting (por usuario)                                │
│  ├── Vercel AI SDK (streamText, generateText, tool)             │
│  │   ├── @ai-sdk/azure → Azure OpenAI (GPT-4o-mini)           │
│  │   └── tools: calculaIVA, formatFactura, etc.                │
│  └── Persistencia conversaciones (Cosmos DB / PostgreSQL)       │
└────────┬───────────────────────────────────┬────────────────────┘
         │ MCP (Streamable HTTP)             │ API calls
         ▼                                   ▼
┌────────────────────┐              ┌──────────────────┐
│  MCP Servers        │              │  Azure OpenAI     │
│  (Container Apps)   │              │  Service          │
│                     │              │                   │
│  ss-mcp-fiscal      │              │  GPT-4o-mini      │
│  ss-mcp-banco       │              │  (deployment)     │
│  ss-mcp-facturas    │              │                   │
└────────────────────┘              └──────────────────┘
```

### 5.2 Dónde Ejecuta el SDK

| Componente | Ejecuta en... | Por qué |
|-----------|--------------|---------|
| `@ai-sdk/azure` | **Servidor** (Container App) | La API key NUNCA sale del servidor |
| `streamText()` | **Servidor** | Genera el stream HTTP |
| `useChat()` | **Cliente** (browser) | Consume el stream, gestiona UI |
| `tool()` | **Servidor** | Ejecuta lógica de negocio |
| MCP Client | **Servidor** | Conecta a servidores MCP |

### 5.3 Gestión de Historial / Memoria

El SDK **no persiste conversaciones automáticamente** — esto es intencional (flexibilidad). Opciones para SS:

| Opción | Complejidad | Recomendación |
|--------|------------|---------------|
| **Azure Cosmos DB** | Media | ✅ Para producción. Escala global, TTL automático. |
| **PostgreSQL (Azure DB)** | Media | ✅ Si ya usas Postgres. Schema atómico por mensaje. |
| **Redis (Azure Cache)** | Baja | Para caché de sesión. No como almacén principal. |
| **In-memory** | Cero | Solo para prototipo. Se pierde al reiniciar. |

**Patrón recomendado:**
1. Frontend envía mensajes via `useChat()` → API
2. API guarda cada mensaje en DB (user_id + conversation_id + message)
3. API carga historial de DB, envía al modelo con `messages: [...]`
4. Compactación: cuando historial > 20 mensajes, resumir los antiguos con un prompt de summarización

### 5.4 Auth para Usuarios Finales

**No se necesita GitHub.** Opciones:

| Solución | Coste | Notas |
|----------|-------|-------|
| **Azure AD B2C** | Gratis hasta 50K MAU | ✅ Recomendado. Ya estamos en Azure. Social login (Google, Apple). |
| **Auth0** | Gratis hasta 7.5K MAU | Alternativa sólida. |
| **Clerk** | Gratis hasta 10K MAU | DX excelente para React/Next.js. |
| **NextAuth.js** | Gratis (OSS) | Si usas Next.js. Más manual. |

### 5.5 Deploy en Azure (No Vercel)

**Confirmado: funciona perfectamente en Azure.** El SDK es una librería npm — no tiene dependencia de la plataforma Vercel.

```dockerfile
# Dockerfile para AUTONOMO.AI backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Deploy:**
```bash
# Build & push a Azure Container Registry
az acr build --registry ssregistry --image autonomo-api:latest .

# Deploy a Container Apps
az containerapp create \
  --name autonomo-api \
  --resource-group ss-production \
  --image ssregistry.azurecr.io/autonomo-api:latest \
  --env-vars AZURE_API_KEY=secretref:azure-key \
             AZURE_RESOURCE_NAME=ss-openai \
  --ingress external --target-port 3000
```

---

## 6. Análisis de Costes

### 6.1 Escenario: 1.000 usuarios/mes, 10 queries/día

**Supuestos:**
- 1.000 usuarios activos × 10 queries/día × 30 días = **300.000 queries/mes**
- Cada query: ~500 tokens input (prompt + historial) + ~300 tokens output = ~800 tokens total
- Modelo: **GPT-4o-mini** (optimizado para coste)

### 6.2 Desglose

| Componente | Cálculo | Coste/Mes |
|-----------|---------|-----------|
| **Vercel AI SDK** | Apache 2.0 — gratuito | **€0** |
| **Azure OpenAI (GPT-4o-mini)** | | |
| → Input tokens | 300K queries × 500 tokens = 150M tokens × $0.15/1M | **~€22** |
| → Output tokens | 300K queries × 300 tokens = 90M tokens × $0.60/1M | **~€50** |
| **Azure Container Apps** | | |
| → Compute | ~0.25 vCPU, 0.5 GiB (mayoría gratis en tier consumo) | **~€5-15** |
| → Requests | 300K requests (dentro de los 2M gratis) | **€0** |
| **Azure Cosmos DB** | Serverless, ~300K writes/reads | **~€5-10** |
| **Azure Static Web Apps** | Tier gratuito | **€0** |
| **Auth (Azure AD B2C)** | 1.000 MAU — gratuito hasta 50K | **€0** |
| | | |
| **TOTAL ESTIMADO** | | **~€35-85/mes** |

### 6.3 Comparativa de Modelos

| Modelo | Input/1M tokens | Output/1M tokens | Coste estimado (escenario) | Calidad |
|--------|----------------|-------------------|---------------------------|---------|
| **GPT-4o-mini** | $0.15 | $0.60 | ~€72/mes | Buena para Q&A fiscal |
| **GPT-4.1-mini** | $0.40 | $1.60 | ~€200/mes | Mejor razonamiento, 1M context |
| **GPT-4o** | $2.50 | $10.00 | ~€1.275/mes | Overkill para la mayoría de queries |
| **GPT-4.1** | $2.00 | $8.00 | ~€1.020/mes | Para consultas complejas |

**Recomendación:** Empezar con **GPT-4o-mini** para el 90% de queries. Routing inteligente: queries complejas → GPT-4.1-mini. Esto mantiene el coste bajo €100/mes.

### 6.4 Escalabilidad de Costes

| Usuarios/Mes | Queries/Mes | Coste Azure OpenAI (4o-mini) | Coste Total Estimado |
|--------------|-------------|------------------------------|---------------------|
| 100 | 30K | ~€7 | ~€15-25 |
| 1.000 | 300K | ~€72 | ~€85-100 |
| 5.000 | 1.5M | ~€360 | ~€400-450 |
| 10.000 | 3M | ~€720 | ~€780-850 |

**Conclusión:** Con el presupuesto de €500/mo de SS, se pueden servir **~3.000-5.000 usuarios activos** con GPT-4o-mini. Suficiente para validar producto y primeros clientes.

---

## 7. Alternativas

### 7.1 Azure AI Agent Service (Preview)

| Aspecto | Detalle |
|---------|---------|
| **Qué es** | Plataforma agéntica de Azure. Sucesor de Assistants API. |
| **Ventajas** | Threads nativos (persistencia automática), múltiples modelos (OpenAI + OSS), compliance enterprise, herramientas built-in (code interpreter, web search). |
| **Desventajas** | Aún en preview. Sin hooks React. Sin streaming UI. Lock-in Azure. API más compleja. |
| **¿Resuelve todo?** | **No.** No tiene capa UI. Necesitarías Vercel AI SDK o similar para el frontend igualmente. |
| **Veredicto para SS** | ⚠️ Monitorizar. Puede ser interesante cuando salga de preview para el backend agéntico, pero hoy el SDK de Vercel es más maduro y flexible. |

### 7.2 OpenAI Assistants API

| Aspecto | Detalle |
|---------|---------|
| **Estado** | **DEPRECADO.** Sunset en Azure: julio 2025. OpenAI: agosto 2026. |
| **Veredicto** | ❌ No empezar proyectos nuevos aquí. |

### 7.3 Chat-as-a-Service (Chatbase, Botpress, Voiceflow)

| Aspecto | Detalle |
|---------|---------|
| **Ventajas** | Cero código. UI incluida. Rápido de lanzar. |
| **Desventajas** | Sin control sobre UX, limitados en tools custom, vendor lock-in, pricing por mensaje caro a escala, no puedes ofrecer como producto propio fácilmente. |
| **Veredicto para SS** | ❌ SS construye productos de software, no usa plataformas no-code. Además, los márgenes de reventa son malos. |

### 7.4 LangChain / LlamaIndex

| Aspecto | Detalle |
|---------|---------|
| **Ventajas** | Ecosistema Python enorme. RAG avanzado. Agentes sofisticados. |
| **Desventajas** | Python (SS es TypeScript-first). Overhead de abstracción. Sin hooks UI. Más complejo que Vercel AI SDK para el caso de uso de SS. |
| **Veredicto** | Si SS necesitara RAG avanzado o pipelines ML complejos, sí. Para chat con tools, Vercel AI SDK es más directo. |

### 7.5 Tabla Resumen

| Solución | UI | Tools/MCP | Azure Deploy | Madurez | Para SS |
|----------|-----|-----------|--------------|---------|---------|
| **Vercel AI SDK** | ✅ useChat | ✅ Nativo | ✅ | Producción | ✅ **Recomendado** |
| Azure AI Agent Service | ❌ Build your own | ✅ | ✅ Nativo | Preview | ⚠️ Futuro |
| OpenAI Assistants | ❌ | ✅ Limitado | ⚠️ Deprecated | Sunset | ❌ |
| Chatbase/Botpress | ✅ Incluida | ⚠️ Limitado | ❌ | Producción | ❌ |
| LangChain (Python) | ❌ | ✅ | ✅ | Producción | ❌ (no TypeScript) |

---

## 8. Guía de Inicio Rápido

### 8.1 Paso 1: Setup del Proyecto

```bash
# Crear proyecto Next.js (o Express si prefieres)
npx create-next-app@latest autonomo-ai --typescript --app --tailwind
cd autonomo-ai

# Instalar dependencias
npm install ai @ai-sdk/azure zod
```

### 8.2 Paso 2: Configurar Azure OpenAI

```bash
# En Azure Portal:
# 1. Crear recurso "Azure OpenAI Service" (si no existe)
# 2. Ir a "Model deployments" → Deploy model → gpt-4o-mini
# 3. Anotar: deployment name, resource name, API key
```

```env
# .env.local
AZURE_API_KEY=sk-abc123...
AZURE_RESOURCE_NAME=ss-openai
```

### 8.3 Paso 3: API Route (Servidor)

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { createAzure } from '@ai-sdk/azure';

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: azure('gpt-4o-mini-deploy'),  // Tu deployment name
    system: `Eres FiscalBot, un asistente experto en fiscalidad para autónomos españoles. 
             Responde siempre en español. Sé conciso pero preciso.
             Si no estás seguro de algo, dilo claramente.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 8.4 Paso 4: UI de Chat (Cliente)

```tsx
// app/page.tsx
'use client';
import { useChat } from '@ai-sdk/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AUTONOMO.AI — Tu Asistente Fiscal</h1>
      
      <div className="space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded ${
            msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <strong>{msg.role === 'user' ? 'Tú' : '🤖 FiscalBot'}: </strong>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Pregunta sobre tus impuestos..."
          className="flex-1 border rounded p-2"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded">
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
    </main>
  );
}
```

### 8.5 Paso 5: Primera Tool MCP

```typescript
// app/api/chat/route.ts (actualizado con tool)
import { streamText, tool } from 'ai';
import { createAzure } from '@ai-sdk/azure';
import { z } from 'zod';

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

const calculaIVA = tool({
  description: 'Calcula el IVA para una factura de autónomo',
  parameters: z.object({
    base: z.number().describe('Importe base sin IVA en euros'),
    tipo: z.enum(['general', 'reducido', 'superreducido']).default('general'),
    retencionIRPF: z.boolean().default(true).describe('Si aplica retención IRPF del 15%'),
  }),
  execute: async ({ base, tipo, retencionIRPF }) => {
    const tasas = { general: 0.21, reducido: 0.10, superreducido: 0.04 };
    const iva = base * tasas[tipo];
    const irpf = retencionIRPF ? base * 0.15 : 0;
    return {
      base,
      iva: iva.toFixed(2),
      irpf: irpf.toFixed(2),
      total: (base + iva - irpf).toFixed(2),
      desglose: `Base: €${base} + IVA ${(tasas[tipo] * 100)}%: €${iva.toFixed(2)} - IRPF 15%: €${irpf.toFixed(2)} = Total: €${(base + iva - irpf).toFixed(2)}`
    };
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: azure('gpt-4o-mini-deploy'),
    system: `Eres FiscalBot. Usa la herramienta calculaIVA cuando el usuario pida cálculos de facturas o IVA.`,
    messages,
    tools: { calculaIVA },
    maxSteps: 3,  // Permite al modelo usar tools y luego responder
  });

  return result.toDataStreamResponse();
}
```

### 8.6 Paso 6: Ejecutar

```bash
npm run dev
# Abrir http://localhost:3000
# Escribir: "Necesito facturar 1500 euros, ¿cuánto IVA y retención?"
# → El modelo llamará a calculaIVA automáticamente y mostrará el desglose
```

### 8.7 Timeline de Prototipo

| Día | Entregable |
|-----|-----------|
| **Día 1** | Setup proyecto + chat básico funcionando con Azure OpenAI |
| **Día 2** | Añadir 2-3 tools fiscales (IVA, trimestres, modelo 303) |
| **Día 3** | Auth básica + persistencia de conversaciones + deploy en Azure Container Apps |
| **Día 4-5** | UI polish + MCP server para datos externos + testing |

---

## 9. Recomendación Final

### ¿Puede SS construir AUTONOMO.AI con este stack?

**Sí, absolutamente.** Esta es la combinación óptima:

| Requisito SS | Solución |
|-------------|----------|
| Chat conversacional con IA | ✅ Vercel AI SDK `streamText` + `useChat` |
| Herramientas de dominio (fiscal, banco) | ✅ `tool()` nativo + MCP servers |
| Streaming real-time | ✅ SSE nativo, <500ms primer token |
| Deploy en Azure (no Vercel) | ✅ Azure Container Apps |
| Auth para usuarios (no GitHub) | ✅ Azure AD B2C (gratis hasta 50K) |
| Coste dentro de €500/mo | ✅ ~€35-85/mo para 1.000 usuarios |
| Prototipo rápido | ✅ 2-3 días para chat funcional |
| Multi-producto (reutilizable) | ✅ MCP servers compartidos entre AUTONOMO.AI, AccesoPulse, CAMBIAZO |

### Próximos Pasos Recomendados

1. **Inmediato (esta semana):** Trinity crea prototipo Next.js + Azure OpenAI con `useChat` y 1 tool.
2. **Semana 2:** Añadir auth (Azure AD B2C), persistencia (Cosmos DB), 3-5 tools fiscales.
3. **Semana 3:** Primer MCP server (`ss-mcp-fiscal`) en Azure Container Apps.
4. **Semana 4:** Deploy de MVP para beta testing con 10-20 autónomos reales.

### Riesgo Principal

El único riesgo relevante es la **calidad de las respuestas fiscales**. GPT-4o-mini es bueno en Q&A general pero puede equivocarse en normativa fiscal específica española. **Mitigación:** Tools con datos reales (no generados por IA) + disclaimers + revisión humana para queries complejas.

---

## Referencias

| Recurso | URL |
|---------|-----|
| Vercel AI SDK Docs | https://ai-sdk.dev/docs/introduction |
| Azure Provider Docs | https://ai-sdk.dev/providers/ai-sdk-providers/azure |
| MCP Integration Guide | https://vercel.com/docs/mcp |
| Tool Calling Guide | https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling |
| useChat Reference | https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat |
| GitHub Repo | https://github.com/vercel/ai |
| MCP-to-AI-SDK Bridge | https://github.com/vercel-labs/mcp-to-ai-sdk |
| Azure OpenAI Pricing | https://azure.microsoft.com/en-us/pricing/details/azure-openai/ |
| Azure Container Apps Pricing | https://azure.microsoft.com/en-us/pricing/details/container-apps/ |
| Chat Persistence Patterns | https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence |
| Azure AI Agent Service | https://techcommunity.microsoft.com/blog/educatordeveloperblog/exploring-azure-openai-assistants-and-azure-ai-agent-services-benefits-and-oppor/4386055 |
| Investigación previa (Copilot SDK) | `docs/research/copilot-sdk-chat-patterns.md` |
