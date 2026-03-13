#!/usr/bin/env node
'use strict';

// Creates pipeline labels in the GitHub repository
// Usage: node scripts/create-pipeline-labels.js [--dry-run]

const { execSync } = require('child_process');

const dryRun = process.argv.includes('--dry-run');

const labels = [
  { name: 'pipeline:proposal', color: '6f42c1', description: 'Pipeline: game in proposal stage' },
  { name: 'pipeline:gdd', color: '0075ca', description: 'Pipeline: GDD being generated' },
  { name: 'pipeline:issues', color: '1d76db', description: 'Pipeline: issues created, ready for implementation' },
  { name: 'pipeline:implementing', color: 'fbca04', description: 'Pipeline: code being written' },
  { name: 'pipeline:building', color: 'e4e669', description: 'Pipeline: build in progress' },
  { name: 'pipeline:deployed', color: '0e8a16', description: 'Pipeline: game is live' },
  { name: 'pipeline:blocked', color: 'd73a4a', description: 'Pipeline: stage failed, needs intervention' },
  { name: 'pipeline-fail:gdd-gen', color: 'b60205', description: 'Pipeline failure: GDD generation' },
  { name: 'pipeline-fail:implementation', color: 'b60205', description: 'Pipeline failure: implementation stuck' },
  { name: 'pipeline-fail:build', color: 'b60205', description: 'Pipeline failure: build failed' },
  { name: 'pipeline-fail:deploy', color: 'b60205', description: 'Pipeline failure: deployment failed' },
  { name: 'needs-info', color: 'd876e3', description: 'Needs additional information' },
];

console.log(`\nCreating ${labels.length} pipeline labels${dryRun ? ' (DRY RUN)' : ''}...\n`);

for (const label of labels) {
  if (dryRun) {
    console.log(`[DRY-RUN] Would create: ${label.name} (#${label.color}) — ${label.description}`);
    continue;
  }

  try {
    execSync(
      `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    console.log(`✅ ${label.name}`);
  } catch (err) {
    console.log(`⚠️ ${label.name}: ${err.message.trim().split('\n')[0]}`);
  }
}

console.log('\nDone.\n');
