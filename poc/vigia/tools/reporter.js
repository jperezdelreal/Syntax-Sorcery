/**
 * ============================================================
 *  tools/reporter.js — Generador de informes VIGÍA
 * ============================================================
 *
 *  Acumula issues encontrados durante la sesión de testing
 *  y genera un informe Markdown con evidencia.
 *
 *  v0.6: JSON export alongside markdown for run comparison.
 *  v0.5: Soporta multi-URL via generateConsolidatedReport().
 *  startSession/generateReport mantienen backward compat.
 * ============================================================
 */

import { writeFile, mkdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, "..", "reports");
const SCREENSHOTS_DIR = join(__dirname, "..", "screenshots");

// ── Estado de la sesión (single-URL, backward compat) ──────
const issues = [];
const testLog = [];
let sessionStart = null;
let targetUrl = "";

/**
 * Inicia una nueva sesión de reporting (resetea estado anterior).
 */
export function startSession(url) {
  sessionStart = new Date();
  targetUrl = url;
  issues.length = 0;
  testLog.length = 0;
}

/**
 * Registra un issue encontrado.
 */
export function reportIssue(title, description, severity, screenshot = null) {
  const issue = {
    id: issues.length + 1,
    title,
    description,
    severity, // critical | major | minor
    screenshot,
    timestamp: new Date().toISOString(),
  };
  issues.push(issue);
  const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[severity] || "⚪";
  console.log(`   ${emoji} Issue #${issue.id}: [${severity}] ${title}`);
  return issue;
}

/**
 * Registra una acción en el log de testing.
 */
export function logAction(action, details) {
  testLog.push({
    action,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Captura un snapshot de la sesión actual para uso en multi-URL.
 * Devuelve un objeto con los datos de la sesión actual que puede
 * pasarse a generateConsolidatedReport().
 */
export function captureSession() {
  const now = new Date();
  return {
    url: targetUrl,
    issues: issues.map((i) => ({ ...i })),
    actions: testLog.map((l) => ({ ...l })),
    duration: now - sessionStart,
  };
}

/**
 * Genera el informe (single-URL) y lo guarda en reports/.
 * @param {string} outputFormat — "md" | "json" | "html" | "all"
 */
export async function generateReport(outputFormat = "md") {
  await mkdir(REPORTS_DIR, { recursive: true });

  const sessionEnd = new Date();
  const durationMs = sessionEnd - sessionStart;
  const durationMin = (durationMs / 60000).toFixed(1);

  const timestamp = sessionStart.toISOString().replace(/[:.]/g, "-").substring(0, 19);

  const critical = issues.filter((i) => i.severity === "critical").length;
  const major = issues.filter((i) => i.severity === "major").length;
  const minor = issues.filter((i) => i.severity === "minor").length;

  const wantMd = outputFormat === "md" || outputFormat === "all";
  const wantJson = outputFormat === "json" || outputFormat === "all";
  const wantHtml = outputFormat === "html" || outputFormat === "all";

  const result = {
    totalIssues: issues.length,
    critical,
    major,
    minor,
    durationMin: parseFloat(durationMin),
    actionsExecuted: testLog.length,
  };

  const sessionData = {
    url: targetUrl,
    issues: issues.map((i) => ({ ...i })),
    actions: testLog.map((l) => ({ ...l })),
    duration: durationMs,
  };

  // Markdown report
  if (wantMd) {
    const filename = `vigia-report-${timestamp}.md`;
    const filepath = join(REPORTS_DIR, filename);
    const md = buildMarkdownSingle({
      sessionEnd, targetUrl, durationMin, issues, testLog, critical, major, minor,
    });
    await writeFile(filepath, md, "utf-8");
    console.log(`\n   📄 Informe MD generado: ${filepath}`);
    result.filepath = filepath;
    result.filename = filename;
  }

  // JSON report
  if (wantJson) {
    const jsonData = buildJsonExport({
      urls: [targetUrl],
      sessions: [sessionData],
      totalIssues: issues.length,
      critical, major, minor,
      durationMin: parseFloat(durationMin),
      actionsExecuted: testLog.length,
      timestamp: sessionStart.toISOString(),
    });
    const jsonFilename = `vigia-data-${timestamp}.json`;
    const jsonFilepath = join(REPORTS_DIR, jsonFilename);
    await writeFile(jsonFilepath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`   📊 Datos JSON exportados: ${jsonFilepath}`);
    result.jsonFilepath = jsonFilepath;
    result.jsonFilename = jsonFilename;
  }

  // HTML report
  if (wantHtml) {
    const htmlFilename = `vigia-report-${timestamp}.html`;
    const htmlFilepath = join(REPORTS_DIR, htmlFilename);
    const html = await buildHtmlReport({
      urls: [targetUrl],
      sessions: [sessionData],
      totalIssues: issues.length,
      critical, major, minor,
      durationMin: parseFloat(durationMin),
      actionsExecuted: testLog.length,
      generatedAt: sessionEnd.toISOString(),
    });
    await writeFile(htmlFilepath, html, "utf-8");
    console.log(`   🌐 Informe HTML generado: ${htmlFilepath}`);
    result.htmlFilepath = htmlFilepath;
    result.htmlFilename = htmlFilename;
  }

  // Set filename to whichever was generated (prefer md > html > json for display)
  if (!result.filename) {
    result.filename = result.htmlFilename || result.jsonFilename || `vigia-report-${timestamp}`;
  }
  if (!result.filepath) {
    result.filepath = result.htmlFilepath || result.jsonFilepath;
  }

  return result;
}

/**
 * Builds the markdown content for a single-URL report.
 */
function buildMarkdownSingle({ sessionEnd, targetUrl, durationMin, issues, testLog, critical, major, minor }) {
  let md = `# 🔍 Informe VIGÍA — Testing Autónomo

> **Generado:** ${sessionEnd.toISOString()}  
> **URL objetivo:** ${targetUrl}  
> **Duración:** ${durationMin} minutos  
> **Issues encontrados:** ${issues.length} (🔴 ${critical} critical, 🟠 ${major} major, 🟡 ${minor} minor)

---

## Resumen Ejecutivo

VIGÍA analizó **${targetUrl}** de forma autónoma durante ${durationMin} minutos.
Se ejecutaron ${testLog.length} acciones de testing y se encontraron **${issues.length} issues**.

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Critical | ${critical} |
| 🟠 Major | ${major} |
| 🟡 Minor | ${minor} |

---

## Issues Encontrados

`;

  if (issues.length === 0) {
    md += `*No se encontraron issues durante esta sesión.*\n\n`;
  } else {
    const sorted = [...issues].sort((a, b) => {
      const order = { critical: 0, major: 1, minor: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    for (const issue of sorted) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      md += `### ${emoji} #${issue.id}: ${issue.title}

- **Severidad:** ${issue.severity}
- **Descripción:** ${issue.description}
`;
      if (issue.screenshot) {
        md += `- **Evidencia:** ![screenshot](../screenshots/${issue.screenshot})\n`;
      }
      md += `\n`;
    }
  }

  md += `---

## Log de Acciones

| # | Acción | Detalles | Timestamp |
|---|--------|---------|-----------|
`;

  for (let i = 0; i < testLog.length; i++) {
    const log = testLog[i];
    const details = typeof log.details === "string"
      ? log.details.substring(0, 80)
      : JSON.stringify(log.details).substring(0, 80);
    md += `| ${i + 1} | ${log.action} | ${details} | ${log.timestamp.substring(11, 19)} |\n`;
  }

  md += `
---

## Metadata

- **VIGÍA Version:** 0.5.0
- **Motor:** GitHub Copilot SDK + Playwright
- **Modelo:** gpt-4.1
- **Modo:** Headless Chromium
`;

  return md;
}

/**
 * Genera un informe consolidado multi-URL.
 * @param {Array<{url, issues, actions, duration}>} sessions
 * @param {string} outputFormat — "md" | "json" | "html" | "all"
 */
export async function generateConsolidatedReport(sessions, outputFormat = "md") {
  await mkdir(REPORTS_DIR, { recursive: true });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").substring(0, 19);

  const allIssues = sessions.flatMap((s) => s.issues);
  const allActions = sessions.flatMap((s) => s.actions);
  const totalDurationMs = sessions.reduce((sum, s) => sum + s.duration, 0);
  const durationMin = (totalDurationMs / 60000).toFixed(1);

  const critical = allIssues.filter((i) => i.severity === "critical").length;
  const major = allIssues.filter((i) => i.severity === "major").length;
  const minor = allIssues.filter((i) => i.severity === "minor").length;

  const urlCount = sessions.length;
  const urlList = sessions.map((s) => s.url);

  const wantMd = outputFormat === "md" || outputFormat === "all";
  const wantJson = outputFormat === "json" || outputFormat === "all";
  const wantHtml = outputFormat === "html" || outputFormat === "all";

  const result = {
    totalIssues: allIssues.length,
    critical,
    major,
    minor,
    durationMin: parseFloat(durationMin),
    actionsExecuted: allActions.length,
    urlCount,
  };

  // Markdown report
  if (wantMd) {
    const filename = `vigia-report-${timestamp}.md`;
    const filepath = join(REPORTS_DIR, filename);
    const md = buildMarkdownConsolidated({ now, sessions, allIssues, allActions, durationMin, critical, major, minor, urlCount, urlList });
    await writeFile(filepath, md, "utf-8");
    console.log(`\n   📄 Informe consolidado MD generado: ${filepath}`);
    result.filepath = filepath;
    result.filename = filename;
  }

  // JSON report
  if (wantJson) {
    const jsonData = buildJsonExport({
      urls: urlList,
      sessions: sessions.map((s) => ({
        url: s.url,
        issues: s.issues.map((i) => ({ ...i })),
        actions: s.actions.map((a) => ({ ...a })),
        duration: s.duration,
      })),
      totalIssues: allIssues.length,
      critical, major, minor,
      durationMin: parseFloat(durationMin),
      actionsExecuted: allActions.length,
      timestamp: now.toISOString(),
    });
    const jsonFilename = `vigia-data-${timestamp}.json`;
    const jsonFilepath = join(REPORTS_DIR, jsonFilename);
    await writeFile(jsonFilepath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`   📊 Datos JSON exportados: ${jsonFilepath}`);
    result.jsonFilepath = jsonFilepath;
    result.jsonFilename = jsonFilename;
  }

  // HTML report
  if (wantHtml) {
    const htmlFilename = `vigia-report-${timestamp}.html`;
    const htmlFilepath = join(REPORTS_DIR, htmlFilename);
    const html = await buildHtmlReport({
      urls: urlList,
      sessions: sessions.map((s) => ({
        url: s.url,
        issues: s.issues.map((i) => ({ ...i })),
        actions: s.actions.map((a) => ({ ...a })),
        duration: s.duration,
      })),
      totalIssues: allIssues.length,
      critical, major, minor,
      durationMin: parseFloat(durationMin),
      actionsExecuted: allActions.length,
      generatedAt: now.toISOString(),
    });
    await writeFile(htmlFilepath, html, "utf-8");
    console.log(`   🌐 Informe HTML generado: ${htmlFilepath}`);
    result.htmlFilepath = htmlFilepath;
    result.htmlFilename = htmlFilename;
  }

  // Set filename to whichever was generated (prefer md > html > json for display)
  if (!result.filename) {
    result.filename = result.htmlFilename || result.jsonFilename || `vigia-report-${timestamp}`;
  }
  if (!result.filepath) {
    result.filepath = result.htmlFilepath || result.jsonFilepath;
  }

  return result;
}

/**
 * Builds the markdown content for a consolidated multi-URL report.
 */
function buildMarkdownConsolidated({ now, sessions, allIssues, allActions, durationMin, critical, major, minor, urlCount, urlList }) {
  let md = `# 🔍 Informe VIGÍA — Testing Autónomo

> **Generado:** ${now.toISOString()}  
> **URLs objetivo:** ${urlList.join(", ")}  
> **Duración:** ${durationMin} minutos  
> **Issues encontrados:** ${allIssues.length} (🔴 ${critical} critical, 🟠 ${major} major, 🟡 ${minor} minor)

---

## Resumen Ejecutivo

VIGÍA analizó **${urlCount} URLs** de forma autónoma durante ${durationMin} minutos.
Se ejecutaron ${allActions.length} acciones de testing y se encontraron **${allIssues.length} issues**.

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Critical | ${critical} |
| 🟠 Major | ${major} |
| 🟡 Minor | ${minor} |

### Desglose por URL

| URL | Issues | 🔴 | 🟠 | 🟡 | Acciones |
|-----|--------|----|----|----|---------|\n`;

  for (const s of sessions) {
    const c = s.issues.filter((i) => i.severity === "critical").length;
    const m = s.issues.filter((i) => i.severity === "major").length;
    const n = s.issues.filter((i) => i.severity === "minor").length;
    md += `| ${s.url} | ${s.issues.length} | ${c} | ${m} | ${n} | ${s.actions.length} |\n`;
  }

  md += `\n---\n\n`;

  // Per-URL sections
  for (let si = 0; si < sessions.length; si++) {
    const s = sessions[si];
    const sDurationMin = (s.duration / 60000).toFixed(1);

    md += `## URL ${si + 1}: ${s.url}\n\n`;
    md += `> ${s.issues.length} issues, ${s.actions.length} acciones, ${sDurationMin} min\n\n`;
    md += `### Issues Encontrados\n\n`;

    if (s.issues.length === 0) {
      md += `*No se encontraron issues para esta URL.*\n\n`;
    } else {
      const sorted = [...s.issues].sort((a, b) => {
        const order = { critical: 0, major: 1, minor: 2 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
      });

      for (const issue of sorted) {
        const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
        md += `#### ${emoji} #${issue.id}: ${issue.title}

- **Severidad:** ${issue.severity}
- **Descripción:** ${issue.description}
`;
        if (issue.screenshot) {
          md += `- **Evidencia:** ![screenshot](../screenshots/${issue.screenshot})\n`;
        }
        md += `\n`;
      }
    }

    md += `### Log de Acciones\n\n`;
    md += `| # | Acción | Detalles | Timestamp |\n`;
    md += `|---|--------|---------|----------|\n`;

    for (let i = 0; i < s.actions.length; i++) {
      const log = s.actions[i];
      const details = typeof log.details === "string"
        ? log.details.substring(0, 80)
        : JSON.stringify(log.details).substring(0, 80);
      const ts = log.timestamp ? log.timestamp.substring(11, 19) : "";
      md += `| ${i + 1} | ${log.action} | ${details} | ${ts} |\n`;
    }

    md += `\n---\n\n`;
  }

  md += `## Metadata

- **VIGÍA Version:** 0.5.0
- **Motor:** GitHub Copilot SDK + Playwright
- **Modelo:** gpt-4.1
- **Modo:** Headless Chromium
- **URLs testeadas:** ${urlCount}
`;

  return md;
}

/**
 * Builds a self-contained HTML report with inline CSS.
 */
async function buildHtmlReport({ urls, sessions, totalIssues, critical, major, minor, durationMin, actionsExecuted, generatedAt }) {
  const allIssues = sessions.flatMap((s) => s.issues);

  // Try to embed screenshots as base64
  const screenshotCache = new Map();
  for (const issue of allIssues) {
    if (issue.screenshot && !screenshotCache.has(issue.screenshot)) {
      const screenshotPath = join(SCREENSHOTS_DIR, issue.screenshot);
      try {
        if (existsSync(screenshotPath)) {
          const buf = await readFile(screenshotPath);
          screenshotCache.set(issue.screenshot, buf.toString("base64"));
        }
      } catch { /* skip unreadable screenshots */ }
    }
  }

  const escHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const severityColor = { critical: "#dc2626", major: "#ea580c", minor: "#ca8a04", info: "#2563eb" };
  const severityBg = { critical: "#fef2f2", major: "#fff7ed", minor: "#fefce8", info: "#eff6ff" };
  const severityLabel = { critical: "Critical", major: "Major", minor: "Minor", info: "Info" };

  let issueRows = "";
  const sortedIssues = [...allIssues].sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2, info: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  for (const issue of sortedIssues) {
    const color = severityColor[issue.severity] || "#6b7280";
    const bg = severityBg[issue.severity] || "#f9fafb";
    issueRows += `<tr>
      <td>${issue.id}</td>
      <td><span class="severity-badge" style="background:${bg};color:${color};border:1px solid ${color}">${severityLabel[issue.severity] || issue.severity}</span></td>
      <td>${escHtml(issue.title)}</td>
      <td>${escHtml(issue.description)}</td>
    </tr>\n`;
  }

  // Screenshots section
  let screenshotsHtml = "";
  const issuesWithScreenshots = allIssues.filter((i) => i.screenshot);
  if (issuesWithScreenshots.length > 0) {
    screenshotsHtml = `<section class="card">
      <details>
        <summary><h2 style="display:inline">📸 Screenshots (${issuesWithScreenshots.length})</h2></summary>
        <div class="screenshots-grid">`;
    for (const issue of issuesWithScreenshots) {
      const b64 = screenshotCache.get(issue.screenshot);
      const imgTag = b64
        ? `<img src="data:image/png;base64,${b64}" alt="Screenshot for issue #${issue.id}" loading="lazy"/>`
        : `<p class="screenshot-path">📁 ${escHtml(issue.screenshot)}</p>`;
      screenshotsHtml += `<div class="screenshot-item">
        <h4>#${issue.id}: ${escHtml(issue.title)}</h4>
        ${imgTag}
      </div>`;
    }
    screenshotsHtml += `</div></details></section>`;
  }

  // Per-URL breakdown for multi-URL
  let urlBreakdownHtml = "";
  if (sessions.length > 1) {
    let urlRows = "";
    for (const s of sessions) {
      const c = s.issues.filter((i) => i.severity === "critical").length;
      const m = s.issues.filter((i) => i.severity === "major").length;
      const n = s.issues.filter((i) => i.severity === "minor").length;
      const acts = s.actions ? s.actions.length : 0;
      urlRows += `<tr>
        <td><a href="${escHtml(s.url)}" target="_blank">${escHtml(s.url)}</a></td>
        <td>${s.issues.length}</td>
        <td><span class="severity-badge" style="background:${severityBg.critical};color:${severityColor.critical}">${c}</span></td>
        <td><span class="severity-badge" style="background:${severityBg.major};color:${severityColor.major}">${m}</span></td>
        <td><span class="severity-badge" style="background:${severityBg.minor};color:${severityColor.minor}">${n}</span></td>
        <td>${acts}</td>
      </tr>\n`;
    }
    urlBreakdownHtml = `<section class="card">
      <details open>
        <summary><h2 style="display:inline">🌐 Desglose por URL</h2></summary>
        <table>
          <thead><tr><th>URL</th><th>Issues</th><th>Critical</th><th>Major</th><th>Minor</th><th>Acciones</th></tr></thead>
          <tbody>${urlRows}</tbody>
        </table>
      </details>
    </section>`;
  }

  // Actions log (collapsible)
  let actionsHtml = "";
  const allActions = sessions.flatMap((s) => s.actions || []);
  if (allActions.length > 0) {
    let actionRows = "";
    for (let i = 0; i < allActions.length; i++) {
      const a = allActions[i];
      const details = typeof a.details === "string"
        ? a.details.substring(0, 120)
        : JSON.stringify(a.details).substring(0, 120);
      const ts = a.timestamp ? a.timestamp.substring(11, 19) : "";
      actionRows += `<tr><td>${i + 1}</td><td>${escHtml(a.action)}</td><td>${escHtml(details)}</td><td>${ts}</td></tr>\n`;
    }
    actionsHtml = `<section class="card">
      <details>
        <summary><h2 style="display:inline">📋 Log de Acciones (${allActions.length})</h2></summary>
        <table>
          <thead><tr><th>#</th><th>Acción</th><th>Detalles</th><th>Hora</th></tr></thead>
          <tbody>${actionRows}</tbody>
        </table>
      </details>
    </section>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VIGÍA Report — ${escHtml(urls[0])} — ${generatedAt}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
  .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
  header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #f8fafc; padding: 32px 24px; border-radius: 12px; margin-bottom: 24px; }
  header h1 { font-size: 1.75rem; margin-bottom: 8px; }
  header .meta { font-size: 0.875rem; opacity: 0.85; line-height: 1.8; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #fff; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
  .stat-card .number { font-size: 2rem; font-weight: 700; }
  .stat-card .label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 4px; }
  .card { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
  .card h2 { font-size: 1.25rem; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  tr:hover td { background: #f8fafc; }
  .severity-badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
  details summary { cursor: pointer; user-select: none; padding: 4px 0; }
  details summary::-webkit-details-marker { margin-right: 8px; }
  .screenshots-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
  .screenshot-item { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .screenshot-item h4 { padding: 10px 12px; background: #f1f5f9; font-size: 0.85rem; }
  .screenshot-item img { width: 100%; height: auto; display: block; }
  .screenshot-path { padding: 12px; color: #64748b; font-size: 0.85rem; }
  footer { text-align: center; padding: 24px 0; color: #94a3b8; font-size: 0.8rem; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  @media (max-width: 640px) {
    .summary-grid { grid-template-columns: repeat(2, 1fr); }
    .screenshots-grid { grid-template-columns: 1fr; }
    header h1 { font-size: 1.3rem; }
    table { font-size: 0.8rem; }
    td, th { padding: 6px 8px; }
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🔍 VIGÍA — Informe de Testing Autónomo</h1>
    <div class="meta">
      <strong>URL${urls.length > 1 ? "s" : ""}:</strong> ${urls.map((u) => escHtml(u)).join(", ")}<br>
      <strong>Generado:</strong> ${generatedAt}<br>
      <strong>Duración:</strong> ${durationMin} min &nbsp;|&nbsp; <strong>Acciones:</strong> ${actionsExecuted}
    </div>
  </header>

  <div class="summary-grid">
    <div class="stat-card"><div class="number">${totalIssues}</div><div class="label">Issues Totales</div></div>
    <div class="stat-card"><div class="number" style="color:${severityColor.critical}">${critical}</div><div class="label">Critical</div></div>
    <div class="stat-card"><div class="number" style="color:${severityColor.major}">${major}</div><div class="label">Major</div></div>
    <div class="stat-card"><div class="number" style="color:${severityColor.minor}">${minor}</div><div class="label">Minor</div></div>
  </div>

  ${urlBreakdownHtml}

  <section class="card">
    <details open>
      <summary><h2 style="display:inline">🐛 Issues Encontrados (${totalIssues})</h2></summary>
      ${totalIssues === 0
        ? "<p style='color:#64748b;padding:12px 0'>No se encontraron issues durante esta sesión.</p>"
        : `<table>
          <thead><tr><th>#</th><th>Severidad</th><th>Título</th><th>Descripción</th></tr></thead>
          <tbody>${issueRows}</tbody>
        </table>`
      }
    </details>
  </section>

  ${screenshotsHtml}
  ${actionsHtml}

  <footer>
    VIGÍA v0.9.0 — GitHub Copilot SDK + Playwright — gpt-4.1
  </footer>
</div>
</body>
</html>`;
}

/**
 * Construye el objeto JSON estructurado para exportación.
 * Includes both flat fields (url, issues, timestamp) for backward compat
 * and structured sessions[] for the compare module.
 */
function buildJsonExport({ urls, sessions, totalIssues, critical, major, minor, durationMin, actionsExecuted, timestamp }) {
  const allIssues = sessions.flatMap((s) =>
    s.issues.map((i) => ({
      ...i,
      fingerprint: issueFingerprint(i),
    }))
  );

  const normalizedSessions = sessions.map((s) => ({
    url: s.url,
    issues: s.issues.map((i) => ({
      ...i,
      fingerprint: issueFingerprint(i),
    })),
    actionsCount: s.actions ? s.actions.length : 0,
    duration: s.duration,
  }));

  return {
    version: "0.6.0",
    url: urls[0],
    urls,
    timestamp,
    generatedAt: timestamp,
    summary: { totalIssues, critical, major, minor, durationMin, actionsExecuted },
    issues: allIssues,
    sessions: normalizedSessions,
  };
}

/**
 * Genera un fingerprint estable para un issue basado en título + severidad + URL implícita.
 * Usado para comparar issues entre ejecuciones.
 */
function issueFingerprint(issue) {
  const key = `${(issue.title || "").toLowerCase().trim()}|${issue.severity || "unknown"}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `vigia-${Math.abs(hash).toString(36)}`;
}

export { issueFingerprint as _issueFingerprint };

/**
 * Señaliza el fin de la sesión de una URL en modo multi-URL.
 * El estado se preserva para que captureSession() pueda leerlo.
 */
export function endUrlSession() {
  // no-op: state is intentionally preserved for captureSession()
}

/**
 * Devuelve el estado actual de los issues.
 */
export function getIssuesSummary() {
  return {
    total: issues.length,
    critical: issues.filter((i) => i.severity === "critical").length,
    major: issues.filter((i) => i.severity === "major").length,
    minor: issues.filter((i) => i.severity === "minor").length,
    issues: issues.map((i) => ({ id: i.id, title: i.title, severity: i.severity })),
  };
}
