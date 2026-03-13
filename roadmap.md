# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## ~~1. [x] Configure CI checks and branch protection~~ ✅

Delivered in PR #32 (merged 2026-03-18). Issue #30 CLOSED.

---

## ~~2. [x] Add constellation-wide health monitoring~~ ✅

Delivered in PR #33 (merged 2026-03-18). Issue #31 CLOSED.

---

## ~~3. [x] Create ralph-watch.ps1 monitoring dashboard~~ ✅

Delivered in PR #34 (merged 2026-03-18). Issue #29 CLOSED.

---

## ~~4. [x] Issue dedup guard for perpetual motion~~ ✅

Delivered in PR #38 (merged 2026-03-19). Issue #36 CLOSED.

---

## ~~5. [x] Azure satellite launcher scripts~~ ✅

Delivered in PR #39 (merged 2026-03-19). Issue #35 CLOSED.

---

## ~~6. [x] Autonomous PR review gate~~ ✅

Delivered in PR #40 (merged 2026-03-19). Issue #37 CLOSED.

---

## ~~7. [x] README premium overhaul — company-grade presentation~~ ✅

Delivered in PR #44 (merged 2026-03-19). Issue #41 CLOSED.

---

## ~~8. [x] Landing page visual upgrade — Matrix-themed premium design~~ ✅

Delivered in PR #47 (merged 2026-03-19). Issue #42 CLOSED.

---

## ~~9. [x] Architecture documentation with visual system diagrams~~ ✅

Delivered in PR #46 (merged 2026-03-19). Issue #43 CLOSED.

---

## 10. [ ] Automated session report generator

**Acceptance Criteria:**
- Script `scripts/session-report.js` generates a structured report of autonomous session activity
- Captures via `gh` CLI: issues opened/closed in time window, PRs merged/rejected, current test count (parse `npm test` output), agents involved (from PR authors/branches)
- Output format: Markdown report with frontmatter (date, duration, phase, agent count) + sections for Issues, PRs, Tests, Summary
- Writes report to `docs/reports/YYYY-MM-DD-session.md` (creates directory if needed)
- CLI flags: `--since <ISO date>` (default: 24h ago), `--until <ISO date>` (default: now), `--dry-run` (print to stdout, don't write file)
- Add `npm run report:session` script to package.json
- Unit tests (vitest) with DI-mocked `gh` CLI calls, consistent with existing test patterns (dedup-guard, review-gate)
- Exit code 0 on success, 1 on API error

**Files:**
- `scripts/session-report.js` (create)
- `scripts/__tests__/session-report.test.js` (create)
- `package.json` (add npm script)

**Context:**
The autonomous engine runs, but there's no structured record of what it accomplished. After 9 issues closed and 10 PRs processed in a single session, the only evidence is scattered across GitHub events. A report generator creates a "company quarterly report" after each session — concrete proof of autonomous work for the founder, trend data for operational analysis, and marketing gold for demonstrating real AI output. Ralph can invoke this at session end. Consistent DI pattern with existing scripts.

---

## 11. [ ] Unified developer CLI for all squad operations

**Acceptance Criteria:**
- Script `scripts/squad-cli.js` provides a single entry point for all squad operations
- Commands: `status` (open issues + PR state from `gh`), `health` (runs constellation-health.js), `review <PR#>` (runs review-gate.js), `dedup` (runs dedup-guard.js), `report [--since] [--until]` (runs session-report.js), `help` (lists all commands with descriptions)
- Consistent output: human-readable by default, `--json` flag for machine-readable JSON output
- Built-in help: `npm run squad` with no args shows usage + available commands
- Error handling: unknown commands show help + exit 1, missing required args show usage for that command
- Add `npm run squad` script to package.json (passes args via `--`)
- Unit tests for command routing, help output, error handling, and JSON output flag
- No new dependencies — uses existing scripts via require() or child_process

**Files:**
- `scripts/squad-cli.js` (create)
- `scripts/__tests__/squad-cli.test.js` (create)
- `package.json` (add npm script)

**Context:**
Currently there are 5+ separate npm scripts (`check:constellation`, `review:gate`, `dedup:check`, `dashboard:ralph`, `test:validate-squad`) with inconsistent naming and no discoverability. A developer joining the project has to read package.json to find them. A unified CLI with `npm run squad -- help` makes every operation discoverable from a single command. This is the developer experience equivalent of the README overhaul — making the system not just functional but *usable*. Critical for Squad community adoption.

---

## 12. [ ] Constellation status page on landing site

**Acceptance Criteria:**
- New Astro page at `site/src/pages/status.astro` — the company's public operational status page
- Displays all 6 constellation repos with: name, description, CI badge (GitHub Actions), last activity (from GitHub API at build time), open issue count, health indicator (green/yellow/red based on last activity age)
- Health logic: green = active within 7 days, yellow = 7-30 days, red = 30+ days inactive
- Reuses existing `getConstellationWithStats()` from `site/src/utils/data.ts` (extend if needed)
- Summary bar at top: total repos, total healthy, total tests (168+), current phase
- Consistent Matrix theme with existing landing page (dark background, green accents, #00ff41)
- Mobile responsive, `prefers-reduced-motion` respected
- Navigation: linked from main landing page and README
- No external dependencies — pure Astro/CSS/JS

**Files:**
- `site/src/pages/status.astro` (create)
- `site/src/pages/index.astro` (add navigation link to /status)
- `README.md` (add link to status page)

**Context:**
Every serious company has a status page. Syntax Sorcery monitors 6 repos but the health data is only visible via CLI (`npm run check:constellation`) or ralph-watch dashboard (local HTML). A public `/status` page transforms internal monitoring into external proof — visitors can see the constellation is alive, repos are active, CI is green. This is the final piece of the "showroom" started in Phase 4: the README introduces, the landing page impresses, the status page *proves*. Reuses existing `getConstellationWithStats()` for data consistency.
