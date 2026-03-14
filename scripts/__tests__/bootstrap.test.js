/**
 * Tests for scripts/bootstrap.js
 *
 * Uses dependency injection to mock exec calls. No real shell commands run.
 * Covers prerequisites, sequencing, graceful degradation, and CLI flags.
 */

const {
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
} = require('../bootstrap');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockExec(overrides = {}) {
  return (cmd) => {
    if (cmd.includes('node --version')) return overrides.nodeVersion ?? 'v20.11.0\n';
    if (cmd.includes('gh --version')) {
      if (overrides.ghMissing) throw new Error('not found');
      return overrides.ghVersion ?? 'gh version 2.45.0 (2026-03-01)\n';
    }
    if (cmd.includes('gh auth status')) {
      if (overrides.ghAuthFail) throw new Error('not logged in');
      return 'Logged in to github.com';
    }
    if (cmd.includes('git config user.name')) return overrides.gitName ?? 'Trinity\n';
    if (cmd.includes('git config user.email')) return overrides.gitEmail ?? 'trinity@ss.dev\n';
    if (cmd === 'npm ci') return 'added 150 packages\n';
    if (cmd.includes('validate-squad')) {
      if (overrides.validateFail) throw new Error('FAILED');
      return 'ALL CHECKS PASSED\n';
    }
    if (cmd.includes('constellation-health')) {
      if (overrides.healthFail) throw new Error('RED');
      return 'All repos healthy!\n';
    }
    if (cmd === 'npm test') {
      if (overrides.testFail) throw new Error('test failure');
      return 'Tests  168 passed\n';
    }
    return '';
  };
}

function silenceConsole() {
  const spies = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };
  return spies;
}

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('returns all false by default', () => {
    const result = parseArgs(['node', 'bootstrap.js']);
    expect(result.skipTests).toBe(false);
    expect(result.skipHealth).toBe(false);
    expect(result.verbose).toBe(false);
  });

  it('parses --skip-tests flag', () => {
    const result = parseArgs(['node', 'bootstrap.js', '--skip-tests']);
    expect(result.skipTests).toBe(true);
  });

  it('parses --skip-health flag', () => {
    const result = parseArgs(['node', 'bootstrap.js', '--skip-health']);
    expect(result.skipHealth).toBe(true);
  });

  it('parses --verbose flag', () => {
    const result = parseArgs(['node', 'bootstrap.js', '--verbose']);
    expect(result.verbose).toBe(true);
  });

  it('parses multiple flags', () => {
    const result = parseArgs(['node', 'bootstrap.js', '--skip-tests', '--skip-health', '--verbose']);
    expect(result.skipTests).toBe(true);
    expect(result.skipHealth).toBe(true);
    expect(result.verbose).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Individual prerequisite checks
// ---------------------------------------------------------------------------

describe('checkNodeVersion', () => {
  it('passes for Node >=18', () => {
    const exec = () => 'v20.11.0';
    expect(checkNodeVersion(exec)).toEqual({ ok: true, detail: 'v20.11.0' });
  });

  it('passes for Node 18 exactly', () => {
    const exec = () => 'v18.0.0';
    expect(checkNodeVersion(exec)).toEqual({ ok: true, detail: 'v18.0.0' });
  });

  it('fails for Node <18', () => {
    const exec = () => 'v16.20.0';
    const result = checkNodeVersion(exec);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain('requires >=18');
  });
});

describe('checkGhCli', () => {
  it('passes when gh is installed', () => {
    const exec = () => 'gh version 2.45.0 (2026-03-01)\nhttps://github.com/cli/cli';
    const result = checkGhCli(exec);
    expect(result.ok).toBe(true);
    expect(result.detail).toContain('gh version');
  });

  it('fails when gh is not installed', () => {
    const exec = () => { throw new Error('not found'); };
    const result = checkGhCli(exec);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain('not installed');
  });
});

describe('checkGhAuth', () => {
  it('passes when authenticated', () => {
    const exec = () => 'Logged in';
    expect(checkGhAuth(exec)).toEqual({ ok: true, detail: 'authenticated' });
  });

  it('fails when not authenticated', () => {
    const exec = () => { throw new Error('not logged in'); };
    const result = checkGhAuth(exec);
    expect(result.ok).toBe(false);
  });
});

describe('checkGitConfig', () => {
  it('passes when name and email are set', () => {
    let callCount = 0;
    const exec = () => {
      callCount++;
      return callCount === 1 ? 'Trinity' : 'trinity@ss.dev';
    };
    const result = checkGitConfig(exec);
    expect(result.ok).toBe(true);
    expect(result.detail).toContain('Trinity');
  });

  it('fails when name is empty', () => {
    const exec = () => '';
    const result = checkGitConfig(exec);
    expect(result.ok).toBe(false);
  });

  it('fails when git config throws', () => {
    const exec = () => { throw new Error('git not found'); };
    const result = checkGitConfig(exec);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// runPrerequisites — sequencing and graceful degradation
// ---------------------------------------------------------------------------

describe('runPrerequisites', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('passes when all prerequisites met', () => {
    const result = runPrerequisites(mockExec(), false);
    expect(result.ok).toBe(true);
    expect(result.ghAvailable).toBe(true);
  });

  it('gracefully degrades when gh CLI is missing', () => {
    const result = runPrerequisites(mockExec({ ghMissing: true }), false);
    expect(result.ok).toBe(true);
    expect(result.ghAvailable).toBe(false);
  });

  it('gracefully degrades when gh auth fails', () => {
    const result = runPrerequisites(mockExec({ ghAuthFail: true }), false);
    expect(result.ok).toBe(true);
    expect(result.ghAvailable).toBe(false);
  });

  it('fails hard when Node version is too low', () => {
    const result = runPrerequisites(mockExec({ nodeVersion: 'v16.0.0\n' }), false);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step functions
// ---------------------------------------------------------------------------

describe('installDeps', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('returns true on successful install', () => {
    expect(installDeps(mockExec(), false)).toBe(true);
  });

  it('returns false when npm ci fails', () => {
    const exec = () => { throw new Error('npm ERR!'); };
    expect(installDeps(exec, false)).toBe(false);
  });
});

describe('runValidateSquad', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('returns true when validation passes', () => {
    expect(runValidateSquad(mockExec(), false)).toBe(true);
  });

  it('returns false when validation fails', () => {
    expect(runValidateSquad(mockExec({ validateFail: true }), false)).toBe(false);
  });
});

describe('runHealthCheck', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('returns true when health check passes', () => {
    expect(runHealthCheck(mockExec(), false, true)).toBe(true);
  });

  it('skips when gh is not available', () => {
    expect(runHealthCheck(mockExec(), false, false)).toBe(true);
  });

  it('returns false when health check fails', () => {
    expect(runHealthCheck(mockExec({ healthFail: true }), false, true)).toBe(false);
  });
});

describe('runTests', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('returns true when tests pass', () => {
    expect(runTests(mockExec(), false)).toBe(true);
  });

  it('returns false when tests fail', () => {
    expect(runTests(mockExec({ testFail: true }), false)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// run — full integration (mocked)
// ---------------------------------------------------------------------------

describe('run', () => {
  let spies;
  beforeEach(() => { spies = silenceConsole(); });
  afterEach(() => { spies.log.mockRestore(); spies.error.mockRestore(); });

  it('completes successfully with all steps', () => {
    const result = run(['node', 'bootstrap.js'], {
      exec: mockExec(),
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(0);
    expect(parseFloat(result.elapsed)).toBeGreaterThanOrEqual(0);
  });

  it('respects --skip-tests flag', () => {
    const calls = [];
    const exec = (cmd, opts) => {
      calls.push(cmd);
      return mockExec()(cmd, opts);
    };
    const result = run(['node', 'bootstrap.js', '--skip-tests'], {
      exec,
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(0);
    expect(calls).not.toContain('npm test');
  });

  it('respects --skip-health flag', () => {
    const calls = [];
    const exec = (cmd, opts) => {
      calls.push(cmd);
      return mockExec()(cmd, opts);
    };
    const result = run(['node', 'bootstrap.js', '--skip-health'], {
      exec,
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(0);
    expect(calls.some(c => c.includes('constellation-health'))).toBe(false);
  });

  it('fails at prerequisites for old Node', () => {
    const result = run(['node', 'bootstrap.js'], {
      exec: mockExec({ nodeVersion: 'v14.0.0\n' }),
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(1);
    expect(result.step).toBe('prerequisites');
  });

  it('skips health check when gh CLI is missing (graceful degradation)', () => {
    const calls = [];
    const exec = (cmd, opts) => {
      calls.push(cmd);
      return mockExec({ ghMissing: true })(cmd, opts);
    };
    const result = run(['node', 'bootstrap.js'], {
      exec,
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(0);
    expect(calls.some(c => c.includes('constellation-health'))).toBe(false);
  });

  it('fails when validate-squad fails', () => {
    const result = run(['node', 'bootstrap.js'], {
      exec: mockExec({ validateFail: true }),
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(1);
    expect(result.step).toBe('validate-squad');
  });

  it('fails when tests fail', () => {
    const result = run(['node', 'bootstrap.js'], {
      exec: mockExec({ testFail: true }),
      existsSync: () => false,
    });
    expect(result.exitCode).toBe(1);
    expect(result.step).toBe('tests');
  });

  it('executes steps in correct order', () => {
    const steps = [];
    const exec = (cmd) => {
      if (cmd.includes('node --version')) { steps.push('node-version'); return 'v20.0.0\n'; }
      if (cmd.includes('gh --version')) { steps.push('gh-version'); return 'gh 2.45.0\n'; }
      if (cmd.includes('gh auth')) { steps.push('gh-auth'); return 'ok'; }
      if (cmd.includes('git config user.name')) { steps.push('git-name'); return 'T\n'; }
      if (cmd.includes('git config user.email')) { steps.push('git-email'); return 't@t\n'; }
      if (cmd === 'npm ci') { steps.push('npm-ci'); return ''; }
      if (cmd.includes('validate-squad')) { steps.push('validate'); return ''; }
      if (cmd.includes('constellation-health')) { steps.push('health'); return ''; }
      if (cmd === 'npm test') { steps.push('test'); return '168 passed'; }
      return '';
    };
    run(['node', 'bootstrap.js'], { exec, existsSync: () => false });

    const ordered = [
      'node-version', 'gh-version', 'gh-auth', 'git-name', 'git-email',
      'npm-ci', 'validate', 'health', 'test',
    ];
    expect(steps).toEqual(ordered);
  });

  it('shows verbose output when --verbose is set', () => {
    run(['node', 'bootstrap.js', '--verbose'], {
      exec: mockExec(),
      existsSync: () => false,
    });
    // Verbose mode includes command output — check console.log received it
    const allOutput = spies.log.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('added 150 packages');
  });
});
