# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-13T11:03Z: User Directive — Budget Scope Clarification

**By:** joperezd (via Copilot)  
**Tier:** T0  
**What:** €500/mo Azure-only budget. GitHub (Actions, Pages, repos, Issues, Copilot) is unlimited — zero cost constraints.  
**Why:** Removes false conservatism about GitHub-based automation. Cost Alerting (GHA free tier), GDD Parser (GHA workflows), Ralph (GHA + Discord) all €0.

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

### 2026-03-14: P1-14 FFS Visibility Audit — Showcase Remediation Roadmap

**By:** Oracle (Product & Docs)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Comprehensive audit of GitHub Pages, blog, game playability. Grade: 🟡 AMBER (60%). ComeRosquillas playable but not discoverable. FLORA no web build. Blog inactive. Missing "Play Games" page. 7 P0/P1 blockers identified. Remediation: 8–12 hrs (Trinity owner).  
**Why:** Founder requires games visible+playable+impressive. Current state blocks requirement 1 (playability proof) and 2 (visibility).  
**Next:** Trinity remediation this week (before Phase 1 close-out).

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
