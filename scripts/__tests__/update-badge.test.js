/**
 * Tests for scripts/update-badge.js
 *
 * Pure-function tests — no filesystem or stdin I/O needed.
 * Uses vitest globals mode (vi, describe, it, expect are global).
 */

const { extractTestCount, replaceBadge } = require('../update-badge');

// ---------------------------------------------------------------------------
// extractTestCount
// ---------------------------------------------------------------------------

describe('extractTestCount', () => {
  it('extracts numPassedTests from valid vitest JSON', () => {
    const json = JSON.stringify({ numPassedTests: 200, numFailedTests: 0 });
    expect(extractTestCount(json)).toBe(200);
  });

  it('returns zero when all tests are skipped', () => {
    const json = JSON.stringify({ numPassedTests: 0, numFailedTests: 0 });
    expect(extractTestCount(json)).toBe(0);
  });

  it('throws on missing numPassedTests', () => {
    const json = JSON.stringify({ success: true });
    expect(() => extractTestCount(json)).toThrow('Missing numPassedTests');
  });

  it('throws on invalid JSON', () => {
    expect(() => extractTestCount('not json')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// replaceBadge
// ---------------------------------------------------------------------------

describe('replaceBadge', () => {
  const readme = [
    '# My Project',
    '![Tests](https://img.shields.io/badge/tests-168%20passing-brightgreen)',
    'Some other text.',
  ].join('\n');

  it('replaces the badge with the new count', () => {
    const { updated, changed } = replaceBadge(readme, 200);
    expect(changed).toBe(true);
    expect(updated).toContain('tests-200%20passing-brightgreen');
    expect(updated).not.toContain('tests-168%20passing');
  });

  it('reports no change when count matches', () => {
    const { updated, changed } = replaceBadge(readme, 168);
    expect(changed).toBe(false);
    expect(updated).toBe(readme);
  });

  it('throws when badge pattern is not found', () => {
    const noBadge = '# Project\nNo badge here.';
    expect(() => replaceBadge(noBadge, 100)).toThrow('Test badge not found');
  });

  it('preserves surrounding content', () => {
    const { updated } = replaceBadge(readme, 300);
    expect(updated).toContain('# My Project');
    expect(updated).toContain('Some other text.');
  });

  it('handles large test counts', () => {
    const { updated, changed } = replaceBadge(readme, 9999);
    expect(changed).toBe(true);
    expect(updated).toContain('tests-9999%20passing-brightgreen');
  });
});
