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

### 2026-03-13T11:30Z: User Directive — Morpheus Leads FFS Takeover

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** Morpheus is the Lead and decides takeover strategy for total FFS (hub + all repos: FirstFrameStudios, ComeRosquillas, Flora, ffs-squad-monitor) governance. Coordinator follows Morpheus's instructions without second-guessing.  
**Why:** User clarification — Lead owns strategy. Coordinator executes, doesn't question.  
**Implication:** Morpheus T1 authority on all FFS integration decisions.

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

### 2026-03-14: P1-07 Skills Cherry-Pick Complete

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**What:** Cherry-picked 16 domain-agnostic FFS skills into SS. Adapted 6 (removed game refs), direct-copied 10. Skipped 4 game-specific. SS total: 20 skills, all <15KB. upstream.json ready on FFS PR #197.  
**Why:** Skills reuse is primary ROI of upstream/downstream model. FFS's 21 weeks of operational wisdom inherited into SS without game baggage.

### 2026-03-14: P1-09 Cost Alerting System — Azure Budget Protection

**By:** Tank (Cloud Engineer)  
**Status:** COMPLETE  
**What:** Three-tier cost alerts (€400→P1, €450→P0, €480→auto-kill) via GitHub Actions + Azure CLI. Proactive overspend projection. Dry-run mode. Zero Azure cost.  
**Why:** €500/mo budget is hard constraint. Early alerts + auto-remediation prevent overspend incidents. GHA option eliminates Azure Monitor cost.  
**Activation:** Requires AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID secrets.

### 2026-03-14: P1-10a GDD Template Specification — Machine-Executable Spec

**By:** Oracle (Product & Docs)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Finalized GDD template (YAML frontmatter + 10 markdown sections) + Trinity's parsing specification. YAML controls priority/labels. Validated vs Flora GDD (37 issues). No ambiguity.  
**Why:** GDD→Issue pipeline (P1-10b) needs executable spec. Prevents per-GDD custom logic. Enables scale to 100s of games.  
**Artifacts:** docs/gdd-template.md, docs/gdd-issue-mapping.md

### 2026-03-14: P1-10b GDD→Issue Autonomous Pipeline — Fully Automated Issue Generation

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Built Node.js parser + GitHub Actions workflow for fully autonomous GDD→GitHub Issues conversion. Script parses YAML frontmatter + 10 GDD sections, generates complete issue tree per Oracle's spec. Dry-run mode for safe testing. Tested with "Chrono Tiles" game (31 issues generated correctly with auto labels/priorities). js-yaml added as dependency.  
**Why:** Pipeline eliminates manual issue creation, enables GDD-driven development, scales to 100s of games. Zero cost (GHA). Unblocks P1-10c (GDD submission gate) and P1-12 (integration testing).  
**Constraints Respected:** No hardcoded game logic. Design Pillars correctly skipped. GitHub Actions unlimited budget. Zero Azure cost.  
**Artifacts:** scripts/gdd-to-issues.js, .github/workflows/gdd-to-issues.yml, docs/gdds/examples/test-game.md

### 2026-03-14: P1-14 FFS Visibility Audit — Showcase Remediation Roadmap

**By:** Oracle (Product & Docs)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Comprehensive audit of GitHub Pages, blog, game playability. Grade: 🟡 AMBER (60%). ComeRosquillas playable but not discoverable. FLORA no web build. Blog inactive. Missing "Play Games" page. 7 P0/P1 blockers identified. Remediation: 8–12 hrs (Trinity owner).  
**Why:** Founder requires games visible+playable+impressive. Current state blocks requirement 1 (playability proof) and 2 (visibility).  
**Next:** Trinity remediation this week (before Phase 1 close-out).

### 2026-03-15: P1-12 FFS Integration Testing Report

**By:** Switch (Tester/QA)  
**Status:** 🟡 AMBER — 3 PASS, 4 WARNING, 0 FAIL  
**Tier:** T2  
**What:** Comprehensive integration test of Phase 1 deliverables against FFS main branch. Skills cherry-pick (P1-07) ✅, Cost Alerting (P1-09) ✅, GDD Pipeline (P1-10b) ✅. Context Remediation (P1-04), Governance Swap (P1-05), Ralph Hardening (P1-08) blocked by unmerged FFS PRs #196/#197.  
**Why:** SS-side implementation complete; FFS-side merge gate required to confirm upstream/downstream integration.  
**Recommendation:** Morpheus merge FFS PRs #196/#197 to unlock Phase 1 verification on main branch.  
**Deliverable:** `.squad/decisions/inbox/switch-integration-report.md`

### 2026-03-15: P1-13 SS Self-Audit Report

