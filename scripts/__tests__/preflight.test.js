/**
 * Tests for scripts/preflight.js
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach, afterEach are global).
 * All external calls (exec, fs) are DI-mocked — no real commands or file I/O.
 */

const path = require('path');

const {
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
} = require('../preflight');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockExec(responses) {
  return (cmd, opts) => {
    for (const [pattern, response] of Object.entries(responses)) {
      if (cmd.includes(pattern)) {
        if (response instanceof Error) throw response;
        if (typeof response === 'function') return response(cmd, opts);
        return response;
      }
    }
    throw Object.assign(new Error(`Command not mocked: ${cmd}`), { stderr: 'not mocked' });
  };
}

function mockReadFile(files) {
  return (filePath) => {
    for (const [pattern, content] of Object.entries(files)) {
      if (filePath.includes(pattern)) return content;
    }
    throw new Error(`File not mocked: ${filePath}`);
  };
}

const CONSTELLATION_DATA = JSON.stringify({
  repos: [
    'jperezdelreal/Syntax-Sorcery',
    'jperezdelreal/FirstFrameStudios',
    'jperezdelreal/flora',
    'jperezdelreal/ComeRosquillas',
    'jperezdelreal/pixel-bounce',
    'jperezdelreal/ffs-squad-monitor',
  ],
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses no flags', () => {
    const result = parseArgs(['node', 'preflight.js']);
    expect(result).toEqual({ skipAzure: false, json: false, fix: false });
  });

  it('parses --skip-azure flag', () => {
    const result = parseArgs(['node', 'preflight.js', '--skip-azure']);
    expect(result.skipAzure).toBe(true);
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'preflight.js', '--json']);
    expect(result.json).toBe(true);
  });

  it('parses --fix flag', () => {
    const result = parseArgs(['node', 'preflight.js', '--fix']);
    expect(result.fix).toBe(true);
  });

  it('parses multiple flags', () => {
    const result = parseArgs(['node', 'preflight.js', '--skip-azure', '--json', '--fix']);
    expect(result).toEqual({ skipAzure: true, json: true, fix: true });
  });
});

// ---------------------------------------------------------------------------
// safeExec
// ---------------------------------------------------------------------------

describe('safeExec', () => {
  it('returns ok:true on successful command', () => {
    const exec = () => '  hello world  ';
    const result = safeExec('echo hello', exec);
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('hello world');
  });

  it('returns ok:false on failed command', () => {
    const exec = () => { throw Object.assign(new Error('fail'), { stderr: 'err msg' }); };
    const result = safeExec('bad-cmd', exec);
    expect(result.ok).toBe(false);
    expect(result.stderr).toBe('err msg');
  });
});

// ---------------------------------------------------------------------------
// checkAzureCli
// ---------------------------------------------------------------------------

describe('checkAzureCli', () => {
  it('passes when az is installed and logged in', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': '{"name": "Test Sub", "user": {"name": "test@example.com"}}',
    });
    const result = checkAzureCli(exec);
    expect(result.passed).toBe(true);
    expect(result.name).toBe('Azure CLI logged in');
  });

  it('fails when az is not installed', () => {
    const exec = mockExec({
      'az version': new Error('az not found'),
    });
    const result = checkAzureCli(exec);
    expect(result.passed).toBe(false);
    expect(result.name).toBe('Azure CLI installed');
    expect(result.fix).toContain('Install Azure CLI');
  });

  it('fails when az is installed but not logged in', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': new Error('not logged in'),
    });
    const result = checkAzureCli(exec);
    expect(result.passed).toBe(false);
    expect(result.name).toBe('Azure CLI logged in');
    expect(result.fix).toContain('az login');
  });
});

// ---------------------------------------------------------------------------
// checkSshKey
// ---------------------------------------------------------------------------

