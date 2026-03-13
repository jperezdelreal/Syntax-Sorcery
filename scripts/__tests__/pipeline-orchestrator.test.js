const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  VALID_STAGES,
  STAGE_LABELS,
  parseCliArgs,
  isValidStage,
  isValidTransition,
  getLabelForStage,
  readStatus,
  writeStatus,
  initPipeline,
  transitionStage,
  blockPipeline,
  listPipelines
} = require('../pipeline-orchestrator');

// Use a temp directory for each test to avoid polluting the real .pipeline/
let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('VALID_STAGES', () => {
  it('contains all 6 pipeline stages in order', () => {
    expect(VALID_STAGES).toEqual(['proposal', 'gdd', 'issues', 'implementation', 'build', 'deploy']);
  });
});

describe('STAGE_LABELS', () => {
  it('maps each stage to its pipeline label', () => {
    expect(STAGE_LABELS.proposal).toBe('pipeline:proposal');
    expect(STAGE_LABELS.gdd).toBe('pipeline:gdd');
    expect(STAGE_LABELS.issues).toBe('pipeline:issues');
    expect(STAGE_LABELS.implementation).toBe('pipeline:implementing');
    expect(STAGE_LABELS.build).toBe('pipeline:building');
    expect(STAGE_LABELS.deploy).toBe('pipeline:deployed');
  });

  it('has a label for every valid stage', () => {
    for (const stage of VALID_STAGES) {
      expect(STAGE_LABELS[stage]).toBeDefined();
      expect(STAGE_LABELS[stage]).toMatch(/^pipeline:/);
    }
  });
});

