/**
 * E2E Integration Tests — Autonomous Pipeline
 *
 * Tests the full perpetual motion cycle as a SYSTEM:
 *   issues.closed → dedup-guard → roadmap depletion → new planning issue
 *   issue assigned → PR opened → review-gate → merge
 *   error paths, cross-script integration, event sequencing
 *
 * All external calls mocked via DI (consistent with existing patterns).
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach are global).
 */

const { run: runDedup, findDuplicateIssues } = require('../dedup-guard');
const {
  runReviewGate,
  checkLinkedIssue,
  checkFilesMatch,
  checkCIStatus,
  checkNotDraft,
  computeVerdict,
  parseFilesFromIssue,
} = require('../review-gate');
const {
  run: runSessionReport,
  fetchIssues,
  fetchPRs,
  categorizeIssues,
  categorizePRs,
  extractAgents,
  generateReport,
} = require('../session-report');
const { parseCliArgs: parseCLI, route, cmdStatus, main: cliMain } = require('../squad-cli');
const {
  initPipeline,
  transitionStage,
  blockPipeline,
  readStatus,
  VALID_STAGES,
} = require('../pipeline-orchestrator');

const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------------------------------------------------------------------------
// Helpers — mock data factories
// ---------------------------------------------------------------------------

function makeMockExec(responses) {
  return vi.fn((cmd) => {
    for (const [pattern, value] of Object.entries(responses)) {
      if (cmd.includes(pattern)) {
        if (typeof value === 'function') return value(cmd);
        if (value instanceof Error) throw value;
        return value;
      }
    }
    throw new Error(`Unmocked command: ${cmd}`);
  });
}

function makeIssue(overrides = {}) {
  return {
    number: 54,
    title: 'E2E test suite',
    state: 'OPEN',
    createdAt: '2026-03-20T10:00:00Z',
    closedAt: null,
    author: { login: 'copilot' },
    labels: [{ name: 'squad' }],
    ...overrides,
  };
}

function makePR(overrides = {}) {
  return {
    number: 60,
    title: 'test: add E2E integration tests',
    state: 'OPEN',
    isDraft: false,
    createdAt: '2026-03-20T11:00:00Z',
    mergedAt: null,
    closedAt: null,
    author: { login: 'copilot' },
    labels: [{ name: 'squad' }, { name: 'squad:switch' }],
    closingIssuesReferences: [{ number: 54 }],
    statusCheckRollup: [
      { name: 'CI', conclusion: 'SUCCESS', status: 'COMPLETED' },
    ],
    ...overrides,
  };
}

function makeIssueBody(files = ['scripts/__tests__/perpetual-motion-e2e.test.js']) {
  const fileLines = files.map((f) => `- ${f} (create)`).join('\n');
  return `## Acceptance Criteria\n- Tests pass\n## Files\n${fileLines}\n## Context\nIntegration tests`;
}

// ---------------------------------------------------------------------------
// 1. Perpetual Motion Cycle — Happy Paths
// ---------------------------------------------------------------------------

