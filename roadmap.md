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

## ~~10. [x] Automated session report generator~~ ✅

Delivered in PR #54 (merged 2026-03-19). Issue #48 CLOSED.

---

## ~~11. [x] Unified developer CLI for all squad operations~~ ✅

Delivered in PR #55 (merged 2026-03-19). Issue #49 CLOSED.

---

## ~~12. [x] Constellation status page on landing site~~ ✅

Delivered in PR #53 (merged 2026-03-19). Issue #50 CLOSED.

---

## ~~13. [x] E2E integration test suite for the autonomous pipeline~~ ✅

Delivered in PR #57 (merged 2026-03-20). Issue #54 CLOSED.

---

## ~~14. [x] Autonomous performance metrics engine~~ ✅

Delivered in PR #58 (merged 2026-03-20). Issue #55 CLOSED.

---

## ~~15. [x] One-command developer bootstrap~~ ✅

Delivered in PR #59 (merged 2026-03-20). Issue #56 CLOSED.

---

## ~~16. [x] Security hardening — dependency audit, secret scanning, SBOM~~ ✅

Delivered in PR #64 (merged 2026-03-21). Issue #62 CLOSED.

---

## ~~17. [x] Community contribution kit — CONTRIBUTING, CODE_OF_CONDUCT, templates~~ ✅

Delivered in PR #65 (merged 2026-03-21). Issue #61 CLOSED.

---

## ~~18. [x] Automated site deployment pipeline to GitHub Pages~~ ✅

Delivered in PR #63 (merged 2026-03-21). Issue #60 CLOSED.

---

## 19. [ ] Test 3 pre-flight validation script

**Acceptance Criteria:**
- Script `scripts/preflight.js` validates all Test 3 prerequisites in one command
- Checks: Azure CLI installed + logged in, SSH key exists, downstream repos accessible (gh api), branch protection configured on all 5 downstreams, dedup guard operational (dry-run), constellation health passing, security audit clean, test suite green
- Each check reports ✅/❌ with actionable fix instructions on failure
- Exit code 0 only if ALL checks pass; exit code 1 with summary on any failure
- Add `preflight` subcommand to squad-cli.js
- Add `npm run preflight` script to package.json
- CLI flags: `--skip-azure` (skip Azure checks for local-only validation), `--json` (machine-readable output), `--fix` (auto-fix what can be fixed, e.g. run npm install)
- Unit tests (vitest) with DI-mocked exec calls — test each check independently, test combined report, test all-pass and partial-fail scenarios
- No new dependencies

**Files:**
- `scripts/preflight.js` (create)
- `scripts/__tests__/preflight.test.js` (create)
- `scripts/squad-cli.js` (add `preflight` command routing)
- `package.json` (add npm script)

**Context:**
Test 3 (Azure VM 24/7 autonomy) has 5 mandatory prerequisites identified in the Test 2 post-mortem. Currently there's no automated way to verify all prerequisites are met before deployment. A pre-flight checklist prevents deploying a system that will fail. This is standard launch-readiness practice — NASA doesn't launch without pre-flight. The autonomous company shouldn't either.

---

## 20. [ ] Azure Bicep template — infrastructure as code

**Acceptance Criteria:**
- Bicep template `scripts/azure/main.bicep` defining: resource group, B2s_v2 VM (Ubuntu 24.04, West Europe), NSG (SSH-only), public IP, managed identity, cloud-init script for dependency installation (tmux, git, Node.js 20, gh CLI)
- Parameters file `scripts/azure/main.bicepparam` with configurable: VM size, location, admin username, SSH public key path
- Deployment script `scripts/azure/deploy.sh` wrapping `az deployment group create` with validation, what-if preview, and actual deployment modes
- CLI flags: `--validate` (template validation only), `--what-if` (preview changes), `--deploy` (actual deployment)
- Cloud-init installs dependencies and clones all 5 downstream repos automatically
- Output: VM public IP, SSH command, resource IDs
- Update `scripts/azure/README.md` with Bicep deployment instructions
- No new dependencies — uses Azure CLI and built-in Bicep compiler

**Files:**
- `scripts/azure/main.bicep` (create)
- `scripts/azure/main.bicepparam` (create)
- `scripts/azure/deploy.sh` (create)
- `scripts/azure/README.md` (update)

**Context:**
The current provision-vm.sh uses imperative Azure CLI commands — hard to audit, no drift detection, no preview mode. Bicep is Azure's native IaC language: declarative, diffable, version-controlled. A what-if preview lets the founder see exactly what will be created before spending budget. This is the infrastructure foundation for Test 3. Imperative scripts got us started; IaC makes it production-grade.

---

## 21. [ ] Downstream branch protection enforcement script

**Acceptance Criteria:**
- Script `scripts/enforce-branch-protection.js` configures branch protection on all 5 downstream repos via GitHub API
- Protection rules: require status checks to pass (CI), prevent force pushes, require linear history, no deletions of default branch
- Reads repo list from `.squad/constellation.json` or hardcoded constellation array
- Dry-run mode by default — shows what WOULD be changed without applying
- `--apply` flag to actually apply protection rules
- `--repo <name>` flag to target a single repo instead of all 5
- Reports current vs desired protection state for each repo
- Add `enforce-protection` subcommand to squad-cli.js
- Add `npm run enforce:protection` script to package.json
- Unit tests (vitest) with DI-mocked GitHub API calls
- Requires `GITHUB_TOKEN` with repo admin scope

