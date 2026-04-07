/**
 * ============================================================
 *  vigia.js — VIGÍA: Tester Autónomo de Apps Web
 * ============================================================
 *
 *  Usa el Copilot SDK como cerebro y Playwright como manos.
 *  El agente decide qué testear emitiendo comandos JSON;
 *  el script los parsea y ejecuta con Playwright.
 *
 *  NOTA: El SDK tiene un bug conocido donde los built-in tools
 *  (powershell, report_intent) compiten con los custom tools.
 *  Para solucionarlo, usamos un patrón "command loop":
 *  el agente emite JSON estructurado y nosotros lo ejecutamos.
 *
 *  EJECUTAR:
 *    node vigia.js --url https://example.com
 *    node vigia.js --url http://localhost:5173
 *    node vigia.js --url https://example.com --visible   (ves el navegador en tu pantalla)
 *
 *  REQUISITOS:
 *    - Node.js 18+
 *    - Copilot CLI instalado y autenticado
 *    - npm install && npx playwright install chromium
 * ============================================================
 */

import { CopilotClient, approveAll } from "@github/copilot-sdk";
import * as browser from "./tools/browser.js";
import * as reporter from "./tools/reporter.js";
import { extractCommands } from "./lib/extract-commands.js";
import { executeCommand } from "./lib/execute-command.js";

// ════════════════════════════════════════════════════════════
//  PARSEAR ARGUMENTOS
// ════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const targetUrl = urlIndex !== -1 && args[urlIndex + 1]
  ? args[urlIndex + 1]
  : "https://citypulselabs.azurestaticapps.net";
const visibleMode = args.includes("--visible");

console.log(`
╔══════════════════════════════════════════════════════╗
║  🔍 VIGÍA — Tester Autónomo de Apps Web              ║
║  v0.2.0 — Visión + Error Handling                    ║
╚══════════════════════════════════════════════════════╝

   URL objetivo: ${targetUrl}
   Modo: ${visibleMode ? "Visible (headed)" : "Headless"} Chromium
   Motor: GitHub Copilot SDK + Playwright
`);

// ════════════════════════════════════════════════════════════
//  PROMPT DEL SISTEMA — Instruye al agente a emitir JSON
// ════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Eres VIGÍA, un agente autónomo de QA para aplicaciones web con CAPACIDAD DE VISIÓN.
Tu ÚNICO formato de output son bloques JSON de comandos. NO uses las herramientas del sistema (powershell, report_intent, etc.). Solo emite JSON.

Para ejecutar acciones, emite un bloque JSON así:

\`\`\`json
{"commands": [
  {"action": "navigate", "url": "https://example.com"},
  {"action": "screenshot", "name": "homepage"},
  {"action": "get_page_info"},
  {"action": "check_performance"}
]}
\`\`\`

ACCIONES DISPONIBLES:
- {"action": "navigate", "url": "..."} — Abre una URL, devuelve título y tiempo de carga
- {"action": "click", "selector": "..."} — Click en un elemento CSS
- {"action": "type", "selector": "...", "text": "..."} — Escribe en un campo
- {"action": "screenshot", "name": "..."} — Captura screenshot. LA IMAGEN se te envía para análisis visual
- {"action": "get_page_info"} — Obtiene links, botones, inputs, headings, imágenes sin alt
- {"action": "check_performance"} — Mide tiempos de carga y recursos
- {"action": "report_issue", "title": "...", "description": "...", "severity": "critical|major|minor"}
- {"action": "set_viewport", "width": 375, "height": 667} — Emular dispositivo
- {"action": "wait", "ms": 1000} — Esperar milisegundos
- {"action": "done"} — Indica que terminaste el testing

PROTOCOLO:
1. Emite un bloque de comandos
2. Recibirás los resultados + las imágenes de screenshots adjuntas
3. ANALIZA las imágenes: layout, contraste, espaciado, legibilidad, UX
4. Reporta problemas con report_issue
5. Cuando termines, emite {"action": "done"} y un resumen

CAPACIDAD DE VISIÓN:
- Cada screenshot se te envía como imagen adjunta — PUEDES VERLA
- Analiza: layout real, contraste de colores, tamaño de texto, espaciado
- Detecta: elementos superpuestos, texto ilegible, CTAs poco visibles, diseño desbalanceado
- Compara: desktop vs mobile para verificar responsive design
- No te limites al DOM — usa tu visión para evaluar la calidad visual real

REGLAS:
- Emite SOLO bloques \`\`\`json ... \`\`\` — nada de texto suelto excepto análisis breve entre bloques
- Toma screenshots FRECUENTEMENTE — es tu herramienta más poderosa
- Reporta TODOS los problemas con report_issue (incluye hallazgos visuales)
- Sé específico: qué esperabas vs qué ocurrió
- Prioriza: funcionalidad rota > problemas visuales > UX pobre > mejoras
- Testea: homepage, navegación, búsqueda/formularios, mobile viewport, accesibilidad básica`;

