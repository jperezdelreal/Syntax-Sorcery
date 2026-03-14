#!/usr/bin/env node
'use strict';

/**
 * Update Badge — parses vitest JSON output and updates the test count badge
 * in README.md.
 *
 * Usage:
 *   npx vitest run --reporter=json 2>/dev/null | node scripts/update-badge.js
 *   node scripts/update-badge.js < vitest-results.json
 *
 * Exit codes:
 *   0 — badge updated or already current
 *   1 — error (missing input, parse failure, README not found)
 *
 * No external dependencies.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Defaults (DI-friendly for testing)
// ---------------------------------------------------------------------------

const README_PATH = path.resolve(__dirname, '..', 'README.md');
const BADGE_PATTERN = /!\[Tests\]\(https:\/\/img\.shields\.io\/badge\/tests-\d+%20passing-brightgreen\)/;

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Extracts total test count from vitest JSON reporter output.
 * @param {string} jsonStr — raw JSON from vitest --reporter=json
 * @returns {number} total number of passing tests
 */
function extractTestCount(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (typeof data.numPassedTests !== 'number') {
    throw new Error('Missing numPassedTests in vitest JSON output');
  }
  return data.numPassedTests;
}

/**
 * Replaces the test badge in README content with the new count.
 * @param {string} content — README file content
 * @param {number} count — test count to set
 * @returns {{ updated: string, changed: boolean }}
 */
function replaceBadge(content, count) {
  const newBadge = `![Tests](https://img.shields.io/badge/tests-${count}%20passing-brightgreen)`;
  if (!BADGE_PATTERN.test(content)) {
    throw new Error('Test badge not found in README.md');
  }
  const updated = content.replace(BADGE_PATTERN, newBadge);
  return { updated, changed: updated !== content };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  // Read vitest JSON from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf8').trim();

  if (!input) {
    console.error('Error: No input received on stdin. Pipe vitest JSON output.');
    process.exit(1);
  }

  let count;
  try {
    count = extractTestCount(input);
  } catch (err) {
    console.error(`Error parsing vitest JSON: ${err.message}`);
    process.exit(1);
  }

  if (!fs.existsSync(README_PATH)) {
    console.error(`Error: README.md not found at ${README_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(README_PATH, 'utf8');

  let result;
  try {
    result = replaceBadge(content, count);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (!result.changed) {
    console.log(`Badge already shows ${count} passing — no update needed.`);
    process.exit(0);
  }

  fs.writeFileSync(README_PATH, result.updated, 'utf8');
  console.log(`Badge updated to ${count} passing.`);
}

// Allow testing without running main
if (require.main === module) {
  main();
}

module.exports = { extractTestCount, replaceBadge };
