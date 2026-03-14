/**
 * Tests for scripts/metrics-engine.js
 *
 * Mocks execGh via the injected deps parameter to avoid real gh CLI calls.
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach are global).
 */

const {
  parseArgs,
  getDefaultDateRange,
  fetchClosedIssues,
  fetchAllIssues,
  fetchMergedPRs,
  fetchClosedPRs,
  computeVelocity,
  computeCycleTime,
  computeQualityRate,
  computeTestGrowth,
  computeThroughput,
  computeStreak,
  computeTrend,
  trendIndicator,
  compareWithPrevious,
  getSnapshotPath,
  loadPreviousSnapshot,
  formatTable,
  run,
} = require('../metrics-engine');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses --since and --until flags', () => {
    const result = parseArgs(['node', 'metrics-engine.js', '--since', '2026-03-01', '--until', '2026-03-20']);
    expect(result.since).toBe('2026-03-01');
    expect(result.until).toBe('2026-03-20');
    expect(result.json).toBe(false);
    expect(result.save).toBe(false);
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'metrics-engine.js', '--json']);
    expect(result.json).toBe(true);
  });

  it('parses --save flag', () => {
    const result = parseArgs(['node', 'metrics-engine.js', '--save']);
    expect(result.save).toBe(true);
  });

  it('parses all flags together', () => {
    const result = parseArgs(['node', 'metrics-engine.js', '--since', '2026-03-01', '--until', '2026-03-20', '--json', '--save']);
    expect(result.since).toBe('2026-03-01');
    expect(result.until).toBe('2026-03-20');
    expect(result.json).toBe(true);
    expect(result.save).toBe(true);
  });

  it('returns defaults when no flags provided', () => {
    const result = parseArgs(['node', 'metrics-engine.js']);
    expect(result.since).toBeNull();
    expect(result.until).toBeNull();
    expect(result.json).toBe(false);
    expect(result.save).toBe(false);
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

  it('covers approximately 7 days', () => {
    const range = getDefaultDateRange();
    const diff = new Date(range.until).getTime() - new Date(range.since).getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    expect(days).toBeCloseTo(7, 0);
  });
});

// ---------------------------------------------------------------------------
// Fetch functions (DI-mocked gh CLI)
// ---------------------------------------------------------------------------

describe('fetchClosedIssues', () => {
  it('returns parsed issues from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 48, title: 'Issue', closedAt: '2026-03-19T14:00:00Z' }])
    );
    const result = fetchClosedIssues('2026-03-19', mockExec);
    expect(result).toEqual([{ number: 48, title: 'Issue', closedAt: '2026-03-19T14:00:00Z' }]);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('gh issue list'));
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('--state closed'));
  });

  it('propagates exec errors', () => {
    const mockExec = vi.fn().mockImplementation(() => { throw new Error('gh not found'); });
    expect(() => fetchClosedIssues('2026-03-19', mockExec)).toThrow('gh not found');
  });
});

describe('fetchAllIssues', () => {
  it('returns parsed issues from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 1, title: 'Issue', state: 'OPEN' }])
    );
    const result = fetchAllIssues('2026-03-19', mockExec);
    expect(result).toHaveLength(1);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('--state all'));
  });
});

describe('fetchMergedPRs', () => {
  it('returns parsed PRs from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 50, title: 'feat: thing', mergedAt: '2026-03-19T12:00:00Z' }])
    );
    const result = fetchMergedPRs('2026-03-19', mockExec);
    expect(result).toEqual([{ number: 50, title: 'feat: thing', mergedAt: '2026-03-19T12:00:00Z' }]);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('--state merged'));
  });
});

describe('fetchClosedPRs', () => {
  it('returns parsed PRs from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 45, title: 'bad: pr', mergedAt: null, closedAt: '2026-03-19T10:00:00Z' }])
    );
    const result = fetchClosedPRs('2026-03-19', mockExec);
    expect(result).toHaveLength(1);
    expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('--state closed'));
  });
});

