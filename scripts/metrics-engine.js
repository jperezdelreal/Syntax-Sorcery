#!/usr/bin/env node
'use strict';

/**
 * Autonomous Performance Metrics Engine
 *
 * Aggregates GitHub data into KPIs for measuring autonomous development
 * performance: velocity, cycle time, quality rate, test growth, throughput,
 * and streak.
 *
 * Usage:
 *   node scripts/metrics-engine.js
 *   node scripts/metrics-engine.js --since 2026-03-01 --until 2026-03-20
 *   node scripts/metrics-engine.js --json
 *   node scripts/metrics-engine.js --save
 *
 * Flags:
 *   --since   Start date (ISO 8601 or YYYY-MM-DD). Default: 7 days ago
 *   --until   End date (ISO 8601 or YYYY-MM-DD). Default: now
 *   --json    Output raw JSON instead of human-readable table
 *   --save    Save snapshot to docs/metrics/YYYY-MM-DD.json
 *
 * Exit codes:
 *   0 — success
 *   1 — error
 *
 * Requires: gh CLI authenticated with repo scope.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { since: null, until: null, json: false, save: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since' && args[i + 1]) {
      result.since = args[++i];
    } else if (args[i] === '--until' && args[i + 1]) {
      result.until = args[++i];
    } else if (args[i] === '--json') {
      result.json = true;
    } else if (args[i] === '--save') {
      result.save = true;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Default date range (last 7 days)
// ---------------------------------------------------------------------------

function getDefaultDateRange() {
  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    since: since.toISOString(),
    until: now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// gh CLI helpers (injectable for testing)
// ---------------------------------------------------------------------------

function defaultExecGh(cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    timeout: 30_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function fetchClosedIssues(since, execGh) {
  const cmd = `gh issue list --state closed --json number,title,createdAt,closedAt,labels --limit 100 --search "closed:>=${since}"`;
  return JSON.parse(execGh(cmd));
}

function fetchAllIssues(since, execGh) {
  const cmd = `gh issue list --state all --json number,title,createdAt,closedAt,state,labels --limit 100 --search "created:>=${since}"`;
  return JSON.parse(execGh(cmd));
}

function fetchMergedPRs(since, execGh) {
  const cmd = `gh pr list --state merged --json number,title,createdAt,mergedAt,closingIssuesReferences --limit 100 --search "merged:>=${since}"`;
  return JSON.parse(execGh(cmd));
}

function fetchClosedPRs(since, execGh) {
  const cmd = `gh pr list --state closed --json number,title,createdAt,mergedAt,closedAt --limit 100 --search "closed:>=${since}"`;
  return JSON.parse(execGh(cmd));
}

function fetchTestCount(execGh) {
  try {
    const raw = execGh('npx vitest run --reporter=json 2>&1');
    const data = JSON.parse(raw);
    return data.numTotalTests || 0;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metric computations
// ---------------------------------------------------------------------------

/**
 * Velocity: issues closed per session (approximated as issues closed / days)
 */
function computeVelocity(closedIssues, since, until) {
  const days = (new Date(until) - new Date(since)) / (1000 * 60 * 60 * 24);
  const sessionDays = Math.max(days, 1);
  const count = closedIssues.length;
  return {
    value: Math.round((count / sessionDays) * 100) / 100,
    unit: 'issues/day',
    raw: count,
  };
}

/**
 * Cycle time: average hours from issue creation to PR merge
 */
function computeCycleTime(mergedPRs) {
  const cycleTimes = [];

  for (const pr of mergedPRs) {
    const refs = pr.closingIssuesReferences || [];
    if (refs.length === 0) continue;

    const mergedAt = new Date(pr.mergedAt);
    for (const ref of refs) {
      if (ref.createdAt) {
        const created = new Date(ref.createdAt);
        const hours = (mergedAt - created) / (1000 * 60 * 60);
        if (hours >= 0) cycleTimes.push(hours);
      }
    }
  }

  if (cycleTimes.length === 0) {
    return { value: null, unit: 'hours', raw: 0 };
  }

  const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
  return {
    value: Math.round(avg * 100) / 100,
    unit: 'hours',
    raw: cycleTimes.length,
  };
}

/**
 * Quality rate: merge % vs rejection %
 */
