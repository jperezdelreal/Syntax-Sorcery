#!/usr/bin/env node
/**
 * Pre-build script: generates static metrics JSON for the dashboard.
 * Runs `npm run metrics --json` from the root repo and writes output
 * to site/src/data/metrics.json for Astro to consume at build time.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');
const outputDir = join(__dirname, '..', 'src', 'data');
const outputPath = join(outputDir, 'metrics.json');

// Fallback metrics when gh CLI or metrics engine is unavailable
const FALLBACK_METRICS = {
  since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  until: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  metrics: {
    velocity: { value: 0, unit: 'issues/day', raw: 0 },
    cycleTime: { value: null, unit: 'hours', raw: 0 },
    qualityRate: { value: null, unit: '%', merged: 0, rejected: 0, total: 0 },
    testGrowth: { value: null, unit: 'tests' },
    throughput: { value: 0, unit: 'PRs/day', raw: 0 },
    streak: { value: 0, unit: 'days' },
  },
  trends: {
    velocity: 'NEW',
    cycleTime: 'NEW',
    qualityRate: 'NEW',
    testGrowth: 'NEW',
    throughput: 'NEW',
    streak: 'NEW',
  },
};

function main() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let metricsJson;
  try {
    const raw = execSync('node scripts/metrics-engine.js --json', {
      cwd: rootDir,
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    metricsJson = JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠ Metrics generation failed (${err.message}), using fallback data`);
    metricsJson = FALLBACK_METRICS;
  }

  writeFileSync(outputPath, JSON.stringify(metricsJson, null, 2), 'utf8');
  console.log(`✓ Metrics written to ${outputPath}`);
}

main();
