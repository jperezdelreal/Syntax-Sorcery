# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-16T22:30Z: Phase 2 Plan Audit Complete & Gate Verdict — Approved for Execution

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:** Comprehensive audit of Phase 2 plan verified all 13 critical session decisions reflected. Plan contains complete issue definitions, workstream architecture, dependency graph, success metrics. 3 minor conditions documented (rate limiting in A1, feature count limit in A2, roadmap convergence guidance in A5). Plan is coherent, timeline realistic (2 weeks core / 4 weeks full), parallel execution validated across 4 agents simultaneously. Ralph-watch.ps1 clearly distinguished from squad watch. Refueling behavior correctly attributed to ralph-watch.ps1 as primary Layer 2.

**Key Approvals:**
- A1-A5 autonomy workstream: coherent, no deadlocks
- B1-B4 visibility workstream: aligned with user constraints (€0, no Azure)  
- C1-C4 repo evolution workstream: bounded scope (3 features per repo max)
- Cross-workstream integration: no conflicts, clean dependencies
- Execution parallelization: viable with 4 agents, 0 critical path issues
- First visible delivery: B1 (FFS Page) Day 3 of Week 1 → "wow factor" prioritized
- Cost target: €0 maintained across all workstreams
- Timeline: <15min/week human intervention target achievable

**Conditions for Execution:**
1. Tank: Rate limiting in perpetual-motion.yml A1 (semaphore check before creating issues)
2. Morpheus: Enforce max 3 features per repo during A2 review
3. Morpheus: Document roadmap convergence guidance in A5 (natural endpoints, avoid infinite work)

**Success Metrics:** Autonomy: <15min/week intervention, 1min issue creation latency, 80% autonomous work. Visibility: 3 shareable URLs operational. Features: C1-C3 deployed with new capabilities.

**Confidence Level:** HIGH (85%). Plan is conservative with 2-week buffer for 15 issues across parallel tracks.

---

### 2026-03-16T21:30Z: User Directive — squad watch as Roadmap Refueler via ralph-watch.ps1

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** When a repo's roadmap depletes, perpetual-motion.yml creates issue "Define next roadmap". squad watch (specifically ralph-watch.ps1 in Capa 2) detects this issue, opens Squad session in that repo, and the local Lead automatically defines the new roadmap. This closes the perpetual motion cycle completely — zero human intervention required to refuel roadmaps. ralph-watch.ps1 becomes the "refueler" that keeps roadmaps populated, eliminating the last manual synchronization step.  
**Why:** This is the final piece making the perpetual motion engine truly perpetual. Layer 2 does not just triage issues; it actively generates fuel (roadmaps) for Layer 1. Pure autonomy achieved when ralph-watch.ps1 can detect "Define next roadmap" issues and trigger Squad CLI to invoke Lead's roadmap definition.

---

### 2026-03-16T21:00Z: Event-Driven Autonomy Architecture — Redesign Decision

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:** Redesigned autonomy from cron-driven abstract phases to event-driven perpetual motor cycle (issues.closed trigger). 3-layer architecture: Cloud (GitHub Actions + @copilot), Watch (squad watch layer 2), Manual (Ralph layer 3). Roadmaps owned by local Leads. @copilot reads repo; issues need what+criteria, not how.

