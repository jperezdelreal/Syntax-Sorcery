/**
 * Tests for scripts/squad-cli.js
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach, afterEach are global).
 */

const {
  COMMANDS,
  HELP_TEXT,
  GAMEPLAY_TEST_HELP,
  parseCliArgs,
  extractFlag,
  cmdStatus,
  cmdHelp,
  cmdEnforceProtection,
  cmdPlugin,
  cmdGameplayTest,
  route,
  main,
} = require('../squad-cli');

// ---------------------------------------------------------------------------
// parseCliArgs
// ---------------------------------------------------------------------------

describe('parseCliArgs', () => {
  it('parses a bare command', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'status']);
    expect(result.command).toBe('status');
    expect(result.jsonMode).toBe(false);
    expect(result.pr).toBeNull();
  });

  it('parses --json flag', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'health', '--json']);
    expect(result.command).toBe('health');
    expect(result.jsonMode).toBe(true);
  });

  it('parses --pr number for review', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'review', '--pr', '42']);
    expect(result.command).toBe('review');
    expect(result.pr).toBe(42);
  });

  it('returns null command when no args', () => {
    const result = parseCliArgs(['node', 'squad-cli.js']);
    expect(result.command).toBeNull();
  });

  it('returns null pr when --pr has no value', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'review', '--pr']);
    expect(result.pr).toBeNull();
  });

  it('parses --apply flag for enforce-protection', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'enforce-protection', '--apply']);
    expect(result.command).toBe('enforce-protection');
    expect(result.applyProtection).toBe(true);
  });

  it('parses --repo flag for enforce-protection', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'enforce-protection', '--repo', 'flora']);
    expect(result.command).toBe('enforce-protection');
    expect(result.repo).toBe('flora');
  });

  it('parses plugin command with subcommand flags', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'plugin', 'list']);
    expect(result.command).toBe('plugin');
    expect(result.flags).toContain('list');
  });

  it('parses gameplay-test with --init, --type, --target', () => {
    const result = parseCliArgs(['node', 'squad-cli.js', 'gameplay-test', '--init', '--type', 'platformer', '--target', '../pixel-bounce']);
    expect(result.command).toBe('gameplay-test');
    expect(result.init).toBe(true);
    expect(result.type).toBe('platformer');
    expect(result.target).toBe('../pixel-bounce');
  });
});

// ---------------------------------------------------------------------------
// COMMANDS constant
// ---------------------------------------------------------------------------

describe('COMMANDS', () => {
  it('includes all expected commands', () => {
    expect(COMMANDS).toEqual(['status', 'health', 'review', 'dedup', 'report', 'metrics', 'security', 'preflight', 'enforce-protection', 'plugin', 'gameplay-test', 'visual-test', 'watch', 'dashboard-data', 'help']);
  });
});

// ---------------------------------------------------------------------------
// cmdHelp
// ---------------------------------------------------------------------------

describe('cmdHelp', () => {
  it('prints help text and returns 0', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = cmdHelp();
    expect(code).toBe(0);
    expect(spy).toHaveBeenCalledWith(HELP_TEXT);
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// cmdStatus with injected exec
// ---------------------------------------------------------------------------

describe('cmdStatus', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('outputs JSON when --json flag is set', () => {
    const mockExec = vi.fn((cmd) => {
      if (cmd.includes('issue list')) {
        return JSON.stringify([{ number: 1, title: 'Test issue', labels: [], assignees: [] }]);
      }
      if (cmd.includes('pr list')) {
        return JSON.stringify([{ number: 10, title: 'Test PR', isDraft: false }]);
      }
      return '[]';
    });

    const code = cmdStatus(true, mockExec);
    expect(code).toBe(0);

    const output = JSON.parse(logSpy.mock.calls[0][0]);
    expect(output.issues).toHaveLength(1);
    expect(output.prs).toHaveLength(1);
  });

  it('outputs human-readable format by default', () => {
    const mockExec = vi.fn((cmd) => {
      if (cmd.includes('issue list')) {
        return JSON.stringify([{ number: 5, title: 'My Issue', labels: [{ name: 'squad' }], assignees: [] }]);
      }
      if (cmd.includes('pr list')) {
        return JSON.stringify([]);
      }
      return '[]';
    });

    const code = cmdStatus(false, mockExec);
    expect(code).toBe(0);
    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('#5');
    expect(allOutput).toContain('My Issue');
    expect(allOutput).toContain('Open Issues');
  });

  it('returns 1 on exec error', () => {
    const mockExec = vi.fn(() => { throw new Error('gh not found'); });
    const code = cmdStatus(false, mockExec);
    expect(code).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// route — command routing
// ---------------------------------------------------------------------------

describe('route', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('shows help and returns 1 for no command', () => {
    const code = route({ command: null, jsonMode: false, pr: null });
    expect(code).toBe(1);
    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('Squad CLI');
  });

  it('shows help and returns 1 for unknown command', () => {
    const code = route({ command: 'foobar', jsonMode: false, pr: null });
    expect(code).toBe(1);
    const errorOutput = errorSpy.mock.calls.map(c => c[0]).join('\n');
    expect(errorOutput).toContain('unknown command');
    expect(errorOutput).toContain('foobar');
  });

  it('routes help command successfully', () => {
    const code = route({ command: 'help', jsonMode: false, pr: null });
    expect(code).toBe(0);
    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('Squad CLI');
  });

  it('returns 1 for review without --pr', () => {
    const code = route({ command: 'review', jsonMode: false, pr: null });
    expect(code).toBe(1);
    const errorOutput = errorSpy.mock.calls.map(c => c[0]).join('\n');
    expect(errorOutput).toContain('--pr');
  });

  it('routes enforce-protection command (spawns external script)', () => {
    // enforce-protection calls spawnSync which will fail in test env, but routing should not throw
    const code = route({ command: 'enforce-protection', jsonMode: false, pr: null, applyProtection: false, repo: null });
    expect(typeof code).toBe('number');
  });

  it('routes plugin command (spawns external script)', () => {
    const code = route({ command: 'plugin', jsonMode: false, pr: null, flags: ['list'] });
    expect(typeof code).toBe('number');
  });

  it('routes gameplay-test command and shows help without --init', () => {
    const code = route({ command: 'gameplay-test', jsonMode: false, pr: null, init: false, flags: [] });
    expect(code).toBe(0);
    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('Gameplay Test');
  });

  it('gameplay-test returns 1 for invalid --type', () => {
    const code = route({ command: 'gameplay-test', jsonMode: false, pr: null, init: true, type: 'invalid', target: null, flags: [] });
    expect(code).toBe(1);
    const errorOutput = errorSpy.mock.calls.map(c => c[0]).join('\n');
    expect(errorOutput).toContain('--type');
  });
});

// ---------------------------------------------------------------------------
// main — end-to-end argument wiring
// ---------------------------------------------------------------------------

describe('main', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('shows help and returns 1 with no args', () => {
    const code = main(['node', 'squad-cli.js']);
    expect(code).toBe(1);
  });

  it('routes help command from argv', () => {
    const code = main(['node', 'squad-cli.js', 'help']);
    expect(code).toBe(0);
  });

  it('returns 1 for unknown command from argv', () => {
    const code = main(['node', 'squad-cli.js', 'nope']);
    expect(code).toBe(1);
  });
});
