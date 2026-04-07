/**
 * ============================================================
 *  with-tools.js — Chat con Herramientas Custom (Vercel AI SDK)
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar herramientas (tools) con Vercel AI SDK.
 *  Mismas herramientas que el PoC de Copilot SDK:
 *  consultar_iva, calcular_retencion_irpf, buscar_facturas.
 *
 *  EJECUTAR:  node with-tools.js
 *
 *  QUÉ OBSERVAR:
 *  - El modelo DECIDE cuándo llamar a cada herramienta
 *  - Los logs muestran invocaciones de tools
 *  - Las respuestas incorporan datos de las herramientas
 *  - tool() de Vercel AI SDK es equivalente a defineTool() del Copilot SDK
 *
 *  COMPARACIÓN CON COPILOT SDK:
 *  - SDK: defineTool() + session events (tool.execution_start/complete)
 *  - Vercel: tool() en el objeto tools + maxSteps para loop automático
 *  - Vercel maneja el loop tool_call → result → respuesta automáticamente
 *  - SDK: el agente puede preferir built-in tools sobre custom tools
 *  - Vercel: SOLO tiene los tools que tú defines — sin built-ins que compitan
 * ============================================================
 */

import "dotenv/config";
import { streamText, tool } from "ai";
import { z } from "zod";
import { obtenerModelo } from "./lib/provider.js";

const modelo = obtenerModelo();

// ════════════════════════════════════════════════════════════
//  HERRAMIENTAS CUSTOM — Misma lógica que el PoC de Copilot SDK
// ════════════════════════════════════════════════════════════

const herramientas = {
  // ── Tool 1: Consultar tipo de IVA ──────────────────────────
  consultar_iva: tool({
    description:
      "Consulta el tipo de IVA aplicable según la actividad económica y localización del cliente. " +
      "Úsalo cuando el usuario pregunte qué IVA debe aplicar.",
    parameters: z.object({
      actividad: z
        .enum([
          "servicios_profesionales",
          "productos_alimentacion",
          "productos_primera_necesidad",
          "cultura_educacion",
          "servicios_digitales",
          "otros",
        ])
        .describe("Categoría de actividad económica"),
      cliente_ue: z
        .boolean()
        .describe("true si el cliente está en otro país de la UE"),
      cliente_fuera_ue: z
        .boolean()
        .optional()
        .describe("true si el cliente está fuera de la UE"),
    }),
    execute: async ({ actividad, cliente_ue, cliente_fuera_ue }) => {
      console.log(
        `\n   🔧 [consultar_iva] actividad=${actividad}, UE=${cliente_ue}, fuera_UE=${cliente_fuera_ue}`
      );

      if (cliente_ue) {
        return {
          tipo_iva: 0,
          nota: "Operación intracomunitaria — inversión del sujeto pasivo (art. 84 Ley 37/1992). Factura sin IVA con mención expresa.",
          obligaciones: [
            "Alta en ROI (Registro de Operadores Intracomunitarios)",
            "Modelo 349 trimestral",
          ],
        };
      }

      if (cliente_fuera_ue) {
        return {
          tipo_iva: 0,
          nota: "Exportación de servicios fuera de la UE — no sujeta a IVA español.",
          obligaciones: [
            "Conservar prueba de establecimiento del cliente fuera de la UE",
          ],
        };
      }

      const tipos = {
        servicios_profesionales: { tipo: 21, nombre: "General" },
        productos_alimentacion: { tipo: 10, nombre: "Reducido" },
        productos_primera_necesidad: { tipo: 4, nombre: "Superreducido" },
        cultura_educacion: { tipo: 0, nombre: "Exento" },
        servicios_digitales: { tipo: 21, nombre: "General" },
        otros: { tipo: 21, nombre: "General" },
      };

      const resultado = tipos[actividad] || tipos.otros;
      return {
        tipo_iva: resultado.tipo,
        nombre_tipo: resultado.nombre,
        nota: `IVA ${resultado.nombre} al ${resultado.tipo}% (Ley 37/1992)`,
      };
    },
  }),

  // ── Tool 2: Calcular retención IRPF ───────────────────────
  calcular_retencion_irpf: tool({
    description:
      "Calcula la retención de IRPF que un autónomo debe aplicar en factura. " +
      "Úsalo cuando el usuario pregunte sobre retenciones o quiera calcular el neto de una factura.",
    parameters: z.object({
      base_imponible: z
        .number()
        .describe("Importe base de la factura en euros"),
      nuevo_autonomo: z
        .boolean()
        .optional()
        .describe(
          "true si es autónomo en sus primeros 3 años de actividad"
        ),
    }),
    execute: async ({ base_imponible, nuevo_autonomo }) => {
      console.log(
        `\n   🔧 [calcular_retencion_irpf] base=${base_imponible}€, nuevo=${nuevo_autonomo}`
      );

      const porcentaje = nuevo_autonomo ? 7 : 15;
      const retencion = base_imponible * (porcentaje / 100);
      const iva = base_imponible * 0.21;
      const total = base_imponible + iva - retencion;

      return {
        base_imponible,
        iva_21: iva,
        retencion_irpf: retencion,
        porcentaje_retencion: porcentaje,
        total_factura: total,
        nota: nuevo_autonomo
          ? `Retención reducida del ${porcentaje}% por nuevo autónomo (primeros 3 años)`
          : `Retención estándar del ${porcentaje}%`,
        desglose: `${base_imponible}€ + ${iva.toFixed(2)}€ IVA - ${retencion.toFixed(2)}€ IRPF = ${total.toFixed(2)}€ total`,
      };
    },
  }),

  // ── Tool 3: Buscar facturas ────────────────────────────────
  buscar_facturas: tool({
    description:
      "Busca en el registro de facturas emitidas del autónomo. " +
      "Úsalo cuando el usuario pregunte por facturas anteriores o quiera un resumen.",
    parameters: z.object({
      trimestre: z
        .enum(["Q1", "Q2", "Q3", "Q4"])
        .describe(
          "Trimestre fiscal (Q1=ene-mar, Q2=abr-jun, Q3=jul-sep, Q4=oct-dic)"
        ),
      año: z.number().optional().describe("Año fiscal (default: año actual)"),
    }),
    execute: async ({ trimestre, año }) => {
      const anio = año || new Date().getFullYear();
      console.log(
        `\n   🔧 [buscar_facturas] trimestre=${trimestre}, año=${anio}`
      );

      const facturas = {
        Q1: [
          {
            numero: "2026-001",
            cliente: "Acme Corp",
            base: 1500,
            fecha: "2026-01-15",
          },
          {
            numero: "2026-002",
            cliente: "TechStart SL",
            base: 2200,
            fecha: "2026-02-20",
          },
          {
            numero: "2026-003",
            cliente: "DesignHub",
            base: 800,
            fecha: "2026-03-10",
          },
        ],
        Q2: [
          {
            numero: "2026-004",
            cliente: "Acme Corp",
            base: 1500,
            fecha: "2026-04-15",
          },
          {
            numero: "2026-005",
            cliente: "EuroClient GmbH",
            base: 3000,
            fecha: "2026-05-22",
          },
        ],
        Q3: [],
        Q4: [],
      };

      const lista = facturas[trimestre] || [];
      const total_base = lista.reduce((sum, f) => sum + f.base, 0);
      const total_iva = total_base * 0.21;

      return {
        trimestre: `${trimestre} ${anio}`,
        num_facturas: lista.length,
        facturas: lista,
        resumen: {
          total_base_imponible: total_base,
          total_iva_repercutido: total_iva,
          total_facturado: total_base + total_iva,
        },
        nota:
          lista.length === 0
            ? `No hay facturas registradas en ${trimestre} ${anio}`
            : `${lista.length} facturas en ${trimestre} ${anio} por un total de ${(total_base + total_iva).toFixed(2)}€`,
      };
    },
  }),
};

// ════════════════════════════════════════════════════════════
//  SYSTEM PROMPT — Mismo FiscalBot que el PoC de Copilot SDK
// ════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Eres FiscalBot, asesor fiscal virtual de AUTONOMO.AI para autónomos españoles.

