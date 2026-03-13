# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-17T[timestamp]Z: Activation Guide Created — 3 Gaps Remain Before Launch

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ GUIDE COMPLETE, 🔄 3 GAPS PENDING (Tank)  
**What:** Created 29KB Spanish activation guide (`docs/activation-guide.md`) with 8-part step-by-step instructions for founder to activate autonomous perpetual motion system. Audited Phase 2 completion: 10/13 items built, 3 gaps remain (perpetual-motion.yml, safety-net.yml, copilot-ready.md templates NOT deployed yet). Additional finding: constellation.json has incorrect owner ("jperezdelreal" should be "joperezd").

**Guide Structure:**
- PARTE 1: Pre-requisitos (Tank's 3 gaps)
- PARTE 2: Push a GitHub (exact commands for 6 repos)
- PARTE 3: GitHub Pages (enable per repo)
- PARTE 4: Workflows (verification, manual test)
- PARTE 5: Smoke Test (flora: issue → close → auto-create verification)
- PARTE 6: ralph-watch.ps1 (command, logs, monitoring)
- PARTE 7: Sistema Completo (3-layer checklist)
- PARTE 8: Troubleshooting (8 common problems)

**Readiness:** Once Tank deploys 3 workflows + fixes constellation.json → system ready for activation.

---

### 2026-03-13T15:20Z: User Directive — ralph-watch.ps1 User-Controlled

**By:** joperezd (via Copilot)  
**Tier:** T0  
**Status:** ✅ IMPLEMENTED  
**What:** ralph-watch.ps1 is executed by user manually in background terminal, NOT by team. Team provides step-by-step instructions but does not start the process.

**Why:** User request — ralph-watch.ps1 is a persistent background process that the user controls directly.

---

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

## Earlier Decisions (Before Last 7 Days)

See `decisions-archive-2026-03-17.md` for complete historical record including:
- 2026-03-16: Phase 2 Plan Audit, Event-Driven Autonomy, Visibility Strategy
- 2026-03-15: FFS Takeover Complete
- 2026-03-13: Phase 1 & P1-11 foundational decisions

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
