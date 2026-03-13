# Squad Decisions Archive — 2026-03-18

**Archived:** 2026-03-18T21-10Z by Scribe  
**Reason:** Trim decisions.md to <12KB. Entries older than 14 days (before 2026-03-04) archived here.

## Archived Entries (Pre-2026-03-04)

See `decisions-archive.md` for earlier entries (P1-01 through P1-06 and earlier Phase 1 decisions).

---

## Archived Entries (2026-03-04 through 2026-03-13)

### 2026-03-13T15:20Z: User Directive — ralph-watch.ps1 User-Controlled

**By:** joperezd (via Copilot)  
**Tier:** T0  
**Status:** ✅ IMPLEMENTED  
**What:** ralph-watch.ps1 is executed by user manually in background terminal, NOT by team. Team provides step-by-step instructions but does not start the process.

**Why:** User request — ralph-watch.ps1 is a persistent background process that the user controls directly.

---

### 2026-03-13T15:33Z: User Directive — GitHub Username Clarification

**By:** jperezdelreal (founder)  
**Tier:** T0  
**Status:** ✅ CLARIFIED  
**What:** Local PC user is "joperezd", GitHub account is "jperezdelreal". constellation.json and repos use "jperezdelreal" as owner (CORRECT). Activation guide suggestion to change to "joperezd" was erroneous.

---

### 2026-03-13T16:20Z: First Autonomous Cycle Test — PASSED

**By:** Squad Coordinator (autonomous)  
**Tier:** T1  
**Status:** ✅ VERIFIED  
**What:** Full perpetual motion cycle tested across 3 repos. @copilot created PRs, Squad reviewed/merged, issues auto-closed, perpetual-motion.yml generated roadmap issues. End-to-end: ~10 seconds. System operational.

---

### 2026-03-13T17:00Z: Evaluación del Primer Test Autónomo + Arquitectura de Monitorización

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ EVALUACIÓN COMPLETA  
**Key Points:** Test passed (7/10), 5 fixable deficiencies identified, multi-terminal architecture approved, monitoring hierarchy corrected (SS self-monitors, Squad Monitor OFF SS).

---

### 2026-03-13T19:24Z: User Directive — Azure VM Budget Approved

**By:** jperezdelreal (founder)  
**Tier:** T0  
**Status:** ✅ APPROVED  
**What:** Authorized €20-50/month Azure VM budget for satellite Squad terminals infrastructure.

---

### 2026-03-13T19:52Z: User Directive — Ralph Refueling Only Downstream

**By:** jperezdelreal (via Copilot)  
**Tier:** T0  
**Status:** ✅ DIRECTIVE  
**What:** When Ralph sees an empty board, he creates a "📋 Define next roadmap" issue (with dedup check) ONLY in downstream repos (flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor, FirstFrameStudios). SS does NOT refuel — it has its own monitoring. Validate no config conflicts before implementing.

**Why:** User request — prevents the autonomous pipeline from ever fully stopping in downstream repos.

---

### 2026-03-13T20:12Z: User Directive — No Cross-Repo Direct Commits, Issues Only

**By:** jperezdelreal (via Copilot)  
**Tier:** T0  
**Status:** ✅ DIRECTIVE  
**What:** When Ralph Go multi-terminal setup runs, SS MUST NEVER make direct git commits to downstream repos. ALL cross-repo communication MUST go through GitHub Issues. Issues are the only message bus between repos.

**Why:** Prevents git push conflicts when multiple Squad sessions run concurrently on different repos. Each repo's local Squad session owns its own git state exclusively.

**Applies to:** ALL repos — no repo commits directly to another repo's branch.

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

### 2026-03-13T20:58Z: User Directive — Merge Gates & Required Checks

**By:** joperezd (via Copilot)  
**Tier:** T0  
**Status:** ✅ DIRECTIVE  
**What:** Some repos have merge gates (branch protection rules) that prevent automatic merging. Squad agents need to handle this gracefully — if `gh pr merge` fails due to required reviews or status checks, the agent should report the blocker instead of failing silently.  
**Why:** User request — captured for team memory. Critical for autonomous operations: Ralph and agents must detect and report merge gates rather than assuming all PRs can be auto-merged.

