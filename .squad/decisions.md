# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-13T11:03Z: User Directive — Budget Scope Clarification

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** €500/mo Azure-only budget. GitHub (Actions, Pages, repos, Issues, Copilot) is unlimited — zero cost constraints.  
**Why:** Removes false conservatism about GitHub-based automation. Cost Alerting (GHA free tier), GDD Parser (GHA workflows), Ralph (GHA + Discord) all €0.

### 2026-03-13T11:25Z: User Directive — SS Context Hygiene Expectation

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** Syntax Sorcery must not suffer from context hygiene problems. As a software engineering company, limits must be maintained automatically, not as manual effort.  
**Why:** Foundational expectation — SS must exemplify automated context management, not replicate downstream company problems. Hygiene must be systemic, not a task.  
**Implication:** Scribe role and .squad/ structure embedded for permanent, autonomous maintenance.

### 2026-03-13T12:09Z: User Directive — Phase 2 Focus Scope

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** No preocuparse por escalabilidad a 5+ juegos ni múltiples proyectos downstream por ahora. Foco exclusivo en Phase 2 con FFS como único downstream. Ejecutar el plan de Morpheus tal cual.  
**Why:** User request — captured for team memory.

### 2026-03-13T12:26Z: User Directive — Morpheus Leads, Ralph Awaits Approval

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** No activar Ralph ni ejecutar trabajo que Morpheus no haya aprobado o solicitado. Morpheus lidera — el equipo sigue su plan. "Modo autopilot" se refiere al modo del GH CLI, no a Ralph.  
**Why:** User request — captured for team memory.

### 2026-03-13T11:30Z: P1-11 Autonomous Proposal→Prototype Pipeline Architecture

**By:** Morpheus (Lead/Architect)  
**Status:** APPROVED (T1)  
**Tier:** T1  
**What:** 6-stage autonomous pipeline: Proposal → GDD (via @copilot) → GitHub Issues → Game Implementation → Build → GitHub Pages Deploy. Label-based state machine (`pipeline:*`) for Ralph monitoring. Per-game repository model with all pipeline logic in Syntax-Sorcery repo.  
**Why:** Phase 1 requires fully autonomous game production without human intervention. GDD generation via @copilot eliminates Azure cost; GitHub Actions handles all orchestration. Extends existing GDD→Issue pipeline (P1-10b).  
**Key Constraints:** Works for any game type, zero human input proposal→deployed, GitHub-unlimited (no Azure spend for pipeline), independent testability per stage.  
**Risks:** @copilot GDD/implementation quality (mitigated: validation gates + Trinity fallback), cross-repo orchestration (mitigated: gh CLI + repository_dispatch).  
**Artifacts:** docs/proposal-to-prototype.md, 12 implementation subtasks (Trinity Wave A→D, ~20 hours).  
**Dependencies:** Requires P1-10a (GDD Template ✅), P1-10b (GDD→Issues ✅), P1-08 (Ralph v5 ✅).

### 2026-03-16: Phase 2 Round 2 — FFS Satellite PRs Resolved

