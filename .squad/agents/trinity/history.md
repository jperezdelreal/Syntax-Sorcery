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

- **Mobile Performance Patterns (CityPulseLabs):** Sequential API calls bottleneck; parallelization 3x speedup. Exponential backoff+jitter>fixed delay. AbortController (not boolean cancelled). Cache 30s TTL. AnalyticsProvider interface pattern (mock→real swap).

- **ORS Proxy + API Key Security (PR #70):** Never call 3rd-party APIs from browser (CORS, key exposure, rate limits). Server-side proxy via Azure Function. Double caching (client+server). Stale-on-error fallback. VITE_* vars exposed in bundle.

- **ORS Call Reduction (PR #71, 2026-03-21):** 18→9 calls per route (top 2 pickups, 1 dropoff). Cache 5min TTL, 3 decimals (~110m). Routes shown 3→2. Free tier capacity doubled (~222 routes/day). All 335 tests passing.

- **Route Service Diagnosis (2026-03-17):** SWA managed API shadows linked backend. `ORS_API_KEY` set on wrong resource (function app vs SWA). Settings need redeployment to propagate. stationCollector timer stopped (restart loop). deploy-functions.yml never ran (OIDC secrets missing).

- **Real Prediction Model (PR #84, 2026-03-26):** Contract-first: Switch wrote 116 tests with inline impls. Trinity implemented 4 service modules (pure functions, no Cosmos). Swapped inline→import. All 116 tests passed first try. CosmosAnalyticsProvider default + mock fallback.

- **Copilot SDK PoC (2026-04-07):** 3 working scripts (index.js, multi-turn.js, with-tools.js) tested live v0.2.1. Chat+multi-turn+streaming production-ready. Custom tools work but agent prefers built-ins (approveAll issue). Oracle verdict: NOT suitable for B2C (2.5s overhead); use Vercel AI SDK instead.

## Archived Learnings

**Phase 1:** Context remediation (95% reduction, 2618KB→126KB). Skills cherry-pick (16→20 total). GDD parser (25-40 issues). Proposal→prototype (5 scripts, 2 GHA).

**Phase 2-3:** Pipeline deployment (9 PRs merged). **Phase 4-5:** Showroom (GitHub Pages, Monitor). **Phase 6-7:** Dashboard (metrics, pre-flight). **Phase 8-13:** Performance + delivery (730 tests, all artifacts live, €0 cost).
