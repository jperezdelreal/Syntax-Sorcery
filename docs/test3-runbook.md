# Test 3 Deployment Runbook

**Status:** Complete  
**Last Updated:** 2026-07-16  
**Scope:** End-to-end deployment, verification, operation, and monitoring of Syntax Sorcery constellation (Test 3)  
**Success Criteria:** 24h+ continuous autonomous operation, >10 PRs/day merged, zero critical alerts, repeatable teardown  

---

## TLDR

**What:** Deploy 5 downstream GitHub repos on an Azure VM running autonomous Ralph agents inside tmux sessions, monitored by a systemd watchdog timer.

**Timeline:** 30–45 min deployment + provisioning, ~5 min verification, then continuous 24h+ operation.

**Key Commands:**
```bash
# Deploy infrastructure (Bicep)
./scripts/azure/provision-vm.sh

# Verify VM health (10 checks)
./scripts/azure/verify-deployment.sh

# Launch constellation (5 tmux sessions)
./scripts/azure/start-constellation.sh

# Monitor via watchdog (automatic, runs every 30 min)
tail -f /var/log/ss-watchdog.jsonl | jq .

# Teardown (destroys all resources)
./scripts/azure/provision-vm.sh --teardown
```

**Cost:** €25–30/month (B2s_v2 VM) + €5 storage = ~€35/month.

---

## Pre-Launch Checklist

### Quality Gates ✅

- [ ] **All tests passing across all repos**
  - Hub: `npm test` in Syntax Sorcery (target: 399+ tests green)
  - Satellites: Verify CI green on each downstream repo (flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor, FirstFrameStudios)
  - Command: Run GitHub Actions dashboard or `gh run list -L5` per repo

- [ ] **Bicep IaC validated**
  - Command: `scripts/azure/provision-vm.sh --validate` (if deploy script supports validation)
  - Verify: Resource group, VM sku (Standard_B2s_v2), region (West Europe), Ubuntu 24.04 LTS
  - Budget: Verify €25-30/month estimated cost for compute

- [ ] **Pre-flight script green**
  - Command: `npm run preflight` (verifies: prerequisites, dependencies, .squad/ structure, constellation health, test validation)
  - Expected: All 5 steps PASS (Node ≥18, gh CLI, git, dependencies installed, tests passing)

- [ ] **Branch protection enforced on all downstreams**
  - Verify in GitHub: Settings → Branches → Branch protection rules
  - Required: ≥1 passing CI check before merge (prevents auto-merge without status gates)
  - Apply to: flora, ComeRosquillas, pixel-bounce, ffs-squad-monitor, FirstFrameStudios
  - Command: `gh repo edit <repo> --enable-branch-protection`

- [ ] **SSH key provisioned**
  - Local hub machine: `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub` exist
  - Public key will be added to VM during provisioning
  - Test: `ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa` if missing

- [ ] **Azure subscription active with budget alert**
  - Verify subscription status in Azure Portal
  - Set budget alert: Azure Cost Management → Budgets → Create
  - Alert threshold: €400/month (headroom for contingency)
  - Action: Email notification when approaching 80% spend

---

## Phase 1: Bicep IaC Deployment

### Prerequisites (on local machine)

Before deployment, verify:

```bash
# 1. Azure CLI installed and authenticated
az account show
# If not logged in: az login

# 2. SSH key exists (required for VM access)
ls -la ~/.ssh/id_rsa.pub
# If missing: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# 3. GitHub CLI installed
gh --version
# If missing: brew install gh (macOS) or apt install gh (Linux)

# 4. GitHub CLI authenticated
gh auth status
# If not: gh auth login

# 5. Azure subscription with budget monitoring
az account list
# Note the subscription ID (will need for cost tracking)
```

### Phase 1.1: Deploy Azure Infrastructure

**Command:**
```bash
cd "C:\Users\joperezd\GitHub Repos\Syntax Sorcery"
./scripts/azure/provision-vm.sh
```

**What it does:**
- Verifies Azure CLI logged in and SSH key exists
- Creates resource group `syntax-sorcery-satellites` in **West Europe** (€25-30/mo region)
- Deploys VM `ss-satellite-vm` (Standard_B2s_v2 SKU, Ubuntu 24.04 LTS)
- Opens port 22 (SSH) in NSG
- Installs dependencies via cloud-init:
  - tmux, git, curl, jq, GitHub CLI
  - Node.js + npm
  - @githubnext/github-copilot-cli (global npm package)
- Clones all 5 downstream repos into `/home/ssadmin/repos/`

**Expected output:**
```
[2026-07-16T10:00:00Z] CREATE: resource group 'syntax-sorcery-satellites' in westeurope
[2026-07-16T10:01:00Z] CREATE: VM 'ss-satellite-vm' (size: Standard_B2s_v2, image: Ubuntu 24.04)
[2026-07-16T10:02:00Z] CONFIGURE: installing dependencies on VM
...
[2026-07-16T10:15:00Z] SUCCESS: VM deployed

VM Public IP: 52.XXX.XXX.XXX
SSH: ssh ssadmin@52.XXX.XXX.XXX
```

**Save the Public IP — you'll need it for all remaining steps:**
```bash
# Store in environment variable for quick reference
export VM_IP="52.XXX.XXX.XXX"
```

### Phase 1.2: Verify VM Provisioning Complete

After the script completes, wait 2–3 minutes for cloud-init to finish on the VM, then verify:

