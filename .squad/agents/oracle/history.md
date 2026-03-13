# Oracle — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Key patterns (from Squad ecosystem):** Skills after 2nd use, TLDR on all long docs, issues as task system, proactive skill extraction

## Learnings

<!-- Append entries below as you learn about the project -->

### 2026-03-13T09:55Z: FFS Autonomy PRD — Product Clarity
**What:** Created `docs/prd-ffs-autonomy.md` (3.6KB) defining Phase 0 (SS team maturation) vs Phase 1 (FFS intervention). Success criteria tied to founder's core need: "wake up and see games created."
**Pattern:** PRD follows Tamir's TLDR-first style. Scope separated into Phase 0 (in-house hardening) and Phase 1 (with FFS coordination) to respect "FFS is live" safety constraint. Risk table flags context bloat explicitly — key learning: < 15KB/file is operationally critical given €500/mo budget and autonomy goal.
**Next:** Phase 0 = skills extraction + monitoring hardening. Orchestration log: `2026-03-13T08-48-oracle.md`. PRD informs Phase 1–5 breakdown.
