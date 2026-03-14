#!/usr/bin/env node
/**
 * Pre-build script: generates dashboard JSON for the site.
 * Runs `node scripts/dashboard-api.js --json` from the root repo and writes
 * output to site/public/data/dashboard.json for Astro/frontend to consume.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');
const outputDir = join(__dirname, '..', 'public', 'data');
const outputPath = join(outputDir, 'dashboard.json');

const FALLBACK_DASHBOARD = {
  generatedAt: new Date().toISOString(),
  period: {
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    until: new Date().toISOString(),
    days: 7,
  },
  constellation: {
    owner: 'jperezdelreal',
    repos: ['Syntax-Sorcery', 'pixel-bounce', 'flora', 'ComeRosquillas', 'FirstFrameStudios', 'ffs-squad-monitor'],
    total: 6,
  },
  kpis: {
    issues_opened_7d: { value: 0, rate: 0, unit: 'issues/day' },
    issues_closed_7d: { value: 0, rate: 0, unit: 'issues/day' },
    prs_merged_7d: { value: 0, rate: 0, unit: 'PRs/day' },
    prs_open: { value: 0, unit: 'PRs' },
    avg_cycle_time: { value: null, unit: 'hours' },
    test_count: { value: 0, unit: 'repos_with_ci' },
    active_agents: { value: 0, unit: 'repos', total: 6 },
  },
  last_activity: {},
};

function main() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let dashboardJson;
  try {
    const raw = execSync('node scripts/dashboard-api.js --json', {
      cwd: rootDir,
      encoding: 'utf8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    dashboardJson = JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠ Dashboard data generation failed (${err.message}), using fallback data`);
    dashboardJson = FALLBACK_DASHBOARD;
  }

  writeFileSync(outputPath, JSON.stringify(dashboardJson, null, 2), 'utf8');
  console.log(`✓ Dashboard data written to ${outputPath}`);
}

main();
