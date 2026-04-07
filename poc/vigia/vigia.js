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
║  v0.1.0 MVP                                          ║
╚══════════════════════════════════════════════════════╝

   URL objetivo: ${targetUrl}
   Modo: ${visibleMode ? "Visible (headed)" : "Headless"} Chromium
   Motor: GitHub Copilot SDK + Playwright
`);

// ════════════════════════════════════════════════════════════
//  PROMPT DEL SISTEMA — Instruye al agente a emitir JSON
// ════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Eres VIGÍA, un agente autónomo de QA para aplicaciones web.
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
- {"action": "screenshot", "name": "..."} — Captura screenshot con nombre descriptivo
- {"action": "get_page_info"} — Obtiene links, botones, inputs, headings, imágenes sin alt
- {"action": "check_performance"} — Mide tiempos de carga y recursos
- {"action": "report_issue", "title": "...", "description": "...", "severity": "critical|major|minor"}
- {"action": "set_viewport", "width": 375, "height": 667} — Emular dispositivo
- {"action": "wait", "ms": 1000} — Esperar milisegundos
- {"action": "done"} — Indica que terminaste el testing

PROTOCOLO:
1. Emite un bloque de comandos
2. Recibirás los resultados de cada comando
3. Analiza los resultados y decide el siguiente bloque
4. Reporta problemas con report_issue
5. Cuando termines, emite {"action": "done"} y un resumen

REGLAS:
- Emite SOLO bloques \`\`\`json ... \`\`\` — nada de texto suelto excepto análisis breve entre bloques
- Toma screenshots FRECUENTEMENTE
- Reporta TODOS los problemas con report_issue
- Sé específico: qué esperabas vs qué ocurrió
- Prioriza: funcionalidad rota > UX pobre > mejoras
- Testea: homepage, navegación, búsqueda/formularios, mobile viewport, accesibilidad básica`;

// ════════════════════════════════════════════════════════════
//  EJECUTOR DE COMANDOS — Traduce JSON a acciones Playwright
// ════════════════════════════════════════════════════════════

async function executeCommand(cmd) {
  switch (cmd.action) {
    case "navigate":
      return await browser.navigate(cmd.url);

    case "click":
      return await browser.click(cmd.selector);

    case "type":
      return await browser.type(cmd.selector, cmd.text);

    case "screenshot":
      return await browser.screenshot(cmd.name);

    case "get_page_info":
      return await browser.getPageInfo();

    case "check_performance":
      return await browser.checkPerformance();

    case "report_issue":
      return reporter.reportIssue(
        cmd.title,
        cmd.description,
        cmd.severity,
        cmd.screenshot || null
      );

    case "set_viewport":
      return await browser.setViewport(cmd.width, cmd.height);

    case "wait":
      return await browser.wait(cmd.ms);

    case "done":
      return { status: "done" };

    default:
      return { status: "error", error: `Acción desconocida: ${cmd.action}` };
  }
}

// ════════════════════════════════════════════════════════════
//  EXTRAER COMANDOS JSON — Parsea la respuesta del agente
// ════════════════════════════════════════════════════════════

function extractCommands(text) {
  const commands = [];
  // Buscar bloques ```json ... ```
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  let match;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.commands && Array.isArray(parsed.commands)) {
        commands.push(...parsed.commands);
      } else if (parsed.action) {
        commands.push(parsed);
      }
    } catch {
      // JSON inválido — intentar limpiar y parsear de nuevo
      try {
        const cleaned = match[1].trim().replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        const parsed = JSON.parse(cleaned);
        if (parsed.commands) commands.push(...parsed.commands);
        else if (parsed.action) commands.push(parsed);
      } catch {
        console.log(`   ⚠️  JSON inválido ignorado`);
      }
    }
  }

  // Fallback: buscar JSON suelto sin backticks
  if (commands.length === 0) {
    const looseJson = /\{"commands"\s*:\s*\[[\s\S]*?\]\s*\}/g;
    while ((match = looseJson.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.commands) commands.push(...parsed.commands);
      } catch { /* ignorar */ }
    }
  }

  return commands;
}

// ════════════════════════════════════════════════════════════
//  ENVIAR MENSAJE Y RECOGER RESPUESTA COMPLETA
// ════════════════════════════════════════════════════════════

async function sendAndCollect(session, message) {
  return new Promise((resolve) => {
    let fullText = "";

    const unsub1 = session.on("assistant.message_delta", (event) => {
      const delta = event.data.deltaContent;
      fullText += delta;
      process.stdout.write(delta);
    });

    const unsub2 = session.on("session.idle", () => {
      unsub1();
      unsub2();
      resolve(fullText);
    });

    session.send({ prompt: message });
  });
}

// ════════════════════════════════════════════════════════════
//  LOOP PRINCIPAL — El corazón de VIGÍA
// ════════════════════════════════════════════════════════════

const MAX_TURNS = 15; // Límite de seguridad

async function main() {
  // 1. Inicializar browser
  console.log("── Inicializando browser ──────────────────────────");
  await browser.initBrowser({ visible: visibleMode });

  // 2. Inicializar reporter
  reporter.startSession(targetUrl);

  // 3. Crear cliente SDK
  console.log("── Conectando con Copilot SDK ─────────────────────");
  const client = new CopilotClient();
  await client.start();
  console.log("   🟢 Cliente SDK iniciado");

  // 4. Crear sesión sin tools (evita competencia con built-ins)
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
  console.log("\n── Iniciando testing autónomo ─────────────────────\n");

  const startTime = Date.now();

  // 5. Misión inicial
  const mission = `Testea la aplicación web: ${targetUrl}

Plan:
1. Navega a ${targetUrl}, screenshot, get_page_info, check_performance
2. Explora links principales
3. Prueba búsquedas/formularios
4. set_viewport a 375x667 (mobile), navega homepage de nuevo, screenshot
5. Reporta TODOS los problemas con report_issue
6. Emite {"action": "done"} al terminar

Empieza ahora con tu primer bloque de comandos.`;

  let turn = 0;
  let isDone = false;
  let currentMessage = mission;

  while (turn < MAX_TURNS && !isDone) {
    turn++;
    console.log(`\n${"═".repeat(55)}`);
    console.log(`   🔄 Turno ${turn}/${MAX_TURNS}`);
    console.log("─".repeat(55));

    // Enviar al agente y recoger respuesta completa
    const response = await sendAndCollect(session, currentMessage);
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

    // Enviar resultados como siguiente mensaje
    const resultsSummary = results
      .map((r) => `[${r.command}] ${JSON.stringify(r.result).substring(0, 500)}`)
      .join("\n\n");

    currentMessage = `Resultados de tus ${results.length} comandos:\n\n${resultsSummary}\n\nAnaliza los resultados. Si encontraste problemas, repórtalos con report_issue. Decide qué testear a continuación, o emite {"action": "done"} si terminaste.`;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n── Testing completado en ${elapsed}s ──────────────────\n`);

  // 6. Generar informe
  console.log("── Generando informe ──────────────────────────────");
  const report = await reporter.generateReport();

  // 7. Limpieza
  await session.disconnect();
  await client.stop();
  await browser.closeBrowser();

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
main().catch((err) => {
  console.error("\n❌ Error fatal:", err.message);
  console.error(err.stack);
  process.exit(1);
});
