# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-25T18:20Z: Bootstrap Autónomo desde Cero en Azure VM — R&D v2 (PIVOTE)

**By:** Morpheus (Lead/Architect)  
**Tier:** T0 (Requiere aprobación del fundador)  
**Status:** 🔬 R&D PROPOSAL v2 — Awaiting founder decision

**v1 RECHAZADA por fundador.** Razón: "No usar repos existentes. Empezar de CERO. Crear repo, Squad, producto — todo nuevo. ¿Puede el sistema bootstrappearse a sí mismo?"

**Pregunta central v2:** ¿Puede Copilot CLI, headless en Azure VM, crear un repo, inicializar Squad, definir un producto, y construirlo autónomamente — todo desde cero?

**Cambio fundamental:** La VM no es un servidor-granja — es una FÁBRICA de empresas.

**Key Components:**
- **Bootstrap sequence:** Template repo → `gh repo create --template` → pre-seed `.squad/` → Copilot CLI en Team Mode → Ralph loop
- **Squad bootstrapping:** Pre-seed (Opción A) para R&D-1. Template repo (`squad-template`) con `.github/agents/squad.agent.md` v0.8.25 + estructura .squad/ base
- **1M context window:** Si disponible, sesiones de DÍAS (no 6h). Watchdog dinámico basado en calidad, no timer fijo. Rate limits (50-80/h) se convierten en bottleneck real
- **Credential flow:** PAT joperezd (`repo`, `workflow`, `read:org`) + Azure SP para deployments
- **Producto R&D-1:** Micro-app simple (TimeBox, QuoteForge, o similar) — el pipeline importa, no el producto
- **Rollout:** 4 fases (R&D-1 a R&D-4), €26 total en 4 semanas

**Success Criteria R&D-1:** Repo creado ✅, Squad inicializado ✅, ≥3 issues cerrados sin intervención ✅, CI green ✅, sesión estable ≥12h ✅. Stretch: app desplegada en Azure SWA.

**Recommendation:** Aprobar R&D-1 (€2.40, 48h). Si Copilot CLI funciona headless → la fábrica es viable. Si no → investigar alternativas.

**Full proposal:** `.squad/decisions/inbox/morpheus-multi-squad-rd.md`

---

### 2026-03-24T00:00Z: BOLD Product Proposals — FORJA, AUTONOMO.AI, CAMBIAZO

**By:** Morpheus (Lead/Architect)  
**Tier:** T0 (Requires founder approval)  
**Status:** 📋 PROPOSAL — Awaiting visceral reaction

Three product proposals targeting real pain points, leveraging SS's proven autonomous system:

1. **FORJA** (€99-999 one-shot + €299/mo subs): Software construction service. "Describe your app in 3 paragraphs → 48h later: production-ready repo with 150+ tests, CI/CD, deployed PWA, docs." Target: founders, startups, agencies. Moat: 629+ tests, proven system nobody else has.

2. **AUTONOMO.AI** (€19-39/mo): AI gestoría (accounting) for Spain's 3.7M autonomos. Reads bank, categorizes expenses, prepares IVA models, answers tax questions in 10 seconds. Regulatory moat: VeriFactu migration (July 2027) = forced demand. Revenue: €500 users Pro × €19 = €9.5K/mo in 6 months.

3. **CAMBIAZO** (€99 one-shot or €29/mo): Transform old websites into modern, responsive designs. User provides URL → AI crawls → generates clean version → deploys. Lead gen via free preview. Viral via before/after content. Revenue: 50 transformations/month × €99 = €4.95K/mo.

**Comparative Analysis:** FORJA (€10-20K/year, dev-focused, 3-4 week MVP) vs AUTONOMO.AI (€20-50K/year, regulatory moat, 5-6 week MVP) vs CAMBIAZO (€10-15K/year, viral potential, 4-5 week MVP). All fit within €500 infra budget.

**Morpheus Recommendation:** Pick FORJA (most authentic to SS). If time allows, aggressive sequence: FORJA (April) → CAMBIAZO (May) → AUTONOMO.AI (June).

---

### 2026-03-24T00:00Z: Three New Downstream Projects — CostaPulse, AccesoPulse, RutaViva

**By:** Morpheus (Lead/Architect)  
**Tier:** T0 (Founder decision required)  
**Status:** 📋 PROPOSAL — Awaiting approval

Three products within €500/mo infra budget, building on proven patterns (CityPulseLabs, FirstFrameStudios).

