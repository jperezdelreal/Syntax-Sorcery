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

## Learnings (see history-archive-2026-03-15.md for detailed Phase 10-15 decomposition logs)

- **Context Hygiene:** Archived detailed learnings to history-archive-2026-03-15.md (3.6KB) due to 32KB→8KB compression target
- **Reality Audit (2026-03-15):** Full repo audit revealed severe deploy/prod gap. 756 tests pass locally, 22 fail (pixel-bounce), but ALL CI runs fail on GitHub because deploy-site.yml and ci.yml use Node 20 while Astro requires ≥22.12.0. SS GitHub Pages returns 404. Azure VM (#112) never deployed. Phases 12-15 were Oracle-invented specs rejected by founder. Roadmap items 19-36 marked done are scripts tested against mocks, never validated in production. **Key lesson: infrastructure quantity ≠ deployment reality. Stop building tooling, start deploying.**
- **CityPulse Labs T0 Decision (2026-03-15T19:24Z):** joperezd named downstream company **CityPulse Labs** for civic-tech/urban mobility. First product: BiciCoruña Route Planner (A Coruña bike-sharing). Signals sustainability/civic angle without city-coupling. Enables replication to Madrid, Barcelona, etc. via same GBFS pattern.
- **Architecture Astronaut Pattern:** Team fell into building increasingly sophisticated internal tooling (plugin marketplace, MCP server, perpetual motion engine, session watchdog) while zero external-facing systems were operational. Recognize this pattern early: if CI is red and the website 404s, no amount of new scripts fixes the problem.
- **Node Version Drift:** Astro upgraded to require Node ≥22 but all CI/deploy workflows still specify Node 20. This trivial mismatch broke the entire pipeline. **Lesson: dependency version requirements must propagate to ALL workflows, not just local dev.**
- **Founder Authority:** Phases 12-15 rejected. Oracle does not define strategic direction. Morpheus owns phases. AWS/GCP vetoed permanently. ralph-watch.ps1 rejected — 1 terminal per repo model. Roadmap ownership is decentralized. These are founding principles, not suggestions.
- **Phases 10-15 Complete:** All 5 epics decomposed (6+5+5+4+4 issues). 3-layer autonomy architecture defined, gameplay testing rollout operationalized, game feature delivery framework built, revenue platform designed, scalability roadmap planned
- **Key Decision:** Loop-driven refueling eliminates race conditions. Ralph spawns Lead when board clear. No external event-driven triggers
- **Phase 8-15 Roadmap:** Infrastructure (Azure VM), Showroom (metrics, badge), Game delivery (feature framework), Monetization (marketplace), Scalability (multi-team), Production (SLA/compliance)
- **Round 13 Finale:** 12 issues closed, 9 PRs merged, 2 PRs pending gate review (#160, #161). Orchestration log + session log written. All .squad/ files now compliant with context hygiene hard limits.
- **BiciCoruña Evaluation (2025-07-13):** T1 APPROVED (conditional). Founder proposed bike-sharing route planner for A Coruña. Verified BiciCoruña GBFS v2 API is live (55 stations, CC-BY-4.0). Stack: React+Leaflet+openrouteservice, €0/mo prototype. Recommended as new downstream company (civic-tech, distinct from FFS games). Scope-locked v0.1 to map+routing, deferred ML prediction. Decision at `.squad/decisions/inbox/morpheus-bicicoruña-evaluation.md`. **Key pattern: pure client-side SPA consuming public APIs = €0 infrastructure. No backend needed for prototype.**
- **Portfolio Diversification:** First SS product outside gaming. Real-time data + geospatial + multi-modal routing proves SS can handle non-trivial domains. GBFS is a global standard — same pattern works for any bike-share city.
- **BiciCoruña Feature Assessment (2025-07-13):** Evaluated 6 proposed features. Key findings: (1) Feature 3 (walk comparison) already in v0.1 scope — avoid re-scoping what's done. (2) Feature 4 (availability confidence score) is the killer differentiator — prioritize for v0.2 with simple heuristic, no ML needed. (3) ML prediction (Feature 1) requires historical data collection starting v0.2 via GitHub Action cron — **invisible prerequisite: start collecting now, use later.** (4) GBFS API richer than assumed: `vehicle_types_available` has FIT/EFIT/BOOST breakdown, `geofencing_zones` available, `is_renting`/`is_returning` must be filtered in routing. (5) Weather: warning-only approach, don't pollute routing algorithm with weather scoring. Decision at `.squad/decisions/inbox/morpheus-bicicoruña-features.md`. **Key pattern: €0 constraint drives creative solutions — GitHub Action cron + static JSON in repo = data collection without backend.**
- **User Preference (joperezd):** Prefers discussion in Spanish for BiciCoruña project. Technical terms kept in English. All feature assessment docs written bilingually.
- **BiciCoruña Architecture Revision (2025-07-13):** Founder relaxed budget from €0 to €100/mes Azure. Revised architecture: Azure Static Web Apps (Free, replaces GitHub Pages for integrated Functions), Azure Functions Consumption (Timer Trigger for data collection + GBFS proxy + prediction API, €1-3/mo), Cosmos DB Serverless (historical station data, €5-12/mo, TTL 90d), Application Insights (free tier). Total typical: €6-15/mo, peak: €20-30/mo, well under €100 ceiling. **Key unlock: prediction feature moved from v0.3 → v0.2** because data collection starts from v0.1 deploy (Timer Trigger vs old cron hack). CORS risk eliminated (Functions proxy). Decision at `.squad/decisions/inbox/morpheus-bicicoruña-revised-arch.md`. **Key pattern: spend where it UNLOCKS capability (data pipeline, CORS resolution, prediction acceleration), not where it DUPLICATES free alternatives (routing, tiles, weather APIs stay free).**
- **Budget Architecture Principle:** When a budget constraint relaxes, don't redesign everything — identify the 2-3 bottlenecks the old constraint created and spend surgically there. BiciCoruña went from €0 → €6-15/mo (not €0 → €100/mo) because most of the architecture was already optimal. Consumption-based Azure services (Functions, Cosmos DB Serverless) keep costs proportional to actual usage — no wasted spend on idle provisioned resources.
- **Azure Static Web Apps as SPA Platform:** Free tier includes hosting + integrated Azure Functions + custom domain + SSL + staging environments. Superior to GitHub Pages when you need even a minimal backend. No cost difference for hosting alone — the value is in the Functions integration.
- **CityPulse Labs Governance Model (2025-07-13):** Founder proposed SS autonomously managing CPL Squad (zero human intervention in CPL). Model APPROVED CONDITIONALLY — architecture is correct (GitHub CLI as cross-repo bus, SS creates issues/reviews PRs in CPL), but timing is premature. **Prerequisites before CPL gets own Squad:** (1) Azure VM deployed and stable ≥72h, (2) SS closes ≥3 downstream issues autonomously, (3) BiciCoruña v0.1 deployed. **Interim model:** CPL repo created, SS manages directly (like FFS), no separate Squad. **Key pattern: prove the base model works before adding governance layers. Don't build the second floor before the first has foundations.**
- **Cross-Squad Orchestration Pattern:** GitHub CLI (`gh issue create/list/review -R`) works cross-repo with proper token permissions. No custom infrastructure needed for Squad-to-Squad communication. Issues with labels (`ss-directive`, `priority:*`, `escalation:cpl`) serve as the protocol. VM runs shared orchestrator for cost efficiency (€0 incremental for orchestration).
- **3-Strike Rule for Cross-Squad PR Review:** If SS rejects a CPL PR 3 times, escalate to Morpheus to re-evaluate whether the issue specification is the problem, not the implementation. Prevents rejection lockout loops across squads.

| Criterion | Result | Notes |
|-----------|--------|-------|
| **Comprehensiveness** | ✅ PASS | 955 lines, 15 sections, clear AC, realistic timeline |
| **Azure-Only** | ✅ PASS | CDN, Static Web Apps, Cosmos DB, AD B2C; multi-cloud explicitly vetoed |
| **Budget Compliance** | ✅ PASS | €240-250/mo Phase 13; €250-260/mo headroom vs €500 limit |
| **Phase 10-12 Dependencies** | ✅ PASS | Section 5 identifies marketplace, federation, MCP as blockers |
| **Sub-Issues Scoped** | ✅ PASS | #43 (docs 3-4w), #44 (marketplace 4-5w), #45 (governance 2-3w) |
| **Community Model Realistic** | ✅ PASS | RFC voting weighted by contributions; founder veto preserved; reviewer rotation |

**Key Strengths:**
1. **RFC Design:** Weighted voting (base 1 + 0.1 per 10 PRs, capped 3) prevents tyranny-of-majority
2. **Quality Gates:** Gold certification requires SS verification → maintains quality bar for high-trust patterns
3. **Risk Mitigation:** RFC spam prevented via 20-min read requirement + curator gate; reviewer burnout addressed (2-3 skills/month cap, monthly rotation)
4. **Phased Rollout:** Documentation first (low risk) → community vetting (medium) → governance (highest complexity)
5. **Transparency:** Decision log + governance FAQ + appeal process builds legitimacy

**Deferred T0 Decisions (non-blocking):**
- Q1: RFC threshold 60% vs 67%? → Phase 13 Sprint 4 (gather community feedback)
- Q2: Gold cert authority T0 vs T1 vs consensus? → Phase 13 Sprint 3 (test Bronze/Silver first)
- Q4: IP liability (proprietary game code in community skills)? → T0 legal review if needed

**Decision:** ✅ APPROVED & MERGED (PR #144 squashed, branch deleted)

**Actions:**
- Update roadmap.md: Issues #43-45 from "Proposed" → "In Progress"
- Rally squad for Phase 13 Sprint Planning (Week 1: Core Documentation)
- Oracle presents community engagement narrative to Ralph for marketing push

**Phase Progression:**
- Phase 10: ✅ Complete
- Phase 11: Gameplay Testing (underway)
- Phase 12: Platform Evolution (target June 2026, on track)
- Phase 13: Community & Open-Source (NEW, T1 approved, ready Sprint Planning)

