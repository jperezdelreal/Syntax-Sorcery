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

### 2026-03-13: D4 — Readiness Gates (#5)
- Created `.squad/identity/readiness-gates.md` (2.8KB) with 5 gates for FFS intervention readiness
- Self-assessment: Gates 1–4 all PASS. Gate 5 (founder approval) is the only remaining blocker for Phase 1
- Phase 0 is architecturally complete — all 4 deliverables (#2–#5) shipped with proper branch/PR/merge lifecycle

### 2026-03-13: Phase 1 Decomposition
- Decomposed PRD Phase 1 into 14 work items across 5 waves (`.squad/decisions/inbox/morpheus-phase1-decomposition.md`)
- Critical path: Audit → Context Map → Remediation → Governance Swap → GDD Pipeline → Proposal→Prototype → Integration Test → Self-Audit
- 5 items are @copilot 🟢 (autonomous), 7 are 🟡 (paired), 2 are 🔴 (human-only: template decision + Proposal→Prototype architecture)
- Key insight: P1-11 (Proposal→Prototype) is the most complex item — will need sub-decomposition once architecture is defined
- Founder sign-off NOT required for any Phase 1 item — Gate 5 already cleared, all items T1/T2
- FFS pause required before Wave 2 writes — batch all writes in single intervention window to minimize coordination overhead

### 2026-03-14: P1-02 — Template Bloat Resolution
- Decision: Option A — Accept templates/ (65KB, 31 files) as-is. No restructuring.
- Rationale: Framework scaffolding from Brady Gaster, already excluded from CI enforcement, on-demand loading only, max file 6.7KB (well under 15KB limit)
- Key finding: Total .squad/ is 149.3KB — templates aren't the bloat driver. Non-template files (83.9KB) need separate remediation.