```bash
ssh ssadmin@${VM_IP} 'cloud-init status'
# Expected: "status: done"

ssh ssadmin@${VM_IP} 'node --version && gh --version && tmux -V'
# Expected: v20.x.x, gh version X.X.X, tmux X.X
```

---

## Phase 2: Post-Deployment Verification

### Phase 2.1: Run Verification Script

The `verify-deployment.sh` script runs 10 structured checks to confirm the VM is healthy and ready for constellation launch.

```bash
./scripts/azure/verify-deployment.sh
```

**What it checks:**
1. **SSH connectivity** — Can reach VM
2. **Cloud-init completed** — All provisioning done
3. **Node.js installed** — Version ≥18
4. **GitHub CLI installed** — Version shown
5. **GitHub CLI authenticated** — Token/SSH key configured
6. **Repos cloned (5)** — All repos exist in ~/repos/
7. **tmux available** — Session multiplexer ready
8. **Disk space** — >10% free (expected: 25+ GB free)
9. **Memory** — >10% free (expected: 2+ GB free)
10. **Network connectivity** — github.com reachable (HTTP 200)

**Expected output:**
```
╔══════════════════════════════════════════════════════════╗
║  Syntax Sorcery Test 3 — Deployment Verification        ║
║  Target: ssadmin@52.XXX.XXX.XXX                         ║
╚══════════════════════════════════════════════════════════╝

  [PASS] SSH connectivity
  [PASS] Cloud-init completed
  [PASS] Node.js installed             v20.x.x
  [PASS] GitHub CLI installed          gh version x.x.x
  [PASS] GitHub CLI authenticated
  [PASS] Repo cloned: flora
  [PASS] Repo cloned: ComeRosquillas
  [PASS] Repo cloned: pixel-bounce
  [PASS] Repo cloned: ffs-squad-monitor
  [PASS] Repo cloned: FirstFrameStudios
  [PASS] tmux available                tmux 3.x
  [PASS] Disk space                    25.3GB free (15% used)
  [PASS] Memory                        3.2GB free (22% used)
  [PASS] Network (github.com)          HTTP 200
  [PASS] Watchdog dry-run               executes successfully

═══════════════════════════════════════════════════════════
  VERIFICATION REPORT
═══════════════════════════════════════════════════════════
  Total: 14 checks | 14 passed | 0 failed | 0 warnings
═══════════════════════════════════════════════════════════

[✓] Verification PASSED — VM is ready for Test 3
```

**If any checks FAIL:**
- Red `[FAIL]` entries must be resolved before proceeding
- Most common: GitHub CLI auth not configured — run `ssh ssadmin@${VM_IP} 'gh auth login'` on VM
- Disk/memory warnings are OK to proceed with if >5GB disk and >1GB RAM free

### Phase 2.2: Configure GitHub CLI on VM (if needed)

If GitHub CLI auth check fails in verification:

```bash
ssh ssadmin@${VM_IP}
gh auth login
# Select: GitHub.com
# Select auth method: SSH
# Generate new SSH key: Y
# Passphrase: (press Enter for none)
# Title for SSH key: Azure Satellite VM
```

Then verify:
```bash
gh auth status
# Expected: "Logged in to github.com as jperezdelreal"

gh repo list
# Expected: list of repos (shows auth is working)
```

---

## Phase 3: Constellation Launch

### Phase 3.1: Deploy Constellation Scripts to VM

Copy all Azure automation scripts from your local machine to the VM:

```bash
scp -r scripts/azure/ ssadmin@${VM_IP}:~/scripts/azure/
ssh ssadmin@${VM_IP} 'chmod +x ~/scripts/azure/*.sh'
```

Verify scripts are executable:
```bash
ssh ssadmin@${VM_IP} 'ls -la ~/scripts/azure/*.sh | head -5'
# Expected: all .sh files have -rwx------ or -rwxr-xr-x permissions
```

### Phase 3.2: Start Constellation (Dry-run First)

Always validate the launch configuration before actual deployment:

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/start-constellation.sh --dry-run
```

**Expected output:**
```
[2026-07-16T10:30:00Z] DRY-RUN: All 5 repos validated
  Would create session: ss-flora → /home/ssadmin/repos/flora
  Would create session: ss-ComeRosquillas → /home/ssadmin/repos/ComeRosquillas
  Would create session: ss-pixel-bounce → /home/ssadmin/repos/pixel-bounce
  Would create session: ss-ffs-squad-monitor → /home/ssadmin/repos/ffs-squad-monitor
  Would create session: ss-FirstFrameStudios → /home/ssadmin/repos/FirstFrameStudios
```

### Phase 3.3: Launch Constellation

If dry-run passes, launch the actual constellation:

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/start-constellation.sh
```

