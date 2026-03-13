# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Core Context (Continued)

- **Authority**: Tier 1 (Lead) on architecture, gates, skills, routing, upstream partnerships
- **Recent Focus**: Phase 0 SS readiness → Phase 1 FFS takeover → Phase 2 game production → Phase 2 autonomy roadmap

## Core Context Summarized (Sessions 1–11, 2026-03-13 to 2026-03-15)

- **FFS Takeover (T1-T4):** Complete. Hub governed, upstream.json v2 on all satellites, 12 pipeline:* labels installed (36/36), governance chain operational. Constellation verified GREEN.
- **Phase 1 Pipeline:** Complete. 6-stage autonomous pipeline proven with pixel-bounce. 126 tests passing, €0 cost. Label-based state machine + @copilot GDD generation + Ralph monitoring verified.
- **Context Management:** Hard limits (history ≤8KB, decisions ≤12KB, .squad/ ≤100KB) enforced. upstream.json governance cascade working. Context bloat remediation successful (642KB→<100KB).

## Learnings Summary (Sessions 1-11 Core Patterns)

- Event-driven > cron-driven autonomy (reactive outperforms polling in perceived autonomy)
- Decentralized roadmap ownership (local Leads) > centralized Oracle (domain expertise decisive)
- 3-layer model (Cloud 80% + Watch 15% + Manual 5%) covers all complexity tiers
- ralph-watch.ps1 (hardened PowerShell, 6 failure modes) primary Layer 2; squad watch (Brady's tool) as complement for AI triage
- @copilot understands complex code; issues need acceptance criteria not implementation steps
- Simple architecture (4-step cycle) > complex documentation (clarity > technical depth)
- Tool naming specificity prevents confusion (ralph-watch.ps1 vs. ambiguous "squad watch")
- Audit processes (checklists) catch architectural drift before execution

## Current Learning (Session 2026-03-16 — Phase 2 Planning Final)

**Phase 2 Architecture Locked:** Event-driven perpetual motion (issues.closed trigger) + Layer 2 refueling (ralph-watch.ps1 detects "Define next roadmap" → opens Squad → Lead defines) + decentralized roadmaps (each repo's Lead). 3 workstreams (A=Autonomy 5 issues, B=Visibility 4 issues €0, C=Repo Evolution 6 issues). 15 total issues, all @copilot-ready. Timeline: 2 weeks core, 4 weeks full. First visible delivery Day 3 (FFS Page, 3 playable games). Parallel 4-agent execution proven viable.

**Audit Complete:** 10/13 decisions already in plan, 3 corrected (ralph-watch.ps1 as primary Layer 2 refueler, squad watch as complement for AI triage only, refueling behavior). T1 gate passed by Morpheus with 3 minor conditions: rate limiting in A1, 3-feature cap in A2, roadmap convergence guidance in A5. Risk LOW, confidence 85-90%.

**Key Architectural Decisions:**
- Event-driven (issues.closed) primary, cron only safety net
- ralph-watch.ps1 = ACTS (refuels roadmaps via Squad CLI, hardened 6 failure modes)
- squad watch = SUGGESTS (AI triage, cross-repo patterns, does NOT refuel)
- Layer 2 composition: ralph-watch.ps1 (primary) + squad watch (complement)
- @copilot reads code, issues specify acceptance criteria not implementation
- Decentralized roadmap ownership (local Leads), SS orchestrates infrastructure
- Cost: €0 (GitHub free tier, local tools, no Azure ACI)
- Target: <15min/week human intervention, 80% autonomous work

**Simplification Meta-Learning:** Phase 2 plan grew 400→709 lines by ADDING complexity instead of simplifying. Core is 4-step cycle: Bootstrap → Motor Runs → Roadmap Depletes → Refuel → Repeat. Restructured: core 4 steps to top, reduced A5 from 125→30 lines, removed redundancy. Result: 709→542 lines, CLEARER. Founder lens: prioritize CLARITY over technical depth. Architect job is SIMPLIFY, not demonstrate depth through verbosity.

**Readiness for Execution:** Phase 2 plan ready for immediate launch (2026-03-17). All workstreams mapped, dependencies clean, no deadlocks. Morpheus: create 15 issues Week 1. Week 1 parallel: Tank(A1+A5), Oracle(A2), Trinity(B1+B3). Week 2 parallel: Switch(A3), Morpheus(A4), Oracle(B2), Trinity(B4). Weeks 3-4: @copilot fan-out C1-C3, Trinity C4. Success metrics: autonomy (<1min issue latency), visibility (3 shareable URLs), features (C1-C3 deployed), cost (€0).

## Session 2026-03-17 — Roadmap Bootstrap (A2 Task)

**Task:** Created roadmap.md for Syntax Sorcery repository with 3 @copilot-ready infrastructure improvements.

**Decision:** Focus on perpetual-motion workflow infrastructure rather than new features. All 3 items directly support Phase 2 Workstream A (Autonomy). Items chosen:
1. **Workflow validation** — prevents silent failures in perpetual-motion.yml across 6 repos
2. **Roadmap depletion detection** — enables automatic "Define next roadmap" issue creation (refueling trigger)
3. **Reusable issue creation workflow** — DRY principle for 6 repos calling same GitHub Actions workflow

**Rationale:** SS is orchestrator infrastructure, not end-user product. Roadmap should harden the autonomy engine (Layer 1 perpetual motion + Layer 2 refueling). Each item has clear acceptance criteria, file paths, context for @copilot. No architecture decisions or ambiguous scope. Enforced 3-feature limit from audit conditions.

**Next:** Other repo Leads (Oracle for FFS Hub, Trinity for satellites) will define their roadmaps focusing on finishing existing work per "no más juegos sin límite" directive.

## Session 2026-03-17 — A3 Standardized Issue Template Complete

**Task:** Created standardized @copilot-ready issue template system for all repositories.

**Deliverables:**
1. `.github/ISSUE_TEMPLATE/copilot-ready.md` — Issue template with 5 sections (Objective, Acceptance Criteria, Files Involved, Context Hints, Definition of Done). Emphasizes WHAT to achieve (testable outcomes) over HOW to implement (steps).
2. `.squad/guides/writing-copilot-issues.md` — Comprehensive 11KB guide with do's/don'ts, good vs bad examples, conversion workflow from roadmap items, @copilot capability profile (🟢 Green / 🟡 Yellow / 🔴 Red), and self-containment checklist.
3. `.github/ISSUE_TEMPLATE/config.yml` — Template picker configuration disabling blank issues, linking to Discussions and .squad/ docs.

**Design Principle:** "@copilot reads the repo" means issues specify acceptance criteria (testable outcomes), NOT implementation instructions (step-by-step code). Template guides authors to write success conditions, trusting @copilot to determine approach. This aligns with decisions.md directive and accelerates autonomous execution.

**Impact:** All 6 repos (SS + 5 FFS constellation) can now use this template for uniform @copilot task definition. Roadmap items convert directly to GitHub issues using template structure. Reduces ambiguity, increases @copilot success rate.

## Session 2026-03-17 — A5 Layer 2 Refueling Engine Complete

**Task:** Implemented ralph-watch.ps1 — the Layer 2 refueling engine that detects "Define next roadmap" issues and autonomously refuels roadmaps via Squad CLI sessions.

**Deliverables:**
1. `scripts/ralph-watch.ps1` (550+ lines) — Background PowerShell monitoring service with 10min polling, Squad session invocation, roadmap commit automation, and issue closure. Implements ALL 6 hardening patterns from Tank's ralph-hardening SKILL: session timeout (30min), exponential backoff (5m→60m), stale lock detection (2h), log rotation (3 files + 7 days), health checks (pre-round validation + hourly heartbeat), alert mechanism (escalation issues for persistent failures).
2. `.squad/guides/squad-watch-layer2.md` (9KB) — Comprehensive documentation explaining ralph-watch.ps1 (ACTS) vs squad watch (SUGGESTS), when to use each, how to run both together, monitoring commands, failure modes, and roadmap convergence rules.

**Architecture Decision:** ralph-watch.ps1 is PRIMARY Layer 2 (autonomous refueling action), squad watch is COMPLEMENT (AI triage suggestions). This closes the perpetual motion loop: Layer 1 exhausts roadmap → creates "Define next roadmap" issue → Layer 2 detects + refuels → Layer 1 continues. Zero human intervention required for roadmap generation.

**Roadmap Convergence Safeguard:** Implemented 3-cycle limit per repo without user review. After 3 consecutive refuelings, ralph-watch pauses and creates escalation issue requiring human confirmation. Prevents infinite roadmap generation without direction.

**Impact:** The final piece of Phase 2 Workstream A autonomy. Perpetual motion engine is now truly perpetual — roadmaps refuel automatically, @copilot executes work, system runs 24/7 unattended. Target <15min/week human intervention achievable.
