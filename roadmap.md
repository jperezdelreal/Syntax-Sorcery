# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## 1. [ ] Configure CI checks and branch protection

**Acceptance Criteria:**
- GitHub Actions workflow `.github/workflows/ci.yml` runs on pull_request events
- Workflow validates package.json dependencies are installed (npm ci)
- Workflow runs existing tests if vitest.config.js is present (npm test)
- Workflow lints JavaScript files with eslint (or skips if not configured)
- Branch protection rule on master/main branch requires ci workflow to pass before merge
- Documentation in `.squad/guides/ci-checks.md` explains what checks run and how to add new ones
- Test the workflow by opening a test PR and verifying checks run

**Files:**
- `.github/workflows/ci.yml` (create)
- `.squad/guides/ci-checks.md` (create)
- `package.json` (add test script if missing)

**Context:**
Test 1 identified ZERO CI checks as the #1 critical deficiency — PRs merged without validation. This is the highest priority fix for Test 2. Branch protection with required status checks ensures @copilot PRs are validated before merge, preventing broken code from entering master. This is the foundation of autonomous quality control.

---

## 2. [ ] Add constellation-wide health monitoring

**Acceptance Criteria:**
- Script `scripts/constellation-health.js` reads `.squad/constellation.json` and checks all downstream repos
- For each repo, validates: perpetual-motion.yml exists, roadmap.md exists, at least 1 workflow run in last 7 days
- Script outputs a health report with GREEN (healthy) / YELLOW (warning) / RED (critical) status per repo
- Can run via `npm run check:constellation`
- Add optional GitHub Actions workflow `.github/workflows/constellation-health.yml` (manual trigger) that runs the script
- Documentation in `.squad/guides/constellation-monitoring.md` explains health checks

**Files:**
- `scripts/constellation-health.js` (create)
- `package.json` (add check:constellation script)
- `.github/workflows/constellation-health.yml` (create, optional)
- `.squad/guides/constellation-monitoring.md` (create)

**Context:**
SS is the orchestrator hub for 6 repositories. This health check provides a single command to verify the entire constellation is operational. Complements safety-net.yml (reactive escalation) with proactive validation. Enables quick diagnosis when a satellite repo stops progressing. Critical for multi-terminal Test 2 where each repo runs independently.

---

## 3. [ ] Create ralph-watch.ps1 monitoring dashboard

**Acceptance Criteria:**
- HTML page `site/ralph-watch-status.html` displays live status of ralph-watch.ps1 monitoring
- Dashboard shows: last run timestamp, repos monitored, recent refueling events, error count
- Reads from `logs/ralph-watch.log` (must parse last 100 lines)
- Auto-refreshes every 30 seconds via JavaScript
- Dashboard accessible via `npm run dashboard:ralph` (opens in browser)
- Styling matches existing Syntax Sorcery brand (dark theme)

**Files:**
- `site/ralph-watch-status.html` (create)
- `scripts/parse-ralph-logs.js` (create helper to extract structured data from logs)
- `package.json` (add dashboard:ralph script)
- `site/styles/dashboard.css` (create or extend existing styles)

**Context:**
ralph-watch.ps1 is the Layer 2 refueling engine running 24/7 in the background. Currently, monitoring requires tailing logs manually. This dashboard provides real-time visibility into the autonomous refueling process. Essential for Test 2 where we validate that the hub (SS terminal) is actively monitoring and refueling satellite repos. Demonstrates operational transparency for autonomous systems.