**Key Decisions:**
1. Primary trigger: `on: issues: types: [closed]` (reactive, not polling)
2. Single motor cycle: roadmap → issue → @copilot → work → merge → repeat
3. Roadmaps decentralized (each repo's Lead, not Oracle from SS)
4. @copilot reads code, issues specify acceptance criteria only
5. squad watch complements Layer 1 (cross-repo triage, stuck detection)
6. Safety net cron (24h) only escalates, never acts
7. Parallel execution across repos (fan-out default)

**Architecture:** 3 layers (Cloud 100% autonomy for 80% of work, Watch 10min polling, Manual 30min/week complex queue). Cost: €0 (GitHub Actions free tier).

**Success:** <15min/week human intervention, issues.closed → next issue within 1min, 80% of well-defined work autonomous.

**Impact:** All 6 repos evolve with perpetual motion. ON/OFF: populate roadmaps + enable `copilot-auto-assign` (ON) or disable (OFF).

**Implementation Timeline:** A1-A5 complete in 2 weeks (Week 1 Phase 2).

---

### 2026-03-16T21:00Z: Phase 2 Consolidated Plan — Visibility + Autonomy + Repo Evolution

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED FOR EXECUTION  
**What:**  
Create and execute consolidated Phase 2 plan across three parallel workstreams: (A) Autonomy (5 issues), (B) Visibility (4 issues), (C) Repo Evolution (6 issues). All 6 repositories evolve simultaneously with 15 specific @copilot-ready issues.

**Constraints:** €0 total cost (GitHub free tier only), parallel execution, daily devlog, Squad Monitor 60s polling (no Azure).

**Timeline:** 2 weeks for visibility core, 4 weeks for full autonomy (execution begins 2026-03-17).

**Deliverable:** `/docs/plan-phase2-visibility.md` with complete issue definitions, acceptance criteria, dependency graph, success metrics.

**Approved by:** Morpheus (T1 authority) + joperezd user directives merged.

### 2026-03-16T20:00Z: User Directive — No More Unlimited Games, Finish Existing + Full Autonomy

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** No crear más juegos sin límite. Foco en terminar los juegos existentes (pixel-bounce y los que estén en pipeline) y que todo el sistema opere de forma autónoma sin intervención humana constante. El objetivo es que los sistemas se despierten solos y se gobiernen sin que joperezd tenga que estar al teclado.  
**Why:** Vision of self-sustaining autonomous company, not infinite game factory. Quality and completion over quantity. Human intervention <15min/week for day-to-day.

### 2026-03-16T20:00Z: Autonomy Vision — 3-Phase Roadmap to Self-Governance

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** 🟡 PENDING_FOUNDER_APPROVAL  
**What:**  
- **Phase 1 (HEARTBEAT, 1 week):** Activate squad-heartbeat.yml (cron weekly), Ralph guardian mode, game repo completion triggers. Founder ~15min/week.  
- **Phase 2 (AUTO-SANACIÓN, 2 weeks):** Automatic retries (build, GDD, issues), fallback templates, auto-reassign. Founder ~30min/month.  
- **Phase 3 (AUTO-PROPUESTAS, 1 month):** Auto-generate 3 game ideas/month, satellite proposals (1 per domain), backlog analysis. Founder ~30min/trimester.  
**Target:** 80% autonomous in 1 month, 95% in 3 months. T0 decisions (new repos, budget, architecture) remain founder-owned.  
**Proof of Concept:** pixel-bounce completion autonomous in Phase 1 before scaling.

### 2026-03-16T20:00Z: Parallel Evolution — Concrete Mechanics for All 5 Repos

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** 🟡 PROPOSED  
**What:** Shift from abstract phases to concrete execution: (1) Heartbeat cron (.github/workflows/heartbeat.yml, Sunday 00:00 UTC); (2) Per-repo completion logic (e.g., deployed + 24h stable = next game); (3) 5 issues via @copilot (FFS completion criteria, 4x feature roadmaps); (4) Ralph guardian escalates if stuck >72h. Execute Mon-Fri, autonomous Week 2+.  
**Why:** User wants mechanics, not phases. Parallel execution across Flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor. Minimal keyboard time — system drives itself, user only escalations.

### 2026-03-16T20:00Z: Visibility Strategy — GitHub Pages + Auto-Blog + Squad Monitor

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** 🟡 PROPOSED  
**What:**  
1. **GitHub Pages (Astro SSG):** Hero + Downstream Companies + Recent Activity (auto-parsed from decisions.md) + Team Roster + System Health. Auto-update daily cron. **P0: 2 days.**  
2. **Auto-Generated Weekly Devlog:** Parse orchestration-log/*.md, generate blog (Sunday 02:00 UTC). Zero manual writing.  
3. **Squad Monitor Dashboard:** Azure ACI (~€10/mo), real-time pipeline state + activity + budget + team.  
**Deliverable:** 3 shareable URLs in 1 week. User requirement: show "wow moments" (playable games) to friends, not internal dashboards.

### 2026-03-16T17:45Z: Phase 2 Stages 3–5 Complete — First Game Deployed

**By:** Trinity (Full-Stack Developer) + Tank (Cloud Engineer) + Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**What:**
   - **Trinity (Stage 3: Game Repo Creation):** Created first game repository pixel-bounce from Squad template. Orchestrator state machine initialized (proposal→deployed pipeline ready). All 12 pipeline:* labels active. Game repo fully integrated with Hub via upstream.json v2.
   - **Tank (Stages 4–5: Build & Deploy Verification):** Verified build+deploy pipeline architecture. GitHub Actions (free tier, public repos, unlimited minutes) + GitHub Pages proven sufficient for Phase 2. Cost analysis confirms €0 for 1000+ deployments/month.
   - **Switch (Pipeline E2E Tests Stages 3–5):** Wrote 92 new E2E tests covering orchestrator (38 tests), build template (31 tests), deploy readiness (23 tests). Total suite now **126 tests, 100% passing**.

**Outcomes:** pixel-bounce deployed to GitHub Pages, 12 pipeline:* labels operational, build+deploy cost-free on GitHub free tier, Phase 2 quality gate automated. Phase 2 ready to scale.

### 2026-03-15T12:00Z: FFS Takeover T3+T4 Complete — Constellation Verified

**By:** Tank (Cloud Engineer) + Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Installed 12 pipeline:* labels across all 4 FFS repos (36/36, 100%); verified all repos for integrity, governance cascade, Ralph v5 workflows. Grade: 🟢 GREEN (9.8/10). FFS Takeover T1-T4 fully complete.

**Outcomes:** Constellation ready for Phase 2 game production (proposal→prototype pipeline operational). Governance enforces quality gates, skills inheritance cascades domain expertise, Ralph monitors all label transitions + pipeline health.

### 2026-03-13T13:34Z: User Directive — Visibility Layer Details

**By:** joperezd (via Copilot)  
**Tier:** T3  
**What:** Squad Monitor polling 60s es suficiente (NO streaming/SSE, €0 sin Azure ACI). Devlog DIARIO (no semanal) dentro de la GitHub Page de FFS.  
**Why:** Team works 24x7, daily devlog shows momentum. Polling sufficient for 60s refresh, eliminates Azure cost.

### 2026-03-13T13:34Z: User Directive — squad watch as Roadmap Refueler

**By:** joperezd (via Copilot)  
**What:** Cuando el roadmap de un repo se agota, perpetual-motion.yml crea una issue "Define next roadmap". ralph-watch.ps1 (Capa 2) detecta esa issue, abre sesión Squad en ese repo, y el Lead define el nuevo roadmap automáticamente. Esto cierra el ciclo completamente — zero intervención humana para rellenar roadmaps. La Capa 2 no solo triagea sino que también genera combustible (roadmaps) para la Capa 1.  
**Why:** User request — this is the final piece that makes the perpetual motion engine truly perpetual. ralph-watch.ps1 becomes the "refueler" that keeps roadmaps populated, eliminating the last manual step.

### 2026-03-16T22:30Z: Phase 2 Plan Audit Complete — 13 Session Decisions Verified

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:** Audited `docs/plan-phase2-visibility.md` against 13 critical session decisions. Found 10 decisions correctly reflected, 3 missing/unclear: (1) ralph-watch.ps1 as Layer 2 PRIMARY (not just "squad watch"), (2) squad watch as COMPLEMENT tool (distinct from ralph-watch.ps1), (3) Roadmap refueling via ralph-watch.ps1 (not squad watch). Updated plan with A5.1 (ralph-watch.ps1 implementation, 6 failure modes from ralph-hardening SKILL) and A5.2 (squad watch as complement). Fixed refueling behavior attribution throughout document (9 references updated).  
**Conditions:** 3 minor conditions documented — rate limiting in A1, 3-feature limit enforcement in A2, roadmap convergence guidance in A5.  
**Result:** Plan now reflects all 13 decisions accurately. ralph-watch.ps1 vs. squad watch distinction clear. Ready for execution.

### 2026-03-16T23:00Z: Simplification of Phase 2 Plan — Remove Over-Engineering

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**What:** Phase 2 plan grew from 400→709 lines through 4+ revisions, adding complexity instead of simplifying. Restructured to put core 4-step cycle at top (Bootstrap → Motor runs → Roadmap exhausted → Refueling), removed redundant paragraphs, reduced A5 from 125→30 lines. Result: Workstream A went from 385→180 lines, total plan 709→542 lines. Non-technical founder can now understand system in <10 minutes.  
**Key Learning:** Architect job is simplify (clarity over depth), not demonstrate technical knowledge through verbosity. Detailed specs (timeouts, log rotation, backoff) belong in task descriptions, not architecture overview.

### 2026-03-13T11:30Z: P1-11 Autonomous Proposal→Prototype Pipeline Architecture

**By:** Morpheus (Lead/Architect)  
**Status:** APPROVED (T1)  
**Tier:** T1  
**What:** 6-stage autonomous pipeline: Proposal → GDD → Issues → Game Implementation → Build → GitHub Pages Deploy. Label-based state machine (pipeline:*) for Ralph monitoring.  
**Why:** Phase 1 requires fully autonomous game production without human intervention. GDD generation via @copilot eliminates Azure cost; GitHub Actions handles all orchestration.

## Archived Decisions Summary

**Historical decisions (2026-03-13 early, pre-Wave 3):** See decisions-archive.md and decisions-archive-2026-03-15.md

Foundational directives, Phase 0 strategy, FFS evaluation, downstream management, Phase 1 decomposition all remain applicable; refer to archives for complete historical context.

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |
