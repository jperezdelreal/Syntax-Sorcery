# Decision: CI Checks Workflow

**Date:** 2026-03-18  
**By:** Switch (Tester/QA)  
**Tier:** T2  
**Issue:** #30  
**PR:** #32  

## Decision

Added `.github/workflows/ci.yml` as the first CI quality gate for Syntax Sorcery. Workflow runs `npm ci` + `npm test` on every PR and push to `master`/`main`.

## Rationale

Test 1 autonomy evaluation scored this as the **#1 critical deficiency** — PRs merged without any validation. This is the minimum viable CI gate: dependency validation + test execution.

## What's NOT included (and why)

- **ESLint:** Not configured in the project. Adding linting should be a separate issue.
- **Branch protection:** Requires admin access. Steps documented in `.squad/guides/ci-checks.md` for founder to configure.
- **Build step:** No build process exists yet. Guide documents how to add one.

## Impact

All future PRs to master/main will require 126 tests to pass before merging (once branch protection is enabled). This directly addresses the autonomy gap where @copilot PRs merged without validation.
