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
### 2026-03-13T10:06Z: FFS Audit Checklist — Systematic Evaluation Template
**What:** Created `downstream-audit` skill (5.3KB) + reusable template with 5-category checklist (context health, architecture, squad maturity, governance, autonomy). Scored by Pass/Warning/Fail per item → 0–1.0 category scores → A–F overall grade.
**Pattern:** Checklist is CLI-driven (gh, find, grep commands embedded); template standardizes auditor workflow. Confidence: low — needs validation on real FFS audit before scaling to other downstream projects.
**Next:** Apply to FFS; iterate based on real-world findings. Template prevents ad-hoc auditing and makes governance visible quantitatively.
- 2026-03-13T10:13Z: Phase 1 decomposition ready. You own: P1-03 (Context Health Map with copilot), P1-06 (Skills Inventory & Classification), P1-14 (Visibility/Showcase, co-owned with Trinity). Key: P1-03 maps 642KB decisions archive → remediation plan. P1-06 classifies 32 FFS skills into domain-agnostic (→ SS) vs game-specific (stays in FFS). Critical path depends on P1-01 audit first.