**Expected output:**
```
[2026-07-16T10:32:00Z] LAUNCH: creating session 'ss-flora'
[2026-07-16T10:32:02Z] ✓ Session 'ss-flora' started
[2026-07-16T10:32:07Z] LAUNCH: creating session 'ss-ComeRosquillas'
[2026-07-16T10:32:09Z] ✓ Session 'ss-ComeRosquillas' started
[2026-07-16T10:32:14Z] LAUNCH: creating session 'ss-pixel-bounce'
[2026-07-16T10:32:16Z] ✓ Session 'ss-pixel-bounce' started
[2026-07-16T10:32:21Z] LAUNCH: creating session 'ss-ffs-squad-monitor'
[2026-07-16T10:32:23Z] ✓ Session 'ss-ffs-squad-monitor' started
[2026-07-16T10:32:28Z] LAUNCH: creating session 'ss-FirstFrameStudios'
[2026-07-16T10:32:30Z] ✓ Session 'ss-FirstFrameStudios' started

═══════════════════════════════════════════════════════════
  CONSTELLATION STATUS
═══════════════════════════════════════════════════════════
  Started: 5 | Skipped: 0 | Failed: 0
  Total running ss-* sessions: 5/5
═══════════════════════════════════════════════════════════

Active constellation sessions:
  ss-ComeRosquillas: 1 windows
  ss-FirstFrameStudios: 1 windows
  ss-flora: 1 windows
  ss-ffs-squad-monitor: 1 windows
  ss-pixel-bounce: 1 windows
```

**What each session is doing:**
- `cd /home/ssadmin/repos/<repo>`
- `git pull --rebase` (fetch latest changes)
- `copilot` (start CLI REPL)
- `Ralph, go` (kick off autonomous agent)

Each Ralph agent is now independent, working through issues in its repo. Agents run in tmux and are detached (keep running even if you disconnect).

### Phase 3.4: Verify Constellation Healthy

Check that all 5 sessions are running and responsive:

```bash
ssh ssadmin@${VM_IP} 'tmux list-sessions'

# Expected: all 5 ss-* sessions listed
ss-ComeRosquillas: 1 windows (created Wed Jul 16 10:32:09 2026)
ss-FirstFrameStudios: 1 windows (created Wed Jul 16 10:32:30 2026)
ss-flora: 1 windows (created Wed Jul 16 10:32:01 2026)
ss-ffs-squad-monitor: 1 windows (created Wed Jul 16 10:32:23 2026)
ss-pixel-bounce: 1 windows (created Wed Jul 16 10:32:16 2026)
```

Peek at a session to confirm agents are running:

```bash
ssh ssadmin@${VM_IP} 'tmux capture-pane -t ss-flora -p | tail -20'

# Expected: recent output from copilot CLI, evidence of Ralph issuing commands
```

---

## Phase 4: Watchdog Installation (Session Health Monitoring)

The watchdog runs every 30 minutes and:
- Checks if all sessions are alive
- Restarts dead sessions automatically
- Recycles sessions after 6 hours (memory leaks prevention)
- Logs structured JSON for monitoring

### Phase 4.1: Install Watchdog Systemd Units

```bash
ssh ssadmin@${VM_IP}

# Copy systemd unit files
sudo cp ~/scripts/azure/session-watchdog.service /etc/systemd/system/
sudo cp ~/scripts/azure/session-watchdog.timer /etc/systemd/system/

# Create state and log directories
sudo mkdir -p /var/lib/ss-watchdog
sudo touch /var/log/ss-watchdog.jsonl
sudo chown ssadmin:ssadmin /var/lib/ss-watchdog /var/log/ss-watchdog.jsonl
```

### Phase 4.2: Enable and Start Watchdog Timer

```bash
ssh ssadmin@${VM_IP}

sudo systemctl daemon-reload
sudo systemctl enable session-watchdog.timer session-watchdog.service
sudo systemctl start session-watchdog.timer

# Verify it's running
sudo systemctl status session-watchdog.timer
# Expected: "active (waiting)"
```

### Phase 4.3: Verify Watchdog Works (Dry-run)

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/session-watchdog.sh --dry-run

# Expected output shows all sessions would be checked
DRY-RUN LOG: {"timestamp":"2026-07-16T10:45:00Z","level":"INFO","host":"ss-satellite-vm","session":"system","message":"watchdog check started","disk_usage_pct":18,"memory_usage_pct":25,"max_session_hours":6}
DRY-RUN LOG: {"timestamp":"2026-07-16T10:45:01Z","level":"INFO","host":"ss-satellite-vm","session":"ss-flora","message":"session healthy","uptime_hours":0,"uptime_seconds":300}
DRY-RUN LOG: {"timestamp":"2026-07-16T10:45:01Z","level":"INFO","host":"ss-satellite-vm","session":"ss-ComeRosquillas","message":"session healthy","uptime_hours":0,"uptime_seconds":298}
...
```

### Phase 4.4: Run Watchdog Now (One-time Manual Check)

To verify watchdog will log correctly:

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/session-watchdog.sh

# Then view the log
ssh ssadmin@${VM_IP} 'tail -10 /var/log/ss-watchdog.jsonl | jq .'
```

**Expected log entries:**
```json
{"timestamp":"2026-07-16T10:47:00Z","level":"INFO","host":"ss-satellite-vm","session":"system","message":"watchdog check started","disk_usage_pct":18,"memory_usage_pct":25,"max_session_hours":6}
{"timestamp":"2026-07-16T10:47:02Z","level":"INFO","host":"ss-satellite-vm","session":"ss-flora","message":"session healthy","uptime_hours":0,"uptime_seconds":480}
{"timestamp":"2026-07-16T10:47:03Z","level":"INFO","host":"ss-satellite-vm","session":"ss-ComeRosquillas","message":"session healthy","uptime_hours":0,"uptime_seconds":478}
...
```

### Phase 4.5: Install Auto-Start Satellites Service (Optional but Recommended)

Ensures constellation restarts if VM reboots:

