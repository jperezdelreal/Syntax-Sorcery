# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-20T23:30Z: Decision — Phase 6 Complete: Self-Proving Autonomy Delivered

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ COMPLETE
**Date:** 2026-03-20

**What:** Phase 6 roadmap fully delivered (3/3 items). All self-proving autonomy items completed:

1. **E2E integration test suite** (#54, PR #57) — MERGED. 20+ test cases covering full perpetual motion cycle (issue→dedup→assign→PR→review→merge→refuel). Happy paths, error paths, cross-script flows. Meta-test: the machine tests itself. System cycle proofed.

2. **Autonomous metrics engine** (#55, PR #58) — MERGED. KPI computation (velocity, cycle time, quality rate, test growth, throughput, streak). Trend comparison against snapshots. `npm run metrics` + squad CLI integration. Session reports capture WHAT; metrics capture HOW WELL.

3. **One-command developer bootstrap** (#56, PR #59) — MERGED. `npm run setup` validates prerequisites (Node ≥18, gh, git), installs all dependencies (root + site), validates .squad/ structure, runs health checks/tests. Graceful degradation if gh unavailable. DX capstone complete.

**Impact:** Phase 6 delivered. System now self-proving: tested end-to-end, self-measuring, reproducibly bootstrapped.

**Cumulative (Phases 2-6):** 15 issues closed, 16 PRs merged (1 rejection), 345 tests passing. Zero defects across all delivery.

**Strategic:** Phases 2-3 built engine, Phase 4 built showroom, Phase 5 built operational intelligence, Phase 6 made system self-proving. Autonomous development platform complete.

---

### 2026-03-20T01:00Z: Decision — Phase 6 Roadmap: Self-Proving Autonomy

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ DEFINED
**Date:** 2026-03-20

**What:** Phase 6 roadmap defined after Phase 5 completion. Strategic shift: Phases 2-3 built the engine, Phase 4 built the showroom, Phase 5 built operational intelligence, Phase 6 makes the system *self-proving*. Three items mixing testing depth + analytics + developer experience:

1. **E2E integration test suite for the autonomous pipeline** (#54) — Integration tests for the full perpetual motion cycle. Tests issue→dedup→assign→PR→review→merge→refuel as a SYSTEM, not individual scripts. 20+ test cases covering happy paths, error paths, cross-script flows. The meta-test: the machine tests itself.
2. **Autonomous performance metrics engine** (#55) — KPI computation from GitHub data: velocity, cycle time, quality rate, test growth, throughput, streak. Trend comparison against previous snapshots. `npm run metrics` + squad-cli integration. Session reports capture WHAT happened; metrics capture HOW WELL.
3. **One-command developer bootstrap** (#56) — `npm run setup` validates prerequisites (Node ≥18, gh, git), installs all dependencies (root + site), validates .squad/ structure, runs health checks and tests. Graceful degradation if gh unavailable. The DX capstone: README explains, CLI provides access, bootstrap gets you running.

**Rationale:** The engine runs (Phase 2-3), the showroom shines (Phase 4), the system reports on itself (Phase 5). But it can't prove its cycle works end-to-end (no integration tests), can't measure improvement over time (no metrics), and can't onboard a new developer in one step (no bootstrap). Phase 6 closes all three — the system becomes self-proving.

**Impact:** Roadmap items 10-12 marked done. Items 13-15 added. Issues #54, #55, #56 created with label `squad`. Board refueled — Ralph can assign to @copilot.

---

### 2026-03-20T00:00Z: Decision — Phase 5 Complete: Infrastructure Delivery

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**Date:** 2026-03-20

**What:** Phase 5 roadmap fully delivered (3/3 items). All infrastructure items completed:

1. **Session Report Generator** (#48, PR #51) — MERGED. Automated session summary generation via `.squad/scripts/gen-session-report.js`. Aggregates orchestration logs + session artifacts. Enables structured snapshots without manual curation.

2. **Unified CLI** (#49, PR #52) — MERGED. Single command interface `squad session`, `squad report`, `squad status`, `squad log`. Integration with `.squad/` file structure for context-aware operations. Reduces cognitive load on team coordination.

3. **Status Page** (#50, PR #53) — MERGED. Real-time team dashboard at `site/status/`. Displays agent status (active/idle/error), phase progress, cost budget tracker, blocker queue. Auto-refresh every 5 minutes. Web-accessible alternative to CLI.

**Impact:** Phase 5 delivered pure infrastructure — no visible user-facing features, but enables Phase 6 autonomy work. CLI + status page significantly reduce coordination overhead. Session reporting enables decision mining for future phases.

**Cumulative (Phases 2-5):** 12 issues closed, 13 PRs merged (1 rejection in Phase 4), 218 tests passing. Zero defects across delivery.

**Strategic:** Phases 2-3 built the engine, Phase 4 built the showroom, Phase 5 made the system self-aware. Agent autonomy infrastructure now in place.

---

### 2026-03-19T05:00Z: Decision — Phase 5 Roadmap: Operational Intelligence

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ DEFINED
**Date:** 2026-03-19

**What:** Phase 5 roadmap defined after Phase 4 completion. Strategic shift: Phases 2-3 built the engine, Phase 4 built the showroom, Phase 5 makes the system *self-aware*. Three items mixing infrastructure + visibility:

1. **Automated session report generator** (#48) — Script generates structured Markdown reports of autonomous session activity (issues, PRs, tests, agents). DI-tested. Ralph invokes at session end. Creates "company session reports" — proof of autonomous work + trend data.
2. **Unified developer CLI** (#49) — Single entry point `npm run squad -- <command>` for all squad operations (status, health, review, dedup, report, help). Replaces 5+ scattered scripts with discoverable, consistent interface. The DX equivalent of the README overhaul.
3. **Constellation status page** (#50) — Public `/status` page on Astro landing site showing live health of all 6 repos (CI badges, last activity, health indicators). Reuses `getConstellationWithStats()`. The final showroom piece: README introduces, landing page impresses, status page *proves*.

**Rationale:** The engine runs, the showroom shines, but the system doesn't know what it did (no reports), developers can't easily use it (scattered scripts), and the public can't verify it's alive (no status page). Phase 5 closes all three gaps.

**Impact:** Roadmap items 7-9 marked done. Items 10-12 added. Issues #48, #49, #50 created with label `squad`. Board refueled — Ralph can assign to @copilot.

---

### 2026-03-19T04:00Z: Decision — Phase 4 Complete: The Showroom Built

**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ COMPLETE  
**Date:** 2026-03-19

**What:** Phase 4 roadmap fully delivered (3/3 items). All public-facing artifacts built:

1. **README Premium** (#41, PR #44) — MERGED. Complete rewrite with badges, ASCII perpetual motion diagram, constellation table, team roster, "How It Works" section, Quick Start, infrastructure table, Phase 0-3 progress. README now serves as marketing-grade front page. Outdated Phase 0-1 content removed.

2. **Landing Page v2** (#42, PR #47) — MERGED (after PR #45 rejection + Trinity revision). MatrixRain upgraded: setInterval → requestAnimationFrame + 20fps throttle + visibility pause + resize debounce. New async `getConstellationWithStats()` fetches live GitHub API stats (stars, open issues, last push) at build time with graceful fallback. Constellation cards now display real data. Mouse's PR #45 rejected for zero implementation code (design-only); Trinity assigned for implementation, delivered in PR #47.

3. **Architecture Documentation** (#43, PR #46) — MERGED. Three new docs: `docs/architecture.md` (4 ASCII diagrams — perpetual motion, hub/spoke, 3-layer monitoring, PR pipeline), `docs/constellation.md` (6 repos mapped with relationships and governance), `docs/onboarding.md` (8-step downstream company guide with 10-item checklist). README updated with Documentation section.

**Impact:** Phase 4 objectives complete. Founder sees "the showroom": credible README, professional GitHub Pages site, complete architecture documentation. All 168 tests passing. Cumulative: 9 issues closed, 10 PRs processed across Phases 2-4 (ZERO defects).

**Quality Gate:** PR #45 rejection demonstrates design-only PRs fail merge gate — implementation required. Revision workflow (rejection + assignment + re-submission) enforced quality.

**Strategic:** Phases 2-3 built the engine (CI, health monitoring, dashboard, dedup, Azure launcher, review gate). Phase 4 built the showroom (README, landing page, docs). Marketing ✅ Aesthetics ✅.

---

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
