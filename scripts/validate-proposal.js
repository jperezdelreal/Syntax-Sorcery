#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const proposalFile = (() => {
  const idx = args.indexOf('--file');
  return idx !== -1 ? args[idx + 1] : null;
})();

if (!proposalFile) {
  console.error('Usage: node validate-proposal.js --file <path-to-proposal.md>');
  process.exit(1);
}

if (!fs.existsSync(proposalFile)) {
  console.error(`Error: Proposal file not found: ${proposalFile}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { meta: null, body: content, error: 'No YAML frontmatter found' };
  try {
    const meta = yaml.load(match[1]) || {};
    const body = content.slice(match[0].length).trim();
    return { meta, body, error: null };
  } catch (err) {
    return { meta: null, body: content, error: `YAML parse error: ${err.message}` };
  }
}

function isKebabCase(str) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
}

function validate(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { meta, body, error } = parseFrontmatter(raw);
  const errors = [];
  const warnings = [];

  if (error) {
    errors.push(error);
    return { valid: false, errors, warnings, meta: {}, slug: null };
  }

  // Required fields
  const required = ['title', 'slug', 'genre', 'platforms'];
  for (const field of required) {
    if (!meta[field]) errors.push(`Missing required field: ${field}`);
  }

  // Slug validation
  if (meta.slug) {
    if (!isKebabCase(meta.slug)) {
      errors.push(`Slug "${meta.slug}" is not valid kebab-case`);
    }
    // Check for existing GDD
    const gddPath = path.join(path.dirname(filePath), '..', 'gdds', `${meta.slug}.md`);
    if (fs.existsSync(gddPath)) {
      errors.push(`GDD already exists for slug "${meta.slug}" at ${gddPath}`);
    }
  }

  // Genre validation
  const validGenres = ['puzzle', 'platformer', 'card', 'roguelite', 'arcade', 'strategy', 'other'];
  if (meta.genre && !validGenres.includes(meta.genre.toLowerCase())) {
    warnings.push(`Genre "${meta.genre}" not in standard list: ${validGenres.join(', ')}`);
  }

  // Platforms must be an array
  if (meta.platforms && !Array.isArray(meta.platforms)) {
    errors.push('Field "platforms" must be an array');
  }

  // Body word count
  const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 50) {
    errors.push(`Body too short: ${wordCount} words (minimum 50)`);
  }
  if (wordCount > 500) {
    warnings.push(`Body quite long: ${wordCount} words (recommended max 500)`);
  }

  // Optional field checks
  if (meta.target_session_minutes && typeof meta.target_session_minutes !== 'number') {
    warnings.push('target_session_minutes should be a number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    meta,
    slug: meta.slug || null,
    wordCount
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const result = validate(proposalFile);

console.log(`\n${'═'.repeat(50)}`);
console.log(`  Proposal Validation: ${path.basename(proposalFile)}`);
console.log(`${'═'.repeat(50)}\n`);

if (result.valid) {
  console.log(`✅ VALID — slug: ${result.slug}, words: ${result.wordCount}`);
} else {
  console.log('❌ INVALID');
}

if (result.errors.length > 0) {
  console.log('\nErrors:');
  result.errors.forEach(e => console.log(`  ✗ ${e}`));
}

if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

// Output JSON for CI consumption
const jsonOutput = JSON.stringify(result, null, 2);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `validation_result=${JSON.stringify(result)}\n`);
}

console.log(`\n${jsonOutput}\n`);
process.exit(result.valid ? 0 : 1);
