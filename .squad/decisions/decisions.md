# Squad Decisions — Master Log

**Last Updated:** 2026-03-15T19:46Z  
**Merge:** 16 inbox files consolidated → this file  
**Archive:** entries >7 days to decisions-archive.md

---

## Governance Tiers

| Tier | Authority | Scope |
|------|-----------|-------|
| **T0** | joperezd (Founder) | New downstreams, principle changes, critical .squad/ structure |
| **T1** | Morpheus (Lead) | Architecture, gates, skills, ceremonies, routing |
| **T2** | Agent (advisory) | Implementation, tests, docs |
| **T3** | Auto-approved | Scribe ops, history, logs |

---

## Active Decisions (Merged 2026-03-15)

### 1. T0 Decision: CityPulse Labs Execution Model

**By:** joperezd | **Date:** 2026-03-15T19:34Z  
**Status:** ✅ APPROVED

Syntax Sorcery builds CityPulse Labs (BiciCoruña) directly in v0.1–v0.3 without intermediate Squad. Autonomous governance model (SS managing CPL Squad) approved conditional on prerequisites: (1) Azure VM operational, (2) ≥3 autonomous issues closed downstream, (3) v0.1 deployed.

---

### 2. T1 Decision: SS→CPL Governance Model (Morpheus Evaluation)

**By:** Morpheus | **Date:** 2026-03-15 | **Tier:** T1 | **Status:** 🟡 APPROVED CONDITIONAL

