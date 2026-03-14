# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-21T10:42Z: T1 Decision — Refueling v2 Implemented

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ IMPLEMENTED  
**Date:** 2026-03-21

**What:** Refueling v2 protocol implemented in Syntax Sorcery. Two files changed:

1. **`.github/agents/squad.agent.md`** — 3 surgical edits:
   - Step 2 "No work found" row: idle → Sprint Planning ceremony trigger
   - Step 6 (Ralph check): updated to mention Sprint Planning auto-refuel
   - "Between checks" paragraph: rewritten for perpetual continuous loop

2. **`.squad/ceremonies.md`** — Added Sprint Planning ceremony:
   - Trigger: auto, When: before, Condition: board clear
   - Facilitator: lead, Participants: lead-only
   - Agenda: read project state → analyze holistically → create N issues → anti-repetition check → natural endpoint detection

**Why:** Founder approved the v2 design. The system now has perpetual autonomy — when the board clears, Ralph triggers Sprint Planning instead of idling. No artificial caps, no mechanical counters. The Lead strategically decides what comes next.

**Impact:** Ralph can now run indefinitely without human intervention to refuel the board. This is the foundation for 24/7 autonomous operation on Azure VM (Test 3).

**Orchestration Log:** `.squad/orchestration-log/2026-03-21T10-42Z-morpheus-refueling-v2-impl.md`

---

### 2026-03-14T09:36Z: T1 Decision — Ralph Refueling Protocol v2 (Supersedes v1)

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** 📐 DESIGN PROPOSED — pending founder approval  
**Replaces:** Refueling v1 (mechanical 3 issues × 3 cycles) 

**Executive Summary:**

When board clears, Ralph no longer idles. Instead, invokes **Sprint Planning ceremony** — Lead analyzes project state (recent issues, PRs, roadmap, README, .squad/decisions) and creates N issues organically. Ralph detects new untriaged issues and continues working. **No artificial cycle caps.** System runs 24/7 until user says "idle" or Lead declares project at natural endpoint.

**Key Parameters:**
- **Architecture:** Organic refueling via Lead strategic planning (not mechanical counters)
- **Issues per cycle:** N issues (2-7), whatever makes sense for project state
- **Max cycles:** None — perpetual until natural endpoint or user stop
- **Trigger:** Board clear (no open issues with label `squad`)
- **Ceremony:** Sprint Planning (lead-only, reads closed issues, merged PRs, roadmap, README, decisions)
- **Safeguards:** Lead anti-repetition rules, project-completion detection, explicit "natural endpoint" declaration
- **Eliminates:** Cycle caps, mechanical 3-issue rule, perpetual-motion.yml
- **Resolves:** Artificial limitations on 24/7 autonomy, mechanical approach to strategic planning

**Founder Feedback Incorporated:**
1. ✅ No 3-cycle cap — 24/7 autonomy with session management via founder resets (local) or auto-reset (Azure future)
2. ✅ Organic issue creation via Lead Sprint Planning (not mechanical "create 3 issues")
3. ✅ Ceremonies as refueling triggers — Sprint Planning on board clear
4. ✅ Full context for Lead strategic decisions

**Changes Required:**
1. ceremonies.md — Add "Sprint Planning" ceremony definition
2. squad.agent.md — 3 surgical changes (Step 2 "No work found", Integration flow, "Between checks" section)
3. No code changes needed (design-only at this stage)

Full technical design and founder feedback archived in orchestration log: `.squad/orchestration-log/2026-03-14T09-36Z-morpheus-refueling-v2.md`

---

### 2026-03-14T09:35Z: Founder directive — Refueling v2 requirements

**By:** jperezdelreal (via Copilot)

**Correcciones al diseño de Morpheus:**

1. **NO limitar a 3 ciclos por sesión** — El objetivo es autonomía 24/7. En PC local, el founder reseteará sesiones periódicamente. En Azure VM (Test 3), el equipo debe auto-resetear sesiones. Las sesiones usan modelo 1M context — hay margen.

2. **NO crear 3 issues directos** — Mejor: el Lead crea issues orgánicamente via Sprint Planning ceremony. Más orgánico que crear 3 issues atómicos fijos.

3. **Aprovechar ceremonias existentes** — El refueling debería triggear Sprint Planning que naturalmente produce issues como output de análisis estratégico.

4. **Azure VM session management** — El equipo debe ser capaz de resetear sus propias sesiones cada X tiempo cuando corra en Azure (Test 3).

**Why:** El founder quiere autonomía real 24/7, no limitada. El mecanismo debe ser orgánico (planning → issues) y menos mecánico (3 issues fijos).

---

### Previous Active Decisions

### 2026-03-14T09:14Z: User corrections + directive — Test 2 post-mortem

**By:** jperezdelreal (via Copilot)

**What:**

**Correcciones al post-mortem de Test 2:**
1. FFS (FirstFrameStudios) NO fue ejecutado intencionalmente — el founder tenía dudas sobre si tenía sentido, así que no lanzó la terminal. No fue un fallo técnico.
2. El setup real fue: en cada terminal se pidió al Lead local que trabajase en un plan a 8 horas de distancia, y que ejecutase "Ralph, go" si el proceso se paraba. Esto NO funcionó como se esperaba.