describe('Perpetual Motion Cycle — Happy Paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('full cycle: issue closed → dedup clear → safe to create planning issue', () => {
    // Step 1: An issue closes (simulated event)
    const closedIssue = makeIssue({ state: 'CLOSED', closedAt: '2026-03-20T12:00:00Z' });

    // Step 2: Dedup guard checks — no existing planning issue
    const mockExec = vi.fn().mockReturnValue('[]');
    const dedupResult = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'jperezdelreal', '--repo', 'Syntax-Sorcery'],
      mockExec
    );

    expect(dedupResult.exitCode).toBe(0);
    expect(dedupResult.duplicate).toBe(false);
    expect(dedupResult.issueNumber).toBeNull();
  });

  it('full cycle: dedup detects existing planning issue → skip creation', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 99, title: 'Define next roadmap cycle' }])
    );

    const dedupResult = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'jperezdelreal', '--repo', 'Syntax-Sorcery'],
      mockExec
    );

    expect(dedupResult.exitCode).toBe(0);
    expect(dedupResult.duplicate).toBe(true);
    expect(dedupResult.issueNumber).toBe(99);
  });

  it('roadmap depletion detection: all items completed → refuel needed', () => {
    // Simulate parsing roadmap.md content — all items have [x]
    const roadmapContent = [
      '## ~~1. [x] CI checks~~ ✅',
      '## ~~2. [x] Health monitoring~~ ✅',
      '## ~~3. [x] Dashboard~~ ✅',
    ].join('\n');

    const completedPattern = /## ~~\d+\. \[x\]/g;
    const uncompletedPattern = /## \d+\. \[ \]/g;
    const completed = (roadmapContent.match(completedPattern) || []).length;
    const uncompleted = (roadmapContent.match(uncompletedPattern) || []).length;

    expect(completed).toBe(3);
    expect(uncompleted).toBe(0);
    // Roadmap depleted → refuel needed
  });

  it('roadmap has remaining items → no refuel needed', () => {
    const roadmapContent = [
      '## ~~1. [x] CI checks~~ ✅',
      '## 2. [ ] Health monitoring',
      '## 3. [ ] Dashboard',
    ].join('\n');

    const completedPattern = /## ~~\d+\. \[x\]/g;
    const uncompletedPattern = /## \d+\. \[ \]/g;
    const completed = (roadmapContent.match(completedPattern) || []).length;
    const uncompleted = (roadmapContent.match(uncompletedPattern) || []).length;

    expect(completed).toBe(1);
    expect(uncompleted).toBe(2);
    // Items remain → no refuel
  });
});

// ---------------------------------------------------------------------------
// 2. PR Pipeline — Happy Paths
// ---------------------------------------------------------------------------

describe('PR Pipeline — Happy Paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('full PR pipeline: issue assigned → PR opened → review APPROVE', async () => {
    const pr = makePR();
    const issueData = {
      number: 54,
      title: 'E2E test suite',
      body: makeIssueBody(),
    };
    const filesData = {
      files: [{ path: 'scripts/__tests__/perpetual-motion-e2e.test.js' }],
    };

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify(filesData);
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify(issueData);
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('APPROVE');
    expect(report.checks.linkedIssue.pass).toBe(true);
    expect(report.checks.filesMatch.pass).toBe(true);
    expect(report.checks.ciStatus.pass).toBe(true);
    expect(report.checks.notDraft.pass).toBe(true);
  });

  it('PR pipeline: review gate REQUEST_CHANGES on CI failure → block merge', async () => {
    const pr = makePR({
      statusCheckRollup: [
        { name: 'CI', conclusion: 'FAILURE', status: 'COMPLETED' },
      ],
    });

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify({ number: 54, title: 'Test', body: '' });
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.ciStatus.pass).toBe(false);
  });

  it('PR pipeline: review gate APPROVE with extra files beyond spec', async () => {
    const pr = makePR();
    const issueData = {
      number: 54,
      title: 'Test',
      body: makeIssueBody(['src/a.js']),
    };
    const filesData = {
      files: [{ path: 'src/a.js' }, { path: 'src/b.js' }],
    };

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify(filesData);
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify(issueData);
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('APPROVE');
    expect(report.checks.filesMatch.pass).toBe(true);
    expect(report.checks.filesMatch.detail).toContain('extra');
  });
});

// ---------------------------------------------------------------------------
// 3. Error Paths
// ---------------------------------------------------------------------------

