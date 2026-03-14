/**
 * Tests for scripts/enforce-branch-protection.js
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach, afterEach are global).
 * All GitHub API calls are DI-mocked — no real HTTP requests.
 */

const {
  DESIRED_PROTECTION,
  parseArgs,
  loadConstellation,
  parseRepoFullName,
  normalizeProtection,
  diffProtection,
  processRepo,
  formatHumanReport,
  run,
} = require('../enforce-branch-protection');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('defaults to dry-run with no flags', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js']);
    expect(result).toEqual({ apply: false, json: false, repo: null });
  });

  it('parses --apply flag', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js', '--apply']);
    expect(result.apply).toBe(true);
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js', '--json']);
    expect(result.json).toBe(true);
  });

  it('parses --repo flag with value', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js', '--repo', 'flora']);
    expect(result.repo).toBe('flora');
  });

  it('returns null repo when --repo has no value', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js', '--repo']);
    expect(result.repo).toBeNull();
  });

  it('parses multiple flags together', () => {
    const result = parseArgs(['node', 'enforce-branch-protection.js', '--apply', '--json', '--repo', 'flora']);
    expect(result).toEqual({ apply: true, json: true, repo: 'flora' });
  });
});

// ---------------------------------------------------------------------------
// loadConstellation
// ---------------------------------------------------------------------------

