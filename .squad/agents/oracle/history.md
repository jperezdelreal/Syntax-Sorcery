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

## Recent Learnings (Phase 2)

- **2026-03-17 B2 Devlog Implementation Complete:** Built daily auto-generated devlog within FFS GitHub Page. Route `/devlog` displays chronological feed (grouped by repo, color-coded, type icons). Generation script aggregates closed issues, merged PRs, deploys, and decisions.md changes across 5 constellation repos via GitHub API/gh CLI. GitHub Actions workflow runs daily 02:00 UTC + manual trigger. Cost €0 (free tier). Navigation updated, homepage promotion added. 100% automated — zero manual writing. Day counter from 2026-03-16 (project start).

- **2026-03-16 Phase 2 Round 2:** Focused on decision capture and inbox consolidation. All directives merged (budget scope, context hygiene, Morpheus leads, Ralph approval gate, phase 2 scope focus). Inbox files: copilot-directive (2), morpheus-ffs-triage-t5 (5.11KB), switch-test-matrix, tank-ci-hardening, trinity-e2e-pipeline-test. All merged into decisions.md. Documentation remains up-to-date with phase transitions.