1. **AccesoPulse** (MVP 3-4 weeks, €10-20/mo): WCAG 2.2 + EAA compliance SaaS. Scan any site → audit report + continuous monitoring. Demanda obligada (EAA enters force 28 June 2025). Revenue: 50 customers × €29/mo = €1.45K/mo.

2. **CostaPulse** (MVP 5-6 weeks, €8-18/mo): Real-time coastal info (tides, waves, water quality, UV, wind, alerts) for Spain's 8,000 km coastline. B2C freemium + B2B (tourism offices). Revenue: €50K/mo potential (500 towns × €100/mo).

3. **RutaViva** (MVP 6-8 weeks, €10-20/mo): AI-curated walking routes for historic cities. User picks city + interests (history, gastronomy, architecture) + time → optimized route offline. B2C freemium + B2B tourism + affiliations. Revenue: 0.01% of 85M tourists/year × €3/route = €25K/year conservative.

**Total Infra:** €41-91/mo (vs €500 budget). **Sequence:** AccesoPulse (April) → CostaPulse (May, pre-summer) → RutaViva (June).

**Morpheus Recommendation:** All 3 approved. Regulatory deadline (EAA) and seasonal timing (beach summer, tourism) justify priority order.

---

### 2026-03-16T18:15Z: User Directive — Multi-Squad Architecture

**By:** joperezd (via Copilot)  
**Tier:** T3 (User directive)  
**Status:** 🔬 R&D INITIATION

Next evolution: SS (this Squad) operates its own downstream Squad on Azure VM. Not 24/7 autonomous (quality not yet there), but inter-squad orchestration: one Squad directing another Squad. Explore Squad-to-Squad communication as the next frontier after proven autonomous single-squad.

---

### 2026-03-16T16:12Z: User Directive — Downstream Repo Placement

**By:** joperezd (via Copilot)  
**Tier:** T3 (User directive)  
**Status:** ✅ ENFORCED

Downstream repos (CityPulseLabs, beneficial-bar, etc.) must NEVER be cloned inside Syntax Sorcery. Always clone to sibling directories under `GitHub Repos/`. Prevents gitlink nesting, dirty git state.

---

### 2026-03-16T15:25Z: Mobile UX Fixes 3-5 Implementation Complete

**By:** Mouse & Switch (UI/UX Designer & Tester)  
**Tier:** T2 (Implementation)  
**Status:** ✅ COMPLETE

**Fixes Implemented:**
1. **Fix 3 (GeolocationButton z-index):** Repositioned to z-50 + bottom-32, always visible above bottom sheet
2. **Fix 4 (isDragging feedback):** DragHandle shows visual feedback (opacity + cursor + highlight) while dragging
3. **Fix 5 (WelcomeCTA loading state):** Hidden during route calculation, shows peek bar with "X rutas disponibles" instead

**Test Coverage:**
- 335 → 356 tests (+21 new)
- Mobile E2E tests: iPhone 12 (390×844), Pixel 5 (360×640), Desktop regression
- All deterministic (no flaky timeouts)
- Playwright E2E validates Fixes 1-5 end-to-end
- Lighthouse mobile ≥80 enforced in CI

**Files Modified:**
- `GeolocationButton.tsx`, `DragHandle.tsx`, `MobileRoutePanel.tsx`
- 7 files touched, no breaking changes
- All z-index values documented (stacking context)

**Impact:**
- Mobile UX now at Google Maps industry standard
- All 5 fixes integrated and tested
- Ready for user review on real device
- Production deployment unblocked

**Decision:** Approved. Proceed to Phase 5 analytics implementation (Trinity).

---

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

### 2026-03-16T12:00Z: ORS Route Proxy via Azure Function

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** PR #70 — Merged. Configuration pending.

**Context:** PR #67 fixed retry logic, caching, and parallelization — but routes still failed in production. Root cause: frontend called `api.openrouteservice.org` directly from the browser.

**Problems with Direct Browser → ORS:**
1. CORS — ORS doesn't whitelist our Azure SWA domain
2. API key exposure — `VITE_ORS_API_KEY` baked into client JS bundle
3. Rate limiting — 18 API calls per route calculation vs 40 req/min free tier
4. Mobile unreliability — direct external API calls slower and more timeout-prone

