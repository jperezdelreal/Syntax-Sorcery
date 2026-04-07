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
 *    node vigia.js --url https://site1.com --url https://site2.com
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
//  PARSEAR ARGUMENTOS (soporta múltiples --url)
// ════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const targetUrls = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url" && args[i + 1]) {
    targetUrls.push(args[i + 1]);
    i++; // skip the value
  }
}
if (targetUrls.length === 0) {
  targetUrls.push("https://citypulselabs.azurestaticapps.net");
}
const visibleMode = args.includes("--visible");

const urlDisplay = targetUrls.length === 1
  ? targetUrls[0]
  : `${targetUrls.length} URLs`;

console.log(`
╔══════════════════════════════════════════════════════╗
║  🔍 VIGÍA — Tester Autónomo de Apps Web              ║
║  v0.5.0 — Multi-URL support                         ║
╚══════════════════════════════════════════════════════╝

   URL${targetUrls.length > 1 ? "s" : ""} objetivo: ${targetUrls.length === 1 ? targetUrls[0] : ""}
${targetUrls.length > 1 ? targetUrls.map((u, i) => `     ${i + 1}. ${u}`).join("\n") : ""}\
   Modo: ${visibleMode ? "Visible (headed)" : "Headless"} Chromium
   Motor: GitHub Copilot SDK + Playwright
`);

// ════════════════════════════════════════════════════════════
//  PROMPT DEL SISTEMA — Instruye al agente a emitir JSON
// ════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Eres VIGÍA v0.4, agente autónomo de QA web con VISIÓN. Output: SOLO bloques JSON. NO uses herramientas del sistema (powershell, report_intent, etc.).

Formato: \`\`\`json {"commands": [{"action": "...", ...}]} \`\`\`

ACCIONES:
| Acción | Parámetros | Descripción |
|---|---|---|
| navigate | url | Abre URL |
| click | selector | Click CSS |
| click_text | text | Click por texto visible (más robusto) |
| type | selector, text | Escribe (fill) |
| type_and_select | selector, text | Escribe char-a-char + selecciona dropdown |
| screenshot | name | Captura (se te envía como imagen) |
| get_page_info | — | Links, botones, inputs, headings |
| check_performance | — | Tiempos de carga |
| check_accessibility | — | Auditoría axe-core WCAG |
| check_links | — | Detecta 404s y links rotos |
| wait_for_stable | — | Espera DOM estable |
| report_issue | title, description, severity | Reporta bug (critical/major/minor) |
| set_viewport | width, height | Emula dispositivo |
| wait | ms | Espera ms |
| done | — | Fin del testing |

CHECKLIST OBLIGATORIO (completar TODO antes de "done"):
1. HOMEPAGE: navigate → screenshot → get_page_info → check_performance
2. ACCESIBILIDAD: check_accessibility
3. LINKS: check_links
4. BÚSQUEDA: type_and_select en cada input (FUNCIÓN ESTRELLA — múltiples textos)
5. FORMULARIOS: type → submit → verificar
6. NAVEGACIÓN: click ≥3 links/botones, screenshot tras cada uno
7. MOBILE: set_viewport 375x667 → screenshot → comparar con desktop
8. INTERACTIVOS: markers, popups, dropdowns, tabs

REGLA ANTI-SALIDA: NO emitas done sin completar TODO el checklist. Si sobran turnos: edge cases (inputs vacíos, textos largos, caracteres especiales, resize). AGOTA tus turnos.

SELECTORES: Para botones usa click_text en vez de click con CSS complejos. Ejemplo: {"action":"click_text","text":"Mecánica"}.

REPORTING: Cada hallazgo = report_issue. type_and_select sin sugerencias → major. click falla → minor. Problema visual en screenshot → issue. Contraste bajo → major. Más issues = mejor. NO te guardes nada.

VISIÓN: Cada screenshot se te envía como imagen. Analiza layout, contraste, legibilidad. Compara desktop vs mobile. Reporta hallazgos visuales con report_issue.

METODOLOGÍA: Un flujo completo a la vez. Screenshot después de cada acción significativa. Prioriza: funcionalidad rota > accesibilidad > visual > UX. Usa wait_for_stable tras cambios async.`;

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

const MAX_TURNS = 15; // Límite de seguridad por URL
const MAX_IMAGES_PER_TURN = 5;

function createChecklist() {
  return {
    screenshot: false,
    page_info: false,
    accessibility: false,
    search: false,
    mobile: false,
  };
}

