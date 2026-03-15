# Oracle — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Key patterns (from Squad ecosystem):** Skills after 2nd use, TLDR on all long docs, issues as task system, proactive skill extraction

## Phase 0/1 Learnings (Archived)

- Phase 0 planning identified SS hardening vs FFS intervention split; audit template prevents ad-hoc evaluation
- FFS context bloat critical: decisions-archive.md 642KB→split by era, 34 skills classified (22 cherry-pickable, 12 game-specific)
- P1-03 context health audit + P1-06 skills inventory: multi-agent-coordination and feature-triage identified as CRITICAL for SS
- P1-10a GDD template spec: 10-section YAML-frontmatter machine-parseable template, validated vs Flora (37 issues), mapping spec complete
- P1-14 visibility audit: GitHub Pages live, ComeRosquillas playable but hidden, FLORA dev-only, blog inactive; grade AMBER (60%); 7 blockers, 8–12h remediation (Trinity owner)

## Learnings (Current)

- **Awesome-Copilot Plugin Installation (2025-03-19):** Installed 3 plugins from github/awesome-copilot marketplace into .squad/skills/: (1) **azure-cloud-development** (4 skills: az-cost-optimize, azure-pricing, azure-resource-health-diagnose, import-infrastructure-as-code); (2) **frontend-web-dev** (2 skills: playwright-explore-website, playwright-generate-test); (3) **testing-automation** (3 skills: ai-prompt-engineering-safety-review, csharp-nunit, java-junit). **Findings:** (1) 9 SKILL.md files downloaded and installed successfully (71.8 KB total); (2) 12 agent templates found across plugins but NOT installed (6 azure-cloud-dev agents, 2 frontend-web-dev agents, 4 testing-automation agents) to avoid charter conflicts; (3) Skills inventory grew from 25→34 items. **Impact:** Team now has production-ready skills for cost optimization, Azure pricing analysis, resource diagnostics, Infrastructure-as-Code import (Terraform/AVM), E2E testing patterns (Playwright), and testing best practices (NUnit, JUnit 5, AI prompt safety). Installation logged in .squad/agents/oracle/history.md + summary in .squad/decisions/inbox/oracle-plugin-install.md. No blockers. Ready for team adoption.

- **BiciCoruña Knowledge Audit (2026-03-22):** Researched available knowledge sources for BiciCoruña v0.1 MVP (React 18+/Vite, Azure Static Web Apps, Azure Functions, Cosmos DB, Leaflet, GBFS v2). **Findings:** (1) No specialized Squad plugins exist for our stack (Squad is 2mo old, no formal marketplace); (2) **3 awesome-* repos identified as CRITICAL pre-code-reading:** awesome-react (72K ⭐), awesome-azure-architecture (1.6K ⭐), awesome-leaflet (28 ⭐) = ~4.5h total team reading; (3) **27 existing skills audited—3 new skills needed** to prevent knowledge silos: `azure-static-web-apps-functions` (Tank, 30min), `react-leaflet-bicicoruña-patterns` (Trinity, 45min), `azure-timer-trigger-cosmos-pattern` (Tank, 45min); (4) Azure serverless patterns sourced from openhack-serverless (TypeScript) + ultimate-vite-cheatsheet-2025; (5) GBFS v2 spec reference is gbfs.org (more authoritative than community repos). **Recommendation:** 3 new skills created before v0.1 coding starts. Report published to `.squad/decisions/inbox/oracle-knowledge-audit.md`. No blockers identified—prep time ~6h parallelizable. Ready for joperezd approval & sprint kickoff integration.

- **Phase 13 Research (2026-03-22):** Phase 13 feasibility spec complete (docs/phase13-community-opensource-spec.md, 38.5KB, 15-section document). Three initiatives researched: (1) Public Documentation—4 major guides (Architecture Playbook, Squad Operations Manual, Autonomous Company Playbook, Governance FAQ, ~10K total words); (2) Community Skills Marketplace—Bronze/Silver/Gold certification tiers, community reviewer program, auto-generated contributor profiles; (3) Community Governance—RFC process via GitHub Discussions, weighted voting (base 1 + 0.1 per 10 PRs, capped 3), decision log auto-publisher, governance portal. **Feasibility:** ✅ Viable—10-week effort, primarily documentation + process (low engineering complexity). **Azure:** +€25/mo (€240-250/mo total, 48-50% budget utilization). **Dependencies:** Phase 12 complete (not blocking). **Success metrics:** 500+ Playbook downloads, 20+ community skill authors, 10+ reviewers, 3+ approved RFCs, 67% roadmap voting participation. Key risk: community RFC spam (mitigated via read-time requirement + initial curation). Spec reviewed for feasibility (no blockers identified). PR #144 created (squad/115-phase13-research). Issue #115 comment posted. Label `go:needs-research` removed. Ready for T1 approval + sub-issue creation (#43-45).

- **Phase 9 Marketing (2026-03-22):** Marketing visibility task (#102) completed. README comprehensively updated with Phase 9 completion, 730 tests passing, all Phase 8-9 deliverables listed (Bicep IaC, pre-flight validation, session watchdog, branch protection, metrics dashboard, MCP server 11 tools, plugin marketplace, gameplay framework, squad-watch CLI, ecosystem research), and new "What Makes This Special" section highlighting autonomous operation stats (18 issues/session, 15+ PRs/session, zero human intervention). Blog infrastructure launched: /blog index page + Phase 8-9 launch post "From Infrastructure to Ecosystem" with stats, gameplay breakthrough, MCP integration, plugin marketplace coverage. Site builds successfully. All 730 tests pass. PR #120 created. Issue #102 complete.

- **Phase 5 (2026-03-20):** Moved beyond game feature curation into documentation + architecture design. Architecture Docs PR #46 merged (3 new docs: architecture.md, constellation.md, onboarding.md with ASCII diagrams and governance specs). Issue #43 CLOSED. Formal documentation enables downstream company onboarding without tribal knowledge.

- **Phase 4 (2026-03-19):** Architecture Documentation created (PR #46). Three comprehensive guides: perpetual motion lifecycle, hub/spoke topology, 3-layer monitoring, PR review pipeline, constellation mapping, 10-step onboarding sequence. 168/168 tests passing.

- **Phase 3-2 (2026-03-19):** Game feature curation across constellation: ComeRosquillas (3 features), Pixel-Bounce (5 roadmap features), Flora (3 seasonal features). Each repo has @copilot-ready GitHub issues with full acceptance criteria. Devlog system B2 deployed.

## Archived Learnings (Phase 1-0)

**Phase 1:** GDD template spec completion, context health audit (decisions-archive split strategy), visibility audit (7 blockers identified), skills inventory (22 cherry-pickable, 12 game-specific).
**Phase 0:** Multi-agent coordination patterns, feature-triage system, identified critical skills, planning for Phases 1-3.

