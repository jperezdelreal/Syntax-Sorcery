# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

### 2026-03-13: Phase 0 Strategy Designed
- Created epic #1 + 4 sub-issues (#2-#5) for SS readiness before FFS intervention
- Key insight: SS is NOT a fork of FFS — it's the upstream AI backbone that manages autonomous companies
- Tamir Dresher's `upstream.json` pattern is the right model for SS→FFS relationship (upstream controls policies, downstream owns content)
- FFS context bloat (642KB decisions) is the #1 engineering problem — solved with hard file size limits (history ≤8KB, decisions ≤15KB, total .squad/ ≤100KB)
- Gate-based readiness: SS must prove its own hygiene before touching FFS
- Brady's Squad-IRL has 20+ sample projects; Tamir's squad-monitor is a live dashboard pattern worth tracking
- Decisions merged into `.squad/decisions.md`. Orchestration log: `2026-03-13T08-48-morpheus.md`
- Phase 0 epic (#1) and 4 sub-issues (#2–#5) created on GitHub. Ready for team to work through gates.
- Decisions file: `.squad/decisions/inbox/morpheus-phase0-strategy.md`

### 2026-03-13: D2 — Downstream Management Framework (#3)
- Created `.squad/identity/downstream-management.md` (<4KB) defining SS→downstream governance
- Key design: policies always cascade and can't be overridden; skills can be overridden; domain stays local
- Intervention protocol is the critical safety mechanism — 5 steps, no shortcuts except P0 emergencies
