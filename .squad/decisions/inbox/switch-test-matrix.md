# Decision: Phase 2 Test Matrix & Quality Gate

**By:** Switch (Tester/QA)
**Date:** 2026-03-15
**Tier:** T2 (Agent authority — test strategy)

## What

Established the Phase 2 game acceptance test matrix at `docs/phase2-test-matrix.md`. Defines pass/fail criteria for all 6 pipeline stages (Proposal→GDD→Issues→Implementation→Build→Deploy), a 25-item game quality checklist, automated vs manual test breakdown, CI integration points, and a 3-tier grading system (🟢 Ship / 🟡 Fix First / 🔴 Reject).

Installed vitest as the project test runner. Created 34 unit tests covering `validate-proposal.js` (13 tests) and `gdd-to-issues.js` (21 tests). Refactored both scripts for testability (exported functions, `require.main` CLI guard). Created 7 test fixture files.

## Why

Phase 2 requires autonomous game production. Without a formal quality gate, games ship untested. The test matrix defines "done" for the pipeline; the unit tests catch regressions in the two most critical pipeline scripts (proposal validation and GDD→issue decomposition). These are the first automated tests in the project.

## Impact

- `npm test` now runs vitest (34 tests, all green)
- Old squad validation preserved as `npm run test:validate-squad`
- `validate-proposal.js` and `gdd-to-issues.js` refactored (non-breaking: CLI behavior unchanged)
- `vitest` added as devDependency
- `vitest.config.js` created at root

## Risks

- vitest globals mode used (CommonJS compat) — test files don't import vitest explicitly
- Script refactoring maintains backward compatibility but should be verified in GHA workflows