function computeQualityRate(mergedPRs, closedPRs) {
  // closedPRs includes both merged and rejected; filter out merged
  const mergedNumbers = new Set(mergedPRs.map((pr) => pr.number));
  const rejected = closedPRs.filter((pr) => !pr.mergedAt && !mergedNumbers.has(pr.number));
  const total = mergedPRs.length + rejected.length;

  if (total === 0) {
    return { value: null, unit: '%', merged: 0, rejected: 0, total: 0 };
  }

  const rate = Math.round((mergedPRs.length / total) * 10000) / 100;
  return {
    value: rate,
    unit: '%',
    merged: mergedPRs.length,
    rejected: rejected.length,
    total,
  };
}

/**
 * Test growth: current test count
 */
function computeTestGrowth(testCount) {
  return {
    value: testCount,
    unit: 'tests',
  };
}

/**
 * Throughput: PRs merged per day
 */
function computeThroughput(mergedPRs, since, until) {
  const days = (new Date(until) - new Date(since)) / (1000 * 60 * 60 * 24);
  const sessionDays = Math.max(days, 1);
  const count = mergedPRs.length;
  return {
    value: Math.round((count / sessionDays) * 100) / 100,
    unit: 'PRs/day',
    raw: count,
  };
}

/**
 * Streak: consecutive days with at least one merged PR
 */
function computeStreak(mergedPRs) {
  if (mergedPRs.length === 0) {
    return { value: 0, unit: 'days' };
  }

  const mergeDates = new Set(
    mergedPRs.map((pr) => pr.mergedAt.split('T')[0])
  );

  const sorted = [...mergeDates].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);
    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return { value: streak, unit: 'days' };
}

// ---------------------------------------------------------------------------
// Trend comparison
// ---------------------------------------------------------------------------

function computeTrend(current, previous) {
  if (previous === null || previous === undefined || current === null || current === undefined) {
    return 'NEW';
  }
  if (current > previous) return 'UP';
  if (current < previous) return 'DOWN';
  return 'FLAT';
}

function trendIndicator(trend) {
  switch (trend) {
    case 'UP': return '▲';
    case 'DOWN': return '▼';
    case 'FLAT': return '→';
    case 'NEW': return '★';
    default: return '?';
  }
}

function compareWithPrevious(metrics, previousSnapshot) {
  if (!previousSnapshot || !previousSnapshot.metrics) {
    return Object.fromEntries(
      Object.entries(metrics).map(([key, m]) => [key, 'NEW'])
    );
  }

  const prev = previousSnapshot.metrics;
  const trends = {};

  for (const key of Object.keys(metrics)) {
    const currVal = metrics[key].value;
    const prevVal = prev[key] ? prev[key].value : null;
    trends[key] = computeTrend(currVal, prevVal);
  }

  return trends;
}

// ---------------------------------------------------------------------------
// Snapshot I/O
// ---------------------------------------------------------------------------

function getSnapshotPath(date) {
  const dateStr = date.split('T')[0];
  return path.join('docs', 'metrics', `${dateStr}.json`);
}

