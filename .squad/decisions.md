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

### 2026-03-15: FFS Takeover T2 — Satellite Cascade Complete

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Executed Phase T2 (Satellite Cascade) of FFS Takeover: merged 3 pre-approved triage sync PRs (ComeRosquillas #27, Flora #29, ffs-squad-monitor #30); upgraded upstream.json v1→v2 on all satellites (ComeRosquillas #32, Flora #30, ffs-squad-monitor #33); verified satellite health post-cascade; assessed T3 readiness.  
**Outcomes:** All 3 satellites now have squad-triage.yml synced with Hub, upstream.json v2 formalized (FFS as upstream, skills-inherit model, governance non-override, domain-local). Satellites healthy (.squad/ intact, governance active). T3 readiness: BLOCKER identified — game repos lack `pipeline:*` labels (12 labels required per P1-11 spec). Non-blocking: 4 open PRs on ComeRosquillas (features), 6 on ffs-squad-monitor (UX/docs/tests).  
**Why:** Formal upstream/downstream governance enables automated skills inheritance, governance enforcement, domain specialization. T3 will activate proposal→prototype pipelines on game repos.  
**Next:** Morpheus execute T3 (install pipeline:* labels); Ralph monitors pipelines once labels deployed.

**See `decisions-archive-2026-03-15.md` for Phase 1 entries (P1-07 through P1-14, archived 2026-03-15T12:00Z)**

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
