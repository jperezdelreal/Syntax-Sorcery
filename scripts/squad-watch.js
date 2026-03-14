#!/usr/bin/env node
'use strict';

/**
 * Squad Watch CLI — local watchdog for monitoring autonomous squad operations.
 *
 * Usage:
 *   node scripts/squad-watch.js <command> [options]
 *   npm run watch -- <command> [options]
 *
 * Commands:
 *   list     List downstream repos in the constellation
 *   status   Check open issues, PRs, and session state per repo
 *   check    Run one monitoring cycle (issues scanned, PRs checked, alerts)
 *   help     Show this help message
 *
 * Flags:
 *   --json          Machine-readable JSON output
 *   --interval N    Continuous polling every N minutes
 *
 * Exit codes:
 *   0 — success / no alerts
 *   1 — alerts detected or error
 */

const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOWNSTREAM_REPOS = [
  'jperezdelreal/FirstFrameStudios',
  'jperezdelreal/flora',
  'jperezdelreal/ComeRosquillas',
  'jperezdelreal/pixel-bounce',
  'jperezdelreal/ffs-squad-monitor',
];

const HELP_TEXT = `
Squad Watch — local watchdog for autonomous squad operations

Usage:
  npm run watch -- <command> [options]

Commands:
  list              List downstream repos in the constellation
  status            Check open issues, PRs, and session state per repo
  check             Run one monitoring cycle with alerts
  help              Show this help message

Flags:
  --json            Machine-readable JSON output
  --interval N      Continuous polling every N minutes (default: off)

Examples:
  npm run watch -- list
  npm run watch -- status --json
  npm run watch -- check
  npm run watch -- check --interval 5
`.trim();

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const jsonMode = args.includes('--json');

  let interval = null;
  const intervalIdx = args.indexOf('--interval');
  if (intervalIdx !== -1 && args[intervalIdx + 1]) {
    const val = parseInt(args[intervalIdx + 1], 10);
    if (!isNaN(val) && val > 0) interval = val;
  }

  return { command, jsonMode, interval };
}

// ---------------------------------------------------------------------------
// Utility: safe exec
// ---------------------------------------------------------------------------

