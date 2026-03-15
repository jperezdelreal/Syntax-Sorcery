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

## Metrics

| Metric | Value |
|--------|-------|
| Decisions merged today | 16 |
| T0 decisions | 1 |
| T1 decisions | 2 |
| T2 recommendations | 2 |
| Inbox files processed | 16 |
| Skills to create | 3 |
| Total skills available | 34 |
| Risk flags (mitigated) | 1 |

---

See decisions-archive.md for entries >7 days old.
