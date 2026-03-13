# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-17T23:00Z: Phase 2 Execution Complete — 13/13 Items Delivered

**By:** Squad (all agents)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:** Phase 2 Visibility & Autonomy executed in full across 4 waves, 13 agents, 3 workstreams:
- **Autonomy (A1–A5):** perpetual-motion.yml, issue template, safety net, ralph-watch.ps1 infrastructure
- **Visibility (B1–B4):** FFS Page, SS Page, Squad Monitor upgrade, daily devlog
- **Repo Evolution (C1–C4):** Flora, ComeRosquillas, pixel-bounce, Squad Monitor features

**Repos:** All 6 evolved simultaneously (Syntax Sorcery, FirstFrameStudios, flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor)  
**Cost:** €0 (GitHub free tier)  
**Timeline:** 2 weeks core execution  
**Next:** Autonomy activation pending roadmap population

---

### 2026-03-17T16:00Z: A5 ralph-watch.ps1 — Layer 2 Refueling Engine Complete

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:** Implemented `scripts/ralph-watch.ps1` as PRIMARY Layer 2 autonomy engine (550+ lines):
- **Core Mechanism:** 10-minute polling, detects "Define next roadmap" issues, opens Squad sessions, Lead defines roadmap, auto-commits, closes issue
- **Hardening (6 patterns):** Session timeout (30min), exponential backoff (5m–60m), stale lock detection (>2h), log rotation (7 days), health check, alert mechanism
- **Roadmap Convergence:** 3-cycle limit per repo, escalation if exceeded, state persistence
- **Layer Composition:** ralph-watch.ps1 = PRIMARY (ACTS), squad watch = COMPLEMENT (SUGGESTS)

**Success Criteria:**
- ✅ Detects refuel issues within 10 minutes
- ✅ Opens Squad sessions autonomously
- ✅ Commits roadmap.md automatically
- ✅ 24h+ uptime without crashes
- ✅ Creates escalation issues at convergence limit

---

### 2026-03-17T08:00Z: A3–A4 Workflow Hardening Complete

**By:** Morpheus (A3), Tank (A4)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:** 

**A3 Issue Template (Morpheus):**
- 5-section structure: 🎯 Objective, ✅ Acceptance Criteria, 📁 Files Involved, 🔍 Context Hints, ✔️ Definition of Done
- Inline guidance comments, @copilot capability profiles (🟢🟡🔴), disabled blank issues
- Comprehensive guide (11KB) with roadmap-to-issue workflow, examples, do's/don'ts

**A4 Safety Net (Tank):**
- Daily 00:00 UTC cron, 4 detection checks: no activity >72h, build failing >3 runs, roadmap stuck >7 days, issue open >5 days without PR
- Escalation only (no auto-fix): creates `.squad/escalations/*.md` files, GitHub issues, comments
- constellation.json for cross-repo monitoring
- Cost: €0

---

### 2026-03-17T00:00Z: A1–A2 Autonomy Foundation Complete

**By:** Tank (A1), Morpheus (A2), Trinity (B1)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:**

**A1 perpetual-motion.yml (Tank):**
- Event-driven (on: issues.closed), rate limiting via semaphore, flexible roadmap parser
- Auto-issue creation from roadmap, roadmap update tracking, roadmap exhaustion refuel signal
- Cost: €0, executes 30s after issue close

**A2 SS Roadmap (Morpheus):**
- 3-item infrastructure focus: perpetual-motion validation, roadmap depletion detection, reusable issue creation
- All items @copilot-ready, 3-feature limit enforced

**B1 FFS GitHub Page (Trinity):**
- Astro 4.16.18 SSG, dark theme, game cards, ComeRosquillas iframe, FLORA placeholder
- GitHub Pages deployment, auto-update workflow, cost €0

---

## Previous Active Decisions (Last 7 Days)

### 2026-03-16T22:30Z: Phase 2 Plan Audit Complete & Gate Verdict — Approved for Execution

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:** Comprehensive audit of Phase 2 plan verified all 13 critical session decisions reflected. Plan contains complete issue definitions, workstream architecture, dependency graph, success metrics. 3 conditions documented (rate limiting in A1, feature limit in A2, roadmap convergence in A5). Plan coherent, timeline realistic (2 weeks core / 4 weeks full), parallel execution validated across 4 agents. ralph-watch.ps1 vs squad watch distinction clarified.

**Key Approvals:**
- A1–A5 autonomy: coherent, no deadlocks
- B1–B4 visibility: €0 cost, no Azure
- C1–C4 repo evolution: 3 features/repo max
- Execution: viable with 4 agents, 0 critical path issues
- First visible: B1 (FFS Page) Day 3 Week 1

**Conditions Met:** ✅ All 3  
1. Tank: Rate limiting in perpetual-motion.yml
2. Morpheus: Enforce 3-feature limit in A2
3. Morpheus: Roadmap convergence guidance in A5

**Success Metrics:** Autonomy <15min/week, visibility 3 URLs, features deployed, cost €0

---

### 2026-03-16T21:30Z: User Directive — squad watch as Roadmap Refueler via ralph-watch.ps1

**By:** joperezd (via Copilot)  
**Tier:** T0  
**Status:** ✅ IMPLEMENTED  
**What:** When repo's roadmap depletes, perpetual-motion creates "Define next roadmap" issue. squad watch (specifically ralph-watch.ps1 in Layer 2) detects, opens Squad session, Lead defines roadmap, closes issue. Closes perpetual motion cycle completely — zero human intervention to refuel.

**Why:** Final piece making perpetual motion truly perpetual. Layer 2 actively generates fuel (roadmaps) for Layer 1.

