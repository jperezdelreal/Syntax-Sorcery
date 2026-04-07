/**
 * ============================================================
 *  with-tools.js — Chat con Herramientas Custom (MCP-lite)
 * ============================================================
 *
 *  PROPÓSITO:
 *  Demostrar que el SDK permite definir tools (herramientas)
 *  que el agente puede invocar durante la conversación.
 *  Simulamos herramientas de AUTONOMO.AI: consultar IVA,
 *  calcular retención IRPF, y buscar en el registro de facturas.
 *
 *  EJECUTAR:  node with-tools.js
 *
 *  QUÉ OBSERVAR:
 *  - El agente DECIDE cuándo llamar a cada herramienta
 *  - Los logs muestran cuándo se ejecuta cada tool
 *  - Las respuestas incorporan datos de las herramientas
 *  - defineTool() con Zod proporciona type-safety en los parámetros
 * ============================================================
 */

import { z } from "zod";
import { CopilotClient, approveAll, defineTool } from "@github/copilot-sdk";

// ════════════════════════════════════════════════════════════
//  HERRAMIENTAS CUSTOM — Simulación de backend AUTONOMO.AI
// ════════════════════════════════════════════════════════════

// ── Tool 1: Consultar tipo de IVA ──────────────────────────
// Dados un tipo de actividad y si es intracomunitario,
// devuelve el tipo de IVA aplicable.
const consultarIVA = defineTool("consultar_iva", {
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
  skipPermission: true,
  handler: async ({ actividad, cliente_ue, cliente_fuera_ue }) => {
    console.log(`\n   🔧 [consultar_iva] actividad=${actividad}, UE=${cliente_ue}, fuera_UE=${cliente_fuera_ue}`);

    // Operaciones intracomunitarias: inversión del sujeto pasivo
    if (cliente_ue) {
      return {
        tipo_iva: 0,
        nota: "Operación intracomunitaria — inversión del sujeto pasivo (art. 84 Ley 37/1992). Factura sin IVA con mención expresa.",
        obligaciones: ["Alta en ROI (Registro de Operadores Intracomunitarios)", "Modelo 349 trimestral"],
      };
    }

    // Exportaciones fuera UE
    if (cliente_fuera_ue) {
      return {
        tipo_iva: 0,
        nota: "Exportación de servicios fuera de la UE — no sujeta a IVA español.",
        obligaciones: ["Conservar prueba de establecimiento del cliente fuera de la UE"],
      };
    }

    // Tipos de IVA nacionales
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
});

// ── Tool 2: Calcular retención IRPF ───────────────────────
// Calcula la retención de IRPF en factura de un autónomo.
const calcularRetencion = defineTool("calcular_retencion_irpf", {
  description:
    "Calcula la retención de IRPF que un autónomo debe aplicar en factura. " +
    "Úsalo cuando el usuario pregunte sobre retenciones o quiera calcular el neto de una factura.",
  parameters: z.object({
    base_imponible: z.number().describe("Importe base de la factura en euros"),
    nuevo_autonomo: z
      .boolean()
      .optional()
      .describe("true si es autónomo en sus primeros 3 años de actividad"),
  }),
  skipPermission: true,
  handler: async ({ base_imponible, nuevo_autonomo }) => {
    console.log(`\n   🔧 [calcular_retencion_irpf] base=${base_imponible}€, nuevo=${nuevo_autonomo}`);

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
});

// ── Tool 3: Buscar facturas ────────────────────────────────
// Simula búsqueda en el registro de facturas del autónomo.
const buscarFacturas = defineTool("buscar_facturas", {
  description:
    "Busca en el registro de facturas emitidas del autónomo. " +
    "Úsalo cuando el usuario pregunte por facturas anteriores o quiera un resumen.",
  parameters: z.object({
    trimestre: z
      .enum(["Q1", "Q2", "Q3", "Q4"])
      .describe("Trimestre fiscal (Q1=ene-mar, Q2=abr-jun, Q3=jul-sep, Q4=oct-dic)"),
    año: z.number().optional().describe("Año fiscal (default: año actual)"),
  }),
  skipPermission: true,
  handler: async ({ trimestre, año }) => {
    const anio = año || new Date().getFullYear();
    console.log(`\n   🔧 [buscar_facturas] trimestre=${trimestre}, año=${anio}`);

    // Datos mock — en producción esto consultaría la BD
    const facturas = {
      Q1: [
        { numero: "2026-001", cliente: "Acme Corp", base: 1500, fecha: "2026-01-15" },
        { numero: "2026-002", cliente: "TechStart SL", base: 2200, fecha: "2026-02-20" },
        { numero: "2026-003", cliente: "DesignHub", base: 800, fecha: "2026-03-10" },
      ],
      Q2: [
        { numero: "2026-004", cliente: "Acme Corp", base: 1500, fecha: "2026-04-15" },
        { numero: "2026-005", cliente: "EuroClient GmbH", base: 3000, fecha: "2026-05-22" },
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
      nota: lista.length === 0
        ? `No hay facturas registradas en ${trimestre} ${anio}`
        : `${lista.length} facturas en ${trimestre} ${anio} por un total de ${(total_base + total_iva).toFixed(2)}€`,
    };
  },
});

// ════════════════════════════════════════════════════════════
//  SCRIPT PRINCIPAL
// ════════════════════════════════════════════════════════════

const client = new CopilotClient();
await client.start();
console.log("🟢 Cliente Copilot SDK iniciado con herramientas custom\n");

// Crear sesión con las 3 herramientas + system prompt fiscal
const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
  tools: [consultarIVA, calcularRetencion, buscarFacturas],
  systemMessage: {
    mode: "replace",
    content: `Eres FiscalBot, asesor fiscal virtual de AUTONOMO.AI para autónomos españoles.

HERRAMIENTAS DISPONIBLES:
- consultar_iva: Para determinar el tipo de IVA aplicable
- calcular_retencion_irpf: Para calcular retenciones en facturas
- buscar_facturas: Para consultar el historial de facturas

REGLAS:
- Responde SIEMPRE en español
- USA las herramientas cuando sean relevantes — no inventes datos
- Muestra los cálculos paso a paso
- Cita normativa cuando aplique
- Sé conciso pero completo`,
  },
});

console.log(`📋 Sesión FiscalBot con tools: ${session.sessionId}`);

// ── Utilidad de envío ──────────────────────────────────────
async function enviar(mensaje, turno) {
  console.log(`\n${"═".repeat(55)}`);
  console.log(`📨 TURNO ${turno}: "${mensaje}"`);
  console.log("─".repeat(55));

  const done = new Promise((resolve) => {
    const unsub1 = session.on("assistant.message_delta", (event) => {
      process.stdout.write(event.data.deltaContent);
    });

    // Observar invocaciones de herramientas
    const unsub2 = session.on("tool.execution_start", (event) => {
      console.log(`\n   ⚡ Tool invocada: ${event.data?.toolName || "unknown"}`);
    });

    const unsub3 = session.on("tool.execution_complete", (event) => {
      console.log(`   ✅ Tool completada: ${event.data?.toolName || "unknown"}`);
    });

    const unsub4 = session.on("session.idle", () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      console.log("\n");
      resolve();
    });
  });

  await session.send({ prompt: mensaje });
  await done;
}

// ── Turno 1: Pregunta que debería activar consultar_iva ────
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
await enviar(
  "¿Cuánto he facturado en el primer trimestre de este año?",
  3
);

// ── Limpieza ───────────────────────────────────────────────
await session.disconnect();
await client.stop();

console.log("═".repeat(55));
console.log("🔴 Sesión cerrada. Demo con herramientas completada.");
console.log("\n💡 OBSERVA:");
console.log("   - El agente DECIDIÓ qué herramienta usar en cada turno");
console.log("   - Los datos vinieron de nuestros handlers (mock), no del modelo");
console.log("   - En producción, los handlers consultarían BD/APIs reales");