**Verdict:** Model is architecturally correct & technically viable (GitHub CLI cross-repo bus), but timing premature. SS infrastructure gaps:
- Azure VM (issue #112) — weeks overdue
- CI pipeline broken (Node 20 vs Astro ≥22)
- Zero autonomous features delivered to downstream (FFS)

**Recommended 3-Phase Plan:**

| Phase | Duration | Objective | Gate |
|-------|----------|-----------|------|
| **Fase 0** | 2–3 wks | Proof of Concept with FFS | Deploy VM, fix CI, deliver 1 feature autonomously |
| **Fase 1** | Immediate | CPL Repo (no Squad) | Trinity v0.1, SS manages directly (FFS pattern) |
| **Fase 2** | Post Fase 0 | CPL Squad with Orchestrator | SS→CPL via GitHub Issues, 30min polling |

**Key Risk Mitigations:**
- **3-strike rule:** PR rejections trigger spec re-evaluation
- **UP-FRONT architecture:** CPL executes within SS-defined framework
- **Acceptable latency:** 30min polling fine for prototype (not production)
- **Cost:** €6–15/mo incremental (shared VM)

**Condition:** Architecture approved as long-term objective. Fase 2 implementation blocked until Fase 0 prerequisites met.

---

### 3. T2 Advisory: Knowledge Audit & Skills Gaps (Oracle)

**By:** Oracle | **Date:** 2026-03-22 | **Status:** ✅ COMPLETE

**Audit Results:** 27 existing skills reviewed. 3 critical awesome-* repos identified (must read pre-coding):

| Repo | Stars | Time | Critical For |
|------|-------|------|--------------|
| awesome-react | 72K⭐ | 2h | Hooks, Suspense, patterns |
| awesome-azure-architecture | 1.6K⭐ | 1.5h | Static Web Apps, Functions, cost |
| awesome-leaflet | 28⭐ | 1h | Routing, clustering, geospatial |

**Skills Gaps (Pre-v0.1):**
1. Azure Static Web Apps + Functions deployment (30m to create)
2. React + Leaflet geospatial components (45m) — **critical, product is 100% map**
3. Timer-triggered data collection pattern (45m) — v0.2 historical availability
4. Vitest + react-testing-library for maps (optional, post-v0.1)

**Outcome:** Create 3 skills before v0.1 coding. Squad plugins not ready for publication (ecosystem immature).

---

### 4. T2 Result: Plugin Installation (Oracle)

**By:** Oracle | **Date:** 2025-03-19 | **Status:** ✅ COMPLETE

**Installed:** 9 skills from 3 awesome-copilot marketplace plugins:

| Plugin | Skills (4) | Size |
|--------|-----------|------|
| **azure-cloud-development** | az-cost-optimize, azure-pricing, azure-resource-health-diagnose, import-infrastructure-as-code | 54 KB |
| **frontend-web-dev** | playwright-explore-website, playwright-generate-test | 2 KB |
| **testing-automation** | ai-prompt-engineering-safety-review, csharp-nunit, java-junit | 16 KB |

Skills growth: 25→34 (+36%). Adoptable immediately; 12 agent templates available for reference (not installed to preserve charters).

---

### 5–14. Operational Directives (@copilot, 2026-03-15T09:22Z–10:32Z)

9 brief templated directives captured:
- BiciCoruña viability & budget relaxation (€0→€100/mo)
- CityPulse Labs naming (T0)
- Team assignments (Trinity/Tank/Switch/Oracle)
- Architecture revision triggers
- Feature roadmap (v0.1–v0.3)

**Status:** Integrated into Morpheus evaluation. Directives archived.

---

### 15. SS Direction Deep Audit (Morpheus)

**By:** Morpheus | **Status:** ✅ COMPLETE

Capability assessment: SS infrastructure gaps (Azure VM, GitHub Pages, CI) + downstream autonomy readiness (mid-tier: can execute, cannot yet govern). **Implication:** FFS pattern proven, CPL governance premature (validates Fase 0 recommendation).

---

### 16. Cross-Decision Audit & Responses (Morpheus)

**By:** Morpheus | **Status:** ✅ COMPLETE

Validated dependencies:
- Knowledge audit (#3) → 3 skills to create
- Plugins (#4) → 9 ready-made skills complement gaps
- Governance (#2) → Requires infrastructure + FFS proof before CPL Squad
- All decisions coherent & sequenced properly

---

### 17. T2 Result: Leaflet Map Z-Index Stacking Context (Mouse)

**By:** Mouse | **Date:** 2025-01 | **Status:** ✅ IMPLEMENTED (PR #77)

**Problem:** Search bar invisible on mobile in CityPulseLabs due to Leaflet's internal z-indexes (200, 400, 600) competing globally with search bar z-index (40). Root cause: `<main>` element had `position: relative` but no `z-index`, failing to create CSS stacking context.

**Solution:** Added `z-[1]` to main container to isolate Leaflet layers within a stacking context, constraining internal z-indexes and elevating search bar above map.

**Outcome:** Search bar visible, 21 new MobileRoutePanel tests, 356 tests passing, 9/9 Google Maps alignment targets met. PR #77 open (CityPulseLabs).

**Key Learning:** Wrap third-party map libraries in stacking context; reserve z-[1]–z-[10] for layout containers, z-[40]–z-[50] for floating UI.

---

## Immediate Action Items

| Priority | Action | Owner | Gate | Duration |
|----------|--------|-------|------|----------|
| 1 | Read awesome-react + awesome-leaflet | Trinity | v0.1 coding | 3h |
| 2 | Read awesome-azure-architecture | Tank | v0.1 coding | 1.5h |
| 3 | Create 3 skills (Azure SWA, React-Leaflet, Timer Trigger) | Trinity/Tank | v0.1 coding | 2h parallel |
| 4 | Deploy Azure VM (issue #112) | Tank | Fase 0 | ~2h |
| 5 | Fix SS CI (Node 20→22) | Morpheus/Tank | Fase 0 | ~10min |
| 6 | Create CityPulse Labs repo | joperezd/Morpheus | Parallel | 5min |
| 7 | v0.1 development starts | Trinity | Post gates | 2–3 wks |

---

### 18. T1 Decision: Creative SDK + Work IQ Project Ideas (Oracle)

**By:** Oracle (Product & Docs) | **Date:** 2026-07-10 | **Tier:** T1 | **Status:** 🟡 PENDING REVIEW

**Strategic Insight:** The intersection **CODE × CONTEXT** (code intelligence from Copilot SDK + workplace intelligence from Work IQ) is an unoccupied market position.

**Top 3 Recommendations:**
1. **NEXUS** — Context-aware PRs referencing meeting decisions & stakeholder emails. Revenue: $5K–25K/yr/company.
2. **CENTINELA** — EU AI Act compliance-as-code agent. Revenue: $10K–50K/yr. Urgency: Aug 2026 enforcement deadline.
3. **PULSO** — DevEx analytics crossing GitHub metrics + M365 calendar/meeting data. Revenue: $3K–15K/yr/team.

**Quick Wins (1 week each):** StandupZero, HERMES, CHRONO, ARCHIVO VIVO

**Decisions Needed:** Select 1–2 ideas for PoC; prioritize vendible products vs internal SS improvements; validate Work IQ MCP access.

**Deliverable:** `docs/research/copilot-sdk-creative-projects.md` — 20 ideas, matrix, next steps.

---

### 19. T1 Decision: SDK + Work IQ Architecture — Adopt Automated Bridge Pattern (Morpheus)

**By:** Morpheus (Lead/Architect) | **Date:** 2026-07-09 | **Tier:** T1 | **Status:** 📋 PROPOSED

**Verdict:** Adopt **Patrón B (Automated Bridge)** as foundational infrastructure for Copilot SDK + MCP + Work IQ (M365) integration.

**Architecture Choices:**
- **Event-driven** (not interactive) — eliminates ~5.6s latency problem
- **MCP as integration layer** — `mcp-m365` encapsulates Graph API auth & data sensitivity
- **Serverless** (Azure Functions + Event Grid) — €41–71/mo incremental cost (within €500/mo budget)
- **Auth encapsulation** — each MCP server handles own auth (GitHub PAT vs MSAL)
- **No M365 persistence** — process in-memory only

**Priority Investment:**
1. `mcp-m365` server (5 tools: emails, docs, calendar, teams, people) — HIGH
2. Event bridge handlers (PR→Teams, Release→SharePoint) — MEDIUM
3. SDK orchestrator for complex decisions — LOW

**Implementation Estimate:** €41–71/mo, 2–5 weeks phased.

**Deliverable:** `docs/research/copilot-sdk-workiq-architecture.md` — full analysis.

---

## Metrics

| Metric | Value |
|--------|-------|
| Decisions merged today | 18 |
| T0 decisions | 1 |
| T1 decisions | 4 |
| T2 recommendations | 2 |
| Inbox files processed | 2 |
| Skills to create | 3 |
| Total skills available | 34 |
| Risk flags (mitigated) | 1 |

---

**Last Updated:** 2026-07-10T21:00Z  

See decisions-archive.md for entries >7 days old.