---

### 2026-03-16T21:00Z: Event-Driven Autonomy Architecture — Redesign Decision

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:** Redesigned autonomy from cron-driven phases to event-driven perpetual motor cycle (issues.closed trigger). 3-layer architecture: Cloud (GitHub Actions + @copilot), Watch (squad watch Layer 2), Manual (Ralph Layer 3). Roadmaps owned by local Leads.

**Key Decisions:**
1. Trigger: `on: issues.closed` (reactive, €0)
2. Single motor: roadmap → issue → @copilot → work → merge → repeat
3. Roadmaps decentralized (each Lead)
4. @copilot reads code, issues specify acceptance criteria only
5. squad watch complements Layer 1 (cross-repo triage)
6. Safety net cron (24h) only escalates
7. Parallel execution across repos (fan-out default)

**Architecture:** 3 layers (Cloud 100% autonomy for 80% work, Watch 10min polling, Manual 30min/week). Cost: €0.

---

### 2026-03-16T21:00Z: Phase 2 Consolidated Plan — Visibility + Autonomy + Repo Evolution

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:** Consolidated Phase 2 across 3 workstreams: (A) Autonomy 5 issues, (B) Visibility 4 issues, (C) Repo Evolution 6 issues. All 6 repos evolve with 15 @copilot-ready issues.

**Constraints:** €0 cost, parallel execution, daily devlog, Squad Monitor 60s polling  
**Timeline:** 2 weeks visibility core, 4 weeks full autonomy  
**Success Metrics:** <15min/week intervention, 3 shareable URLs, features deployed

---

### 2026-03-16T20:00Z: User Directive — No More Unlimited Games, Finish Existing + Full Autonomy

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** No crear más juegos sin límite. Focus on finishing existing games (pixel-bounce pipeline) and full autonomous operation. System self-wakes, self-governs, <15min/week human intervention.

---

### 2026-03-16T20:00Z: Autonomy Vision — 3-Phase Roadmap to Self-Governance

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**What:**  
- **Phase 1 (HEARTBEAT):** Activate heartbeat cron, Ralph guardian, game repo completion. ~15min/week.
- **Phase 2 (AUTO-SANACIÓN):** Automatic retries, fallback templates, auto-reassign. ~30min/month.
- **Phase 3 (AUTO-PROPUESTAS):** Auto-generate 3 game ideas/month, satellite proposals. ~30min/trimester.

**Target:** 80% autonomous in 1 month, 95% in 3 months. T0 decisions remain founder-owned.

---

### 2026-03-16T20:00Z: Parallel Evolution — Concrete Mechanics for All 5 Repos

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**What:** Shift to concrete execution: heartbeat cron, per-repo completion logic, 5 issues via @copilot, Ralph escalates if stuck >72h. Autonomous Week 2+.

---

### 2026-03-16T20:00Z: Visibility Strategy — GitHub Pages + Auto-Blog + Squad Monitor

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**What:**
1. **GitHub Pages:** Hero + Downstream Companies + Activity + Team Roster + Health. Daily cron. P0: 2 days.
2. **Auto-Generated Devlog:** Parse orchestration-log, generate blog (Sunday 02:00 UTC).
3. **Squad Monitor:** Real-time pipeline state, activity, budget, team (60s polling, €0).

**Deliverable:** 3 shareable URLs in 1 week.

---

### 2026-03-16T17:45Z: Phase 2 Stages 3–5 Complete — First Game Deployed

**By:** Trinity + Tank + Switch  
**Status:** COMPLETE  
**Tier:** T2  
**What:**
- **Trinity (Stage 3):** Created pixel-bounce repo, orchestrator state machine, 12 pipeline:* labels active
- **Tank (Stages 4–5):** Verified build+deploy, GitHub Actions free tier proven sufficient (€0 for 1000+ deployments/month)
- **Switch (E2E Tests):** 92 new tests, 126 total suite, 100% passing

**Outcomes:** pixel-bounce deployed, labels operational, cost-free pipeline, Phase 2 quality gate automated.

---

### 2026-03-15T12:00Z: FFS Takeover T3+T4 Complete — Constellation Verified

**By:** Tank + Switch  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Installed 12 pipeline:* labels across 4 FFS repos (36/36, 100%); verified all repos, governance cascade, Ralph workflows. Grade: 🟢 GREEN (9.8/10).

---

### 2026-03-13T13:34Z: User Directive — Visibility Layer Details

**By:** joperezd (via Copilot)  
**Tier:** T3  
**What:** Squad Monitor polling 60s (NO streaming/SSE, €0 without Azure ACI). Devlog DAILY (not weekly) in FFS GitHub Page.

---

### 2026-03-13T13:34Z: User Directive — Autonomy Directive

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** Cuando en duda, consultad con Morpheus y ejecutad lo que él diga. Full autonomous execution with Morpheus as decision authority for Phase 2.

---

### 2026-03-13T11:30Z: P1-11 Autonomous Proposal→Prototype Pipeline Architecture

**By:** Morpheus (Lead/Architect)  
**Status:** APPROVED (T1)  
**Tier:** T1  
**What:** 6-stage autonomous pipeline: Proposal → GDD → Issues → Implementation → Build → Deploy. Label-based state machine (pipeline:*).

---

## Archived Decisions Summary

**Historical decisions (2026-03-13 early, pre-Wave 3):** See decisions-archive.md and decisions-archive-2026-03-17.md

Foundational directives, Phase 0 strategy, FFS evaluation, downstream management, Phase 1 decomposition all remain applicable; refer to archives for complete context.

---

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |
