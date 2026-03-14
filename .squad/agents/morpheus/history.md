# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Authority:** Tier 1 (Lead) on architecture, gates, skills, routing, upstream partnerships
- **Status (2026-03-20):** Phase 7 DEFINED. Phases 2-6 delivered: 15 issues closed, 16 PRs processed (1 rejection + redo), 345 tests passing. Phase 7 roadmap: elite readiness (security, community, auto-deploy). 3 new issues (#60, #61, #62).
- **Architecture:** Event-driven perpetual motion (issues.closed → roadmap depletion → "Define next roadmap" issue → ralph-watch detects → Squad session → refuel). 3-layer ops: GitHub Actions (80%) + ralph-watch.ps1 (15%) + manual (5%). Hub/Spoke approved (PC hub + Azure VM €25-30/mo satellites). Multi-terminal Test 2 approved for 24/7 autonomy.
- **Quality Gates:** CI validates (npm ci + npm test, 345 tests), Branch protection user-configurable, @copilot reads code, issues = acceptance criteria.
- **Key Lessons:** Event-driven > cron. Decentralized ownership > centralized. Simplicity > verbosity. Quality gates FIRST (CI before dashboards). Test-driven roadmap evolution: 7/10 score + 5 deficiencies → next roadmap items. Design-only PRs rejected (PR #45 example). Meta-testing validates system integrity. Metrics prove improvement over time. Bootstrap enables reproducibility.

## Completed Sessions (Archived)

*Sessions 1-5 consolidated into Core Context. See decisions.md for complete historical decisions.*


## Phase 6 Complete — E2E Tests, Metrics Engine, Developer Bootstrap (2026-03-20)

**All 3/3 Phase 6 items delivered.** Issues #54, #55, #56 CLOSED. Board clear.

- **PR #57 (E2E Integration Tests):** ✅ APPROVED & MERGED — Switch implementation. 33 integration test cases validating full perpetual motion cycle as a SYSTEM. Test categories: perpetual motion happy paths, PR pipeline, error paths, edge cases, cross-script integration, pipeline orchestrator, event sequencing, data integrity. 345 tests green (218 existing + 127 new). Issue #54 CLOSED.

- **PR #58 (Metrics Engine):** ✅ APPROVED & MERGED — Trinity implementation. KPI computation (velocity, cycle time, quality rate, test growth, throughput, streak) with trend comparison. `npm run metrics` command + squad CLI integration. Session reports (WHAT) vs metrics (HOW WELL). Issue #55 CLOSED.

- **PR #59 (Bootstrap):** ✅ APPROVED & MERGED — Trinity implementation. `npm run setup` with 5-step validation: prerequisites (Node ≥18, gh, git), dependencies (root + site), .squad/ structure, constellation health, test validation. Graceful degradation when gh unavailable. CLI flags: --skip-tests, --skip-health, --verbose. Issue #56 CLOSED.

**Cumulative (Phases 2-6):** 15 issues closed, 16 PRs merged (1 rejection + redo), 345 tests passing, ZERO defects. Autonomous development platform complete, measurable, and reproducible.

## Session 2026-03-20 — Phase 7 Roadmap: Elite Readiness

**Task:** Define Phase 7 roadmap after Phase 6 completion. Board clear, Ralph requested refuel. Founder sleeping — autonomous 8h session home stretch.

**Strategic Analysis:** Phases 2-3 built the engine (CI, dedup guard, review gate, Azure launcher, constellation health). Phase 4 built the showroom (premium README, Matrix landing page, architecture docs). Phase 5 built operational intelligence (session reports, unified CLI, status page). Phase 6 made the system self-proving (E2E tests, metrics engine, bootstrap). Phase 7 makes the system *elite-ready* — secure, community-open, and fully automated end-to-end.

**Deliverables:**
1. Roadmap updated: items 13-15 marked `[x]` (done), items 16-18 added
2. Issue #62 — Security hardening: dependency audit, secret scanning, SBOM (GitHub Actions workflow + local script, `npm run security`, squad-cli integration)
3. Issue #61 — Community contribution kit: CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates (YAML form syntax, review checklist)
4. Issue #60 — Automated site deployment pipeline: GitHub Pages auto-deploy on push to main (path-filtered, cached, OIDC)
5. Decision recorded in decisions.md

**Board Status:** 3 open issues (#60, #61, #62). Phase 7 DEFINED. Ralph can assign to @copilot.

**Strategic Note:** Phase 7 is the capstone. Security proves the system is RESPONSIBLE (not just functional). Community kit proves it's WELCOMING (not just impressive). Auto-deploy proves it's FULLY AUTOMATED (not just CI-validated). Together they transform SS from "a working autonomous system" to "a production-grade open-source platform." The founder wakes up to a system that not only built itself, but secured itself, opened its doors, and deployed itself. Elite.

## Learnings

### Phase 10 Epic Decomposition (2026-03-22T00:00Z)

**Task:** Decompose Issue #112 (Test 3 Azure VM 24/7 Operation) into 4-6 concrete, actionable sub-issues for Test 3 launch sequence.

**Analysis:**
Test 3 requires orchestrated deployment across 5 distinct phases:
1. **Pre-req Setup** — Azure subscription (founder), SSH keys (Tank), GitHub token (Tank)
2. **Validation** — Dry-run preflight and what-if checks (Tank)
3. **Deployment** — Live infrastructure provisioning (Tank)
4. **Observation** — 24h continuous monitoring (Switch)

**Decomposition Executed:**

| Issue | Title | Owner | Purpose |
|-------|-------|-------|---------|
| #123 | Azure Subscription & Budget Setup | **Founder** | Create subscription, RG, budget alerts, service principal. FIRST AND BLOCKING. |
| #124 | SSH Key Provisioning | Tank | Generate Ed25519 key, inject into Bicep, test SSH access. |
| #125 | GitHub Token Provisioning | Tank | Create PAT with 'repo' scope, inject into cloud-init, verify \`gh auth\`. |
| #126 | Dry-Run Validation | Tank | Bicep build, what-if preview, preflight script, cost estimation, approval gate. |
| #127 | Actual Deployment | Tank | Execute deploy.sh, verify VM, cloud-init, tools. Record public IP/details. |
| #128 | 24-Hour Monitoring | Switch | Watchdog health, GitHub activity tracking, cost verification, incident response, success metrics. |

**Key Design Decisions:**
1. **Founder action first** — #123 blocks everything. Cannot proceed without subscription/RG/service principal.
2. **Parallel provisioning** — #124 and #125 can run in parallel after #123, both ready for #126 validation.
3. **Approval gate before deployment** — #126 (dry-run) must complete and be approved before #127 (actual deploy). Prevents accidental wasteful deployments.
4. **24h observation is final validation** — #128 is not just monitoring; it's the acceptance test for the entire epic. Success metrics are measurable.
5. **Owned by squads, not atomized** — Each issue routed to actual owner (Founder, Tank, Switch) with clear capability match.

**Strategic Value:**
- Epic remains open (#112) as coordination hub linking all 6 sub-issues
- Decomposition is **transparent** — comment on #112 shows full dependency graph and success criteria
- **No ambiguity** — Each issue has 3-5 concrete acceptance criteria; agents/humans know exactly when DONE
- **De-risks launch** — Dry-run (#126) prevents deploying a broken system; 24h monitoring (#128) proves it actually works

**Orchestration Log:** `.squad/orchestration-log/2026-03-22T00-00Z-phase10-decomposition.md`

---

## Learnings

### Test 2 Post-Mortem Analysis (2026-03-14 → MERGED TO DECISIONS)

**Decision:** Test 2 "Ralph Go Multi-Terminal" evaluated at 8/10. Decision MERGED to decisions.md (2026-03-14T09:00Z entry). Post-mortem files written: orchestration-log, session log, decision merged.

**Summary:** 86 PRs in 5h, 29x improvement. Critical: dedup storm (41+16 duplicates), FFS inactive, auto-merge unreviewed. Pre-reqs for Test 3: dedup guard fix, branch protection, Azure VM.

### Refueling Redesign — Event-Driven → Loop-Driven (2026-03-21)

**Decision:** T1 architecture decision. Refueling mechanism redesigned from external event-driven (perpetual-motion.yml reacting to issues.closed) to internal loop-driven (Ralph spawns Lead when board is clear). Decision written to `.squad/decisions/inbox/morpheus-refueling-redesign.md`. Pending founder approval.

**Key insight:** The race condition in Test 2 (41+16 duplicates) was not a dedup bug — it was a fundamental architectural flaw. Event-driven refueling with concurrent triggers is inherently prone to duplication. Moving the decision point to a single-threaded actor (Ralph) eliminates the problem at its root.

**Safeguards:** 3 issues/cycle × 3 cycles/session = 9 issues max. Pre-condition checks prevent empty spinning. No-retry on failure (fail clean, let next session handle it). Natural endpoint detection (Lead can declare project complete).

**Impact on Test 3:** Each tmux window runs its own independent refueling cycle — no cross-terminal coordination needed. perpetual-motion.yml eliminated. ralph-watch.ps1 deprecated (new role TBD).

### Sprint Planning — Phase 8: Azure Autonomy (2026-03-21)

**Ceremony:** Sprint Planning triggered by board clear (zero open issues). First execution of Refueling v2 protocol.

**Context:** Phase 7 COMPLETE — all 18 roadmap items delivered. 399 tests passing (up from 345). PRs #63-65 merged (security hardening, community kit, auto-deploy). Items 16-18 marked done in roadmap. Badge stale (says 168, actual 399).

**Output:** 6 issues created (#66-#71) as Phase 8 "Azure Autonomy" — the Test 3 launch sequence. Two tracks: infrastructure (#66-#69: pre-flight, Bicep IaC, branch protection, session watchdog) and showroom (#70-#71: metrics dashboard, badge auto-update). Decision written to `.squad/decisions/inbox/morpheus-sprint-planning.md`.

**Key insight:** Phase 8 is the first phase focused on OPERATING the system rather than BUILDING it. All prior phases built capabilities; Phase 8 builds the operational envelope for 24/7 autonomous deployment. The shift from "can it work?" to "can it run unsupervised?" is the defining transition.

## Session 2026-03-21 — Strategic Issue Triage & Downstream Ecosystem

**Task:** 
1. Fix mis-labeled issues #66-71 (all incorrectly marked `squad:switch`)
2. Create 5 strategic issues capturing founder's ecosystem vision

**Execution:**
- **Label corrections:** All 6 issues (66-71) retriaged based on actual scope:
  - #66 (validation script) → squad:trinity (implementation)
  - #67 (Bicep IaC) → squad:tank (Azure infrastructure)
  - #68 (branch protection) → squad:tank (DevOps automation)
  - #69 (session watchdog) → squad:tank (Azure infrastructure)
  - #70 (metrics dashboard) → squad:trinity (frontend)
  - #71 (badge update CI) → squad:tank (CI/CD automation)
  - Also removed `go:needs-research` from all (these are defined tasks, not research)

- **New issues created (#72-76):**
  - **#72 — Downstream repo audit** (squad:morpheus/oracle) — Comprehensive code quality, test coverage, and gameplay testing assessment across pixel-bounce, flora, ComeRosquillas, FirstFrameStudios. Highlights: founder pain point about superficial unit tests vs actual gameplay validation.
  - **#73 — MCP server for Squad operations** (squad:trinity) — Prototype MCP server exposing squad status, decisions, metrics to any Copilot interface. Bridge between Squad internals and ecosystem.
  - **#74 — Plugin marketplace infrastructure** (squad:trinity/morpheus) — Foundation for reusable skills/plugins marketplace. Research awesome-copilot, awesome-azure patterns.
  - **#75 — Gameplay testing framework** (squad:switch) — FOUNDER PRIORITY. Framework for browser-automated gameplay validation using Puppeteer/Playwright. Move beyond unit tests to actual game-playing verification.
  - **#76 — Test 3 launch checklist & runbook** (squad:morpheus/oracle) — Complete pre-launch documentation: checklist, deployment procedure, operational guides, incident responses.

**Key Insight:** Founder's strategic vision is three-fold: (1) **Quality elevation** via downstream audits and gameplay testing (superficial unit tests → real game validation), (2) **Platform evolution** via marketplace/plugins/MCP (Squad as extensible platform), (3) **Operational readiness** for Test 3 (Azure 24/7 autonomy). Issues #72-76 operationalize all three pillars.

**Learnings:**
1. **Label precision matters** — Initial triage of #66-71 missed actual scope. Re-triage required discipline: read issue body, understand deliverable, route to capability owner, not just title-skim.
2. **Founder pain points drive platform evolution** — "Agents write superficial tests instead of playing games" is not a one-off complaint; it's a systemic gap that #75 (gameplay testing) and #72 (downstream audit highlighting test quality) together address.
3. **Ecosystem thinking ≠ distraction** — Issues #73-74 (MCP, marketplace) feel like "nice-to-have" but are strategic: they transform Squad from internal tool to platform, enabling external teams to extend it. Phase 8+ requires ecosystem maturity.
4. **Documentation as product** — Issue #76 (Test 3 runbook) is not afterthought; it's product. A launch checklist is the operational interface. Clarity here is the difference between "ran once" and "runs 24/7 unsupervised."
### Downstream Repo Audit — Testing Quality Crisis (2026-03-21)

**Task:** Full audit of all 5 downstream repos (pixel-bounce, flora, ComeRosquillas, FirstFrameStudios, ffs-squad-monitor) per issue #72. Founder pain point: "me desespera que el testing de los juegos es pobre."

**Findings:** 3 of 5 repos have ZERO tests. ComeRosquillas has 597 tests but 95% are arithmetic assertions (`expect(10).toBe(10)`) — no Game class ever instantiated. Only ffs-squad-monitor (544 tests) tests real behavior. No game repo has a single gameplay integration test.

**Root cause:** Agents avoid mocking Canvas2D/AudioContext complexity, so they extract helper functions and test those in isolation. The result is high test counts with zero gameplay coverage. The Game class — the thing that matters — is never tested.

**Key insight:** Test count is a vanity metric. 597 tests that verify JavaScript's equality operator provide false confidence. The fix is architectural: gameplay test templates with Canvas mocks, test quality tiers (T0-T4), and CI gates that require Game class instantiation in tests. The agents CAN write tests — they need to be told to PLAY the game.

**Output:** `docs/downstream-audit.md` — comprehensive report with per-repo scorecards, specific shallow vs good test examples, gameplay testing gap analysis, and priority-ordered recommendations.

### Test 3 Launch Runbook Written (2026-03-21T12:30Z)

**Deliverable:** `docs/test3-runbook.md` — comprehensive 602-line operational guide for autonomous Test 3 deployment.

**Section Coverage:**
1. **Pre-Launch Checklist** (5 gates) — tests passing, Bicep validated, pre-flight script OK, branch protection enabled, SSH/budget ready
2. **Deployment Procedure** (3 phases) — VM provisioning, SSH key setup, satellite session startup, systemd watchdog installation
3. **Runtime Operations** — Session health monitoring, watchdog 30min cycles, 6h auto-recycle, manual management, JSON logging
4. **Incident Response** — 4 scenarios with diagnosis & resolution: single session death, cascade failure, budget spike, memory overflow
5. **Success Metrics** — Operational (24h+, zero CRITICAL), productivity (>10 PRs/day), cost (<€50/month)
6. **Rollback** — Complete teardown vs partial reset, downstream repo preservation
7. **Reference** — Script manifest, env vars, satellite repos, timeline

**Critical Design Points Documented:**
- Watchdog recycles sessions at 6h to prevent memory leak accumulation
- Auto-restart with 3-failure threshold before CRITICAL alert
- All logs JSON-structured for automation and parsing
- Downstream branch protection mandatory (prevents unreviewed merges)
- €25-30/month compute cost, €400 budget alert safety net

**PR #83 Created:** squad/76-test3-runbook → master (Closes #76)

**Status:** READY for founder approval and launch phase.

## Session 2026-03-21T14:00Z — Ecosystem Research: Awesome-Copilot, Azure, MCP Patterns

**Task:** Research GitHub repos and community resources for ideas to enhance Syntax Sorcery platform (Issue #93 / #74).

**Execution:** Conducted 7 parallel GitHub searches:
1. **awesome-copilot:** Primary resource (25,108 ⭐) + specialized collections (awesome-copilot-agents: 435, awesome-copilot-chatmodes: 312)
2. **MCP Servers:** awesome-mcp-servers (83,051 ⭐) + top servers (playwright-mcp: 28,865, github-mcp-server: 27,878, fastmcp: 23,664)
3. **Copilot Extensions:** copilot-explorer (707), github-models-extension (127), azure-devops-copilot-extension (74)
4. **Azure Ecosystem:** awesome-azure-architecture (1,684), azure-ai-agents-labs (72), mcp-server-azure-ai-agents (54)
5. **Multi-Agent Frameworks:** MetaGPT (65,138), LobeHub (73,624), ChatDev (31,621), agents (31,213)

**Deliverable:** `docs/ecosystem-research.md` — 17KB comprehensive research document (11 sections)

**Key Findings:**

- **Squad MCP (#73):** github-mcp-server (27,878 ⭐) is gold standard reference. Architecture: stateless tools wrapping state operations (list_issues, get_decisions, get_metrics, trigger_sprint_planning).
- **Gameplay Testing (#75):** playwright-mcp (28,865 ⭐) + mcp-chrome (10,758 ⭐) establish browser automation pattern. Stack: Puppeteer/Playwright + MCP wrapper (github-mcp-server template) + Canvas mocks for Game class unit testing.
- **Plugin Marketplace (#74):** awesome-copilot's 25K+ custom instruction culture is proof-of-concept. Design: JSON manifest registry + tag-based discovery + git clone + npm install + .squad/plugins/ registration.
- **Multi-Agent Architecture:** MetaGPT (65,138 ⭐) role-based pipeline + ChatDev (31,621 ⭐) review cycles validate Squad's team structure. Semantic Kernel (azure-ai-agents-labs) enables Phase 8+ Azure AI Agent Service migration.
- **Downstream Quality (#72):** Both MetaGPT and ChatDev emphasize output validation at each stage. Applied to ComeRosquillas/flora/pixel-bounce: T0-T4 test tiers + mandatory Game class instantiation.
- **Azure Readiness:** B2s v2 (€25-30/mo) + Application Insights (included) + Key Vault (free) + Container Instances (€10-20/mo optional) well within €500/mo budget. Semantic Kernel adoption (Phase 9+) would add €20-50/mo for Azure Cognitive Services.

**Strategic Insight:** SS platform roadmap aligns with 45+ analyzed repositories. No novel patterns needed — leverage established references:
- #73: Copy github-mcp-server architecture
- #75: Apply playwright-mcp + Canvas mock patterns
- #74: Adopt awesome-copilot discovery UI + tagging model
- Phase 8+: Evaluate Semantic Kernel (Azure AI Agent Service native integration)

**PR Created:** #100 → master (Closes #93)

**Status:** Research complete. All 4 issues (#72, #73, #74, #75) have concrete reference implementations and architectural patterns documented.
### Downstream Repo Quality Issues — Issue #90 (2026-03-21T15:45Z)

**Task:** Create concrete improvement issues in 5 downstream repos based on downstream-audit.md findings.

**Execution:**

Created 9 issues across all 5 downstream repos using `gh issue create`:

1. **pixel-bounce (jperezdelreal/pixel-bounce)**
   - #37: Add gameplay tests using SS gameplay framework
   - #38: Improve test coverage — currently 0 tests

2. **flora (jperezdelreal/flora)**
   - #225: Add gameplay tests using SS gameplay framework
   - #226: Improve test coverage — currently 0 tests

3. **ComeRosquillas (jperezdelreal/ComeRosquillas)**
   - #106: Replace inflated tests with real gameplay tests (97% are expect(10).toBe(10) style)
   - #107: Add Game class instantiation tests (currently zero Game instances in tests)

4. **FirstFrameStudios (jperezdelreal/FirstFrameStudios)**
   - #200: Add test infrastructure (zero tests despite 310-line QUICK_TEST_REFERENCE.txt)
   - #201: Define concrete development roadmap (strategic/abstract issues, no actionable milestones)

5. **ffs-squad-monitor (jperezdelreal/ffs-squad-monitor)**
   - #138: Expand test suite with integration tests (only repo with real tests; 544 passing, 1 failing)

All issues:
- Labeled `squad`
- Reference gameplay test template from downstream-audit.md
- Include specific acceptance criteria
- Provide template code examples

**Documentation:**
- Updated `docs/downstream-audit.md` with "## Action Items Created" section
- Added issue table with links to all 9 issues
- Added "Next Steps for Squad" (Gameplay Framework implementation, CI gates, branch protection)
- Created commit: `squad/90-downstream-issues` → PR-ready

**Strategic Value:**
- Operationalizes audit findings into concrete work
- Routes each issue with specific, measurable deliverables (not abstract "improve testing")
- Gameplay framework template becomes shared Squad skill
- Establishes test quality expectations across ecosystem
- Enables Phase 8 focus: autonomous operation requires high-confidence downstream repos

**Key Insight:** Audit identified the problem; issues operationalize the solution. 9 focused issues are more actionable than "test more and better."

---

### Phase 11 Epic Decomposition: Gameplay Testing Rollout (2026-03-22T01:30Z)

**Task:** Decompose Issue #113 (Phase 11 — Gameplay Testing Rollout & Autonomous Game Feature Delivery) into 4-5 concrete issues operationalizing the gameplay testing framework across FFS constellation.

**Strategic Context:**
- Phase 8 (#75) built the gameplay testing framework (Puppeteer/Playwright templates, canvas mocks, test patterns)
- Phase 9 (#89, #129) piloted on pixel-bounce (22 headless tests + 8 Playwright visual tests, proven effective)
- Downstream audit (#72) identified flora (95% useless tests) and ComeRosquillas (inflated test suite)
- Issue #113 epic requires operationalization across entire constellation

**Decomposition Executed:**

| Issue | Title | Squad | Complexity | Purpose |
|-------|-------|-------|-----------|---------|
| #130 | Phase 11.1: Apply headless gameplay tests to flora | squad:switch | 🟡 Medium | 10-15 tests covering seed → plant lifecycle, resource management, genetics |
| #131 | Phase 11.2: Apply headless gameplay tests to ComeRosquillas | squad:switch | 🟡 Medium | 12-15 tests replacing inflated suite; focus: multiplayer sync, social mechanics |
| #132 | Phase 11.3: Extend Playwright visual tests to downstream repos | squad:switch | 🟡 Medium | Scale visual testing from pixel-bounce to flora + ComeRosquillas; establish visual CI gate |
| #133 | Phase 11.4: Fix Node.js v20 in Azure Bicep | squad:tank | 🟢 Small | Update cloud-init cloud-init nodejs v18 → v20 LTS (Test 3 pre-req) |
| #134 | Phase 11.5: Update Bicep default location (northeurope) | squad:tank | 🟢 Small | Change region westeurope → northeurope (B-series availability; Test 3 pre-req) |

**Decomposition Principles Applied:**

1. **Gaming Track (130, 131, 132):** Headless tests → headless tests → visual tests. Sequential depth: gameplay mechanics → player interactions → visual consistency. Parallel start (130 + 131) converge at 132.

2. **DevOps Track (133, 134):** Quick Tank tasks fixing infrastructure constraints pre-identified during #123 (Azure subscription setup). Both enable Test 3 deployment without obstacles.

3. **Clear Ownership:** Each issue routed to squad capability (Switch = test automation, Tank = cloud/devops). No ambiguity on who executes.

4. **Measurable Acceptance:** Each issue has 7-10 concrete acceptance criteria with specific deliverables. "Done" is unambiguous — test count, coverage %, visual baseline, Node.js version in cloud-init logs.

5. **Parent Epic Coordination:** #113 remains open as hub, all 5 issues linked with dependency graph. When all 5 done → Phase 11 complete → Gameplay Testing Rollout scales to entire constellation.

**Strategic Outcomes:**

- **flora:** Transforms from 95% arithmetic assertions to 10-15 real gameplay tests validating botanical simulation (seed planting, growth simulation, lifecycle transitions)
- **ComeRosquillas:** Replaces inflated test suite with 12-15 real multiplayer/social game tests (registration, scoring, leaderboards, player sync)
- **Playwright Visual Tests:** Scales from pixel-bounce (8 tests) to flora + ComeRosquillas (8+8 tests = 24 total); visual testing becomes non-negotiable CI gate
- **Infrastructure:** Unblocks Test 3 Azure VM deployment with correct Node.js LTS and region availability

**Key Design Decisions:**

1. **Why 5 issues not 3?** DevOps issues (#133, #134) are tiny but essential. Separating them prevents merging "fix Node.js" with "add gameplay tests" — each issue has single responsibility.

2. **Why headless THEN visual?** Headless validates game mechanics (does it work?). Visual validates presentation (does it look right?). Both needed; headless is prerequisite (visual assumes headless passes).

3. **Squad routing:** Switch is test automation expert (gameplay tests). Tank is DevOps expert (Bicep, cloud-init). No cross-training; each does what they're best at.

4. **Parallel execution:** 130 + 131 can run in parallel (independent games, same testing pattern). 133 + 134 can run in parallel (independent Bicep parameters). Both pairs can run simultaneously.

**Learnings:**

1. **Epic decomposition requires two lenses:** Technical (what to build?) + Operational (who builds it?). Issue #113 said "WHAT" (gameplay testing rollout); decomposition answers "WHO" (Switch), "WHEN" (after pixel-bounce pilot), "HOW" (apply framework from #89 pattern).

2. **DevOps issues are blocking.** #133 + #134 seem like afterthoughts, but Node.js v18 + westeurope unavailability literally block Test 3 launch. Explicit issue status (not buried in epic body) makes them visible.

3. **Pattern reuse scales work.** Phase 9 piloted #89 on pixel-bounce, validated pattern, documented in PR #129. Phase 11 now replicates that pattern to flora + ComeRosquillas. Automation through proven patterns, not one-off coding.

4. **Parent epic + child issues = transparent roadmap.** Epic stays open (coordination hub), issues closed as delivered (measurable progress). Upstream visibility (founder sees 5/5 done) without losing downstream context.

**Orchestration Artifacts:**
- Comment on #113 shows full decomposition table + dependency graph
- Each issue (130-134) linked to parent #113, related issues (#75, #89, #129, #72, #112)
- All 5 issues labeled `squad` (triage inbox) ready for squad execution
- Issue bodies include acceptance criteria, technical notes, related issues section

**Next Step:** Squads execute in parallel. Switch works on gameplay tests (130, 131, 132). Tank works on infrastructure (133, 134). When all 5 closed → Phase 11 done → Gameplay Testing Rollout complete.

