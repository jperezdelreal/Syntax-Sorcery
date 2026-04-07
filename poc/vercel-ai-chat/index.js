/**
 * ============================================================
 *  index.js — Chat Básico con Vercel AI SDK + Azure OpenAI
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar la interacción más simple posible con Vercel AI SDK:
 *  crear un modelo, enviar un mensaje, recibir respuesta con
 *  streaming en tiempo real. Sin subprocess, sin CLI.
 *
 *  EJECUTAR:  node index.js
 *
 *  REQUISITOS:
 *  - Node.js 18+
 *  - npm install ejecutado en este directorio
 *  - Variable de entorno: OPENAI_API_KEY (o AZURE_OPENAI_API_KEY + AZURE_OPENAI_RESOURCE_NAME)
 *
 *  COMPARACIÓN CON COPILOT SDK:
 *  - Copilot SDK: CopilotClient → start() → createSession() → send() + event listeners
 *  - Vercel AI:   streamText({ model, prompt }) → textStream (un solo paso)
 *  - Sin subproceso CLI, sin JSON-RPC, sin gestión de sesiones
 * ============================================================
 */

import "dotenv/config";
import { streamText } from "ai";
import { obtenerModelo } from "./lib/provider.js";

// ── 1. Obtener modelo (Azure OpenAI o OpenAI según config) ──
const modelo = obtenerModelo();

console.log("🟢 Vercel AI SDK iniciado — sin subproceso, conexión directa a API\n");
console.log("📨 Enviando: '¿Qué es el IVA en España y cuáles son sus tipos?'\n");
console.log("─".repeat(50));
console.log("🤖 Respuesta:\n");

// ── 2. Streaming en una sola llamada ────────────────────────
// Esto es TODO lo que necesitas. Sin event listeners, sin
// gestión de sesión, sin Promise wrappers.
const resultado = streamText({
  model: modelo,
  prompt:
    "¿Qué es el IVA en España y cuáles son sus tipos? Responde en español, de forma concisa.",
});

// ── 3. Consumir el stream ───────────────────────────────────
// El stream es un AsyncIterable — se consume con for-await.
let totalChars = 0;
for await (const fragmento of resultado.textStream) {
  process.stdout.write(fragmento);
  totalChars += fragmento.length;
}

// ── 4. Metadata de uso ─────────────────────────────────────
// Vercel AI SDK expone tokens usados directamente.
const uso = await resultado.usage;
console.log("\n");
console.log("─".repeat(50));
console.log(`✅ Respuesta completa (${totalChars} chars)`);
console.log(`📊 Tokens: ${uso.promptTokens} prompt + ${uso.completionTokens} completion = ${uso.totalTokens} total`);
console.log("\n🔴 Completado. Sin sesión que cerrar — no hay subproceso.");
