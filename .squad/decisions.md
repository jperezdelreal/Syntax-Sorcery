# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-16T10:43:54Z: User Directive — Unify Origin/Destination with Route Panel

**By:** joperezd (via Copilot)  
**Tier:** T3 (User directive)  
**Status:** ✅ IMPLEMENTED

Unify "Donde estas / Donde vas" form with route info panel into single Google Maps-style experience. Clicking map should auto-fill origin/destination fields. Mobile UX must feel closer to Google Maps. Desktop is good — mobile needs major improvement.

**Outcome:** PR #68 (Mouse) implemented UnifiedPanel.tsx with bottom sheet pattern, map click → form fill, and retry UX. All 218+ tests passing. Mobile now follows industry standard (Google Maps, Apple Maps, Uber).

---

### 2026-03-16T10:44:09Z: User Clarification — "Failed to Fetch" Not Mobile-Only

**By:** joperezd (via Copilot)  
**Tier:** T3 (User directive)  
**Status:** ✅ RESOLVED

"Failed to fetch" errors and slow route loading happen on ALL platforms, not just mobile. This is a service/network issue (API timeouts, CORS, external API reliability), not a mobile-specific rendering problem.

**Outcome:** PR #67 (Trinity) identified root cause: secondary API calls lacked retry/timeout logic. Fixed via exponential backoff, AbortController, and parallel batching. 3x mobile speedup achieved via ORS parallelization.

---

### 2026-03-15T19:25Z: BiciCoruña Viability & Architecture — New Downstream Company

**By:** Morpheus (Lead/Architect) + joperezd (Founder directives)  
**Tier:** T1 (Architecture Authority + T0 naming)  
**Status:** ✅ APPROVED (Conditional) — Product approved, downstream named, architecture revised

**What:** Founder proposed BiciCoruña — bike-sharing route planner for A Coruña using live GBFS v2 API. Morpheus evaluated viability (APPROVED), assessed 6 features with v0.1–v0.3 roadmap, revised architecture when budget relaxed from €0 to €100/mes Azure.

**Key Decisions:**
1. **New downstream company:** **CityPulse Labs** (T0 decision, founder-named) for civic-tech/urban mobility
2. **Product viability:** ✅ YES — GBFS API live (55 stations, CC-BY-4.0), multi-modal routing proven, €0 prototype achievable
3. **v0.1 scope:** Map + live stations + multi-modal routing (walk→bike→walk) + top 3 routes + GitHub Pages (€0)
4. **v0.2 priority:** Availability confidence score (🟢🟡🔴 heuristic) — killer differentiator. Start historical data collection via GitHub Action cron (invisible prerequisite for prediction)
5. **v0.3 unlock:** Availability prediction using v0.2 historical data
6. **Architecture upgrade:** €0 → €6–15/mo Azure typical (Static Web Apps Free + Functions Consumption €1–3/mo + Cosmos DB Serverless €5–12/mo + Application Insights free). Moves data collection from cron+JSON hack to Timer Trigger+Cosmos. Unlocks prediction in v0.2 instead of v0.3. Eliminates CORS workarounds.
7. **Budget directive:** joperezd confirmed €100/mes max Azure budget (overrides €0 constraint)
8. **Team assignment:** Trinity (frontend React+Leaflet), Tank (Azure infra), Switch (routing tests), Oracle (docs)