**Decision:** Route all ORS calls through Azure Function proxy at `/api/routes`:
- Server-side `ORS_API_KEY` (never in client bundle)
- Server-side 30s cache with stale-on-error fallback
- Frontend calls `/api/routes` instead of ORS directly
- Removed `VITE_ORS_API_KEY` from CI build

**Action Required:** Tank must add `ORS_API_KEY` to Azure Function app settings:
```bash
az functionapp config appsettings set --name func-citypulse-api --resource-group rg-citypulse --settings ORS_API_KEY=<key>
```

**Impact:**
- Eliminates CORS, rate limiting, and API key exposure
- Double caching (client 30s + server 30s) reduces ORS calls significantly
- Cost impact: negligible (Azure Functions Consumption pricing)
- All 368 tests pass, both builds clean

---

### 2026-03-20T14:30Z: ORS Call Reduction (v0.1) — Trinity Implementation Complete

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ APPROVED & MERGED — PR #71

**Context:** ORS free tier (2,000 req/day) exhausted. Morpheus evaluation recommended reducing from 18→9 calls per route.

**Implementation:**
- Candidate pairs: 6 → 3 (top 2 pickups × 1 dropoff)
- Route options displayed: 3 → 2 (users rarely pick 3rd)
- Cache TTL: 30s → 5 minutes (quota-aware)
- Cache precision: 5 decimals (~1m) → 3 decimals (~110m, acceptable for bike-share)
- Quota-aware error: `QuotaExhaustedError` on 429 with Spanish message

**Impact:**
- Free tier capacity doubled: ~222 routes/day (was ~111)
- Cache hit rate dramatically increased
- All 335 tests passing
- Production-ready

**Files Changed:** `src/services/routeEngine.ts`, `src/services/routing.ts`, `api/src/functions/routes.ts`, `tests/unit/routeEngine.test.ts`

**Trade-offs Accepted:**
- 2 routes instead of 3 — acceptable for MVP (users rarely pick 3rd)
- 110m cache precision — fine for bike-share (users walk to stations anyway)
- 5-min cache TTL — road network stable, ORS data refresh not critical

---

### 2026-03-20T14:30Z: Mobile-Specific UX Redesign — Mouse Implementation Complete

