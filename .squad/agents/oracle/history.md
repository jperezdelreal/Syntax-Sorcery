# Oracle — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Key patterns (from Squad ecosystem):** Skills after 2nd use, TLDR on all long docs, issues as task system, proactive skill extraction

### Archived Learnings Summary (2026-03-13 early)

- **Phase 0 Planning (09:55–10:13Z):** Created FFS Autonomy PRD + downstream-audit skill. Identified Phase 0 (SS hardening) vs Phase 1 (FFS intervention) split. Audit template prevents ad-hoc evaluation.
- **Key Insight:** Context bloat (< 15KB/file) is operationally critical given €500/mo budget and autonomy requirements. Applies to both SS and FFS governance.
- **FFS Governance Patterns:** G1 (5KB context limit), G3 (30d log cleanup), G9 (quarterly reviews). Archive management skill recommended for SS enforcement.

## Recent Learnings

### 2026-03-13T14:30Z: P1-03 FFS Context Health Map — COMPLETE
**What:** Completed context health audit of FirstFrameStudios `.squad/` directory. Generated comprehensive health map (16.5KB) including file inventory, violation analysis, TLDR coverage assessment, and 3-phase remediation plan.

**Key Findings:**
- **Active governance files:** 6/7 healthy (< 15KB, clear TLDR layers). `decisions.md` (10.9KB), `ceremonies.md` (9.1KB), `routing.md` (7.4KB) all well-structured.
- **CRITICAL VIOLATIONS (P0):**
  - `decisions-archive.md` (642KB) — **42× operational limit.** No index. Blocks efficient lookup. Must split by era + create summary.
  - `aaa-gap-analysis.md` (38.1KB) — **2.5× operational limit.** Monolithic, covers all domains. Must split by stakeholder (games, tooling, infra, deployment).
- **Overall grade:** 🟡 **C+ (Yellow).** Ready to operate but requires remediation within 2 weeks.

**Cost Analysis:** 642KB decisions-archive = ~160K tokens/session. Post-remediation: ~165K tokens freed (27% budget improvement).

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

### 2026-03-13T15:45Z: P1-06 FFS Skills Inventory — COMPLETE
**What:** Classified 34 FFS skills: 22 domain-agnostic (cherry-pickable), 12 game-specific (reference).
**Key:** FFS is operationally rich (22 vs expected 13). Critical: multi-agent-coordination (72+ spawns, SS parallel safety blocker), feature-triage (scope), PRD, state machines.
**Deliverable:** oracle-ffs-skills-inventory.md

### 2026-03-14T14:45Z: P1-14 FFS Visibility & Showcase Audit — COMPLETE
**What:** Comprehensive visibility audit of FFS's GitHub Pages, blog, and game playability against founder's three hard requirements (games playable, visible, impressive).
**Key Findings:**
- **GitHub Pages:** ✅ Astro site live at jperezdelreal.github.io/FirstFrameStudios/ — polished, well-designed
- **Blog:** ✅ Infrastructure ready (Astro content collections), 2 seed articles, but 🔴 **no recent entries** (last update 2026-03-11, 3 days old)
- **ComeRosquillas:** ✅ Excellent repo/README, ⚠️ **not linked from GitHub Pages**, unclear if play URL works (claims `/play/` endpoint)
- **FLORA:** ❌ **No playable web build** (dev-only), README minimal (473 bytes), shows as "🌱 Starting" with no public demo
- **Showcase:** ❌ **Missing dedicated "Play Games" page** — games buried in developer-focused content
- **Visibility:** ❌ Founder **cannot discover or play games** from main showcase
- **Overall Grade:** 🟡 **AMBER (60% complete)** — Strong foundation, critical gaps block founder requirements

**Immediate Actions (P0):** 
1. Verify ComeRosquillas `/play/` URL & link from home page
2. Build web version of FLORA or create GitHub Pages static build
3. Create dedicated game showcase landing page with play buttons
4. Update FLORA README with game vision

**Effort:** 8–12 hours for full remediation (Trinity owner)
**Deadline:** This week (2026-03-17)

**Deliverable:** `.squad/decisions/inbox/oracle-showcase-report.md` (9.3KB)