**Feature Assessment Summary:**
- Feature 1 (ML prediction): v0.3 (requires historical data)
- Feature 2 (Weather warning): v0.2 (Open-Meteo, warning-only, don't score routes by rain)
- Feature 3 (Walk comparison): v0.1 ✅ already locked
- Feature 4 (Availability score): v0.2 (heuristic on current availability, high value)
- Feature 5 (CO₂/calorie stats): v0.2 (trivial, feel-good)
- Feature 6 (Real-world focus): Foundational principle, already active

**Strategic Value:** Diversifies SS portfolio beyond games. Proves autonomous AI dev on non-trivial domain (real-time API, geospatial routing). GBFS is global standard — same pattern works for Madrid, Barcelona, etc.

**Cost Breakdown:** €0 frontend (React+Leaflet+OSM free) + €6–15/mo backend (Azure), total €6–15/mo typical, €100/mo ceiling

**Files:** `morpheus-bicicoruña-evaluation.md`, `morpheus-bicicoruña-features.md`, `morpheus-bicicoruña-revised-arch.md`, `copilot-directive-bicicoruña-budget.md`, `copilot-directive-citypulse-name.md`

**Next Steps:** Create CityPulse Labs repo, Trinity begins v0.1 React implementation, Tank deploys Static Web Apps + Functions, Switch writes route tests, data collection Timer Trigger operational before v0.2.

---

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ COMPLETE — All 6 workstream items operational

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |

### 2026-03-15T19:59Z: User Directive — Reference Sources

**By:** joperezd (via Copilot)  
**Tier:** T3 (Auto-approved)  
**Status:** ✅ ACTIVE

Founder proactively shares resources (awesome-azd, awesome-copilot marketplace, blogs, prior repos). Team must remember and apply when relevant. Known sources: Azure/awesome-azd (React+SWA+Functions+Cosmos templates), 54 Copilot plugins, prior session resources.

---

### 2026-03-15T20:08Z: CityPulse Labs v0.1 — GitHub Issues Decomposition

**By:** Morpheus (Lead/Architect) via Copilot  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ COMPLETE

Created 9 labels + 7 actionable GitHub issues in jperezdelreal/CityPulseLabs (renamed from bici-coruna). Issues: #1 Scaffolding (Trinity), #2 Azure Infra (Tank), #3 GBFS Service, #4 Map, #5 Routing, #6 Data Pipeline, #7 CI/CD. Wave 1: #1+#2 parallel. All tagged v0.1. Dependency graph documented.

---

### 2026-03-20T00:00Z: BiciCoruña Full Roadmap Issues Created

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ COMPLETE

Created all remaining GitHub issues for the BiciCoruña roadmap (v0.2, v0.3, and cross-cutting) in `jperezdelreal/CityPulseLabs`. Labels `v0.2` and `v0.3` created. Total: 12 new issues added to the existing 7 v0.1 issues.

**Issues Created:**
- v0.2 (6 issues): #8 Confidence score, #9 Basic prediction, #10 Bike type filtering, #11 Rain warning, #12 Route stats, #13 Geofencing
- v0.3 (4 issues): #14 Enhanced prediction, #15 Predictive confidence, #17 FIT vs EFIT routing, #18 PWA
- Cross-cutting (2 issues): #19 README, #20 UI/UX design

**Full roadmap:** 19 issues across v0.1–v0.3 with dependency graph. All issues have descriptions, acceptance criteria, and dependency references. Issue #16 skipped by GitHub.

---

### 2026-03-16T11:20Z: Azure Functions Deployment — Phase 5 Unblocked

**By:** Tank (Cloud Engineer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ COMPLETE

Deployed 5 Azure Functions to `func-citypulse-api`: health, stations, weather, predict, stationCollector (timer). Fixed EasyAuth 401 blocker, wired App Insights, configured CORS for SWA. Timer triggers every 5 minutes → ~22,752 Cosmos writes/day.

**Key Decisions:**
1. **EasyAuth disabled** — Was blocking all unauthenticated requests. Disabled for public API.
2. **Timer @ 5-min intervals** — Balances freshness vs cost (within serverless budget)
3. **Managed Identity for Cosmos** — Uses ManagedIdentityCredential, no connection strings
4. **CI/CD via OIDC** — Created deploy-functions.yml (awaiting secrets: AZURE_CLIENT_ID, TENANT_ID, SUBSCRIPTION_ID)
5. **Azure Monitor alert** — Fires if zero function executions in 15-minute window (missing data detection)

**Cost Impact:** €2-5/mo functions + €5-12/mo Cosmos = €8-18/mo total, well under €100/mo budget.

**Outcome:** PR #69 merged. API endpoints live. Data pipeline active. Phase 5 unblocked.

---

### 2026-03-16T12:00Z: CityPulseLabs Mobile UX — Unified Panel Pattern (Updated)

**By:** Mouse (UI/UX Designer)  
**Tier:** T2 (Implementation detail)  
**Status:** ✅ COMPLETE

Google Maps-style unified bottom sheet pattern: search bar + route results + station info combined into one cohesive panel. Implements user request to make mobile experience "closer to Google Maps".

**Key Changes:**
- Unified bottom sheet (collapsed 76px peek → expanded 75vh) with swipe gestures
- Map click auto-fills origin/destination fields
- Retry buttons in error states for flaky API recovery
- Shimmer skeleton loading (perception of speed without new dependencies)
- Desktop side panel preserved (user said it "looks great")

**Impact:** PR #68 merged. 681 lines added, 73 removed. All 218+ tests passing.

---

### 2026-03-16T12:00Z: Mobile Fixes + Phase 5 Skeleton (Trinity)

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ COMPLETE

Three major moves: (1) Root cause of "failed to fetch" — secondary API calls lacked retry/timeout. (2) Route caching with 30s TTL + coordinate rounding. (3) Phase 5 analytics skeleton via AnalyticsProvider interface.

**Key Changes:**
1. **fetchWithRetry upgraded** — Exponential backoff with jitter, external AbortSignal support
2. **Route caching** — 50-entry max, 30s TTL, 5-decimal coordinate rounding (~1m)
3. **Analytics dashboard skeleton** — AnalyticsProvider interface + mock implementation, pure SVG charts
4. **Tiered timeouts** — Weather 6s/1retry, Prediction 8s/2retry, ORS 10s/2retry (graceful degradation)

**Impact:** ORS API parallelization achieves 3x mobile speedup. AnalyticsProvider allows Tank to plug real Cosmos data with one-liner. PR #67 merged. All 252+ tests passing.

---

### 2026-03-16T12:00Z: Phase 5 Contract Tests (Switch)

**By:** Switch (Tester/QA)  
**Tier:** T2 (Test Strategy)  
**Status:** ✅ COMPLETE

116 contract-first tests for Phase 5 features across 4 suites: predictionAccuracy (32), anomalyDetection (27), analytics (26), predictionModel (31). Consumer-driven contracts define what Trinity must build.

**Key Pattern:**
- Inline reference implementations define contracts
- When Trinity builds Phase 5, she swaps stubs for real imports
- Tests validate her implementation without modification
- Zero new dependencies; all existing 252+ tests remain green

**Impact:** Trinity now has exact spec for 116 test cases across all Phase 5 domains. PR #66 merged.

---

### 2026-03-15T20:26Z: User Directive — README Maintenance

**By:** joperezd (via Copilot)  
**Tier:** T3 (Auto-approved)  
**Status:** ✅ ACTIVE

CityPulseLabs README must be kept current: update now with actual status, and re-update at the end of each work wave. README reflects real project state, not aspirational goals. User-driven directive.

---

See decisions-archive-2026-03-15.md for entries older than 2026-03-22.
**Last Updated:** 2026-03-16T11:24:11Z
