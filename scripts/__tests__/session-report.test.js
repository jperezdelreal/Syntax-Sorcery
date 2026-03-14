/**
 * Tests for scripts/session-report.js
 *
 * Mocks execGh via the injected deps parameter to avoid real gh CLI calls.
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach are global).
 */

const {
  parseArgs,
  getDefaultDateRange,
  fetchIssues,
  fetchPRs,
  filterByDateRange,
  categorizeIssues,
  categorizePRs,
  extractAgents,
  generateReport,
  getOutputPath,
  run,
} = require('../session-report');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses --since and --until flags', () => {
    const result = parseArgs([
      'node', 'session-report.js',
      '--since', '2026-03-19T00:00:00Z',
      '--until', '2026-03-19T23:59:59Z',
    ]);
    expect(result.since).toBe('2026-03-19T00:00:00Z');
    expect(result.until).toBe('2026-03-19T23:59:59Z');
    expect(result.dryRun).toBe(false);
  });

  it('parses --dry-run flag', () => {
    const result = parseArgs(['node', 'session-report.js', '--dry-run']);
    expect(result.dryRun).toBe(true);
    expect(result.since).toBeNull();
    expect(result.until).toBeNull();
  });

  it('returns defaults when no flags provided', () => {
    const result = parseArgs(['node', 'session-report.js']);
    expect(result.since).toBeNull();
    expect(result.until).toBeNull();
    expect(result.dryRun).toBe(false);
  });

  it('handles partial flags (since only)', () => {
    const result = parseArgs(['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z']);
    expect(result.since).toBe('2026-03-19T00:00:00Z');
    expect(result.until).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getDefaultDateRange
// ---------------------------------------------------------------------------

describe('getDefaultDateRange', () => {
  it('returns since and until as ISO strings', () => {
    const range = getDefaultDateRange();
    expect(range.since).toBeTruthy();
    expect(range.until).toBeTruthy();
    expect(new Date(range.since).getTime()).toBeLessThan(new Date(range.until).getTime());
  });

  it('covers approximately 24 hours', () => {
    const range = getDefaultDateRange();
    const diff = new Date(range.until).getTime() - new Date(range.since).getTime();
    const hours = diff / (1000 * 60 * 60);
    expect(hours).toBeCloseTo(24, 0);
  });
});

// ---------------------------------------------------------------------------
// fetchIssues / fetchPRs (DI-mocked gh CLI)
// ---------------------------------------------------------------------------

describe('fetchIssues', () => {
  it('returns parsed issues from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 48, title: 'Session report', state: 'OPEN' }])
    );
    const result = fetchIssues('2026-03-19T00:00:00Z', mockExec);
    expect(result).toEqual([{ number: 48, title: 'Session report', state: 'OPEN' }]);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('gh issue list'));
  });

  it('propagates exec errors', () => {
    const mockExec = vi.fn().mockImplementation(() => { throw new Error('gh not found'); });
    expect(() => fetchIssues('2026-03-19T00:00:00Z', mockExec)).toThrow('gh not found');
  });
});

describe('fetchPRs', () => {
  it('returns parsed PRs from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 50, title: 'feat: thing', state: 'MERGED' }])
    );
    const result = fetchPRs('2026-03-19T00:00:00Z', mockExec);
    expect(result).toEqual([{ number: 50, title: 'feat: thing', state: 'MERGED' }]);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('gh pr list'));
  });
});

// ---------------------------------------------------------------------------
// filterByDateRange
// ---------------------------------------------------------------------------

