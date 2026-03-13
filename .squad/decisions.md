# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-13T20:58Z: User Directive — Merge Gates & Required Checks

**By:** joperezd (via Copilot)  
**Tier:** T0  
**Status:** ✅ DIRECTIVE  
**What:** Some repos have merge gates (branch protection rules) that prevent automatic merging. Squad agents need to handle this gracefully — if `gh pr merge` fails due to required reviews or status checks, the agent should report the blocker instead of failing silently.  
**Why:** User request — captured for team memory. Critical for autonomous operations: Ralph and agents must detect and report merge gates rather than assuming all PRs can be auto-merged.

---

### 2026-03-13T20:58Z: Decision — CI Checks Workflow

**Date:** 2026-03-13  
**By:** Switch (Tester/QA)  
**Tier:** T2  
**Issue:** #30  
**PR:** #32  

## Decision

Added `.github/workflows/ci.yml` as the first CI quality gate for Syntax Sorcery. Workflow runs `npm ci` + `npm test` on every PR and push to `master`/`main`.

## Rationale

Test 1 autonomy evaluation scored this as the **#1 critical deficiency** — PRs merged without any validation. This is the minimum viable CI gate: dependency validation + test execution.

## What's NOT included (and why)

- **ESLint:** Not configured in the project. Adding linting should be a separate issue.
- **Branch protection:** Requires admin access. Steps documented in `.squad/guides/ci-checks.md` for founder to configure.
- **Build step:** No build process exists yet. Guide documents how to add one.

## Impact

All future PRs to master/main will require 126 tests to pass before merging (once branch protection is enabled). This directly addresses the autonomy gap where @copilot PRs merged without validation.

---

### 2026-03-13T20:32Z: Hub/Spoke Azure VM Architecture — APPROVED

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED WITH CONDITIONS  
**What:** Hybrid architecture for persistent autonomous operations: Hub (PC local with Syntax Sorcery) + Spoke (Azure VM €20-50/mo with satellite Squad terminals). B2s v2 VM recommended (2vCPU, 4GB RAM, 30GB SSD, ~€25-30/mo). Terminal management via tmux, SSH communication, context reset automation.

**Key Approval Conditions:**
- Start with B2s v2 (€25-30/mo), upgrade if needed
- Test with 1 repo (flora) before scaling to 5
- Keep ralph-watch.ps1 on PC as Layer 2 fallback
- Implement systemd auto-restart on VM
- Deploy scripts before activation

**Benefits:** 24/7 autonomy (vs PC-dependent), persistent Squad sessions, context reset capability, active orchestration (SS → satélites via SSH).

**Risk Mitigation:** VM is Layer 2.5 (not critical); perpetual-motion.yml (Layer 1) and ralph-watch.ps1 (Layer 2) continue if VM fails.

---

### 2026-03-13T20:28Z: Autonomy Test Evaluation — 7/10 PASSED + Multi-Terminal Approved

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ EVALUATION COMPLETE, ARCHITECTURE APPROVED  
**What:** First autonomous cycle (perpetual motion) tested and scored 7/10. 5 deficiencies identified (CI checks, race condition, Squad Release, safety-net config, reviewer agent). Multi-terminal proposal (one terminal per repo) approved as correct decentralized model.

**Test Results:**
- ✅ 3 PRs created by @copilot, all merged
- ✅ perpetual-motion.yml triggered in 3 repos
- ✅ 3 "Define next roadmap" issues auto-created
- ✅ GitHub Pages deployed (flora + pixel-bounce)
- ✅ End-to-end cycle: ~10 seconds

**5 Deficiencies (implementation, not design):**
1. **Zero CI checks** — PRs merged without validation (RISK HIGH)
2. **flora race condition** — Issues #35 + #37 created twice
3. **ComeRosquillas Squad Release failed** — CHANGELOG.md version mismatch
4. **pixel-bounce safety-net.yml** — 0 jobs in 3 runs (workflow config error)
5. **Manual review** — Coordinator read diffs instead of spawning reviewer agent

**Monitoring Hierarchy — Corrected:**
- SS self-monitors (safety-net.yml, GitHub Actions status, .squad/ health)
- SS monitors downstream (FFS repos) via ralph-watch.ps1 + safety-net.yml + constellation.json
- Squad Monitor monitors ONLY FFS repos (NOT SS — removes circular dependency)

**Multi-Terminal Approval:**
- Decentralized ownership: One terminal per repo, local Squad session
- SS terminal = coordinator, satélite terminals = workers
- Communication via GitHub Issues (no shared state)
- Correct model for autonomous parallel execution

---

### 2026-03-13T19:24Z: User Directive — Azure VM Budget Approved

**By:** jperezdelreal (founder)  
**Tier:** T0  
**Status:** ✅ APPROVED  
**What:** Authorized €20-50/month Azure VM budget for satellite Squad terminals infrastructure.

---

### 2026-03-13T17:00Z: Evaluación del Primer Test Autónomo + Arquitectura de Monitorización

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ EVALUACIÓN COMPLETA  
**Key Points:** Test passed (7/10), 5 fixable deficiencies identified, multi-terminal architecture approved, monitoring hierarchy corrected (SS self-monitors, Squad Monitor OFF SS).

---

### 2026-03-13T16:20Z: First Autonomous Cycle Test — PASSED

**By:** Squad Coordinator (autonomous)  
**Tier:** T1  
**Status:** ✅ VERIFIED  
**What:** Full perpetual motion cycle tested across 3 repos. @copilot created PRs, Squad reviewed/merged, issues auto-closed, perpetual-motion.yml generated roadmap issues. End-to-end: ~10 seconds. System operational.

---

### 2026-03-13T15:33Z: User Directive — GitHub Username Clarification

**By:** jperezdelreal (founder)  
**Tier:** T0  
**Status:** ✅ CLARIFIED  
**What:** Local PC user is "joperezd", GitHub account is "jperezdelreal". constellation.json and repos use "jperezdelreal" as owner (CORRECT). Activation guide suggestion to change to "joperezd" was erroneous.

---

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
