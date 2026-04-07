/**
 * ============================================================
 *  multi-turn.js — Conversación Multi-Turno con Vercel AI SDK
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar conversación multi-turno con el mismo FiscalBot
 *  del PoC de Copilot SDK. El historial se gestiona manualmente
 *  (array de mensajes) — no hay sesión persistente como en el SDK.
 *
 *  EJECUTAR:  node multi-turn.js
 *
 *  QUÉ OBSERVAR:
 *  - El historial se acumula en un array `mensajes`
 *  - Cada turno envía TODO el historial (el modelo es stateless)
 *  - La segunda respuesta DEBE recordar la primera pregunta
 *  - Más explícito que el SDK (tú controlas el historial)
 *
 *  COMPARACIÓN CON COPILOT SDK:
 *  - SDK: session.send() acumula historial automáticamente
 *  - Vercel AI: tú gestionas el array de mensajes (más control, más código)
 *  - Ambos soportan system prompt personalizado
 * ============================================================
 */

import "dotenv/config";
import { streamText } from "ai";
import { obtenerModelo } from "./lib/provider.js";

const modelo = obtenerModelo();

// ── System prompt: mismo FiscalBot que el PoC de Copilot SDK ──
const SYSTEM_PROMPT = `Eres FiscalBot, un asesor fiscal virtual especializado en autónomos españoles.

REGLAS:
- Responde SIEMPRE en español
- Sé conciso pero preciso (máximo 3-4 párrafos)
- Cita la normativa cuando sea relevante (Ley 37/1992, etc.)
- Si no estás seguro, dilo claramente
- Usa ejemplos con cantidades en euros (€)
- Formato: usa viñetas y negritas para claridad`;

// ── Historial de la conversación ────────────────────────────
// En Vercel AI SDK, TÚ gestionas el historial. Es un array
// de mensajes con roles (system, user, assistant).
// Más explícito que el SDK de Copilot (donde es automático),
// pero te da control total sobre qué se envía al modelo.
const mensajes = [{ role: "system", content: SYSTEM_PROMPT }];

// ── Utilidad: enviar mensaje y esperar respuesta con streaming ──
async function enviarYEsperar(mensaje, turno) {
  console.log(`\n${"═".repeat(50)}`);
  console.log(`📨 TURNO ${turno} — Usuario:`);
  console.log(`   "${mensaje}"`);
  console.log("─".repeat(50));
  console.log("🤖 Respuesta:\n");

  // Añadir mensaje del usuario al historial
  mensajes.push({ role: "user", content: mensaje });

  // streamText envía TODO el historial — el modelo ve la conversación completa
  const resultado = streamText({
    model: modelo,
    messages: mensajes,
  });

  // Acumular respuesta para añadirla al historial después
  let respuestaCompleta = "";
  for await (const fragmento of resultado.textStream) {
    process.stdout.write(fragmento);
    respuestaCompleta += fragmento;
  }

  // Añadir respuesta del asistente al historial para el próximo turno
  mensajes.push({ role: "assistant", content: respuestaCompleta });

  const uso = await resultado.usage;
  console.log("\n");
  console.log(
    `   📊 Tokens: ${uso.promptTokens} prompt + ${uso.completionTokens} completion`
  );
}

// ════════════════════════════════════════════════════════════
//  CONVERSACIÓN — Mismas preguntas que el PoC de Copilot SDK
// ════════════════════════════════════════════════════════════

console.log("🟢 Vercel AI SDK — FiscalBot Multi-Turno");
console.log(
  `📋 Modelo: ${modelo.modelId} | Historial: gestionado manualmente`
);

// ── Turno 1: Pregunta sobre IVA ────────────────────────────
await enviarYEsperar(
  "Soy diseñador gráfico freelance. ¿Qué tipo de IVA debo cobrar a mis clientes?",
  1
);

// ── Turno 2: Follow-up que requiere contexto del turno 1 ──
// El modelo debe recordar que somos diseñador gráfico freelance
await enviarYEsperar(
  "¿Y si uno de esos clientes está en Francia? ¿Cambia algo?",
  2
);

// ── Turno 3: Referencia implícita a todo lo anterior ───────
await enviarYEsperar(
  "Resúmeme en una tabla las diferencias entre los tres casos que hemos hablado.",
  3
);

// ── Sin limpieza necesaria ─────────────────────────────────
// No hay client.stop(), ni session.disconnect(), ni subproceso que matar.
console.log("═".repeat(50));
console.log("🔴 Completado. Sin sesión que cerrar.");
console.log(
  `\n💡 OBSERVA: El turno 3 pidió 'los tres casos que hemos hablado'`
);
console.log(`   y el historial manual mantuvo el contexto correctamente.`);
console.log(`   Total mensajes en historial: ${mensajes.length}`);
