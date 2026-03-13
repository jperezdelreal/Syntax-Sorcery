#!/usr/bin/env node
'use strict';

/**
 * Dedup Guard — prevents perpetual-motion from creating duplicate planning issues.
 *
 * Checks if an open issue with label `squad` and a title containing "roadmap"
 * already exists. Designed to run before creating a new planning issue.
 *
 * Usage:
 *   node scripts/dedup-guard.js
 *   node scripts/dedup-guard.js --owner jperezdelreal --repo Syntax-Sorcery
 *
 * Exit codes:
 *   0 — always (duplicate found = skip, no duplicate = safe to create)
 *   1 — API / runtime error
 *
 * Requires: gh CLI authenticated with repo scope.
 */

const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves owner/repo from gh CLI context when not provided via flags.
 */
function resolveRepo(execFn) {
  const exec = execFn || execSync;
  try {
    const raw = exec('gh repo view --json nameWithOwner -q .nameWithOwner', {
      encoding: 'utf8',
      timeout: 15_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return raw.trim();
  } catch {
    return null;
  }
}

/**
 * Searches for open issues with label `squad` and title containing "roadmap".
 * Returns an array of matching issue objects ({ number, title }).
 */
function findDuplicateIssues(owner, repo, execFn) {
  const exec = execFn || execSync;
  const cmd = [
    'gh', 'issue', 'list',
    '--repo', `${owner}/${repo}`,
    '--label', 'squad',
    '--search', '"roadmap" in:title',
    '--state', 'open',
    '--json', 'number,title',
  ].join(' ');

  const raw = exec(cmd, {
    encoding: 'utf8',
    timeout: 15_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { owner: null, repo: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--owner' && args[i + 1]) {
      result.owner = args[++i];
    } else if (args[i] === '--repo' && args[i + 1]) {
      result.repo = args[++i];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run(argv, execFn) {
  const parsed = parseArgs(argv || process.argv);
  let owner = parsed.owner;
  let repo = parsed.repo;

  // Resolve from gh context if not provided
  if (!owner || !repo) {
    const fullName = resolveRepo(execFn);
    if (!fullName) {
      console.error('Dedup: could not resolve repo — pass --owner and --repo flags');
      return { exitCode: 1, duplicate: false, issueNumber: null };
    }
    const parts = fullName.split('/');
    owner = owner || parts[0];
    repo = repo || parts[1];
  }

  let issues;
  try {
    issues = findDuplicateIssues(owner, repo, execFn);
  } catch (err) {
    console.error(`Dedup: API error — ${err.message}`);
    return { exitCode: 1, duplicate: false, issueNumber: null };
  }

  if (issues.length > 0) {
    const num = issues[0].number;
    console.log(`Dedup: open planning issue already exists (#${num}), skipping`);
    return { exitCode: 0, duplicate: true, issueNumber: num };
  }

  console.log('Dedup: no open planning issue found, safe to create');
  return { exitCode: 0, duplicate: false, issueNumber: null };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const result = run();
  process.exit(result.exitCode);
}

module.exports = { run, findDuplicateIssues, parseArgs, resolveRepo };
