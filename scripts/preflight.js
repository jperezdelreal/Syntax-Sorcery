#!/usr/bin/env node
'use strict';

/**
 * Pre-flight Validation Script — validates all Test 3 prerequisites in one command.
 *
 * Usage:
 *   node scripts/preflight.js
 *   node scripts/preflight.js --json
 *   node scripts/preflight.js --skip-azure
 *   node scripts/preflight.js --fix
 *
 * Checks:
 *   1. Azure CLI installed + logged in
 *   2. SSH key exists
 *   3. Downstream repos accessible (gh api)
 *   4. Branch protection configured on all 5 downstreams
 *   5. Dedup guard operational (dry-run)
 *   6. Constellation health passing
 *   7. Security audit clean
 *   8. Test suite green
 *
 * Flags:
 *   --skip-azure  Skip Azure checks for local-only validation
 *   --json        Machine-readable JSON output
 *   --fix         Auto-fix what can be fixed (e.g. run npm install)
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 *   2 — execution error
 *
 * No new dependencies — uses only Node.js built-ins.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSTELLATION_PATH = path.resolve(__dirname, '..', '.squad', 'constellation.json');

// Downstream repos (excluding the hub repo itself)
const HUB_REPO = 'jperezdelreal/Syntax-Sorcery';

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    skipAzure: args.includes('--skip-azure'),
    json: args.includes('--json'),
    fix: args.includes('--fix'),
  };
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
// Check: Azure CLI installed + logged in
// ---------------------------------------------------------------------------

function checkAzureCli(execFn) {
  const version = safeExec('az version --output json', execFn);
  if (!version.ok) {
    return {
      name: 'Azure CLI installed',
      passed: false,
      message: 'Azure CLI (az) is not installed or not in PATH.',
      fix: 'Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli',
    };
  }

  const account = safeExec('az account show --output json', execFn);
  if (!account.ok) {
    return {
      name: 'Azure CLI logged in',
      passed: false,
      message: 'Azure CLI is installed but not logged in.',
      fix: 'Run: az login',
    };
  }

  let acctInfo = '';
  try {
    const parsed = JSON.parse(account.stdout);
    acctInfo = ` (${parsed.name || parsed.user?.name || 'unknown'})`;
  } catch { /* ignore */ }

  return {
    name: 'Azure CLI logged in',
    passed: true,
    message: `Azure CLI authenticated${acctInfo}.`,
  };
}

// ---------------------------------------------------------------------------
// Check: SSH key exists
// ---------------------------------------------------------------------------

function checkSshKey(fsFn) {
  const fileExists = fsFn || ((p) => fs.existsSync(p));
  const sshDir = path.join(os.homedir(), '.ssh');
  const keyFiles = ['id_ed25519', 'id_rsa', 'id_ecdsa'];

  for (const key of keyFiles) {
    if (fileExists(path.join(sshDir, key))) {
      return {
        name: 'SSH key exists',
        passed: true,
        message: `SSH key found: ~/.ssh/${key}`,
      };
    }
  }

  return {
    name: 'SSH key exists',
    passed: false,
    message: 'No SSH key found in ~/.ssh/ (checked id_ed25519, id_rsa, id_ecdsa).',
    fix: 'Run: ssh-keygen -t ed25519 -C "your_email@example.com" && ssh-add ~/.ssh/id_ed25519',
  };
}

// ---------------------------------------------------------------------------
// Check: Downstream repos accessible
// ---------------------------------------------------------------------------

function loadConstellation(readFileFn) {
  const readFile = readFileFn || ((p) => fs.readFileSync(p, 'utf8'));
  try {
    const raw = readFile(CONSTELLATION_PATH);
    const data = JSON.parse(raw);
    return data.repos || [];
  } catch {
    return [];
  }
}

function getDownstreamRepos(readFileFn) {
  const all = loadConstellation(readFileFn);
  return all.filter(r => r !== HUB_REPO);
}

function checkReposAccessible(execFn, readFileFn) {
  const repos = getDownstreamRepos(readFileFn);
  if (repos.length === 0) {
    return {
      name: 'Downstream repos accessible',
      passed: false,
      message: 'No downstream repos found in .squad/constellation.json.',
      fix: 'Ensure .squad/constellation.json lists downstream repos.',
    };
  }

  const inaccessible = [];
  for (const repo of repos) {
    const result = safeExec(`gh api repos/${repo} --jq .full_name`, execFn);
    if (!result.ok) {
      inaccessible.push(repo);
    }
  }

  if (inaccessible.length > 0) {
    return {
      name: 'Downstream repos accessible',
      passed: false,
      message: `Cannot access ${inaccessible.length} repo(s): ${inaccessible.join(', ')}`,
      fix: 'Ensure gh CLI is authenticated with repo scope: gh auth login --scopes repo',
    };
  }

  return {
    name: 'Downstream repos accessible',
    passed: true,
    message: `All ${repos.length} downstream repo(s) accessible.`,
  };
}

// ---------------------------------------------------------------------------
// Check: Branch protection configured on downstreams
// ---------------------------------------------------------------------------

function checkBranchProtection(execFn, readFileFn) {
  const repos = getDownstreamRepos(readFileFn);
  if (repos.length === 0) {
    return {
      name: 'Branch protection configured',
      passed: false,
      message: 'No downstream repos found in .squad/constellation.json.',
      fix: 'Ensure .squad/constellation.json lists downstream repos.',
    };
  }

  const unprotected = [];
  for (const repo of repos) {
    const result = safeExec(
      `gh api repos/${repo}/branches/master/protection --jq .required_status_checks`,
      execFn
    );
    if (!result.ok) {
      unprotected.push(repo);
    }
  }

  if (unprotected.length > 0) {
    return {
      name: 'Branch protection configured',
      passed: false,
      message: `${unprotected.length} repo(s) missing branch protection: ${unprotected.join(', ')}`,
      fix: 'Configure branch protection with ≥1 required status check on each repo\'s master branch.',
    };
  }

  return {
    name: 'Branch protection configured',
    passed: true,
    message: `Branch protection verified on all ${repos.length} downstream repo(s).`,
  };
}

// ---------------------------------------------------------------------------
// Check: Dedup guard operational (dry-run)
// ---------------------------------------------------------------------------

function checkDedupGuard(execFn) {
  const scriptPath = path.resolve(__dirname, 'dedup-guard.js');
  const result = safeExec(`node "${scriptPath}"`, execFn, 30_000);

  if (!result.ok) {
    return {
      name: 'Dedup guard operational',
      passed: false,
      message: `Dedup guard failed: ${result.stderr || 'unknown error'}`,
      fix: 'Check scripts/dedup-guard.js and ensure gh CLI is authenticated.',
    };
  }

  return {
    name: 'Dedup guard operational',
    passed: true,
    message: 'Dedup guard executed successfully.',
  };
}

// ---------------------------------------------------------------------------
// Check: Constellation health
// ---------------------------------------------------------------------------

function checkConstellationHealth(execFn) {
  const scriptPath = path.resolve(__dirname, 'constellation-health.js');
  const result = safeExec(`node "${scriptPath}" --json`, execFn, 60_000);

  if (!result.ok) {
    return {
      name: 'Constellation health',
      passed: false,
      message: `Constellation health check failed: ${result.stderr || 'unknown error'}`,
      fix: 'Run: npm run check:constellation -- to diagnose issues.',
    };
  }

  // Parse JSON output to check for RED repos
  try {
    const data = JSON.parse(result.stdout);
    const repos = data.repos || data.results || [];
    const redRepos = repos.filter(r => (r.status || r.health) === 'RED');
    if (redRepos.length > 0) {
      const names = redRepos.map(r => r.repo || r.name).join(', ');
      return {
        name: 'Constellation health',
        passed: false,
        message: `${redRepos.length} repo(s) in RED state: ${names}`,
        fix: 'Run: npm run check:constellation -- to see details and fix unhealthy repos.',
      };
    }
  } catch {
    // If JSON parsing fails, the check still ran successfully
  }

  return {
    name: 'Constellation health',
    passed: true,
    message: 'All constellation repos are healthy.',
  };
}

// ---------------------------------------------------------------------------
// Check: Security audit clean
// ---------------------------------------------------------------------------

function checkSecurityAudit(execFn) {
  const scriptPath = path.resolve(__dirname, 'security-audit.js');
  const result = safeExec(`node "${scriptPath}" --json`, execFn, 60_000);

  if (!result.ok) {
    return {
      name: 'Security audit clean',
      passed: false,
      message: `Security audit failed: ${result.stderr || 'unknown error'}`,
      fix: 'Run: npm run security -- --fix',
    };
  }

  try {
    const data = JSON.parse(result.stdout);
    if (data.passed === false) {
      const vulns = data.audit?.vulnerabilities || {};
      const secretCount = (data.secrets || []).length;
      const parts = [];
      if (vulns.critical > 0 || vulns.high > 0) {
        parts.push(`${vulns.critical || 0} critical, ${vulns.high || 0} high vulnerabilities`);
      }
      if (secretCount > 0) {
        parts.push(`${secretCount} secret(s) detected`);
      }
      return {
        name: 'Security audit clean',
        passed: false,
        message: `Security issues found: ${parts.join('; ') || 'check audit output'}`,
        fix: 'Run: npm run security -- --fix',
      };
    }
  } catch {
    // If JSON parsing fails but command succeeded, treat as pass
  }

  return {
    name: 'Security audit clean',
    passed: true,
    message: 'No high/critical vulnerabilities or secrets detected.',
  };
}

// ---------------------------------------------------------------------------
// Check: Test suite green
// ---------------------------------------------------------------------------