describe('filterByDateRange', () => {
  const items = [
    { id: 1, createdAt: '2026-03-18T12:00:00Z' },
    { id: 2, createdAt: '2026-03-19T06:00:00Z' },
    { id: 3, createdAt: '2026-03-19T18:00:00Z' },
    { id: 4, createdAt: '2026-03-20T12:00:00Z' },
  ];

  it('filters items within date range', () => {
    const result = filterByDateRange(items, '2026-03-19T00:00:00Z', '2026-03-19T23:59:59Z', 'createdAt');
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual([2, 3]);
  });

  it('returns empty array when no items match', () => {
    const result = filterByDateRange(items, '2026-03-21T00:00:00Z', '2026-03-21T23:59:59Z', 'createdAt');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// categorizeIssues
// ---------------------------------------------------------------------------

describe('categorizeIssues', () => {
  it('separates opened and closed issues', () => {
    const issues = [
      { number: 1, state: 'OPEN', createdAt: '2026-03-19T10:00:00Z', closedAt: null },
      { number: 2, state: 'CLOSED', createdAt: '2026-03-19T08:00:00Z', closedAt: '2026-03-19T14:00:00Z' },
      { number: 3, state: 'OPEN', createdAt: '2026-03-18T10:00:00Z', closedAt: null },
    ];
    const result = categorizeIssues(issues, '2026-03-19T00:00:00Z', '2026-03-19T23:59:59Z');
    expect(result.opened).toHaveLength(2); // #1 and #2 created in range
    expect(result.closed).toHaveLength(1); // #2 closed in range
    expect(result.closed[0].number).toBe(2);
  });

  it('handles empty issues array', () => {
    const result = categorizeIssues([], '2026-03-19T00:00:00Z', '2026-03-19T23:59:59Z');
    expect(result.opened).toEqual([]);
    expect(result.closed).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// categorizePRs
// ---------------------------------------------------------------------------

describe('categorizePRs', () => {
  it('separates merged, closed (rejected), and opened PRs', () => {
    const prs = [
      { number: 10, state: 'MERGED', createdAt: '2026-03-19T09:00:00Z', mergedAt: '2026-03-19T12:00:00Z', closedAt: '2026-03-19T12:00:00Z' },
      { number: 11, state: 'CLOSED', createdAt: '2026-03-19T10:00:00Z', mergedAt: null, closedAt: '2026-03-19T15:00:00Z' },
      { number: 12, state: 'OPEN', createdAt: '2026-03-19T11:00:00Z', mergedAt: null, closedAt: null },
    ];
    const result = categorizePRs(prs, '2026-03-19T00:00:00Z', '2026-03-19T23:59:59Z');
    expect(result.merged).toHaveLength(1);
    expect(result.merged[0].number).toBe(10);
    expect(result.closed).toHaveLength(1);
    expect(result.closed[0].number).toBe(11);
    expect(result.opened).toHaveLength(3);
  });

  it('does not double-count merged PRs as closed', () => {
    const prs = [
      { number: 20, state: 'MERGED', createdAt: '2026-03-19T08:00:00Z', mergedAt: '2026-03-19T10:00:00Z', closedAt: '2026-03-19T10:00:00Z' },
    ];
    const result = categorizePRs(prs, '2026-03-19T00:00:00Z', '2026-03-19T23:59:59Z');
    expect(result.merged).toHaveLength(1);
    expect(result.closed).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// extractAgents
// ---------------------------------------------------------------------------

describe('extractAgents', () => {
  it('extracts agents from author logins', () => {
    const issues = [{ author: { login: 'copilot' } }];
    const prs = [{ author: { login: 'morpheus' } }];
    const result = extractAgents(issues, prs);
    expect(result).toEqual(['copilot', 'morpheus']);
  });

  it('extracts agents from squad: labels', () => {
    const issues = [{ author: { login: 'bot' }, labels: [{ name: 'squad:switch' }] }];
    const prs = [{ author: { login: 'bot' }, labels: [{ name: 'squad:trinity' }] }];
    const result = extractAgents(issues, prs);
    expect(result).toContain('switch');
    expect(result).toContain('trinity');
  });

  it('deduplicates and sorts agents', () => {
    const items = [
      { author: { login: 'alice' }, labels: [{ name: 'squad:alice' }] },
      { author: { login: 'alice' } },
    ];
    const result = extractAgents(items, []);
    expect(result).toEqual(['alice']);
  });

  it('handles items with no author or labels', () => {
    const issues = [{ title: 'orphan' }];
    const result = extractAgents(issues, []);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateReport
// ---------------------------------------------------------------------------

describe('generateReport', () => {
  const baseData = {
    since: '2026-03-19T00:00:00Z',
    until: '2026-03-19T23:59:59Z',
    issues: {
      opened: [{ number: 48, title: 'Session report', state: 'OPEN' }],
      closed: [{ number: 47, title: 'Old issue', state: 'CLOSED' }],
    },
    prs: {
      opened: [{ number: 50, title: 'feat: report', state: 'OPEN' }],
      merged: [{ number: 49, title: 'feat: cli', mergedAt: '2026-03-19T12:00:00Z' }],
      closed: [],
    },
    testCount: { total: 168, passed: 168, failed: 0 },
    agents: ['copilot', 'switch'],
  };

  it('includes YAML frontmatter', () => {
    const report = generateReport(baseData);
    expect(report).toMatch(/^---\n/);
    expect(report).toContain('title: "Session Report — 2026-03-19"');
    expect(report).toContain('agents: ["copilot", "switch"]');
    expect(report).toContain('---');
  });

  it('includes Issues section with table', () => {
    const report = generateReport(baseData);
    expect(report).toContain('## Issues');
    expect(report).toContain('#48');
    expect(report).toContain('Session report');
    expect(report).toContain('**Opened:** 1');
    expect(report).toContain('**Closed:** 1');
  });

  it('includes Pull Requests section', () => {
    const report = generateReport(baseData);
    expect(report).toContain('## Pull Requests');
    expect(report).toContain('#49');
    expect(report).toContain('✅ Merged');
    expect(report).toContain('**Merged:** 1');
  });

  it('includes Tests section with counts', () => {
    const report = generateReport(baseData);
    expect(report).toContain('## Tests');
    expect(report).toContain('**Total:** 168');
    expect(report).toContain('**Passed:** 168');
    expect(report).toContain('**Failed:** 0');
  });

  it('includes Summary section', () => {
    const report = generateReport(baseData);
    expect(report).toContain('## Summary');
    expect(report).toContain('**Agents:** copilot, switch');
  });

  it('handles empty activity', () => {
    const emptyData = {
      ...baseData,
      issues: { opened: [], closed: [] },
      prs: { opened: [], merged: [], closed: [] },
      testCount: null,
      agents: [],
    };
    const report = generateReport(emptyData);
    expect(report).toContain('No issue activity');
    expect(report).toContain('No PR activity');
    expect(report).toContain('Test results not available');
    expect(report).toContain('none detected');
  });

  it('shows rejected PRs with ❌', () => {
    const data = {
      ...baseData,
      prs: {
        opened: [],
        merged: [],
        closed: [{ number: 45, title: 'bad: pr', state: 'CLOSED', closedAt: '2026-03-19T10:00:00Z' }],
      },
    };
    const report = generateReport(data);
    expect(report).toContain('❌ Rejected');
    expect(report).toContain('#45');
  });
});

// ---------------------------------------------------------------------------
// getOutputPath
// ---------------------------------------------------------------------------

describe('getOutputPath', () => {
  it('generates correct path from ISO date string', () => {
    const result = getOutputPath('2026-03-19T00:00:00Z');
    expect(result).toContain('2026-03-19-session.md');
    expect(result).toContain('docs');
    expect(result).toContain('reports');
  });
});

// ---------------------------------------------------------------------------
// run — integration with mocked deps
// ---------------------------------------------------------------------------

describe('run', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function makeMockDeps(issuesData, prsData) {
    const written = {};
    return {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return JSON.stringify(issuesData || []);
        if (cmd.includes('gh pr list')) return JSON.stringify(prsData || []);
        if (cmd.includes('npm test')) throw new Error('no test runner');
        throw new Error(`Unexpected command: ${cmd}`);
      },
      writeFile: (filePath, content) => {
        written.path = filePath;
        written.content = content;
      },
      written,
    };
  }

  it('returns exitCode 0 on success', async () => {
    const deps = makeMockDeps(
      [{ number: 48, title: 'Report', state: 'OPEN', createdAt: '2026-03-19T10:00:00Z', closedAt: null, author: { login: 'copilot' }, labels: [] }],
      [{ number: 50, title: 'PR', state: 'MERGED', createdAt: '2026-03-19T09:00:00Z', mergedAt: '2026-03-19T12:00:00Z', closedAt: '2026-03-19T12:00:00Z', author: { login: 'switch' }, labels: [{ name: 'squad' }] }]
    );
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.dryRun).toBe(false);
    expect(deps.written.path).toContain('2026-03-19-session.md');
    expect(deps.written.content).toContain('## Issues');
    consoleSpy.mockRestore();
  });

  it('prints report to console in dry-run mode', async () => {
    const deps = makeMockDeps([], []);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--dry-run'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.dryRun).toBe(true);
    expect(deps.written.path).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Session Report'));
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when issue fetch fails', async () => {
    const deps = {
      execGh: () => { throw new Error('API timeout'); },
      writeFile: () => {},
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to fetch issues'));
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when PR fetch fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        throw new Error('PR API down');
      },
      writeFile: () => {},
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to fetch PRs'));
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when file write fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        if (cmd.includes('gh pr list')) return '[]';
        throw new Error('skip');
      },
      writeFile: () => { throw new Error('EACCES: permission denied'); },
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to write file'));
    consoleSpy.mockRestore();
  });

  it('proceeds without test count when test runner fails', async () => {
    const deps = makeMockDeps([], []);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'session-report.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.report).toContain('Test results not available');
    consoleSpy.mockRestore();
  });
});
