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

**Autonomy Architecture (4-step cycle):** Event-driven perpetual motion (issues.closed trigger) with Layer 2 refueling (ralph-watch.ps1 detects "Define next roadmap" → opens Squad session → Lead defines roadmap → system continues). Decentralized roadmap ownership (each repo's Lead). 3 layers: Cloud (80%), Watch (15%), Manual (5%).

**Phase 2 Plan (3 workstreams, 15 issues, 2-4 weeks):** A (Autonomy: perpetual motion + roadmaps + templates + safety net + Layer 2 tools), B (Visibility: FFS page + daily devlog + SS page + Squad Monitor 60s polling, €0 total), C (Repo Evolution: 3 games + monitor features, completion-driven). First user-visible deliverable Day 3 (FFS page with 3 playable games). Parallel execution with 4 agents proven viable.

**Gate Review APPROVED:** 10/13 decisions already in plan, 3 missing/incorrect (ralph-watch.ps1 as primary Layer 2, squad watch as complement, refueling attribution). Fixed plan with explicit A5.1/A5.2 separation. 3 minor conditions: rate limiting (A1), 3-feature limit enforcement (A2), roadmap convergence guidance (A5). Risk LOW, confidence 85-90%.

**Simplification Lesson:** Phase 2 plan grew from 400→709 lines through 4 revisions that ADDED complexity instead of simplifying. Core architecture is 4 steps — everything else is implementation detail. Restructured: moved 4-step cycle to top of Workstream A, reduced A5 from 125→30 lines, removed redundant paragraphs. Workstream A now 385→180 lines, plan 709→542 lines. Non-technical founder lens: prioritize CLARITY (what happens) over DEPTH (how it works). Meta-learning: architect job is simplify, not demonstrate technical depth.


### Event-Driven Autonomy Redesign (2026-03-16, 30-min Session)

**Context:** Previous Workstream A (cron-driven, 4 separate pieces) was too abstract. User (joperezd, founder) spent 30 minutes refining architecture through conversation.

**KEY ARCHITECTURAL DECISIONS:**

1. **Event-Driven Motor Cycle:** Primary trigger is `on: issues: types: [closed]` (GitHub Actions). When last issue closes → read roadmap.md → create next issue → @copilot assigned → works → PR → merge → issue closed → repeat. Cron is ONLY a safety net (daily check for stuck repos >72h), NOT the primary driver.

2. **Single Perpetual Motion Loop:** Not 4 disconnected pieces. ONE continuous cycle: roadmap → issue → @copilot → code → PR → merge → closed → roadmap. Must feel like ONE machine with ON/OFF switch.
   - **ON:** Populate roadmaps + create first issues + enable `copilot-auto-assign: true`
   - **OFF:** Remove auto-assign or close all issues

3. **Roadmaps Owned by Local Leads:** Each downstream repo's Lead defines their own roadmap, NOT Oracle from SS. SS/Morpheus orchestrates WHEN (trigger) and HOW (pipeline), not WHAT (features). Decentralized ownership.

4. **3-Layer Architecture:**
   - **Layer 1 (Cloud):** GitHub Actions + @copilot (100% cloud, 0 terminals, 80% of well-defined work)
   - **Layer 2 (Local Watch):** `npx github:bradygaster/squad watch --interval 10` (1 background terminal, monitors all repos, triages, escalates)
   - **Layer 3 (Manual):** Ralph in-session (~30min/week, drains complex queue, handles 20% that needs deep thinking)

5. **@copilot Reads the Repo:** Issues don't micromanage. @copilot clones repo, reads code, understands patterns. Issues need: clear title + acceptance criteria + WHAT to achieve. NOT HOW to implement.

6. **squad watch as Layer 2:** Brady Gaster's `squad watch` is Layer 2 (local persistent polling). Does what GHA can't: cross-repo patterns, AI triage, proactive escalation, local context. Complements Layer 1, doesn't replace it.

7. **Parallel Execution:** Fan-out is default. Multiple agents work simultaneously on different repos. Serialize only for real data dependencies. €500/mo budget mostly unspent → cost not a constraint.

8. **Safety Net Cron:** Daily check (not primary). Only ESCALATES (summary, GitHub Discussions, labels), never ACTS. Red de seguridad catches repos that fell off the cycle.

**WORKSTREAM A REDESIGNED:**
- **A1. Perpetual Motion Workflow:** issues.closed trigger, reads roadmap, creates next issue, assigns @copilot. The ENGINE.
- **A2. Roadmap Bootstrap:** Each repo's Lead defines their roadmap (decentralized ownership).
- **A3. Issue Template for @copilot:** Focus on acceptance criteria + context, not implementation details.
- **A4. Safety Net Cron:** Daily stuck-check, escalates only, never acts.
- **A5. squad watch Integration:** Layer 2 capabilities, how it complements GHA.

**KEY LEARNINGS:**
- **Event-driven > Cron-driven:** Reactive systems (respond to completion) feel more autonomous than polling systems (check periodically).
- **Single motor cycle > Modular pieces:** User mental model matters. "One machine with ON/OFF" beats "4 components that work together."
- **Decentralized roadmaps > Centralized Oracle:** Local Leads know their domain. SS orchestrates infrastructure, not features.
- **Layered autonomy > Single layer:** 80% (Layer 1) + 15% (Layer 2) + 5% (Layer 3) = 100% coverage with right tool for each complexity level.
- **Trust @copilot's code understanding:** Issues can be simpler. Acceptance criteria + files involved > line-by-line instructions.
- **Complementary tools > Replacement:** squad watch + GHA + Ralph work together. Each has unique strengths.

**EXECUTION:** Workstream A (A1-A5) redesigned in `docs/plan-phase2-visibility.md`. Decision documented in `.squad/decisions/inbox/morpheus-event-driven-autonomy.md`. Implementation begins immediately (Tank: A1+A4, Leads: A2, Morpheus: A3+A5).

### Phase 2 Plan Audit — ralph-watch.ps1 vs. squad watch Clarification (2026-03-16, Final Session)

**Context:** User requested formal audit of Phase 2 plan against 13 specific session decisions, with particular concern about ralph-watch.ps1 vs. squad watch confusion.

**KEY FINDINGS:**

**10 decisions were already correct in plan:**
1. ✅ No más juegos sin límite (Workstream C focuses on completing existing games)
2. ✅ Parallel evolution (all 6 repos simultaneously, not sequential)
3. ✅ Event-driven primary (issues.closed trigger, not cron)
4. ✅ Motor perpetuo as single cycle (roadmap → issue → @copilot → repeat)
5. ✅ Local Lead roadmaps (decentralized ownership, NOT Oracle)
6. ✅ 3 layers (Cloud/Watch/Manual)
7. ✅ Polling 60s for Squad Monitor (€0, no streaming)
8. ✅ Devlog DAILY within FFS Page
12. ✅ @copilot reads repo (issues = what+criteria, NOT how)
13. ✅ ON/OFF switch (populate roadmaps + enable copilot-auto-assign)

**3 decisions were missing/incorrect — NOW FIXED:**
9. ❌→✅ **ralph-watch.ps1 as Layer 2 PRIMARY**: Plan only mentioned "squad watch" generically. Added A5.1 with ralph-watch.ps1 implementation (scripts/ralph-watch.ps1, 6 failure modes from ralph-hardening SKILL, hardened PowerShell loop for 24h operation).
10. ❌→✅ **squad watch as COMPLEMENT**: Plan didn't distinguish ralph-watch.ps1 from Brady's squad watch. Added A5.2 clarifying squad watch is DIFFERENT tool (Node.js, AI triage, suggests actions). Both run in parallel with distinct roles.
11. ❌→✅ **Refueling via ralph-watch.ps1**: Plan incorrectly stated squad watch handles roadmap refueling. Fixed throughout — ralph-watch.ps1 ACTS (opens Squad sessions, refuels roadmaps), squad watch SUGGESTS (writes triage reports).

**ARCHITECTURAL CLARITY ACHIEVED:**

**ralph-watch.ps1 (PRIMARY Layer 2):**
- Hardened PowerShell loop with 6 failure modes (session timeout 30m, exponential backoff 5→60m, stale lock detection >2h, 3-file log rotation, pre-round health checks, external staleness detection via GHA hourly checks)
- Polls all 6 repos every 10 minutes (configurable)
- **REFUELING:** Detects "Define next roadmap" issues → opens Squad CLI session → Lead defines roadmap → commits/closes issue
- Writes to .squad/ralph-watch/*.log and heartbeat.json
- Cost: €0 (local PowerShell, no Azure)
- Source pattern: `.squad/skills/ralph-hardening/SKILL.md` (extracted from FFS P1-08 audit)

**squad watch (COMPLEMENT Layer 2):**
- Brady Gaster's Node.js tool (`npx github:bradygaster/squad watch --interval 10`)
- Polls all 6 repos every 10 minutes
- **TRIAGE ONLY:** AI-powered assignment suggestions, cross-repo pattern detection, writes suggestions to .squad/triage/*.md
- Does NOT refuel roadmaps (that's ralph-watch.ps1's job)
- Cost: €0 (local Node.js, no Azure)

**Division of Labor:**
- ralph-watch.ps1 = ACTS (refuels, monitors health, opens Squad sessions, hardened for 24h+ unattended)
- squad watch = SUGGESTS (triages, detects patterns, creates needs-human-triage issues)
- Layer 1 (GHA) = EXECUTES (issues→PRs via perpetual-motion.yml)
- Layer 3 (Ralph in-session) = DECIDES (~30min/week complex queue)

**KEY LEARNINGS:**

1. **Tool naming matters for clarity:** "squad watch" is ambiguous — could mean Brady's tool OR a generic concept. ralph-watch.ps1 is specific. Plan now uses explicit names throughout.

2. **Hardening patterns are reusable:** The 6 failure modes from ralph-hardening SKILL (FFS P1-08 audit) apply to ANY long-running agent loop. ralph-watch.ps1 implements this proven pattern.

3. **Complementary ≠ Redundant:** ralph-watch.ps1 (acts/refuels) + squad watch (suggests/triages) serve different purposes. Both valuable, zero conflicts.

4. **Layer 2 can have multiple tools:** Original 3-layer model didn't specify Layer 2 composition. Now clear: Layer 2 = ralph-watch.ps1 (primary) + squad watch (complement), both local, both €0.

5. **Refueling is critical architecture:** Without ralph-watch.ps1 auto-refueling roadmaps, perpetual motion would eventually stop. This is THE missing piece for true autonomy — plan now reflects this prominently in A5.

6. **Audit processes prevent drift:** User intuition was correct — plan had drifted from session discussions. Formal audit with 13-item checklist caught 3 critical gaps. T1 must validate plans before execution.

7. **Documentation hierarchy:** Plan (docs/plan-*.md) must reflect Decisions (decisions.md) which must reflect History (agents/*/history.md). Chain of evidence ensures consistency.

