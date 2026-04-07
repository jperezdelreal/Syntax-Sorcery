/**
 * ============================================================
 *  lib/provider.js — Selección inteligente de proveedor IA
 * ============================================================
 *
 *  Lógica de selección:
 *  1. Si hay AZURE_OPENAI_API_KEY → usa Azure OpenAI
 *  2. Si hay OPENAI_API_KEY → usa OpenAI estándar
 *  3. Si no hay ninguna → muestra instrucciones claras y sale
 *
 *  Esto permite probar el PoC con cualquier proveedor sin
 *  cambiar código. Solo cambia variables de entorno.
 * ============================================================
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAzure } from "@ai-sdk/azure";

/**
 * Devuelve un modelo configurado según las variables de entorno disponibles.
 * Prioridad: Azure OpenAI > OpenAI > Error con instrucciones.
 */
export function obtenerModelo() {
  // ── Opción 1: Azure OpenAI ──────────────────────────────
  if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_RESOURCE_NAME) {
    const azure = createAzure({
      resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
    });

    // El deployment name es configurable; por defecto "gpt-4o"
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
    console.log(`🔵 Proveedor: Azure OpenAI (${process.env.AZURE_OPENAI_RESOURCE_NAME}/${deployment})`);
    return azure(deployment);
  }

  // ── Opción 2: OpenAI estándar ───────────────────────────
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const modelName = process.env.OPENAI_MODEL || "gpt-4o";
    console.log(`🟢 Proveedor: OpenAI (${modelName})`);
    return openai(modelName);
  }

  // ── Sin credenciales ────────────────────────────────────
  console.error(`
╔══════════════════════════════════════════════════════╗
║  ❌ No se encontraron credenciales de IA             ║
║                                                      ║
║  Configura UNA de estas opciones:                    ║
║                                                      ║
║  Opción A — Azure OpenAI:                            ║
║    AZURE_OPENAI_API_KEY=tu-clave                     ║
║    AZURE_OPENAI_RESOURCE_NAME=tu-recurso             ║
║    AZURE_OPENAI_DEPLOYMENT=gpt-4o (opcional)         ║
║                                                      ║
║  Opción B — OpenAI:                                  ║
║    OPENAI_API_KEY=sk-...                             ║
║    OPENAI_MODEL=gpt-4o (opcional)                    ║
║                                                      ║
║  Puedes usar un archivo .env en este directorio.     ║
╚══════════════════════════════════════════════════════╝
`);
  process.exit(1);
}
