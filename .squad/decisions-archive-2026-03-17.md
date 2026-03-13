# Squad Decisions Archive — 2026-03-17

## TLDR

Archived entries from decisions.md (2026-03-17). See decisions.md for active decisions (last 7 days).

Foundational decisions, Phase 0–1 strategy, FFS evaluation, downstream management all remain applicable in archive.

---

# Squad Decisions (Archived 2026-03-17)

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days — MOVED TO decisions.md)

See current `decisions.md` for:
- 2026-03-16T22:30Z: Phase 2 Plan Audit Complete & Gate Verdict
- 2026-03-16T21:30Z: User Directive — squad watch as Roadmap Refueler
- 2026-03-16T21:00Z: Event-Driven Autonomy Architecture
- 2026-03-16T21:00Z: Phase 2 Consolidated Plan
- 2026-03-16T20:00Z: User Directive — No More Unlimited Games
- 2026-03-16T20:00Z: Autonomy Vision — 3-Phase Roadmap
- 2026-03-16T20:00Z: Parallel Evolution — Concrete Mechanics
- 2026-03-16T20:00Z: Visibility Strategy
- 2026-03-16T17:45Z: Phase 2 Stages 3–5 Complete
- 2026-03-15T12:00Z: FFS Takeover T3+T4 Complete
- 2026-03-13T13:34Z: User Directive — Visibility Layer Details (2 directives)

---

## Historical Decisions (Pre-Wave 3)

### 2026-03-13T11:30Z: P1-11 Autonomous Proposal→Prototype Pipeline Architecture

**By:** Morpheus (Lead/Architect)  
**Status:** APPROVED (T1)  
**Tier:** T1  
**What:** 6-stage autonomous pipeline: Proposal → GDD → Issues → Game Implementation → Build → GitHub Pages Deploy. Label-based state machine (pipeline:*) for Ralph monitoring.  
**Why:** Phase 1 requires fully autonomous game production without human intervention. GDD generation via @copilot eliminates Azure cost; GitHub Actions handles all orchestration.

---

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |

---

**Archive Status:** Complete (all inbox decisions merged to active decisions.md)  
**Next Archive:** When decisions.md exceeds 12KB again (split to decisions-archive-2026-03-YY.md)
