# Phase 2 Visibility & Autonomy — Consolidated Execution Plan

**Prepared by:** Morpheus (Lead/Architect)  
**Date:** 2026-03-16  
**Status:** APPROVED FOR EXECUTION  
**Cost:** €0 (100% GitHub free tier)

**CRITICAL DECISIONS REFLECTED:**
1. ✅ No más juegos sin límite — foco en terminar existentes (C1-C3)
2. ✅ Todos los repos evolucionan en paralelo, NOT secuencialmente (parallel workstreams A/B/C)
3. ✅ Event-driven (`issues.closed`) as PRIMARY driver, NOT cron (A1)
4. ✅ Motor perpetuo as single cycle: roadmap → issue → @copilot → merge → repeat (A1 architecture)
5. ✅ Roadmaps by local Lead of each repo, NOT Oracle from SS (A2 ownership model)
6. ✅ 3 layers: Cloud (Layer 1), Watch (Layer 2: ralph-watch.ps1 + squad watch), Manual (Layer 3: Ralph)
7. ✅ Polling 60s for Squad Monitor, NO streaming, €0 cost (B4)
8. ✅ Devlog DAILY (not weekly), within FFS Page (B2)
9. ✅ ralph-watch.ps1 as Layer 2 PRIMARY with 6 failure modes (A5.1)
10. ✅ squad watch as COMPLEMENT to ralph-watch.ps1, clearly distinguished (A5.2)
11. ✅ Roadmap refueling via ralph-watch.ps1 — "Define next roadmap" → ralph-watch.ps1 → Squad session → auto-generated roadmap (A5 refueling behavior)
12. ✅ @copilot reads the repo — issues only need what+acceptance criteria, NOT how-to-implement (A3 template guidance)
13. ✅ ON/OFF switch — ON = populate roadmaps + create first issues + enable copilot-auto-assign:true (documented below)

---

## Executive Summary

This plan consolidates three parallel workstreams that will transform Syntax Sorcery from a technically-complete pipeline into a fully autonomous, publicly visible software company. All 6 repositories (SS, FFS, Flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor) evolve simultaneously.

**Key Constraints:**
- €0 total cost (GitHub free tier only)
- All issues must be @copilot-ready (specific acceptance criteria, not implementation details)
- Parallel execution across all repos (NOT sequential)
- Daily devlog (NOT weekly) — team works 24x7
- Squad Monitor: 60s polling (NO streaming, NO Azure)
- No más juegos sin límite — finish existing games first

**Timeline:** 2 weeks for core visibility, 4 weeks for full autonomy

**Dependencies:** See graph at end of document

---

## WORKSTREAM A: AUTONOMY (Perpetual Motion)

**Goal:** Transform repos into self-sustaining systems with <15min/week human intervention.

### The 4-Step Perpetual Motion Cycle

This is the entire autonomy architecture. Everything else is implementation details.

```
┌────────────────────────────────────────────────────────────┐
│  STEP 1: BOOTSTRAP (Day 1, Manual, One Time)              │
│  ───────────────────────────────────────────────────────── │
│  • Open session in each repo                              │
│  • Lead defines roadmap.md (ordered list of work)        │
│  • Commit to main                                         │
│                                                            │
│  RESULT: Each repo has fuel (roadmap)                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  STEP 2: MOTOR RUNS (Layer 1, Cloud, Automatic)          │
│  ───────────────────────────────────────────────────────── │
│  perpetual-motion.yml:                                    │
│  • Issues close → read roadmap → create next issue       │
│  • @copilot auto-assigned → executes → PR → merge        │
│  • Repeat                                                 │
│                                                            │
│  RESULT: Autonomous execution of roadmap work             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  STEP 3: ROADMAP EXHAUSTED (Layer 1, Automatic)          │
│  ───────────────────────────────────────────────────────── │
│  • perpetual-motion.yml detects empty roadmap             │
│  • Creates issue "📋 Define next roadmap"                 │
│  • Assigned to Lead                                       │
│                                                            │
│  RESULT: Signal sent that refueling is needed             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  STEP 4: REFUELING (Layer 2, ralph-watch.ps1, Automatic) │
│  ───────────────────────────────────────────────────────── │
│  ralph-watch.ps1 running in background:                   │
│  • Detects "Define next roadmap" issue                    │
│  • Opens Squad CLI session                                │
│  • Lead defines new roadmap                               │
│  • Commits and closes issue                               │
│  • Motor continues from Step 2                            │
│                                                            │
│  RESULT: Zero human intervention, perpetual motion        │
└────────────────────────────────────────────────────────────┘
```