// executeCommand y extractCommands importados de ./lib/

// ════════════════════════════════════════════════════════════
//  ENVIAR MENSAJE Y RECOGER RESPUESTA COMPLETA
// ════════════════════════════════════════════════════════════

async function sendAndCollect(session, message, attachments = []) {
  const TURN_TIMEOUT_MS = 120_000; // 2 minutos máximo por turno

  return new Promise((resolve) => {
    let fullText = "";
    let timer = null;

    const cleanup = () => {
      unsub1();
      unsub2();
      if (timer) clearTimeout(timer);
    };

    const unsub1 = session.on("assistant.message_delta", (event) => {
      const delta = event.data.deltaContent;
      fullText += delta;
      process.stdout.write(delta);
    });

    const unsub2 = session.on("session.idle", () => {
      cleanup();
      resolve(fullText);
    });

    // Timeout de seguridad para evitar cuelgues indefinidos
    timer = setTimeout(() => {
      cleanup();
      console.log("\n   ⚠️  Timeout esperando respuesta del agente (2 min)");
      resolve(fullText || "[timeout — sin respuesta del agente]");
    }, TURN_TIMEOUT_MS);

    const sendOpts = { prompt: message };
    if (attachments.length > 0) {
      sendOpts.attachments = attachments;
    }
    session.send(sendOpts);
  });
}

// ════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL LOOP
// ════════════════════════════════════════════════════════════

const MAX_TURNS = 15; // Límite de seguridad
const MAX_IMAGES_PER_TURN = 5; // Máximo de screenshots como adjuntos visuales

// ════════════════════════════════════════════════════════════
//  GRACEFUL SHUTDOWN — Ctrl+C guarda informe parcial
// ════════════════════════════════════════════════════════════

let _cleanupFn = null;
let _isShuttingDown = false;

process.on("SIGINT", async () => {
  if (_isShuttingDown) process.exit(1); // Segundo Ctrl+C = forzar salida
  _isShuttingDown = true;
  console.log("\n\n   ⚠️  Ctrl+C detectado — guardando informe parcial...");
  if (_cleanupFn) await _cleanupFn();
  process.exit(0);
});

// ════════════════════════════════════════════════════════════
//  LOOP PRINCIPAL — El corazón de VIGÍA
// ════════════════════════════════════════════════════════════