function loadPreviousSnapshot(snapshotDir, readFileFn) {
  const readFile = readFileFn || ((p) => fs.readFileSync(p, 'utf8'));

  let dir;
  try {
    dir = fs.readdirSync(snapshotDir);
  } catch {
    return null;
  }

  const jsonFiles = dir
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();

  if (jsonFiles.length === 0) return null;

  try {
    const content = readFile(path.join(snapshotDir, jsonFiles[0]));
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function defaultWriteFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---------------------------------------------------------------------------
// Human-readable table
// ---------------------------------------------------------------------------

function formatTable(metrics, trends) {
  const rows = [
    ['Metric', 'Value', 'Unit', 'Trend'],
    ['──────────────', '──────', '──────────', '─────'],
  ];

  const labels = {
    velocity: 'Velocity',
    cycleTime: 'Cycle Time',
    qualityRate: 'Quality Rate',
    testGrowth: 'Test Growth',
    throughput: 'Throughput',
    streak: 'Streak',
  };

  for (const [key, label] of Object.entries(labels)) {
    const m = metrics[key];
    if (!m) continue;
    const val = m.value !== null && m.value !== undefined ? String(m.value) : 'N/A';
    const trend = trends[key] || 'NEW';
    rows.push([label, val, m.unit, `${trendIndicator(trend)} ${trend}`]);
  }

  // Calculate column widths
  const widths = rows[0].map((_, col) =>
    Math.max(...rows.map((row) => (row[col] || '').length))
  );

  return rows.map((row) =>
    row.map((cell, i) => (cell || '').padEnd(widths[i])).join('  ')
  ).join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run(argv, deps) {
  const execGh = (deps && deps.execGh) || defaultExecGh;
  const writeFile = (deps && deps.writeFile) || defaultWriteFile;
  const readFile = deps && deps.readFile;
  const snapshotDirOverride = deps && deps.snapshotDir;

  const parsed = parseArgs(argv || process.argv);
  const defaults = getDefaultDateRange();
  const since = parsed.since || defaults.since;
  const until = parsed.until || defaults.until;

  // Fetch data
  let closedIssues, allIssues, mergedPRs, closedPRs, testCount;

  try {
    closedIssues = fetchClosedIssues(since, execGh);
  } catch (err) {
    console.error(`Metrics: failed to fetch closed issues — ${err.message}`);
    return { exitCode: 1 };
  }

  try {
    allIssues = fetchAllIssues(since, execGh);
  } catch (err) {
    console.error(`Metrics: failed to fetch issues — ${err.message}`);
    return { exitCode: 1 };
  }

  try {
    mergedPRs = fetchMergedPRs(since, execGh);
  } catch (err) {
    console.error(`Metrics: failed to fetch merged PRs — ${err.message}`);
    return { exitCode: 1 };
  }

  try {
    closedPRs = fetchClosedPRs(since, execGh);
  } catch (err) {
    console.error(`Metrics: failed to fetch closed PRs — ${err.message}`);
    return { exitCode: 1 };
  }

  try {
    testCount = fetchTestCount(execGh);
  } catch {
    testCount = null;
  }

  // Compute metrics
  const metrics = {
    velocity: computeVelocity(closedIssues, since, until),
    cycleTime: computeCycleTime(mergedPRs),
    qualityRate: computeQualityRate(mergedPRs, closedPRs),
    testGrowth: computeTestGrowth(testCount),
    throughput: computeThroughput(mergedPRs, since, until),
    streak: computeStreak(mergedPRs),
  };

  // Load previous snapshot for trend comparison
  const snapshotDir = snapshotDirOverride || path.join('docs', 'metrics');
  const previousSnapshot = loadPreviousSnapshot(snapshotDir, readFile);
  const trends = compareWithPrevious(metrics, previousSnapshot);

  const snapshot = {
    since,
    until,
    generatedAt: new Date().toISOString(),
    metrics,
    trends,
  };

  // Output
  if (parsed.json) {
    console.log(JSON.stringify(snapshot, null, 2));
  } else {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║       Autonomous Performance Metrics             ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Period: ${since.split('T')[0]} → ${until.split('T')[0]}`);
    console.log('');
    console.log(formatTable(metrics, trends));
    console.log('');

    if (metrics.qualityRate.total > 0) {
      console.log(`Quality: ${metrics.qualityRate.merged} merged, ${metrics.qualityRate.rejected} rejected of ${metrics.qualityRate.total} total`);
    }
    console.log('');
  }

  // Save snapshot
  if (parsed.save) {
    const snapshotPath = getSnapshotPath(until);
    try {
      writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
      console.log(`Snapshot saved to: ${snapshotPath}`);
    } catch (err) {
      console.error(`Metrics: failed to save snapshot — ${err.message}`);
      return { exitCode: 1 };
    }
  }

  return { exitCode: 0, snapshot };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  run()
    .then((result) => process.exit(result.exitCode))
    .catch((err) => {
      console.error('Metrics engine error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  parseArgs,
  getDefaultDateRange,
  fetchClosedIssues,
  fetchAllIssues,
  fetchMergedPRs,
  fetchClosedPRs,
  fetchTestCount,
  computeVelocity,
  computeCycleTime,
  computeQualityRate,
  computeTestGrowth,
  computeThroughput,
  computeStreak,
  computeTrend,
  trendIndicator,
  compareWithPrevious,
  getSnapshotPath,
  loadPreviousSnapshot,
  formatTable,
  run,
};
