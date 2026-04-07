/**
 * ============================================================
 *  tools/reporter.js — Generador de informes VIGÍA
 * ============================================================
 *
 *  Acumula issues encontrados durante la sesión de testing
 *  y genera un informe Markdown con evidencia.
 * ============================================================
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, "..", "reports");

// ── Estado de la sesión ────────────────────────────────────
const issues = [];
const testLog = [];
let sessionStart = null;
let targetUrl = "";

/**
 * Inicia una nueva sesión de reporting.
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
 * Genera el informe Markdown y lo guarda en reports/.
 */
export async function generateReport() {
  await mkdir(REPORTS_DIR, { recursive: true });

  const sessionEnd = new Date();
  const durationMs = sessionEnd - sessionStart;
  const durationMin = (durationMs / 60000).toFixed(1);

  const timestamp = sessionStart.toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename = `vigia-report-${timestamp}.md`;
  const filepath = join(REPORTS_DIR, filename);

  // Contar por severidad
  const critical = issues.filter((i) => i.severity === "critical").length;
  const major = issues.filter((i) => i.severity === "major").length;
  const minor = issues.filter((i) => i.severity === "minor").length;

  // ── Generar Markdown ─────────────────────────────────────
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
    // Ordenar: critical > major > minor
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

- **VIGÍA Version:** 0.2.0
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
