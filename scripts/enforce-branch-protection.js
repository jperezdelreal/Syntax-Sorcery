#!/usr/bin/env node
'use strict';

/**
 * Branch Protection Enforcement — configures branch protection on downstream repos.
 *
 * Usage:
 *   node scripts/enforce-branch-protection.js              # dry-run (default)
 *   node scripts/enforce-branch-protection.js --apply       # apply protection rules
 *   node scripts/enforce-branch-protection.js --repo flora  # target single repo
 *   node scripts/enforce-branch-protection.js --json        # machine-readable output
 *
 * Flags:
 *   --apply          Actually apply protection rules (default is dry-run)
 *   --repo <name>    Target a single repo by name
 *   --json           Machine-readable JSON output
 *
 * Environment:
 *   GITHUB_TOKEN     Required. Must have repo admin scope.
 *
 * Exit codes:
 *   0 — success (all repos protected or dry-run complete)
 *   1 — one or more repos failed
 *   2 — missing GITHUB_TOKEN or execution error
 *
 * No new dependencies — uses only Node.js built-ins (https module).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants — desired protection rules
// ---------------------------------------------------------------------------

const DESIRED_PROTECTION = {
  required_status_checks: {
    strict: true,
    contexts: ['CI'],
  },
  enforce_admins: true,
  required_pull_request_reviews: null,
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
  required_linear_history: true,
};

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    apply: args.includes('--apply'),
    json: args.includes('--json'),
    repo: (() => {
      const idx = args.indexOf('--repo');
      return (idx !== -1 && args[idx + 1]) ? args[idx + 1] : null;
    })(),
  };
}

// ---------------------------------------------------------------------------
// Constellation loading
// ---------------------------------------------------------------------------

function loadConstellation(readFileFn) {
  const readFile = readFileFn || ((f) => fs.readFileSync(f, 'utf8'));
  const constellationPath = path.resolve(__dirname, '..', '.squad', 'constellation.json');

  try {
    const raw = readFile(constellationPath);
    const data = JSON.parse(raw);
    return data.repos || [];
  } catch {
    // Fallback hardcoded constellation
    return [
      'jperezdelreal/Syntax-Sorcery',
      'jperezdelreal/FirstFrameStudios',
      'jperezdelreal/flora',
      'jperezdelreal/ComeRosquillas',
      'jperezdelreal/pixel-bounce',
      'jperezdelreal/ffs-squad-monitor',
    ];
  }
}

function parseRepoFullName(fullName) {
  const [owner, repo] = fullName.split('/');
  return { owner, repo };
}

// ---------------------------------------------------------------------------
// GitHub API client (injectable for testing)
// ---------------------------------------------------------------------------

function makeGitHubRequest(method, apiPath, body, token, requestFn) {
  return new Promise((resolve, reject) => {
    const doRequest = requestFn || https.request;

    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'syntax-sorcery-branch-protection',
        'Content-Type': 'application/json',
      },
    };

    const req = doRequest(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = data ? JSON.parse(data) : {};
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else if (res.statusCode === 404) {
          resolve({ status: 404, data: parsed });
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${parsed.message || data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Core logic: get default branch
// ---------------------------------------------------------------------------

async function getDefaultBranch(owner, repo, token, requestFn) {
  const result = await makeGitHubRequest(
    'GET',
    `/repos/${owner}/${repo}`,
    null,
    token,
    requestFn
  );
  if (result.status === 404) {
    throw new Error(`Repository ${owner}/${repo} not found`);
  }
  return result.data.default_branch || 'main';
}

// ---------------------------------------------------------------------------
// Core logic: get current protection
// ---------------------------------------------------------------------------

async function getCurrentProtection(owner, repo, branch, token, requestFn) {
  const result = await makeGitHubRequest(
    'GET',
    `/repos/${owner}/${repo}/branches/${branch}/protection`,
    null,
    token,
    requestFn
  );

  if (result.status === 404) {
    return null; // No protection configured
  }

  return result.data;
}

// ---------------------------------------------------------------------------
// Core logic: normalize current protection for comparison
// ---------------------------------------------------------------------------

function normalizeProtection(current) {
  if (!current) {
    return {
      required_status_checks: null,
      enforce_admins: false,
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: false,
    };
  }

  return {
    required_status_checks: current.required_status_checks ? {
      strict: current.required_status_checks.strict || false,
      contexts: (current.required_status_checks.contexts || []).sort(),
    } : null,
    enforce_admins: current.enforce_admins?.enabled || false,
    allow_force_pushes: current.allow_force_pushes?.enabled || false,
    allow_deletions: current.allow_deletions?.enabled || false,
    required_linear_history: current.required_linear_history?.enabled || false,
  };
}

// ---------------------------------------------------------------------------
// Core logic: diff current vs desired
// ---------------------------------------------------------------------------

function diffProtection(normalized) {
  const diffs = [];

  // Status checks
  if (!normalized.required_status_checks) {
    diffs.push({ field: 'required_status_checks', current: 'none', desired: 'CI (strict)' });
  } else {
    if (!normalized.required_status_checks.strict) {
      diffs.push({ field: 'required_status_checks.strict', current: false, desired: true });
    }
    if (!normalized.required_status_checks.contexts.includes('CI')) {
      diffs.push({
        field: 'required_status_checks.contexts',
        current: normalized.required_status_checks.contexts.join(', ') || 'none',
        desired: 'CI',
      });
    }
  }

  // Enforce admins
  if (!normalized.enforce_admins) {
    diffs.push({ field: 'enforce_admins', current: false, desired: true });
  }

  // Force pushes (should be DISABLED)
  if (normalized.allow_force_pushes) {
    diffs.push({ field: 'allow_force_pushes', current: true, desired: false });
  }

  // Deletions (should be DISABLED)
  if (normalized.allow_deletions) {
    diffs.push({ field: 'allow_deletions', current: true, desired: false });
  }

  // Linear history
  if (!normalized.required_linear_history) {
    diffs.push({ field: 'required_linear_history', current: false, desired: true });
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Core logic: apply protection
// ---------------------------------------------------------------------------

async function applyProtection(owner, repo, branch, token, requestFn) {
  const body = {
    required_status_checks: {
      strict: true,
      contexts: ['CI'],
    },
    enforce_admins: true,
    required_pull_request_reviews: null,
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false,
    required_linear_history: true,
  };

  const result = await makeGitHubRequest(
    'PUT',
    `/repos/${owner}/${repo}/branches/${branch}/protection`,
    body,
    token,
    requestFn
  );

  return result;
}

// ---------------------------------------------------------------------------
// Core logic: process single repo
// ---------------------------------------------------------------------------

async function processRepo(fullName, token, apply, requestFn) {
  const { owner, repo } = parseRepoFullName(fullName);
  const result = {
    repo: fullName,
    branch: null,
    currentProtection: null,
    diffs: [],
    applied: false,
    error: null,
    compliant: false,
  };

  try {
    // 1. Get default branch
    result.branch = await getDefaultBranch(owner, repo, token, requestFn);

    // 2. Get current protection
    const current = await getCurrentProtection(owner, repo, result.branch, token, requestFn);
    const normalized = normalizeProtection(current);
    result.currentProtection = normalized;

    // 3. Diff
    result.diffs = diffProtection(normalized);
    result.compliant = result.diffs.length === 0;

    // 4. Apply if requested and changes needed
    if (apply && result.diffs.length > 0) {
      await applyProtection(owner, repo, result.branch, token, requestFn);
      result.applied = true;
    }
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatHumanReport(results, apply) {
  const lines = [];
  lines.push('');
  lines.push('╔══════════════════════════════════════════════════╗');
  lines.push('║         Branch Protection Report                 ║');
  lines.push('╚══════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  Mode: ${apply ? '🔧 APPLY' : '👁️  DRY-RUN'}`);
  lines.push('');

  for (const r of results) {
    lines.push(`  ── ${r.repo} ──`);

    if (r.error) {
      lines.push(`    ❌ Error: ${r.error}`);
      lines.push('');
      continue;
    }

    lines.push(`    Branch: ${r.branch}`);

    if (r.compliant) {
      lines.push('    ✅ Already compliant — no changes needed.');
    } else {
      lines.push(`    ⚠️  ${r.diffs.length} change(s) needed:`);
      for (const d of r.diffs) {
        lines.push(`      • ${d.field}: ${JSON.stringify(d.current)} → ${JSON.stringify(d.desired)}`);
      }
      if (r.applied) {
        lines.push('    🔧 Protection rules APPLIED.');
      } else if (!apply) {
        lines.push('    💡 Run with --apply to enforce.');
      }
    }
    lines.push('');
  }

  // Summary
  const total = results.length;
  const compliant = results.filter(r => r.compliant).length;
  const applied = results.filter(r => r.applied).length;
  const errors = results.filter(r => r.error).length;

  lines.push('  ── Summary ──');
  lines.push(`    Total repos:  ${total}`);
  lines.push(`    Compliant:    ${compliant}`);
  if (apply) lines.push(`    Applied:      ${applied}`);
  lines.push(`    Errors:       ${errors}`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run(argv, deps) {
  const readFileFn = deps?.readFile;
  const requestFn = deps?.requestFn;
  const tokenOverride = deps?.token;
  const logFn = deps?.log || console.log;
  const errorFn = deps?.error || console.error;

  const parsed = parseArgs(argv || process.argv);
  const token = tokenOverride || process.env.GITHUB_TOKEN;

  if (!token) {
    errorFn('Error: GITHUB_TOKEN environment variable is required.');
    errorFn('The token must have repo admin scope to manage branch protection.');
    return { exitCode: 2, results: [] };
  }

  // Load constellation
  const allRepos = loadConstellation(readFileFn);

  // Filter by --repo if specified
  let repos = allRepos;
  if (parsed.repo) {
    repos = allRepos.filter(r => {
      const { repo } = parseRepoFullName(r);
      return repo === parsed.repo || r === parsed.repo;
    });
    if (repos.length === 0) {
      errorFn(`Error: repo "${parsed.repo}" not found in constellation.`);
      return { exitCode: 2, results: [] };
    }
  }

  // Process each repo
  const results = [];
  for (const fullName of repos) {
    const result = await processRepo(fullName, token, parsed.apply, requestFn);
    results.push(result);
  }

  // Output
  if (parsed.json) {
    logFn(JSON.stringify({
      mode: parsed.apply ? 'apply' : 'dry-run',
      results,
      summary: {
        total: results.length,
        compliant: results.filter(r => r.compliant).length,
        applied: results.filter(r => r.applied).length,
        errors: results.filter(r => r.error).length,
      },
    }, null, 2));
  } else {
    logFn(formatHumanReport(results, parsed.apply));
  }

  const hasErrors = results.some(r => r.error);
  return { exitCode: hasErrors ? 1 : 0, results };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  run().then(({ exitCode }) => process.exit(exitCode));
}

module.exports = {
  DESIRED_PROTECTION,
  parseArgs,
  loadConstellation,
  parseRepoFullName,
  makeGitHubRequest,
  getDefaultBranch,
  getCurrentProtection,
  normalizeProtection,
  diffProtection,
  applyProtection,
  processRepo,
  formatHumanReport,
  run,
};