describe('Error Paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('dedup guard: GitHub API failure → exitCode 1', () => {
    const mockExec = vi.fn().mockImplementation(() => {
      throw new Error('HTTP 503: service unavailable');
    });

    const result = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'alice', '--repo', 'repo'],
      mockExec
    );

    expect(result.exitCode).toBe(1);
    expect(result.duplicate).toBe(false);
  });

  it('dedup guard: no repo context and no flags → exitCode 1', () => {
    const mockExec = vi.fn().mockImplementation(() => {
      throw new Error('not a git repo');
    });

    const result = runDedup(['node', 'dedup-guard.js'], mockExec);

    expect(result.exitCode).toBe(1);
  });

  it('review gate: no linked issue → REQUEST_CHANGES', async () => {
    const pr = makePR({ closingIssuesReferences: [] });

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view')) return JSON.stringify(pr);
      if (cmd.includes('gh issue view')) return JSON.stringify({});
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.linkedIssue.pass).toBe(false);
  });

  it('review gate: missing files from issue spec → REQUEST_CHANGES', async () => {
    const pr = makePR();
    const issueData = {
      number: 54,
      title: 'Test',
      body: makeIssueBody(['src/a.js', 'src/b.js', 'src/c.js']),
    };

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [{ path: 'src/a.js' }] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify(issueData);
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.filesMatch.pass).toBe(false);
    expect(report.checks.filesMatch.missing).toContain('src/b.js');
    expect(report.checks.filesMatch.missing).toContain('src/c.js');
  });

  it('session report: API failure on issues fetch → exitCode 1', async () => {
    const deps = {
      execGh: () => { throw new Error('API timeout'); },
      writeFile: () => {},
    };

    const result = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
  });

  it('session report: API failure on PRs fetch → exitCode 1', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        throw new Error('PR API down');
      },
      writeFile: () => {},
    };

    const result = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(1);
  });

  it('malformed roadmap: empty content → zero items detected', () => {
    const roadmapContent = '# Roadmap\n\nNothing here.';
    const completedPattern = /## ~~\d+\. \[x\]/g;
    const uncompletedPattern = /## \d+\. \[ \]/g;

    expect((roadmapContent.match(completedPattern) || []).length).toBe(0);
    expect((roadmapContent.match(uncompletedPattern) || []).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Edge Cases
// ---------------------------------------------------------------------------

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('review gate: draft PR → NEEDS_HUMAN verdict', async () => {
    const pr = makePR({ isDraft: true });

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [{ path: 'scripts/__tests__/perpetual-motion-e2e.test.js' }] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify({ number: 54, title: 'Test', body: makeIssueBody() });
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('NEEDS_HUMAN');
    expect(report.checks.notDraft.pass).toBe(false);
  });

  it('review gate: checks still running → REQUEST_CHANGES', async () => {
    const pr = makePR({
      statusCheckRollup: [
        { name: 'CI', conclusion: null, status: 'IN_PROGRESS' },
      ],
    });

    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify({ number: 54, title: 'Test', body: '' });
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const report = await runReviewGate(60, null, mockExec);

    expect(report.verdict).toBe('REQUEST_CHANGES');
    expect(report.checks.ciStatus.pass).toBe(false);
    expect(report.checks.ciStatus.detail).toContain('still running');
  });

  it('issue body with no Files section → files check skipped', () => {
    const body = '## Acceptance Criteria\n- do stuff\n## Context\nSome context';
    const files = parseFilesFromIssue(body);
    expect(files).toEqual([]);

    const result = checkFilesMatch([], ['random.js']);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('skipped');
  });

  it('dedup guard: multiple duplicates → uses first issue number', () => {
    const mockExec = vi.fn().mockReturnValue(
      JSON.stringify([
        { number: 100, title: 'Define next roadmap cycle' },
        { number: 200, title: 'Roadmap planning v2' },
      ])
    );

    const result = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'alice', '--repo', 'repo'],
      mockExec
    );

    expect(result.duplicate).toBe(true);
    expect(result.issueNumber).toBe(100);
  });

  it('session report: proceeds without test count when runner fails', async () => {
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return '[]';
        if (cmd.includes('gh pr list')) return '[]';
        if (cmd.includes('npm test')) throw new Error('no test runner');
        throw new Error(`Unmocked: ${cmd}`);
      },
      writeFile: () => {},
    };

    const result = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.report).toContain('Test results not available');
  });
});

// ---------------------------------------------------------------------------
// 5. Cross-Script Integration
// ---------------------------------------------------------------------------