// ---------------------------------------------------------------------------
// computeVelocity
// ---------------------------------------------------------------------------

describe('computeVelocity', () => {
  it('computes issues closed per day', () => {
    const issues = [{ number: 1 }, { number: 2 }, { number: 3 }];
    const result = computeVelocity(issues, '2026-03-18T00:00:00Z', '2026-03-20T00:00:00Z');
    expect(result.value).toBe(1.5);
    expect(result.unit).toBe('issues/day');
    expect(result.raw).toBe(3);
  });

  it('handles zero issues', () => {
    const result = computeVelocity([], '2026-03-18T00:00:00Z', '2026-03-20T00:00:00Z');
    expect(result.value).toBe(0);
    expect(result.raw).toBe(0);
  });

  it('uses minimum 1 day to avoid division by zero', () => {
    const issues = [{ number: 1 }];
    const result = computeVelocity(issues, '2026-03-19T00:00:00Z', '2026-03-19T00:00:00Z');
    expect(result.value).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computeCycleTime
// ---------------------------------------------------------------------------

describe('computeCycleTime', () => {
  it('computes average hours from issue creation to merge', () => {
    const mergedPRs = [
      {
        number: 10,
        mergedAt: '2026-03-19T12:00:00Z',
        closingIssuesReferences: [
          { number: 5, createdAt: '2026-03-19T00:00:00Z' },
        ],
      },
    ];
    const result = computeCycleTime(mergedPRs);
    expect(result.value).toBe(12);
    expect(result.unit).toBe('hours');
    expect(result.raw).toBe(1);
  });

  it('averages multiple cycle times', () => {
    const mergedPRs = [
      {
        number: 10,
        mergedAt: '2026-03-19T12:00:00Z',
        closingIssuesReferences: [
          { number: 5, createdAt: '2026-03-19T00:00:00Z' },
        ],
      },
      {
        number: 11,
        mergedAt: '2026-03-20T00:00:00Z',
        closingIssuesReferences: [
          { number: 6, createdAt: '2026-03-19T00:00:00Z' },
        ],
      },
    ];
    const result = computeCycleTime(mergedPRs);
    expect(result.value).toBe(18); // (12 + 24) / 2
    expect(result.raw).toBe(2);
  });

  it('returns null when no PRs have linked issues', () => {
    const mergedPRs = [
      { number: 10, mergedAt: '2026-03-19T12:00:00Z', closingIssuesReferences: [] },
    ];
    const result = computeCycleTime(mergedPRs);
    expect(result.value).toBeNull();
    expect(result.raw).toBe(0);
  });

  it('returns null for empty PRs array', () => {
    const result = computeCycleTime([]);
    expect(result.value).toBeNull();
  });

  it('skips refs without createdAt', () => {
    const mergedPRs = [
      {
        number: 10,
        mergedAt: '2026-03-19T12:00:00Z',
        closingIssuesReferences: [{ number: 5 }],
      },
    ];
    const result = computeCycleTime(mergedPRs);
    expect(result.value).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeQualityRate
// ---------------------------------------------------------------------------

describe('computeQualityRate', () => {
  it('computes merge percentage', () => {
    const merged = [{ number: 10 }, { number: 11 }];
    const closed = [
      { number: 10, mergedAt: '2026-03-19T12:00:00Z' },
      { number: 11, mergedAt: '2026-03-19T13:00:00Z' },
      { number: 12, mergedAt: null, closedAt: '2026-03-19T14:00:00Z' },
    ];
    const result = computeQualityRate(merged, closed);
    expect(result.value).toBeCloseTo(66.67, 1);
    expect(result.unit).toBe('%');
    expect(result.merged).toBe(2);
    expect(result.rejected).toBe(1);
    expect(result.total).toBe(3);
  });

  it('returns 100% when all merged', () => {
    const merged = [{ number: 10 }];
    const closed = [{ number: 10, mergedAt: '2026-03-19T12:00:00Z' }];
    const result = computeQualityRate(merged, closed);
    expect(result.value).toBe(100);
  });

  it('returns null when no PRs', () => {
    const result = computeQualityRate([], []);
    expect(result.value).toBeNull();
    expect(result.total).toBe(0);
  });

  it('returns 0% when all rejected', () => {
    const merged = [];
    const closed = [{ number: 10, mergedAt: null }];
    const result = computeQualityRate(merged, closed);
    expect(result.value).toBe(0);
    expect(result.rejected).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computeTestGrowth
// ---------------------------------------------------------------------------

describe('computeTestGrowth', () => {
  it('returns test count', () => {
    const result = computeTestGrowth(218);
    expect(result.value).toBe(218);
    expect(result.unit).toBe('tests');
  });

  it('handles null test count', () => {
    const result = computeTestGrowth(null);
    expect(result.value).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeThroughput
// ---------------------------------------------------------------------------

describe('computeThroughput', () => {
  it('computes PRs merged per day', () => {
    const prs = [{ number: 10 }, { number: 11 }];
    const result = computeThroughput(prs, '2026-03-18T00:00:00Z', '2026-03-20T00:00:00Z');
    expect(result.value).toBe(1);
    expect(result.unit).toBe('PRs/day');
    expect(result.raw).toBe(2);
  });

  it('handles zero PRs', () => {
    const result = computeThroughput([], '2026-03-18T00:00:00Z', '2026-03-20T00:00:00Z');
    expect(result.value).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeStreak
// ---------------------------------------------------------------------------

describe('computeStreak', () => {
  it('computes consecutive days with merged PRs', () => {
    const prs = [
      { number: 1, mergedAt: '2026-03-19T10:00:00Z' },
      { number: 2, mergedAt: '2026-03-18T14:00:00Z' },
      { number: 3, mergedAt: '2026-03-17T08:00:00Z' },
    ];
    const result = computeStreak(prs);
    expect(result.value).toBe(3);
    expect(result.unit).toBe('days');
  });

  it('returns 1 for single day', () => {
    const prs = [{ number: 1, mergedAt: '2026-03-19T10:00:00Z' }];
    const result = computeStreak(prs);
    expect(result.value).toBe(1);
  });

  it('returns 0 for no PRs', () => {
    const result = computeStreak([]);
    expect(result.value).toBe(0);
  });

  it('breaks streak on gap', () => {
    const prs = [
      { number: 1, mergedAt: '2026-03-19T10:00:00Z' },
      { number: 2, mergedAt: '2026-03-17T14:00:00Z' }, // gap on 03-18
    ];
    const result = computeStreak(prs);
    expect(result.value).toBe(1);
  });

  it('counts multiple PRs on same day as 1', () => {
    const prs = [
      { number: 1, mergedAt: '2026-03-19T10:00:00Z' },
      { number: 2, mergedAt: '2026-03-19T14:00:00Z' },
      { number: 3, mergedAt: '2026-03-18T08:00:00Z' },
    ];
    const result = computeStreak(prs);
    expect(result.value).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeTrend / trendIndicator
// ---------------------------------------------------------------------------

describe('computeTrend', () => {
  it('returns UP when current > previous', () => {
    expect(computeTrend(10, 5)).toBe('UP');
  });

  it('returns DOWN when current < previous', () => {
    expect(computeTrend(3, 5)).toBe('DOWN');
  });

  it('returns FLAT when equal', () => {
    expect(computeTrend(5, 5)).toBe('FLAT');
  });

  it('returns NEW when previous is null', () => {
    expect(computeTrend(5, null)).toBe('NEW');
  });

  it('returns NEW when current is null', () => {
    expect(computeTrend(null, 5)).toBe('NEW');
  });
});

describe('trendIndicator', () => {
  it('maps trend strings to symbols', () => {
    expect(trendIndicator('UP')).toBe('▲');
    expect(trendIndicator('DOWN')).toBe('▼');
    expect(trendIndicator('FLAT')).toBe('→');
    expect(trendIndicator('NEW')).toBe('★');
  });
});

// ---------------------------------------------------------------------------
// compareWithPrevious
// ---------------------------------------------------------------------------

describe('compareWithPrevious', () => {
  it('returns all NEW when no previous snapshot', () => {
    const metrics = {
      velocity: { value: 2 },
      cycleTime: { value: 12 },
    };
    const result = compareWithPrevious(metrics, null);
    expect(result.velocity).toBe('NEW');
    expect(result.cycleTime).toBe('NEW');
  });

  it('computes trends against previous snapshot', () => {
    const metrics = {
      velocity: { value: 3 },
      cycleTime: { value: 8 },
      throughput: { value: 2 },
    };
    const previous = {
      metrics: {
        velocity: { value: 2 },
        cycleTime: { value: 12 },
        throughput: { value: 2 },
      },
    };
    const result = compareWithPrevious(metrics, previous);
    expect(result.velocity).toBe('UP');
    expect(result.cycleTime).toBe('DOWN');
    expect(result.throughput).toBe('FLAT');
  });
});

// ---------------------------------------------------------------------------
// getSnapshotPath
// ---------------------------------------------------------------------------

describe('getSnapshotPath', () => {
  it('generates correct path from ISO date string', () => {
    const result = getSnapshotPath('2026-03-20T12:00:00Z');
    expect(result).toContain('2026-03-20.json');
    expect(result).toContain('docs');
    expect(result).toContain('metrics');
  });

  it('handles date-only string', () => {
    const result = getSnapshotPath('2026-03-20');
    expect(result).toContain('2026-03-20.json');
  });
});

// ---------------------------------------------------------------------------
// loadPreviousSnapshot
// ---------------------------------------------------------------------------

describe('loadPreviousSnapshot', () => {
  it('returns null when directory does not exist', () => {
    const result = loadPreviousSnapshot('/nonexistent/path');
    expect(result).toBeNull();
  });

  it('returns null when no JSON files exist', () => {
    const origReaddirSync = require('fs').readdirSync;
    vi.spyOn(require('fs'), 'readdirSync').mockReturnValue(['readme.txt']);
    const result = loadPreviousSnapshot('/some/dir');
    require('fs').readdirSync.mockRestore();
    expect(result).toBeNull();
  });

  it('loads the most recent snapshot file', () => {
    vi.spyOn(require('fs'), 'readdirSync').mockReturnValue([
      '2026-03-18.json',
      '2026-03-19.json',
    ]);
    const mockRead = vi.fn().mockReturnValue(JSON.stringify({
      metrics: { velocity: { value: 2 } },
    }));
    const result = loadPreviousSnapshot('/some/dir', mockRead);
    expect(result).toEqual({ metrics: { velocity: { value: 2 } } });
    expect(mockRead).toHaveBeenCalledWith(expect.stringContaining('2026-03-19.json'));
    require('fs').readdirSync.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// formatTable
// ---------------------------------------------------------------------------

describe('formatTable', () => {
  it('formats metrics as a human-readable table', () => {
    const metrics = {
      velocity: { value: 2.5, unit: 'issues/day' },
      cycleTime: { value: 8.5, unit: 'hours' },
      qualityRate: { value: 100, unit: '%' },
      testGrowth: { value: 218, unit: 'tests' },
      throughput: { value: 1.5, unit: 'PRs/day' },
      streak: { value: 3, unit: 'days' },
    };
    const trends = {
      velocity: 'UP',
      cycleTime: 'DOWN',
      qualityRate: 'FLAT',
      testGrowth: 'UP',
      throughput: 'NEW',
      streak: 'UP',
    };
    const table = formatTable(metrics, trends);
    expect(table).toContain('Velocity');
    expect(table).toContain('2.5');
    expect(table).toContain('▲');
    expect(table).toContain('▼');
    expect(table).toContain('→');
    expect(table).toContain('★');
  });

  it('shows N/A for null values', () => {
    const metrics = {
      cycleTime: { value: null, unit: 'hours' },
    };
    const trends = { cycleTime: 'NEW' };
    const table = formatTable(metrics, trends);
    expect(table).toContain('N/A');
  });
});

// ---------------------------------------------------------------------------
// run — integration with mocked deps
// ---------------------------------------------------------------------------

describe('run', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function makeMockDeps(options = {}) {
    const closedIssues = options.closedIssues || [];
    const allIssues = options.allIssues || [];
    const mergedPRs = options.mergedPRs || [];
    const closedPRs = options.closedPRs || [];
    const written = {};

    return {
      execGh: (cmd) => {
        if (cmd.includes('--state closed') && cmd.includes('gh issue list'))
          return JSON.stringify(closedIssues);
        if (cmd.includes('--state all') && cmd.includes('gh issue list'))
          return JSON.stringify(allIssues);
        if (cmd.includes('--state merged'))
          return JSON.stringify(mergedPRs);
        if (cmd.includes('--state closed') && cmd.includes('gh pr list'))
          return JSON.stringify(closedPRs);
        if (cmd.includes('vitest'))
          throw new Error('no test runner');
        throw new Error(`Unexpected command: ${cmd}`);
      },
      writeFile: (filePath, content) => {
        written.path = filePath;
        written.content = content;
      },
      readFile: null,
      snapshotDir: '/nonexistent',
      written,
    };
  }

  it('returns exitCode 0 on success with JSON output', async () => {
    const deps = makeMockDeps({
      closedIssues: [{ number: 48, title: 'Report', closedAt: '2026-03-19T14:00:00Z' }],
      mergedPRs: [{ number: 50, title: 'PR', mergedAt: '2026-03-19T12:00:00Z', closingIssuesReferences: [] }],
    });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--json'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.snapshot).toBeDefined();
    expect(result.snapshot.metrics.velocity.value).toBeGreaterThan(0);
    consoleSpy.mockRestore();
  });

  it('returns exitCode 0 with human-readable output', async () => {
    const deps = makeMockDeps({
      closedIssues: [{ number: 1, title: 'Issue' }],
      mergedPRs: [{ number: 10, mergedAt: '2026-03-19T12:00:00Z', closingIssuesReferences: [] }],
    });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(0);
    const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('Autonomous Performance Metrics');
    expect(allOutput).toContain('Velocity');
    consoleSpy.mockRestore();
  });

  it('saves snapshot when --save is set', async () => {
    const deps = makeMockDeps();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--json', '--save'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(deps.written.path).toContain('2026-03-19.json');
    expect(deps.written.content).toContain('"velocity"');
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when closed issues fetch fails', async () => {
    const deps = {
      execGh: () => { throw new Error('API timeout'); },
      writeFile: () => {},
      snapshotDir: '/nonexistent',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to fetch closed issues'));
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when all issues fetch fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('--state closed') && cmd.includes('gh issue list')) return '[]';
        throw new Error('API error');
      },
      writeFile: () => {},
      snapshotDir: '/nonexistent',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to fetch issues'));
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when merged PRs fetch fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        throw new Error('PR API down');
      },
      writeFile: () => {},
      snapshotDir: '/nonexistent',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when save fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        if (cmd.includes('gh pr list')) return '[]';
        throw new Error('skip');
      },
      writeFile: () => { throw new Error('EACCES'); },
      snapshotDir: '/nonexistent',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--json', '--save'],
      deps
    );

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to save snapshot'));
    consoleSpy.mockRestore();
  });

  it('proceeds without test count when test runner fails', async () => {
    const deps = makeMockDeps();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--json'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.snapshot.metrics.testGrowth.value).toBeNull();
    consoleSpy.mockRestore();
  });

  it('includes trend comparison in snapshot', async () => {
    const deps = makeMockDeps();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await run(
      ['node', 'metrics-engine.js', '--since', '2026-03-19T00:00:00Z', '--until', '2026-03-19T23:59:59Z', '--json'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.snapshot.trends).toBeDefined();
    expect(result.snapshot.trends.velocity).toBe('NEW');
    consoleSpy.mockRestore();
  });
});