function safeExec(cmd, execFn, timeoutMs) {
  const exec = execFn || execSync;
  try {
    const output = exec(cmd, {
      encoding: 'utf8',
      timeout: timeoutMs || 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { ok: true, stdout: output.trim() };
  } catch (err) {
    return { ok: false, stderr: (err.stderr || err.message || '').trim(), stdout: (err.stdout || '').trim() };
  }
}

// ---------------------------------------------------------------------------
// Command: list
// ---------------------------------------------------------------------------

function cmdList(jsonMode) {
  const repos = DOWNSTREAM_REPOS.map(r => ({ repo: r, owner: r.split('/')[0], name: r.split('/')[1] }));

  if (jsonMode) {
    return { exitCode: 0, output: { repos } };
  }

  const lines = ['', '=== Constellation Repos ===', ''];
  for (const r of repos) {
    lines.push(`  📦 ${r.repo}`);
  }
  lines.push('', `  Total: ${repos.length} downstream repos`, '');
  return { exitCode: 0, output: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Command: status
// ---------------------------------------------------------------------------

function fetchRepoStatus(repo, execFn) {
  const issuesResult = safeExec(
    `gh issue list --repo ${repo} --state open --json number,title,labels --limit 10`,
    execFn
  );
  const issues = issuesResult.ok ? JSON.parse(issuesResult.stdout) : [];

  const prsResult = safeExec(
    `gh pr list --repo ${repo} --state open --json number,title,isDraft --limit 10`,
    execFn
  );
  const prs = prsResult.ok ? JSON.parse(prsResult.stdout) : [];

  // Check last commit activity
  const activityResult = safeExec(
    `gh api repos/${repo}/commits?per_page=1 --jq ".[0].commit.committer.date"`,
    execFn
  );
  const lastCommit = activityResult.ok ? activityResult.stdout : null;

  return {
    repo,
    issues: issues.length,
    prs: prs.length,
    lastCommit,
    issuesList: issues,
    prsList: prs,
    accessible: issuesResult.ok,
  };
}

function cmdStatus(jsonMode, execFn) {
  const statuses = DOWNSTREAM_REPOS.map(repo => fetchRepoStatus(repo, execFn));

  if (jsonMode) {
    return { exitCode: 0, output: { repos: statuses, timestamp: new Date().toISOString() } };
  }

  const lines = ['', '=== Squad Watch — Repo Status ===', ''];
  for (const s of statuses) {
    const icon = s.accessible ? '🟢' : '🔴';
    const age = s.lastCommit ? formatAge(s.lastCommit) : 'unknown';
    lines.push(`  ${icon} ${s.repo}`);
    lines.push(`     Issues: ${s.issues}  |  PRs: ${s.prs}  |  Last commit: ${age}`);
    lines.push('');
  }

  const totalIssues = statuses.reduce((sum, s) => sum + s.issues, 0);
  const totalPRs = statuses.reduce((sum, s) => sum + s.prs, 0);
  lines.push(`  Summary: ${totalIssues} open issues, ${totalPRs} open PRs across ${statuses.length} repos`);
  lines.push('');

  return { exitCode: 0, output: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Command: check
// ---------------------------------------------------------------------------

function runCheck(execFn) {
  const alerts = [];
  const repoResults = [];

  for (const repo of DOWNSTREAM_REPOS) {
    const status = fetchRepoStatus(repo, execFn);
    repoResults.push(status);

    if (!status.accessible) {
      alerts.push({ repo, level: 'error', message: `Repo ${repo} is not accessible` });
      continue;
    }

    // Alert: stale repo (no commits in 7 days)
    if (status.lastCommit) {
      const commitAge = Date.now() - new Date(status.lastCommit).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (commitAge > sevenDays) {
        alerts.push({
          repo,
          level: 'warn',
          message: `No commits in ${Math.floor(commitAge / (24 * 60 * 60 * 1000))} days`,
        });
      }
    }

    // Alert: high open issue count
    if (status.issues > 20) {
      alerts.push({
        repo,
        level: 'warn',
        message: `${status.issues} open issues — possible dedup storm or backlog`,
      });
    }

    // Alert: many open PRs
    if (status.prs > 10) {
      alerts.push({
        repo,
        level: 'warn',
        message: `${status.prs} open PRs — review backlog detected`,
      });
    }
  }

  const totalIssues = repoResults.reduce((sum, s) => sum + s.issues, 0);
  const totalPRs = repoResults.reduce((sum, s) => sum + s.prs, 0);

  return {
    timestamp: new Date().toISOString(),
    repos: repoResults,
    alerts,
    summary: {
      reposScanned: DOWNSTREAM_REPOS.length,
      totalIssues,
      totalPRs,
      alertCount: alerts.length,
    },
  };
}

function cmdCheck(jsonMode, execFn) {
  const result = runCheck(execFn);

  if (jsonMode) {
    return { exitCode: result.alerts.length > 0 ? 1 : 0, output: result };
  }

  const lines = ['', '=== Squad Watch — Monitoring Cycle ===', ''];

  for (const r of result.repos) {
    const icon = r.accessible ? '✅' : '❌';
    lines.push(`  ${icon} ${r.repo}  (issues: ${r.issues}, PRs: ${r.prs})`);
  }

  lines.push('');

  if (result.alerts.length > 0) {
    lines.push('⚠️  ALERTS:');
    for (const alert of result.alerts) {
      const icon = alert.level === 'error' ? '🔴' : '🟡';
      lines.push(`  ${icon} [${alert.repo}] ${alert.message}`);
    }
    lines.push('');
  } else {
    lines.push('  ✅ No alerts — all repos healthy');
    lines.push('');
  }

  lines.push(`  Scanned: ${result.summary.reposScanned} repos | Issues: ${result.summary.totalIssues} | PRs: ${result.summary.totalPRs} | Alerts: ${result.summary.alertCount}`);
  lines.push('');

  return { exitCode: result.alerts.length > 0 ? 1 : 0, output: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Continuous polling
// ---------------------------------------------------------------------------

function startPolling(intervalMinutes, jsonMode, execFn, sleepFn) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const sleep = sleepFn || ((ms) => new Promise(resolve => setTimeout(resolve, ms)));

  let running = true;
  const stop = () => { running = false; };

  const loop = async () => {
    while (running) {
      const result = cmdCheck(jsonMode, execFn);
      if (jsonMode) {
        console.log(JSON.stringify(result.output));
      } else {
        console.log(result.output);
        console.log(`  ⏳ Next check in ${intervalMinutes} minute(s)...`);
      }
      await sleep(intervalMs);
    }
  };

  return { loop, stop };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAge(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function route(parsed, execFn) {
  const { command, jsonMode } = parsed;

  switch (command) {
    case 'list':
      return cmdList(jsonMode);
    case 'status':
      return cmdStatus(jsonMode, execFn);
    case 'check':
      return cmdCheck(jsonMode, execFn);
    case 'help':
      return { exitCode: 0, output: HELP_TEXT };
    case null:
      return { exitCode: 1, output: HELP_TEXT + '\n\nError: no command specified.' };
    default:
      return { exitCode: 1, output: HELP_TEXT + `\n\nError: unknown command "${command}".` };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(argv, deps) {
  const execFn = deps?.exec;
  const sleepFn = deps?.sleep;
  const parsed = parseArgs(argv || process.argv);

  // Handle continuous polling
  if (parsed.interval && parsed.command === 'check') {
    const { loop } = startPolling(parsed.interval, parsed.jsonMode, execFn, sleepFn);
    await loop();
    return 0;
  }

  const result = route(parsed, execFn);

  if (parsed.jsonMode && typeof result.output === 'object') {
    console.log(JSON.stringify(result.output, null, 2));
  } else if (typeof result.output === 'string') {
    console.log(result.output);
  }

  return result.exitCode;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  main().then(code => process.exit(code));
}

module.exports = {
  DOWNSTREAM_REPOS,
  HELP_TEXT,
  parseArgs,
  safeExec,
  cmdList,
  cmdStatus,
  cmdCheck,
  runCheck,
  startPolling,
  formatAge,
  fetchRepoStatus,
  route,
  main,
};
