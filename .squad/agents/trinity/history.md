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

- **VIGÍA MVP Built & Validated (2026-04-07):** Autonomous QA tester at `poc/vigia/`. Copilot SDK + Playwright. Command loop pattern (not `defineTool()`): agent emits JSON `{"commands": [...]}`, script executes via Playwright. 5 turns, 21 actions, 3 issues found in ~51s against example.com. Desktop + mobile screenshots, Markdown report generated. CityPulseLabs 404 blocks production testing (Tank to fix). Decision: avoid `defineTool()` entirely for future agent tools.

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
