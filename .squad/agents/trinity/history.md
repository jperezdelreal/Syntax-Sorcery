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
- 2026-03-13T10:13Z: Phase 1 decomposition ready. You own: P1-04 (Context Remediation), P1-05 (Governance Swap, Tier mapping), P1-07 (Skills Cherry-Pick with copilot), P1-10 (GDD→Issue Pipeline), P1-11 (Proposal→Prototype Workflow, complex, may need sub-decomposition), P1-14 (Visibility Setup). Critical path: audit → map → remediate → govern → GDD → prototype → test.
- 2026-03-14: P1-04+P1-05 complete (PR #197 in FFS). decisions-archive.md split 639KB→yearly archives. Identity compressed 188KB→74KB. 30 analysis files compressed. Governance.md 15KB→3.6KB (SS-aligned). upstream.json created. Operational .squad/ 2618KB→126KB (95% reduction). All files under 15KB limit. Erika moved to _alumni.
- 2026-03-14: P1-07 complete. Cherry-picked 16 domain-agnostic skills from FFS→SS. Adapted 6 (removed game refs), direct-copied 10. Skipped 4 game-specific. Created upstream.json on FFS PR #197 branch. SS total: 20 skills. All under 15KB.
