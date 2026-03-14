# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-21T00:00Z: T1 Decision — Ralph Refueling Protocol Redesign

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** 📐 DESIGN PROPOSED — pending founder approval

**Executive Summary:**

Replaces event-driven `perpetual-motion.yml` with loop-driven internal refueling (Ralph→Lead→issues→Ralph). Eliminates race conditions and duplicate issues by moving refueling decision to single-threaded Ralph. Lead spawned with full context (history, PRs, roadmap) creates exactly 3 issues per cycle, max 3 cycles per session (9 issues max).

**Key Parameters:**
- **Architecture:** Single-threaded refueling within session (Ralph controls cycle timing)
- **Issues per cycle:** Exactly 3 (quality threshold + prevent overhead)
- **Max cycles/session:** 3 (9 issues max, prevents context saturation)
- **Safeguards:** Cycle counter, completed-issue check, quality prompt with anti-repetition rules
- **Eliminates:** perpetual-motion.yml (GitHub Actions coupling)
- **Resolves:** Race conditions, dedup storms, lack of context, external coupling
- **Recommended:** Opción C (detailed safeguards + full implementation)

Full technical design (2.4 Decisión T1 phases, implementation sections, safety analysis) archived in orchestration log for reference: `.squad/orchestration-log/2026-03-14T09-24Z-morpheus-refueling-redesign.md`

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
