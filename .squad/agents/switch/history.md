# Switch — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings (Current)

- **Playwright E2E Mobile Tests (PR #74):** Implemented Morpheus's mobile testing strategy (Tier 2 + Tier 3). Playwright config with 3 device profiles: iPhone 12 (390×844), Android (360×640), Desktop Chrome. 8 mobile tests (map load, search bar tappable, touch origin/destination, BOOST hidden, bottom sheet, touch targets ≥36px, no horizontal scroll) + 2 desktop tests (side panel visible, banner text persists). GitHub Actions workflow `e2e-mobile.yml` runs on PRs with artifact upload. PR template with 10-item mobile QA checklist for real-device testing. Key learnings: (1) Playwright `test.skip()` in `beforeEach` with `testInfo.project.name` is the correct pattern for project-scoping tests, not top-level `test.skip()`. (2) Leaflet map taps need 1.5s wait between origin/destination due to marker rendering. (3) Touch target checks should exclude third-party controls (`.leaflet-control`). (4) Must exclude `e2e/` from vitest config to prevent test runner conflicts. 18 passed, 12 skipped, 337 existing unit tests unaffected.

**Session 2026-03-21: Mobile Testing Strategy Execution (Morpheus Decision T1):**
- Morpheus evaluated 6 mobile testing options; recommended 3-tier stack (cache busting T1 + Playwright E2E T2 + QA checklist T3).
- Switch owned Tier 2 + 3 (Playwright E2E + QA checklist) — PR #74 merged. 10 E2E tests covering touch interactions, layouts, button reachability, performance. `.github/MOBILE_QA_CHECKLIST.md` provides structured real-device validation framework. All 337 existing unit tests unaffected. 
- Cross-agent: Tank completed Tier 1 cache busting (PR #73) — prerequisite for E2E success. Both PRs merged by 2026-03-21. Total investment: €0, 10 hours (Tank 2h + Switch 8h). Ready for production validation.
- Key pattern: CI automation (E2E) + human expertise (QA checklist) = 85%+ confidence mobile UX works correctly.


- **Phase 5 Contract Tests (PR #66, Issues #62-#65):** Created 116 contract-first test suites for CityPulseLabs Phase 5 features across 4 files: predictionAccuracy (32 tests — MAE/RMSE/bias, threshold alerts, per-station breakdown), anomalyDetection (27 tests — stale/stuck/empty/full/offline detection with configurable thresholds), analytics (26 tests — hourly aggregation, peak hours, demand ranking, weekday vs weekend), predictionModel (31 tests — confidence 0-100 scale, training pipeline, performance <100ms, zero false positives). Key pattern: inline reference implementations define the contract; when Trinity builds real services, swap imports and tests stay identical. This is consumer-driven contract testing without requiring the implementation to exist first. All 116 tests pass. Follows existing vitest conventions (makeSnapshot helpers, describe/it blocks, same file structure as prediction.test.ts). Branch: squad/64-phase5-tests.
  - **Session 2026-03-16 context:** Trinity will implement Phase 5 services against these 116 tests. No test rewrites needed — she swaps inline stubs for real imports from `../services/prediction`, etc. Tank deployed functions (PR #69) → data flowing. Mouse redesigned mobile UX (PR #68) → Google Maps pattern live. Trinity fixed "failed to fetch" (PR #67) → 3x mobile speedup. Switch's contracts define the interface contract Trinity implements.

- **Playwright Template Rollout(Issue flora#266, ComeRosquillas#134, pixel-bounce#62):** Created reusable Playwright gameplay testing framework in `beneficial-bar/playwright-template/`. TypeScript GameRunner class (ported from JS VisualGameRunner), 3 test suites (smoke, gameplay, menu-navigation), auto-issue-creation script (`create-issues-from-failures.js` — parses Playwright JSON → `gh issue create`). Key design: template uses `CUSTOMIZE` markers so downstream repos can adapt without rewriting. Handles both static HTML games (built-in server) and bundler games (Vite dev server). Created SKILL.md with patterns for canvas-only validation, DOM HUD testing, animation loop verification, and graceful skip for missing features. Filed issues in all 3 downstream game repos with game-specific acceptance criteria (Flora needs Vite, ComeRosquillas has DOM HUD, pixel-bounce is canvas-only). Pattern: reusable template > per-repo implementation — downstream repos copy and customize, not rebuild.

- **Test 3 Monitoring Automation (PR #139, Issue #128):** Built comprehensive monitoring infrastructure for 24-hour observation period. Created `monitor-test3.sh` (real-time health checks: VM, watchdog, GitHub, cost, Ralph), `verify-test3-metrics.sh` (24h success criteria validation), and structured monitoring template. Exit code strategy: 0=healthy, 1=warning, 2=critical. Key insight: separate monitor vs. verify scripts serve different purposes — monitoring provides real-time snapshots (every 2h), verification aggregates historical data (24h validation). Bash over Node.js for portability and minimal deps. JSON + human-readable dual output for automation + ops. Shell-based test suite validates exit codes, JSON structure, error handling. Reuses existing `azure-cost-check.sh`, integrates with systemd journal. Cron-compatible for scheduled checks. Pattern: observability scripts should return structured exit codes for alerting, provide both machine and human output, and degrade gracefully when optional dependencies (az CLI) are unavailable.

- **Visual Test Rollout (PR #138, Issue #132):** Extended Playwright visual tests to ComeRosquillas and Flora. ComeRosquillas (plain HTML/JS Pac-Man clone): 6/6 tests pass — maze render, HUD DOM elements, ENTER start, Homer visibility, arrow key movement, animation loop. Flora (PixiJS + Vite): 3/6 pass, 3/6 skip gracefully — Vite + TypeScript games can't be served by the built-in HTTP server (needs `npm run dev`). Added `launchUrl(url)` to VisualGameRunner so dev-server games connect directly. Key insight: games using bundlers (Vite/Webpack) need their own dev server; the `dist/` build may have wrong base path for local serving. The `test.skip()` pattern handles this cleanly — tests document the requirement rather than failing cryptically.

- **Visual Gameplay Testing (PR #129):** Playwright-based visual testing framework — agents can now literally open HTML5 games in Chromium, simulate inputs, capture screenshots, and validate visuals. Built `VisualGameRunner` class with full API: `launchGame`, `screenshot`, `pressKey`, `clickAt`, `waitForFrames`, `getCanvasPixel`, `compareScreenshot`, `recordGameplay`, `hasVisualContent`. 8/8 pilot tests pass against pixel-bounce. Key insight: canvas-only games (no DOM score display) need pixel-level validation via `getImageData` — reading regions for non-uniformity proves content is rendered without needing to parse drawn text. The local HTTP server pattern (listen on port 0 → random port) avoids port conflicts in CI. 730 existing tests remain green. CLI integration via `visual-test` subcommand.

- **Issue #89 (2026-03-21):** Gameplay testing pilot for pixel-bounce (PR #98). 22 tests validating real game code via vm sandbox + framework bridge pattern. Found & fixed canvas-mock parseColor bug (gradient objects). Key insight: procedural games with `let`/`const` globals require a same-scope bridge pattern to expose internals from `vm.runInContext()`. 651 total tests passing (629 existing + 22 new). Proves the Phase 8 gameplay framework (#75) works on real downstream games.

- **Phase 5 (2026-03-19 to 2026-03-20):** Session Report Generator PR #51 merged. Automated session summary generation. Issue #48 CLOSED. Moved from QA-only role to infrastructure enablement.

- **Phase 4 (2026-03-19):** README Premium Overhaul (PR #44 merged). Created marketing-grade front page with badges, ASCII diagrams, constellation table, team roster. Issue #41 CLOSED.

- **Phase 3 (2026-03-18):** Constellation health monitoring (PR #33) + ralph-watch dashboard (PR #34). Issue #29, #31 CLOSED. Board clear at phase end.

## Archived Learnings (Phases 2-0)

**Phase 2:** Unit tests (34 tests), E2E tests (92 new, 126 total), CI checks (PR #32), constellation monitoring infrastructure.
**Phase 1:** Ralph v5 hardening, GDD→Issue pipeline, P1-10b-P1-13 completion, FFS takeover verification (Grade 🟢 GREEN), full constellation check.
**Phase 0:** Context hygiene SKILL, self-audit (D→B grade), governance setup, decision capture patterns.
