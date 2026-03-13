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

- **FFS Takeover (T1-T4):** Complete. Hub governed, upstream.json v2 on all satellites, 12 pipeline:* labels installed (36/36), governance chain operational (SS→Hub→3 Satellites). Constellation verified GREEN.
- **Phase 1 Pipeline:** Complete. 6-stage autonomous pipeline (Proposal→GDD→Issues→Code→Build→Deploy) proven with pixel-bounce. 126 tests passing, €0 cost. Label-based state machine + @copilot GDD generation + Ralph monitoring all verified.
- **Context Management Proven:** Hard limits (history ≤8KB, decisions ≤12KB, .squad/ ≤100KB) enforced via CI. upstream.json governance cascade working. Context bloat remediation successful (642KB→<100KB).

## Learnings (Current Session — 2026-03-16)

### Autonomy Gap Analysis
- **Gap:** Pipeline is technically complete (6 stages, 126 tests, €0) but not autonomous. Stage 0 requires manual input, no completion triggers, Ralph monitors but doesn't act.
- **3-Phase Solution:** (1) HEARTBEAT (1 week, cron weekly), (2) AUTO-SANACIÓN (2 weeks, auto-retries), (3) AUTO-PROPUESTAS (1 month, system generates ideas).
- **Target:** 80% autonomous in 1 month, 95% in 3 months. T0 decisions (repos, budget) always require founder.

### Parallel Concrete Evolution
- **User needs:** Not phases, but mechanics. What cron? What issues? What labels? System must drive itself.
- **Solution:** Heartbeat (Sun 00:00 UTC) → 5 @copilot issues → completion logic per repo → Ralph guardian (escalate >72h) → all repos evolving simultaneously.

### Visibility/Marketing Layer Architecture
- **User requirement:** Show "wow moments" (playable games) to friends, not internal dashboards.
- **Solution:** (1) GitHub Pages (P0, 2 days) with game embeds, (2) Auto-blog (weekly cron, parse decisions.md), (3) Squad Monitor streaming (€10/mo Azure ACI).
- **Insight:** Visibility layer bridges technical achievement and human understanding. €500/mo budget 90% unspent → €10/mo for streaming is trivial for "wow factor."

### Phase 2 Consolidated Plan (2026-03-16)
- **Challenge:** User wants everything now — autonomy + visibility + features, not sequential phases.
- **Solution:** 3 parallel workstreams (15 issues): (A) Autonomy (heartbeat, roadmaps, completion detectors), (B) Visibility (FFS page, SS page, daily devlog, squad monitor), (C) Repo Evolution (Flora, ComeRosquillas, pixel-bounce, monitor features).
- **Key Insights:**
  - **Parallel > Sequential:** 2 weeks vs. 6 weeks, all 6 repos evolve simultaneously.
  - **Daily Devlog > Weekly:** Team works 24x7, daily cadence shows momentum.
  - **€0 Constraint:** Squad Monitor polling (60s) vs. streaming (€10/mo) — user prioritizes zero cost.
  - **@copilot-Ready Issues:** Strict templates (acceptance criteria, files to modify, examples) enable autonomous pickup.
  - **Roadmaps as Foundation:** roadmap.md per repo defines next work, completion detectors auto-advance from roadmaps.
  - **Dependency Graph Critical:** Visual graph prevents sequential bottlenecks, enables parallel execution.
- **Execution Model:** Morpheus creates all 15 issues Day 1 → agents work in parallel → checkpoints Day 3/8/15/22/28 → Phase 2 complete in 4 weeks.
- **Risk Mitigation:** A4 (@copilot integration) includes strict templates to prevent misunderstandings; B1 (FFS page) tests CORS/iframe sandbox before launch; A1 (heartbeat) limits data retention to avoid storage bloat.

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

