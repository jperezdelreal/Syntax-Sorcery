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
- 2026-03-14 Wave 3 sync: Oracle completed P1-10a (GDD template spec locked, ready for your P1-10b parser). Oracle audited FFS visibility (P1-14) — 7 blockers identified, 8–12hrs remediation work queued for you (P0 this week). Tank completed P1-09 cost alerting (€400/€450/€480 tiers, GHA-based, €0 cost). Budget directive clarified: GitHub unlimited, Azure €500/mo. Decisions merged to 3.9KB; no context bloat.
- 2026-03-14: P1-10b complete. Built GDD→Issue autonomous pipeline. Node.js script (scripts/gdd-to-issues.js) parses YAML frontmatter + 10 GDD sections, creates full GitHub Issue tree via `gh` CLI. GHA workflow triggers on push to docs/gdds/ or manual dispatch. Supports --dry-run. Test GDD "Chrono Tiles" produces 31 issues (1 epic, 16 features, 5 milestones, 2 QA, 4 research, 1 art, 1 audio, 1 architecture). js-yaml added as dependency. Design Pillars correctly skipped (no issues). Labels auto-derived per Oracle's mapping spec.