describe('loadConstellation', () => {
  it('loads repos from constellation.json via readFile DI', () => {
    const mockRead = () => JSON.stringify({
      repos: ['owner/repo-a', 'owner/repo-b'],
      metadata: {},
    });
    const repos = loadConstellation(mockRead);
    expect(repos).toEqual(['owner/repo-a', 'owner/repo-b']);
  });

  it('returns fallback hardcoded repos when file read fails', () => {
    const mockRead = () => { throw new Error('ENOENT'); };
    const repos = loadConstellation(mockRead);
    expect(repos.length).toBeGreaterThan(0);
    expect(repos).toContain('jperezdelreal/Syntax-Sorcery');
  });

  it('returns fallback when JSON is invalid', () => {
    const mockRead = () => 'not json';
    const repos = loadConstellation(mockRead);
    expect(repos.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// parseRepoFullName
// ---------------------------------------------------------------------------

describe('parseRepoFullName', () => {
  it('splits owner/repo correctly', () => {
    const { owner, repo } = parseRepoFullName('jperezdelreal/flora');
    expect(owner).toBe('jperezdelreal');
    expect(repo).toBe('flora');
  });
});

// ---------------------------------------------------------------------------
// normalizeProtection
// ---------------------------------------------------------------------------

describe('normalizeProtection', () => {
  it('returns defaults for null (no protection)', () => {
    const result = normalizeProtection(null);
    expect(result).toEqual({
      required_status_checks: null,
      enforce_admins: false,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: false,
    });
  });

  it('normalizes a fully-configured protection response', () => {
    const current = {
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: { enabled: true },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      required_linear_history: { enabled: true },
    };
    const result = normalizeProtection(current);
    expect(result).toEqual({
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: true,
    });
  });

  it('normalizes missing nested properties', () => {
    const current = {
      required_status_checks: { contexts: ['build'] },
      enforce_admins: {},
      allow_force_pushes: {},
      allow_deletions: {},
      required_linear_history: {},
    };
    const result = normalizeProtection(current);
    expect(result.required_status_checks.strict).toBe(false);
    expect(result.enforce_admins).toBe(false);
  });

  it('sorts contexts alphabetically', () => {
    const current = {
      required_status_checks: { strict: true, contexts: ['lint', 'CI', 'build'] },
      enforce_admins: { enabled: true },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      required_linear_history: { enabled: true },
    };
    const result = normalizeProtection(current);
    expect(result.required_status_checks.contexts).toEqual(['CI', 'build', 'lint']);
  });
});

// ---------------------------------------------------------------------------
// diffProtection
// ---------------------------------------------------------------------------

describe('diffProtection', () => {
  it('returns empty array when fully compliant', () => {
    const normalized = {
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: true,
    };
    expect(diffProtection(normalized)).toEqual([]);
  });

  it('detects missing status checks', () => {
    const normalized = normalizeProtection(null);
    const diffs = diffProtection(normalized);
    const fields = diffs.map(d => d.field);
    expect(fields).toContain('required_status_checks');
  });

  it('detects non-strict status checks', () => {
    const normalized = {
      required_status_checks: { strict: false, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: true,
    };
    const diffs = diffProtection(normalized);
    expect(diffs).toEqual([
      { field: 'required_status_checks.strict', current: false, desired: true },
    ]);
  });

  it('detects missing CI context', () => {
    const normalized = {
      required_status_checks: { strict: true, contexts: ['build'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: true,
    };
    const diffs = diffProtection(normalized);
    expect(diffs).toEqual([
      { field: 'required_status_checks.contexts', current: 'build', desired: 'CI' },
    ]);
  });

  it('detects force pushes enabled', () => {
    const normalized = {
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: true,
      allow_deletions: false,
      required_linear_history: true,
    };
    const diffs = diffProtection(normalized);
    expect(diffs).toEqual([
      { field: 'allow_force_pushes', current: true, desired: false },
    ]);
  });

  it('detects deletions enabled', () => {
    const normalized = {
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: true,
      required_linear_history: true,
    };
    const diffs = diffProtection(normalized);
    expect(diffs).toEqual([
      { field: 'allow_deletions', current: true, desired: false },
    ]);
  });

  it('detects missing linear history', () => {
    const normalized = {
      required_status_checks: { strict: true, contexts: ['CI'] },
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: false,
    };
    const diffs = diffProtection(normalized);
    expect(diffs).toEqual([
      { field: 'required_linear_history', current: false, desired: true },
    ]);
  });

  it('detects multiple violations', () => {
    const normalized = normalizeProtection(null);
    const diffs = diffProtection(normalized);
    expect(diffs.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// processRepo — with DI-mocked GitHub API
// ---------------------------------------------------------------------------

describe('processRepo', () => {
  function mockRequestFn(responses) {
    let callIndex = 0;
    return (options, callback) => {
      const response = responses[callIndex++] || { status: 200, body: {} };
      const res = {
        statusCode: response.status,
        on: (event, handler) => {
          if (event === 'data') handler(JSON.stringify(response.body));
          if (event === 'end') handler();
        },
      };
      callback(res);
      return {
        on: () => {},
        write: () => {},
        end: () => {},
      };
    };
  }

  it('detects unprotected repo in dry-run', async () => {
    const reqFn = mockRequestFn([
      { status: 200, body: { default_branch: 'main' } },
      { status: 404, body: { message: 'Branch not protected' } },
    ]);

    const result = await processRepo('owner/repo', 'fake-token', false, reqFn);
    expect(result.repo).toBe('owner/repo');
    expect(result.branch).toBe('main');
    expect(result.compliant).toBe(false);
    expect(result.diffs.length).toBeGreaterThan(0);
    expect(result.applied).toBe(false);
  });

  it('detects compliant repo', async () => {
    const reqFn = mockRequestFn([
      { status: 200, body: { default_branch: 'main' } },
      {
        status: 200,
        body: {
          required_status_checks: { strict: true, contexts: ['CI'] },
          enforce_admins: { enabled: true },
          allow_force_pushes: { enabled: false },
          allow_deletions: { enabled: false },
          required_linear_history: { enabled: true },
        },
      },
    ]);

    const result = await processRepo('owner/repo', 'fake-token', false, reqFn);
    expect(result.compliant).toBe(true);
    expect(result.diffs).toEqual([]);
  });

  it('applies protection when --apply and non-compliant', async () => {
    const reqFn = mockRequestFn([
      { status: 200, body: { default_branch: 'main' } },
      { status: 404, body: { message: 'Not protected' } },
      { status: 200, body: { url: 'https://api.github.com/repos/owner/repo/branches/main/protection' } },
    ]);

    const result = await processRepo('owner/repo', 'fake-token', true, reqFn);
    expect(result.applied).toBe(true);
    expect(result.compliant).toBe(false);
  });

  it('does not apply when --apply and already compliant', async () => {
    const reqFn = mockRequestFn([
      { status: 200, body: { default_branch: 'main' } },
      {
        status: 200,
        body: {
          required_status_checks: { strict: true, contexts: ['CI'] },
          enforce_admins: { enabled: true },
          allow_force_pushes: { enabled: false },
          allow_deletions: { enabled: false },
          required_linear_history: { enabled: true },
        },
      },
    ]);

    const result = await processRepo('owner/repo', 'fake-token', true, reqFn);
    expect(result.applied).toBe(false);
    expect(result.compliant).toBe(true);
  });

  it('captures error for missing repo', async () => {
    const reqFn = mockRequestFn([
      { status: 404, body: { message: 'Not Found' } },
    ]);

    const result = await processRepo('owner/nonexistent', 'fake-token', false, reqFn);
    expect(result.error).toContain('not found');
  });
});

// ---------------------------------------------------------------------------
// formatHumanReport
// ---------------------------------------------------------------------------

describe('formatHumanReport', () => {
  it('includes DRY-RUN label when not applying', () => {
    const report = formatHumanReport([], false);
    expect(report).toContain('DRY-RUN');
  });

  it('includes APPLY label when applying', () => {
    const report = formatHumanReport([], true);
    expect(report).toContain('APPLY');
  });

  it('shows compliant repos', () => {
    const results = [{
      repo: 'owner/repo',
      branch: 'main',
      compliant: true,
      diffs: [],
      applied: false,
      error: null,
    }];
    const report = formatHumanReport(results, false);
    expect(report).toContain('Already compliant');
  });

  it('shows diffs for non-compliant repos', () => {
    const results = [{
      repo: 'owner/repo',
      branch: 'main',
      compliant: false,
      diffs: [{ field: 'allow_force_pushes', current: true, desired: false }],
      applied: false,
      error: null,
    }];
    const report = formatHumanReport(results, false);
    expect(report).toContain('allow_force_pushes');
    expect(report).toContain('--apply');
  });

  it('shows error repos', () => {
    const results = [{
      repo: 'owner/broken',
      error: 'Network timeout',
      branch: null,
      compliant: false,
      diffs: [],
      applied: false,
    }];
    const report = formatHumanReport(results, false);
    expect(report).toContain('Network timeout');
  });

  it('shows summary counts', () => {
    const results = [
      { repo: 'a', compliant: true, diffs: [], applied: false, error: null, branch: 'main' },
      { repo: 'b', compliant: false, diffs: [{ field: 'x' }], applied: true, error: null, branch: 'main' },
      { repo: 'c', compliant: false, diffs: [], applied: false, error: 'fail', branch: null },
    ];
    const report = formatHumanReport(results, true);
    expect(report).toContain('Total repos:  3');
    expect(report).toContain('Compliant:    1');
    expect(report).toContain('Applied:      1');
    expect(report).toContain('Errors:       1');
  });
});

// ---------------------------------------------------------------------------
// run (integration with DI)
// ---------------------------------------------------------------------------

describe('run', () => {
  it('fails with exit code 2 when no token', async () => {
    const logs = [];
    const errors = [];
    const result = await run(['node', 'script'], {
      token: '',
      log: (m) => logs.push(m),
      error: (m) => errors.push(m),
    });
    expect(result.exitCode).toBe(2);
    expect(errors.some(e => e.includes('GITHUB_TOKEN'))).toBe(true);
  });

  it('runs dry-run across constellation with mocked API', async () => {
    let callIndex = 0;
    const mockReqFn = (options, callback) => {
      callIndex++;
      let body;
      if (callIndex % 2 === 1) {
        body = { default_branch: 'main' };
      } else {
        body = null;
      }
      const status = callIndex % 2 === 0 ? 404 : 200;
      const res = {
        statusCode: status,
        on: (event, handler) => {
          if (event === 'data') handler(JSON.stringify(body || {}));
          if (event === 'end') handler();
        },
      };
      callback(res);
      return { on: () => {}, write: () => {}, end: () => {} };
    };

    const logs = [];
    const result = await run(['node', 'script'], {
      token: 'fake-token',
      requestFn: mockReqFn,
      readFile: () => JSON.stringify({ repos: ['owner/repo-a', 'owner/repo-b'] }),
      log: (m) => logs.push(m),
      error: () => {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.results.length).toBe(2);
    expect(result.results[0].compliant).toBe(false);
    expect(result.results[0].applied).toBe(false);
  });

  it('filters by --repo flag', async () => {
    let callIndex = 0;
    const mockReqFn = (options, callback) => {
      callIndex++;
      const body = callIndex === 1
        ? { default_branch: 'main' }
        : {};
      const status = callIndex === 2 ? 404 : 200;
      const res = {
        statusCode: status,
        on: (event, handler) => {
          if (event === 'data') handler(JSON.stringify(body));
          if (event === 'end') handler();
        },
      };
      callback(res);
      return { on: () => {}, write: () => {}, end: () => {} };
    };

    const result = await run(['node', 'script', '--repo', 'repo-b'], {
      token: 'fake-token',
      requestFn: mockReqFn,
      readFile: () => JSON.stringify({ repos: ['owner/repo-a', 'owner/repo-b'] }),
      log: () => {},
      error: () => {},
    });

    expect(result.results.length).toBe(1);
    expect(result.results[0].repo).toBe('owner/repo-b');
  });

  it('returns exit code 2 for unknown --repo', async () => {
    const errors = [];
    const result = await run(['node', 'script', '--repo', 'nonexistent'], {
      token: 'fake-token',
      readFile: () => JSON.stringify({ repos: ['owner/repo-a'] }),
      log: () => {},
      error: (m) => errors.push(m),
    });

    expect(result.exitCode).toBe(2);
    expect(errors.some(e => e.includes('nonexistent'))).toBe(true);
  });

  it('outputs JSON when --json flag used', async () => {
    let callIndex = 0;
    const mockReqFn = (options, callback) => {
      callIndex++;
      const body = callIndex === 1
        ? { default_branch: 'main' }
        : {};
      const status = callIndex === 2 ? 404 : 200;
      const res = {
        statusCode: status,
        on: (event, handler) => {
          if (event === 'data') handler(JSON.stringify(body));
          if (event === 'end') handler();
        },
      };
      callback(res);
      return { on: () => {}, write: () => {}, end: () => {} };
    };

    const logs = [];
    await run(['node', 'script', '--json'], {
      token: 'fake-token',
      requestFn: mockReqFn,
      readFile: () => JSON.stringify({ repos: ['owner/repo-a'] }),
      log: (m) => logs.push(m),
      error: () => {},
    });

    const output = JSON.parse(logs[0]);
    expect(output.mode).toBe('dry-run');
    expect(output.results).toBeDefined();
    expect(output.summary).toBeDefined();
  });
});