**Directiva — Perpetual motion roadmap refueling:**
La idea de que Ralph Go sea el que genere el issue "Define next roadmap" NO ha funcionado bien. La duplicación masiva (41 en flora, 16 en ComeRosquillas) demuestra que este enfoque es fundamentalmente problemático. Hay que replantear el mecanismo de refueling del roadmap.

**Why:** Correcciones factuales del founder + lección aprendida sobre arquitectura de autonomía. Crítico para diseñar Test 3 correctamente.

---

### 2026-03-14T09:00Z: Decision — Post-Mortem Test 2: Ralph Go Multi-Terminal

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ EVALUATED
**Date:** 2026-03-14

**What:** Test 2 "Ralph Go Multi-Terminal" was the second autonomy test of the Syntax Sorcery constellation. Executed on March 13, 2026 at 20:42 UTC with ~5 hours duration across 6 terminals (1 hub + 5 satellites across 5 universes). Result: 5/6 repos producing autonomous work, ~86 PRs merged, ~113 issues closed, zero human intervention.

**Outcome:** ✅ SCORED 8/10 (improvement from Test 1: 7/10)

**Key Findings:**

1. **Throughput Explosion:** 86 PRs in 5 hours (+2767% vs Test 1's 3 PRs). Multi-terminal is a multiplicative force — achieved 29x output. Repos: pixel-bounce (8 PRs, perfect execution), ffs-squad-monitor (30 PRs, most productive), flora (16 PRs + 41 duplicates), ComeRosquillas (14 PRs + 16 duplicates), Syntax Sorcery hub (17 PRs + 1 rejection), FirstFrameStudios (0 PRs, inactive).

2. **🔴 CRITICAL: Dedup Storm.** Perpetual-motion.yml creates "Define next roadmap" issue on each roadmap exhaustion. At 86 PRs, ráfaga merges trigger 8+ simultaneous workflow runs → 8+ duplicate issues created. Flora: 41 duplicados, ComeRosquillas: 16 duplicados. This was Test 1 deficiency #2, NOT fixed, now amplified by volume. Dedup guard required BEFORE Test 3.

3. **🟡 MEDIUM: FirstFrameStudios inactive.** FFS is hub repo (strategic, not implementation). Issue #199 "Define next roadmap" was strategic/abstract — Ralph couldn't execute it. Actionable issues required (concrete "create X", "fix Y", "add Z").

4. **🟡 MEDIUM: Auto-merge without review.** Many PRs merged <10s after creation (e.g., pixel-bounce PR#15: 3 seconds). Suggests auto-merge bypassing review. SS hub enforced review gate (PR#45 rejected), but downstream repos lack branch protection. Risk at scale.

5. **✅ STRENGTH: Quality gate functional.** PR#45 (design-only) rejected in SS hub. Review gate works in hub, maintaining standards.

6. **✅ STRENGTH: Real features delivered.** Not empty PRs. Games with complete systems (achievements, daily challenges, power-ups, skins, audio), real-time dashboards, entire DevOps stack (CI/CD, metrics, bootstrap, security hardening).

7. **✅ STRENGTH: Multi-universe autonomy proven.** 5 universes (Matrix, Pokémon, Simpsons, Mega Man, Alien) operated independently. Context separation by repo works perfectly.

**Rationale for 8/10:**
- Base 7/10: Autonomous system functions (same as Test 1)
- +2: Extraordinary throughput improvement (86 vs 3 PRs), multi-terminal multiplication verified
- +1: Multi-iteration perpetual cycles, real features delivered, 345 tests passing
- -1: FFS completely inactive (17% waste)
- -1: Dedup deficiency repeated and amplified (known bug not fixed, worse at scale)

**Pre-Requisites for Test 3 (MANDATORY):**

1. **[CRÍTICO] Fix dedup guard in perpetual-motion.yml** — Check if "Define next roadmap" exists before creating. Clean flora (#161-#176) and ComeRosquillas (#80-#81) duplicates.
2. **[CRÍTICO] Branch protection on downstream repos** — Require ≥1 passing CI check + optional review before merge.
3. **[ALTO] Verify actionable issues** — All repos need concrete implementation issues, not strategic roadmaps.
4. **[MEDIO] Azure VM provisioning** — B2s v2 (Ubuntu 24.04, West Europe, 2 vCPU, 4GB RAM, ~€25-30/mo).
5. **[MEDIO] Satellite operation scripts** — start-satellites.sh, reset-satellite.sh, systemd auto-restart.

**Lessons Learned:**

1. Multi-terminal ≠ N×single-terminal. It's exponential. Independent contexts multiply efficiency.
2. Dedup guard scales as O(n²) — tolerable at 3 PRs, catastrophic at 86. Blocker for Test 3.
3. Auto-merge without review risky at scale (86 PRs). Branch protection mandatory.
4. Hub repos need concrete, actionable issues — not strategic roadmaps.
5. Local PC not viable for 24/7 operation. Azure confirmed necessary.

---

## Archived Decisions (>14 days old)

See decisions-archive.md for entries older than 2026-03-14 (Phases 2-5 roadmaps, Phase 5/6 completions, Phase 4 roadmap).

---

## Merge Gates Directive

**User Requirement:** When `gh pr merge` fails due to required reviews or status checks, agents must report the blocker instead of failing silently. Critical for autonomous operations: Ralph and agents must detect and report merge gates.

---

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |
