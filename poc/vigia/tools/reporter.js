/**
 * ============================================================
 *  tools/reporter.js — Generador de informes VIGÍA
 * ============================================================
 *
 *  Acumula issues encontrados durante la sesión de testing
 *  y genera un informe Markdown con evidencia.
 *
 *  v0.5: Soporta multi-URL via generateConsolidatedReport().
 *  startSession/generateReport mantienen backward compat.
 * ============================================================
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, "..", "reports");

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
 * Genera el informe Markdown (single-URL) y lo guarda en reports/.
 */
export async function generateReport() {
  await mkdir(REPORTS_DIR, { recursive: true });

  const sessionEnd = new Date();
  const durationMs = sessionEnd - sessionStart;
  const durationMin = (durationMs / 60000).toFixed(1);

  const timestamp = sessionStart.toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename = `vigia-report-${timestamp}.md`;
  const filepath = join(REPORTS_DIR, filename);

  const critical = issues.filter((i) => i.severity === "critical").length;
  const major = issues.filter((i) => i.severity === "major").length;
  const minor = issues.filter((i) => i.severity === "minor").length;

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

  await writeFile(filepath, md, "utf-8");
  console.log(`\n   📄 Informe generado: ${filepath}`);

  return {
    filepath,
    filename,
    totalIssues: issues.length,
    critical,
    major,
    minor,
    durationMin: parseFloat(durationMin),
    actionsExecuted: testLog.length,
  };
}

/**
 * Genera un informe consolidado multi-URL.
 * @param {Array<{url, issues, actions, duration}>} sessions
 */
export async function generateConsolidatedReport(sessions) {
  await mkdir(REPORTS_DIR, { recursive: true });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename = `vigia-report-${timestamp}.md`;
  const filepath = join(REPORTS_DIR, filename);

  const allIssues = sessions.flatMap((s) => s.issues);
  const allActions = sessions.flatMap((s) => s.actions);
  const totalDurationMs = sessions.reduce((sum, s) => sum + s.duration, 0);
  const durationMin = (totalDurationMs / 60000).toFixed(1);

  const critical = allIssues.filter((i) => i.severity === "critical").length;
  const major = allIssues.filter((i) => i.severity === "major").length;
  const minor = allIssues.filter((i) => i.severity === "minor").length;

  const urlCount = sessions.length;
  const urlList = sessions.map((s) => s.url);

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

  await writeFile(filepath, md, "utf-8");
  console.log(`\n   📄 Informe consolidado generado: ${filepath}`);

  return {
    filepath,
    filename,
    totalIssues: allIssues.length,
    critical,
    major,
    minor,
    durationMin: parseFloat(durationMin),
    actionsExecuted: allActions.length,
    urlCount,
  };
}

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
