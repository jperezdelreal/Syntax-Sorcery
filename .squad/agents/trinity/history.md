# Trinity — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Phase 1-13 Arc:** 730 tests green, 9+ PRs/session, autonomous deployment, €0 cost

## Learnings (Current Session)

- **VIGÍA v0.9.0 — Regression Re-testing (#169):** `--regression <report.json>` flag. New `lib/regression.js`: `loadBaselineReport()`, `buildRegressionPlan()` (extracts URLs with issues), `categorizeRegressionResults()` (diffs baseline vs re-test → resolved/persists/new), `generateRegressionReport()` (writes `vigia-regression-*.json`), `formatRegressionOutput()` (terminal summary). Integrated into `vigia.js` main flow — after normal testing, categorizes results and outputs separate regression report. 329 tests green. PR #175 open, awaiting merge after v0.8 stabilization.

- **VIGÍA v0.7.0 — CLI Professional (#167):** Added `--help`, `--config`, `--severity-threshold`, `--output-format`, `--quiet`, and exit codes. New `lib/config.js` module: `parseArgs()`, `loadConfigFile()`, `mergeConfig()` (CLI > file > defaults), `filterBySeverity()`, `getExitCode()` (1 if critical). Backward compatible. 69 TDD tests from Switch all green. PR #173. Morpheus gate: --output-format parsed but not wired to reporter (acceptable phased delivery, follow-on issue for v1.0).

- **VIGÍA v0.6.0 — Run Comparison + JSON Export (#166):** `--compare report1.json report2.json` flag. `vigia-data-{timestamp}.json` export: flat `issues[]` + structured `sessions[]`. New `lib/compare.js`: loadReport(), compareReports() (new/resolved/persistent/regression), formatComparisonOutput(). Fingerprint = title|severity hash. 203 tests green (48 Switch TDD + Trinity impl).

- **VIGÍA v0.5.1 — Multi-URL Consolidation (#171):** PR merged. 155 tests. Multi-URL arg parsing, session isolation, consolidated reporting production-ready. Switch TDD (37) + Trinity impl confirmed spec-first. Reporter reset-on-startSession pattern isolated state correctly.

- **VIGÍA v0.5.0 — Multi-URL support (#165):** `--url site1 --url site2`. vigia.js parses multiple URLs, isolated SDK sessions, shared browser. `generateConsolidatedReport(sessions[])` produces unified report with per-URL sections + aggregate table. 155 tests green.

- **VIGÍA v0.4 — click_text fallback (2026-07-14):** Auto-retry on `:contains()` selectors: extract text, retry with `browser.clickText(text)`. Helper: `extractTextFromSelector()`. 5 tests. 118 total green.

- **VIGÍA v0.3.0 — Testing Quality Upgrade (2026-07-14):** Four new commands: (1) `type_and_select` (autocomplete), (2) `wait_for_stable` (network idle + MutationObserver), (3) `check_accessibility` (axe-core via CDN), (4) `check_links` (HEAD-check <a> hrefs). System prompt methodical (homepage→navigation→forms→a11y→responsive). 113 tests green (was 95).

- **VIGÍA v0.2.0 — Vision + Error Handling (2026-07-13):** Screenshots as base64 blob attachments. Agent detects visual issues. Error handling: try/catch executeCommand, 2-min timeout, SIGINT graceful shutdown, session.error listener, partial crash reports. Functions refactored to `lib/`.

- **Vercel AI SDK PoC Approved (2026-07-09):** 25-40x cold start, 4-10x cost reduction, v6 maturity. Use for all B2C products. Baseline: `poc/vercel-ai-chat/with-tools.js`.

## Archived Learnings (Pre-v0.7)

**API & Infrastructure Patterns:** Mobile perf — parallelization 3x speedup, exponential backoff+jitter, AbortController, cache 30s TTL, AnalyticsProvider mock→real swap. ORS: never call 3rd-party from browser — server proxy via Azure Function, double caching, stale-on-error. Call reduction 18→9 per route, 5min TTL, 3 decimals. Route service: ORS_API_KEY on wrong resource, stationCollector timer restart needed.

**Testing & Contract Patterns:** Contract-first TDD (Switch tests → Trinity impl → all 116 pass first try). CityPulseLabs Phase 5: predictionAccuracy, anomalyDetection, analytics, predictionModel suites. Real Prediction Model: 4 service modules, pure functions, CosmosAnalyticsProvider + mock fallback.

**SDKs & Comparison:** Copilot SDK PoC (v0.2.1, 3 scripts, streaming ready, custom tools lose to built-ins). Vercel AI SDK PoC (streamText() one-liner, manual message history, tool() + maxSteps, provider abstraction, <100ms cold start, 4-10x cheaper). Copilot unsuitable for B2C (2.5s overhead).

**Business & Vision:** Vercel AI SDK blob attachments (`{ type: "blob", data: base64, mimeType: "image/png" }`). gpt-4.1 supports vision natively. 18 product ideas across 7 categories (Oracle brainstorm v2), all use identical Work IQ + Stack.

## Archived Learnings

**Phase 1:** Context remediation (95% reduction, 2618KB→126KB). Skills cherry-pick (16→20 total). GDD parser (25-40 issues). Proposal→prototype (5 scripts, 2 GHA).

**Phase 2-3:** Pipeline deployment (9 PRs merged). **Phase 4-5:** Showroom (GitHub Pages, Monitor). **Phase 6-7:** Dashboard (metrics, pre-flight). **Phase 8-13:** Performance + delivery (730 tests, all artifacts live, €0 cost).
