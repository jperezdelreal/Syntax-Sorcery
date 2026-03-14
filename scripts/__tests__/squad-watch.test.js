/**
 * Tests for scripts/squad-watch.js
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach are global).
 * All external calls are DI-mocked — no real commands or file I/O.
 */

const {
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
} = require('../squad-watch');

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

function recentDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function makeRepoMock(overrides = {}) {
  const issues = overrides.issues || '[]';
  const prs = overrides.prs || '[]';
  const commitDate = overrides.commitDate || recentDate(0);
  const fail = overrides.fail || false;

  return {
    'gh issue list': fail ? Object.assign(new Error('fail'), { stderr: 'fail' }) : issues,
    'gh pr list': fail ? Object.assign(new Error('fail'), { stderr: 'fail' }) : prs,
    'gh api repos/': fail ? Object.assign(new Error('fail'), { stderr: 'fail' }) : commitDate,
  };
}

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses command with no flags', () => {
    const result = parseArgs(['node', 'squad-watch.js', 'list']);
    expect(result).toEqual({ command: 'list', jsonMode: false, interval: null });
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'squad-watch.js', 'status', '--json']);
    expect(result.jsonMode).toBe(true);
  });

  it('parses --interval flag', () => {
    const result = parseArgs(['node', 'squad-watch.js', 'check', '--interval', '5']);
    expect(result.interval).toBe(5);
  });

  it('ignores invalid interval', () => {
    const result = parseArgs(['node', 'squad-watch.js', 'check', '--interval', 'abc']);
    expect(result.interval).toBe(null);
  });

  it('ignores negative interval', () => {
    const result = parseArgs(['node', 'squad-watch.js', 'check', '--interval', '-3']);
    expect(result.interval).toBe(null);
  });

  it('returns null command when none given', () => {
    const result = parseArgs(['node', 'squad-watch.js']);
    expect(result.command).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// safeExec
// ---------------------------------------------------------------------------

describe('safeExec', () => {
  it('returns ok:true on successful command', () => {
    const exec = () => '  output  ';
    const result = safeExec('test', exec);
    expect(result).toEqual({ ok: true, stdout: 'output' });
  });

  it('returns ok:false on failed command', () => {
    const exec = () => { throw Object.assign(new Error('fail'), { stderr: 'error msg' }); };
    const result = safeExec('test', exec);
    expect(result.ok).toBe(false);
    expect(result.stderr).toBe('error msg');
  });
});

// ---------------------------------------------------------------------------
// DOWNSTREAM_REPOS constant
// ---------------------------------------------------------------------------

describe('DOWNSTREAM_REPOS', () => {
  it('contains 5 repos', () => {
    expect(DOWNSTREAM_REPOS).toHaveLength(5);
  });

  it('all repos belong to jperezdelreal', () => {
    for (const repo of DOWNSTREAM_REPOS) {
      expect(repo).toMatch(/^jperezdelreal\//);
    }
  });
});

// ---------------------------------------------------------------------------
// cmdList
// ---------------------------------------------------------------------------

describe('cmdList', () => {
  it('returns repos in JSON mode', () => {
    const result = cmdList(true);
    expect(result.exitCode).toBe(0);
    expect(result.output.repos).toHaveLength(5);
    expect(result.output.repos[0]).toHaveProperty('repo');
    expect(result.output.repos[0]).toHaveProperty('owner');
    expect(result.output.repos[0]).toHaveProperty('name');
  });

  it('returns human-readable string in text mode', () => {
    const result = cmdList(false);
    expect(result.exitCode).toBe(0);
    expect(typeof result.output).toBe('string');
    expect(result.output).toContain('Constellation Repos');
    expect(result.output).toContain('5 downstream repos');
  });
});

// ---------------------------------------------------------------------------
// formatAge
// ---------------------------------------------------------------------------

describe('formatAge', () => {
  it('formats minutes ago', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    expect(formatAge(tenMinAgo)).toBe('10m ago');
  });

  it('formats hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
    expect(formatAge(threeHoursAgo)).toBe('3h ago');
  });

  it('formats days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400_000).toISOString();
    expect(formatAge(fiveDaysAgo)).toBe('5d ago');
  });
});

// ---------------------------------------------------------------------------
// fetchRepoStatus
// ---------------------------------------------------------------------------

