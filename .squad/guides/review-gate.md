# Review Gate Guide

## Overview

The review gate (`scripts/review-gate.js`) is an autonomous PR validation tool that checks whether a PR delivers what its linked issue asked for. It replaces superficial human/agent review with structured, repeatable checks.

## Usage

```bash
# Review a PR in the current repo
npm run review:gate -- --pr 42

# Review a PR in a specific repo
npm run review:gate -- --pr 42 --repo owner/repo
```

## Checks Performed

| # | Check | Pass Condition |
|---|-------|----------------|
| 1 | **Linked Issue** | PR has at least one closing issue reference (`Closes #N`) |
| 2 | **Files Match** | All files listed in the issue's `## Files Involved` section are present in the PR diff |
| 3 | **CI Status** | All status checks have passed (no failures, no pending) |
| 4 | **Not Draft** | PR is marked as ready for review, not draft |

## Output

Structured JSON report:

```json
{
  "pr": 42,
  "title": "feat: add review gate",
  "verdict": "APPROVE",
  "checks": {
    "linkedIssue": { "pass": true, "detail": "Linked issues: 37" },
    "filesMatch": { "pass": true, "detail": "All 4 expected files present" },
    "ciStatus": { "pass": true, "detail": "All 2 checks passing" },
    "notDraft": { "pass": true, "detail": "PR is ready for review" }
  },
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

## Verdicts

| Verdict | Meaning | Trigger |
|---------|---------|---------|
| `APPROVE` | PR is ready to merge | All 4 checks pass |
| `REQUEST_CHANGES` | PR has critical issues | Missing linked issue, CI failure, or file mismatch |
| `NEEDS_HUMAN` | PR needs manual review | Non-critical issues (e.g., draft PR with everything else passing) |

## Exit Codes

- `0` — APPROVE
- `1` — REQUEST_CHANGES or NEEDS_HUMAN
- `2` — Script error (e.g., `gh` CLI not authenticated)

## Issue Body Format

The gate parses the issue body for a `## Files Involved` or `## Files` section. Expected format:

```markdown
## Files Involved
- scripts/review-gate.js (create)
- package.json (add review:gate script)
- .squad/guides/review-gate.md (create)
```

File paths can optionally be wrapped in backticks. Parenthetical annotations (e.g., `(create)`) are ignored.

## Integration with Ralph

Ralph can invoke the review gate before merging PRs:

```bash
node scripts/review-gate.js --pr $PR_NUMBER
if [ $? -eq 0 ]; then
  gh pr merge $PR_NUMBER --squash
fi
```

## Prerequisites

- `gh` CLI authenticated with `repo` scope
- Node.js 18+