async function main() {
  let client = null;
  let session = null;

  // Registrar función de limpieza para graceful shutdown
  _cleanupFn = async () => {
    try {
      const r = await reporter.generateReport();
      console.log(`   📄 Informe parcial guardado: ${r.filename}`);
    } catch { /* ignorar si no hay datos */ }
    try { if (session) await session.disconnect(); } catch {}
    try { if (client) await client.stop(); } catch {}
    try { await browser.closeBrowser(); } catch {}
  };

  // 1. Inicializar browser
  console.log("── Inicializando browser ──────────────────────────");
  await browser.initBrowser({ visible: visibleMode });

  // 2. Inicializar reporter
  reporter.startSession(targetUrl);

  // 3. Crear cliente SDK
  console.log("── Conectando con Copilot SDK ─────────────────────");
  client = new CopilotClient();
  await client.start();
  console.log("   🟢 Cliente SDK iniciado");

  // 4. Crear sesión (gpt-4.1 soporta visión via blob attachments)
  session = await client.createSession({
    model: "gpt-4.1",
    streaming: true,
    onPermissionRequest: approveAll,
    systemMessage: {
      mode: "replace",
      content: SYSTEM_PROMPT,
    },
  });

  console.log(`   📋 Sesión VIGÍA: ${session.sessionId}`);

  // Escuchar errores de sesión SDK
  session.on("session.error", (event) => {
    console.log(`   ❌ Error de sesión SDK: ${event.data?.message || "desconocido"}`);
  });

  console.log("\n── Iniciando testing autónomo ─────────────────────\n");

  const startTime = Date.now();

  // 5. Misión inicial (incluye instrucciones de visión)
  const mission = `Testea la aplicación web: ${targetUrl}

RECUERDA: Cada screenshot se te envía como imagen adjunta — PUEDES VERLA y analizarla visualmente.

Plan:
1. Navega a ${targetUrl}, screenshot, get_page_info, check_performance
2. Analiza visualmente cada screenshot: layout, contraste, legibilidad
3. Explora links principales
4. Prueba búsquedas/formularios
5. set_viewport a 375x667 (mobile), navega homepage de nuevo, screenshot
6. Compara visualmente desktop vs mobile
7. Reporta TODOS los problemas con report_issue (incluye hallazgos visuales)
8. Emite {"action": "done"} al terminar

Empieza ahora con tu primer bloque de comandos.`;

  let turn = 0;
  let isDone = false;
  let currentMessage = mission;
  let pendingAttachments = [];

  try {
    while (turn < MAX_TURNS && !isDone && !_isShuttingDown) {
      turn++;
      console.log(`\n${"═".repeat(55)}`);
      console.log(`   🔄 Turno ${turn}/${MAX_TURNS}`);
      if (pendingAttachments.length > 0) {
        console.log(`   🖼️  ${pendingAttachments.length} imagen(es) adjunta(s) para visión`);
      }
      console.log("─".repeat(55));

      // Enviar al agente con screenshots adjuntos como imágenes
      const response = await sendAndCollect(session, currentMessage, pendingAttachments);
      pendingAttachments = []; // Limpiar después de enviar
      console.log("\n");

      // Extraer y ejecutar comandos
      const commands = extractCommands(response);

      if (commands.length === 0) {
        console.log("   ⚠️  Sin comandos en esta respuesta. Pidiendo más acciones...");
        currentMessage = "No detecté comandos JSON en tu respuesta. Recuerda usar el formato ```json {\"commands\": [...]} ```. Continúa testeando.";
        continue;
      }

      console.log(`   📦 ${commands.length} comando(s) extraído(s)`);

      // Ejecutar cada comando y acumular resultados
      const results = [];
      for (const cmd of commands) {
        if (cmd.action === "done") {
          isDone = true;
          console.log("   ✅ Agente indicó fin del testing");
          break;
        }

        reporter.logAction(cmd.action, JSON.stringify(cmd).substring(0, 100));
        const result = await executeCommand(cmd);
        results.push({ command: cmd.action, result });
      }

      if (isDone) break;

      // Recopilar screenshots como blob attachments para visión
      const imageAttachments = [];
      for (const r of results) {
        if (r.command === "screenshot" && r.result.base64) {
          imageAttachments.push({
            type: "blob",
            data: r.result.base64,
            mimeType: r.result.mimeType,
            displayName: r.result.filename,
          });
        }
      }
      pendingAttachments = imageAttachments.slice(0, MAX_IMAGES_PER_TURN);

      // Preparar resumen de resultados (sin base64 en texto — se envía como adjunto)
      const resultsSummary = results
        .map((r) => {
          const textResult = { ...r.result };
          delete textResult.base64; // El agente ve la imagen via adjunto, no en texto
          return `[${r.command}] ${JSON.stringify(textResult).substring(0, 500)}`;
        })
        .join("\n\n");

      const visionNote = pendingAttachments.length > 0
        ? `\n\n📸 Se adjuntan ${pendingAttachments.length} screenshot(s) como imágenes. ANALIZA visualmente: layout, contraste, legibilidad, UX.`
        : "";

      currentMessage = `Resultados de tus ${results.length} comandos:\n\n${resultsSummary}${visionNote}\n\nAnaliza los resultados. Si encontraste problemas, repórtalos con report_issue. Decide qué testear a continuación, o emite {"action": "done"} si terminaste.`;
    }
  } catch (err) {
    console.log(`\n   ❌ Error en el loop principal: ${err.message}`);
    console.log("   Guardando informe parcial con lo recopilado...");
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n── Testing completado en ${elapsed}s ──────────────────\n`);

  // 6. Generar informe
  console.log("── Generando informe ──────────────────────────────");
  const report = await reporter.generateReport();

  // 7. Limpieza
  try { await session.disconnect(); } catch {}
  try { await client.stop(); } catch {}
  await browser.closeBrowser();
  _cleanupFn = null; // Ya no necesitamos el cleanup de SIGINT

  // 8. Resumen final
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`
╔══════════════════════════════════════════════════════╗
║  ✅ VIGÍA — Testing Completado                       ║
╠══════════════════════════════════════════════════════╣
║  Issues:   ${pad(`${report.totalIssues} (🔴 ${report.critical} 🟠 ${report.major} 🟡 ${report.minor})`, 40)}║
║  Acciones: ${pad(report.actionsExecuted, 40)}║
║  Duración: ${pad(report.durationMin + " min", 40)}║
║  Informe:  ${pad(report.filename, 40)}║
╚══════════════════════════════════════════════════════╝
  `);
}

// ── Ejecutar ───────────────────────────────────────────────
main().catch(async (err) => {
  console.error("\n❌ Error fatal:", err.message);
  console.error(err.stack);
  // Intentar guardar informe parcial incluso en error fatal
  try {
    const r = await reporter.generateReport();
    console.log(`   📄 Informe parcial guardado: ${r.filename}`);
  } catch { /* sin datos para guardar */ }
  try { await browser.closeBrowser(); } catch {}
  process.exit(1);
});