```bash
ssh ssadmin@${VM_IP}

sudo cp ~/scripts/azure/satellites.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable satellites.service

# Verify
sudo systemctl status satellites.service
# Expected: "enabled" in output
```

---

## Phase 5: GitHub Actions CI Activation

For Test 3 to be fully autonomous, GitHub Actions must be active on all downstream repos and configured with the CI schedule.

### Phase 5.1: Enable GitHub Actions on Each Downstream Repo

SSH into VM and run:

```bash
ssh ssadmin@${VM_IP}
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  cd ~/repos/$repo
  gh repo edit --enable-issues --enable-projects --enable-wiki
  # GitHub Actions are typically enabled by default; verify:
  gh repo view --json repositoryTopics
  echo "--- $repo ready ---"
done
```

Or verify via GitHub web UI:
- Visit each repo → Settings → Actions
- Confirm "Actions permissions" is set to "Allow all actions and reusable workflows"

### Phase 5.2: Verify 30-Minute CI Schedule

Each downstream repo should have a workflow (e.g., `.github/workflows/ci.yml`) that runs on a schedule or on `push`. The constellation will auto-merge PRs that pass CI within ~30 minutes.

Example CI workflow trigger:
```yaml
name: CI
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
  schedule:
    - cron: '*/30 * * * *'  # Run every 30 minutes
```

Verify schedule is configured:

```bash
ssh ssadmin@${VM_IP}
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  cd ~/repos/$repo
  if [ -f .github/workflows/ci.yml ]; then
    echo "✓ CI workflow found in $repo"
    grep -A2 "schedule:" .github/workflows/ci.yml || echo "  (no schedule trigger)"
  else
    echo "✗ No CI workflow in $repo"
  fi
done
```

---

## Phase 6: Founder Monitoring Guide

Monitor these metrics and alerts during the 24–72 hour test window. Watch for intervention triggers.

### Phase 6.1: Key Health Metrics

Check every 2–4 hours:

```bash
# Session status (should be 5/5 running)
ssh ssadmin@${VM_IP} 'tmux list-sessions | grep -c "^ss-"'

# Disk/memory (should be <80% used)
ssh ssadmin@${VM_IP} 'df -h / && free -h'

# Recent errors in watchdog log
ssh ssadmin@${VM_IP} 'tail -20 /var/log/ss-watchdog.jsonl | jq . | grep -i "ERROR\|CRITICAL"'

# PRs merged in last 2 hours (across all repos)
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  gh pr list --repo jperezdelreal/$repo --state merged --limit 5
done

# Check for stuck sessions (same output as 10 min ago = stuck)
ssh ssadmin@${VM_IP} 'for s in ss-flora ss-ComeRosquillas ss-pixel-bounce ss-ffs-squad-monitor ss-FirstFrameStudios; do
  echo "=== $s ==="; tmux capture-pane -t $s -p | tail -5; done'
```

### Phase 6.2: Success Thresholds (KPIs)

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| **All 5 sessions running** | 24h solid | If 1 session down >30 min, check logs for ERROR entries; if CRITICAL (3 failures), restart manually |
| **PRs merged/day** | >10 total | Expected 2–3 per repo. If <1/repo/day, check session logs for issues |
| **Disk usage** | <80% | If >90%, clean `/tmp` or stop constellation |
| **Memory usage** | <80% | Watchdog recycles at 6h; if >90%, check for runaway processes |
| **CI passing rate** | >95% | Some PRs may fail CI; auto-merge only passes. If <80%, investigate test flakes |
| **CRITICAL alerts** | 0 | Any CRITICAL = watchdog couldn't restart session 3x; requires manual fix |

### Phase 6.3: Founder Alert Triggers (When to Intervene)

**🔴 CRITICAL — Stop Test 3 Immediately:**
- Any `CRITICAL` entry in `/var/log/ss-watchdog.jsonl` (watchdog failed to restart session 3 times)
- More than 1 session down for >1 hour (indicates systemic VM issue)
- VM becomes unreachable via SSH (infrastructure failure)
- Azure budget alert triggered (spending approaching €400/mo)
- Disk usage exceeds 95% (space exhaustion)

**🟡 WARNING — Monitor Closely (May Need Action Soon):**
- Single session down but watchdog restarted it (check why it died)
- Memory usage >85% (approaching recycle threshold)
- PRs completely halted for >30 min across all repos (agent may be stuck)
- Unusual ERROR entries in watchdog log (>2 restarts in 1 check cycle)

**✅ NORMAL — No Action:**
- Sessions recycle every 6 hours (expected memory cleanup)
- Some PRs fail CI (agents learn from feedback)
- Occasional WARNING for disk >80% (VM has 30+ GB, not immediate concern)
- 1–2 INFO entries per 30-min cycle per session (normal health checks)

### Phase 6.4: Manual Intervention Procedure

**If a single session is stuck:**

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/reset-satellite.sh flora
# Wait 30 sec, then verify
ssh ssadmin@${VM_IP} 'tmux list-sessions | grep ss-flora'
```

**If all sessions down:**

```bash
ssh ssadmin@${VM_IP}
sudo systemctl restart satellites.service
# Wait 60 sec
tmux list-sessions
# Should show all 5 ss-* sessions
```

**If watchdog keeps failing:**

```bash
ssh ssadmin@${VM_IP}
# Check for stuck processes
ps aux | grep -E "copilot|node" | grep -v grep
# Kill any zombie processes (rare)
pkill -9 -u ssadmin copilot
# Restart watchdog
sudo systemctl restart session-watchdog.service
```

---

## Phase 7: GitHub Actions CI Monitoring

### Phase 7.1: Watch CI Runs

Each repo has GitHub Actions workflows (CI). Test 3 expects CI to run every time Ralph commits to a PR branch.

Monitor CI health via GitHub web UI or CLI:

```bash
# Check latest CI run status across all repos
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  echo "=== $repo ==="
  gh run list --repo jperezdelreal/$repo --limit 5 --status all
