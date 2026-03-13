#!/usr/bin/env node
'use strict';

/**
 * Autonomous PR Review Gate
 *
 * Validates a PR against its linked issue's acceptance criteria:
 *   1. PR has a linked issue
 *   2. Files changed match the "Files:" / "Files Involved" section in issue body
 *   3. CI status is passing
 *   4. PR is not a draft
 *
 * Usage:
 *   node scripts/review-gate.js --pr 42
 *   node scripts/review-gate.js --pr 42 --repo owner/repo
 *
 * Output: structured JSON report with per-check pass/fail and overall verdict.
 *
 * Requires: gh CLI authenticated with repo scope.
 */

const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  let pr = null;
  let repo = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pr' && args[i + 1]) {
      pr = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--repo' && args[i + 1]) {
      repo = args[i + 1];
      i++;
    }
  }

  return { pr, repo };
}

// ---------------------------------------------------------------------------
// gh CLI helpers (injectable for testing)
// ---------------------------------------------------------------------------

function defaultExecGh(cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    timeout: 30_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function fetchPR(prNumber, repo, execGh) {
  const repoFlag = repo ? `-R ${repo}` : '';
  const raw = execGh(
    `gh pr view ${prNumber} ${repoFlag} --json number,title,body,isDraft,statusCheckRollup,closingIssuesReferences,files`
  );
  return JSON.parse(raw);
}

function fetchIssue(issueNumber, repo, execGh) {
  const repoFlag = repo ? `-R ${repo}` : '';
  const raw = execGh(
    `gh issue view ${issueNumber} ${repoFlag} --json number,title,body`
  );
  return JSON.parse(raw);
}

function fetchPRFiles(prNumber, repo, execGh) {
  const repoFlag = repo ? `-R ${repo}` : '';
  const raw = execGh(
    `gh pr view ${prNumber} ${repoFlag} --json files`
  );
  const data = JSON.parse(raw);
  return (data.files || []).map((f) => f.path);
}

// ---------------------------------------------------------------------------
// Check 1: Linked issue
// ---------------------------------------------------------------------------

function checkLinkedIssue(pr) {
  const refs = pr.closingIssuesReferences || [];
  if (refs.length === 0) {
    return { pass: false, detail: 'No linked issue found on this PR' };
  }
  const numbers = refs.map((r) => r.number);
  return { pass: true, detail: `Linked issues: ${numbers.join(', ')}` };
}

// ---------------------------------------------------------------------------
// Check 2: Files match issue's "Files" section
// ---------------------------------------------------------------------------

function parseFilesFromIssue(issueBody) {
  if (!issueBody) return [];

  const lines = issueBody.split('\n');
  const files = [];
  let inFilesSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^##\s+(Files Involved|Files)\s*$/i.test(trimmed)) {
      inFilesSection = true;
      continue;
    }

    if (inFilesSection && /^##\s+/.test(trimmed)) {
      break;
    }

    if (inFilesSection) {
      // Match lines like "- path/to/file.js (create)" or "- path/to/file.js"
      const match = trimmed.match(/^[-*]\s+`?([^\s`(]+)`?\s*(\(.*\))?$/);
      if (match) {
        files.push(match[1]);
      }
    }
  }

  return files;
}

function checkFilesMatch(expectedFiles, actualFiles) {
  if (expectedFiles.length === 0) {
    return { pass: true, detail: 'No files section in issue — skipped' };
  }

  const actualSet = new Set(actualFiles);
  const missing = expectedFiles.filter((f) => !actualSet.has(f));
  const extra = actualFiles.filter((f) => !expectedFiles.includes(f));

  if (missing.length === 0) {
    const extraNote = extra.length > 0 ? ` (+${extra.length} extra files)` : '';
    return { pass: true, detail: `All ${expectedFiles.length} expected files present${extraNote}` };
  }

  return {
    pass: false,
    detail: `Missing files: ${missing.join(', ')}`,
    missing,
    extra,
  };
}

// ---------------------------------------------------------------------------
// Check 3: CI status
// ---------------------------------------------------------------------------

function checkCIStatus(pr) {
  const rollup = pr.statusCheckRollup || [];

  if (rollup.length === 0) {
    return { pass: false, detail: 'No CI checks found' };
  }

  const failed = rollup.filter(
    (c) =>
      c.conclusion === 'FAILURE' ||
      c.conclusion === 'ERROR' ||
      c.conclusion === 'CANCELLED'
  );

  const pending = rollup.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'QUEUED' || c.status === 'PENDING'
  );

  if (failed.length > 0) {
    const names = failed.map((c) => c.name || c.context).join(', ');
    return { pass: false, detail: `Failing checks: ${names}` };
  }

  if (pending.length > 0) {
    return { pass: false, detail: `${pending.length} check(s) still running` };
  }

  return { pass: true, detail: `All ${rollup.length} checks passing` };
}

// ---------------------------------------------------------------------------
// Check 4: Not draft
// ---------------------------------------------------------------------------

function checkNotDraft(pr) {
  if (pr.isDraft) {
    return { pass: false, detail: 'PR is a draft' };
  }
  return { pass: true, detail: 'PR is ready for review' };
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

function computeVerdict(checks) {
  const allPass = Object.values(checks).every((c) => c.pass);
  const criticalFail = !checks.linkedIssue.pass || !checks.ciStatus.pass;
  const hasFileMismatch = !checks.filesMatch.pass && checks.filesMatch.detail !== 'No files section in issue — skipped';

  if (allPass) return 'APPROVE';
  if (criticalFail || hasFileMismatch) return 'REQUEST_CHANGES';
  return 'NEEDS_HUMAN';
}

// ---------------------------------------------------------------------------
// Main review gate
// ---------------------------------------------------------------------------

async function runReviewGate(prNumber, repo, execGh = defaultExecGh) {
  const pr = fetchPR(prNumber, repo, execGh);

  const draftCheck = checkNotDraft(pr);
  const linkedCheck = checkLinkedIssue(pr);

  let filesCheck = { pass: true, detail: 'No linked issue — skipped' };

  if (linkedCheck.pass) {
    const issueNumber = (pr.closingIssuesReferences || [])[0]?.number;
    if (issueNumber) {
      const issueData = fetchIssue(issueNumber, repo, execGh);
      const expectedFiles = parseFilesFromIssue(issueData.body);
      const actualFiles = fetchPRFiles(prNumber, repo, execGh);
      filesCheck = checkFilesMatch(expectedFiles, actualFiles);
    }
  }

  const ciCheck = checkCIStatus(pr);

  const checks = {
    linkedIssue: linkedCheck,
    filesMatch: filesCheck,
    ciStatus: ciCheck,
    notDraft: draftCheck,
  };

  const verdict = computeVerdict(checks);

  return {
    pr: prNumber,
    title: pr.title,
    verdict,
    checks,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const { pr, repo } = parseArgs(process.argv);

  if (!pr) {
    console.error('Usage: node scripts/review-gate.js --pr <number> [--repo owner/repo]');
    process.exit(1);
  }

  runReviewGate(pr, repo)
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.verdict === 'APPROVE' ? 0 : 1);
    })
    .catch((err) => {
      console.error('Review gate error:', err.message);
      process.exit(2);
    });
}

module.exports = {
  parseArgs,
  fetchPR,
  fetchIssue,
  fetchPRFiles,
  checkLinkedIssue,
  parseFilesFromIssue,
  checkFilesMatch,
  checkCIStatus,
  checkNotDraft,
  computeVerdict,
  runReviewGate,
};
