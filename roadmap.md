# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## ~~1. [x] Configure CI checks and branch protection~~ ✅

Delivered in PR #32 (merged 2026-03-18). Issue #30 CLOSED.

---

## ~~2. [x] Add constellation-wide health monitoring~~ ✅

Delivered in PR #33 (merged 2026-03-18). Issue #31 CLOSED.

---

## ~~3. [x] Create ralph-watch.ps1 monitoring dashboard~~ ✅

Delivered in PR #34 (merged 2026-03-18). Issue #29 CLOSED.

---

## ~~4. [x] Issue dedup guard for perpetual motion~~ ✅

Delivered in PR #38 (merged 2026-03-19). Issue #36 CLOSED.

---

## ~~5. [x] Azure satellite launcher scripts~~ ✅

Delivered in PR #39 (merged 2026-03-19). Issue #35 CLOSED.

---

## ~~6. [x] Autonomous PR review gate~~ ✅

Delivered in PR #40 (merged 2026-03-19). Issue #37 CLOSED.

---

## ~~7. [x] README premium overhaul — company-grade presentation~~ ✅

Delivered in PR #44 (merged 2026-03-19). Issue #41 CLOSED.

---

## ~~8. [x] Landing page visual upgrade — Matrix-themed premium design~~ ✅

Delivered in PR #47 (merged 2026-03-19). Issue #42 CLOSED.

---

## ~~9. [x] Architecture documentation with visual system diagrams~~ ✅

Delivered in PR #46 (merged 2026-03-19). Issue #43 CLOSED.

---

## ~~10. [x] Automated session report generator~~ ✅

Delivered in PR #54 (merged 2026-03-19). Issue #48 CLOSED.

---

## ~~11. [x] Unified developer CLI for all squad operations~~ ✅

Delivered in PR #55 (merged 2026-03-19). Issue #49 CLOSED.

---

## ~~12. [x] Constellation status page on landing site~~ ✅

Delivered in PR #53 (merged 2026-03-19). Issue #50 CLOSED.

---

## 13. [ ] E2E integration test suite for the autonomous pipeline

**Acceptance Criteria:**
- New test file `scripts/__tests__/perpetual-motion-e2e.test.js` — integration tests for the full autonomous pipeline
- Tests the complete perpetual motion cycle: `issues.closed` event → dedup-guard validates → roadmap.md parsed for depletion → new planning issue created (or skipped if items remain)
- Tests the PR pipeline: issue assigned → PR opened → review-gate validates against acceptance criteria → merge decision
- Tests error paths: dedup detects existing planning issue (skip), roadmap has remaining items (no refuel needed), GitHub API failure (graceful error), malformed roadmap (handled)
- Tests cross-script integration: session-report captures activity from a simulated session, squad-cli routes to correct subscripts
- All external calls (gh CLI, GitHub API) mocked via dependency injection consistent with existing test patterns (dedup-guard.test.js, review-gate.test.js)
- Minimum 20 integration test cases covering: happy paths (3+), error paths (5+), edge cases (5+), cross-script flows (4+), event sequencing (3+)
- Uses vitest, runs as part of `npm test` — zero new dependencies
- Exit code 0 on all green, descriptive failure messages on red

**Files:**
- `scripts/__tests__/perpetual-motion-e2e.test.js` (create)
- `scripts/__tests__/fixtures/` (add mock data if needed)

**Context:**
Individual scripts have unit tests (218 total), but the autonomous pipeline as a SYSTEM has never been integration-tested. Unit tests prove each gear works; E2E tests prove the machine runs. When the founder asks "how do you know the perpetual motion cycle works?" the answer should be "because we test it end-to-end." This is the test that separates a collection of scripts from a verified autonomous system. Simulates the full issue→PR→merge→refuel loop with mocked GitHub events. The meta-test: the machine that tests itself.

---

## 14. [ ] Autonomous performance metrics engine