**That's it.** Four steps. The motor never stops.

**Supporting details:**
- **Safety net cron (A4):** Catches stuck repos >72h, escalates only
- **Issue template (A3):** Helps @copilot understand what to do
- **3 Layers:** Cloud (GHA + @copilot), Watch (ralph-watch.ps1 + squad watch), Manual (Ralph ~30min/week)

---

### A1. Perpetual Motion Workflow (Per Repo)

**Issue Title:** Create issues.closed workflow for autonomous roadmap progression  
**Repo:** Syntax Sorcery (template for all downstream repos)  
**Assigned to:** Tank (Cloud Engineer)  
**Dependencies:** None (can start immediately)  
**Labels:** `squad:tank`, `pipeline:orchestration`, `type:automation`, `priority:critical`

**Acceptance Criteria:**
- [ ] Workflow file: `.github/workflows/perpetual-motion.yml`
- [ ] Trigger: `on: issues: types: [closed]` (event-driven)
- [ ] Logic:
  1. Check if closed issue was last open issue
  2. Read next item from `roadmap.md`
  3. Create new issue with title, acceptance criteria, labels
  4. Auto-assign @copilot
  5. **If roadmap exhausted:** Create "📋 Define next roadmap" issue assigned to Lead
- [ ] Deployed to all 6 repos
- [ ] Test: Close issue → new issue auto-created within 30s

**Implementation Notes:**
- Use GitHub CLI (`gh issue create`, `gh issue list`)
- Parse roadmap.md ordered list format
- Log events to `.squad/motor-log/YYYY-MM-DD.json`

---

### A2. Roadmap Bootstrap (Per Repo)

**Issue Title:** Define roadmap.md with ordered work items for each repo  
**Repo:** ALL 6 repos (each repo's Lead defines their own roadmap)  
**Assigned to:** Trinity (FFS repos), Oracle (FFS Hub), Morpheus (SS)  
**Dependencies:** None (can start immediately)  
**Labels:** `type:documentation`, `priority:critical`

**Acceptance Criteria:**
- [ ] `roadmap.md` created in root of each repo
- [ ] Format: Ordered list with markdown checkboxes
- [ ] Each item: title, acceptance criteria, files involved, context hints
- [ ] First 3 items are @copilot-ready (no architecture decisions)
- [ ] Reviewed by Morpheus for soundness
- [ ] Committed to main

**Key Principle:** Each repo's local Lead owns their roadmap, NOT Oracle from SS.

**Example Entry:**
```markdown
1. [ ] Add enemy AI pathfinding
   - Enemies navigate around obstacles using A* algorithm
   - Performance >50 FPS with 20 enemies
   - Files: src/enemy.js, src/pathfinding.js, tests/pathfinding.test.js
```

---

### A3. Issue Template for @copilot

**Issue Title:** Create standardized copilot-ready issue template  
**Repo:** Syntax Sorcery (propagates to all repos)  
**Assigned to:** Morpheus (Lead/Architect)  
**Dependencies:** A2 (needs roadmap format established)  
**Labels:** `squad:morpheus`, `type:documentation`, `priority:high`

**Acceptance Criteria:**
- [ ] Template: `.github/ISSUE_TEMPLATE/copilot-ready.md`
- [ ] Required sections: Title, Acceptance Criteria, Files Involved, Context Hints, Definition of Done
- [ ] Guidance: "@copilot reads the repo — focus on WHAT to achieve, not HOW to implement"
- [ ] Deployed to all 6 repos
- [ ] Documentation: `.squad/guides/writing-copilot-issues.md`
- [ ] Test: Create 3 sample issues, verify @copilot can parse

**Template Structure:**
```markdown
## 🎯 Objective
[Clear one-sentence goal]

## ✅ Acceptance Criteria
- [ ] [Testable requirement 1]
- [ ] [Testable requirement 2]

## 📁 Files Involved
- `path/to/file.js` — [what to change]

## 🔍 Context Hints
- Pattern: [example from codebase]
- Constraints: [performance, compatibility]
```

---

### A4. Safety Net Cron (Daily Stuck Check)

**Issue Title:** Implement daily cron to detect and escalate stuck repos  
**Repo:** Syntax Sorcery  
**Assigned to:** Tank (Cloud Engineer)  
**Dependencies:** A1 (perpetual motion must exist first)  
**Labels:** `squad:tank`, `type:automation`, `priority:medium`

**Acceptance Criteria:**
- [ ] Workflow: `.github/workflows/safety-net.yml`
- [ ] Schedule: Daily at 00:00 UTC
- [ ] Checks: No activity >72h, build failing >3 runs, roadmap stuck >7 days, issue open >5 days with no PR
- [ ] Actions: **Escalates only** (summary in `.squad/escalations/`, post to GitHub Discussions, label `status:needs-attention`)
- [ ] Test: Simulate stuck repo, verify escalation fires

**Note:** This is the safety net, NOT the primary driver. Primary driver is A1 (issues.closed event).

---

### A5. ralph-watch.ps1 — Layer 2 Refueling

**Issue Title:** Implement ralph-watch.ps1 to detect Lead issues and resolve them  
**Repo:** Syntax Sorcery  
**Assigned to:** Morpheus (Lead/Architect)  
**Layer:** 2 (Local Watch — refuels roadmaps)  
**Dependencies:** A1-A4 (Layer 1 must be operational first)  
**Labels:** `squad:morpheus`, `type:implementation`, `priority:critical`

**What It Does:**
- Runs in background (PowerShell loop)
- Polls all 6 repos every 10 minutes
- Detects "Define next roadmap" issues assigned to Leads
- Opens Squad CLI session → Lead defines roadmap → commits → closes issue
- Includes hardened failure modes from `.squad/skills/ralph-hardening/SKILL.md`

**Acceptance Criteria:**
- [ ] Script: `scripts/ralph-watch.ps1` with polling loop
- [ ] Detects issues titled "📋 Define next roadmap"
- [ ] Opens Squad session: `copilot --mode session --repo {repo} --prompt "Define next roadmap"`
- [ ] Commits roadmap.md and closes issue
- [ ] Hardening: session timeout (30m), exponential backoff, stale lock detection, log rotation, health checks
- [ ] Logs to `.squad/ralph-watch/YYYY-MM-DD.log`
- [ ] Test: Simulate empty roadmap → verify auto-refueling works

**squad watch (Optional Complement):**
- Brady Gaster's tool: `npx github:bradygaster/squad watch --interval 10`
- Different purpose: AI triage and assignment suggestions (NOT refueling)
- Can run alongside ralph-watch.ps1 if desired
- Document usage in `.squad/guides/squad-watch-layer2.md`

---

## WORKSTREAM B: VISIBILITY (Show the World)

Goal: Public-facing sites showcasing games, team, and daily progress.

### B1. FFS GitHub Page (Game Hub)

**Issue Title:** Build FFS GitHub Page with playable game embeds and auto-updates  
**Repo:** FFS (FirstFrameStudios)  
**Assigned to:** Trinity (Full-Stack Developer)  
**Dependencies:** None (can start immediately)  
**Labels:** `squad:trinity`, `type:feature`, `priority:critical`

**Acceptance Criteria:**
- [ ] Astro SSG site deployed to https://[org].github.io/FFS/
- [ ] Homepage sections:
  - Hero: "FirstFrame Studios — AI-Powered Game Development"
  - Game Grid: Cards for Flora, ComeRosquillas, pixel-bounce (embed iframes)
  - Each card: thumbnail, title, "Play Now" button, GitHub link
  - Auto-update: Cron job fetches game list from downstream repos
- [ ] Iframes load games directly from GitHub Pages URLs
- [ ] Responsive design (mobile + desktop)
- [ ] Build time <30s, deploy automated via GitHub Actions
- [ ] Test: All 3 games playable in iframes, no CORS errors
- [ ] Lighthouse score: Performance >90, Accessibility >90

**Technical Specs:**
- Framework: Astro 4.x (static site generation)
- Styling: Tailwind CSS
- Game embeds: iframe with sandbox attributes
- Auto-update: `.github/workflows/update-games.yml` (daily cron)

---

### B2. Daily Devlog (Auto-Generated Within FFS Page)

**Issue Title:** Implement daily auto-generated devlog within FFS GitHub Page  
**Repo:** FFS (FirstFrameStudios)  
**Assigned to:** Oracle (Product & Docs)  
**Dependencies:** B1 (FFS page must exist)  
**Labels:** `squad:oracle`, `type:feature`, `priority:high`

**Acceptance Criteria:**
- [ ] Devlog route: `/devlog` on FFS GitHub Page
- [ ] Auto-generated DAILY (not weekly) at 02:00 UTC
- [ ] Data sources:
  - `.squad/decisions.md` from all 6 repos
  - Closed issues (last 24h) with labels `pipeline:*`
  - Deploy events from GitHub Pages
  - PR merges affecting main branch
- [ ] Format: Chronological feed with timestamps, grouped by repo
- [ ] Each entry: date, repo, event type, summary (1-2 sentences)
- [ ] No manual writing required — 100% automated
- [ ] Test: Generate devlog for last 7 days, verify all events captured

**Content Template:**
```
## 2026-03-16 (Day N of autonomy)
- **pixel-bounce**: Deployed v1.2.3 with physics improvements
- **FFS**: Merged PR #42 (devlog automation)
- **Syntax Sorcery**: Decision approved — Phase 2 plan execution begins
```

---

### B3. Syntax Sorcery GitHub Page (Company Showcase)

**Issue Title:** Build SS GitHub Page showing constellation and system health  
**Repo:** Syntax Sorcery  
**Assigned to:** Trinity (Full-Stack Developer)  
**Dependencies:** B1 (for linking to FFS)  
**Labels:** `squad:trinity`, `type:feature`, `priority:high`

**Acceptance Criteria:**
- [ ] Astro SSG site deployed to https://[org].github.io/Syntax-Sorcery/
- [ ] Homepage sections:
  - Hero: "Syntax Sorcery — Autonomous Software Company"
  - Downstream Companies: FFS card (logo, link, status badge)
  - Recent Activity: Last 5 decisions from `.squad/decisions.md`
  - Team Roster: 8 agents with avatars and roles
  - System Health: Pipeline success rate, deploy count, uptime %
- [ ] Auto-update: Daily cron fetches data from all repos
- [ ] Links to FFS page, squad-monitor dashboard, GitHub org
- [ ] Test: All links functional, status badges reflect real data
- [ ] Lighthouse score: Performance >90, Accessibility >90

**Design Principles:**
- Professional, not playful (corporate showcase)
- Data visualization: health metrics in charts (Chart.js)
- Mobile-first responsive design

---

### B4. Squad Monitor Dashboard Upgrade (Polling Mode)

**Issue Title:** Upgrade ffs-squad-monitor to 60s polling mode with 4 new features  
**Repo:** ffs-squad-monitor  
**Assigned to:** Trinity (Full-Stack Developer)  
**Dependencies:** A1 (needs heartbeat data)  
**Labels:** `squad:trinity`, `type:enhancement`, `priority:medium`

**Acceptance Criteria:**
- [ ] Dashboard deployed to GitHub Pages (NOT Azure ACI)
- [ ] Polling interval: 60 seconds (fetch data via GitHub API)
- [ ] Data source: `.squad/heartbeat/*.json` from SS repo
- [ ] 4 new features implemented (see C4 for details):
  1. Activity Feed (last 50 events, real-time)
  2. Pipeline Visualizer (6 stages, all repos)
  3. Team Board (agent status, assigned work)
  4. Cost Tracker (always €0, shows savings vs. alternatives)
- [ ] NO streaming, NO WebSockets, NO Azure dependencies
- [ ] Client-side only: React SPA fetching JSON from GitHub Pages
- [ ] Test: Dashboard updates within 60s of new heartbeat
- [ ] Total cost: €0

**Technical Implementation:**
- React 18 + Vite (static build)
- Data fetch: `fetch()` to GitHub raw URLs every 60s
- State management: React Context or Zustand
- Deploy: GitHub Actions → GitHub Pages

---

## WORKSTREAM C: REPO EVOLUTION (Finish What We Have)

Goal: Complete pending features in all 4 satellite repos.

### C1. Flora Feature Completion

**Issue Title:** Define and implement pending features for Flora game  
**Repo:** Flora  
**Assigned to:** @copilot (with Trinity oversight)  
**Dependencies:** A2 (needs roadmap.md)  
**Labels:** `copilot-ready`, `type:feature`, `pipeline:implementation`

**Acceptance Criteria:**
- [ ] Flora roadmap.md reviewed → 3 priority features identified
- [ ] 3 GitHub issues created (1 per feature) with `copilot-ready` label
- [ ] Each issue includes:
  - Clear title (e.g., "Add power-up system to Flora gameplay")
  - Acceptance criteria checklist
  - Files to modify (specific paths)
  - Expected behavior with examples
- [ ] @copilot implements features sequentially
- [ ] All features tested by Switch before marking `pipeline:deployed`
- [ ] Flora updated on GitHub Pages after each feature

**Example Features (TBD by Oracle in A2):**
- Power-up system
- Level progression
- Sound effects integration
- High score persistence

---

### C2. ComeRosquillas Feature Completion

**Issue Title:** Define and implement pending features for ComeRosquillas game  
**Repo:** ComeRosquillas  
**Assigned to:** @copilot (with Trinity oversight)  
**Dependencies:** A2 (needs roadmap.md)  
**Labels:** `copilot-ready`, `type:feature`, `pipeline:implementation`

**Acceptance Criteria:**
- [ ] ComeRosquillas roadmap.md reviewed → 3 priority features identified
- [ ] 3 GitHub issues created (1 per feature) with `copilot-ready` label
- [ ] Each issue includes:
  - Clear title (e.g., "Implement combo scoring in ComeRosquillas")
  - Acceptance criteria checklist
  - Files to modify (specific paths)
  - Expected behavior with examples
- [ ] @copilot implements features sequentially
- [ ] All features tested by Switch before marking `pipeline:deployed`
- [ ] ComeRosquillas updated on GitHub Pages after each feature

**Example Features (TBD by Oracle in A2):**
- Combo scoring system
- Enemy AI improvements
- Particle effects
- Leaderboard integration

---

### C3. pixel-bounce Polish & Roadmap

**Issue Title:** Polish pixel-bounce and define v2.0 feature roadmap  
**Repo:** pixel-bounce  
**Assigned to:** Oracle (Product & Docs) + @copilot  
**Dependencies:** A2 (needs roadmap.md)  
**Labels:** `squad:oracle`, `copilot-ready`, `type:enhancement`

**Acceptance Criteria:**
- [ ] Current v1.x polished:
  - All known bugs fixed (check GitHub issues)
  - Performance optimized (60 FPS stable)
  - UI/UX improvements (better controls, visual feedback)
- [ ] v2.0 roadmap created in `roadmap.md`
- [ ] Roadmap includes 5 major features with:
  - User value statement
  - Complexity estimate (S/M/L)
  - Priority order
  - @copilot-ready issue drafts
- [ ] Roadmap approved by Morpheus
- [ ] First v2.0 feature issue created and assigned

**v2.0 Feature Ideas (TBD by Oracle):**
- Multiplayer mode (local or online)
- Level editor
- Custom skins/themes
- Mobile touch controls
- Achievement system

---

### C4. Squad Monitor 4 New Features

**Issue Title:** Implement 4 new features in ffs-squad-monitor dashboard  
**Repo:** ffs-squad-monitor  
**Assigned to:** Trinity (Full-Stack Developer)  
**Dependencies:** B4 (polling mode foundation)  
**Labels:** `squad:trinity`, `type:feature`, `priority:medium`

**Acceptance Criteria:**

#### Feature 1: Activity Feed
- [ ] Component: `<ActivityFeed>` shows last 50 events
- [ ] Event types: issue opened/closed, PR merged, deploy, label change
- [ ] Grouped by repo with color coding
- [ ] Real-time updates (60s polling)
- [ ] Filters: by repo, by event type, by date range

#### Feature 2: Pipeline Visualizer
- [ ] Component: `<PipelineVisualizer>` shows 6-stage pipeline
- [ ] Visual: Horizontal flow diagram (Proposal→GDD→Issues→Code→Build→Deploy)
- [ ] Shows all repos simultaneously (6 rows, 6 columns grid)
- [ ] Each cell: colored by status (pending/in-progress/complete/blocked)
- [ ] Click cell → shows details (issues, PRs, timestamps)

#### Feature 3: Team Board
- [ ] Component: `<TeamBoard>` shows 8 agent cards
- [ ] Each card: avatar, name, role, current assignment, status (active/idle)
- [ ] Status: active (working on issue), idle (no assignments)
- [ ] Current assignment: linked to GitHub issue
- [ ] Load distribution chart (issues per agent, last 7 days)

#### Feature 4: Cost Tracker
- [ ] Component: `<CostTracker>` shows €0 current spend
- [ ] Comparison: "vs. Azure ACI: €120/mo saved"
- [ ] Historical: Budget vs. actual (chart, last 30 days)
- [ ] Breakdown: CI minutes used (free tier %), storage, bandwidth
- [ ] Alert: Warns if approaching free tier limits (>80%)

**All 4 features tested with real data from heartbeat JSON files.**

---

## Dependency Graph

```mermaid
graph TD
    A1[A1: Perpetual Motion Workflow] --> A4[A4: Safety Net Cron]
    A1 --> B4[B4: Squad Monitor Upgrade]
    
    A2[A2: Roadmap Bootstrap] --> A1
    A2 --> A3[A3: Issue Template]
    A2 --> C1[C1: Flora Features]
    A2 --> C2[C2: ComeRosquillas Features]
    A2 --> C3[C3: pixel-bounce Polish]
    
    A3 --> A5[A5: squad watch Integration]
    
    B1[B1: FFS GitHub Page] --> B2[B2: Daily Devlog]
    B1 --> B3[B3: SS GitHub Page]
    
    B4 --> C4[C4: Squad Monitor 4 Features]
    
    style A1 fill:#FF9800
    style A2 fill:#4CAF50
    style B1 fill:#2196F3
    style A3 fill:#FF9800
```

**Legend:**
- 🟢 Green: Can start immediately (no dependencies)
- 🔵 Blue: Priority path (user-facing visibility)
- 🟠 Orange: Critical for autonomy

---

## Parallel Execution Strategy

### Week 1: Foundation
**Parallel Tracks:**
1. Tank: A1 (Heartbeat) + A5 (Ralph Guardian)
2. Oracle: A2 (Roadmaps for all 6 repos)
3. Trinity: B1 (FFS Page) + B3 (SS Page)

**Blockers:** None — all can start immediately

### Week 2: Integration
**Parallel Tracks:**
1. Switch: A3 (Completion Detectors) — depends on A1 ✅
2. Morpheus: A4 (@copilot Integration) — depends on A2 ✅
3. Oracle: B2 (Daily Devlog) — depends on B1 ✅
4. Trinity: B4 (Squad Monitor Polling) — depends on A1 ✅

**Blockers:** Week 1 must complete first

### Week 3-4: Feature Delivery
**Parallel Tracks:**
1. @copilot: C1 (Flora) + C2 (ComeRosquillas) + C3 (pixel-bounce) — depends on A2 ✅
2. Trinity: C4 (Squad Monitor 4 Features) — depends on B4 ✅
3. Switch: Quality gates for all new features

**Blockers:** Week 2 must complete first

---

## Success Metrics

### Autonomy Metrics (Workstream A)
- [ ] Heartbeat runs daily without errors (7/7 days)
- [ ] 3 issues auto-created from roadmaps by completion detectors
- [ ] @copilot picks up 5+ issues within 1min of labeling
- [ ] Ralph escalates 0 false positives, catches 1+ real stuck state
- [ ] Human intervention <15min/week (Morpheus triage only)

### Visibility Metrics (Workstream B)
- [ ] FFS Page live with 3 playable games in iframes
- [ ] SS Page live with system health dashboard
- [ ] Daily devlog generates 7/7 days with real events
- [ ] Squad Monitor shows real-time data with <60s lag
- [ ] 3 shareable URLs sent to user friends ("wow factor" achieved)

### Feature Metrics (Workstream C)
- [ ] Flora: 3 features deployed to GitHub Pages
- [ ] ComeRosquillas: 3 features deployed to GitHub Pages
- [ ] pixel-bounce: v1.x polished + v2.0 roadmap approved
- [ ] Squad Monitor: 4 new features functional in production
- [ ] All 4 repos marked `pipeline:deployed` in latest state

### Cost Metrics (All Workstreams)
- [ ] Total spend: €0.00 (100% GitHub free tier)
- [ ] CI minutes used: <50% of free tier quota
- [ ] Storage used: <80% of free tier quota
- [ ] No Azure resources created
- [ ] No paid API calls made

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| @copilot misunderstands issues | Medium | High | A4 includes strict templates + Morpheus review for T1 issues |
| GitHub Pages CORS blocks iframes | Low | High | B1 includes sandbox testing + same-origin policy verification |
| Heartbeat data too large for free tier | Low | Medium | A1 limits to 30-day retention, archives older data |
| Daily devlog misses events | Medium | Low | B2 includes manual override option + event validation tests |
| Roadmaps drift from reality | Medium | Medium | A3 auto-updates roadmaps on completion + weekly Morpheus review |

---

## Rollout Plan

### Day 1 (Mon): Kickoff
- Morpheus: Create all 15 GitHub issues across 6 repos
- Apply labels: `squad:{agent}`, `pipeline:*`, `copilot-ready` where applicable
- Notify team via GitHub Discussions post
- Tank, Oracle, Trinity start immediately on green tasks (A1, A2, B1, B3)

### Day 3 (Wed): Week 1 Checkpoint
- Morpheus: Review progress on A1, A2, B1, B3
- Triage any blockers in real-time
- Switch: Begin test planning for Week 2 tasks

### Day 8 (Mon): Week 2 Kickoff
- Verify Week 1 complete (A1, A2, B1, B3 all merged)
- Start Week 2 tasks (A3, A4, B2, B4)
- @copilot: Begin picking up C1, C2, C3 issues

### Day 15 (Mon): Week 3 Checkpoint
- Verify autonomy foundation (A1-A5 complete)
- Verify visibility sites live (B1-B3 complete)
- Focus shifts to feature delivery (C1-C4)

### Day 22 (Mon): Week 4 Checkpoint
- Verify all C tasks complete
- End-to-end test: Create proposal → observe autonomous pipeline → game deployed
- Switch: Final quality gate for Phase 2

### Day 28 (Mon): Phase 2 Complete
- Morpheus: Final review of all 15 deliverables
- User demo: 3 shareable URLs + autonomous operation proof
- Archive plan, update history, celebrate 🎉

---

## Notes for Agents

**Tank:** Focus on reliability over features. Heartbeat must run 7/7 days without manual intervention.

**Oracle:** Roadmaps are the foundation for autonomy. Spend time making them @copilot-ready (clear, specific, actionable).

**Trinity:** Visibility sites are user-facing. Prioritize polish and "wow factor" over internal dashboards.

**Switch:** Quality gates prevent regressions. Test autonomy workflows end-to-end before marking complete.

**Morpheus:** Triage daily. Unblock agents within 4h. Escalate T0 decisions to founder immediately.

**@copilot:** Only pick up issues labeled `copilot-ready`. If unclear, comment asking for clarification (don't guess).

**Scribe:** Log all completions in orchestration-log. Update decisions.md on T1+ decisions.

**Ralph:** Monitor, don't interfere. Escalate only true blockers (>72h stuck, not slow progress).

---

## Appendix: Issue Creation Checklist

For Morpheus to create issues:

**Per Issue:**
- [ ] Title: Clear action verb + noun (e.g., "Implement X", "Build Y", "Configure Z")
- [ ] Body: Copy acceptance criteria from this plan
- [ ] Labels: `squad:{agent}` + `pipeline:{stage}` + `type:{type}` + optional `copilot-ready`
- [ ] Assignee: Specified agent (or leave blank for @copilot auto-pickup)
- [ ] Milestone: "Phase 2 Visibility & Autonomy"
- [ ] Project: Link to "Phase 2 Execution" project board

**Verification:**
- [ ] All 15 issues created across 6 repos
- [ ] No duplicate issue numbers or titles
- [ ] All dependencies documented in issue comments
- [ ] Team notified via GitHub Discussions

---

**END OF PLAN**

Questions or clarifications → Tag @morpheus in GitHub Discussions.
