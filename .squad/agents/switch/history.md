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

### 2026-03-13: Self-Audit Results Filed — Critical Blocker
- SS grades D (0.43/1.0) on readiness checklist. Cannot credibly audit FFS (C grade, 0.68) while SS is D.
- 3 critical gaps: #11 no README (file exists but missing?), #12 minimal .gitignore, #13 72.6KB templates violate own 25KB hard limit.
- Issues #10-#20 filed for tracking. P1 remediation required before Phase 1 FFS intervention begins.
- Decision: Fix house (SS→C) before FFS work. Blocker enforced by Morpheus readiness gate (Gate 4: Team Operational).
