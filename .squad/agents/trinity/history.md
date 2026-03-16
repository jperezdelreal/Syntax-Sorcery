# Trinity — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Phase 1 Learnings (Archived)

- Created squad-size-check.yml and .gitignore hardening; CI/context hygiene foundational
- P1-04/P1-05 context remediation: 95% reduction (2618KB→126KB), all files <15KB
- P1-07 Skills cherry-pick: 16 domain-agnostic FFS skills migrated to SS (20 total skills)
- P1-10b GDD→Issue pipeline: Node.js parser handles YAML + 10 sections, produces 25–40 issues, auto-labeled
- P1-11 Proposal→Prototype orchestration: 5 scripts + 2 GHA workflows + game repo template, stages 0–2 production-ready
- P1-14 FFS visibility audit: 7 blockers identified, 8–12h remediation queued

## Recent Learnings (Phase 2-13 Summary)

**Phase 2-3:** Pipeline & Satellite deployment (E2E test, 9 PRs merged, Pixel Bounce game deployed)
**Phase 4-5:** Company showroom (FFS page, SS landing page, GitHub Pages, Squad Monitor)
**Phase 6-7:** Dashboard infrastructure (metrics, pre-flight validation, CLI consolidation)  
**Phase 8-10:** Performance optimization (MatrixRain, constellation stats, dashboard backend/UI)
**Phase 11-13:** Delivery complete (730 tests green, €0 cost, all artifacts live)

**Key Learnings:**
- Always verify what's on origin/master before branching (use `git checkout -b X origin/master`)
- Design-only PRs rejected; full implementations approved (PR #45 vs PR #47)
- Build-time data piping (metrics-engine.js → JSON) > API calls during deploy (eliminates tool dependencies)
- DI-injectable architecture enables standardized error handling across all scripts
- When PRs conflict on routing file: extract non-conflicting files via `git show`, then merge router/config once
- Concurrent session branch swaps: use atomic checkout+commit chains
- Design-only PRs already on branch? Update with full implementation, don't create new PR (saves review overhead)

## Session 2026-03-16 (Phase 5 Launch)

**PR #67 merged — Mobile Fixes + Phase 5 Skeleton:**
- Root cause of "failed to fetch": secondary API calls (prediction, geocoding) used raw `fetch()` instead of `fetchWithRetry`. Creates zombie requests on slow mobile networks. Primary route calls worked → "loads then fails" pattern.
- Solution: exponential backoff with jitter in `fetchWithRetry` + external `AbortSignal` support. Mobile networks recover in bursts; fixed delays cause retry collisions. Formula: `baseMs * 2^attempt + random(0, baseMs*0.5)`.
- ORS parallelization: was 6 pairs × 3 sequential calls. Parallelized → 3x mobile speedup. Route caching (30s TTL, 5-decimal rounding) eliminates redundant calls on settings toggle.
- Tiered timeouts: Weather 6s/1 retry, Prediction 8s/2 retry, ORS 10s/2 retry. Non-critical services can't block UI.
- Phase 5 analytics skeleton: AnalyticsProvider interface (mock impl) + 4 pure SVG charts. Tank plugs real Cosmos data with one-liner. Trinity's UI code has zero dependency on Tank's implementation — design contract first, swap backend.
- All 252+ tests passing. PR #67 live.

**Cross-agent:**
- Tank deployed functions (PR #69) — functions live, Timer collecting ~22K snapshots/day. Trinity's AnalyticsProvider interface now has real data source.
- Switch created 116 Phase 5 contract tests (PR #66). Trinity will implement Phase 5 services against these contracts (no test rewrites needed).
- Mouse redesigned mobile UX (PR #68) — unified bottom sheet, Google Maps pattern. Orthogonal to analytics work.

## Learnings

### Mobile Performance Debugging (CityPulseLabs)
- **Sequential ORS API calls are the #1 mobile bottleneck** — route engine was doing 6 pairs × 3 calls sequentially. Parallel batches of 3 cut load time ~3x on mobile.
- **`cancelled` boolean ≠ AbortController** — boolean prevents state updates but doesn't cancel in-flight `fetch()` requests. On mobile with slow networks, zombie requests stack up. Always use `AbortController` + `signal` propagation for cancellable data fetching.
- **Secondary API calls cause "failed to fetch" after apparent success** — prediction and geocoding services used raw `fetch()` while the primary routing used `fetchWithRetry`. The intermittent mobile failure pattern ("loads then errors") is almost always a secondary service call without retry/timeout.
- **Exponential backoff with jitter > fixed delay** — mobile networks recover in bursts. Fixed 2s delay can cause all retries to hit the same congestion window. `baseMs * 2^attempt + random(0, baseMs*0.5)` spreads retries naturally.
- **Route caching with 30s TTL** — eliminates redundant ORS API calls when users toggle settings or navigate back. Key: round coordinates to 5 decimals (~1m) to catch near-identical requests.
- **Non-critical services (weather) should have shorter timeouts and fewer retries** — graceful degradation beats UI blocking. Weather at 6s/1 retry vs routing at 10s/2 retries.
- **AnalyticsProvider interface pattern** — design the data contract first with a mock implementation, makes the real data switch a one-liner (`setAnalyticsProvider(new CosmosAnalyticsProvider())`). Pure SVG charts avoid adding charting library deps for simple visualizations.

### ORS Proxy — The Real Root Cause (PR #70 — Merged)
- **Never call third-party APIs directly from the browser** — PR #67 fixed retry/caching, but the fundamental problem was calling `api.openrouteservice.org` directly from client JS. This causes CORS blocks, exposes the API key in the bundle, and hits rate limits (40 req/min free tier vs 18 calls per route calculation). Server-side proxy via Azure Function eliminates all three.
- **Double caching layer (client + server) is correct** — client-side 30s TTL prevents redundant requests from re-renders/toggles. Server-side 30s TTL prevents redundant ORS calls when multiple users request similar routes. They complement each other.
- **Stale-on-error pattern** — server proxy returns stale cached data when ORS is down/slow, rather than failing. This is critical for external API dependencies where uptime is outside our control.
- **API key in `VITE_*` env vars = exposed in production** — Vite bakes all `VITE_*` vars into the client bundle. Any secret in `VITE_*` is public. Move secrets to server-side env vars read by Azure Functions.
- **After fixing symptoms (retry, caching), always verify the architecture** — PR #67 treated the symptoms (no retry on secondary calls). The disease was the direct browser→ORS call path. Both fixes were needed.
- **Session 2026-03-16 (PR #70):** Azure Function `/api/routes` proxy deployed. Requires Tank to configure `ORS_API_KEY` in Function app settings. Route loading 3x faster on mobile with new caching pattern.
