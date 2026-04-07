/**
 * ============================================================
 *  lib/regression.js — Regression re-testing for VIGÍA
 * ============================================================
 *
 *  Reads a previous VIGÍA JSON report, builds a re-test plan
 *  targeting only the URLs/areas that had issues, then compares
 *  fresh results against the baseline to categorize each issue:
 *
 *    ✅ resolved  — was in baseline, not in re-test
 *    ❌ persists  — still present in re-test
 *    🆕 new       — found in re-test but not in baseline
 *
 *  v0.9.0 — Issue #169
 * ============================================================
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadReport, extractIssueMap } from "./compare.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, "..", "reports");

/**
 * Loads and validates a previous VIGÍA JSON report for regression testing.
 * @param {string} filepath — path to the JSON report
 * @returns {Promise<object>} parsed report data
 */
export async function loadBaselineReport(filepath) {
  const report = await loadReport(filepath);

  if (!report.sessions || report.sessions.length === 0) {
    throw new Error(`El reporte no contiene sesiones: ${filepath}`);
  }

  return report;
}

/**
 * Builds a regression test plan from a baseline report.
 * Extracts URLs that had issues and the issues themselves.
 *
 * @param {object} baselineReport — parsed VIGÍA report
 * @returns {{ urls: string[], issuesByUrl: Map<string, object[]>, totalIssues: number }}
 */
export function buildRegressionPlan(baselineReport) {
  const issuesByUrl = new Map();
  let totalIssues = 0;

  for (const session of baselineReport.sessions) {
    if (session.issues && session.issues.length > 0) {
      const url = session.url;
      if (!issuesByUrl.has(url)) {
        issuesByUrl.set(url, []);
      }
      for (const issue of session.issues) {
        issuesByUrl.get(url).push({
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          fingerprint: issue.fingerprint,
        });
        totalIssues++;
      }
    }
  }

  const urls = [...issuesByUrl.keys()];

  return { urls, issuesByUrl, totalIssues };
}

/**
 * Categorizes issues after a re-test by comparing baseline vs new results.
 *
 * @param {object} baselineReport — the original report (loaded via loadBaselineReport)
 * @param {object} retestReport — the fresh report from the re-test run
 * @returns {object} regression result with resolved, persists, and new arrays
 */
export function categorizeRegressionResults(baselineReport, retestReport) {
  const baselineIssues = extractIssueMap(baselineReport);
  const retestIssues = extractIssueMap(retestReport);

  const resolved = [];
  const persists = [];
  const newIssues = [];

  // Check baseline issues: resolved or persists?
  for (const [fp, issue] of baselineIssues) {
    if (retestIssues.has(fp)) {
      persists.push({ ...issue, regressionStatus: "persists" });
    } else {
      resolved.push({ ...issue, regressionStatus: "resolved" });
    }
  }

  // Check retest issues: new ones?
  for (const [fp, issue] of retestIssues) {
    if (!baselineIssues.has(fp)) {
      newIssues.push({ ...issue, regressionStatus: "new" });
    }
  }

  return {
    baseline: {
      generatedAt: baselineReport.generatedAt,
      urls: baselineReport.urls,
      totalIssues: baselineReport.summary?.totalIssues ?? baselineIssues.size,
    },
    resolved,
    persists,
    new: newIssues,
    summary: {
      resolvedCount: resolved.length,
      persistsCount: persists.length,
      newCount: newIssues.length,
      baselineTotal: baselineIssues.size,
      retestTotal: retestIssues.size,
    },
  };
}

/**
 * Generates a regression report (JSON + terminal output).
 *
 * @param {object} regressionResult — from categorizeRegressionResults()
 * @returns {Promise<{ filepath: string, filename: string }>}
 */
export async function generateRegressionReport(regressionResult) {
  await mkdir(REPORTS_DIR, { recursive: true });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename = `vigia-regression-${timestamp}.json`;
  const filepath = join(REPORTS_DIR, filename);

  const reportData = {
    version: "0.9.0",
    type: "regression",
    generatedAt: now.toISOString(),
    baseline: regressionResult.baseline,
    summary: regressionResult.summary,
    resolved: regressionResult.resolved,
    persists: regressionResult.persists,
    new: regressionResult.new,
  };

  await writeFile(filepath, JSON.stringify(reportData, null, 2), "utf-8");

  return { filepath, filename, data: reportData };
}

/**
 * Formats regression results as human-readable terminal output.
 *
 * @param {object} regressionResult — from categorizeRegressionResults()
 * @returns {string}
 */
export function formatRegressionOutput(regressionResult) {
  const { baseline, resolved, persists, summary } = regressionResult;
  const newIssues = regressionResult.new;
  const lines = [];

  lines.push("╔══════════════════════════════════════════════════════╗");
  lines.push("║  🔍 VIGÍA — Informe de Regresión                    ║");
  lines.push("╚══════════════════════════════════════════════════════╝");
  lines.push("");

  lines.push(`   📅 Baseline: ${baseline.generatedAt}`);
  lines.push(`      URLs: ${baseline.urls.join(", ")}`);
  lines.push(`      Issues originales: ${baseline.totalIssues}`);
  lines.push("");

  lines.push("── Resumen ────────────────────────────────────────────");
  lines.push(`   ✅ Resueltos:    ${summary.resolvedCount}`);
  lines.push(`   ❌ Persisten:    ${summary.persistsCount}`);
  lines.push(`   🆕 Nuevos:       ${summary.newCount}`);
  lines.push("");

  if (resolved.length > 0) {
    lines.push("── ✅ Issues Resueltos ─────────────────────────────────");
    for (const issue of resolved) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (persists.length > 0) {
    lines.push("── ❌ Issues que Persisten ─────────────────────────────");
    for (const issue of persists) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (newIssues.length > 0) {
    lines.push("── 🆕 Issues Nuevos ───────────────────────────────────");
    for (const issue of newIssues) {
      const emoji = { critical: "🔴", major: "🟠", minor: "🟡" }[issue.severity] || "⚪";
      lines.push(`   ${emoji} [${issue.severity}] ${issue.title}`);
      if (issue.url) lines.push(`      URL: ${issue.url}`);
    }
    lines.push("");
  }

  if (resolved.length === 0 && persists.length === 0 && newIssues.length === 0) {
    lines.push("   ℹ️  Sin issues en el baseline ni en el re-test.");
    lines.push("");
  }

  return lines.join("\n");
}
