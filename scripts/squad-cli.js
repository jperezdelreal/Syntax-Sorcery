#!/usr/bin/env node
'use strict';

/**
 * Unified Developer CLI — single entry point for all squad operations.
 *
 * Usage:
 *   node scripts/squad-cli.js <command> [options]
 *   npm run squad -- <command> [options]
 *
 * Commands:
 *   status   Show open issues and PR state
 *   health   Run constellation health checks
 *   review   Run review gate on a PR (requires --pr <number>)
 *   dedup    Run dedup guard
 *   report   Generate session report
 *   metrics  Run performance metrics engine
 *   security Run security audit (deps, secrets, SBOM)
 *   preflight Run Test 3 pre-flight validation
 *   enforce-protection  Enforce branch protection on downstream repos
 *   plugin <subcmd>     Manage plugins (list, install, search, create, info)
 *   gameplay-test       Init gameplay test templates for downstream games
 *   watch <subcmd>      Local watchdog monitoring (list, status, check)
 *   dashboard-data     Aggregate KPIs across constellation repos
 *   help     Show this help message
 *
 * Flags:
 *   --json       Machine-readable JSON output (where supported)
 *   --fix        Auto-fix vulnerabilities (security command)
 *   --sbom-only  Only generate SBOM (security command)
 *   --skip-azure Skip Azure checks (preflight command)
 *   --apply      Apply protection rules (enforce-protection)
 *   --repo <name> Target single repo (enforce-protection)
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMMANDS = ['status', 'health', 'review', 'dedup', 'report', 'metrics', 'security', 'preflight', 'enforce-protection', 'plugin', 'gameplay-test', 'watch', 'dashboard-data', 'help'];

const HELP_TEXT = `
Squad CLI — Unified developer CLI for all squad operations

Usage:
  npm run squad -- <command> [options]

Commands:
  status              Show open issues + PR state
  health              Run constellation health checks
  review --pr <num>   Run review gate on a PR
  dedup               Run dedup guard
  report              Generate session report
  metrics             Run performance metrics engine
  security            Run security audit (deps, secrets, SBOM)
  preflight           Run Test 3 pre-flight validation
  enforce-protection  Enforce branch protection on downstream repos
  plugin <subcmd>     Manage plugins (list, install, search, create, info)
  gameplay-test       Init gameplay test templates for downstream games
  watch <subcmd>      Local watchdog monitoring (list, status, check)
  dashboard-data      Aggregate KPIs across constellation repos
  help                Show this help message

Flags:
  --json              Machine-readable JSON output (where supported)
  --save              Save metrics snapshot / SBOM
  --fix               Auto-fix vulnerabilities (security command)
  --skip-azure        Skip Azure checks (preflight command)
  --sbom-only         Only generate SBOM (security command)
  --apply             Apply protection rules (enforce-protection)
  --repo <name>       Target single repo (enforce-protection)
  --init              Initialize test template (gameplay-test)
  --type <type>       Template type: platformer or puzzle (gameplay-test)
  --target <path>     Path to game repo (gameplay-test)
  --skip-azure        Skip Azure checks (preflight command)
  --since <date>      Start date filter (metrics, report)
  --until <date>      End date filter (metrics, report)

Examples:
  npm run squad -- status
  npm run squad -- health --json
  npm run squad -- review --pr 42
  npm run squad -- metrics --json --save
  npm run squad -- security --json
  npm run squad -- security --fix
  npm run squad -- security --sbom-only --save
  npm run squad -- preflight
  npm run squad -- preflight --skip-azure --json
  npm run squad -- enforce-protection
  npm run squad -- enforce-protection --apply --repo flora
  npm run squad -- plugin list
  npm run squad -- plugin install owner/repo
  npm run squad -- gameplay-test --init --type platformer --target ../pixel-bounce
  npm run squad -- watch list
  npm run squad -- watch status --json
  npm run squad -- watch check --interval 5
`.trim();

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const flags = args.slice(1);
  const jsonMode = flags.includes('--json');
  const save = flags.includes('--save');
  const fix = flags.includes('--fix');
  const sbomOnly = flags.includes('--sbom-only');
  const skipAzure = flags.includes('--skip-azure');
  const applyProtection = flags.includes('--apply');
  const init = flags.includes('--init');

  let pr = null;
  const prIdx = flags.indexOf('--pr');
  if (prIdx !== -1 && flags[prIdx + 1]) {
    pr = parseInt(flags[prIdx + 1], 10);
  }

  let since = null;
  const sinceIdx = flags.indexOf('--since');
  if (sinceIdx !== -1 && flags[sinceIdx + 1]) {
    since = flags[sinceIdx + 1];
  }

  let until = null;
  const untilIdx = flags.indexOf('--until');
  if (untilIdx !== -1 && flags[untilIdx + 1]) {
    until = flags[untilIdx + 1];
  }

  const repo = extractFlag(flags, '--repo');
  const type = extractFlag(flags, '--type');
  const target = extractFlag(flags, '--target');

  let interval = null;
  const intervalIdx = flags.indexOf('--interval');
  if (intervalIdx !== -1 && flags[intervalIdx + 1]) {
    const val = parseInt(flags[intervalIdx + 1], 10);
    if (!isNaN(val) && val > 0) interval = val;
  }

  return { command, flags, jsonMode, pr, save, fix, sbomOnly, skipAzure, applyProtection, repo, init, type, target, since, until, interval };
}

function extractFlag(flags, name) {
  const idx = flags.indexOf(name);
  return (idx !== -1 && flags[idx + 1]) ? flags[idx + 1] : null;
}

// ---------------------------------------------------------------------------
// Command: status
// ---------------------------------------------------------------------------

function cmdStatus(jsonMode, execFn) {
  const exec = execFn || execSync;
  try {
    const issuesRaw = exec('gh issue list --state open --json number,title,labels,assignees --limit 20', {
      encoding: 'utf8',
      timeout: 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const issues = JSON.parse(issuesRaw);

    let prs = [];
    try {
      const prsRaw = exec('gh pr list --state open --json number,title,isDraft,statusCheckRollup --limit 20', {
        encoding: 'utf8',
        timeout: 30_000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      prs = JSON.parse(prsRaw);
    } catch {
      // PRs may fail if no PRs exist; non-fatal
    }

    const result = { issues, prs };

    if (jsonMode) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    console.log('');
    console.log('=== Open Issues ===');
    if (issues.length === 0) {
      console.log('  No open issues.');
    } else {
      for (const issue of issues) {
        const labels = (issue.labels || []).map(l => l.name).join(', ');
        const assignees = (issue.assignees || []).map(a => a.login).join(', ');
        console.log(`  #${issue.number}  ${issue.title}`);
        if (labels) console.log(`         Labels: ${labels}`);
        if (assignees) console.log(`         Assignees: ${assignees}`);
      }
    }

    console.log('');
    console.log('=== Open PRs ===');
    if (prs.length === 0) {
      console.log('  No open PRs.');
    } else {
      for (const pr of prs) {
        const draft = pr.isDraft ? ' [DRAFT]' : '';
        console.log(`  #${pr.number}  ${pr.title}${draft}`);
      }
    }
    console.log('');

    return 0;
  } catch (err) {
    console.error(`Status error: ${err.message}`);
    return 1;
  }
}

// ---------------------------------------------------------------------------
// Command: health
// ---------------------------------------------------------------------------

function cmdHealth(jsonMode) {
  const scriptPath = path.resolve(__dirname, 'constellation-health.js');
  const args = jsonMode ? ['--json'] : [];
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 120_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: review
// ---------------------------------------------------------------------------

function cmdReview(pr, jsonMode) {
  if (!pr || isNaN(pr)) {
    console.error('Error: review command requires --pr <number>');
    console.error('Usage: npm run squad -- review --pr 42');
    return 1;
  }

  const scriptPath = path.resolve(__dirname, 'review-gate.js');
  const result = spawnSync(process.execPath, [scriptPath, '--pr', String(pr)], {
    stdio: 'inherit',
    timeout: 60_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: dedup
// ---------------------------------------------------------------------------

function cmdDedup(jsonMode) {
  const scriptPath = path.resolve(__dirname, 'dedup-guard.js');
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    timeout: 30_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: report
// ---------------------------------------------------------------------------

function cmdReport(jsonMode) {
  const scriptPath = path.resolve(__dirname, 'session-report.js');
  try {
    require.resolve(scriptPath);
  } catch {
    console.error('Error: session-report.js not found.');
    console.error('The report command will be available once scripts/session-report.js is created.');
    return 1;
  }

  const args = jsonMode ? ['--json'] : [];
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 60_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: help
// ---------------------------------------------------------------------------

function cmdHelp() {
  console.log(HELP_TEXT);
  return 0;
}

// ---------------------------------------------------------------------------
// Command: metrics
// ---------------------------------------------------------------------------

function cmdMetrics(jsonMode, save, since, until) {
  const scriptPath = path.resolve(__dirname, 'metrics-engine.js');
  const args = [];
  if (jsonMode) args.push('--json');
  if (save) args.push('--save');
  if (since) args.push('--since', since);
  if (until) args.push('--until', until);

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 60_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: security
// ---------------------------------------------------------------------------

function cmdSecurity(jsonMode, fix, sbomOnly, save) {
  const scriptPath = path.resolve(__dirname, 'security-audit.js');
  const args = [];
  if (jsonMode) args.push('--json');
  if (fix) args.push('--fix');
  if (sbomOnly) args.push('--sbom-only');
  if (save) args.push('--save');

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 120_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: preflight
// ---------------------------------------------------------------------------

function cmdPreflight(jsonMode, fix, skipAzure) {
  const scriptPath = path.resolve(__dirname, 'preflight.js');
  const args = [];
  if (jsonMode) args.push('--json');
  if (fix) args.push('--fix');
  if (skipAzure) args.push('--skip-azure');

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 300_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: enforce-protection
// ---------------------------------------------------------------------------

function cmdEnforceProtection(jsonMode, applyProtection, repo) {
  const scriptPath = path.resolve(__dirname, 'enforce-branch-protection.js');
  const args = [];
  if (jsonMode) args.push('--json');
  if (applyProtection) args.push('--apply');
  if (repo) args.push('--repo', repo);

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 120_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: plugin
// ---------------------------------------------------------------------------

function cmdPlugin(flags) {
  const scriptPath = path.resolve(__dirname, 'plugin-manager.js');
  const result = spawnSync(process.execPath, [scriptPath, ...flags], {
    stdio: 'inherit',
    timeout: 120_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: gameplay-test
// ---------------------------------------------------------------------------

const GAMEPLAY_TEST_HELP = `
Gameplay Test — Initialize gameplay test templates for downstream games

Usage:
  npm run squad -- gameplay-test --init --type <type> --target <path>

Options:
  --init              Initialize test template in target directory
  --type <type>       Template type: "platformer" or "puzzle"
  --target <path>     Path to the game repo (default: current directory)
  --help              Show this help

Examples:
  npm run squad -- gameplay-test --init --type platformer --target ../pixel-bounce
  npm run squad -- gameplay-test --init --type puzzle --target ../flora
`.trim();

function cmdGameplayTest(parsed) {
  const { init: doInit, type, target } = parsed;
  const fs = require('fs');

  if (!doInit || parsed.flags.includes('--help')) {
    console.log(GAMEPLAY_TEST_HELP);
    return doInit ? 1 : 0;
  }

  const validTypes = ['platformer', 'puzzle'];
  if (!type || !validTypes.includes(type)) {
    console.error(`Error: --type must be one of: ${validTypes.join(', ')}`);
    return 1;
  }

  const targetDir = target || process.cwd();
  const testsDir = path.join(targetDir, '__tests__');
  const destFile = path.join(testsDir, 'gameplay.test.js');

  if (fs.existsSync(destFile)) {
    console.error(`Error: ${destFile} already exists. Remove it first to re-initialize.`);
    return 1;
  }

  const templateFile = type === 'platformer'
    ? path.resolve(__dirname, 'gameplay-test', 'templates', 'platformer-tests.template.js')
    : path.resolve(__dirname, 'gameplay-test', 'templates', 'puzzle-tests.template.js');

  if (!fs.existsSync(templateFile)) {
    console.error(`Error: template not found at ${templateFile}`);
    return 1;
  }

  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  fs.copyFileSync(templateFile, destFile);

  const frameworkDir = path.join(targetDir, 'gameplay-test');
  if (!fs.existsSync(frameworkDir)) {
    fs.mkdirSync(frameworkDir, { recursive: true });
  }

  const frameworkSrc = path.resolve(__dirname, 'gameplay-test', 'framework.js');
  const canvasMockSrc = path.resolve(__dirname, 'gameplay-test', 'canvas-mock.js');

  fs.copyFileSync(frameworkSrc, path.join(frameworkDir, 'framework.js'));
  fs.copyFileSync(canvasMockSrc, path.join(frameworkDir, 'canvas-mock.js'));

  console.log(`✅ Gameplay test initialized:`);
  console.log(`   Template:  ${type}`);
  console.log(`   Test file: ${destFile}`);
  console.log(`   Framework: ${frameworkDir}/`);
  console.log('  1. npm install --save-dev vitest');
  console.log('  2. Edit __tests__/gameplay.test.js — replace TODO markers');
  console.log('  3. npx vitest run');
  return 0;
}

// ---------------------------------------------------------------------------
// Command: dashboard-data
// ---------------------------------------------------------------------------

function cmdDashboardData(jsonMode, parsed) {
  const scriptPath = path.resolve(__dirname, 'dashboard-api.js');
  const args = [];
  if (jsonMode) args.push('--json');
  const output = extractFlag(parsed.flags, '--output');
  if (output) args.push('--output', output);

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 300_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Command: watch
// ---------------------------------------------------------------------------

function cmdWatch(parsed) {
  const scriptPath = path.resolve(__dirname, 'squad-watch.js');
  const args = parsed.flags || [];

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: 300_000,
  });
  return result.status || 0;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function route(parsed) {
  const { command, jsonMode, pr, save, fix, sbomOnly, skipAzure, applyProtection, repo, since, until } = parsed;

  if (!command) {
    console.log(HELP_TEXT);
    console.log('');
    console.error('Error: no command specified.');
    return 1;
  }

  if (!COMMANDS.includes(command)) {
    console.log(HELP_TEXT);
    console.log('');
    console.error(`Error: unknown command "${command}".`);
    return 1;
  }

  switch (command) {
    case 'status':
      return cmdStatus(jsonMode);
    case 'health':
      return cmdHealth(jsonMode);
    case 'review':
      return cmdReview(pr, jsonMode);
    case 'dedup':
      return cmdDedup(jsonMode);
    case 'report':
      return cmdReport(jsonMode);
    case 'metrics':
      return cmdMetrics(jsonMode, save, since, until);
    case 'security':
      return cmdSecurity(jsonMode, fix, sbomOnly, save);
    case 'preflight':
      return cmdPreflight(jsonMode, fix, skipAzure);
    case 'enforce-protection':
      return cmdEnforceProtection(jsonMode, applyProtection, repo);
    case 'plugin':
      return cmdPlugin(parsed.flags);
    case 'gameplay-test':
      return cmdGameplayTest(parsed);
    case 'dashboard-data':
      return cmdDashboardData(jsonMode, parsed);
    case 'watch':
      return cmdWatch(parsed);
    case 'help':
      return cmdHelp();
    default:
      return 1;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(argv) {
  const parsed = parseCliArgs(argv || process.argv);
  const exitCode = route(parsed);
  return exitCode;
}

if (require.main === module) {
  const code = main();
  process.exit(code);
}

module.exports = {
  COMMANDS,
  HELP_TEXT,
  GAMEPLAY_TEST_HELP,
  parseCliArgs,
  extractFlag,
  cmdStatus,
  cmdHealth,
  cmdReview,
  cmdDedup,
  cmdReport,
  cmdMetrics,
  cmdSecurity,
  cmdPreflight,
  cmdEnforceProtection,
  cmdPlugin,
  cmdGameplayTest,
  cmdDashboardData,
  cmdWatch,
  cmdHelp,
  route,
  main,
};