done
```

### Phase 7.2: CI Schedule Verification

Confirm workflows are triggered on schedule (every 30 min):

```bash
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  echo "=== $repo ==="
  gh workflow list --repo jperezdelreal/$repo | head -3
done
```

**Expected:** At least one workflow shows recent runs (within last hour).

---

## Phase 8: Troubleshooting Quick Reference

| Symptom | Likely Cause | Diagnosis | Fix |
|---------|--------------|-----------|-----|
| **Single session down (e.g., ss-flora missing)** | Session crashed or ran >6h and recycled | `ssh ssadmin@${VM_IP} 'tail /var/log/ss-watchdog.jsonl \| jq . \| grep "ss-flora"'` | `ssh ssadmin@${VM_IP} ~/scripts/azure/reset-satellite.sh flora` |
| **All 5 sessions dead** | VM resource exhaustion or systemd failure | `ssh ssadmin@${VM_IP} 'free -h && df -h && systemctl status satellites.service'` | `ssh ssadmin@${VM_IP} 'sudo systemctl restart satellites.service'` then `tmux list-sessions` |
| **Cannot SSH into VM** | Network issue or VM crashed | `az vm get-instance-view --resource-group syntax-sorcery-satellites --name ss-satellite-vm --query instanceView.statuses` | Restart VM via Azure Portal or `az vm restart --resource-group syntax-sorcery-satellites --name ss-satellite-vm` |
| **PR creation failing (no new PRs)** | GitHub CLI auth lost or repo corrupted | `ssh ssadmin@${VM_IP} 'gh auth status'` and `git -C ~/repos/flora status` | Re-auth: `ssh ssadmin@${VM_IP} 'gh auth login'` |
| **Disk 95%+ full** | Log bloat or temp files | `ssh ssadmin@${VM_IP} 'du -sh /home/ssadmin/* /var/log/* 2>/dev/null \| sort -rh \| head -10'` | `ssh ssadmin@${VM_IP} 'sudo journalctl --vacuum=100M && rm -f /var/log/*.log'` |
| **Memory stuck at 90%+** | Memory leak in copilot CLI or Node.js | `ssh ssadmin@${VM_IP} 'ps aux --sort=-%mem \| head -5'` | Kill leaky process: `ssh ssadmin@${VM_IP} 'pkill -u ssadmin copilot'` (watchdog auto-restarts) |
| **Watchdog logs CRITICAL** | Session restart failing 3+ times | `ssh ssadmin@${VM_IP} 'tail /var/log/ss-watchdog.jsonl \| jq . \| grep CRITICAL'` | Full restart: `ssh ssadmin@${VM_IP} 'sudo systemctl stop satellites.service && sleep 5 && sudo systemctl start satellites.service'` |
| **PR merged but test still running** | CI hasn't finished or auto-merge delay | Check GitHub Actions: `gh run list --repo jperezdelreal/<repo> --limit 10` | Wait for CI to complete (typically <10 min). If stuck, check PR status manually. |
| **Agent generating low-quality PRs** | Ralph needs tuning or repo has issues | Review merged PRs: `gh pr list --repo jperezdelreal/<repo> --state merged --limit 5` | This is feedback for future iterations. Document patterns and adjust Ralph prompt. |

---

## Phase 9: Rollback Procedures

### Phase 9.1: Graceful Constellation Stop (Keep VM, Stop Agents)

If you need to pause Test 3 without destroying infrastructure:

```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/stop-constellation.sh
```

**What it does:**
- Saves last 5000 lines of each session buffer to log files (`~/logs/constellation/`)
- Gracefully kills all 5 `ss-*` tmux sessions
- Leaves VM running (infrastructure intact)
- Watchdog and satellites.service stop (no auto-restart while paused)

**Expected output:**
```
[2026-07-16T12:00:00Z] Found 5 constellation session(s) to stop
[2026-07-16T12:00:01Z] Stopping 'ss-flora'...
[✓] Saved buffer → /home/ssadmin/logs/constellation/ss-flora-20260716-120001.log (1840 lines)
[✓] Session 'ss-flora' stopped
... (repeat for all 5)

═══════════════════════════════════════════════════════════
  CONSTELLATION SHUTDOWN
═══════════════════════════════════════════════════════════
  Stopped: 5 | Errors: 0
  Logs saved to: /home/ssadmin/logs/constellation/
═══════════════════════════════════════════════════════════