**Files:**
- `scripts/enforce-branch-protection.js` (create)
- `scripts/__tests__/enforce-branch-protection.test.js` (create)
- `scripts/squad-cli.js` (add `enforce-protection` command routing)
- `package.json` (add npm script)

**Context:**
Test 2 post-mortem identified auto-merge without review as a MEDIUM risk. Many satellite PRs merged in <10 seconds — no CI check, no review. At 86 PRs this was tolerable; at 24/7 scale it's dangerous. Branch protection on downstream repos is a mandatory Test 3 prerequisite. This script makes it one command instead of manually configuring 5 repos through the GitHub UI.

---

## 22. [ ] Session watchdog for 24/7 Azure operation

**Acceptance Criteria:**
- Script `scripts/azure/session-watchdog.sh` monitors running tmux satellite sessions
- Checks every 30 minutes (via systemd timer or cron): session alive, session duration, disk space, memory usage
- Auto-restarts sessions that have been running >6 hours (configurable via `MAX_SESSION_HOURS` env var) to prevent context overflow
- Writes structured log to `/var/log/ss-watchdog.jsonl` — one JSON line per check with: timestamp, repo, session_status, uptime_hours, action_taken, disk_pct, mem_pct
- systemd timer unit `scripts/azure/session-watchdog.timer` + service unit `scripts/azure/session-watchdog.service`
- Alerts: if a session fails to restart 3 times, writes CRITICAL entry to log (founder can grep for it)
- `--dry-run` flag to show what would happen without taking action
- Update `scripts/azure/README.md` with watchdog setup instructions

**Files:**
- `scripts/azure/session-watchdog.sh` (create)
- `scripts/azure/session-watchdog.timer` (create)
- `scripts/azure/session-watchdog.service` (create)
- `scripts/azure/README.md` (update)

**Context:**
The founder's directive in decisions.md: "En Azure VM (Test 3), el equipo debe auto-resetear sesiones." Squad sessions use 1M context models but will eventually exhaust context in a 24/7 operation. Without a watchdog, sessions silently degrade and eventually fail. The watchdog is the operational heartbeat — it ensures continuous operation by proactively restarting before problems occur. JSONL logging enables post-mortem analysis. This is the difference between "running on Azure" and "reliably running on Azure."

---

## 23. [ ] Live metrics dashboard on landing site

**Acceptance Criteria:**
- Astro component `site/src/components/MetricsDashboard.astro` displaying key KPIs from metrics engine
- Metrics displayed: velocity (issues/day), throughput (PRs/week), quality rate (% PRs approved first-try), test count + growth, autonomous streak (consecutive PRs without human intervention), cycle time (issue→merge average)
- Data source: `npm run metrics --json` output piped to a static JSON file during site build (`site/public/data/metrics.json`)
- Build step in `site/package.json`: pre-build script generates metrics JSON from hub repo
- Visual design: Matrix-themed cards with green-on-black aesthetic matching existing landing page
- Responsive layout — works on mobile and desktop
- Page route: `/metrics` on the landing site
- Link added to landing site navigation
- No external dependencies — pure HTML/CSS with inline data

**Files:**
- `site/src/components/MetricsDashboard.astro` (create)
- `site/src/pages/metrics.astro` (create)
- `site/src/styles/metrics.css` (create — or extend existing styles)
- `site/package.json` (add pre-build metrics generation script)

**Context:**
The metrics engine (Phase 6) computes KPIs but has no visual output beyond terminal. The landing site (Phase 4) shows the system architecture but not its performance. A live metrics dashboard is the founder's ultimate demo artifact — visitors see not just WHAT the system does, but HOW WELL it does it. Velocity, quality rate, and autonomous streak are the numbers that prove this isn't just a concept. Combined with the auto-deploy pipeline (Phase 7), every merged PR automatically updates the public dashboard.

---

## 24. [ ] Auto-update test count badge in CI

**Acceptance Criteria:**
- CI workflow step (in `.github/workflows/ci.yml`) that extracts test count from vitest JSON output after tests pass on main branch
- Updates the test count badge in README.md from hardcoded value to actual count (currently says "168 passing" but actual is 399)
- Uses vitest `--reporter=json` to parse total test count reliably
- Only commits if the count actually changed (no empty commits)
- Commit message: `chore: update test count badge to N passing`
- Skips badge update on PR branches (only updates on main)
- Add `[skip ci]` to the badge-update commit to prevent infinite loop
- No new dependencies — uses built-in vitest reporter and sed/node script

**Files:**
- `.github/workflows/ci.yml` (update — add badge update step)
- `scripts/update-badge.js` (create — parse vitest JSON, update README badge)

**Context:**
The README badge says "168 passing" but the actual count is 399. This gap grows every time tests are added and makes the project look stale. An autonomous company should autonomously keep its own badges accurate. This is a small but high-visibility fix — every visitor to the repo sees the badge. Auto-updating it on CI is the natural completion of the autonomous pipeline: agents write code, tests grow, badge reflects reality.