// ---------------------------------------------------------------------------
// parseCliArgs
// ---------------------------------------------------------------------------
describe('parseCliArgs', () => {
  it('parses command and --slug', () => {
    const result = parseCliArgs(['node', 'script.js', 'status', '--slug', 'neon-runner']);
    expect(result.command).toBe('status');
    expect(result.slug).toBe('neon-runner');
  });

  it('parses transition command with --slug and --stage', () => {
    const result = parseCliArgs(['node', 'script.js', 'transition', '--slug', 'my-game', '--stage', 'gdd']);
    expect(result.command).toBe('transition');
    expect(result.slug).toBe('my-game');
    expect(result.stage).toBe('gdd');
  });

  it('parses init command with --title', () => {
    const result = parseCliArgs(['node', 'script.js', 'init', '--slug', 'cool-game', '--title', 'Cool Game']);
    expect(result.command).toBe('init');
    expect(result.slug).toBe('cool-game');
    expect(result.title).toBe('Cool Game');
  });

  it('parses block command with --reason', () => {
    const result = parseCliArgs(['node', 'script.js', 'block', '--slug', 'broken', '--reason', 'Build failed']);
    expect(result.command).toBe('block');
    expect(result.slug).toBe('broken');
    expect(result.reason).toBe('Build failed');
  });

  it('returns null for missing optional args', () => {
    const result = parseCliArgs(['node', 'script.js', 'list']);
    expect(result.command).toBe('list');
    expect(result.slug).toBeNull();
    expect(result.stage).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isValidStage / isValidTransition / getLabelForStage
// ---------------------------------------------------------------------------
describe('isValidStage', () => {
  it('returns true for valid stages', () => {
    for (const s of VALID_STAGES) {
      expect(isValidStage(s)).toBe(true);
    }
  });

  it('returns false for invalid stages', () => {
    expect(isValidStage('invalid')).toBe(false);
    expect(isValidStage('')).toBe(false);
    expect(isValidStage('testing')).toBe(false);
  });
});

describe('isValidTransition', () => {
  it('returns true for valid forward transitions', () => {
    expect(isValidTransition('proposal', 'gdd')).toBe(true);
    expect(isValidTransition('gdd', 'issues')).toBe(true);
    expect(isValidTransition('issues', 'implementation')).toBe(true);
  });

  it('returns true for backward transitions (rollback scenario)', () => {
    expect(isValidTransition('deploy', 'build')).toBe(true);
    expect(isValidTransition('implementation', 'issues')).toBe(true);
  });

  it('returns false for unknown stages', () => {
    expect(isValidTransition('proposal', 'unknown')).toBe(false);
    expect(isValidTransition('nonexistent', 'gdd')).toBe(false);
  });
});

describe('getLabelForStage', () => {
  it('returns correct label for each stage', () => {
    expect(getLabelForStage('proposal')).toBe('pipeline:proposal');
    expect(getLabelForStage('deploy')).toBe('pipeline:deployed');
  });

  it('returns null for invalid stage', () => {
    expect(getLabelForStage('unknown')).toBeNull();
    expect(getLabelForStage('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// initPipeline
// ---------------------------------------------------------------------------
describe('initPipeline', () => {
  it('creates a new pipeline with default state', () => {
    const status = initPipeline('test-game', 'Test Game', tmpDir);
    expect(status.slug).toBe('test-game');
    expect(status.title).toBe('Test Game');
    expect(status.current_stage).toBe('proposal');
    expect(status.blocked).toBe(false);
    expect(status.block_reason).toBeNull();
    expect(status.repo).toBeNull();
    expect(status.pages_url).toBeNull();
  });

  it('initializes all 6 stages', () => {
    const status = initPipeline('test-game', null, tmpDir);
    expect(Object.keys(status.stages)).toHaveLength(6);
    expect(status.stages.proposal.status).toBe('in_progress');
    expect(status.stages.gdd.status).toBe('pending');
    expect(status.stages.issues.status).toBe('pending');
    expect(status.stages.implementation.status).toBe('pending');
    expect(status.stages.build.status).toBe('pending');
    expect(status.stages.deploy.status).toBe('pending');
  });

  it('uses slug as title when title not provided', () => {
    const status = initPipeline('auto-title', null, tmpDir);
    expect(status.title).toBe('auto-title');
  });

  it('persists status to filesystem', () => {
    initPipeline('persist-test', 'Persist Test', tmpDir);
    const read = readStatus('persist-test', tmpDir);
    expect(read).not.toBeNull();
    expect(read.slug).toBe('persist-test');
    expect(read.title).toBe('Persist Test');
  });
});

// ---------------------------------------------------------------------------
// State Machine Transitions
// ---------------------------------------------------------------------------
describe('transitionStage', () => {
  it('transitions proposal → gdd', () => {
    initPipeline('sm-test', 'SM Test', tmpDir);
    const status = transitionStage('sm-test', 'gdd', tmpDir);
    expect(status.current_stage).toBe('gdd');
    expect(status.stages.proposal.status).toBe('complete');
    expect(status.stages.gdd.status).toBe('in_progress');
  });

  it('transitions through full pipeline: proposal → gdd → issues → implementation → build → deploy', () => {
    initPipeline('full-run', 'Full Run', tmpDir);

    transitionStage('full-run', 'gdd', tmpDir);
    transitionStage('full-run', 'issues', tmpDir);
    transitionStage('full-run', 'implementation', tmpDir);
    transitionStage('full-run', 'build', tmpDir);
    const final = transitionStage('full-run', 'deploy', tmpDir);

    expect(final.current_stage).toBe('deploy');
    expect(final.stages.proposal.status).toBe('complete');
    expect(final.stages.gdd.status).toBe('complete');
    expect(final.stages.issues.status).toBe('complete');
    expect(final.stages.implementation.status).toBe('complete');
    expect(final.stages.build.status).toBe('complete');
    // deploy is marked complete upon reaching it
    expect(final.stages.deploy.status).toBe('complete');
  });

  it('marks deploy stage as complete (not in_progress)', () => {
    initPipeline('deploy-test', 'Deploy Test', tmpDir);
    const status = transitionStage('deploy-test', 'deploy', tmpDir);
    expect(status.stages.deploy.status).toBe('complete');
  });

  it('marks skipped stages as complete when jumping ahead', () => {
    initPipeline('skip-test', 'Skip Test', tmpDir);
    const status = transitionStage('skip-test', 'implementation', tmpDir);
    expect(status.stages.proposal.status).toBe('complete');
    expect(status.stages.gdd.status).toBe('complete');
    expect(status.stages.issues.status).toBe('complete');
    expect(status.stages.implementation.status).toBe('in_progress');
  });

  it('clears blocked state when advancing', () => {
    initPipeline('block-clear', 'Block Clear', tmpDir);
    blockPipeline('block-clear', 'Test blocker', tmpDir);

    const status = transitionStage('block-clear', 'gdd', tmpDir);
    expect(status.blocked).toBe(false);
    expect(status.block_reason).toBeNull();
  });

  it('preserves timestamps on already-complete stages', () => {
    initPipeline('ts-test', 'TS Test', tmpDir);
    transitionStage('ts-test', 'gdd', tmpDir);
    const afterGdd = readStatus('ts-test', tmpDir);
    const proposalTs = afterGdd.stages.proposal.timestamp;

    transitionStage('ts-test', 'issues', tmpDir);
    const afterIssues = readStatus('ts-test', tmpDir);
    // proposal timestamp should be preserved
    expect(afterIssues.stages.proposal.timestamp).toBe(proposalTs);
  });

  it('adds timestamp on transition', () => {
    initPipeline('ts-add', 'TS Add', tmpDir);
    const status = transitionStage('ts-add', 'gdd', tmpDir);
    expect(status.stages.gdd.timestamp).toBeDefined();
    const ts = new Date(status.stages.gdd.timestamp);
    expect(ts.getTime()).not.toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// blockPipeline
// ---------------------------------------------------------------------------
describe('blockPipeline', () => {
  it('marks pipeline as blocked with reason', () => {
    initPipeline('block-test', 'Block Test', tmpDir);
    const status = blockPipeline('block-test', 'Build compilation error', tmpDir);
    expect(status.blocked).toBe(true);
    expect(status.block_reason).toBe('Build compilation error');
    expect(status.stages.proposal.status).toBe('blocked');
  });

  it('uses default reason when none provided', () => {
    initPipeline('block-default', 'Block Default', tmpDir);
    const status = blockPipeline('block-default', null, tmpDir);
    expect(status.block_reason).toBe('Unknown failure');
  });

  it('blocks at current stage', () => {
    initPipeline('block-stage', 'Block Stage', tmpDir);
    transitionStage('block-stage', 'build', tmpDir);
    const status = blockPipeline('block-stage', 'Asset missing', tmpDir);
    expect(status.stages.build.status).toBe('blocked');
    expect(status.current_stage).toBe('build');
  });
});

// ---------------------------------------------------------------------------
// readStatus / writeStatus
// ---------------------------------------------------------------------------
describe('readStatus', () => {
  it('returns null for non-existent pipeline', () => {
    expect(readStatus('nonexistent', tmpDir)).toBeNull();
  });

  it('returns status after init', () => {
    initPipeline('read-test', 'Read Test', tmpDir);
    const status = readStatus('read-test', tmpDir);
    expect(status.slug).toBe('read-test');
  });
});

// ---------------------------------------------------------------------------
// listPipelines
// ---------------------------------------------------------------------------
describe('listPipelines', () => {
  it('returns empty array for non-existent directory', () => {
    const nonexistent = path.join(tmpDir, 'nope');
    const result = listPipelines(nonexistent);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty pipeline directory', () => {
    const result = listPipelines(tmpDir);
    expect(result).toEqual([]);
  });

  it('lists initialized pipelines', () => {
    initPipeline('game-a', 'Game A', tmpDir);
    initPipeline('game-b', 'Game B', tmpDir);
    const result = listPipelines(tmpDir);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.slug).sort()).toEqual(['game-a', 'game-b']);
  });
});

// ---------------------------------------------------------------------------
// Label-based tracking logic
// ---------------------------------------------------------------------------
describe('label-based tracking', () => {
  it('each transition maps to the correct pipeline label', () => {
    initPipeline('label-test', 'Label Test', tmpDir);

    for (const stage of VALID_STAGES) {
      const status = transitionStage('label-test', stage, tmpDir);
      const expectedLabel = STAGE_LABELS[stage];
      expect(expectedLabel).toBeDefined();
      expect(expectedLabel).toMatch(/^pipeline:/);
    }
  });

  it('proposal maps to pipeline:proposal, deploy maps to pipeline:deployed', () => {
    expect(getLabelForStage('proposal')).toBe('pipeline:proposal');
    expect(getLabelForStage('deploy')).toBe('pipeline:deployed');
  });

  it('implementation uses "implementing" in label (not "implementation")', () => {
    expect(getLabelForStage('implementation')).toBe('pipeline:implementing');
  });

  it('build uses "building" in label (not "build")', () => {
    expect(getLabelForStage('build')).toBe('pipeline:building');
  });
});
