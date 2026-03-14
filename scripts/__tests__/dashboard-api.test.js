/**
 * Tests for scripts/dashboard-api.js
 *
 * Mocks execGh via DI to avoid real gh CLI calls.
 * Uses vitest globals mode.
 */

const {
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
  run,
} = require('../dashboard-api');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-07-30T12:00:00Z');
const SINCE = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);

function makeIssue(overrides = {}) {
  return {
    number: 1,
    title: 'Test issue',
    state: 'open',
    created_at: '2026-07-28T10:00:00Z',
    closed_at: null,
    ...overrides,
  };
}

function makePR(overrides = {}) {
  return {
    number: 10,
    title: 'Test PR',
    state: 'closed',
    created_at: '2026-07-28T10:00:00Z',
    merged_at: '2026-07-28T12:00:00Z',
    closed_at: '2026-07-28T12:00:00Z',
    ...overrides,
  };
}

function makeCommit(date = '2026-07-30T08:00:00Z') {
  return {
    sha: 'abc123',
    commit: {
      author: { date },
      committer: { date },
      message: 'test commit',
    },
  };
}

function makeWorkflowRun(overrides = {}) {
  return {
    id: 100,
    name: 'CI Tests',
    status: 'completed',
    conclusion: 'success',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses --json flag', () => {
    const result = parseArgs(['node', 'dashboard-api.js', '--json']);
    expect(result.json).toBe(true);
    expect(result.output).toBeNull();
  });

  it('parses --output flag', () => {
    const result = parseArgs(['node', 'dashboard-api.js', '--output', '/tmp/out.json']);
    expect(result.output).toBe('/tmp/out.json');
    expect(result.json).toBe(false);
  });

  it('parses both flags', () => {
    const result = parseArgs(['node', 'dashboard-api.js', '--json', '--output', '/tmp/out.json']);
    expect(result.json).toBe(true);
    expect(result.output).toBe('/tmp/out.json');
  });

  it('returns defaults when no flags provided', () => {
    const result = parseArgs(['node', 'dashboard-api.js']);
    expect(result.json).toBe(false);
    expect(result.output).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// safeExec
// ---------------------------------------------------------------------------

describe('safeExec', () => {
  it('returns ok: true with parsed data on success', () => {
    const mockExec = () => JSON.stringify({ count: 5 });
    const result = safeExec('test cmd', mockExec);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ count: 5 });
  });

  it('returns ok: false on exec failure', () => {
    const mockExec = () => { throw new Error('API rate limit'); };
    const result = safeExec('test cmd', mockExec);
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toContain('API rate limit');
  });

  it('returns ok: false on JSON parse error', () => {
    const mockExec = () => 'not json';
    const result = safeExec('test cmd', mockExec);
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchRepoIssues
// ---------------------------------------------------------------------------

describe('fetchRepoIssues', () => {
  it('returns issues filtering out PRs', () => {
    const issues = [
      makeIssue({ number: 1 }),
      { ...makeIssue({ number: 2 }), pull_request: { url: 'https://...' } },
      makeIssue({ number: 3 }),
    ];
    const mockExec = () => JSON.stringify(issues);
    const result = fetchRepoIssues('owner', 'repo', 'open', SINCE, mockExec);
    expect(result).toHaveLength(2);
    expect(result.map(i => i.number)).toEqual([1, 3]);
  });

  it('returns empty array on API failure', () => {
    const mockExec = () => { throw new Error('fail'); };
    const result = fetchRepoIssues('owner', 'repo', 'open', SINCE, mockExec);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchRepoPRs
// ---------------------------------------------------------------------------

describe('fetchRepoPRs', () => {
  it('returns PRs array', () => {
    const prs = [makePR({ number: 10 }), makePR({ number: 11 })];
    const mockExec = () => JSON.stringify(prs);
    const result = fetchRepoPRs('owner', 'repo', 'open', mockExec);
    expect(result).toHaveLength(2);
  });

  it('returns empty array on failure', () => {
    const mockExec = () => { throw new Error('fail'); };
    const result = fetchRepoPRs('owner', 'repo', 'open', mockExec);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchRepoCommits
// ---------------------------------------------------------------------------

describe('fetchRepoCommits', () => {
  it('returns commits array', () => {
    const commits = [makeCommit()];
    const mockExec = () => JSON.stringify(commits);
    const result = fetchRepoCommits('owner', 'repo', SINCE, mockExec);
    expect(result).toHaveLength(1);
    expect(result[0].sha).toBe('abc123');
  });

  it('returns empty array on failure', () => {
    const mockExec = () => { throw new Error('fail'); };
    const result = fetchRepoCommits('owner', 'repo', SINCE, mockExec);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchLatestWorkflowRun
// ---------------------------------------------------------------------------

describe('fetchLatestWorkflowRun', () => {
  it('returns latest workflow run', () => {
    const mockExec = () => JSON.stringify({ workflow_runs: [makeWorkflowRun()] });
    const result = fetchLatestWorkflowRun('owner', 'repo', mockExec);
    expect(result).not.toBeNull();
    expect(result.name).toBe('CI Tests');
  });

  it('returns null when no runs exist', () => {
    const mockExec = () => JSON.stringify({ workflow_runs: [] });
    const result = fetchLatestWorkflowRun('owner', 'repo', mockExec);
    expect(result).toBeNull();
  });

  it('returns null on failure', () => {
    const mockExec = () => { throw new Error('fail'); };
    const result = fetchLatestWorkflowRun('owner', 'repo', mockExec);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// KPI computations
// ---------------------------------------------------------------------------

describe('computeIssuesOpened7d', () => {
  it('counts issues created within period', () => {
    const data = {
      repo1: [makeIssue({ created_at: '2026-07-28T10:00:00Z' })],
      repo2: [makeIssue({ created_at: '2026-07-29T10:00:00Z' }), makeIssue({ created_at: '2026-07-15T10:00:00Z' })],
    };
    const count = computeIssuesOpened7d(data, SINCE);
    expect(count).toBe(2); // only 2 within since window
  });

  it('returns 0 for empty data', () => {
    expect(computeIssuesOpened7d({}, SINCE)).toBe(0);
  });
});

describe('computeIssuesClosed7d', () => {
  it('counts issues closed within period', () => {
    const data = {
      repo1: [makeIssue({ closed_at: '2026-07-28T10:00:00Z' }), makeIssue({ closed_at: null })],
      repo2: [makeIssue({ closed_at: '2026-07-29T10:00:00Z' })],
    };
    const count = computeIssuesClosed7d(data, SINCE);
    expect(count).toBe(2);
  });

  it('returns 0 for empty data', () => {
    expect(computeIssuesClosed7d({}, SINCE)).toBe(0);
  });
});

describe('computePRsMerged7d', () => {
  it('counts PRs merged within period', () => {
    const data = {
      repo1: [makePR({ merged_at: '2026-07-28T12:00:00Z' }), makePR({ merged_at: null })],
      repo2: [makePR({ merged_at: '2026-07-29T12:00:00Z' })],
    };
    const count = computePRsMerged7d(data, SINCE);
    expect(count).toBe(2);
  });

  it('returns 0 for empty data', () => {
    expect(computePRsMerged7d({}, SINCE)).toBe(0);
  });
});

describe('computePRsOpen', () => {
  it('sums open PRs across repos', () => {
    const data = {
      repo1: [makePR(), makePR()],
      repo2: [makePR()],
    };
    expect(computePRsOpen(data)).toBe(3);
  });

  it('returns 0 for empty data', () => {
    expect(computePRsOpen({})).toBe(0);
  });
});

describe('computeAvgCycleTime', () => {
  it('computes average hours from open to close', () => {
    const data = {
      repo1: [
        makeIssue({ created_at: '2026-07-28T00:00:00Z', closed_at: '2026-07-28T06:00:00Z' }),
        makeIssue({ created_at: '2026-07-28T00:00:00Z', closed_at: '2026-07-28T12:00:00Z' }),
      ],
    };
    const avg = computeAvgCycleTime(data, SINCE);
    expect(avg).toBe(9); // (6 + 12) / 2
  });

  it('returns null when no closed issues', () => {
    const data = {
      repo1: [makeIssue({ closed_at: null })],
    };
    expect(computeAvgCycleTime(data, SINCE)).toBeNull();
  });

  it('returns null for empty data', () => {
    expect(computeAvgCycleTime({}, SINCE)).toBeNull();
  });
});

describe('computeActiveAgents', () => {
  it('counts repos with commits', () => {
    const data = {
      repo1: [makeCommit()],
      repo2: [],
      repo3: [makeCommit(), makeCommit()],
    };
    expect(computeActiveAgents(data)).toBe(2);
  });

  it('returns 0 for empty data', () => {
    expect(computeActiveAgents({})).toBe(0);
  });
});

describe('computeLastActivity', () => {
  it('returns latest commit timestamp per repo', () => {
    const data = {
      repo1: [makeCommit('2026-07-30T08:00:00Z')],
      repo2: [],
    };
    const activity = computeLastActivity(data);
    expect(activity.repo1).toBe('2026-07-30T08:00:00Z');
    expect(activity.repo2).toBeNull();
  });
});

describe('computeTestCount', () => {
  it('counts repos with workflow runs', () => {
    const data = {
      repo1: makeWorkflowRun(),
      repo2: null,
      repo3: makeWorkflowRun({ name: 'Build' }),
    };
    expect(computeTestCount(data)).toBe(2);
  });

  it('returns 0 when no CI runs', () => {
    const data = { repo1: null, repo2: null };
    expect(computeTestCount(data)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// rate helper
// ---------------------------------------------------------------------------

describe('rate', () => {
  it('computes count/day rate', () => {
    expect(rate(14, 7)).toBe(2);
    expect(rate(3, 7)).toBe(0.43);
  });

  it('handles zero days as 1', () => {
    expect(rate(5, 0)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('constants', () => {
  it('has correct owner', () => {
    expect(OWNER).toBe('jperezdelreal');
  });

  it('has 6 constellation repos', () => {
    expect(CONSTELLATION_REPOS).toHaveLength(6);
    expect(CONSTELLATION_REPOS).toContain('Syntax-Sorcery');
    expect(CONSTELLATION_REPOS).toContain('pixel-bounce');
    expect(CONSTELLATION_REPOS).toContain('flora');
    expect(CONSTELLATION_REPOS).toContain('ComeRosquillas');
    expect(CONSTELLATION_REPOS).toContain('FirstFrameStudios');
    expect(CONSTELLATION_REPOS).toContain('ffs-squad-monitor');
  });
});

// ---------------------------------------------------------------------------
// run() integration
// ---------------------------------------------------------------------------

describe('run()', () => {
  function buildMockExecGh() {
    return (cmd) => {
      if (cmd.includes('/issues?')) {
        return JSON.stringify([
          makeIssue({ number: 1, created_at: '2026-07-28T10:00:00Z', closed_at: '2026-07-29T10:00:00Z' }),
        ]);
      }
      if (cmd.includes('/pulls?')) {
        return JSON.stringify([
          makePR({ number: 10, merged_at: '2026-07-29T12:00:00Z' }),
        ]);
      }
      if (cmd.includes('/commits?')) {
        return JSON.stringify([makeCommit('2026-07-30T08:00:00Z')]);
      }
      if (cmd.includes('/actions/runs')) {
        return JSON.stringify({ workflow_runs: [makeWorkflowRun()] });
      }
      return '[]';
    };
  }

  it('produces dashboard JSON with --json flag', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    try {
      const result = await run(['node', 'dashboard-api.js', '--json'], {
        execGh: buildMockExecGh(),
        repos: ['test-repo'],
        owner: 'test-owner',
      });

      expect(result.exitCode).toBe(0);
      expect(result.dashboard).toBeDefined();
      expect(result.dashboard.kpis).toBeDefined();
      expect(result.dashboard.constellation.repos).toEqual(['test-repo']);
      expect(result.dashboard.constellation.owner).toBe('test-owner');

      // Should have printed JSON to stdout
      const output = logs.join('\n');
      const parsed = JSON.parse(output);
      expect(parsed.kpis).toBeDefined();
    } finally {
      console.log = origLog;
    }
  });

  it('writes to output file with --output flag', async () => {
    let writtenPath = null;
    let writtenContent = null;

    const result = await run(['node', 'dashboard-api.js', '--output', '/tmp/test-dash.json'], {
      execGh: buildMockExecGh(),
      writeFile: (p, c) => { writtenPath = p; writtenContent = c; },
      repos: ['test-repo'],
      owner: 'test-owner',
    });

    expect(result.exitCode).toBe(0);
    expect(writtenPath).toContain('test-dash.json');
    expect(writtenContent).toBeTruthy();
    const parsed = JSON.parse(writtenContent);
    expect(parsed.kpis).toBeDefined();
  });

  it('writes default output when no flags', async () => {
    let writtenPath = null;

    const origLog = console.log;
    console.log = () => {};

    try {
      const result = await run(['node', 'dashboard-api.js'], {
        execGh: buildMockExecGh(),
        writeFile: (p, c) => { writtenPath = p; },
        repos: ['test-repo'],
        owner: 'test-owner',
      });

      expect(result.exitCode).toBe(0);
      expect(writtenPath).toContain('dashboard.json');
    } finally {
      console.log = origLog;
    }
  });

  it('handles API failures gracefully', async () => {
    const failExec = () => { throw new Error('API error'); };

    const origLog = console.log;
    console.log = () => {};

    try {
      const result = await run(['node', 'dashboard-api.js', '--json'], {
        execGh: failExec,
        repos: ['fail-repo'],
        owner: 'test-owner',
      });

      expect(result.exitCode).toBe(0);
      expect(result.dashboard.kpis.issues_opened_7d.value).toBe(0);
      expect(result.dashboard.kpis.prs_open.value).toBe(0);
      expect(result.dashboard.kpis.active_agents.value).toBe(0);
    } finally {
      console.log = origLog;
    }
  });

  it('computes KPIs across multiple repos', async () => {
    const origLog = console.log;
    console.log = () => {};

    try {
      const result = await run(['node', 'dashboard-api.js', '--json'], {
        execGh: buildMockExecGh(),
        repos: ['repo1', 'repo2', 'repo3'],
        owner: 'test-owner',
      });

      expect(result.exitCode).toBe(0);
      const k = result.dashboard.kpis;
      // 3 repos × 1 open PR each = 3 open
      expect(k.prs_open.value).toBe(3);
      // 3 repos × 1 commit each = 3 active
      expect(k.active_agents.value).toBe(3);
    } finally {
      console.log = origLog;
    }
  });
});