describe('Cross-Script Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('session report captures simulated session data correctly', async () => {
    const issues = [
      makeIssue({ number: 54, state: 'OPEN', createdAt: '2026-03-20T10:00:00Z' }),
      makeIssue({ number: 53, state: 'CLOSED', closedAt: '2026-03-20T14:00:00Z', createdAt: '2026-03-20T08:00:00Z' }),
    ];
    const prs = [
      makePR({ number: 60, state: 'MERGED', mergedAt: '2026-03-20T15:00:00Z', closedAt: '2026-03-20T15:00:00Z', createdAt: '2026-03-20T11:00:00Z' }),
    ];

    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) return JSON.stringify(issues);
        if (cmd.includes('gh pr list')) return JSON.stringify(prs);
        if (cmd.includes('npm test')) throw new Error('skip');
        throw new Error(`Unmocked: ${cmd}`);
      },
      writeFile: () => {},
    };

    const result = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(result.exitCode).toBe(0);
    expect(result.report).toContain('#54');
    expect(result.report).toContain('#60');
    expect(result.report).toContain('✅ Merged');
    expect(result.report).toContain('copilot');
  });

  it('squad CLI: routes status command with injected exec', () => {
    const mockExec = vi.fn((cmd) => {
      if (cmd.includes('issue list')) {
        return JSON.stringify([{ number: 54, title: 'E2E tests', labels: [{ name: 'squad' }], assignees: [] }]);
      }
      if (cmd.includes('pr list')) return '[]';
      return '[]';
    });

    const code = cmdStatus(true, mockExec);
    expect(code).toBe(0);
  });

  it('squad CLI: routes to help for unknown command', () => {
    const code = cliMain(['node', 'squad-cli.js', 'unknown-cmd']);
    expect(code).toBe(1);
  });

  it('squad CLI: review without --pr returns error', () => {
    const code = route({ command: 'review', jsonMode: false, pr: null });
    expect(code).toBe(1);
  });

  it('session report + dedup guard: session report reflects dedup skip', async () => {
    // Step 1: Dedup guard finds existing planning issue
    const dedupExec = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 99, title: 'Define next roadmap cycle' }])
    );
    const dedupResult = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'alice', '--repo', 'repo'],
      dedupExec
    );
    expect(dedupResult.duplicate).toBe(true);

    // Step 2: Session report captures the existing planning issue
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) {
          return JSON.stringify([
            makeIssue({ number: 99, title: 'Define next roadmap cycle', state: 'OPEN', createdAt: '2026-03-20T01:00:00Z' }),
          ]);
        }
        if (cmd.includes('gh pr list')) return '[]';
        if (cmd.includes('npm test')) throw new Error('skip');
        throw new Error(`Unmocked: ${cmd}`);
      },
      writeFile: () => {},
    };

    const reportResult = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(reportResult.exitCode).toBe(0);
    expect(reportResult.report).toContain('#99');
  });
});

// ---------------------------------------------------------------------------
// 6. Pipeline Orchestrator Integration
// ---------------------------------------------------------------------------

describe('Pipeline Orchestrator Integration', () => {
  let tmpDir;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-pipeline-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('full pipeline: init → transition through stages → deploy', () => {
    const status = initPipeline('test-game', 'Test Game', tmpDir);
    expect(status.current_stage).toBe('proposal');
    expect(status.stages.proposal.status).toBe('in_progress');

    const afterGDD = transitionStage('test-game', 'gdd', tmpDir);
    expect(afterGDD.current_stage).toBe('gdd');

    const afterIssues = transitionStage('test-game', 'issues', tmpDir);
    expect(afterIssues.current_stage).toBe('issues');
    expect(afterIssues.stages.proposal.status).toBe('complete');

    const afterDeploy = transitionStage('test-game', 'deploy', tmpDir);
    expect(afterDeploy.current_stage).toBe('deploy');
    expect(afterDeploy.stages.deploy.status).toBe('complete');
  });

  it('pipeline block: blocks at current stage with reason', () => {
    initPipeline('blocked-game', 'Blocked Game', tmpDir);
    transitionStage('blocked-game', 'implementation', tmpDir);

    const blocked = blockPipeline('blocked-game', 'CI red — tests failing', tmpDir);
    expect(blocked.blocked).toBe(true);
    expect(blocked.block_reason).toContain('CI red');
    expect(blocked.stages.implementation.status).toBe('blocked');
  });
});

