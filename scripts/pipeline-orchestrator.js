#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const VALID_STAGES = ['proposal', 'gdd', 'issues', 'implementation', 'build', 'deploy'];
const STAGE_LABELS = {
  proposal: 'pipeline:proposal',
  gdd: 'pipeline:gdd',
  issues: 'pipeline:issues',
  implementation: 'pipeline:implementing',
  build: 'pipeline:building',
  deploy: 'pipeline:deployed'
};

const DEFAULT_PIPELINE_DIR = path.join(__dirname, '..', '.pipeline');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusPath(gameSlug, pipelineDir) {
  return path.join(pipelineDir || DEFAULT_PIPELINE_DIR, gameSlug, 'status.json');
}

function readStatus(gameSlug, pipelineDir) {
  const statusPath = getStatusPath(gameSlug, pipelineDir);
  if (!fs.existsSync(statusPath)) return null;
  return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
}

function writeStatus(gameSlug, status, pipelineDir) {
  const dir = path.join(pipelineDir || DEFAULT_PIPELINE_DIR, gameSlug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getStatusPath(gameSlug, pipelineDir), JSON.stringify(status, null, 2), 'utf8');
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  };
  return { command, slug: getArg('slug'), stage: getArg('stage'), title: getArg('title'), reason: getArg('reason') };
}

function isValidStage(stage) {
  return VALID_STAGES.includes(stage);
}

function isValidTransition(currentStage, newStage) {
  const currentIdx = VALID_STAGES.indexOf(currentStage);
  const newIdx = VALID_STAGES.indexOf(newStage);
  return currentIdx !== -1 && newIdx !== -1;
}

