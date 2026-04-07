# Switch — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Core Context (Learnings Distilled)

**Testing Infrastructure:**
- Playwright E2E (mobile + desktop profiles), vitest unit tests, visual/gameplay testing framework (VisualGameRunner), contract-driven testing (inline impls → real swaps).
- Mobile testing 3-tier: cache busting (Tank PR #73) + E2E automation (Switch PR #74) + QA checklist (human validation). 337+ unit tests, 8 mobile + 2 desktop E2E tests.
- Pattern: Test contracts (user-visible behavior), not implementation. Mock factories keep tests readable.

**Downstream Template Rollout:**
- Playwright gameplay testing framework deployed to 3 game repos (Flora, ComeRosquillas, pixel-bounce). Canvas-only validation via pixel-level `getImageData` checks (no DOM parsing needed).
- Visual test pattern: reusable template with `CUSTOMIZE` markers → repos copy/adapt vs rebuild. VisualGameRunner exposes full API: launchGame, screenshot, pressKey, clickAt, getCanvasPixel, compareScreenshot, recordGameplay.
- Key insight: bundler games (Vite/Webpack) require their own dev server; built-in HTTP server won't work with wrong base paths. Tests document requirements gracefully via `test.skip()`.

**Monitoring & Observability:**
- Phase 5 contract tests: 116 test suites (predictionAccuracy, anomalyDetection, analytics, predictionModel) pre-define CityPulseLabs interfaces. When Trinity builds real services, tests stay identical (swap inline→import).
- 24-hour monitoring framework: `monitor-test3.sh` (real-time snapshots), `verify-test3-metrics.sh` (historical aggregation). Bash for portability, JSON + human output, structured exit codes (0=healthy, 1=warning, 2=critical).

## Recent Decisions (2026-07-09 to 2026-07-10)

- Mobile testing strategy (Tier 1-3): cache busting + E2E automation + QA checklist. PR #73 (Tank) + PR #74 (Switch) merged. 337 tests green.
- Phase 5 contract tests filed (116 tests). Trinity to implement services. All tests pass first try.
- Vercel AI SDK confirmed for B2C products (4-10x cost reduction vs Copilot SDK). Switch implications: future test suites may focus on non-developer UX patterns.

## Archived Learnings (Phases 2-0)

**Phase 4-8:** Gameplay testing pilot (22 tests, vm sandbox + framework bridge), Session Report Generator (PR #51), README Premium overhaul (PR #44), constellation monitoring (PR #33-34), unit tests (126 total), E2E tests (92+ new).

**Phase 0-1:** Ralph v5 hardening, GDD→Issue pipeline, context hygiene SKILL, governance setup, decision capture patterns.

## Learnings

### 2026-07-10: VIGÍA Test Suite (95 tests)

- **Scope:** First test suite for `poc/vigia/` — browser.js (31 tests), reporter.js (24 tests), commands.js (25 tests), edge-cases.js (15 tests).
- **Bug found:** `reporter.js` sort used `|| 3` instead of `?? 3`, causing `critical` (order=0) to be treated as unknown severity. Fixed: `||` → `??` (nullish coalescing). Classic JS falsy-zero trap.
- **Architecture:** Extracted `extractCommands` and `executeCommand` from `vigia.js` into `poc/vigia/lib/` for testability. vigia.js now imports from lib/.
- **Mocking pattern:** Playwright mocks require `vi.hoisted()` for mock object creation before `vi.mock()` hoisting. Module-level singleton state (browser, page, context) managed via `initBrowser()/closeBrowser()` in beforeEach/afterEach.
- **vitest config:** Added `poc/vigia/tests/**/*.test.js` to root `vitest.config.js` include patterns.
- **Known issue:** `vi.clearAllMocks()` doesn't reliably clear mock call history for `vi.mock()` factory-created mocks. Use `mockClear()` explicitly or `mockImplementation()` to capture specific call data.

### 2026-07-11: VIGÍA v0.5 Multi-URL Tests (37 tests) — Issue #165

- **Scope:** TDD test suite for multi-URL support at `poc/vigia/tests/multi-url.test.js`.
- **Sections:** A. parseUrls arg parsing (10 tests, inline reference spec), B. Reporter session isolation (5 tests), C. generateConsolidatedReport (13 tests), D. Edge cases (9 tests).
- **Pattern:** Reporter module has singleton state — MUST call `reporter.startSession('about:blank')` in `beforeEach` to prevent state leaks between tests. The existing reporter.test.js does this; omitting it causes cascading failures as issues accumulate across tests.
- **Discovery:** Trinity implemented `generateConsolidatedReport(sessions)` in reporter.js AND multi-URL arg parsing in vigia.js BEFORE tests landed. All 37 TDD tests passed first run after fixing beforeEach isolation. This validates spec-first approach: tests aligned with impl without coordination.
- **parseUrls note:** Reference implementation includes deduplication via `[...new Set(urls)]`. Trinity's inline version in vigia.js does NOT deduplicate. If extracted to lib/, this discrepancy should be resolved (dedup gap identified).
- **PR #171 merged:** v0.5.1 — multi-URL support complete. All 155 tests green.
- **Total VIGÍA tests:** 155 across 5 files (browser: 31, reporter: 24, commands: 25, edge-cases: 15, multi-url: 37). All green.

### 2026-07-15: VIGÍA v0.7 CLI Config Tests (69 tests) — Issue #167

- **Scope:** TDD test suite for CLI professional flags at `poc/vigia/tests/cli-config.test.js`.
- **Sections:** A. Config module — defaults, file loading, CLI overrides, invalid files (19 tests). B. CLI flags — --help, --severity-threshold, --output-format, --quiet, unknown flags, --turns (24 tests). C. Exit codes — based on severity (7 tests). D. Edge cases — flag combos, non-JSON configs, severity hierarchy, validation accumulation, exit-code-post-filter (19 tests).
- **Pattern:** Reference implementations inline (loadConfig, mergeConfig, parseCliFlags, resolveConfig, validateConfig, filterBySeverity, computeExitCode, generateHelpText). Trinity: extract to `lib/config.js` and replace inline refs with imports.
- **Key spec decisions:** Exit code 1 only for critical issues. Severity hierarchy: info < minor < major < critical. CLI flags override config file values. --help/-h and --quiet/-q aliases. Unknown flags captured in `_meta.unknownFlag`. Config validation accumulates all errors before throwing.
- **Note:** Root `vitest.config.js` needs `poc/vigia/tests/**/*.test.js` added to `include` for vigia tests to run from repo root. This was needed in v0.4 (PR #170) too — pattern keeps getting dropped on master.
- **Total VIGÍA tests:** 224 across 7 files. All green.

### 2026-07-15: VIGÍA v0.8 CI/CD Integration Tests (57 tests) — Issue #168

- **Scope:** TDD test suite for GitHub Action CI/CD integration at `poc/vigia/tests/ci-integration.test.js`.
- **Sections:** A. CI-mode behavior — exit codes, --quiet, --output-format, deterministic report paths, severity-threshold filtering (23 tests). B. Action input validation — required url, defaults (max-turns: 10, severity-threshold: minor), invalid values, error accumulation (17 tests). C. Report output for PR comments — valid markdown, no dangerous HTML, formatReportForPR wrapper with status emoji and collapsible details, screenshots directory, JSON structured export (17 tests).
- **Pattern:** Section A tests real lib/config.js functions (parseArgs, mergeConfig, filterBySeverity, getExitCode). Section B uses inline reference impl `parseActionInputs(env)` that parses INPUT_* env vars as GitHub Actions would. Section C uses inline `formatReportForPR()` reference impl. Tank: extract B/C reference impls into action code.
- **Key spec decisions:** Action defaults: max-turns=10, severity-threshold=minor. Exit code 1 only for critical issues post-filter. formatReportForPR uses `<details>` collapse for reports >2000 chars. Validation accumulates all errors before throwing. severity-threshold is case-insensitive.
- **Total VIGÍA tests:** 281 across 8 files. All green.

### 2026-07-15: VIGÍA v0.9 Regression Re-Test Tests (49 tests) — Issue #169

- **Scope:** TDD test suite for regression re-testing at `poc/vigia/tests/regression.test.js`.
- **Sections:** A. Regression module — loadPreviousReport, extractIssuesFromReport, extractUniqueUrls, generateRetestPlan (16 tests). A2. categorizeResults — all resolved/persists/mixed/new/empty/fingerprint-based (10 tests). B. Regression report output — markdown sections, counts, previous report ref, readable format, empty categories (8 tests). C. CLI --regression flag — arg parsing, quiet combo, file validation (12 tests). Integration — full flow end-to-end (3 tests).
- **Pattern:** Reference implementations inline (loadPreviousReport, extractIssuesFromReport, extractUniqueUrls, generateRetestPlan, categorizeResults, generateRegressionReport, parseRegressionArgs). Trinity: extract to `lib/regression.js` and replace inline refs with imports.
- **Key spec decisions:** Categorization uses fingerprint matching (not raw title). Report sections omit empty categories. --regression takes one JSON file (unlike --compare which takes two). --quiet/-q combo supported. Report includes previous report path reference.
- **Validation fix:** Test for "not a VIGÍA report" needed data WITHOUT version field — objects with `version` pass the existing `loadReport()` validation from compare.js. Used `{ name: ..., dependencies: {} }` as test data.
- **Total VIGÍA tests:** 378 across 9 files. All green.

**Session 2026-04-07: VIGÍA v0.8 Completion (57 CI + 49 regression tests):**
- Fixed PR #174 permissions: removed `actions:write`, verified context.runId. 57 CI + 49 regression tests validate VIGÍA action + backward compat.
- All 106 tests passing. Permissions audit complete, approved by Morpheus. PR merged to dev.