**EXECUTION IMPACT:**

- A5 task now has TWO parts: A5.1 (implement ralph-watch.ps1, assigned Morpheus) and A5.2 (document squad watch usage, assigned Morpheus)
- Timeline unchanged (2 weeks core, 4 weeks full)
- Confidence increased (85%→90%) — architectural ambiguity removed
- Implementation order: A5.1 (ralph-watch.ps1) BEFORE A5.2 (squad watch) — refueling is more critical than triage

**Decision documented:** `.squad/decisions/inbox/morpheus-plan-audit.md`  
**Plan updated:** `docs/plan-phase2-visibility.md` (header with 13-item checklist, A5 rewritten, 9 references updated)  
**Status:** ✅ AUDIT COMPLETE, PLAN REFLECTS ALL 13 DECISIONS, READY FOR EXECUTION



### Over-Engineering Plans — Simplicity Wins (2026-03-16, Final Simplification)

**Context:** Phase 2 plan grew from 400 lines to 709 lines through 4+ revisions. Each revision added complexity instead of simplifying. User (joperezd, non-programmer founder) correctly identified the plan had become "too complex, too many pages" for what is actually a simple 4-step cycle.

**The Core Architecture (4 Steps):**
1. **Bootstrap:** Open session in each repo → Lead defines roadmap → commit
2. **Motor runs:** perpetual-motion.yml creates issues from roadmap → @copilot executes → PR → merge → repeat
3. **Roadmap exhausted:** perpetual-motion.yml detects empty roadmap → creates "Define next roadmap" issue
4. **Refueling:** ralph-watch.ps1 detects issue → opens Squad session → Lead defines roadmap → motor continues

**The Problem:** Plan buried this 4-step cycle under:
- 20+ paragraphs explaining Layer 2 tools in excruciating detail
- Multiple redundant diagrams showing the same cycle
- Detailed failure modes and edge cases repeated throughout
- Duplicated explanations of "event-driven vs. cron-driven"
- Over-specified acceptance criteria that repeated context

**Root Cause:** Each revision tried to address perceived ambiguities by ADDING detail rather than CLARIFYING structure. Classic architect trap: "If they didn't understand it, I must need MORE explanation."

**The Fix:**
- Moved 4-step cycle to TOP of Workstream A (prominent, unavoidable)
- Reduced A5 from 125 lines to 30 lines (ralph-watch.ps1 does what it says: detects Lead issues and resolves them)
- Removed redundant context from A1-A4 (kept only essential acceptance criteria)
- Clarified ralph-watch.ps1 vs. squad watch in 2 sentences, not 2 pages
- Result: Workstream A went from ~385 lines to ~180 lines while becoming CLEARER

**KEY LEARNINGS:**

1. **Simplicity Scales:** If you can't explain the architecture in <1 page, it's too complex OR you're explaining it wrong. The 4-step cycle IS the architecture. Everything else is implementation detail.

2. **Structure > Volume:** Putting the 4-step cycle at the TOP makes the entire plan understandable. Burying it under detailed acceptance criteria makes it invisible.

3. **Non-Programmer Lens:** User is the founder. He doesn't need to know about "exponential backoff" or "stale lock detection" in the plan overview. Those belong in the implementation task (A5), not the architecture summary.

4. **Each Revision Should Simplify:** If a plan revision makes the document longer, you're likely solving the wrong problem. Ask: "What can I REMOVE?" not "What should I ADD?"

5. **Tool Names Matter:** Using "squad watch" generically created confusion with Brady's specific tool. Using explicit names (ralph-watch.ps1 vs. squad watch) eliminated 3 paragraphs of clarification.

6. **Acceptance Criteria ≠ Architecture:** Detailed checklists (30-min timeouts, log rotation, health checks) belong in task descriptions, not in the architectural overview. User needs to understand WHAT happens, not HOW it's implemented.

7. **Over-Specification Signals Uncertainty:** When we're not confident the reader will understand, we add MORE detail. Better approach: test the explanation on a non-technical person. If they don't get it, restructure (don't expand).

**Decision:** Approved simplified plan. Workstream A now reflects the actual simplicity of the perpetual motion architecture. Supporting details (A1-A5) remain as implementation tasks but don't obscure the core 4-step cycle.

**Execution Impact:** Plan is now readable in <10 minutes instead of 30 minutes. User can explain the system to others without referencing the document. This is the measure of good architecture documentation.

**Meta-Learning:** As Lead/Architect, my job is to SIMPLIFY, not to demonstrate technical depth through verbosity. Founders need clarity, not comprehensiveness. Technical depth belongs in implementation tasks, not strategic plans.