**By:** Mouse (UI/UX Designer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ APPROVED & MERGED — PR #72

**Context:** User directive (Spanish): "Móvil tiene sus propios códigos" — mobile needs separate design, not responsive adaptation. Also: hide BOOST/Turbo, fix desktop banner, fix button text bug.

**Implementation:**
- Separate component trees via `useIsMobile()` hook — NOT responsive breakpoints
- Mobile: floating search (Google Maps pattern) + bottom sheet results + full-screen map
- Desktop: side panel + header bar (preserved, user approved)
- BOOST/Turbo hidden (not available in network)
- Desktop banner redesigned (clean white, no gradient)
- Button text bug fixed (CSS cascade issue)

**Mobile-specific features:**
- Touch targets ≥48px everywhere
- Swipe gestures (up/down) to expand/collapse bottom sheet
- 16px font on inputs (prevents iOS auto-zoom)
- Safe-area-inset support (notch/gesture bar awareness)
- Overscroll containment (prevents scroll-through to map)

**Impact:**
- 821 lines added, 170 removed across 9 files
- All 333 tests passing
- Industry-standard UX (Google Maps, Apple Maps, Uber pattern)

**Files Changed:** `src/hooks/useIsMobile.ts`, `src/components/SearchBar/MobileSearchBar.tsx`, `src/components/RoutePanel/MobileRoutePanel.tsx`, `src/App.tsx` (separate trees), `src/components/BikeTypeSelector.tsx` (BOOST hidden), `src/components/Header.tsx` (redesigned)

**Learnings:**
- Users perceive responsive design as "broken" even if technically functional
- Separate component trees > responsive classes for fundamentally different paradigms
- 16px minimum font on mobile inputs is non-negotiable (iOS Safari auto-zoom)
- Tailwind v4 CSS cascade: parent `text-white` bleeds into children

---

### 2026-03-21T12:30Z: Mobile Testing Strategy — 3-Tier Stack for Production Readiness

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ EVALUATED & APPROVED — Implementation assigned (Tank, Switch)

**Problem:** PR #72 (Mobile UX) merged with passing unit tests but failed in production:
- Touch event capture broken (first tap caught, subsequent taps missed)
- Service worker cache stale (BOOST/Turbo still visible after deploy)
- Mobile smoothness not production-grade

**Root Cause:** Autonomous agents cannot test visual rendering or mobile interactions without headless browser automation + human QA.

**Recommendation: 3-Tier Stack (€0, 10 hours)**

1. **Tier 1 (Critical):** Service worker cache busting via workbox versioning + git SHA
   - Owner: Tank
   - Time: 2 hours
   - Deliverable: PR #73 — cache invalidation on deploy (skipWaiting, clientsClaim, cleanupOutdatedCaches)
   - Status: ✅ MERGED

2. **Tier 2 (Automated):** Playwright E2E mobile tests in CI
   - Owner: Switch
   - Time: 6 hours
   - Deliverables: `.github/workflows/e2e-mobile.yml`, 10 test cases (touch events, layouts, button reachability), Lighthouse ≥80
   - Devices: iPhone 12 (390×844), Android Pixel 5 (360×640), Desktop Chrome regression
   - Status: ✅ MERGED (PR #74)

3. **Tier 3 (Human-in-Loop):** Mobile QA checklist + PR template integration
   - Owner: Switch
   - Time: 2 hours
   - Deliverable: `.github/MOBILE_QA_CHECKLIST.md` (10-point checklist for real device testing)
   - Approval gate: Founder signs off before merge (real device validation)
   - Status: ✅ MERGED (PR #74)

**Key Decisions:**
- Service worker cache busting must be FIRST (prerequisite for all testing)
- Playwright E2E (CI automation) + QA checklist (human expertise) = 85%+ confidence
- Visual regression testing (BackstopJS) deferred to Phase 8 (premature now)
- Lighthouse CI as complement (accessibility + performance monitoring)

---

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |

---

### 2026-03-25T18:45Z: iTranvías Integration Feasibility Evaluation

**By:** Morpheus (Lead/Architect)  
**Tier:** T0 (Strategic initiative)  
**Status:** ✅ COMPLETE EVALUATION — Ready for Founder Decision

**RECOMMENDATION: GO** — Add iTranvías bus data to CityPulse Labs via ORS public-transport profile OR (preferably) hybrid ORS+OTP approach.

**Path A (ORS):** €50–70/mo additional, 27 hrs, experimental profile  
**Path B (OpenTripPlanner):** €250–500/mo, 30 hrs, production-grade multimodal  
**Path C (Hybrid, Recommended):** €145–205/mo OTP + ORS fallback, 50 hrs, low-risk future-proof  

**Key Findings:**
- GTFS data publicly available (Spain NAP, CC-BY-4.0 license)
- Real-time APIs community reverse-engineered (fragile, defer to v0.2)
- Multimodal value high (bus+bike routes, killer feature)
- Cost: €58–88/mo (Path A stays under €100/mo budget, tight fit)
- Risk: Medium (ORS experimental) vs Low (OTP proven, Path C fallback)

**Gating Decision:** Awaits founder approval on budget (€40–70/mo increase).

**Full Analysis:** `.squad/decisions/inbox/morpheus-itranvias-evaluation.md` (380 lines)

---

### 2026-03-25T18:20Z: Bootstrap Autónomo desde Cero en Azure VM — R&D v2 (PIVOTE)

**By:** Morpheus (Lead/Architect)  
**Tier:** T0 (Founder approval required)  
**Status:** 🔬 R&D PROPOSAL v2 — Awaiting founder decision

**Previous v1 REJECTED.** Reason: "Don't use existing repos. Start ZERO. Can the system bootstrap itself?"

**v2 Central Question:** Can Copilot CLI headless on Azure VM create a GitHub repo, initialize Squad, define a product, and build it autonomously — all from scratch?

**Key Shift:** VM is not a server farm — it's a COMPANY FACTORY.

**Bootstrap Sequence:**
1. Pre-seed `.squad/` structure (Opcion A: eliminates Init Mode interactivity)
2. Template repo (`squad-template`) with Squad v0.8.25 base + `.squad/` pre-config
3. 1M context window: Sessions can run DAYS (watchdog dynamic, not fixed 6h)
4. Rate limits (50-80/h) become real bottleneck vs context exhaustion
5. Ralph loop: Auto-close issues, auto-PR → infinitely

**Success Criteria (R&D-1):**
- ≥3 issues closed autonomously ✅
- CI green ✅
- Session stable ≥12h ✅
- Stretch: App deployed to Azure SWA ✅

**R&D Timeline (4 phases, €26 total, 4 weeks):**
- R&D-1: 48h VM (€2.40) — proof of concept
- R&D-2: 1 week (€8) — first sprint complete
- R&D-3: 2nd repo bootstrap (€8) — template validation
- R&D-4: 3 products parallel (€8) — factory operational

**Risks & Mitigations:**
- Copilot CLI headless viability → R&D-1 validates first
- Init Mode interactivity → Pre-seed eliminates this
- Rate limit sufficiency → 50-80/h adequate for 1 session

**Product for R&D-1:** Micro-app trivial (TimeBox, QuoteForge, QuotePDF) — pipeline matters, not product.

**If Successful:** SS transforms from "autonomous dev company" → "company that MANUFACTURES autonomous dev companies."

**Full Proposal:** `.squad/decisions/inbox/morpheus-multi-squad-rd.md` (433 lines)

---

### 2026-03-20T14:30Z: OTP Migration Evaluation — Corrected Analysis

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ RESEARCH COMPLETE — Decision ready

**Previous Error Corrected:** ORS does NOT have public-transport profile. Recommendation was wrong.

**True Finding:** iTranvías GTFS publicly available. OpenTripPlanner is correct multimodal engine.

**Top Recommendation: Path C (Hybrid)** — Keep ORS for walk/bike (free, proven), add OTP for multimodal expansion (~€150-200/mo).

**Path Comparison:**
- **Path A (ORS only):** €0/mo, no transit, insufficient
- **Path B (Full OTP):** €145-205/mo, complete solution, risk (unfamiliar stack)
- **Path C (Hybrid):** €145-205/mo, multimodal + ORS fallback, LOW RISK (proven safety net)

**Phase 1 (OTP Deployment):** 50h — OSM/GTFS setup, Azure VM, OTP proxy, testing, docs  
**Phase 2 (BiciCoruña GBFS):** 15h — Bike-share integration, live availability  
**Phase 3 (Real-Time Transit):** 20h optional — GTFS-RT, prediction predictions

**Test Impact:** 390+ tests adapt, no breaking changes. Extend to 450+ tests (+20h).

**Cost-Benefit:** Strategic investment (opens transit market segment). ROI depends on product roadmap.

**Full Analysis:** `.squad/decisions/inbox/morpheus-otp-migration.md` (479 lines)

---

### 2026-03-27: Mobile Bottom Sheet Scroll Fix Pattern

**By:** Mouse (UI/UX Designer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED — PR #83

**Pattern for Mobile Bottom Sheet Scrolling:**

1. Use explicit `height` (not `max-height`) on fixed container
2. Add `min-h-0` to scrollable flex children (flexbox default blocks scrolling)
3. Add `overflow-hidden` to outer container

**Impact:** Fixes CityPulseLabs MobileRoutePanel scroll bug. 390 tests passing, 0 type errors. Reusable pattern for all future bottom sheets.

---

### 2026-03-25: BiciCoruña Feature Proposals — v0.5+ Roadmap

**By:** Oracle (Product & Docs)  
**Tier:** T0 (Founder decision)  
**Status:** 📋 PROPOSAL — Awaiting team/founder review

**12 Feature Proposals Categorized:**

**Quick Wins (€0, 1-2 days):**
1. Rutas Favoritas (save frequent routes)
2. Notificaciones de Disponibilidad (push alerts)
3. Mapa de Calor Histórico (occupancy heatmap by hour)
4. Modo Oscuro

**Medium (€2-5/mo, 1-2 weeks):**
5. Puntos de Interés (pharmacies, ATMs on route)
6. Altimetría de Ruta (elevation profiles)
7. Compartir Ruta (shareable unique links)
8. Modo Turista (scenic routing)
9. Incidencias Reportadas (crowdsourced incident reports)

**Ambitious (€13-30/mo, 3-4 weeks):**
10. Ghost Booking / Reserva Virtual
11. ALSA/Tranvía Multimodal Integration
12. Gamificación Sostenible (badges, leaderboards, CO₂)

**Competitive Moat:** Features #3, #8, #9 differentiate vs Google/Citymapper — historical heatmaps, scenic routing, community QA.

**Recommended Sequence:** Quick Wins → Medium features (v0.5) → Ambitious (post-PMF with 500+ weekly actives).

**Decision Required:** Approve roadmap prioritization for CityPulseLabs downstream company.

---

### 2026-03-25: GitHub Copilot SDK — Research Findings & Recommendations

**By:** Oracle (Product & Docs)  
**Tier:** T0 (Requires founder approval for Phases 2+)  
**Status:** 📋 PROPOSAL — Awaiting founder review

**What:** GitHub Copilot SDK (public preview April 2026) — Multi-language (Node.js, Python, Go, .NET, Java) API to embed Copilot's agentic engine into any app.

**Top 5 Opportunities (Ranked):**

1. 🥇 **Copilot Extensions as a Service (FORJA)** — €2K-10K/project, 20M Copilot users market, nobody productizes this yet, HIGH POTENTIAL
2. 🥈 **SDK as Headless Runtime for Squad** — Solves R&D v2 blockers (programmatic control vs interactive CLI, parallel sessions, BYOK rate limits)
3. 🥉 **Niche Extensions for Marketplace** — Early-mover positioning (`@accesibilidad-eaa`, `@autonomo-es`, late 2026 marketplace monetization)
4. **SDK Brain for CAMBIAZO/AUTONOMO.AI** — Evaluate when products in development
5. **SDK Consulting** — Bridge revenue, not scalable, not autonomous-first

**Recommendation:** Approve Phase 1 immediately (€0, 1 week) — install SDK, hello world, connect existing MCP, document findings.

**Phases 2-4:** Depend on Phase 1 results + R&D v2/FORJA alignment decisions.

**Full Report:** `docs/research/copilot-sdk-research.md` (24KB, 7 sections) — Competitive analysis, pricing, code examples, phased implementation plan.

**Cost:** Phase 1 (exploration): €0. SDK billing: counts against premium requests (300/mo Pro, $0.04/extra).

---

### 2026-03-17T14:20Z: CPL Route Service Diagnosis — Fix Applied

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ ROUTES FIXED — Data pipeline needs Tank

**Root Causes Identified & Fixed:**

1. **503 "Route service not configured"** → ORS_API_KEY set on standalone function app, not on SWA. Moved to SWA app settings.
2. **Variable name mismatch** → VITE_ORS_API_KEY (client prefix) vs ORS_API_KEY (server-side). Fixed env name.

**Fixes Applied:**
- Set ORS_API_KEY on SWA app settings ✅
- Redeployed SWA managed API ✅
- Routes return 200 with GeoJSON ✅
- Health returns 200 ✅

**Still Broken (Tank Action Required):**
1. Standalone function app container in restart loop (404 on all endpoints)
2. stationCollector timer DOWN since ~midnight 2026-03-17 (no Cosmos writes)
3. deploy-functions.yml OIDC secrets missing (AZURE_CLIENT_ID, TENANT_ID, SUBSCRIPTION_ID never configured)

**Architecture Note:** CPL API has two layers — SWA managed API (HTTP, takes precedence) and standalone function app (linked backend, timers only). Env vars must be set on correct resource.

---

### 2026-03-26: Real Prediction Model Implementation

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ PR #84 opened — Awaiting review

**Context:** Phase 5 analytics required real Cosmos DB-backed services replacing mock implementations. Switch had written 116 contract tests with inline reference implementations. predict function already queries Cosmos.

**Implementation:**

1. **predictionAccuracy.ts** — MAE, RMSE, bias, accuracy alerts (32 tests, Issue #64)
2. **anomalyDetection.ts** — Stale, empty, full, offline detection (27 tests, Issue #65)
3. **analytics.ts** — Hourly aggregation, demand, peak hours (26 tests, Issue #62)
4. **predictionModel.ts** — Train model, confidence scoring, prediction (31 tests, Issue #63)
5. **analytics Azure Function** — `/api/analytics` endpoint (7-day Cosmos data query)
6. **CosmosAnalyticsProvider** — Default dashboard provider (replaces MockAnalyticsProvider)

**Key Decisions:**
- Pure functions receive data arrays, return results (no Cosmos in service modules) → testable without infrastructure mocking
- CosmosAnalyticsProvider + mock fallback → Dashboard always shows data
- 7-day query window → Balances freshness vs cost
- Exact contract match → Correctness first

**Impact:** 390 tests pass. 116 contract tests now import from real modules. Analytics dashboard serves real Cosmos data.

**Dependencies:** stationCollector timer running (Cosmos data), SWA deployment includes analytics function, no new npm deps.

---

See decisions-archive-2026-03-16T16-39-09.md for entries from 2026-03-15 and earlier.  
**Last Updated:** 2026-03-27T19:00Z