describe('checkSshKey', () => {
  it('passes when id_ed25519 exists', () => {
    const fileExists = (p) => p.includes('id_ed25519');
    const result = checkSshKey(fileExists);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('id_ed25519');
  });

  it('passes when id_rsa exists', () => {
    const fileExists = (p) => p.includes('id_rsa');
    const result = checkSshKey(fileExists);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('id_rsa');
  });

  it('fails when no SSH key exists', () => {
    const fileExists = () => false;
    const result = checkSshKey(fileExists);
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('ssh-keygen');
  });
});

// ---------------------------------------------------------------------------
// loadConstellation / getDownstreamRepos
// ---------------------------------------------------------------------------

describe('loadConstellation', () => {
  it('loads repos from constellation.json', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const repos = loadConstellation(readFile);
    expect(repos).toHaveLength(6);
    expect(repos).toContain('jperezdelreal/Syntax-Sorcery');
  });

  it('returns empty array on file read error', () => {
    const readFile = () => { throw new Error('not found'); };
    const repos = loadConstellation(readFile);
    expect(repos).toEqual([]);
  });
});

describe('getDownstreamRepos', () => {
  it('excludes hub repo from constellation', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const repos = getDownstreamRepos(readFile);
    expect(repos).toHaveLength(5);
    expect(repos).not.toContain('jperezdelreal/Syntax-Sorcery');
  });
});

// ---------------------------------------------------------------------------
// checkReposAccessible
// ---------------------------------------------------------------------------

describe('checkReposAccessible', () => {
  it('passes when all downstream repos are accessible', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const exec = mockExec({
      'gh api repos/': 'jperezdelreal/some-repo',
    });
    const result = checkReposAccessible(exec, readFile);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('5');
  });

  it('fails when some repos are inaccessible', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const exec = (cmd, opts) => {
      if (cmd.includes('flora')) throw new Error('404');
      return 'ok';
    };
    const result = checkReposAccessible(exec, readFile);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('flora');
  });

  it('fails when no constellation data exists', () => {
    const readFile = () => { throw new Error('not found'); };
    const result = checkReposAccessible(() => 'ok', readFile);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('No downstream repos');
  });
});

// ---------------------------------------------------------------------------
// checkBranchProtection
// ---------------------------------------------------------------------------

describe('checkBranchProtection', () => {
  it('passes when all repos have branch protection', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const exec = mockExec({
      'gh api repos/': '{"required_status_checks": {}}',
    });
    const result = checkBranchProtection(exec, readFile);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('5');
  });

  it('fails when some repos lack branch protection', () => {
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });
    const exec = (cmd, opts) => {
      if (cmd.includes('pixel-bounce')) throw new Error('404');
      return '{}';
    };
    const result = checkBranchProtection(exec, readFile);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('pixel-bounce');
  });
});

// ---------------------------------------------------------------------------
// checkDedupGuard
// ---------------------------------------------------------------------------

describe('checkDedupGuard', () => {
  it('passes when dedup guard succeeds', () => {
    const exec = mockExec({ 'dedup-guard': 'No duplicates found' });
    const result = checkDedupGuard(exec);
    expect(result.passed).toBe(true);
  });

  it('fails when dedup guard errors', () => {
    const exec = mockExec({ 'dedup-guard': new Error('script crashed') });
    const result = checkDedupGuard(exec);
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('dedup-guard');
  });
});

// ---------------------------------------------------------------------------
// checkConstellationHealth
// ---------------------------------------------------------------------------