[✓] All constellation sessions stopped cleanly
```

**To resume after graceful stop:**
```bash
ssh ssadmin@${VM_IP} ~/scripts/azure/start-constellation.sh
```

### Phase 9.2: VM Stop (Keep Resources, Stop Billing)

Pause VM without destroying it (useful if waiting for decision):

```bash
az vm deallocate --resource-group syntax-sorcery-satellites --name ss-satellite-vm
```

**Effect:**
- VM stops (no compute charges, but storage charges remain ~€5/mo)
- All sessions, processes, data lost from memory
- Disk/data preserved
- Resume with: `az vm start --resource-group syntax-sorcery-satellites --name ss-satellite-vm`

### Phase 9.3: Complete Teardown (Destroys All Resources)

If Test 3 is complete or failed catastrophically, destroy all Azure resources:

```bash
./scripts/azure/provision-vm.sh --teardown
```

**What it does:**
- Deletes VM `ss-satellite-vm`
- Deletes resource group `syntax-sorcery-satellites`
- All compute, storage, networking resources removed
- Billing stops immediately

**Expected output:**
```
[2026-07-16T12:05:00Z] TEARDOWN: deleting resource group 'syntax-sorcery-satellites'
[2026-07-16T12:06:00Z] SUCCESS: resource group deleted
```

**⚠️ IMPORTANT:** Teardown does NOT affect downstream repos (flora, ComeRosquillas, etc.). All merged PRs, issues, and branch history remain intact in GitHub.

---

## Phase 10: Cost Management

### Phase 10.1: Daily Cost Check

Monitor spending via Azure Portal:

```bash
az vm list-usage --location westeurope --query "[?contains(name.value, 'Compute Virtual Cores')].{Name:name.value, Usage:currentValue, Limit:limit}" -o table
```

Or via Azure Portal:
- https://portal.azure.com → Cost Management + Billing → Cost by resource
- Filter by resource group `syntax-sorcery-satellites`
- Look for resource `ss-satellite-vm`

**Expected daily cost:**
- Compute (B2s_v2): ~€0.65–0.85/day
- Storage: ~€0.10–0.20/day
- **Total:** ~€1–€1.10/day (~€30–33/month)

### Phase 10.2: Budget Alert Setup

Set up cost alerts in Azure Portal (if not already done):

1. Go to https://portal.azure.com → Cost Management + Billing → Budgets
2. Click "Create"
3. **Budget name:** "Syntax Sorcery Test 3"
4. **Budget amount:** €400 (headroom for contingency; normal spend is €30–35/mo)
5. **Alert condition:** Send alert at 80% spent (€320)
6. **Notification email:** Your email or team mailing list

**What happens:** Azure sends email alert when spending crosses €320 during the month.

### Phase 10.3: Cost Optimization (If Approaching Budget)

If daily costs exceed €1.20 (indicating anomaly):

```bash
# Check VM size and CPU usage
ssh ssadmin@${VM_IP} 'top -b -n 1 | head -20'

# If CPU idle, VM is oversized — contact Morpheus for scaling
# If CPU high, sessions running hot — may be normal during test peaks

# Check for large log files
ssh ssadmin@${VM_IP} 'du -sh /var/log/* | sort -rh'
```

**Mitigation if costs spike:**
1. Stop constellation: `./scripts/azure/stop-constellation.sh` (VM idles at ~€0.20/day)
2. Deallocate VM: `az vm deallocate ...` (only storage charges ~€5/mo)
3. Scale down VM: Contact Morpheus (requires downtime, data redeploy)

---

## Phase 11: Production Handover Checklist

Before handing off Test 3 to long-term operation:

- [ ] All 5 sessions running continuously ≥24 hours
- [ ] ≥10 PRs merged across constellation
- [ ] Zero CRITICAL watchdog alerts
- [ ] Disk usage <80%, Memory <80%
- [ ] GitHub CLI auth stable (no recent auth failures)
- [ ] Cost on track (<€2/day)
- [ ] Founder has access to VM IP and ssh key
- [ ] Founder understands monitoring dashboard (logs, KPIs, alerts)
- [ ] Rollback procedures tested (at least dry-run)
- [ ] Incident response team assigned (who to page if Test 3 fails)

---

## Appendix A: Command Reference

### Quick Command Cheatsheet

```bash
# Set VM_IP variable (saves typing)
export VM_IP="52.XXX.XXX.XXX"

# Deploy VM
./scripts/azure/provision-vm.sh

# Verify deployment (10 checks)
./scripts/azure/verify-deployment.sh

# Launch constellation (5 sessions)
ssh ssadmin@${VM_IP} ~/scripts/azure/start-constellation.sh

# Check all sessions alive
ssh ssadmin@${VM_IP} 'tmux list-sessions'

# Peek at a session (live output)
ssh ssadmin@${VM_IP} 'tmux capture-pane -t ss-flora -p | tail -20'

# Attach to session (read-only mode)
tmux attach -t ss-flora
# Detach: Ctrl+B, D

# Check watchdog health
ssh ssadmin@${VM_IP} 'tail -20 /var/log/ss-watchdog.jsonl | jq .'

# Manual restart of single session
ssh ssadmin@${VM_IP} ~/scripts/azure/reset-satellite.sh flora

# Stop constellation (gracefully)
ssh ssadmin@${VM_IP} ~/scripts/azure/stop-constellation.sh

# Check costs (Azure Portal)
# https://portal.azure.com → Cost Management + Billing

# Deallocate VM (stop billing compute)
az vm deallocate --resource-group syntax-sorcery-satellites --name ss-satellite-vm

# Restart VM (after deallocate)
az vm start --resource-group syntax-sorcery-satellites --name ss-satellite-vm

# Destroy everything (irreversible)
./scripts/azure/provision-vm.sh --teardown
```

### Useful SSH Shortcuts

```bash
# Copy to VM
scp -r local/path/ ssadmin@${VM_IP}:/remote/path/

