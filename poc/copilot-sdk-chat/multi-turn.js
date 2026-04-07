/**
 * ============================================================
 *  multi-turn.js — Conversación Multi-Turno con Copilot SDK
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar que el SDK mantiene contexto entre mensajes.
 *  El segundo mensaje referencia al primero sin repetir contexto.
 *
 *  EJECUTAR:  node multi-turn.js
 *
 *  QUÉ OBSERVAR:
 *  - La segunda respuesta DEBE referirse a la primera pregunta
 *  - No necesitamos pasar historial manualmente — el SDK lo gestiona
 *  - Usamos system prompt personalizado (asesor fiscal español)
 * ============================================================
 */

import { CopilotClient, approveAll } from "@github/copilot-sdk";

// ── Utilidad: enviar mensaje y esperar respuesta completa ──
// Encapsula el patrón send + wait for idle con streaming.
async function enviarYEsperar(session, mensaje, turno) {
  console.log(`\n${"═".repeat(50)}`);
  console.log(`📨 TURNO ${turno} — Usuario:`);
  console.log(`   "${mensaje}"`);
  console.log("─".repeat(50));
  console.log("🤖 Respuesta:\n");

  const done = new Promise((resolve) => {
    // Usamos un listener temporal para cada turno
    const unsub1 = session.on("assistant.message_delta", (event) => {
      process.stdout.write(event.data.deltaContent);
    });

    const unsub2 = session.on("session.idle", () => {
      unsub1();
      unsub2();
      console.log("\n");
      resolve();
    });
  });

  await session.send({ prompt: mensaje });
  await done;
}

// ── Main ───────────────────────────────────────────────────
const client = new CopilotClient();
await client.start();
console.log("🟢 Cliente Copilot SDK iniciado");

// ── Crear sesión con system prompt personalizado ───────────
// Simulamos el asesor fiscal de AUTONOMO.AI.
// mode: "replace" da control total sobre el system prompt.
const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
  systemMessage: {
    mode: "replace",
    content: `Eres FiscalBot, un asesor fiscal virtual especializado en autónomos españoles.

REGLAS:
- Responde SIEMPRE en español
- Sé conciso pero preciso (máximo 3-4 párrafos)
- Cita la normativa cuando sea relevante (Ley 37/1992, etc.)
- Si no estás seguro, dilo claramente
- Usa ejemplos con cantidades en euros (€)
- Formato: usa viñetas y negritas para claridad`,
  },
});

console.log(`📋 Sesión creada con FiscalBot: ${session.sessionId}`);

// ── Turno 1: Pregunta sobre IVA ────────────────────────────
await enviarYEsperar(
  session,
  "Soy diseñador gráfico freelance. ¿Qué tipo de IVA debo cobrar a mis clientes?",
  1
);

// ── Turno 2: Follow-up que requiere contexto del turno 1 ──
// El SDK debe recordar que somos diseñador gráfico freelance
await enviarYEsperar(
  session,
  "¿Y si uno de esos clientes está en Francia? ¿Cambia algo?",
  2
);

// ── Turno 3: Referencia implícita a todo lo anterior ───────
await enviarYEsperar(
  session,
  "Resúmeme en una tabla las diferencias entre los tres casos que hemos hablado.",
  3
);

// ── Limpieza ───────────────────────────────────────────────
await session.disconnect();
await client.stop();
console.log("═".repeat(50));
console.log("🔴 Sesión cerrada. Conversación multi-turno completada.");
console.log("\n💡 OBSERVA: El turno 3 pidió 'los tres casos que hemos hablado'");
console.log("   y el SDK mantuvo todo el contexto sin intervención nuestra.");