function getLabelForStage(stage) {
  return STAGE_LABELS[stage] || null;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
function showStatus(gameSlug, pipelineDir) {
  const status = readStatus(gameSlug, pipelineDir);
  if (!status) {
    console.error(`No pipeline found for slug: ${gameSlug}`);
    process.exit(1);
  }
  console.log(`\n🎮 Pipeline: ${status.title} (${status.slug})`);
  console.log(`   Current stage: ${status.current_stage}`);
  console.log(`   Blocked: ${status.blocked ? `YES — ${status.block_reason}` : 'No'}`);
  console.log(`   Repo: ${status.repo || '(not created)'}`);
  console.log(`   Pages: ${status.pages_url || '(not deployed)'}\n`);
  console.log('   Stages:');
  for (const [name, info] of Object.entries(status.stages)) {
    const icon = info.status === 'complete' ? '✅' : info.status === 'in_progress' ? '🔄' : '⏳';
    const extra = info.timestamp ? ` (${info.timestamp})` : '';
    console.log(`     ${icon} ${name}: ${info.status}${extra}`);
  }
  console.log('');
}

function transitionStage(gameSlug, newStage, pipelineDir) {
  if (!VALID_STAGES.includes(newStage)) {
    console.error(`Invalid stage: ${newStage}. Valid: ${VALID_STAGES.join(', ')}`);
    process.exit(1);
  }

  const status = readStatus(gameSlug, pipelineDir);
  if (!status) {
    console.error(`No pipeline found for slug: ${gameSlug}`);
    process.exit(1);
  }

  const currentIdx = VALID_STAGES.indexOf(status.current_stage);
  const newIdx = VALID_STAGES.indexOf(newStage);

  // Mark previous stages as complete
  for (let i = 0; i <= newIdx - 1; i++) {
    const s = VALID_STAGES[i];
    if (status.stages[s].status !== 'complete') {
      status.stages[s].status = 'complete';
      status.stages[s].timestamp = status.stages[s].timestamp || new Date().toISOString();
    }
  }

  // Update current stage
  const stageKey = newStage === 'implementation' ? 'implementation' : newStage;
  status.current_stage = newStage;
  status.stages[stageKey] = {
    ...status.stages[stageKey],
    status: newStage === 'deploy' ? 'complete' : 'in_progress',
    timestamp: new Date().toISOString()
  };

  // Clear block if advancing
  if (newIdx > currentIdx) {
    status.blocked = false;
    status.block_reason = null;
  }

  writeStatus(gameSlug, status, pipelineDir);
  console.log(`✅ ${gameSlug}: transitioned to ${newStage} (label: ${STAGE_LABELS[newStage]})`);

  // Output for GHA
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `pipeline_label=${STAGE_LABELS[newStage]}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `current_stage=${newStage}\n`);
  }

  return status;
}

function blockPipeline(gameSlug, reason, pipelineDir) {
  const status = readStatus(gameSlug, pipelineDir);
  if (!status) {
    console.error(`No pipeline found for slug: ${gameSlug}`);
    process.exit(1);
  }
  status.blocked = true;
  status.block_reason = reason || 'Unknown failure';
  status.stages[status.current_stage].status = 'blocked';
  writeStatus(gameSlug, status, pipelineDir);
  console.log(`🚫 ${gameSlug}: BLOCKED at ${status.current_stage} — ${status.block_reason}`);
  return status;
}

function listPipelines(pipelineDir) {
  const dir = pipelineDir || DEFAULT_PIPELINE_DIR;
  if (!fs.existsSync(dir)) {
    console.log('No pipelines found.');
    return [];
  }
  const dirs = fs.readdirSync(dir).filter(d =>
    fs.statSync(path.join(dir, d)).isDirectory()
  );

  if (dirs.length === 0) {
    console.log('No pipelines found.');
    return [];
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  Active Pipelines');
  console.log(`${'═'.repeat(60)}\n`);

  const pipelines = [];
  for (const d of dirs) {
    const status = readStatus(d, pipelineDir);
    if (status) {
      const icon = status.blocked ? '🚫' : '🎮';
      console.log(`  ${icon} ${status.title} (${status.slug}) → ${status.current_stage}`);
      pipelines.push(status);
    }
  }
  console.log('');
  return pipelines;
}

function initPipeline(gameSlug, title, pipelineDir) {
  const status = {
    slug: gameSlug,
    title: title || gameSlug,
    current_stage: 'proposal',
    stages: {
      proposal: { status: 'in_progress', timestamp: new Date().toISOString() },
      gdd: { status: 'pending' },
      issues: { status: 'pending' },
      implementation: { status: 'pending' },
      build: { status: 'pending' },
      deploy: { status: 'pending' }
    },
    repo: null,
    pages_url: null,
    blocked: false,
    block_reason: null
  };
  writeStatus(gameSlug, status, pipelineDir);
  console.log(`✅ Pipeline initialized for: ${gameSlug}`);
  return status;
}

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------
module.exports = {
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
  listPipelines,
  showStatus
};

// ---------------------------------------------------------------------------
// CLI entry point (only when executed directly)
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const slug = (() => {
    const idx = args.indexOf('--slug');
    return idx !== -1 ? args[idx + 1] : null;
  })();
  const stage = (() => {
    const idx = args.indexOf('--stage');
    return idx !== -1 ? args[idx + 1] : null;
  })();

  const USAGE = `Usage: node pipeline-orchestrator.js <command> [options]

Commands:
  status     --slug <slug>                    Show pipeline status
  transition --slug <slug> --stage <stage>    Advance pipeline stage
  block      --slug <slug> [--reason <text>]  Mark pipeline as blocked
  init       --slug <slug> [--title <title>]  Initialize new pipeline
  list                                         List all pipelines

Stages: ${VALID_STAGES.join(', ')}`;

  switch (command) {
    case 'status':
      if (!slug) { console.error('--slug required'); process.exit(1); }
      showStatus(slug);
      break;
    case 'transition':
      if (!slug || !stage) { console.error('--slug and --stage required'); process.exit(1); }
      transitionStage(slug, stage);
      break;
    case 'block':
      if (!slug) { console.error('--slug required'); process.exit(1); }
      const reason = (() => { const idx = args.indexOf('--reason'); return idx !== -1 ? args[idx + 1] : null; })();
      blockPipeline(slug, reason);
      break;
    case 'init':
      if (!slug) { console.error('--slug required'); process.exit(1); }
      const title = (() => { const idx = args.indexOf('--title'); return idx !== -1 ? args[idx + 1] : null; })();
      initPipeline(slug, title);
      break;
    case 'list':
      listPipelines();
      break;
    default:
      console.log(USAGE);
      process.exit(command ? 1 : 0);
  }
}