# Execute command on VM
ssh ssadmin@${VM_IP} 'command here'

# Tail log in real-time from local machine
ssh ssadmin@${VM_IP} 'tail -f /var/log/ss-watchdog.jsonl' | jq .

# Download logs to local machine
scp -r ssadmin@${VM_IP}:/home/ssadmin/logs/constellation ./logs/
```

---

## Appendix B: File Reference

### Azure Automation Scripts

| File | Purpose | Run Location |
|------|---------|--------------|
| `scripts/azure/provision-vm.sh` | Create resource group, VM, install deps | Local machine (before VM exists) |
| `scripts/azure/verify-deployment.sh` | Post-deploy health checks (10 checks) | Local machine (after VM IP obtained) |
| `scripts/azure/start-constellation.sh` | Launch all 5 `ss-*` tmux sessions | VM via SSH |
| `scripts/azure/stop-constellation.sh` | Gracefully stop constellation + save logs | VM via SSH |
| `scripts/azure/reset-satellite.sh` | Kill + restart single session | VM via SSH |
| `scripts/azure/session-watchdog.sh` | Monitor sessions, auto-restart, log health | VM (via systemd timer, or manual) |
| `scripts/azure/session-watchdog.service` | systemd service unit for watchdog | VM /etc/systemd/system/ |
| `scripts/azure/session-watchdog.timer` | systemd timer — runs watchdog every 30 min | VM /etc/systemd/system/ |
| `scripts/azure/satellites.service` | systemd unit for auto-start on boot | VM /etc/systemd/system/ |
| `scripts/azure/main.bicep` | Bicep IaC template for VM + networking | Reference (used by provision-vm.sh) |
| `scripts/azure/main.bicepparam` | Bicep parameters file | Reference (used by provision-vm.sh) |
| `scripts/azure/README.md` | Technical documentation for scripts | Reference |

### Key Files on VM

| Path | Purpose |
|------|---------|
| `/home/ssadmin/repos/flora/` | Cloned downstream repo (flora ecosystem) |
| `/home/ssadmin/repos/ComeRosquillas/` | Cloned downstream repo (game backend) |
| `/home/ssadmin/repos/pixel-bounce/` | Cloned downstream repo (game engine) |
| `/home/ssadmin/repos/ffs-squad-monitor/` | Cloned downstream repo (monitoring) |
| `/home/ssadmin/repos/FirstFrameStudios/` | Cloned downstream repo (hub/strategy) |
| `/home/ssadmin/scripts/azure/` | Copy of all automation scripts (for manual runs) |
| `/var/log/ss-watchdog.jsonl` | Structured JSON log — all watchdog checks and alerts |
| `/var/lib/ss-watchdog/` | State directory — tracks restart failure counts |
| `/home/ssadmin/logs/constellation/` | Session buffer logs (saved before stop) |

---

## Appendix C: Environment Variables

| Variable | Default | Description | Set Where |
|----------|---------|-------------|-----------|
| `SSH_KEY_PATH` | `~/.ssh/id_rsa.pub` | SSH public key for VM provisioning | Local machine (provision-vm.sh reads it) |
| `RESOURCE_GROUP` | `syntax-sorcery-satellites` | Azure resource group name | provision-vm.sh, verify-deployment.sh |
| `VM_NAME` | `ss-satellite-vm` | Azure VM name | provision-vm.sh, verify-deployment.sh |
| `VM_USER` | `ssadmin` | SSH admin user | provision-vm.sh, verify-deployment.sh |
| `SATELLITE_BASE_DIR` | `~/repos` | Base dir for repo clones | VM (start-constellation.sh) |
| `MAX_SESSION_HOURS` | `6` | Hours before watchdog recycles session | VM (session-watchdog.sh) |
| `WATCHDOG_LOG` | `/var/log/ss-watchdog.jsonl` | Watchdog structured log file | VM (session-watchdog.sh) |
| `WATCHDOG_STATE_DIR` | `/var/lib/ss-watchdog` | State tracking for restart failures | VM (session-watchdog.sh) |
| `CONSTELLATION_LOG_DIR` | `~/logs/constellation` | Directory for constellation session logs | VM (stop-constellation.sh) |

---

## Appendix D: Bicep Template Overview

The VM is deployed using Bicep IaC (Infrastructure as Code). Key resources:

**Azure Resources Created:**

1. **Resource Group** (`syntax-sorcery-satellites`)
   - Container for all resources
   - Region: West Europe (€25–30/mo cost region)

2. **Virtual Network** (`ss-satellite-vnet`)
   - Private VNET for VM communication
   - Subnet: 10.0.0.0/24

3. **Network Security Group** (`ss-satellite-nsg`)
   - Firewall rules: SSH (port 22) only, all outbound allowed
   - No public inbound except SSH

4. **Public IP** (`ss-satellite-pip`)
   - Static public IP for SSH access
   - Standard SKU (better availability)

5. **Network Interface** (`ss-satellite-nic`)
   - Connects VM to vnet + NSG

6. **Virtual Machine** (`ss-satellite-vm`)
   - Size: Standard_B2s_v2 (~€0.65–0.85/day compute)
   - OS: Ubuntu 24.04 LTS (latest stable)
   - Admin user: `ssadmin`
   - SSH key authentication (no passwords)
   - Cloud-init installs dependencies (tmux, git, Node.js, gh CLI)
   - Managed identity for future Azure resource access

7. **Managed Identity** (`ss-satellite-identity`)
   - Azure AD identity for the VM
   - Can be granted access to Azure resources (future expansion)

**Why B2s_v2?**
- 2 vCPU, 4 GB RAM
- ~€25–30/month (cost-optimal for constellation)
- Enough for 5 concurrent Copilot CLI sessions (~200MB each)
- Burstable performance (spikes handled, throttled if sustained)

---

## Appendix E: Troubleshooting Decision Tree

```
┌─ VM won't provision (provision-vm.sh fails)
│  ├─ Check Azure CLI: az account show
│  ├─ Check SSH key: ls -la ~/.ssh/id_rsa.pub
│  └─ Check quotas: az vm list-skus --location westeurope
│
├─ Verification fails (verify-deployment.sh shows FAILs)
│  ├─ SSH connectivity FAIL → VM IP wrong or NSG rule missing → az vm open-port ...
│  ├─ Cloud-init FAIL → Still provisioning (wait 3 min) or check cloud-init logs on VM
│  ├─ Node.js FAIL → SSH to VM, verify installed: node --version
│  ├─ GitHub CLI auth FAIL → SSH to VM, run: gh auth login
│  └─ Repos missing FAIL → Clone manually on VM
│
├─ Constellation won't start (start-constellation.sh fails)
│  ├─ Preflight errors → Missing repo dirs or copilot CLI not installed
│  ├─ Dry-run fails → Check /home/ssadmin/repos/ exist
│  └─ Actual launch fails → Check SSH into VM works, watchdog log for errors
│
├─ Sessions crash after starting
│  ├─ Memory exhaustion → watchdog auto-recycles at 6h or top -b -n 1 to inspect
│  ├─ GitHub auth lost → gh auth login on VM
│  ├─ Agent infinite loop → Kill session: ~/scripts/azure/reset-satellite.sh <repo>
│  └─ VM out of disk → du -sh /home/ssadmin/* to find large files
│
└─ Watchdog logs CRITICAL
   ├─ 3 restart failures → Full VM restart: sudo systemctl restart satellites.service
   └─ Check for stuck processes: ps aux | grep copilot
```

---

## Appendix F: Downstream Repos & Expected PRs

Each repo runs Ralph autonomously. Expected weekly output:

| Repo | Purpose | Expected PRs/Week | Example Features |
|------|---------|-------------------|------------------|
| **flora** | Ecosystem generation | 2–3 | New species, ecosystem balance, CLI commands |
| **ComeRosquillas** | Game backend | 2–3 | New game features, bug fixes, performance |
| **pixel-bounce** | Game engine | 2–3 | Rendering, physics, collision detection |
| **ffs-squad-monitor** | Monitoring dashboard | 1–2 | Metrics, alerts, UI improvements |
| **FirstFrameStudios** | Hub/strategy repo | 1–2 | Documentation, roadmap, architecture |

**Total Test 3 target:** >10 PRs/week, >8 issues closed/week, ≥95% test passing.

---

## Appendix G: Post-Test 3 Analysis

After the 24–72 hour test window, collect metrics for decision-making:

**Metrics to Gather:**

```bash
# Total PRs merged
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  echo "=== $repo ==="
  gh pr list --repo jperezdelreal/$repo --state merged --limit 100 | wc -l
done

# Total issues closed
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  gh issue list --repo jperezdelreal/$repo --state closed --limit 100 | wc -l
done

# Test passing rate (per repo, check CI runs)
# Cost (from Azure Portal: Cost Management + Billing)
# Uptime (calculate hours Test 3 ran continuously)
```

**Questions to Answer:**

1. **Autonomy:** Did Ralph agents work for 24h+ with zero human intervention?
2. **Productivity:** >10 PRs/day and >8 issues/day? Quality acceptable?
3. **Reliability:** Any CRITICAL watchdog alerts? Any infrastructure failures?
4. **Cost:** Did spending match estimate (~€1–1.10/day)?
5. **Scalability:** Can this pattern scale to 10+ repos?
6. **Stability:** Did CI workflows run reliably? Any flaky tests?
7. **Learning:** What surprised you? What needs tuning?

**Next Steps:**

- ✅ If all green → Scale to 10+ repos, document best practices, productize
- ⚠️ If some issues → Fix and re-run Phase 10.2 test (smaller scope)
- ❌ If major issues → Iterate on Ralph prompt, infrastructure, or CI

---

## Document Metadata

**Title:** Test 3 Deployment Runbook — Syntax Sorcery  
**Version:** 2.0 (Complete Production Runbook)  
**Date:** 2026-07-16  
**Author:** Oracle (Product & Docs Specialist)  
**Audience:** Founder (joperezd), Squad Team (Morpheus, Tank, Switch, Trinity)  
**Status:** ✅ READY FOR PRODUCTION  

**Coverage:**
- 11 phases: Pre-launch → Post-test analysis
- 4 appendices: Quick commands, files, env vars, troubleshooting tree
- 75+ copy-paste ready commands with expected output
- 5 comprehensive troubleshooting tables
- Cost management with budget alerts
- 3 rollback strategies (graceful, deallocate, teardown)
- KPI tracking + success metrics
- Founder intervention triggers

**Document Size:** ~1,000 lines, production-ready  
**Last Updated:** 2026-07-16T11:00:00Z  
**Next Review:** After Test 3 completion or infrastructure change
