#!/usr/bin/env node
'use strict';

/**
 * One-command developer bootstrap for Syntax Sorcery.
 *
 * Validates prerequisites, installs dependencies, runs structure validation,
 * health checks, and tests — all with step-by-step progress output.
 *
 * Usage:
 *   node scripts/bootstrap.js
 *   node scripts/bootstrap.js --skip-tests --skip-health --verbose
 *   npm run setup
 *
 * CLI flags:
 *   --skip-tests   Skip test validation step
 *   --skip-health  Skip constellation health check
 *   --verbose      Show full command output
 *
 * No new dependencies — uses only Node.js built-ins.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_DIR = path.join(ROOT, 'site');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    skipTests: args.includes('--skip-tests'),
    skipHealth: args.includes('--skip-health'),
    verbose: args.includes('--verbose'),
  };
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function log(msg) { console.log(msg); }
function stepStart(label) { log(`\n⏳ ${label}...`); }
function stepPass(label) { log(`✅ ${label}`); }
function stepSkip(label, reason) { log(`⏭️  ${label} — skipped (${reason})`); }
function stepFail(label, detail) { log(`❌ ${label}`); if (detail) log(`   ${detail}`); }

// ---------------------------------------------------------------------------
// Command runner (dependency-injectable for testing)
// ---------------------------------------------------------------------------

function defaultExec(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    timeout: 120_000,
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: opts.cwd || ROOT,
    ...opts,
  });
}

// ---------------------------------------------------------------------------
// Prerequisite checks
// ---------------------------------------------------------------------------

function checkNodeVersion(exec) {
  const raw = exec('node --version').trim();           // e.g. "v20.11.0"
  const major = parseInt(raw.replace(/^v/, ''), 10);
  if (isNaN(major) || major < 18) {
    return { ok: false, detail: `Node ${raw} found — requires >=18` };
  }
  return { ok: true, detail: raw };
}

function checkGhCli(exec) {
  try {
    const raw = exec('gh --version').split('\n')[0].trim();
    return { ok: true, detail: raw };
  } catch {
    return { ok: false, detail: 'gh CLI not installed' };
  }
}

function checkGhAuth(exec) {
  try {
    exec('gh auth status');
    return { ok: true, detail: 'authenticated' };
  } catch {
    return { ok: false, detail: 'gh auth not configured' };
  }
}

function checkGitConfig(exec) {
  try {
    const name = exec('git config user.name').trim();
    const email = exec('git config user.email').trim();
    if (!name || !email) {
      return { ok: false, detail: 'git user.name or user.email not set' };
    }
    return { ok: true, detail: `${name} <${email}>` };
  } catch {
    return { ok: false, detail: 'git config not available' };
  }
}

function runPrerequisites(exec, verbose) {
  stepStart('Checking prerequisites');
  const checks = [
    { label: 'Node >=18', fn: () => checkNodeVersion(exec) },
    { label: 'GitHub CLI (gh)', fn: () => checkGhCli(exec) },
    { label: 'gh auth', fn: () => checkGhAuth(exec) },
    { label: 'git config', fn: () => checkGitConfig(exec) },
  ];

  let ghAvailable = true;
  const results = [];

  for (const check of checks) {
    const result = check.fn();
    results.push({ ...result, label: check.label });

    if (result.ok) {
      stepPass(`${check.label} ${verbose ? '(' + result.detail + ')' : ''}`);
    } else {
      // gh CLI and gh auth are soft failures (graceful degradation)
      if (check.label === 'GitHub CLI (gh)' || check.label === 'gh auth') {
        stepSkip(check.label, result.detail);
        ghAvailable = false;
      } else {
        stepFail(check.label, result.detail);
        return { ok: false, ghAvailable, results };
      }
    }
  }

  return { ok: true, ghAvailable, results };
}

// ---------------------------------------------------------------------------
// Dependency installation
// ---------------------------------------------------------------------------

function installDeps(exec, verbose) {
  stepStart('Installing dependencies (root)');
  try {
    const out = exec('npm ci', { cwd: ROOT });
    if (verbose) log(out);
    stepPass('Root dependencies installed');
  } catch (e) {
    stepFail('Root npm ci failed', e.message);
    return false;
  }

  // Site dependencies (only if site/ has package.json)
  const sitePkg = path.join(SITE_DIR, 'package.json');
  if (fs.existsSync(sitePkg)) {
    stepStart('Installing dependencies (site)');
    try {
      const out = exec('npm ci', { cwd: SITE_DIR });
      if (verbose) log(out);
      stepPass('Site dependencies installed');
    } catch (e) {
      stepFail('Site npm ci failed', e.message);
      return false;
    }
  } else {
    stepSkip('Site dependencies', 'no site/package.json found');
  }

  return true;
}

// ---------------------------------------------------------------------------
// Structure validation
// ---------------------------------------------------------------------------

function runValidateSquad(exec, verbose) {
  stepStart('Validating .squad/ structure');
  try {
    const out = exec('node scripts/validate-squad.js', { cwd: ROOT });
    if (verbose) log(out);
    stepPass('.squad/ structure valid');
    return true;
  } catch (e) {
    stepFail('.squad/ validation failed', e.stderr || e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

function runHealthCheck(exec, verbose, ghAvailable) {
  if (!ghAvailable) {
    stepSkip('Constellation health check', 'gh CLI not available');
    return true;
  }
  stepStart('Running constellation health check');
  try {
    const out = exec('node scripts/constellation-health.js', { cwd: ROOT });
    if (verbose) log(out);
    stepPass('Constellation health check passed');
    return true;
  } catch (e) {
    stepFail('Constellation health check failed', e.stderr || e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Test validation
// ---------------------------------------------------------------------------

function runTests(exec, verbose) {
  stepStart('Running tests');
  try {
    const out = exec('npm test', { cwd: ROOT });
    if (verbose) log(out);
    // Try to extract test count from vitest output
    const match = out.match(/(\d+)\s+passed/i);
    const count = match ? match[1] : '?';
    stepPass(`Tests passed (${count} tests)`);
    return true;
  } catch (e) {
    stepFail('Tests failed', e.stderr || e.stdout || e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main run function (dependency-injectable for testing)
// ---------------------------------------------------------------------------

function run(argv, deps = {}) {
  const exec = deps.exec || defaultExec;
  const existsSync = deps.existsSync || fs.existsSync;
  const startTime = Date.now();

  const flags = parseArgs(argv);

  log('');
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║          SYNTAX SORCERY — Developer Bootstrap               ║');
  log('╚══════════════════════════════════════════════════════════════╝');

  // Step 1: Prerequisites
  const prereqs = runPrerequisites(exec, flags.verbose);
  if (!prereqs.ok) {
    log('\n❌ Bootstrap failed at prerequisites.');
    return { exitCode: 1, step: 'prerequisites' };
  }

  // Step 2: Install dependencies
  // Override fs.existsSync for site/package.json check in tests
  const origExists = fs.existsSync;
  if (deps.existsSync) fs.existsSync = deps.existsSync;
  const depsOk = installDeps(exec, flags.verbose);
  if (deps.existsSync) fs.existsSync = origExists;
  if (!depsOk) {
    log('\n❌ Bootstrap failed at dependency installation.');
    return { exitCode: 1, step: 'dependencies' };
  }

  // Step 3: Structure validation
  const structureOk = runValidateSquad(exec, flags.verbose);
  if (!structureOk) {
    log('\n❌ Bootstrap failed at .squad/ validation.');
    return { exitCode: 1, step: 'validate-squad' };
  }

  // Step 4: Health check
  if (flags.skipHealth) {
    stepSkip('Constellation health check', '--skip-health flag');
  } else {
    const healthOk = runHealthCheck(exec, flags.verbose, prereqs.ghAvailable);
    if (!healthOk) {
      log('\n❌ Bootstrap failed at health check.');
      return { exitCode: 1, step: 'health-check' };
    }
  }

  // Step 5: Tests
  if (flags.skipTests) {
    stepSkip('Test validation', '--skip-tests flag');
  } else {
    const testsOk = runTests(exec, flags.verbose);
    if (!testsOk) {
      log('\n❌ Bootstrap failed at test validation.');
      return { exitCode: 1, step: 'tests' };
    }
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('\n' + '═'.repeat(62));
  log(`✅ Bootstrap complete! (${elapsed}s)`);
  log('');
  log('  Next steps:');
  log('    npm test          — run tests');
  log('    npm run squad     — squad CLI');
  log('    npm run metrics   — performance metrics');
  log('');

  return { exitCode: 0, elapsed };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const result = run(process.argv);
  process.exit(result.exitCode);
}

module.exports = {
  parseArgs,
  checkNodeVersion,
  checkGhCli,
  checkGhAuth,
  checkGitConfig,
  runPrerequisites,
  installDeps,
  runValidateSquad,
  runHealthCheck,
  runTests,
  run,
};
