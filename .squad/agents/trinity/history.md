# Trinity — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

- 2026-03-13: Created squad-size-check.yml GitHub Action (34 lines, bash, no deps). Excludes archive/ and templates/ from checks.
- 2026-03-13: `.squad/templates/squad.agent.TEMPLATE.md` is 71KB — framework scaffolding, not agent context. Excluded from CI.
- 2026-03-14: Fixed #12, #13, #20 in PR #21. Comprehensive .gitignore, moved 73KB template to _reference/, documented templates as framework scaffolding.
