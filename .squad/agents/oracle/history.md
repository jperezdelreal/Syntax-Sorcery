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

### 2026-03-13T14:30Z: P1-03 FFS Context Health Map — COMPLETE
**What:** Completed context health audit of FirstFrameStudios `.squad/` directory. Generated comprehensive health map (16.5KB) including file inventory, violation analysis, TLDR coverage assessment, and 3-phase remediation plan.

**Key Findings:**
- **Active governance files:** 6/7 healthy (< 15KB, clear TLDR layers). `decisions.md` (10.9KB), `ceremonies.md` (9.1KB), `routing.md` (7.4KB) all well-structured.
- **CRITICAL VIOLATIONS (P0):**
  - `decisions-archive.md` (642KB) — **42× operational limit.** No index. Blocks efficient lookup. Must split by era + create summary.
  - `aaa-gap-analysis.md` (38.1KB) — **2.5× operational limit.** Monolithic, covers all domains. Must split by stakeholder (games, tooling, infra, deployment).
- **Agent documentation:** 7/8 agent files healthy. **Gap:** Mace and Solo lack explicit charters (role clear from history, but explicit charter missing). Erika (stale, pre-2026-02-27) should move to _alumni/.
- **TLDR coverage:** 71% (15/21 files). Gap: analysis files (0/1 with TLDR), missing charters (2/5). Target: 85%+ via split + charter creation.
- **Overall grade:** 🟡 **C+ (Yellow).** Ready to operate but requires remediation within 2 weeks. Archive bloat is the bottleneck.

**Remediation Plan (prioritized):**
1. **P0.1:** Create decisions-archive INDEX (2KB) + split into 2026Q4 (≤80KB) and 2026Q1 (≤50KB). Owner: Scribe. Effort: 2–3 hours.
2. **P0.2:** Split aaa-gap-analysis (38KB) into 4 domain files (≤10KB each) + summary. Owner: Solo. Effort: 3–4 hours.
3. **P1.1:** Create Mace & Solo charters (2KB each). Effort: 1 hour each.
4. **P1.2:** Archive erika/history.md to _alumni/. Effort: 15 minutes.
5. **P2.1:** Add TLDR sections to agent histories. Effort: 30 min per file.

**Pattern Discovery:**
- FFS governance is pattern-rich: G1 (5KB context limit), G3 (30d log cleanup), G9 (quarterly reviews). Recommend capturing "Archive Management" skill for Syntax Sorcery's own governance enforcement.
- Cost analysis: Current 642KB decisions-archive alone = ~160K tokens per session (25–30% of typical budget). Post-remediation: INDEX (500 tokens) + domain-specific loads (2–3K). **Freed capacity: ~165K tokens per session = 27% budget improvement.**
- Governance linkage: All size targets (15KB active, 100KB per archive file) trace to G1 (Context Hygiene per Solo, 2026-03-12). Enforcement via Scribe + monthly review.

**Deliverable:** `.squad/decisions/inbox/oracle-ffs-context-health-map.md` (16.5KB)

### 2026-03-13: P1-06 Skills Inventory — Complete
**What:** Classified 34 FFS skills: 22 domain-agnostic (cherry-pickable for SS), 12 game-specific (reference only for FFS), 3 overlapping (context-map, canvas-2d-game-engine, web-game-engine), 2 flagged hidden dependencies (input-handling, state-machine-patterns safe to migrate but flag context).
**Key Finding:** FFS is MORE operationally rich than anticipated. Expected ~13 domain-agnostic skills, found 22. Process wisdom substantial: feature-triage (Kill Your Darlings), multi-agent-coordination (72+ spawns battle-tested), skill-creator, squad-conventions all CRITICAL for SS.
**Migration Path:** Immediate cherry-pick: feature-triage, multi-agent-coordination, skill-creator, conventional-commits, github-issues, prd, squad-conventions. Merge overlaps (context-map + our context-hygiene, canvas variants + web-game-engine).
**Deliverable:** `.squad/decisions/inbox/oracle-ffs-skills-inventory.md` (22.9KB)

