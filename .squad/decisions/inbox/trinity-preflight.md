# Decision: Pre-flight Validation Architecture

**By:** Trinity (Full-Stack Developer)
**Tier:** T2
**Date:** 2026-03-22
**Issue:** #66
**PR:** #78

## What

Created `scripts/preflight.js` as a unified pre-flight validation script for Test 3 readiness. Introduced `safeExec()` utility pattern wrapping execSync with standardized `{ok, stdout, stderr}` return shape.

## Why

Test 3 requires 8 independent prerequisites to be validated before launching the 24/7 Azure VM session. Having each check as a separate function with DI makes it testable without real infrastructure, and the `--skip-azure` flag enables CI/local validation without cloud credentials.

## Pattern Established

- `safeExec(cmd, execFn, timeout)` → `{ok, stdout, stderr}` — reusable across future scripts needing safe command execution
- Each check function returns `{name, passed, message, fix?}` — standardized check result shape
- `--skip-azure` flag pattern for conditionally skipping environment-specific checks
