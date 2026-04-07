# Trinity — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Phase 1-13 Arc:** 730 tests green, 9+ PRs/session, autonomous deployment, €0 cost

## Learnings (Current)

- **VIGÍA v0.5.1 — Multi-URL Consolidation Landed (#171, 2026-07-15):** PR merged. 155 tests passing. Trinity + Switch collaboration complete — multi-URL arg parsing, session isolation, consolidated reporting all production-ready. Switch found URL dedup gap (parseUrls needs Set dedup in vigia.js). Switch TDD tests (37) + Trinity impl confirmed spec-first workflow. Reporter reset-on-startSession pattern isolated state correctly.

- **VIGÍA v0.5.0 — Multi-URL support (#165, 2026-07-15):** Added `--url site1 --url site2` support. `vigia.js` parses multiple URLs, creates isolated SDK sessions per URL, shares browser/client. `reporter.js` keeps backward compat: `startSession`/`generateReport` reset state per URL (single-URL unchanged). New `captureSession()` snapshots current URL data, `generateConsolidatedReport(sessions[])` produces unified report with per-URL sections + aggregate table. 155 tests green (20 Switch TDD tests now pass). Key: reporter uses reset-on-startSession pattern — multi-URL orchestration lives in vigia.js, not reporter.

- **VIGÍA v0.4 — click_text fallback (2026-07-14):** Added auto-retry in `execute-command.js` click case: when `browser.click(selector)` fails and the selector contains `:contains('...')` or `:has-text('...')`, extracts the text and retries with `browser.clickText(text)`. Exported `extractTextFromSelector()` helper. 5 tests added (fallback success, no retry on success, no retry without :contains, fallback failure, regex extraction). 118 tests green. This lets the agent use CSS pseudo-selectors like `button:contains('Mecánica')` without knowing Playwright locator syntax.

- **VIGÍA v0.3.0 — Testing Quality Upgrade (2026-07-14):**Five improvements shipped. (1) `type_and_select` command: types char-by-char to trigger autocomplete dropdowns, waits 3s for suggestions, clicks first match — critical for search/address fields. (2) `wait_for_stable`: waits for network idle + MutationObserver silence (default 500ms) — replaces fragile `wait(ms)` after async DOM changes. (3) `check_accessibility`: injects axe-core 4.9.1 via CDN at runtime (no npm dep), runs `axe.run()`, returns violations/passes/incomplete. (4) `check_links`: collects `<a>` hrefs, HEAD-checks each (max 20, 5s timeout), returns broken list. (5) System prompt rewritten for methodical flow-by-flow testing (homepage→navigation→forms→a11y→responsive) with screenshot-after-every-action rule. All 4 new commands wired in execute-command.js. 113 tests green (was 95). Version bumped in banner, reporter metadata, and package.json.

- **VIGÍA v0.2.0 — Visión + Error Handling (2026-07-13):** Upgraded VIGÍA with two major capabilities. (1) Vision: screenshots now encoded as base64 and sent to the agent via Copilot SDK blob attachments (`type: "blob"`, `mimeType: "image/png"`). Agent can SEE actual page layout, detect visual issues (contrast, overlap, UX). System prompt instructs visual analysis. Base64 stripped from text results to avoid bloat — images travel as attachments only. 5MB size limit per screenshot, max 5 images per turn. (2) Error handling: try/catch around executeCommand, 2-min timeout on sendAndCollect, SIGINT graceful shutdown (saves partial report + closes browser), session.error event listener, partial report on fatal crash. `--visible` flag preserved. Functions refactored to `lib/` (extract-commands.js, execute-command.js).

- **Copilot SDK supports vision via blob attachments:** `MessageOptions.attachments` accepts `{ type: "blob", data: base64String, mimeType: "image/png" }`. `ModelCapabilities.supports.vision` confirms model support. gpt-4.1 supports vision. No need for external image description — SDK handles inline images natively.

- **Vercel AI SDK PoC Approved (2026-07-09):** Decision filed. PoC validated in production. Verdict: 25-40x faster cold start (<100ms vs ~2.5s), 4-10x cost reduction, v4.x maturity > v0.2.x. Use for all B2C products. Baseline: `poc/vercel-ai-chat/with-tools.js` for AUTONOMO.AI.

- **Vercel AI SDK PoC (2026-07-08):** 3 working scripts at `poc/vercel-ai-chat/` matching Copilot SDK PoC. Key findings: streamText() is one-liner vs CopilotClient→start→createSession→send chain. Manual message history (explicit) vs SDK auto-accumulation (opaque). tool() + maxSteps handles tool loop transparently — no built-in tools competing with custom ones (Copilot SDK's biggest UX problem). Provider abstraction in lib/provider.js: Azure OpenAI → OpenAI fallback. Cold start <100ms vs ~2.5s. Cost ~4-10x cheaper at scale (tokens vs premium requests).

- **Mobile Performance Patterns (CityPulseLabs):** Sequential API calls bottleneck; parallelization 3x speedup. Exponential backoff+jitter>fixed delay. AbortController (not boolean cancelled). Cache 30s TTL. AnalyticsProvider interface pattern (mock→real swap).

- **ORS Proxy + API Key Security (PR #70):** Never call 3rd-party APIs from browser (CORS, key exposure, rate limits). Server-side proxy via Azure Function. Double caching (client+server). Stale-on-error fallback. VITE_* vars exposed in bundle.

- **ORS Call Reduction (PR #71, 2026-03-21):** 18→9 calls per route (top 2 pickups, 1 dropoff). Cache 5min TTL, 3 decimals (~110m). Routes shown 3→2. Free tier capacity doubled (~222 routes/day). All 335 tests passing.

- **Route Service Diagnosis (2026-03-17):** SWA managed API shadows linked backend. `ORS_API_KEY` set on wrong resource (function app vs SWA). Settings need redeployment to propagate. stationCollector timer stopped (restart loop). deploy-functions.yml never ran (OIDC secrets missing).

- **Real Prediction Model (PR #84, 2026-03-26):** Contract-first: Switch wrote 116 tests with inline impls. Trinity implemented 4 service modules (pure functions, no Cosmos). Swapped inline→import. All 116 tests passed first try. CosmosAnalyticsProvider default + mock fallback.

- **Copilot SDK PoC (2026-04-07):** 3 working scripts (index.js, multi-turn.js, with-tools.js) tested live v0.2.1. Chat+multi-turn+streaming production-ready. Custom tools work but agent prefers built-ins (approveAll issue). Oracle verdict: NOT suitable for B2C (2.5s overhead); use Vercel AI SDK instead.

- **Business Products Brainstorm v2 (Oracle, 2026-04-07):** 18 product ideas across 7 categories (management, sales, HR, legal, finance, autónomos, sector-specific). All built on identical Work IQ + Copilot SDK + Azure stack. First product = platform foundation; 2nd is 70% faster, 3rd is 90% faster. Architecture task pending joperezd MVP selection.

## Archived Learnings

**Phase 1:** Context remediation (95% reduction, 2618KB→126KB). Skills cherry-pick (16→20 total). GDD parser (25-40 issues). Proposal→prototype (5 scripts, 2 GHA).

**Phase 2-3:** Pipeline deployment (9 PRs merged). **Phase 4-5:** Showroom (GitHub Pages, Monitor). **Phase 6-7:** Dashboard (metrics, pre-flight). **Phase 8-13:** Performance + delivery (730 tests, all artifacts live, €0 cost).