// ---------------------------------------------------------------------------
// 7. Event Sequencing
// ---------------------------------------------------------------------------

describe('Event Sequencing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('sequential issue closes: dedup prevents duplicate after first planning issue', () => {
    // First close: no planning issue exists → allow
    const exec1 = vi.fn().mockReturnValue('[]');
    const result1 = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'alice', '--repo', 'repo'],
      exec1
    );
    expect(result1.duplicate).toBe(false);

    // Simulate: planning issue #99 was created after first run
    // Second close: planning issue now exists → skip
    const exec2 = vi.fn().mockReturnValue(
      JSON.stringify([{ number: 99, title: 'Define next roadmap cycle' }])
    );
    const result2 = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'alice', '--repo', 'repo'],
      exec2
    );
    expect(result2.duplicate).toBe(true);
    expect(result2.issueNumber).toBe(99);
  });

  it('PR pipeline then session report: report captures merged PR', async () => {
    // Step 1: Review gate approves PR
    const pr = makePR({ number: 60 });
    const mockExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [{ path: 'scripts/__tests__/perpetual-motion-e2e.test.js' }] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify({ number: 54, title: 'E2E tests', body: makeIssueBody() });
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    const review = await runReviewGate(60, null, mockExec);
    expect(review.verdict).toBe('APPROVE');

    // Step 2: After merge, session report captures the activity
    const deps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) {
          return JSON.stringify([
            makeIssue({ number: 54, state: 'CLOSED', closedAt: '2026-03-20T16:00:00Z' }),
          ]);
        }
        if (cmd.includes('gh pr list')) {
          return JSON.stringify([
            makePR({ number: 60, state: 'MERGED', mergedAt: '2026-03-20T16:00:00Z', closedAt: '2026-03-20T16:00:00Z' }),
          ]);
        }
        if (cmd.includes('npm test')) throw new Error('skip');
        throw new Error(`Unmocked: ${cmd}`);
      },
      writeFile: () => {},
    };

    const report = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      deps
    );

    expect(report.exitCode).toBe(0);
    expect(report.report).toContain('#60');
    expect(report.report).toContain('✅ Merged');
  });

  it('full perpetual motion: close → dedup → review → report', async () => {
    // 1. Issue #53 closes
    const closedIssue = makeIssue({ number: 53, state: 'CLOSED', closedAt: '2026-03-20T12:00:00Z' });

    // 2. Dedup guard: no existing planning issue
    const dedupExec = vi.fn().mockReturnValue('[]');
    const dedup = runDedup(
      ['node', 'dedup-guard.js', '--owner', 'jperezdelreal', '--repo', 'Syntax-Sorcery'],
      dedupExec
    );
    expect(dedup.duplicate).toBe(false);

    // 3. New issue #54 created, assigned to @copilot, PR #60 opened
    const pr = makePR({ number: 60 });
    const reviewExec = (cmd) => {
      if (cmd.includes('gh pr view') && cmd.includes('statusCheckRollup')) {
        return JSON.stringify(pr);
      }
      if (cmd.includes('gh pr view') && cmd.includes('--json files')) {
        return JSON.stringify({ files: [{ path: 'scripts/__tests__/perpetual-motion-e2e.test.js' }] });
      }
      if (cmd.includes('gh issue view')) {
        return JSON.stringify({ number: 54, title: 'E2E tests', body: makeIssueBody() });
      }
      throw new Error(`Unexpected: ${cmd}`);
    };

    // 4. Review gate approves
    const review = await runReviewGate(60, null, reviewExec);
    expect(review.verdict).toBe('APPROVE');

    // 5. Session report captures full activity
    const reportDeps = {
      execGh: (cmd) => {
        if (cmd.includes('gh issue list')) {
          return JSON.stringify([
            makeIssue({ number: 53, state: 'CLOSED', closedAt: '2026-03-20T12:00:00Z', createdAt: '2026-03-20T01:00:00Z' }),
            makeIssue({ number: 54, state: 'CLOSED', closedAt: '2026-03-20T16:00:00Z' }),
          ]);
        }
        if (cmd.includes('gh pr list')) {
          return JSON.stringify([
            makePR({ number: 60, state: 'MERGED', mergedAt: '2026-03-20T16:00:00Z', closedAt: '2026-03-20T16:00:00Z' }),
          ]);
        }
        if (cmd.includes('npm test')) throw new Error('skip');
        throw new Error(`Unmocked: ${cmd}`);
      },
      writeFile: () => {},
    };

    const report = await runSessionReport(
      ['node', 'session-report.js', '--since', '2026-03-20T00:00:00Z', '--until', '2026-03-20T23:59:59Z'],
      reportDeps
    );

    expect(report.exitCode).toBe(0);
    expect(report.report).toContain('#53');
    expect(report.report).toContain('#54');
    expect(report.report).toContain('#60');
    expect(report.report).toContain('✅ Merged');
    expect(report.report).toContain('copilot');
    expect(report.report).toContain('switch');
  });
});