**By:** Morpheus (Lead/Architect) + Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T1  
**What:** Successfully resolved 6 FFS satellite PR merge conflicts (ComeRosquillas #29/#30, ffs-squad-monitor #27/#28/#29/#32). All PRs merged. Conflict types: .squad/decisions.md overlaps (append-only, non-destructive), .squad/history.md updates (sequential writes). Game features (Ghost AI, difficulty system, backend API extraction, tests, docs) all production-ready.  
**Outcomes:** 9 total FFS satellite PRs merged this session (3 from T2, 6 conflict-resolved). All game repos health-checked. T2 Feature Work pipeline cleaner. CI hardened with per-type size limits (history.md 8KB, decisions.md 12KB, others per SKILL). 34 tests green.  
**Why:** Satellites have feature-rich development. Conflicts are expected (append-only .squad/ changes), low-risk, resolvable. Manual resolution enables Phase 2 feature velocity.  
**Next:** Morpheus determines Phase 2 Round 3 priority (Flora features, pipeline stages 3-5, visibility remediation, or new initiatives).

### 2026-03-15: Phase 2 Test Matrix & Quality Gate

**By:** Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Established Phase 2 game acceptance test matrix (docs/phase2-test-matrix.md). Defines pass/fail for all 6 pipeline stages, 25-item quality checklist, CI integration, 3-tier grading (🟢 Ship / 🟡 Fix First / 🔴 Reject). Installed vitest with 34 unit tests (validate-proposal.js 13 tests, gdd-to-issues.js 21 tests). Refactored scripts for testability (non-breaking).  
**Why:** Phase 2 requires autonomous game production. Formal quality gate prevents untested game shipment. Unit tests catch regressions in critical pipeline scripts.  
**Impact:** `npm test` runs vitest (34 tests, all green). `npm run test:validate-squad` preserves old validation. Scripts refactored for testability, backward-compatible.  
**Risks:** vitest globals mode (CommonJS compat) — should verify in GHA workflows.

### 2026-03-16: CI Size Check — Per-Type Limits Enforced

**By:** Tank (Cloud Engineer)  
**Tier:** T2  
**Status:** COMPLETE  
**What:** Updated `squad-size-check.yml` from generic 15KB limit to per-type limits (history.md 8KB, decisions.md 12KB, charter.md 15KB, orchestration-log 2KB, log 1KB, any other 25KB). Proactive warnings at SKILL thresholds (6KB/10KB/12KB/15KB). Total .squad/ 100KB limit preserved.  
**Why:** P1-13 self-audit found CI not enforcing SKILL-defined limits. PRs could pass while violating hygiene rules. Now CI is automated enforcement gate per founder directive.

### 2026-03-13: E2E Pipeline Test — Stages 0–2 Validated

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** First end-to-end test of Proposal→Prototype pipeline (Stages 0–2). All 5 pipeline scripts pass with "Pixel Bounce" test proposal. Validation ✅, GDD generation ✅ (10 sections), issue parsing ✅ (26 issues), orchestrator ✅, label creation ✅. Zero bugs. Full report at docs/e2e-pipeline-test-report.md.  
**Outcomes:** Stages 0–2 production-ready. CLI interfaces documented (--file vs --proposal inconsistency noted but functional). Template-based GDD is structural scaffold; @copilot GDD via GHA workflow provides creative content. Pipeline state machine tracks all 6 stages correctly.  
**Next:** Stages 3–5 (game repo creation, @copilot implementation, build/deploy) require cross-repo orchestration and game repo template activation.

### 2026-03-15: FFS Takeover T2 — Satellite Cascade Complete

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Executed Phase T2 (Satellite Cascade) of FFS Takeover: merged 3 pre-approved triage sync PRs (ComeRosquillas #27, Flora #29, ffs-squad-monitor #30); upgraded upstream.json v1→v2 on all satellites (ComeRosquillas #32, Flora #30, ffs-squad-monitor #33); verified satellite health post-cascade; assessed T3 readiness.  
**Outcomes:** All 3 satellites now have squad-triage.yml synced with Hub, upstream.json v2 formalized (FFS as upstream, skills-inherit model, governance non-override, domain-local). Satellites healthy (.squad/ intact, governance active). T3 readiness: BLOCKER identified — game repos lack `pipeline:*` labels (12 labels required per P1-11 spec). Non-blocking: 4 open PRs on ComeRosquillas (features), 6 on ffs-squad-monitor (UX/docs/tests).  
**Why:** Formal upstream/downstream governance enables automated skills inheritance, governance enforcement, domain specialization. T3 will activate proposal→prototype pipelines on game repos.  
**Next:** Morpheus execute T3 (install pipeline:* labels); Ralph monitors pipelines once labels deployed.

### 2026-03-15T12:00Z: FFS Takeover T3+T4 Complete — Constellation Verified

**By:** Tank (Cloud Engineer) + Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Executed Phase T3 (Pipeline Labels) + T4 (Full Constellation Verification) of FFS Takeover:  
  - **T3 (Tank):** Installed 12 pipeline:* labels (proposal→gdd→issues→implementation→build→deployed + 6 failure states) across Hub + 3 satellites (36/36, 100%). State machine complete, Ralph monitoring enabled.
  - **T4 (Switch):** Verified all 4 FFS repos (Hub + ComeRosquillas + Flora + ffs-squad-monitor). Chain integrity confirmed (SS → Hub → 3 Satellites), upstream.json v2 on all repos, governance cascade operational, Ralph v5 workflows active. 10 open PRs (all post-takeover feature work, no governance conflicts). Grade: 🟢 GREEN (9.8/10).

**Outcomes:**  
  - FFS Takeover T1-T4 fully complete and verified.
  - Constellation ready for Phase 2 game production (proposal→prototype pipeline operational).
  - Governance enforces quality gates across all 4 repos, skills inheritance cascades domain expertise.
  - Ralph monitors all label state transitions + pipeline health.

**Why:** Formal takeover verification ensures governance stability, identifies no residual conflicts, confirms infrastructure (labels, workflows, upstream chain) operational. Phase 2 readiness green.

**Next:** Teams proceed to Phase 2. Ralph autonomous monitoring active. Scribe logs/archives decisions per orchestration requirements.

**See `decisions-archive-2026-03-15.md` for Phase 1 entries (P1-07 through P1-14, archived 2026-03-15T12:00Z)**

### 2026-03-16T17:45Z: Phase 2 Stages 3–5 Complete — First Game Deployed

**By:** Trinity (Full-Stack Developer) + Tank (Cloud Engineer) + Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**What:**
   - **Trinity (Stage 3: Game Repo Creation):** Created first game repository `pixel-bounce` from Squad template. Orchestrator state machine initialized (proposal→deployed pipeline ready). All 12 pipeline:* labels active. Game repo fully integrated with Hub via upstream.json v2.
   - **Tank (Stages 4–5: Build & Deploy Verification):** Verified build+deploy pipeline architecture. GitHub Actions (free tier, public repos, unlimited minutes) + GitHub Pages proven sufficient for Phase 2. Cost analysis confirms €0 for 1000+ deployments/month. Tested build workflow (npm install, build, test), deploy workflow (GHA Pages native deploy). HTML5 Canvas games (<5MB each) fit easily within 1GB GitHub Pages limit per repo.
   - **Switch (Pipeline E2E Tests Stages 3–5):** Wrote 92 new E2E tests covering orchestrator (38 tests), build template (31 tests), deploy readiness (23 tests). Total suite now **126 tests, 100% passing**. Full pipeline coverage Stages 0–5 complete.

**Outcomes:**
   - `pixel-bounce` game repository deployed to GitHub Pages (live at jperezdelreal.github.io/pixel-bounce).
   - 12 pipeline:* labels on FFS constellation + satellite repos (fully operational).
   - Build+deploy pipeline verified cost-free on GitHub free tier.
   - Pipeline E2E test suite complete (126 tests, 0 failures). Phase 2 quality gate automated.

**Why:** Phase 2 requires fully autonomous game production (Proposal→Deployed). Stages 0–2 (parsing/GDD/issues) were proven in Wave 3. Stages 3–5 (game creation/build/deploy) are now operationalized with live game, cost verification, and comprehensive test coverage. Phase 2 ready to scale.

**Next:** Morpheus directs Phase 2 priorities (additional games, feature work, downstream governance). Proposal→prototype pipeline fully autonomous. Ralph monitoring active on all 4 FFS repos + game repos.

## Archived Decisions Summary

**Historical decisions (2026-03-13 early, pre-Wave 3):** See decisions-archive.md

- Foundational directives (minimal human intervention, autonomy, context hygiene)
- Phase 0 strategy & architectural decisions  
- FFS evaluation & governance swap
- Downstream management framework
- Phase 1 decomposition (14 work items, 5 waves)
- All T0 founder directives on autonomy, ownership, visibility priorities

These remain applicable; refer to archive for complete historical context.

## Governance

| Tier | Authority | Scope | Examples |
|------|-----------|-------|----------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes | Adding FFS, changing autonomy model |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing | New agent roles, gate criteria, routing rules |
| T2 | Agent authority | Implementation details, test strategies, doc updates | Code patterns, test plans, README edits |
| T3 | Auto-approved | Scribe ops, history updates, log entries | Session logs, history.md appends, orchestration logs |
