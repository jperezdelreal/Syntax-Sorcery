#!/usr/bin/env node
'use strict';

/**
 * Automated Session Report Generator
 *
 * Captures autonomous session activity via gh CLI and produces a structured
 * Markdown report: issues opened/closed, PRs merged/rejected, test count,
 * agents involved.
 *
 * Usage:
 *   node scripts/session-report.js
 *   node scripts/session-report.js --since 2026-03-19T00:00:00Z --until 2026-03-19T23:59:59Z
 *   node scripts/session-report.js --dry-run
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
  const result = { since: null, until: null, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since' && args[i + 1]) {
      result.since = args[++i];
    } else if (args[i] === '--until' && args[i + 1]) {
      result.until = args[++i];
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Default date range (last 24 hours)
// ---------------------------------------------------------------------------

function getDefaultDateRange() {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
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

function fetchIssues(since, execGh) {
  const cmd = `gh issue list --state all --json number,title,state,author,labels,createdAt,closedAt --limit 100 --search "created:>=${since}"`;
  const raw = execGh(cmd);
  return JSON.parse(raw);
}

function fetchPRs(since, execGh) {
  const cmd = `gh pr list --state all --json number,title,state,author,labels,mergedAt,closedAt,createdAt --limit 100 --search "created:>=${since}"`;
  const raw = execGh(cmd);
  return JSON.parse(raw);
}

function fetchTestCount(execGh) {
  try {
    const raw = execGh('npm test -- --reporter=json 2>&1');
    const data = JSON.parse(raw);
    return {
      total: data.numTotalTests || 0,
      passed: data.numPassedTests || 0,
      failed: data.numFailedTests || 0,
    };
  } catch {
    // Fallback: parse vitest output line count
    return null;
  }
}

// ---------------------------------------------------------------------------
// Data filtering
// ---------------------------------------------------------------------------

function filterByDateRange(items, since, until, dateField) {
  const sinceDate = new Date(since);
  const untilDate = new Date(until);
  return items.filter((item) => {
    const d = new Date(item[dateField]);
    return d >= sinceDate && d <= untilDate;
  });
}

function categorizeIssues(issues, since, until) {
  const opened = filterByDateRange(issues, since, until, 'createdAt');
  const closed = issues.filter((i) => {
    if (i.state !== 'CLOSED' || !i.closedAt) return false;
    const d = new Date(i.closedAt);
    return d >= new Date(since) && d <= new Date(until);
  });
  return { opened, closed };
}

function categorizePRs(prs, since, until) {
  const sinceDate = new Date(since);
  const untilDate = new Date(until);
  const merged = prs.filter((pr) => {
    if (!pr.mergedAt) return false;
    const d = new Date(pr.mergedAt);
    return d >= sinceDate && d <= untilDate;
  });
  const closed = prs.filter((pr) => {
    if (pr.mergedAt) return false; // already counted as merged
    if (pr.state !== 'CLOSED' || !pr.closedAt) return false;
    const d = new Date(pr.closedAt);
    return d >= sinceDate && d <= untilDate;
  });
  const opened = filterByDateRange(prs, since, until, 'createdAt');
  return { opened, merged, closed };
}

// ---------------------------------------------------------------------------
// Agent extraction
// ---------------------------------------------------------------------------

function extractAgents(issues, prs) {
  const agents = new Set();
  const allItems = [...issues, ...prs];
  for (const item of allItems) {
    if (item.author && item.author.login) {
      agents.add(item.author.login);
    }
    if (item.labels) {
      for (const label of item.labels) {
        const name = typeof label === 'string' ? label : label.name;
        if (name && name.startsWith('squad:')) {
          agents.add(name.replace('squad:', ''));
        }
      }
    }
  }
  return [...agents].sort();
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function generateReport(data) {
  const { since, until, issues, prs, testCount, agents } = data;
  const date = since.split('T')[0];

  const lines = [];

  // Frontmatter
  lines.push('---');
  lines.push(`title: "Session Report — ${date}"`);
  lines.push(`date: "${since}"`);
  lines.push(`since: "${since}"`);
  lines.push(`until: "${until}"`);
  lines.push(`agents: [${agents.map((a) => `"${a}"`).join(', ')}]`);
  lines.push('---');
  lines.push('');

  // Title
  lines.push(`# Session Report — ${date}`);
  lines.push('');

  // Issues section
  lines.push('## Issues');
  lines.push('');
  lines.push(`| # | Title | Status |`);
  lines.push(`|---|-------|--------|`);

  const allIssues = [...issues.opened, ...issues.closed.filter(
    (c) => !issues.opened.some((o) => o.number === c.number)
  )];

  if (allIssues.length === 0) {
    lines.push('| — | No issue activity | — |');
  } else {
    for (const issue of allIssues) {
      const status = issue.state === 'CLOSED' ? '✅ Closed' : '🟢 Opened';
      lines.push(`| #${issue.number} | ${issue.title} | ${status} |`);
    }
  }
  lines.push('');
  lines.push(`**Opened:** ${issues.opened.length} · **Closed:** ${issues.closed.length}`);
  lines.push('');

  // PRs section
  lines.push('## Pull Requests');
  lines.push('');
  lines.push(`| # | Title | Status |`);
  lines.push(`|---|-------|--------|`);

  const allPRs = [
    ...prs.merged.map((pr) => ({ ...pr, _status: '✅ Merged' })),
    ...prs.closed.map((pr) => ({ ...pr, _status: '❌ Rejected' })),
    ...prs.opened.filter(
      (o) =>
        !prs.merged.some((m) => m.number === o.number) &&
        !prs.closed.some((c) => c.number === o.number)
    ).map((pr) => ({ ...pr, _status: '🟢 Opened' })),
  ];

  if (allPRs.length === 0) {
    lines.push('| — | No PR activity | — |');
  } else {
    for (const pr of allPRs) {
      lines.push(`| #${pr.number} | ${pr.title} | ${pr._status} |`);
    }
  }
  lines.push('');
  lines.push(`**Opened:** ${prs.opened.length} · **Merged:** ${prs.merged.length} · **Rejected:** ${prs.closed.length}`);
  lines.push('');

  // Tests section
  lines.push('## Tests');
  lines.push('');
  if (testCount) {
    lines.push(`- **Total:** ${testCount.total}`);
    lines.push(`- **Passed:** ${testCount.passed}`);
    lines.push(`- **Failed:** ${testCount.failed}`);
  } else {
    lines.push('_Test results not available._');
  }
  lines.push('');

  // Summary section
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Period:** ${since} → ${until}`);
  lines.push(`- **Issues:** ${issues.opened.length} opened, ${issues.closed.length} closed`);
  lines.push(`- **PRs:** ${prs.opened.length} opened, ${prs.merged.length} merged, ${prs.closed.length} rejected`);
  if (testCount) {
    lines.push(`- **Tests:** ${testCount.total} total (${testCount.passed} passed, ${testCount.failed} failed)`);
  }
  lines.push(`- **Agents:** ${agents.length > 0 ? agents.join(', ') : 'none detected'}`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// File I/O (injectable for testing)
// ---------------------------------------------------------------------------

function defaultWriteFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function getOutputPath(since) {
  const date = since.split('T')[0];
  return path.join('docs', 'reports', `${date}-session.md`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run(argv, deps) {
  const execGh = (deps && deps.execGh) || defaultExecGh;
  const writeFile = (deps && deps.writeFile) || defaultWriteFile;

  const parsed = parseArgs(argv || process.argv);
  const defaults = getDefaultDateRange();
  const since = parsed.since || defaults.since;
  const until = parsed.until || defaults.until;

  let rawIssues, rawPRs;
  try {
    rawIssues = fetchIssues(since, execGh);
  } catch (err) {
    console.error(`Session report: failed to fetch issues — ${err.message}`);
    return { exitCode: 1 };
  }

  try {
    rawPRs = fetchPRs(since, execGh);
  } catch (err) {
    console.error(`Session report: failed to fetch PRs — ${err.message}`);
    return { exitCode: 1 };
  }

  const issues = categorizeIssues(rawIssues, since, until);
  const prs = categorizePRs(rawPRs, since, until);
  const agents = extractAgents(rawIssues, rawPRs);

  let testCount = null;
  try {
    testCount = fetchTestCount(execGh);
  } catch {
    // Tests are optional — report proceeds without them
  }

  const report = generateReport({ since, until, issues, prs, testCount, agents });
  const outputPath = getOutputPath(since);

  if (parsed.dryRun) {
    console.log(report);
    console.log(`\nDry run — would write to: ${outputPath}`);
    return { exitCode: 0, report, outputPath, dryRun: true };
  }

  try {
    writeFile(outputPath, report);
    console.log(`Session report written to: ${outputPath}`);
    return { exitCode: 0, report, outputPath, dryRun: false };
  } catch (err) {
    console.error(`Session report: failed to write file — ${err.message}`);
    return { exitCode: 1 };
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  run()
    .then((result) => process.exit(result.exitCode))
    .catch((err) => {
      console.error('Session report error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  parseArgs,
  getDefaultDateRange,
  fetchIssues,
  fetchPRs,
  fetchTestCount,
  filterByDateRange,
  categorizeIssues,
  categorizePRs,
  extractAgents,
  generateReport,
  getOutputPath,
  run,
};