describe('fetchRepoStatus', () => {
  it('returns status for accessible repo', () => {
    const exec = mockExec({
      'gh issue list': JSON.stringify([{ number: 1, title: 'Bug' }]),
      'gh pr list': JSON.stringify([{ number: 2, title: 'Fix' }]),
      'gh api repos/': recentDate(0),
    });

    const result = fetchRepoStatus('jperezdelreal/flora', exec);
    expect(result.accessible).toBe(true);
    expect(result.issues).toBe(1);
    expect(result.prs).toBe(1);
    expect(result.repo).toBe('jperezdelreal/flora');
  });

  it('handles inaccessible repo gracefully', () => {
    const exec = mockExec(makeRepoMock({ fail: true }));
    const result = fetchRepoStatus('jperezdelreal/flora', exec);
    expect(result.accessible).toBe(false);
    expect(result.issues).toBe(0);
    expect(result.prs).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// cmdStatus
// ---------------------------------------------------------------------------

describe('cmdStatus', () => {
  const happyExec = mockExec({
    'gh issue list': '[]',
    'gh pr list': '[]',
    'gh api repos/': recentDate(0),
  });

  it('returns JSON with repo statuses', () => {
    const result = cmdStatus(true, happyExec);
    expect(result.exitCode).toBe(0);
    expect(result.output.repos).toHaveLength(5);
    expect(result.output.timestamp).toBeDefined();
  });

  it('returns human-readable output', () => {
    const result = cmdStatus(false, happyExec);
    expect(result.exitCode).toBe(0);
    expect(typeof result.output).toBe('string');
    expect(result.output).toContain('Repo Status');
    expect(result.output).toContain('Summary');
  });
});

// ---------------------------------------------------------------------------
// runCheck
// ---------------------------------------------------------------------------

describe('runCheck', () => {
  it('detects no alerts for healthy repos', () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    const result = runCheck(exec);
    expect(result.alerts).toHaveLength(0);
    expect(result.summary.reposScanned).toBe(5);
  });

  it('alerts on stale repos (>7 days)', () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(10),
    });

    const result = runCheck(exec);
    const staleAlerts = result.alerts.filter(a => a.message.includes('No commits'));
    expect(staleAlerts.length).toBeGreaterThan(0);
    expect(staleAlerts[0].level).toBe('warn');
  });

  it('alerts on high issue count', () => {
    const issues = Array.from({ length: 25 }, (_, i) => ({ number: i, title: `Issue ${i}` }));
    const exec = mockExec({
      'gh issue list': JSON.stringify(issues),
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    const result = runCheck(exec);
    const issueAlerts = result.alerts.filter(a => a.message.includes('open issues'));
    expect(issueAlerts.length).toBeGreaterThan(0);
  });

  it('alerts on many open PRs', () => {
    const prs = Array.from({ length: 15 }, (_, i) => ({ number: i, title: `PR ${i}` }));
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': JSON.stringify(prs),
      'gh api repos/': recentDate(0),
    });

    const result = runCheck(exec);
    const prAlerts = result.alerts.filter(a => a.message.includes('open PRs'));
    expect(prAlerts.length).toBeGreaterThan(0);
  });

  it('alerts on inaccessible repos', () => {
    const exec = mockExec(makeRepoMock({ fail: true }));
    const result = runCheck(exec);
    const errorAlerts = result.alerts.filter(a => a.level === 'error');
    expect(errorAlerts.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// cmdCheck
// ---------------------------------------------------------------------------

describe('cmdCheck', () => {
  it('returns exit code 0 when no alerts (JSON)', () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    const result = cmdCheck(true, exec);
    expect(result.exitCode).toBe(0);
    expect(result.output.alerts).toHaveLength(0);
  });

  it('returns exit code 1 when alerts present (JSON)', () => {
    const exec = mockExec(makeRepoMock({ fail: true }));
    const result = cmdCheck(true, exec);
    expect(result.exitCode).toBe(1);
    expect(result.output.alerts.length).toBeGreaterThan(0);
  });

  it('returns human-readable output in text mode', () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    const result = cmdCheck(false, exec);
    expect(typeof result.output).toBe('string');
    expect(result.output).toContain('Monitoring Cycle');
  });
});

// ---------------------------------------------------------------------------
// startPolling
// ---------------------------------------------------------------------------

describe('startPolling', () => {
  it('runs check and stops on command', async () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    let cycles = 0;
    const sleepFn = async () => {
      cycles++;
      if (cycles >= 1) poller.stop();
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const poller = startPolling(1, false, exec, sleepFn);
    await poller.loop();
    consoleSpy.mockRestore();

    expect(cycles).toBe(1);
  });

  it('outputs JSON when in json mode', async () => {
    const exec = mockExec({
      'gh issue list': '[]',
      'gh pr list': '[]',
      'gh api repos/': recentDate(0),
    });

    const outputs = [];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      outputs.push(args.join(' '));
    });

    let cycles = 0;
    const sleepFn = async () => {
      cycles++;
      if (cycles >= 1) poller.stop();
    };

    const poller = startPolling(1, true, exec, sleepFn);
    await poller.loop();
    consoleSpy.mockRestore();

    const jsonOutput = outputs.find(o => o.startsWith('{'));
    expect(jsonOutput).toBeDefined();
    const parsed = JSON.parse(jsonOutput);
    expect(parsed).toHaveProperty('summary');
  });
});

// ---------------------------------------------------------------------------
// route
// ---------------------------------------------------------------------------

describe('route', () => {
  const exec = mockExec({
    'gh issue list': '[]',
    'gh pr list': '[]',
    'gh api repos/': recentDate(0),
  });

  it('routes list command', () => {
    const result = route({ command: 'list', jsonMode: false }, exec);
    expect(result.exitCode).toBe(0);
  });

  it('routes status command', () => {
    const result = route({ command: 'status', jsonMode: true }, exec);
    expect(result.exitCode).toBe(0);
  });

  it('routes check command', () => {
    const result = route({ command: 'check', jsonMode: true }, exec);
    expect(result.exitCode).toBe(0);
  });

  it('routes help command', () => {
    const result = route({ command: 'help', jsonMode: false });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Squad Watch');
  });

  it('returns error for null command', () => {
    const result = route({ command: null, jsonMode: false });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('no command specified');
  });

  it('returns error for unknown command', () => {
    const result = route({ command: 'bogus', jsonMode: false });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('unknown command');
  });
});

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

describe('main', () => {
  it('runs list command', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = await main(['node', 'squad-watch.js', 'list']);
    consoleSpy.mockRestore();
    expect(code).toBe(0);
  });

  it('runs list --json', async () => {
    const outputs = [];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      outputs.push(args.join(' '));
    });
    const code = await main(['node', 'squad-watch.js', 'list', '--json']);
    consoleSpy.mockRestore();
    expect(code).toBe(0);
    const parsed = JSON.parse(outputs[0]);
    expect(parsed.repos).toHaveLength(5);
  });

  it('returns 1 for no command', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = await main(['node', 'squad-watch.js']);
    consoleSpy.mockRestore();
    expect(code).toBe(1);
  });
});
