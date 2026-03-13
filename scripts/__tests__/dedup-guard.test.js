/**
 * Tests for scripts/dedup-guard.js
 *
 * Mocks execSync via the injected execFn parameter to avoid real gh CLI calls.
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach are global).
 */

const { run, findDuplicateIssues, parseArgs } = require('../dedup-guard');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses --owner and --repo flags', () => {
    const result = parseArgs(['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo']);
    expect(result).toEqual({ owner: 'alice', repo: 'my-repo' });
  });

  it('returns nulls when no flags provided', () => {
    const result = parseArgs(['node', 'script.js']);
    expect(result).toEqual({ owner: null, repo: null });
  });

  it('handles partial flags (owner only)', () => {
    const result = parseArgs(['node', 'script.js', '--owner', 'bob']);
    expect(result).toEqual({ owner: 'bob', repo: null });
  });
});

// ---------------------------------------------------------------------------
// findDuplicateIssues
// ---------------------------------------------------------------------------

describe('findDuplicateIssues', () => {
  it('returns parsed issues from gh CLI output', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 42, title: 'Define next roadmap cycle' }])
    );
    const result = findDuplicateIssues('alice', 'repo', mockExec);
    expect(result).toEqual([{ number: 42, title: 'Define next roadmap cycle' }]);
    expect(mockExec).toHaveBeenCalledWith(
      expect.stringContaining('gh issue list'),
      expect.objectContaining({ encoding: 'utf8' })
    );
  });

  it('returns empty array when no issues found', () => {
    const mockExec = vi.fn().mockReturnValue('[]');
    const result = findDuplicateIssues('alice', 'repo', mockExec);
    expect(result).toEqual([]);
  });

  it('propagates exec errors', () => {
    const mockExec = vi.fn().mockImplementation(() => {
      throw new Error('gh not found');
    });
    expect(() => findDuplicateIssues('alice', 'repo', mockExec)).toThrow('gh not found');
  });
});

// ---------------------------------------------------------------------------
// run — duplicate exists (skip)
// ---------------------------------------------------------------------------

describe('run — duplicate exists', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logs skip message and returns duplicate=true when open planning issue exists', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 99, title: 'Define next roadmap cycle' }])
    );
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = run(
      ['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo'],
      mockExec
    );

    expect(result.exitCode).toBe(0);
    expect(result.duplicate).toBe(true);
    expect(result.issueNumber).toBe(99);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Dedup: open planning issue already exists (#99), skipping'
    );

    consoleSpy.mockRestore();
  });

  it('uses first issue when multiple duplicates exist', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([
        { number: 10, title: 'Define next roadmap' },
        { number: 20, title: 'Roadmap planning' },
      ])
    );
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = run(
      ['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo'],
      mockExec
    );

    expect(result.duplicate).toBe(true);
    expect(result.issueNumber).toBe(10);

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// run — no duplicate (allow)
// ---------------------------------------------------------------------------

describe('run — no duplicate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logs safe-to-create message when no open planning issue exists', () => {
    const mockExec = vi.fn().mockReturnValue('[]');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = run(
      ['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo'],
      mockExec
    );

    expect(result.exitCode).toBe(0);
    expect(result.duplicate).toBe(false);
    expect(result.issueNumber).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Dedup: no open planning issue found, safe to create'
    );

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// run — API error handling
// ---------------------------------------------------------------------------

describe('run — API error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns exitCode 1 and logs error on API failure', () => {
    const mockExec = vi.fn().mockImplementation(() => {
      throw new Error('HTTP 403: rate limit exceeded');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = run(
      ['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo'],
      mockExec
    );

    expect(result.exitCode).toBe(1);
    expect(result.duplicate).toBe(false);
    expect(result.issueNumber).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Dedup: API error')
    );

    consoleSpy.mockRestore();
  });

  it('returns exitCode 1 when repo cannot be resolved and no flags provided', () => {
    const mockExec = vi.fn().mockImplementation(() => {
      throw new Error('not a git repo');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = run(['node', 'script.js'], mockExec);

    expect(result.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('could not resolve repo')
    );

    consoleSpy.mockRestore();
  });
});
