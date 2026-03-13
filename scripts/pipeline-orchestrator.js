#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const command = args[0]; // status, transition, list
const slug = (() => {
  const idx = args.indexOf('--slug');
  return idx !== -1 ? args[idx + 1] : null;
})();
const stage = (() => {
  const idx = args.indexOf('--stage');
  return idx !== -1 ? args[idx + 1] : null;
})();

const PIPELINE_DIR = path.join(__dirname, '..', '.pipeline');

const VALID_STAGES = ['proposal', 'gdd', 'issues', 'implementation', 'build', 'deploy'];
const STAGE_LABELS = {
  proposal: 'pipeline:proposal',
  gdd: 'pipeline:gdd',
  issues: 'pipeline:issues',
  implementation: 'pipeline:implementing',
  build: 'pipeline:building',
  deploy: 'pipeline:deployed'
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusPath(gameSlug) {
  return path.join(PIPELINE_DIR, gameSlug, 'status.json');
}

function readStatus(gameSlug) {
  const statusPath = getStatusPath(gameSlug);
  if (!fs.existsSync(statusPath)) return null;
  return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
}

function writeStatus(gameSlug, status) {
  const dir = path.join(PIPELINE_DIR, gameSlug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getStatusPath(gameSlug), JSON.stringify(status, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
function showStatus(gameSlug) {
  const status = readStatus(gameSlug);
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

function transitionStage(gameSlug, newStage) {
  if (!VALID_STAGES.includes(newStage)) {
    console.error(`Invalid stage: ${newStage}. Valid: ${VALID_STAGES.join(', ')}`);
    process.exit(1);
  }

  const status = readStatus(gameSlug);
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

  writeStatus(gameSlug, status);
  console.log(`✅ ${gameSlug}: transitioned to ${newStage} (label: ${STAGE_LABELS[newStage]})`);

  // Output for GHA
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `pipeline_label=${STAGE_LABELS[newStage]}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `current_stage=${newStage}\n`);
  }
}

function blockPipeline(gameSlug, reason) {
  const status = readStatus(gameSlug);
  if (!status) {
    console.error(`No pipeline found for slug: ${gameSlug}`);
    process.exit(1);
  }
  status.blocked = true;
  status.block_reason = reason || 'Unknown failure';
  status.stages[status.current_stage].status = 'blocked';
  writeStatus(gameSlug, status);
  console.log(`🚫 ${gameSlug}: BLOCKED at ${status.current_stage} — ${status.block_reason}`);
}

function listPipelines() {
  if (!fs.existsSync(PIPELINE_DIR)) {
    console.log('No pipelines found.');
    return;
  }
  const dirs = fs.readdirSync(PIPELINE_DIR).filter(d =>
    fs.statSync(path.join(PIPELINE_DIR, d)).isDirectory()
  );

  if (dirs.length === 0) {
    console.log('No pipelines found.');
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  Active Pipelines');
  console.log(`${'═'.repeat(60)}\n`);

  for (const dir of dirs) {
    const status = readStatus(dir);
    if (status) {
      const icon = status.blocked ? '🚫' : '🎮';
      console.log(`  ${icon} ${status.title} (${status.slug}) → ${status.current_stage}`);
    }
  }
  console.log('');
}

function initPipeline(gameSlug, title) {
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
  writeStatus(gameSlug, status);
  console.log(`✅ Pipeline initialized for: ${gameSlug}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
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