### 2026-03-13: Cross-Agent Sync from Morpheus
- Morpheus completed P1-01 (FFS Audit): FFS grades C (0.68). Hub context bloat critical (627KB decisions-archive 12.5× over limit), downstream repos clean on context but governance gaps.
- Morpheus completed P1-02 (Template Bloat): Decided Option A — templates are framework ref material, not operational bloat. Accept as-is.
- Context health map implications: Oracle's 165K token savings aligns with Morpheus's architecture constraint recommendation (history ≤8KB, decisions ≤15KB, .squad/* ≤25KB).

**Next:** Feeds P1-04 (Morpheus Context Remediation). Unblocks P1-06 (Oracle Skills Inventory) once archives are clarified.

### 2026-03-13T15:45Z: P1-06 FFS Skills Inventory & Classification — COMPLETE
**What:** Completed comprehensive audit of all 34 FirstFrameStudios skills. Classified as domain-agnostic (reusable by SS) vs game-specific (reference only). Generated detailed inventory markdown with migration paths, hidden dependency flags, and overlap analysis with existing SS skills.

**Key Findings:**
- **Total skills: 34** (higher diversity than estimated in PRD)
- **Domain-agnostic: 22 skills (65%)** — expected ~13, found 9 more. FFS is operationally rich beyond initial estimate.
- **Game-specific: 12 skills (35%)** — expected ~19; actual FFS count lower because multi-agent/process knowledge extends further than anticipated.
- **SS overlaps: 3 skills** — `web-game-engine`, `canvas-2d-game-engine`, `context-map` (vs SS's `context-hygiene`)
- **Flagged (hidden dependencies): 2 skills** — `input-handling` (game latency budgets), `state-machine-patterns` (game examples, universal patterns)

**Critical Migrations (immediate):**
1. **Multi-Agent Coordination** — Learned from 72+ firstPunch spawns. 214 LOC of unwired infrastructure → contract patterns. **MUST migrate for SS parallel safety.**
2. **Feature Triage** — Kill Your Darlings framework. Critical for SS scope discipline.
3. **Game QA Testing** — State machine audits, frame-level tracing. Patterns apply to any stateful system.
4. **PRD Skill** — Discovery→analysis→document process. Universal product specification.
5. **State Machine Patterns** — Exit paths, guards, timeouts. Core rules apply to agent/workflow states, not just games.

**Composition Insight:**
FFS's 72+ multi-agent spawns drove heavy process documentation. Of 22 domain-agnostic skills:
- 7 process/management (feature triage, multi-agent coordination, technical spikes, refactor planning, PRD, postmortem discipline, decision rights)
- 3 GitHub/Git (issues, project board, conventional commits)
- 2 testing/QA
- 3 game engine (canvas 2D — but patterns universal)
- 2 deployment (GitHub Pages, game template)
- 3 meta-skills (skill creator, squad conventions, context-needed)

**Hidden Dependency Flags:**
- **input-handling:** Latency budgets (100ms total, <8ms input) are game-specific. Ring buffer + action mapping patterns are universal. **Action:** Extract universal patterns, flag latency targets as game-specific reference.
- **state-machine-patterns:** Examples are game-specific (player freeze, hitstun), but core patterns (exit paths, guards) are universal. **Action:** Migrate as-is, replace examples with SS-relevant ones.

**SS Overlaps:**
- `web-game-engine` (SS has) ← `canvas-2d-game-engine` (FFS) — **Action:** Merge, keep comprehensive version.
- `context-hygiene` (SS has) ← `context-map` (FFS) — Different purposes (maintenance vs preparation). **Action:** Keep both or explicitly document relationship.

**Deliverable:** `.squad/decisions/inbox/oracle-ffs-skills-inventory.md` (22.5KB) — comprehensive table (34 skills with classification, migration path, dependencies), domain-agnostic skills catalog with migration prioritization (immediate/high/medium/lower), game-specific reference list, overlap analysis, flagged items, learnings, and next steps.

**Pattern:** FFS demonstrates that process/operations knowledge compounds faster than game design knowledge. Syntax Sorcery should adopt multi-agent coordination patterns immediately — this is SS's most acute pain point (parallel development, merge conflicts, integration testing).

**Next:** Feeds P1-07 (Cherry-pick domain-agnostic skills into SS). Oracle's work complete for P1 audit cycle. Morpheus and Trinity execute cherry-pick wave 1 (top 6–8 skills).