**By:** Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**Grade:** 🟢 B (0.71) — Up from D (0.43)  
**What:** Comprehensive self-assessment across 5 categories (Context Health 0.87/A, Architecture 0.33/F, Squad Setup 0.67/C, Governance 0.83/B, Autonomy 0.83/B). Context hygiene strong; Architecture weak (zero tests, 19 outdated deps); Governance & Autonomy excellent (tier system clear, zero human issues, Ralph/cost-alerting live, squad heartbeat working).  
**Critical Violation:** Oracle history.md at 8.59KB exceeds 8KB hard limit per context-hygiene SKILL. Requires Scribe summarization.  
**Systemic Gap:** CI uses 15KB generic limit; SKILL specifies 8KB/12KB per-type limits. Founder directive ("hygiene systemic") requires CI enforcement.  
**Deliverable:** `.squad/decisions/inbox/switch-self-audit.md`

### 2026-03-15: P1-11 Proposal→Prototype Pipeline — COMPLETE

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T1  
**What:** Implemented full 6-stage pipeline: Proposal (YAML) → GDD (@copilot) → Issues (gdd-to-issues.js) → Code (@copilot) → Build (GHA) → Deploy (Pages). 5 foundation scripts (validate-proposal.js, proposal-to-gdd.js, pipeline-orchestrator.js, create-pipeline-labels.js, extended gdd-to-issues.js), 2 GHA workflows (proposal-pipeline.yml, implement-game.yml), 1 game repo template (build-deploy.sh), 1 test proposal (chrono-tiles.md). Label-based state machine (pipeline:*) for Ralph monitoring.  
**Key Decisions:** No LLM calls from scripts (deterministic). GDD generation via @copilot issue (human/bot flow). Static-first auto-detect for game repos. Unified build+deploy workflow.  
**Cost:** €0 (GitHub Actions unlimited).  
**Deliverable:** All scripts + workflows + templates in Syntax-Sorcery repo. Documented in `.squad/agents/trinity/history.md`

### 2026-03-15T14:00Z: FFS Total Takeover — Strategy & Execution Plan

**By:** Morpheus (Lead/Architect)  
**Date:** 2026-03-15  
**Tier:** T1 (Lead authority — architecture + cross-functional coordination)  
**Status:** APPROVED — Ready for execution  
**What:** Comprehensive 4-phase takeover plan (T1: Hub Foundation, T2: Satellite Cascade, T3: Pipeline Activation, T4: Verification). Hub merges #196/#197 first, then fan-out to 3 satellites (ComeRosquillas, Flora, ffs-squad-monitor), then pipeline labels/testing, then full integration verification. Governance chain: SS → Hub → Satellites (not SS→Satellites direct). 15 completion criteria defined.  
**Why:** FFS Hub is governance anchor. Satellites blocked until Hub has upstream.json + Ralph v5. Takeover unblocks T2→T4 cascade.  
**Key Decisions:** Preserve Hub→Satellite chain (subsquad model). Parallel execution where possible (satellites, tooling). Coordinator executes per Morpheus guidance. Founder (joperezd) talks to SS only.  
**Timeline:** ~6h agent time, ~8h realistic with conflict resolution.  
**Artifacts:** FFS PRs merged, triage sync merged everywhere, upstream.json v2 on satellites, pipeline labels live, integration tests GREEN.  
**Completion Criteria:** 15 checkpoints including Hub PRs merged, context health, governance activation, all 3 satellites upgraded, pipeline operational, integration test GREEN.

### 2026-03-15T11:50Z: FFS Takeover T1 — Hub Foundation Complete

**By:** Morpheus (Lead/Architect)  
**Date:** 2026-03-15  
**Tier:** T1  
**Status:** COMPLETE  
**What:** Executed Phase T1 of FFS Total Takeover strategy. Reviewed and squash-merged PRs #196 (Ralph v5 hardening) and #197 (Context Remediation + Governance Swap) to FFS Hub main. Hub is now SS-governed with upstream.json live. Verified post-merge: 22 .squad/ files, zero open PRs, context health green.  
**Key Findings:**  
- PR #196: Ralph v5 changes sound (24h autonomous ops, alert escalation, auto-restart, color Discord notifs). All checks passing.  
- PR #197: Minimal changes (upstream.json + squad-agent-hash.txt). Context remediation already committed. 95% reduction verified.  
- Post-merge: Both PRs merged cleanly (timestamps 11:48:39Z, 11:48:40Z). upstream.json live with correct SS reference.  
- Satellites assessed: All 3 have outdated upstream.json format. ComeRosquillas 5 PRs, Flora 1 PR, ffs-squad-monitor 7 PRs. All three need v2 upgrade + triage sync + hash refresh.  
**Phase 1 Progress:** 14/14 tasks complete. Context D→B. 95% remediation confirmed.  
**Next Steps (T2):** Merge triage sync PRs (3 satellites), upgrade upstream.json to v2, refresh squad-agent-hash.txt, verify skill inheritance. Est. 2-3h with parallel PRs.  
**Completion Criteria Met:**  
- ✅ Hub PRs merged  
- ✅ upstream.json live on Hub main  
- ✅ Ralph v5 operational  
- ✅ Context remediation verified  
- ⏳ T2-T4 pending  

Hub foundation SOLID. FFS now SS-governed.

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
