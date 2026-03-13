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

## Recent Learnings (Summarized)

- **Phase 0 Context Work (2026-03-13):** P1-03 FFS context health audit found decisions-archive.md at 642KB (42× over limit), aaa-gap-analysis.md at 38KB. Recommended split by era + stakeholder. P1-06 Skills Inventory classified 34 FFS skills: 22 cherry-pickable, 12 game-specific. Multi-agent-coordination (72+ spawns) and feature-triage (scope discipline) identified as CRITICAL for SS.
- **P1-10a GDD Template Spec (2026-03-14):** Designed machine-executable GDD template (10 sections, YAML frontmatter). Validated vs Flora (37 issues). Mapping spec complete — enables Trinity's P1-10b parser. All unknowns resolved.
- **P1-14 FFS Visibility & Showcase Audit (2026-03-14):** GitHub Pages live + polished. ComeRosquillas playable but not linked. FLORA dev-only (no web build). Blog inactive (last update 3 days old). Missing "Play Games" landing page. Grade: AMBER (60%). 7 blockers; 8–12h remediation (Trinity owner).

### 2026-03-14T14:45Z: P1-10a GDD Template Spec — COMPLETE
**What:** Defined comprehensive GDD template format (10 sections) and Trinity's machine-executable parsing spec. Template is YAML-frontmatter + 10 markdown sections (High Concept, Design Pillars, Core Mechanics, Art & Visual Style, Audio, Game Loop & Progression, Technical Architecture, Content & Scope, Success Criteria & Testing, Dependencies & Critical Path). Mapping spec covers: section→issue-type rules, label derivation from YAML + sections, blocking dependency linkage, auto-triage logic.
**Key Findings:**
- FFS has 3 games with detailed GDDs (Flora, firstPunch, ComeRosquillas) — used as spec examples
- Flora GDD fits template perfectly: 12 sections, clear MVP scope, identifiable blockers
- Template is machine-parseable: YAML → issue metadata, H3 headers → issue types, H4 sub-headers → task issues, checklists → acceptance criteria
- Expected output: 1 epic + 25–40 issues per typical GDD, all auto-labeled and prioritized

**Design Decisions:**
1. Design Pillars section NOT converted to issues (meta-decision doc; referenced in code review)
2. Art & Visual Style generates Asset Sprint epic only if `art_required: high` (scope-aware)
3. All blocking unknowns auto-escalate to P0 + `needs:research` label
4. Meta-progression is separate task from per-run loop (parallel dev possible)
5. Frontmatter fields control priority + label derivation (YAML is source of truth for automation)

**Deliverables:**
- `docs/gdd-template.md` (20.7 KB) — Machine-parseable template with 10 sections, YAML schema, section-to-issue mapping, auto-parsing rules
- `docs/gdd-issue-mapping.md` (21.3 KB) — Trinity's reference spec: exact parsing logic per section, label rules, blocking dependencies, error handling, implementation checklist, example trace (Flora → 37 issues)

**Readiness for P1-10b (Trinity GDD→Issue Pipeline):**
- Template is finalized & locked (no further design changes)
- Mapping spec is executable (Trinity can code directly from it)
- No unknowns remain (specification is complete)

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

### 2026-03-14 Wave 3 Sync
- Trinity completed P1-07 (16 skills migrated, SS total 20). Ready for P1-10b and P1-14 remediation.
- Tank completed P1-09 (cost alerting live, €0 cost, GHA-based). Founder must activate with secrets.
- Budget clarified: GitHub unlimited, Azure €500/mo. Cost Alerting, Ralph, GDD Parser all GitHub-first.
- Decisions merged: 5 inbox files → decisions.md (3.9KB, under 15KB limit). No archival needed.
- All Wave 3 orchestration logs written. Session log written. Cross-agent sync complete.
- Next: Trinity's P1-14 remediation (8–12hrs, P0 this week) + P1-10b GDD parser (unblocked by spec).