HERRAMIENTAS DISPONIBLES:
- consultar_iva: Para determinar el tipo de IVA aplicable
- calcular_retencion_irpf: Para calcular retenciones en facturas
- buscar_facturas: Para consultar el historial de facturas

REGLAS:
- Responde SIEMPRE en español
- USA las herramientas cuando sean relevantes — no inventes datos
- Muestra los cálculos paso a paso
- Cita normativa cuando aplique
- Sé conciso pero completo`;

// ── Historial de mensajes ──────────────────────────────────
const mensajes = [{ role: "system", content: SYSTEM_PROMPT }];

// ── Utilidad: enviar mensaje con tools y streaming ──────────
async function enviar(mensaje, turno) {
  console.log(`\n${"═".repeat(55)}`);
  console.log(`📨 TURNO ${turno}: "${mensaje}"`);
  console.log("─".repeat(55));

  mensajes.push({ role: "user", content: mensaje });

  // maxSteps: el SDK re-envía automáticamente después de tool calls.
  // Sin maxSteps, se detiene tras la primera tool_call sin dar respuesta final.
  // Con maxSteps: 5, permite hasta 5 ciclos de tool_call → result → respuesta.
  const resultado = streamText({
    model: modelo,
    messages: mensajes,
    tools: herramientas,
    maxSteps: 5,
    // onStepFinish: callback después de cada paso (tool call o respuesta)
    onStepFinish({ toolCalls, toolResults }) {
      if (toolCalls && toolCalls.length > 0) {
        for (const tc of toolCalls) {
          console.log(`   ⚡ Tool invocada: ${tc.toolName}`);
        }
      }
      if (toolResults && toolResults.length > 0) {
        for (const tr of toolResults) {
          console.log(`   ✅ Tool completada: ${tr.toolName}`);
        }
      }
    },
  });

  // Streaming de la respuesta final
  let respuestaCompleta = "";
  let streamStarted = false;
  for await (const fragmento of resultado.textStream) {
    if (!streamStarted) {
      console.log("🤖 Respuesta:\n");
      streamStarted = true;
    }
    process.stdout.write(fragmento);
    respuestaCompleta += fragmento;
  }

  // Guardar respuesta en historial
  if (respuestaCompleta) {
    mensajes.push({ role: "assistant", content: respuestaCompleta });
  }

  const uso = await resultado.usage;
  console.log("\n");
  console.log(
    `   📊 Tokens: ${uso.promptTokens} prompt + ${uso.completionTokens} completion`
  );
}

// ════════════════════════════════════════════════════════════
//  SCRIPT PRINCIPAL — Mismas preguntas que el PoC de Copilot SDK
// ════════════════════════════════════════════════════════════

console.log("🟢 Vercel AI SDK — FiscalBot con herramientas custom\n");
console.log(
  `📋 Modelo: ${modelo.modelId} | Tools: ${Object.keys(herramientas).join(", ")}`
);

// ── Turno 1: Debería activar consultar_iva ─────────────────
await enviar(
  "Soy programador freelance en Madrid. Un cliente de Berlín me pide un proyecto de 5.000€. ¿Qué IVA le cobro?",
  1
);

// ── Turno 2: Debería activar calcular_retencion_irpf ───────
await enviar(
  "Perfecto. Ahora hazme el cálculo completo de la factura: 5.000€ de base. Soy autónomo desde hace 2 años.",
  2
);

// ── Turno 3: Debería activar buscar_facturas ───────────────
await enviar("¿Cuánto he facturado en el primer trimestre de este año?", 3);

// ── Sin limpieza necesaria ─────────────────────────────────
console.log("═".repeat(55));
console.log("🔴 Completado. Sin sesión que cerrar.");
console.log("\n💡 OBSERVA:");
console.log("   - El modelo DECIDIÓ qué herramienta usar en cada turno");
console.log(
  "   - SOLO nuestras custom tools — sin built-ins que compitan (a diferencia del Copilot SDK)"
);
console.log("   - maxSteps: 5 permite el loop automático tool_call → result → respuesta");
console.log("   - Los datos vinieron de nuestros handlers (mock), no del modelo");
