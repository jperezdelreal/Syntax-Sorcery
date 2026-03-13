const {
  parseArgs,
  checkLinkedIssue,
  parseFilesFromIssue,
  checkFilesMatch,
  checkCIStatus,
  checkNotDraft,
  computeVerdict,
  runReviewGate,
} = require('../review-gate');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------
describe('parseArgs', () => {
  it('parses --pr flag', () => {
    const result = parseArgs(['node', 'review-gate.js', '--pr', '42']);
    expect(result).toEqual({ pr: 42, repo: null });
  });

  it('parses --pr and --repo flags', () => {
    const result = parseArgs(['node', 'review-gate.js', '--pr', '7', '--repo', 'org/repo']);
    expect(result).toEqual({ pr: 7, repo: 'org/repo' });
  });

  it('returns null pr when flag missing', () => {
    const result = parseArgs(['node', 'review-gate.js']);
    expect(result).toEqual({ pr: null, repo: null });
  });
});

// ---------------------------------------------------------------------------
// checkLinkedIssue
// ---------------------------------------------------------------------------
describe('checkLinkedIssue', () => {
  it('passes when PR has linked issues', () => {
    const pr = { closingIssuesReferences: [{ number: 37 }] };
    const result = checkLinkedIssue(pr);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('37');
  });

  it('fails when no linked issues', () => {
    const pr = { closingIssuesReferences: [] };
    const result = checkLinkedIssue(pr);
    expect(result.pass).toBe(false);
  });

  it('fails when closingIssuesReferences is undefined', () => {
    const result = checkLinkedIssue({});
    expect(result.pass).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseFilesFromIssue
// ---------------------------------------------------------------------------
describe('parseFilesFromIssue', () => {
  it('parses "## Files Involved" section', () => {
    const body = [
      '## Acceptance Criteria',
      '- stuff',
      '## Files Involved',
      '- scripts/review-gate.js (create)',
      '- package.json (add script)',
      '## Context',
      'Some context',
    ].join('\n');
    const files = parseFilesFromIssue(body);
    expect(files).toEqual(['scripts/review-gate.js', 'package.json']);
  });

  it('parses "## Files" section', () => {
    const body = '## Files\n- src/index.js\n- README.md\n';
    const files = parseFilesFromIssue(body);
    expect(files).toEqual(['src/index.js', 'README.md']);
  });

  it('handles backtick-wrapped file paths', () => {
    const body = '## Files Involved\n- `src/app.js` (create)\n';
    const files = parseFilesFromIssue(body);
    expect(files).toEqual(['src/app.js']);
  });

  it('returns empty array for no files section', () => {
    const body = '## Acceptance Criteria\n- do stuff\n';
    expect(parseFilesFromIssue(body)).toEqual([]);
  });

  it('returns empty array for null body', () => {
    expect(parseFilesFromIssue(null)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// checkFilesMatch
// ---------------------------------------------------------------------------
describe('checkFilesMatch', () => {
  it('passes when all expected files are present', () => {
    const expected = ['a.js', 'b.js'];
    const actual = ['a.js', 'b.js', 'c.js'];
    const result = checkFilesMatch(expected, actual);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('2 expected files');
  });

  it('fails when files are missing', () => {
    const expected = ['a.js', 'b.js', 'c.js'];
    const actual = ['a.js'];
    const result = checkFilesMatch(expected, actual);
    expect(result.pass).toBe(false);
    expect(result.missing).toEqual(['b.js', 'c.js']);
  });

  it('skips check when no expected files', () => {
    const result = checkFilesMatch([], ['a.js']);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('skipped');
  });
});

// ---------------------------------------------------------------------------
// checkCIStatus
// ---------------------------------------------------------------------------
describe('checkCIStatus', () => {
  it('passes when all checks succeed', () => {
    const pr = {
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
        { name: 'Lint', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    };
    const result = checkCIStatus(pr);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('2 checks passing');
  });

  it('fails when a check failed', () => {
    const pr = {
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
        { name: 'Lint', conclusion: 'FAILURE', status: 'COMPLETED' },
      ],
    };
    const result = checkCIStatus(pr);
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('Lint');
  });

  it('fails when checks are still running', () => {
    const pr = {
      statusCheckRollup: [
        { name: 'CI', conclusion: null, status: 'IN_PROGRESS' },
      ],
    };
    const result = checkCIStatus(pr);
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('still running');
  });

  it('fails when no CI checks exist', () => {
    const pr = { statusCheckRollup: [] };
    const result = checkCIStatus(pr);
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('No CI checks');
  });

  it('handles cancelled checks as failure', () => {
    const pr = {
      statusCheckRollup: [
        { name: 'Build', conclusion: 'CANCELLED', status: 'COMPLETED' },
      ],
    };
    const result = checkCIStatus(pr);
    expect(result.pass).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkNotDraft
// ---------------------------------------------------------------------------
describe('checkNotDraft', () => {
  it('passes when PR is not a draft', () => {
    const result = checkNotDraft({ isDraft: false });
    expect(result.pass).toBe(true);
  });

  it('fails when PR is a draft', () => {
    const result = checkNotDraft({ isDraft: true });
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('draft');
  });
});

// ---------------------------------------------------------------------------
// computeVerdict
// ---------------------------------------------------------------------------
describe('computeVerdict', () => {
  const allPass = {
    linkedIssue: { pass: true },
    filesMatch: { pass: true },
    ciStatus: { pass: true },
    notDraft: { pass: true },
  };

  it('returns APPROVE when all checks pass', () => {
    expect(computeVerdict(allPass)).toBe('APPROVE');
  });

  it('returns REQUEST_CHANGES when linked issue missing', () => {
    const checks = { ...allPass, linkedIssue: { pass: false } };
    expect(computeVerdict(checks)).toBe('REQUEST_CHANGES');
  });

  it('returns REQUEST_CHANGES when CI failing', () => {
    const checks = { ...allPass, ciStatus: { pass: false } };
    expect(computeVerdict(checks)).toBe('REQUEST_CHANGES');
  });

  it('returns REQUEST_CHANGES on file mismatch', () => {
    const checks = {
      ...allPass,
      filesMatch: { pass: false, detail: 'Missing files: x.js' },
    };
    expect(computeVerdict(checks)).toBe('REQUEST_CHANGES');
  });

  it('returns NEEDS_HUMAN when draft only', () => {
    const checks = { ...allPass, notDraft: { pass: false } };
    expect(computeVerdict(checks)).toBe('NEEDS_HUMAN');
  });
});

// ---------------------------------------------------------------------------
// runReviewGate (integration with mocked gh CLI)
// ---------------------------------------------------------------------------
describe('runReviewGate', () => {
  function makeMockExec(prData, issueData, filesData) {
    return (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(prData);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify(filesData || { files: [] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify(issueData);
      }
      throw new Error(`Unexpected command: ${cmd}`);
    };
  }

  it('returns APPROVE when all checks pass', async () => {
    const prData = {
      number: 10,
      title: 'feat: something',
      isDraft: false,
      closingIssuesReferences: [{ number: 5 }],
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    };
    const issueData = {
      number: 5,
      title: 'Add feature',
      body: '## Files Involved\n- src/app.js (create)\n## Context\nStuff',
    };
    const filesData = {
      files: [{ path: 'src/app.js' }],
    };

    const exec = makeMockExec(prData, issueData, filesData);
    const report = await runReviewGate(10, null, exec);

    expect(report.verdict).toBe('APPROVE');
    expect(report.checks.linkedIssue.pass).toBe(true);
    expect(report.checks.filesMatch.pass).toBe(true);
    expect(report.checks.ciStatus.pass).toBe(true);
    expect(report.checks.notDraft.pass).toBe(true);
  });

  it('returns REQUEST_CHANGES when no linked issue', async () => {
    const prData = {
      number: 11,
      title: 'fix: something',
      isDraft: false,
      closingIssuesReferences: [],
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    };

    const exec = makeMockExec(prData, {}, {});
    const report = await runReviewGate(11, null, exec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.linkedIssue.pass).toBe(false);
  });

  it('returns REQUEST_CHANGES on file mismatch', async () => {
    const prData = {
      number: 12,
      title: 'feat: update',
      isDraft: false,
      closingIssuesReferences: [{ number: 8 }],
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    };
    const issueData = {
      number: 8,
      title: 'Update files',
      body: '## Files Involved\n- src/a.js (create)\n- src/b.js (create)\n',
    };
    const filesData = { files: [{ path: 'src/a.js' }] };

    const exec = makeMockExec(prData, issueData, filesData);
    const report = await runReviewGate(12, null, exec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.filesMatch.pass).toBe(false);
    expect(report.checks.filesMatch.missing).toContain('src/b.js');
  });

  it('returns REQUEST_CHANGES when CI failing', async () => {
    const prData = {
      number: 13,
      title: 'feat: broken ci',
      isDraft: false,
      closingIssuesReferences: [{ number: 9 }],
      statusCheckRollup: [
        { name: 'Build', conclusion: 'FAILURE', status: 'COMPLETED' },
      ],
    };
    const issueData = { number: 9, title: 'Thing', body: '' };

    const exec = makeMockExec(prData, issueData, {});
    const report = await runReviewGate(13, null, exec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.ciStatus.pass).toBe(false);
  });

  it('returns NEEDS_HUMAN when PR is draft', async () => {
    const prData = {
      number: 14,
      title: 'wip: draft',
      isDraft: true,
      closingIssuesReferences: [{ number: 10 }],
      statusCheckRollup: [
        { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    };
    const issueData = { number: 10, title: 'Feature', body: '' };

    const exec = makeMockExec(prData, issueData, {});
    const report = await runReviewGate(14, null, exec);

    expect(report.verdict).toBe('NEEDS_HUMAN');
    expect(report.checks.notDraft.pass).toBe(false);
  });
});