**Acceptance Criteria:**
- Script `scripts/metrics-engine.js` aggregates historical GitHub data into operational KPIs
- Metrics computed: velocity (issues closed per session), cycle time (median hours from issue open to PR merge), quality rate (merge % vs rejection %), test growth (tests added per phase), throughput (PRs merged per day), streak (consecutive successful merges)
- Data source: `gh` CLI queries for issues, PRs, and reviews within a time window
- CLI flags: `--since <ISO date>` (default: 30 days ago), `--until <ISO date>` (default: now), `--json` (machine-readable output), `--save` (write snapshot to `docs/metrics/YYYY-MM-DD.json`)
- Human-readable output: formatted table with metric name, value, trend indicator (↑/↓/→ vs previous snapshot)
- Trend comparison: if previous snapshot exists in `docs/metrics/`, compare and show deltas
- Add `npm run metrics` script to package.json
- Add `metrics` subcommand to squad-cli.js (routes to metrics-engine.js)
- Unit tests (vitest) with DI-mocked `gh` CLI calls, tests for each metric computation, trend comparison, and edge cases (no previous data, empty time window)
- No new dependencies — uses `gh` CLI via child_process with DI pattern

**Files:**
- `scripts/metrics-engine.js` (create)
- `scripts/__tests__/metrics-engine.test.js` (create)
- `scripts/squad-cli.js` (add `metrics` command routing)
- `package.json` (add npm script)
- `docs/metrics/` (directory created on first `--save`)

**Context:**
Session reports (Phase 5) capture WHAT happened. Metrics capture HOW WELL it happened. After 12 issues and 13 PRs in one session, the founder should be able to ask: "What's our cycle time? What's our quality rate? Are we getting faster?" The metrics engine transforms raw GitHub data into executive KPIs. Trend comparison against previous snapshots shows improvement over time. This is the difference between a company that works and a company that LEARNS. Combined with the status page (public health) and session reports (activity log), metrics complete the operational intelligence triangle: activity → health → performance.

---

## 15. [ ] One-command developer bootstrap

**Acceptance Criteria:**
- Script `scripts/bootstrap.js` provides complete project setup in a single command
- Prerequisite validation: Node.js ≥18 (check `process.version`), `gh` CLI installed (check `gh --version`), `gh` authenticated (check `gh auth status`), `git` configured (check `git config user.name`)
- Dependency installation: root project (`npm ci`), site project (`cd site && npm ci`)
- Structure validation: runs `validate-squad.js` to verify `.squad/` integrity
- Health check: runs `constellation-health.js` to verify downstream repos accessible
- Test validation: runs `npm test` to confirm all tests pass
- Output: step-by-step progress with ✅/❌ per step, final summary with total time elapsed
- Graceful degradation: if `gh` not installed, skip GitHub-dependent steps with ⚠️ warning (don't fail entire bootstrap)
- CLI flags: `--skip-tests` (skip test run for faster setup), `--skip-health` (skip constellation health check), `--verbose` (show full command output)
- Add `npm run setup` script to package.json
- Unit tests for prerequisite validation logic, step sequencing, and graceful degradation
- No new dependencies — uses child_process for subprocess commands

**Files:**
- `scripts/bootstrap.js` (create)
- `scripts/__tests__/bootstrap.test.js` (create)
- `package.json` (add npm script)
- `docs/onboarding.md` (update with `npm run setup` instructions)

**Context:**
A new developer (or the founder returning from sleep) should be able to clone the repo and run ONE command to be fully operational. Currently, setup requires: install Node, install gh, authenticate gh, npm install in root, npm install in site, validate squad structure, run tests — 7+ manual steps with no validation. `npm run setup` reduces this to a single command with built-in validation at every step. This is the developer experience capstone: the README explains (Phase 4), the CLI provides access (Phase 5), and bootstrap gets you running (Phase 6). Professional open-source projects have this. Syntax Sorcery should too.
