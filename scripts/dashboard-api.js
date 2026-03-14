#!/usr/bin/env node
'use strict';

/**
 * Dashboard API — Multi-repo metrics aggregator for the Syntax Sorcery constellation.
 *
 * Fetches KPIs across all constellation repos via `gh api` CLI and outputs
 * structured JSON for the real-time dashboard.
 *
 * Usage:
 *   node scripts/dashboard-api.js
 *   node scripts/dashboard-api.js --json
 *   node scripts/dashboard-api.js --output site/public/data/dashboard.json
 *
 * Flags:
 *   --json     Output JSON to stdout
 *   --output   Write JSON to the specified file path
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
// Constants
// ---------------------------------------------------------------------------

const OWNER = 'jperezdelreal';

const CONSTELLATION_REPOS = [
  'Syntax-Sorcery',
  'pixel-bounce',
  'flora',
  'ComeRosquillas',
  'FirstFrameStudios',
  'ffs-squad-monitor',
];

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { json: false, output: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
      result.json = true;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.output = args[++i];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// gh API helpers (injectable for testing)
// ---------------------------------------------------------------------------

function defaultExecGh(cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    timeout: 30_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function safeExec(cmd, execGh) {
  try {
    const raw = execGh(cmd);
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, data: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Data fetchers (per-repo)
// ---------------------------------------------------------------------------

function fetchRepoIssues(owner, repo, state, since, execGh) {
  const sinceISO = since.toISOString().split('T')[0];
  const cmd = `gh api "repos/${owner}/${repo}/issues?state=${state}&since=${sinceISO}&per_page=100" --paginate`;
  const result = safeExec(cmd, execGh);
  if (!result.ok) return [];
  // gh api --paginate may return array directly or array of arrays
  const items = Array.isArray(result.data) ? result.data : [];
  // Filter out PRs (GitHub API returns PRs in issues endpoint)
  return items.filter(i => !i.pull_request);
}

function fetchRepoPRs(owner, repo, state, execGh) {
  const cmd = `gh api "repos/${owner}/${repo}/pulls?state=${state}&per_page=100&sort=updated&direction=desc"`;
  const result = safeExec(cmd, execGh);
  if (!result.ok) return [];
  return Array.isArray(result.data) ? result.data : [];
}

function fetchRepoCommits(owner, repo, since, execGh) {
  const sinceISO = since.toISOString();
  const cmd = `gh api "repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=5"`;
  const result = safeExec(cmd, execGh);
  if (!result.ok) return [];
  return Array.isArray(result.data) ? result.data : [];
}

function fetchLatestWorkflowRun(owner, repo, execGh) {
  const cmd = `gh api "repos/${owner}/${repo}/actions/runs?per_page=1&status=completed"`;
  const result = safeExec(cmd, execGh);
  if (!result.ok || !result.data || !result.data.workflow_runs) return null;
  return result.data.workflow_runs[0] || null;
}

// ---------------------------------------------------------------------------
// KPI computations
// ---------------------------------------------------------------------------

function computeIssuesOpened7d(allRepoIssues, since) {
  let count = 0;
  for (const issues of Object.values(allRepoIssues)) {
    for (const issue of issues) {
      if (new Date(issue.created_at) >= since) count++;
    }
  }
  return count;
}

function computeIssuesClosed7d(allRepoClosedIssues, since) {
  let count = 0;
  for (const issues of Object.values(allRepoClosedIssues)) {
    for (const issue of issues) {
      if (issue.closed_at && new Date(issue.closed_at) >= since) count++;
    }
  }
  return count;
}

function computePRsMerged7d(allRepoPRs, since) {
  let count = 0;
  for (const prs of Object.values(allRepoPRs)) {
    for (const pr of prs) {
      if (pr.merged_at && new Date(pr.merged_at) >= since) count++;
    }
  }
  return count;
}

function computePRsOpen(allRepoOpenPRs) {
  let count = 0;
  for (const prs of Object.values(allRepoOpenPRs)) {
    count += prs.length;
  }
  return count;
}

function computeAvgCycleTime(allRepoClosedIssues, since) {
  const cycleTimes = [];
  for (const issues of Object.values(allRepoClosedIssues)) {
    for (const issue of issues) {
      if (issue.closed_at && new Date(issue.closed_at) >= since) {
        const openedAt = new Date(issue.created_at);
        const closedAt = new Date(issue.closed_at);
        const hours = (closedAt - openedAt) / (1000 * 60 * 60);
        if (hours >= 0) cycleTimes.push(hours);
      }
    }
  }
  if (cycleTimes.length === 0) return null;
  const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
  return Math.round(avg * 100) / 100;
}

function computeActiveAgents(allRepoCommits) {
  let active = 0;
  for (const commits of Object.values(allRepoCommits)) {
    if (commits.length > 0) active++;
  }
  return active;
}

function computeLastActivity(allRepoCommits) {
  const activity = {};
  for (const [repo, commits] of Object.entries(allRepoCommits)) {
    if (commits.length > 0 && commits[0].commit) {
      activity[repo] = commits[0].commit.committer
        ? commits[0].commit.committer.date
        : commits[0].commit.author.date;
    } else {
      activity[repo] = null;
    }
  }
  return activity;
}

function computeTestCount(allWorkflowRuns) {
  let total = 0;
  let found = false;
  for (const run of Object.values(allWorkflowRuns)) {
    if (run && run.name && /test/i.test(run.name)) {
      found = true;
    }
  }
  // Test count from CI is unreliable without parsing logs; return repo count with CI
  const reposWithCI = Object.values(allWorkflowRuns).filter(r => r !== null).length;
  return reposWithCI;
}

// ---------------------------------------------------------------------------
// Rate helpers
// ---------------------------------------------------------------------------

function rate(count, days) {
  const d = Math.max(days, 1);
  return Math.round((count / d) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Main aggregation
// ---------------------------------------------------------------------------

async function run(argv, deps) {
  const execGh = (deps && deps.execGh) || defaultExecGh;
  const writeFile = (deps && deps.writeFile) || defaultWriteFile;
  const owner = (deps && deps.owner) || OWNER;
  const repos = (deps && deps.repos) || CONSTELLATION_REPOS;

  const parsed = parseArgs(argv || process.argv);

  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days = 7;

  // Collect data per repo
  const allRepoOpenIssues = {};
  const allRepoClosedIssues = {};
  const allRepoOpenPRs = {};
  const allRepoClosedPRs = {};
  const allRepoCommits = {};
  const allWorkflowRuns = {};
  const errors = [];

  for (const repo of repos) {
    try {
      allRepoOpenIssues[repo] = fetchRepoIssues(owner, repo, 'open', since, execGh);
    } catch (e) {
      allRepoOpenIssues[repo] = [];
      errors.push({ repo, type: 'open_issues', error: e.message });
    }

    try {
      allRepoClosedIssues[repo] = fetchRepoIssues(owner, repo, 'closed', since, execGh);
    } catch (e) {
      allRepoClosedIssues[repo] = [];
      errors.push({ repo, type: 'closed_issues', error: e.message });
    }

    try {
      allRepoOpenPRs[repo] = fetchRepoPRs(owner, repo, 'open', execGh);
    } catch (e) {
      allRepoOpenPRs[repo] = [];
      errors.push({ repo, type: 'open_prs', error: e.message });
    }

    try {
      allRepoClosedPRs[repo] = fetchRepoPRs(owner, repo, 'closed', execGh);
    } catch (e) {
      allRepoClosedPRs[repo] = [];
      errors.push({ repo, type: 'closed_prs', error: e.message });
    }

    try {
      const recentSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      allRepoCommits[repo] = fetchRepoCommits(owner, repo, recentSince, execGh);
    } catch (e) {
      allRepoCommits[repo] = [];
      errors.push({ repo, type: 'commits', error: e.message });
    }

    try {
      allWorkflowRuns[repo] = fetchLatestWorkflowRun(owner, repo, execGh);
    } catch (e) {
      allWorkflowRuns[repo] = null;
      errors.push({ repo, type: 'workflow', error: e.message });
    }
  }

  // Compute KPIs
  const issuesOpened7d = computeIssuesOpened7d(allRepoOpenIssues, since);
  const issuesClosed7d = computeIssuesClosed7d(allRepoClosedIssues, since);
  const prsMerged7d = computePRsMerged7d(allRepoClosedPRs, since);
  const prsOpen = computePRsOpen(allRepoOpenPRs);
  const avgCycleTime = computeAvgCycleTime(allRepoClosedIssues, since);
  const activeAgents = computeActiveAgents(allRepoCommits);
  const lastActivity = computeLastActivity(allRepoCommits);
  const testCount = computeTestCount(allWorkflowRuns);

  const dashboard = {
    generatedAt: now.toISOString(),
    period: {
      since: since.toISOString(),
      until: now.toISOString(),
      days,
    },
    constellation: {
      owner,
      repos,
      total: repos.length,
    },
    kpis: {
      issues_opened_7d: { value: issuesOpened7d, rate: rate(issuesOpened7d, days), unit: 'issues/day' },
      issues_closed_7d: { value: issuesClosed7d, rate: rate(issuesClosed7d, days), unit: 'issues/day' },
      prs_merged_7d: { value: prsMerged7d, rate: rate(prsMerged7d, days), unit: 'PRs/day' },
      prs_open: { value: prsOpen, unit: 'PRs' },
      avg_cycle_time: { value: avgCycleTime, unit: 'hours' },
      test_count: { value: testCount, unit: 'repos_with_ci' },
      active_agents: { value: activeAgents, unit: 'repos', total: repos.length },
    },
    last_activity: lastActivity,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Output
  if (parsed.json) {
    console.log(JSON.stringify(dashboard, null, 2));
  } else if (parsed.output) {
    const outputPath = path.resolve(parsed.output);
    writeFile(outputPath, JSON.stringify(dashboard, null, 2));
    console.log(`✓ Dashboard data written to ${outputPath}`);
  } else {
    // Default: human-readable summary + write to site/public/data/dashboard.json
    printSummary(dashboard);
    const defaultOutput = path.resolve(__dirname, '..', 'site', 'public', 'data', 'dashboard.json');
    writeFile(defaultOutput, JSON.stringify(dashboard, null, 2));
    console.log(`\n✓ Dashboard data written to ${defaultOutput}`);
  }

  return { exitCode: 0, dashboard };
}

// ---------------------------------------------------------------------------
// Human-readable output
// ---------------------------------------------------------------------------

function printSummary(dashboard) {
  const k = dashboard.kpis;
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       Dashboard — Constellation Metrics          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Period: ${dashboard.period.since.split('T')[0]} → ${dashboard.period.until.split('T')[0]} (${dashboard.period.days}d)`);
  console.log(`Repos:  ${dashboard.constellation.total} in constellation`);
  console.log('');
  console.log(`  Issues opened (7d):    ${k.issues_opened_7d.value}  (${k.issues_opened_7d.rate}/day)`);
  console.log(`  Issues closed (7d):    ${k.issues_closed_7d.value}  (${k.issues_closed_7d.rate}/day)`);
  console.log(`  PRs merged (7d):       ${k.prs_merged_7d.value}  (${k.prs_merged_7d.rate}/day)`);
  console.log(`  PRs open:              ${k.prs_open.value}`);
  console.log(`  Avg cycle time:        ${k.avg_cycle_time.value !== null ? k.avg_cycle_time.value + 'h' : 'N/A'}`);
  console.log(`  Repos with CI:         ${k.test_count.value}`);
  console.log(`  Active repos (24h):    ${k.active_agents.value}/${k.active_agents.total}`);
  console.log('');
  console.log('  Last activity per repo:');
  for (const [repo, ts] of Object.entries(dashboard.last_activity)) {
    const label = ts ? new Date(ts).toLocaleString() : 'no recent activity';
    console.log(`    ${repo}: ${label}`);
  }

  if (dashboard.errors && dashboard.errors.length > 0) {
    console.log('');
    console.log(`  ⚠ ${dashboard.errors.length} API error(s) encountered`);
  }
}

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

function defaultWriteFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  run()
    .then((result) => process.exit(result.exitCode))
    .catch((err) => {
      console.error('Dashboard API error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  OWNER,
  CONSTELLATION_REPOS,
  parseArgs,
  safeExec,
  fetchRepoIssues,
  fetchRepoPRs,
  fetchRepoCommits,
  fetchLatestWorkflowRun,
  computeIssuesOpened7d,
  computeIssuesClosed7d,
  computePRsMerged7d,
  computePRsOpen,
  computeAvgCycleTime,
  computeActiveAgents,
  computeLastActivity,
  computeTestCount,
  rate,
  printSummary,
  run,
};