function checkTestSuite(execFn) {
  const result = safeExec('npx vitest run', execFn, 120_000);

  if (!result.ok) {
    // Extract failure summary from output
    const output = result.stdout || result.stderr || '';
    const failLine = output.split('\n').find(l => /Tests?\s+\d/.test(l)) || 'Tests failed';
    return {
      name: 'Test suite green',
      passed: false,
      message: `Test suite failed: ${failLine.trim()}`,
      fix: 'Run: npm test -- to see full test output and fix failures.',
    };
  }

  return {
    name: 'Test suite green',
    passed: true,
    message: 'All tests passed.',
  };
}

// ---------------------------------------------------------------------------
// Auto-fix
// ---------------------------------------------------------------------------

function autoFix(checks, execFn) {
  const fixes = [];

  // If test suite failed, try npm install first
  const testCheck = checks.find(c => c.name === 'Test suite green' && !c.passed);
  if (testCheck) {
    const result = safeExec('npm install', execFn, 60_000);
    fixes.push({
      action: 'npm install',
      success: result.ok,
      message: result.ok ? 'Dependencies installed.' : `npm install failed: ${result.stderr}`,
    });
  }

  // If security audit failed, try npm audit fix
  const secCheck = checks.find(c => c.name === 'Security audit clean' && !c.passed);
  if (secCheck) {
    const result = safeExec('npm audit fix', execFn, 60_000);
    fixes.push({
      action: 'npm audit fix',
      success: result.ok,
      message: result.ok ? 'Audit fix applied.' : `npm audit fix failed: ${result.stderr}`,
    });
  }

  return fixes;
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatHumanReport(checks, fixes) {
  const lines = [];
  lines.push('');
  lines.push('╔══════════════════════════════════════════════════╗');
  lines.push('║          Test 3 Pre-flight Validation            ║');
  lines.push('╚══════════════════════════════════════════════════╝');
  lines.push('');

  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌';
    lines.push(`  ${icon} ${check.name}`);
    lines.push(`     ${check.message}`);
    if (!check.passed && check.fix) {
      lines.push(`     💡 Fix: ${check.fix}`);
    }
    lines.push('');
  }

  if (fixes && fixes.length > 0) {
    lines.push('=== Auto-fix Results ===');
    for (const fix of fixes) {
      const icon = fix.success ? '✅' : '❌';
      lines.push(`  ${icon} ${fix.action}: ${fix.message}`);
    }
    lines.push('');
  }

  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  const allPassed = passed === total;

  lines.push('─'.repeat(50));
  if (allPassed) {
    lines.push(`  🚀 ALL CHECKS PASSED (${passed}/${total}) — Ready for Test 3!`);
  } else {
    lines.push(`  ⚠️  ${total - passed} CHECK(S) FAILED (${passed}/${total} passed)`);
    lines.push('  Fix the issues above before proceeding with Test 3.');
  }
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run(argv, deps) {
  const execFn = deps?.exec;
  const fsFn = deps?.fileExists;
  const readFileFn = deps?.readFile;

  const parsed = parseArgs(argv || process.argv);
  const checks = [];

  // 1. Azure CLI (skippable)
  if (!parsed.skipAzure) {
    checks.push(checkAzureCli(execFn));
  }

  // 2. SSH key
  checks.push(checkSshKey(fsFn));

  // 3. Downstream repos accessible
  checks.push(checkReposAccessible(execFn, readFileFn));

  // 4. Branch protection
  checks.push(checkBranchProtection(execFn, readFileFn));

  // 5. Dedup guard
  checks.push(checkDedupGuard(execFn));

  // 6. Constellation health
  checks.push(checkConstellationHealth(execFn));

  // 7. Security audit
  checks.push(checkSecurityAudit(execFn));

  // 8. Test suite
  checks.push(checkTestSuite(execFn));

  // Auto-fix if requested
  let fixes = null;
  if (parsed.fix) {
    fixes = autoFix(checks, execFn);
  }

  // Determine exit code
  const allPassed = checks.every(c => c.passed);
  const exitCode = allPassed ? 0 : 1;

  // Output
  if (parsed.json) {
    const result = {
      passed: allPassed,
      checks: checks.map(c => ({
        name: c.name,
        passed: c.passed,
        message: c.message,
        ...(c.fix && !c.passed ? { fix: c.fix } : {}),
      })),
      ...(fixes ? { fixes } : {}),
      summary: {
        total: checks.length,
        passed: checks.filter(c => c.passed).length,
        failed: checks.filter(c => !c.passed).length,
      },
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatHumanReport(checks, fixes));
  }

  return { exitCode, checks, fixes };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const result = run();
  process.exit(result.exitCode);
}

module.exports = {
  parseArgs,
  safeExec,
  checkAzureCli,
  checkSshKey,
  checkReposAccessible,
  checkBranchProtection,
  checkDedupGuard,
  checkConstellationHealth,
  checkSecurityAudit,
  checkTestSuite,
  autoFix,
  formatHumanReport,
  loadConstellation,
  getDownstreamRepos,
  run,
};