// ---------------------------------------------------------------------------
// 8. Data Integrity
// ---------------------------------------------------------------------------

describe('Data Integrity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('categorizeIssues correctly separates opened vs closed', () => {
    const issues = [
      makeIssue({ number: 1, state: 'OPEN', createdAt: '2026-03-20T10:00:00Z', closedAt: null }),
      makeIssue({ number: 2, state: 'CLOSED', createdAt: '2026-03-20T08:00:00Z', closedAt: '2026-03-20T14:00:00Z' }),
      makeIssue({ number: 3, state: 'OPEN', createdAt: '2026-03-19T10:00:00Z', closedAt: null }),
    ];

    const result = categorizeIssues(issues, '2026-03-20T00:00:00Z', '2026-03-20T23:59:59Z');
    expect(result.opened).toHaveLength(2);
    expect(result.closed).toHaveLength(1);
    expect(result.closed[0].number).toBe(2);
  });

  it('categorizePRs does not double-count merged PRs as closed', () => {
    const prs = [
      makePR({ number: 60, state: 'MERGED', mergedAt: '2026-03-20T15:00:00Z', closedAt: '2026-03-20T15:00:00Z', createdAt: '2026-03-20T11:00:00Z' }),
    ];

    const result = categorizePRs(prs, '2026-03-20T00:00:00Z', '2026-03-20T23:59:59Z');
    expect(result.merged).toHaveLength(1);
    expect(result.closed).toHaveLength(0);
  });

  it('extractAgents deduplicates across issues and PRs', () => {
    const issues = [makeIssue({ author: { login: 'copilot' } })];
    const prs = [
      makePR({ author: { login: 'copilot' }, labels: [{ name: 'squad:switch' }] }),
    ];

    const agents = extractAgents(issues, prs);
    expect(agents).toContain('copilot');
    expect(agents).toContain('switch');
    expect(new Set(agents).size).toBe(agents.length);
  });

  it('generateReport includes all sections with correct data', () => {
    const data = {
      since: '2026-03-20T00:00:00Z',
      until: '2026-03-20T23:59:59Z',
      issues: {
        opened: [makeIssue({ number: 54 })],
        closed: [makeIssue({ number: 53, state: 'CLOSED' })],
      },
      prs: {
        opened: [makePR({ number: 60 })],
        merged: [makePR({ number: 59, state: 'MERGED', mergedAt: '2026-03-20T12:00:00Z' })],
        closed: [],
      },
      testCount: { total: 240, passed: 240, failed: 0 },
      agents: ['copilot', 'switch'],
    };

    const report = generateReport(data);

    expect(report).toContain('Session Report — 2026-03-20');
    expect(report).toContain('## Issues');
    expect(report).toContain('## Pull Requests');
    expect(report).toContain('## Tests');
    expect(report).toContain('## Summary');
    expect(report).toContain('**Total:** 240');
    expect(report).toContain('**Passed:** 240');
    expect(report).toContain('**Failed:** 0');
    expect(report).toContain('copilot, switch');
  });
});
