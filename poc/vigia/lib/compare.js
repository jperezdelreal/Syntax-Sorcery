/**
 * ============================================================
 *  lib/compare.js — Comparación entre ejecuciones VIGÍA
 * ============================================================
 *
 *  Lee dos JSON de reportes y produce un diff estructurado:
 *  - Issues nuevas (en B pero no en A)
 *  - Issues resueltas (en A pero no en B)
 *  - Issues persistentes (en ambas)
 *  - Regresiones (resueltas en una ejecución previa, reaparecen)
 *
 *  v0.6.0
 * ============================================================
 */

import { readFile } from "fs/promises";

/**
 * Carga y parsea un archivo JSON de reporte VIGÍA.
 * @param {string} filepath - Ruta al archivo JSON
 * @returns {object} Datos del reporte parseados
 */
export async function loadReport(filepath) {
  const raw = await readFile(filepath, "utf-8");
  const data = JSON.parse(raw);

  if (!data.version && !data.issues && !data.sessions) {
    throw new Error(`Archivo no es un reporte VIGÍA válido: ${filepath}`);
  }

  // Normalize flat format → structured format
  if (!data.sessions && data.issues) {
    data.sessions = [{
      url: data.url || "unknown",
      issues: data.issues.map((i) => ({
        ...i,
        fingerprint: i.fingerprint || `${i.title}::${i.description}`,
      })),
      actionsCount: 0,
      duration: 0,
    }];
    data.urls = data.urls || [data.url || "unknown"];
    data.generatedAt = data.generatedAt || data.timestamp;
    data.summary = data.summary || { totalIssues: data.issues.length };
  }

  return data;
}

/**
 * Extrae todos los issues de un reporte, aplanando sesiones.
 * @param {object} report - Reporte parseado
 * @returns {Map<string, object>} Mapa fingerprint → issue (con url añadida)
 */
export function extractIssueMap(report) {
  const map = new Map();

  for (const session of report.sessions) {
    for (const issue of session.issues) {
      const fp = issue.fingerprint;
      if (!map.has(fp)) {
        map.set(fp, { ...issue, url: session.url });
      }
    }
  }

  return map;
}

/**
 * Compara dos reportes y devuelve el diff estructurado.
 *
 * @param {object} reportA - Reporte anterior (baseline)
 * @param {object} reportB - Reporte nuevo (current)
 * @param {object} [reportPrev] - Reporte previo al baseline (para detectar regresiones)
 * @returns {object} Resultado del diff
 */
export function compareReports(reportA, reportB, reportPrev = null) {
  const issuesA = extractIssueMap(reportA);
  const issuesB = extractIssueMap(reportB);

  const newIssues = [];
  const resolved = [];
  const persistent = [];
  const regressions = [];

  // Issues previas al baseline (para detectar regresiones)
  const issuesPrev = reportPrev ? extractIssueMap(reportPrev) : null;

  // Issues en B que no están en A → nuevas (o regresiones)
  for (const [fp, issue] of issuesB) {
    if (!issuesA.has(fp)) {
      // ¿Es una regresión? (existía antes de A, desapareció en A, vuelve en B)
      if (issuesPrev && issuesPrev.has(fp)) {
        regressions.push({ ...issue, status: "regression" });
      } else {
        newIssues.push({ ...issue, status: "new" });
      }
    } else {
      persistent.push({ ...issue, status: "persistent" });
    }
  }

  // Issues en A que no están en B → resueltas
  for (const [fp, issue] of issuesA) {
    if (!issuesB.has(fp)) {
      resolved.push({ ...issue, status: "resolved" });
    }
  }

  return {
    baseline: {
      generatedAt: reportA.generatedAt,
      urls: reportA.urls,
      totalIssues: reportA.summary.totalIssues,
    },
    current: {
      generatedAt: reportB.generatedAt,
      urls: reportB.urls,
      totalIssues: reportB.summary.totalIssues,
    },
    diff: {
      new: newIssues,
      resolved,
      persistent,
      regressions,
    },
    summary: {
      newCount: newIssues.length,
      resolvedCount: resolved.length,
      persistentCount: persistent.length,
      regressionCount: regressions.length,
      trend: reportB.summary.totalIssues - reportA.summary.totalIssues,
    },
  };
}

/**
 * Formatea el resultado de comparación como texto legible para la terminal.
 * @param {object} result - Resultado de compareReports()
 * @returns {string} Texto formateado
 */
export function formatComparisonOutput(result) {
  const { baseline, current, diff, summary } = result;
  const lines = [];

  lines.push("╔══════════════════════════════════════════════════════╗");
  lines.push("║  🔍 VIGÍA — Comparación de Ejecuciones              ║");
  lines.push("╚══════════════════════════════════════════════════════╝");
  lines.push("");

  lines.push(`   📅 Baseline: ${baseline.generatedAt}`);
  lines.push(`      URLs: ${baseline.urls.join(", ")}`);
  lines.push(`      Issues: ${baseline.totalIssues}`);
  lines.push("");
  lines.push(`   📅 Current:  ${current.generatedAt}`);
  lines.push(`      URLs: ${current.urls.join(", ")}`);
  lines.push(`      Issues: ${current.totalIssues}`);
  lines.push("");

  const trendArrow = summary.trend > 0 ? "📈" : summary.trend < 0 ? "📉" : "➡️";
  const trendSign = summary.trend > 0 ? "+" : "";
  lines.push("── Resumen ────────────────────────────────────────────");
  lines.push(`   ${trendArrow} Tendencia: ${trendSign}${summary.trend} issues`);
  lines.push(`   🆕 Nuevas:       ${summary.newCount}`);
  lines.push(`   ✅ Resueltas:    ${summary.resolvedCount}`);
  lines.push(`   🔄 Persistentes: ${summary.persistentCount}`);
  if (summary.regressionCount > 0) {
    lines.push(`   ⚠️  Regresiones:  ${summary.regressionCount}`);
  }
  lines.push("");

  if (diff.regressions.length > 0) {
    lines.push("── ⚠️  Regresiones (volvieron después de resolverse) ───");
    for (const issue of diff.regressions) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (diff.new.length > 0) {
    lines.push("── 🆕 Issues Nuevas ───────────────────────────────────");
    for (const issue of diff.new) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (diff.resolved.length > 0) {
    lines.push("── ✅ Issues Resueltas ─────────────────────────────────");
    for (const issue of diff.resolved) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (diff.persistent.length > 0) {
    lines.push("── 🔄 Issues Persistentes ─────────────────────────────");
    for (const issue of diff.persistent) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
    }
    lines.push("");
  }

  if (diff.new.length === 0 && diff.resolved.length === 0 && diff.regressions.length === 0) {
    lines.push("   ℹ️  Sin cambios entre las dos ejecuciones.");
    lines.push("");
  }

  return lines.join("\n");
}
