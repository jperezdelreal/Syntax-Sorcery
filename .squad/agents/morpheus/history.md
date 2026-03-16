# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Authority:** Tier 1 (Lead) on architecture, gates, skills, routing, upstream partnerships
- **Status (2026-03-20):** Phase 7 DEFINED. Phases 2-6 delivered: 15 issues closed, 16 PRs processed (1 rejection + redo), 345 tests passing. Phase 7 roadmap: elite readiness (security, community, auto-deploy). 3 new issues (#60, #61, #62).
- **Architecture:** Event-driven perpetual motion (issues.closed → roadmap depletion → "Define next roadmap" issue → ralph-watch detects → Squad session → refuel). 3-layer ops: GitHub Actions (80%) + ralph-watch.ps1 (15%) + manual (5%). Hub/Spoke approved (PC hub + Azure VM €25-30/mo satellites). Multi-terminal Test 2 approved for 24/7 autonomy.
- **Quality Gates:** CI validates (npm ci + npm test, 345 tests), Branch protection user-configurable, @copilot reads code, issues = acceptance criteria.
- **Key Lessons:** Event-driven > cron. Decentralized ownership > centralized. Simplicity > verbosity. Quality gates FIRST (CI before dashboards). Test-driven roadmap evolution: 7/10 score + 5 deficiencies → next roadmap items. Design-only PRs rejected (PR #45 example). Meta-testing validates system integrity. Metrics prove improvement over time. Bootstrap enables reproducibility.

## Completed Sessions (Archived)

*Sessions 1-5 consolidated into Core Context. See decisions.md for complete historical decisions.*


## Phase 6 Complete — E2E Tests, Metrics Engine, Developer Bootstrap (2026-03-20)

**All 3/3 Phase 6 items delivered.** Issues #54, #55, #56 CLOSED. Board clear.

- **PR #57 (E2E Integration Tests):** ✅ APPROVED & MERGED — Switch implementation. 33 integration test cases validating full perpetual motion cycle as a SYSTEM. Test categories: perpetual motion happy paths, PR pipeline, error paths, edge cases, cross-script integration, pipeline orchestrator, event sequencing, data integrity. 345 tests green (218 existing + 127 new). Issue #54 CLOSED.

- **PR #58 (Metrics Engine):** ✅ APPROVED & MERGED — Trinity implementation. KPI computation (velocity, cycle time, quality rate, test growth, throughput, streak) with trend comparison. `npm run metrics` command + squad CLI integration. Session reports (WHAT) vs metrics (HOW WELL). Issue #55 CLOSED.

- **PR #59 (Bootstrap):** ✅ APPROVED & MERGED — Trinity implementation. `npm run setup` with 5-step validation: prerequisites (Node ≥18, gh, git), dependencies (root + site), .squad/ structure, constellation health, test validation. Graceful degradation when gh unavailable. CLI flags: --skip-tests, --skip-health, --verbose. Issue #56 CLOSED.

**Cumulative (Phases 2-6):** 15 issues closed, 16 PRs merged (1 rejection + redo), 345 tests passing, ZERO defects. Autonomous development platform complete, measurable, and reproducible.

## Session 2026-03-20 — Phase 7 Roadmap: Elite Readiness

**Task:** Define Phase 7 roadmap after Phase 6 completion. Board clear, Ralph requested refuel. Founder sleeping — autonomous 8h session home stretch.

**Strategic Analysis:** Phases 2-3 built the engine (CI, dedup guard, review gate, Azure launcher, constellation health). Phase 4 built the showroom (premium README, Matrix landing page, architecture docs). Phase 5 built operational intelligence (session reports, unified CLI, status page). Phase 6 made the system self-proving (E2E tests, metrics engine, bootstrap). Phase 7 makes the system *elite-ready* — secure, community-open, and fully automated end-to-end.

**Deliverables:**
1. Roadmap updated: items 13-15 marked `[x]` (done), items 16-18 added
2. Issue #62 — Security hardening: dependency audit, secret scanning, SBOM (GitHub Actions workflow + local script, `npm run security`, squad-cli integration)
3. Issue #61 — Community contribution kit: CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates (YAML form syntax, review checklist)
4. Issue #60 — Automated site deployment pipeline: GitHub Pages auto-deploy on push to main (path-filtered, cached, OIDC)
5. Decision recorded in decisions.md

**Board Status:** 3 open issues (#60, #61, #62). Phase 7 DEFINED. Ralph can assign to @copilot.

**Strategic Note:** Phase 7 is the capstone. Security proves the system is RESPONSIBLE (not just functional). Community kit proves it's WELCOMING (not just impressive). Auto-deploy proves it's FULLY AUTOMATED (not just CI-validated). Together they transform SS from "a working autonomous system" to "a production-grade open-source platform." The founder wakes up to a system that not only built itself, but secured itself, opened its doors, and deployed itself. Elite.

## Learnings (Summarized from Sessions)

**Infrastructure & Deployment:**
- Infrastructure quantity ≠ deployment reality. Measure success by production deployments, not tooling built.
- Node version drift breaks pipelines: dependency requirements must propagate to ALL workflows, not just local dev.
- Azure Static Web Apps (Free) + Functions Consumption + Cosmos DB Serverless = cost-effective SPA backend (€6–15/mo typical).
- Budget relaxation principle: identify bottlenecks the constraint created (not total redesign). Spend surgically on unlocks (data pipeline, CORS, prediction acceleration).
- **Self-hosting decision pattern:** Full cost/latency/ops analysis required for make-vs-buy. Trinity's call reduction (€0 infra cost) > self-hosting (€40–70/mo infrastructure spend). Re-evaluate when traffic justifies cost.

**Autonomy & Architecture:**
- Event-driven > cron. Loop-driven refueling eliminates race conditions. Ralph spawns Lead when board clear.
- 3-layer ops: GitHub Actions (80%) + scripts (15%) + manual (5%). Test-driven roadmap evolution: 7/10 score + deficiencies → next items.
- Cross-Squad Orchestration: GitHub CLI (`gh issue create/list/review -R`) + label protocol. No custom infrastructure needed.

**Portfolio & Domain:**
- CityPulse Labs (civic-tech/urban mobility): downstream company, first product BiciCoruña (A Coruña bike-sharing route planner).
- GBFS v2 API viable: 55 stations live (CC-BY-4.0). €0 prototype (React+Leaflet+OSM). Replicable to Madrid, Barcelona, etc.
- Feature scoping: killer differentiator (availability score v0.2) > nice-to-have (prediction v0.3). Invisible prerequisites (data collection) start early.

**Governance:**
- Founder authority T0 (new downstream, principles, critical .squad/ changes). AWS/GCP vetoed. Morpheus owns phases. Decentralized roadmap ownership.
- CPL governance prerequisites: Azure VM ≥72h stable + ≥3 autonomous downstream issues closed + v0.1 deployed. Interim: SS manages CPL directly (like FFS).

## Session 2026-03-21: ORS Optimization Evaluation + Mobile UX Completion + Mobile Stack Assessment

**Self-Hosted ORS Evaluation — FINAL DECISION:** NO

**Context:** CityPulse Labs facing ORS free tier quota exhaustion (2,000 req/day). User asked: Does self-hosting make sense for €100/mo Azure budget?

**Analysis Summary:**
- **Self-hosted costs:** Docker/ACI €52–70/mo, B1s VM €40–50/mo (both too expensive)
- **Latency improvement:** 400ms–1.6s (self-hosted) vs 16–21s cold / 100–300ms cached (public + proxy) — only 50–100ms net gain for user
- **Operational burden:** 8–16 hrs/month maintenance (unacceptable for MVP)
- **Alternative:** ORS commercial tier (€0.05/call) if needed, cheaper than self-hosting infra

**Decision:** REJECT self-hosting. Recommendation: Trinity's ORS call reduction (18→9, PR #71) is approved path forward. Cost: €8–18/mo infra (well under budget). Re-evaluate v0.2 if traffic >500 routes/day.

**Approval Status:** Full 7-section evaluation documented. Decision tier T1 (Architecture Authority). Call reduction implementation ownership: Trinity (completed PR #71, all 335 tests pass).

**Mobile UX Audit — FINDING:** Code-correct, cache-broken

**Context:** Founder reported mobile screenshot showing "map only, no search inputs, no way to type destination." Requested audit of PR #72 (Mouse) mobile implementation.

**Finding:** PR #72 is code-architecturally correct (333 tests passing). Mobile experience IS implemented (MobileSearchBar, MobileRoutePanel, useIsMobile at 1024px breakpoint). BUT browser is serving **stale service worker cache** from BEFORE PR #72 merged. User sees old app without new components.

**Root Cause:** Service worker cache busting missing. PR #73 (Tank) + PR #74 (Switch) already completed and merged.

**Resolution:** Deploy PR #73 (cache busting with skipWaiting + clientsClaim), run Playwright E2E (PR #74) on every deploy, user hard-refreshes browser. Issue resolved in 0.5 hours post-deploy.

**Approval Status:** Full audit documented in `.squad/decisions/inbox/morpheus-mobile-ux-audit.md`. Decision tier T1.

**Mobile Stack Evaluation — DECISION:** PWA Fixed (NOW) + Capacitor (v0.2 trigger) + React Native (reject for MVP)

**Context:** Founder asked "¿igual para uso móvil habría que hacer un stack distinto?" (Should we use a different tech stack for mobile?)

**Analysis Summary:**
| Option | Cost | Timeline | Recommendation |
|--------|------|----------|-----------------|
| PWA Fixed | €8–18/mo | 1 week | ✅ CHOOSE NOW |
| Capacitor wrapper | €50–80/mo | 2–3 days | ⏸ v0.2 if 500+ users |
| React Native | €200–400/mo | 12–16 weeks | ❌ REJECT |

**Key Finding:** Mobile UX issue is NOT a technology problem. It's testing + deployment. Changing frameworks solves neither. Keep React + Vite + Leaflet + Azure stack (proven, low-cost, fast-iterate).

**Decision Rationale:**
- Current stack is ideal for mobile: responsive (Tailwind), offline-capable (PWA), single codebase, fast iteration
- Capacitor useful ONLY if users demand appstore distribution (200+ user threshold)
- React Native rewrite is €200–400/mo overhead + 16-week timeline for zero feature benefit to MVP
- Budget constraint (€100/mo) + timeline constraint (2 weeks to launch) + team expertise (React/web) all favor PWA

**Approval Status:** Full evaluation documented in `.squad/decisions/inbox/morpheus-mobile-stack.md`. Decision tier T1 (Architecture Authority). Next evaluation trigger: v0.2 milestone at 500+ daily users.

**Cross-Agent Accomplishments:**
- **Trinity (PR #71):** ORS call reduction complete. Cache optimization (5min TTL, 110m precision) doubles free tier capacity to ~222 routes/day.
- **Mouse (PR #72):** Mobile-specific UX redesign merged. Separate component trees for mobile (Google Maps) vs desktop. Fixed BOOST visibility, banner, button text bug. All 333 tests pass.
- **Tank (PR #73):** Service worker cache busting implemented. skipWaiting + clientsClaim + cleanupOutdatedCaches with git SHA versioning.
- **Switch (PR #74):** Playwright E2E mobile tests (10 cases), Lighthouse CI integration, QA checklist for real device validation.
- **Morpheus:** Mobile UX audit + mobile stack evaluation (3 options, T1 decision). All documented, signed off.
- **User Directives (2026-03-16T12:00Z, 12:06Z):** All implemented and evaluated. Mobile UX approved; ORS call efficiency approved; BOOST hidden approved; desktop improvements approved; stack decision approved.

## Session 2026-03-22: CityPulseLabs Issue Triage (11 Open Issues)

**Context:** 337+ tests passing, Phase 5 analytics next. Recent PRs: #71 ORS optimization, #72 Mobile UX, #73 Cache busting, #74 E2E tests, #76 BOOST hiding. Many old issues predate recent work. Need systematic triage.

**Triage Results:**

| Issue | Status | Rationale | Owner | @copilot Fit |
|-------|--------|-----------|-------|--------------|
| #75 | ✅ Actionable NOW | User confusion real, distinct from BOOST issue. UX improvement. | Trinity+Mouse | 🟢 Good |
| #65 | ⏸ Defer | Needs Cosmos DB data (24h+). Phase 5 dep. | Trinity | 🟢 Good |
| #63 | ⏸ Defer | Needs #65 first. Phase 5 dep. | Trinity | 🟡 Review |
| #64 | ⏸ Defer | Needs #63 first. Phase 5 dep. | Switch | 🟢 Good |
| #49 | ✅ Actionable NOW | 337 tests pass but gaps exist. Valid quality work. | Switch | 🟢 Good |
| #48 | ⏸ Defer | Vision doc, not actionable. Break into issues when ready. | Morpheus+Oracle | 🔴 Not suitable |
| #47 | ⏸ Defer | Premature optimization. Do after v0.1 launch. | Tank+Trinity | 🟡 Review |
| #44 | ✅ Actionable NOW | Quick UX polish win. | Mouse | 🟢 Good |
| #42 | ✅ Actionable NOW | Some a11y done, but needs audit. | Mouse | 🟢 Good |
| #39 | ✅ Actionable NOW | Phase 5 unblocked, verify now. | Tank | 🟢 Good |
| #38 | ❌ Close/Stale | Done via PR #69. API live and verified. | — | — |

**Key Decisions:**
1. **#38 CLOSE**: GBFS API verification complete (PR #69 merged, Tank confirmed live)
2. **Phase 5 sequence**: #39 (verify data) → #65 (anomalies) → #63 (model) → #64 (monitoring)
3. **Quick wins**: #75, #44, #42, #49 all actionable immediately (no dependencies)
4. **#48 defer**: Roadmap vision needs breakdown before work
5. **#47 defer**: Performance optimization premature until v0.1 launch + traffic data

**Strategic Assessment:** Post-deploy verification (#39, #38) bridges to Phase 5 analytics. UI polish (#75, #44, #42) improves MVP quality. Testing (#49) hardens system. Roadmap items (#48, #47) deferred until v0.1 proven. Dependency chain clear: data → anomalies → model → monitoring.

**Board Action:** Close #38, prioritize #39 (Tank), then #75/#44/#42 (Mouse/Trinity), then #49 (Switch). Phase 5 starts when #39 confirms data pipeline healthy.