describe('checkConstellationHealth', () => {
  it('passes when all repos are healthy', () => {
    const exec = mockExec({
      'constellation-health': JSON.stringify({
        repos: [
          { repo: 'test/repo1', status: 'GREEN' },
          { repo: 'test/repo2', status: 'GREEN' },
        ],
      }),
    });
    const result = checkConstellationHealth(exec);
    expect(result.passed).toBe(true);
  });

  it('fails when a repo is RED', () => {
    const exec = mockExec({
      'constellation-health': JSON.stringify({
        repos: [
          { repo: 'test/repo1', status: 'GREEN' },
          { repo: 'test/repo2', status: 'RED' },
        ],
      }),
    });
    const result = checkConstellationHealth(exec);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('RED');
    expect(result.message).toContain('repo2');
  });

  it('fails when health script errors', () => {
    const exec = mockExec({
      'constellation-health': new Error('script error'),
    });
    const result = checkConstellationHealth(exec);
    expect(result.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkSecurityAudit
// ---------------------------------------------------------------------------

describe('checkSecurityAudit', () => {
  it('passes when audit is clean', () => {
    const exec = mockExec({
      'security-audit': JSON.stringify({
        passed: true,
        audit: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } },
        secrets: [],
      }),
    });
    const result = checkSecurityAudit(exec);
    expect(result.passed).toBe(true);
  });

  it('fails when critical vulnerabilities found', () => {
    const exec = mockExec({
      'security-audit': JSON.stringify({
        passed: false,
        audit: { vulnerabilities: { critical: 2, high: 1, moderate: 0, low: 0 } },
        secrets: [],
      }),
    });
    const result = checkSecurityAudit(exec);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('critical');
  });

  it('fails when secrets detected', () => {
    const exec = mockExec({
      'security-audit': JSON.stringify({
        passed: false,
        audit: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } },
        secrets: [{ pattern: 'GitHub Token', file: 'config.js', line: 1 }],
      }),
    });
    const result = checkSecurityAudit(exec);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('secret');
  });

  it('fails when audit script errors', () => {
    const exec = mockExec({
      'security-audit': new Error('audit error'),
    });
    const result = checkSecurityAudit(exec);
    expect(result.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkTestSuite
// ---------------------------------------------------------------------------

describe('checkTestSuite', () => {
  it('passes when all tests pass', () => {
    const exec = mockExec({ 'vitest run': 'Tests  42 passed' });
    const result = checkTestSuite(exec);
    expect(result.passed).toBe(true);
  });

  it('fails when tests fail', () => {
    const exec = mockExec({ 'vitest run': new Error('Tests  3 failed | 39 passed') });
    const result = checkTestSuite(exec);
    expect(result.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// autoFix
// ---------------------------------------------------------------------------

describe('autoFix', () => {
  it('runs npm install when tests failed', () => {
    const checks = [
      { name: 'Test suite green', passed: false },
      { name: 'Security audit clean', passed: true },
    ];
    const exec = mockExec({ 'npm install': 'added 0 packages', 'npm audit fix': 'fixed 0' });
    const fixes = autoFix(checks, exec);
    expect(fixes).toHaveLength(1);
    expect(fixes[0].action).toBe('npm install');
    expect(fixes[0].success).toBe(true);
  });

  it('runs npm audit fix when security failed', () => {
    const checks = [
      { name: 'Test suite green', passed: true },
      { name: 'Security audit clean', passed: false },
    ];
    const exec = mockExec({ 'npm audit fix': 'fixed 2 packages' });
    const fixes = autoFix(checks, exec);
    expect(fixes).toHaveLength(1);
    expect(fixes[0].action).toBe('npm audit fix');
    expect(fixes[0].success).toBe(true);
  });

  it('runs both fixes when both failed', () => {
    const checks = [
      { name: 'Test suite green', passed: false },
      { name: 'Security audit clean', passed: false },
    ];
    const exec = mockExec({ 'npm install': 'ok', 'npm audit fix': 'ok' });
    const fixes = autoFix(checks, exec);
    expect(fixes).toHaveLength(2);
  });

  it('returns empty when nothing to fix', () => {
    const checks = [
      { name: 'Test suite green', passed: true },
      { name: 'Security audit clean', passed: true },
    ];
    const fixes = autoFix(checks, () => 'ok');
    expect(fixes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// formatHumanReport
// ---------------------------------------------------------------------------

describe('formatHumanReport', () => {
  it('shows all-pass summary', () => {
    const checks = [
      { name: 'Check 1', passed: true, message: 'OK' },
      { name: 'Check 2', passed: true, message: 'OK' },
    ];
    const report = formatHumanReport(checks);
    expect(report).toContain('ALL CHECKS PASSED');
    expect(report).toContain('2/2');
  });

  it('shows failure summary with fix instructions', () => {
    const checks = [
      { name: 'Check 1', passed: true, message: 'OK' },
      { name: 'Check 2', passed: false, message: 'Not OK', fix: 'Do something' },
    ];
    const report = formatHumanReport(checks);
    expect(report).toContain('1 CHECK(S) FAILED');
    expect(report).toContain('1/2');
    expect(report).toContain('Do something');
  });

  it('includes fix results when provided', () => {
    const checks = [{ name: 'Check 1', passed: false, message: 'fail' }];
    const fixes = [{ action: 'npm install', success: true, message: 'done' }];
    const report = formatHumanReport(checks, fixes);
    expect(report).toContain('Auto-fix Results');
    expect(report).toContain('npm install');
  });
});

// ---------------------------------------------------------------------------
// run — combined integration
// ---------------------------------------------------------------------------

describe('run', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns exitCode 0 when all checks pass', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': '{"name": "Test Sub"}',
      'gh api repos/': '{"required_status_checks": {}}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [{ repo: 'r1', status: 'GREEN' }] }),
      'security-audit': JSON.stringify({ passed: true, audit: { vulnerabilities: {} }, secrets: [] }),
      'vitest run': 'Tests  42 passed',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    const result = run(['node', 'preflight.js'], { exec, fileExists, readFile });
    expect(result.exitCode).toBe(0);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('returns exitCode 1 when a check fails', () => {
    const exec = mockExec({
      'az version': new Error('not found'),
      'gh api repos/': '{}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [] }),
      'security-audit': JSON.stringify({ passed: true }),
      'vitest run': 'Tests  10 passed',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    const result = run(['node', 'preflight.js'], { exec, fileExists, readFile });
    expect(result.exitCode).toBe(1);
    expect(result.checks.some(c => !c.passed)).toBe(true);
  });

  it('skips Azure check with --skip-azure', () => {
    const exec = mockExec({
      'gh api repos/': '{}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [] }),
      'security-audit': JSON.stringify({ passed: true }),
      'vitest run': 'Tests  10 passed',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    const result = run(['node', 'preflight.js', '--skip-azure'], { exec, fileExists, readFile });
    const azureCheck = result.checks.find(c => c.name.includes('Azure'));
    expect(azureCheck).toBeUndefined();
  });

  it('outputs JSON with --json flag', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': '{"name": "Test Sub"}',
      'gh api repos/': '{}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [] }),
      'security-audit': JSON.stringify({ passed: true }),
      'vitest run': 'ok',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    run(['node', 'preflight.js', '--json'], { exec, fileExists, readFile });

    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('passed');
    expect(parsed).toHaveProperty('checks');
    expect(parsed).toHaveProperty('summary');
  });

  it('runs auto-fix with --fix flag', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': '{"name": "Test Sub"}',
      'gh api repos/': '{}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [] }),
      'security-audit': JSON.stringify({ passed: false, audit: { vulnerabilities: { critical: 1 } }, secrets: [] }),
      'vitest run': new Error('test fail'),
      'npm install': 'ok',
      'npm audit fix': 'ok',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    const result = run(['node', 'preflight.js', '--fix'], { exec, fileExists, readFile });
    expect(result.fixes).toHaveLength(2);
  });

  it('reports correct summary counts', () => {
    const exec = mockExec({
      'az version': '{"azure-cli": "2.50.0"}',
      'az account show': '{"name": "Test Sub"}',
      'gh api repos/': '{}',
      'dedup-guard': 'ok',
      'constellation-health': JSON.stringify({ repos: [] }),
      'security-audit': JSON.stringify({ passed: true }),
      'vitest run': 'ok',
    });
    const fileExists = () => true;
    const readFile = mockReadFile({ 'constellation.json': CONSTELLATION_DATA });

    run(['node', 'preflight.js', '--json'], { exec, fileExists, readFile });

    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.summary.total).toBe(parsed.summary.passed + parsed.summary.failed);
  });
});
