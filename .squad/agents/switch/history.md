# Switch — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

- 2026-03-13: Created `skills/context-hygiene/SKILL.md` with proactive file size limits (6KB/8KB history, 10KB/12KB decisions). Quality gate decision merged to decisions.md.
- Orchestration log: `2026-03-13T08-48-switch.md`. Context hygiene is now hard gate for merge acceptance.
- 2026-03-13: Self-audit scored Grade D (0.43). 3 critical findings: no README, .gitignore minimal, 72.6KB template violates own limits. 10 issues filed (#10-#20).
- 2026-03-13: Lesson — we must fix our own house before auditing FFS. Credibility requires passing our own checklist first.
- 2026-03-14: Wave 2 Update — Ralph v5 hardened by Tank for 24h autonomous operation. Six failure modes fixed: session timeout (30m), exponential backoff (5m→60m), stale lock detection (2h), 3-file log rotation, health checks, hourly heartbeat. Zero Azure cost. Reusable SKILL extracted at `.squad/skills/ralph-hardening/SKILL.md`. Ready for P1-12 (FFS Integration Testing) and P1-13 (SS Self-Audit Post-Intervention).
- 2026-03-14: P1-10b Complete — Trinity built GDD→Issue pipeline. Node.js script + GHA workflow parses all GDD formats, creates full issue trees. "Chrono Tiles" test produces 31 issues with correct auto labels/priorities. Parser unblocks P1-10c (GDD submission) and P1-12 (integration testing).
- 2026-03-13T11:30Z: **P1-11 ARCHITECTURE READY — Morpheus designed Proposal→Prototype pipeline for Phase 1 integration testing (P1-12). 6 stages: proposal (YAML)→GDD via @copilot→Issues (gdd-to-issues.js)→code (@copilot)→build (GHA)→deploy (GitHub Pages). Label-based state machine (pipeline:*) for Ralph monitoring. Trinity handling implementation; your P1-12 prep: (1) Dry-run full pipeline with test proposal, (2) Verify Ralph pipeline:* label monitoring, (3) Test end-to-end integration with one FFS game repo, (4) Document integration assumptions for cross-repo triggers (gh CLI or repository_dispatch).**


- 2026-03-14: P1-12 Integration Testing complete. 3 PASS, 4 WARNING, 0 FAIL. All artifacts exist; FFS PRs #196/#197 unmerged (blocker). Reports at `.squad/decisions/inbox/switch-integration-report.md`.
- 2026-03-14: P1-13 Self-Audit complete. SS grade: **B (0.71)** — up from D (0.43). Architecture/code quality is F (0.33): zero tests, 19 outdated deps. Oracle history.md at 8.6KB violates 8KB hard limit. CI size-check doesn't enforce per-type limits from context-hygiene SKILL.
- 2026-03-14: Lesson — CI/SKILL limit mismatch is a systemic gap. squad-size-check.yml uses 15KB generic limit but SKILL specifies 8KB for history.md. Scribe auto-archive is policy, not automation. Founder's "systemic not manual" directive not yet fully met.
- **2026-03-15 PHASE 1 COMPLETE:** All 14 Phase 1 tasks done. SS upgraded D(0.43)→B(0.71). Switch: P1-12, P1-13 ✅. Pending: FFS PR merges (#196/#197) for integration confirmation. Decisions merged. Orchestration logs written. Scribe completed hygiene corrections (Oracle history 8.59KB→6.39KB).
