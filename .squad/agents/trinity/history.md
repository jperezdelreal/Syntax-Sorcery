# Trinity — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Phase 1 Learnings (Archived)

- Created squad-size-check.yml and .gitignore hardening; CI/context hygiene foundational
- P1-04/P1-05 context remediation: 95% reduction (2618KB→126KB), all files <15KB
- P1-07 Skills cherry-pick: 16 domain-agnostic FFS skills migrated to SS (20 total skills)
- P1-10b GDD→Issue pipeline: Node.js parser handles YAML + 10 sections, produces 25–40 issues, auto-labeled
- P1-11 Proposal→Prototype orchestration: 5 scripts + 2 GHA workflows + game repo template, stages 0–2 production-ready
- P1-14 FFS visibility audit: 7 blockers identified, 8–12h remediation queued

## Recent Learnings (Phase 2-13 Summary)

**Phase 2-3:** Pipeline & Satellite deployment (E2E test, 9 PRs merged, Pixel Bounce game deployed)
**Phase 4-5:** Company showroom (FFS page, SS landing page, GitHub Pages, Squad Monitor)
**Phase 6-7:** Dashboard infrastructure (metrics, pre-flight validation, CLI consolidation)  
**Phase 8-10:** Performance optimization (MatrixRain, constellation stats, dashboard backend/UI)
**Phase 11-13:** Delivery complete (730 tests green, €0 cost, all artifacts live)

**Key Learnings:**
- Always verify what's on origin/master before branching (use `git checkout -b X origin/master`)
- Design-only PRs rejected; full implementations approved (PR #45 vs PR #47)
- Build-time data piping (metrics-engine.js → JSON) > API calls during deploy (eliminates tool dependencies)
- DI-injectable architecture enables standardized error handling across all scripts
- When PRs conflict on routing file: extract non-conflicting files via `git show`, then merge router/config once
- Concurrent session branch swaps: use atomic checkout+commit chains
- Design-only PRs already on branch? Update with full implementation, don't create new PR (saves review overhead)
