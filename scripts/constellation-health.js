#!/usr/bin/env node
'use strict';

/**
 * Constellation Health Monitor
 *
 * Reads .squad/constellation.json and checks every downstream repo for:
 *   1. perpetual-motion.yml exists
 *   2. roadmap.md exists
 *   3. At least 1 workflow run in the last 7 days
 *
 * Outputs a GREEN / YELLOW / RED health report per repo.
 *
 * Usage:
 *   node scripts/constellation-health.js          # default (uses .squad/constellation.json)
 *   node scripts/constellation-health.js --json   # machine-readable JSON output
 *
 * Requires: gh CLI authenticated with repo scope.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ghApi(endpoint) {
  try {
    const raw = execSync(
      `gh api "${endpoint}" --paginate 2>nul`,
      { encoding: 'utf8', timeout: 30_000, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ghApiHead(endpoint) {
  try {
    execSync(`gh api "${endpoint}" 2>nul`, {
      encoding: 'utf8',
      timeout: 15_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkFileExists(owner, repo, filePath) {
  return ghApiHead(`/repos/${owner}/${repo}/contents/${filePath}`);
}

function checkRecentWorkflowRuns(owner, repo) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since = sevenDaysAgo.toISOString();
  const data = ghApi(
    `/repos/${owner}/${repo}/actions/runs?created=>${since.split('T')[0]}&per_page=1`
  );
  if (!data || !data.workflow_runs) return { found: false, count: 0 };
  return { found: data.total_count > 0, count: data.total_count };
}

// ---------------------------------------------------------------------------
// Health assessment per repo
// ---------------------------------------------------------------------------

function assessRepo(fullName) {
  const [owner, repo] = fullName.split('/');
  const checks = {};

  // Check 1: perpetual-motion.yml
  checks.perpetualMotion = checkFileExists(
    owner,
    repo,
    '.github/workflows/perpetual-motion.yml'
  );

  // Check 2: roadmap.md
  checks.roadmap = checkFileExists(owner, repo, 'roadmap.md');

  // Check 3: workflow runs in last 7 days
  const runs = checkRecentWorkflowRuns(owner, repo);
  checks.recentRuns = runs.found;
  checks.runCount = runs.count;

  // Determine status
  const passed = [checks.perpetualMotion, checks.roadmap, checks.recentRuns];
  const passCount = passed.filter(Boolean).length;

  let status;
  if (passCount === 3) {
    status = 'GREEN';
  } else if (passCount >= 1) {
    status = 'YELLOW';
  } else {
    status = 'RED';
  }

  return { repo: fullName, status, checks };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const STATUS_ICONS = { GREEN: '🟢', YELLOW: '🟡', RED: '🔴' };

function printReport(results, jsonMode) {
  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║            CONSTELLATION HEALTH REPORT                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  for (const r of results) {
    const icon = STATUS_ICONS[r.status];
    console.log(`${icon}  ${r.status.padEnd(6)}  ${r.repo}`);
    console.log(
      `   perpetual-motion.yml: ${r.checks.perpetualMotion ? '✅' : '❌'}` +
        `   roadmap.md: ${r.checks.roadmap ? '✅' : '❌'}` +
        `   runs (7d): ${r.checks.recentRuns ? `✅ (${r.checks.runCount})` : '❌ (0)'}`
    );
    console.log('');
  }

  // Summary
  const green = results.filter((r) => r.status === 'GREEN').length;
  const yellow = results.filter((r) => r.status === 'YELLOW').length;
  const red = results.filter((r) => r.status === 'RED').length;

  console.log('─'.repeat(62));
  console.log(
    `Summary: ${green} GREEN  ${yellow} YELLOW  ${red} RED  (${results.length} repos)`
  );
  console.log('');

  if (red > 0) {
    console.log('⚠️  RED repos need immediate attention.');
  }
  if (yellow > 0) {
    console.log('⚠️  YELLOW repos have partial issues — review recommended.');
  }
  if (red === 0 && yellow === 0) {
    console.log('✅ All repos healthy!');
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');

  // Locate constellation.json
  const constellationPath = path.resolve(
    __dirname,
    '..',
    '.squad',
    'constellation.json'
  );

  if (!fs.existsSync(constellationPath)) {
    console.error('❌ constellation.json not found at', constellationPath);
    process.exit(1);
  }

  const constellation = JSON.parse(
    fs.readFileSync(constellationPath, 'utf8')
  );
  const repos = constellation.repos;

  if (!repos || repos.length === 0) {
    console.error('❌ No repos found in constellation.json');
    process.exit(1);
  }

  if (!jsonMode) {
    console.log(`Checking ${repos.length} repos in constellation...`);
  }

  const results = repos.map((repo) => assessRepo(repo));

  printReport(results, jsonMode);

  // Exit code: non-zero if any RED
  const hasRed = results.some((r) => r.status === 'RED');
  process.exit(hasRed ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { assessRepo, checkFileExists, checkRecentWorkflowRuns };