function getMissing(checklist) {
  const hints = {
    screenshot: '→ {"action":"screenshot","name":"homepage"}',
    page_info: '→ {"action":"get_page_info"}',
    accessibility: '→ {"action":"check_accessibility"}',
    search: '→ {"action":"type_and_select","selector":"input","text":"test"}',
    mobile: '→ {"action":"set_viewport","width":375,"height":667}',
  };
  return Object.entries(checklist)
    .filter(([, done]) => !done)
    .map(([key]) => hints[key]);
}

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
//  TEST DE UNA URL — Ejecuta el loop del agente para una URL
// ════════════════════════════════════════════════════════════

async function testSingleUrl(client, url, urlIndex, totalUrls) {
  const urlLabel = totalUrls > 1
    ? ` [${urlIndex + 1}/${totalUrls}]`
    : "";

  console.log(`\n${"█".repeat(55)}`);
  console.log(`   🌐 Testeando${urlLabel}: ${url}`);
  console.log(`${"█".repeat(55)}\n`);

  // Iniciar sesión de reporter para esta URL
  reporter.startSession(url);

  // Crear sesión SDK por URL (aislamiento limpio del contexto del agente)
  const session = await client.createSession({
    model: "gpt-4.1",
    streaming: true,
    onPermissionRequest: approveAll,
    systemMessage: {
      mode: "replace",
      content: SYSTEM_PROMPT,
    },
  });

  console.log(`   📋 Sesión VIGÍA: ${session.sessionId}`);

  session.on("session.error", (event) => {
    console.log(`   ❌ Error de sesión SDK: ${event.data?.message || "desconocido"}`);
  });

  console.log("\n── Iniciando testing autónomo ─────────────────────\n");

  const checklist = createChecklist();
  const startTime = Date.now();

  const mission = `Testea: ${url} — Tienes ${MAX_TURNS} turnos, ÚSALOS TODOS. Objetivo: ≥12 issues.

PLAN:
1. navigate ${url} → screenshot → get_page_info → check_performance
2. check_accessibility + check_links
3. type_and_select en cada input (múltiples textos)
4. type en formularios → submit → verificar
5. click ≥3 links/botones, screenshot tras cada uno
6. set_viewport 375x667 → screenshot → comparar con desktop
7. Elementos interactivos + edge cases
8. report_issue para CADA problema encontrado
9. done SOLO al completar todo

Si llevas <10 issues en turno 10, busca más. Empieza AHORA.`;

  let turn = 0;
  let isDone = false;
  let currentMessage = mission;
  let pendingAttachments = [];
  let issueCount = 0;

  try {
    while (turn < MAX_TURNS && !isDone && !_isShuttingDown) {
      turn++;
      console.log(`\n${"═".repeat(55)}`);
      console.log(`   🔄 Turno ${turn}/${MAX_TURNS}${urlLabel}`);
      if (pendingAttachments.length > 0) {
        console.log(`   🖼️  ${pendingAttachments.length} imagen(es) adjunta(s) para visión`);
      }
      console.log("─".repeat(55));

      const response = await sendAndCollect(session, currentMessage, pendingAttachments);
      pendingAttachments = [];
      console.log("\n");

      const commands = extractCommands(response);

      if (commands.length === 0) {
        console.log("   ⚠️  Sin comandos en esta respuesta. Pidiendo más acciones...");
        currentMessage = "No detecté comandos JSON en tu respuesta. Recuerda usar el formato ```json {\"commands\": [...]} ```. Continúa testeando.";
        continue;
      }

      console.log(`   📦 ${commands.length} comando(s) extraído(s)`);

      const results = [];
      for (const cmd of commands) {
        if (cmd.action === "done") {
          const missing = getMissing(checklist);
          if (missing.length > 0) {
            console.log(`   🚫 Agente quiso terminar pero faltan ${missing.length} items del checklist`);
            continue;
          }
          isDone = true;
          console.log("   ✅ Agente indicó fin del testing");
          break;
        }

        reporter.logAction(cmd.action, JSON.stringify(cmd).substring(0, 100));
        const result = await executeCommand(cmd);
        results.push({ command: cmd.action, result });
        if (cmd.action === "report_issue") issueCount++;

        if (cmd.action === "screenshot") checklist.screenshot = true;
        if (cmd.action === "get_page_info") checklist.page_info = true;
        if (cmd.action === "check_accessibility") checklist.accessibility = true;
        if (cmd.action === "type_and_select") checklist.search = true;
        if (cmd.action === "set_viewport" && cmd.width <= 480) checklist.mobile = true;
      }

      if (isDone) break;

      // Auto-report type_and_select failures
      for (const r of results) {
        if (r.command === "type_and_select" && r.result.selected === null) {
          reporter.reportIssue(
            `Búsqueda sin resultados: "${r.result.typed}"`,
            `Se escribió "${r.result.typed}" en el campo de búsqueda pero no aparecieron sugerencias de autocomplete. El usuario no puede seleccionar un destino sin sugerencias.`,
            "major"
          );
          console.log(`   🟠 Auto-issue: búsqueda "${r.result.typed}" sin sugerencias`);
          issueCount++;
        }
      }

      // Screenshots como blob attachments para visión
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

      const resultsSummary = results
        .map((r) => {
          const textResult = { ...r.result };
          delete textResult.base64;
          delete textResult.filepath;
          return `[${r.command}] ${JSON.stringify(textResult).substring(0, 200)}`;
        })
        .join("\n");

      const visionNote = pendingAttachments.length > 0
        ? `\n📸 ${pendingAttachments.length} screenshot(s) adjuntas.`
        : "";

      const missing = getMissing(checklist);
      const checklistHint = missing.length > 0 && turn >= 3
        ? ` Siguiente: ${missing[0]}`
        : "";

      const issueHint = turn >= 8 && issueCount < 10
        ? ` [${issueCount} issues — busca más]`
        : "";

      currentMessage = `Resultados (${results.length}):\n${resultsSummary}${visionNote}${checklistHint}${issueHint}`;
    }
  } catch (err) {
    console.log(`\n   ❌ Error testeando ${url}: ${err.message}`);
    console.log("   Continuando con siguiente URL si la hay...");
  }

  // Cerrar sesión de reporter y SDK para esta URL
  reporter.endUrlSession();
  try { await session.disconnect(); } catch {}

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n── Testing de ${url} completado en ${elapsed}s ──\n`);
}

// ════════════════════════════════════════════════════════════
//  LOOP PRINCIPAL — Orquesta testing de todas las URLs
// ════════════════════════════════════════════════════════════

async function main() {
  let client = null;

  _cleanupFn = async () => {
    try {
      const r = await reporter.generateReport();
      console.log(`   📄 Informe parcial guardado: ${r.filename}`);
    } catch { /* ignorar si no hay datos */ }
    try { if (client) await client.stop(); } catch {}
    try { await browser.closeBrowser(); } catch {}
  };

  // 1. Inicializar browser (compartido entre URLs)
  console.log("── Inicializando browser ──────────────────────────");
  await browser.initBrowser({ visible: visibleMode });

  // 2. Crear cliente SDK (compartido entre URLs)
  console.log("── Conectando con Copilot SDK ─────────────────────");
  client = new CopilotClient();
  await client.start();
  console.log("   🟢 Cliente SDK iniciado");

  const globalStart = Date.now();

  // 3. Testear cada URL secuencialmente, capturing session data
  const sessionSnapshots = [];
  for (let i = 0; i < targetUrls.length && !_isShuttingDown; i++) {
    await testSingleUrl(client, targetUrls[i], i, targetUrls.length);
    sessionSnapshots.push(reporter.captureSession());
  }

  const globalElapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
  console.log(`\n── Testing total completado en ${globalElapsed}s ──────────────────\n`);

  // 4. Generar informe — consolidado si multi-URL, simple si single-URL
  let report;
  if (targetUrls.length > 1) {
    console.log("── Generando informe consolidado ──────────────────");
    report = await reporter.generateConsolidatedReport(sessionSnapshots);
  } else {
    console.log("── Generando informe ──────────────────────────────");
    report = await reporter.generateReport();
  }

  // 5. Limpieza
  try { await client.stop(); } catch {}
  await browser.closeBrowser();
  _cleanupFn = null;

  // 6. Resumen final
  const pad = (s, n) => String(s).padEnd(n);
  const urlsSummary = targetUrls.length > 1
    ? `║  URLs:     ${pad(report.urlCount + " testeadas", 40)}║\n`
    : "";
  console.log(`
╔══════════════════════════════════════════════════════╗
║  ✅ VIGÍA — Testing Completado                       ║
╠══════════════════════════════════════════════════════╣
${urlsSummary}║  Issues:   ${pad(`${report.totalIssues} (🔴 ${report.critical} 🟠 ${report.major} 🟡 ${report.minor})`, 40)}║
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
  try {
    const r = await reporter.generateReport();
    console.log(`   📄 Informe parcial guardado: ${r.filename}`);
  } catch { /* sin datos para guardar */ }
  try { await browser.closeBrowser(); } catch {}
  process.exit(1);
});
