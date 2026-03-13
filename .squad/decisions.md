# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

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
