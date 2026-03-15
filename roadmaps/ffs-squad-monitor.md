# FFS Squad Monitor Roadmap

## TLDR
Build comprehensive team operations dashboard. Real-time agent status, metrics visualization, autonomy tracking. Max 3 features. Scope: monitoring infrastructure, no new team workflows.

---

## Feature 1: [ ] Create live agent status dashboard with GitHub API integration
Display real-time view of all squad members, current assignments, and issue queue per agent.

- Fetch agent assignments from GitHub Teams API
- Display agent cards (name, avatar, current issue count, status)
- Color-code status (🟢 active, 🟡 idle, 🔴 offline/no activity 1h+)
- Show current top-priority issue per agent
- Update every 60 seconds via GitHub API polling
- Files: `src/pages/dashboard.astro`, `src/components/AgentCard.astro`, `src/api/agent-status.js`
- Context: Team at-a-glance visibility; enables coordination

## Feature 2: [ ] Build metrics panel showing perpetual motion health
Track autonomy engine performance: issue closure rate, roadmap burn-down, workflow success rate.

- Fetch recent closed issues (last 7 days) and plot trend
- Roadmap progress (items completed vs. remaining per repo)
- Perpetual motion success rate (created/failed issue creation attempts)
- Rate limit status (current open copilot-ready issues, next reset time)
- Monthly metrics summary (total issues closed, avg resolution time)
- Files: `src/components/MetricsPanel.astro`, `src/api/metrics-aggregator.js`
- Context: Proves autonomy works; grounds scaling decisions

## Feature 3: [ ] Add timeline view of squad decisions and phase progress
Create visual history of major decisions, approvals, and phase milestones.

- Parse decisions.md and extract tier/status per entry
- Timeline UI (vertical or horizontal, decision cards with date/author)
- Phase progress overlay (current phase, next target, days to completion estimate)
- Filter by tier (T0/T1/T2) and status (approved/pending/blocked)
- Link to GitHub issues and PRs mentioned in decisions
- Files: `src/components/Timeline.astro`, `src/api/decision-parser.js`, `src/pages/timeline.astro`
- Context: Transparency tool for community; demonstrates decision velocity
