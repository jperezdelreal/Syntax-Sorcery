# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

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

### 2026-03-15T20:26Z: User Directive — README Maintenance

**By:** joperezd (via Copilot)  
**Tier:** T3 (Auto-approved)  
**Status:** ✅ ACTIVE

CityPulseLabs README must be kept current: update now with actual status, and re-update at the end of each work wave. README reflects real project state, not aspirational goals. User-driven directive.

---

See decisions-archive-2026-03-15.md for entries older than 2026-03-22.
**Last Updated:** 2026-03-20T00:00Z
