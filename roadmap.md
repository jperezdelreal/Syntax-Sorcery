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

## 4. [ ] Issue dedup guard for perpetual motion

**Acceptance Criteria:**
- Script `scripts/dedup-guard.js` checks if an open issue with label `squad` and title containing "roadmap" already exists before creating a new planning issue
- Script accepts `--owner` and `--repo` flags (defaults to current repo via `gh` context)
- If duplicate found: exits with code 0 and logs "Dedup: open planning issue already exists (#N), skipping"
- If no duplicate: exits with code 0 and logs "Dedup: no open planning issue found, safe to create"
- Can run via `npm run dedup:check`
- Unit tests cover: duplicate exists (skip), no duplicate (allow), API error handling
- Documentation in `.squad/guides/dedup-guard.md` explains integration with perpetual-motion workflows

**Files:**
- `scripts/dedup-guard.js` (create)
- `scripts/__tests__/dedup-guard.test.js` (create)
- `package.json` (add dedup:check script)
- `.squad/guides/dedup-guard.md` (create)

**Context:**
Test 1 identified that perpetual-motion creates duplicate "Define next roadmap" issues when multiple issues close in quick succession. This noise pollutes the board and confuses autonomous agents. The dedup guard is a pre-check that downstream repos integrate into their perpetual-motion workflow before creating a new planning issue. SS provides the canonical implementation as the orchestrator hub.

---

## 5. [ ] Azure satellite launcher scripts

**Acceptance Criteria:**
- Script `scripts/azure/start-satellites.sh` launches tmux sessions for all 5 downstream repos on an Azure VM
- Each tmux session: `cd` into repo, runs `copilot` CLI, sends initial "Ralph, go" prompt
- Script `scripts/azure/reset-satellite.sh` kills and restarts a single satellite tmux session by repo name
- Script `scripts/azure/provision-vm.sh` documents Azure CLI commands to provision B2s v2 VM (Ubuntu 24.04, West Europe)
- Systemd unit file `scripts/azure/satellites.service` auto-starts satellites on VM boot
- All scripts are idempotent (safe to re-run)
- README `scripts/azure/README.md` documents setup, usage, and troubleshooting
- Integration test: `start-satellites.sh --dry-run` validates config without launching

**Files:**
- `scripts/azure/start-satellites.sh` (create)
- `scripts/azure/reset-satellite.sh` (create)
- `scripts/azure/provision-vm.sh` (create)
- `scripts/azure/satellites.service` (create)
- `scripts/azure/README.md` (create)

**Context:**
Test 3 (Azure VM Hub/Spoke) is approved but blocked on infrastructure scripts. SS hub runs on local PC; Azure VM runs 5 satellite terminals via tmux. This item unblocks Test 3 execution and is the path to 24/7 autonomous operation. Budget: €25-30/mo for B2s v2 VM. Architecture: SSH from hub → VM, GitHub Issues for cross-repo communication (no direct commits).

---

## 6. [ ] Autonomous PR review gate

**Acceptance Criteria:**
- Script `scripts/review-gate.js` validates a PR against its linked issue's acceptance criteria
- Inputs: `--pr <number>` (required), `--repo <owner/repo>` (optional, defaults to current)
- Checks performed: (1) PR has a linked issue, (2) files changed match "Files:" section in issue body, (3) CI status is passing, (4) PR is not a draft
- Output: structured JSON report with pass/fail per check and overall verdict (APPROVE / REQUEST_CHANGES / NEEDS_HUMAN)
- Can run via `npm run review:gate -- --pr <number>`
- Unit tests cover: all-pass scenario, missing linked issue, file mismatch, CI failing, draft PR
- Documentation in `.squad/guides/review-gate.md` explains usage and integration with ralph-watch

**Files:**
- `scripts/review-gate.js` (create)
- `scripts/__tests__/review-gate.test.js` (create)
- `package.json` (add review:gate script)
- `.squad/guides/review-gate.md` (create)

**Context:**
Test 1 evaluation noted "review was superficial — coordinator read diffs instead of spawning reviewer agent." This script replaces manual review with automated validation: does the PR deliver what the issue asked for? Combined with CI checks (item #1), this creates a two-layer quality gate: CI validates code correctness, review-gate validates delivery completeness. Essential for autonomous merge decisions in multi-terminal operation.
