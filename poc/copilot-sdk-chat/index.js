/**
 * ============================================================
 *  index.js — Chat Básico con GitHub Copilot SDK
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar la interacción más simple posible con el SDK:
 *  crear un cliente, abrir sesión, enviar un mensaje, recibir
 *  respuesta con streaming en tiempo real.
 *
 *  EJECUTAR:  node index.js
 *
 *  REQUISITOS:
 *  - Node.js 18+
 *  - Copilot CLI instalado y autenticado (`copilot auth login`)
 *  - npm install ejecutado en este directorio
 * ============================================================
 */

import { CopilotClient, approveAll } from "@github/copilot-sdk";

// ── 1. Crear el cliente ────────────────────────────────────
// El SDK gestiona el proceso del CLI automáticamente.
// Con autoStart: true (default), se conecta al arrancarse.
const client = new CopilotClient();
await client.start();

console.log("🟢 Cliente Copilot SDK iniciado\n");

// ── 2. Crear sesión con streaming activado ─────────────────
// onPermissionRequest es OBLIGATORIO — approveAll permite
// todas las herramientas (apropiado para un PoC local).
const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
});

console.log(`📋 Sesión creada: ${session.sessionId}`);
console.log("─".repeat(50));

// ── 3. Configurar listeners de eventos ─────────────────────
// El SDK emite eventos tipados para cada fase de la respuesta.
const done = new Promise((resolve) => {
  // Streaming: cada fragmento de texto llega aquí
  session.on("assistant.message_delta", (event) => {
    process.stdout.write(event.data.deltaContent);
  });

  // Mensaje final completo (siempre se emite, con o sin streaming)
  session.on("assistant.message", (event) => {
    console.log("\n");
    console.log("─".repeat(50));
    console.log(`✅ Respuesta completa (${event.data.content.length} chars)`);
  });

  // La sesión queda inactiva = terminó de procesar
  session.on("session.idle", () => {
    resolve();
  });
});

// ── 4. Enviar mensaje y esperar respuesta ──────────────────
console.log("📨 Enviando: '¿Qué es el IVA en España y cuáles son sus tipos?'\n");

await session.send({
  prompt: "¿Qué es el IVA en España y cuáles son sus tipos? Responde en español, de forma concisa.",
});

await done;

// ── 5. Limpieza ────────────────────────────────────────────
await session.disconnect();
await client.stop();
console.log("\n🔴 Sesión cerrada. ¡Prueba completada!");
