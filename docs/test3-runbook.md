# Test 3 Launch Checklist & Runbook

**Status:** Draft  
**Last Updated:** 2026-03-21  
**Scope:** Autonomous 24/7 operation of Syntax Sorcery constellation on Azure VM  
**Success Criteria:** 24h+ continuous operation without human intervention, >10 PRs/day merged, zero critical alerts  

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

## Deployment Procedure

### Phase 1: Infrastructure Setup

#### 1.1 Provision Azure VM

```bash
cd /path/to/Syntax Sorcery
./scripts/azure/provision-vm.sh
```

**What it does:**
- Creates resource group `ss-satellites-rg` in West Europe
- Provisions VM `ss-satellite-vm` (Standard_B2s_v2, Ubuntu 24.04 LTS)
- Installs dependencies: git, tmux, Node.js 18+, @githubnext/github-copilot-cli
- Clones all 5 satellite repos into `~/repos/`
- Outputs: VM IP address, SSH connection string

**Expected output:**
```
VM IP: 52.xxx.xxx.xxx
SSH: ssh ssadmin@52.xxx.xxx.xxx
```

**Save this for later:**
- VM_IP (public IP for SSH)
- Resource group name
- VM name

#### 1.2 Verify VM is accessible

```bash
ssh ssadmin@<VM_IP>
# Inside VM:
df -h                    # Check disk space (expect ~30GB available)
free -h                  # Check RAM (expect 4GB)
tmux --version           # Verify tmux installed
git --version            # Verify git installed
node --version           # Verify Node.js installed (≥18)
copilot --version        # Verify Copilot CLI installed
```

**Exit SSH:** `exit`

---

### Phase 2: Deploy Satellite Sessions

#### 2.1 Copy deployment scripts to VM

```bash
scp -r scripts/azure/ ssadmin@<VM_IP>:~/scripts/azure/
ssh ssadmin@<VM_IP> chmod +x ~/scripts/azure/*.sh
```

#### 2.2 Configure GitHub CLI authentication on VM

```bash
ssh ssadmin@<VM_IP>
cd ~
gh auth login
  # Choose: GitHub.com
  # Auth method: SSH
  # Add SSH key to GitHub: yes
  # Title: Azure Satellite VM
```

**Why SSH authentication:** Enables passwordless token-based GitHub operations (git clone, PR creation, issue management).

**Verify:** `gh auth status` → Should show authenticated for GitHub.com

#### 2.3 Start satellite sessions

```bash
ssh ssadmin@<VM_IP>

# First, validate configuration (dry-run)
~/scripts/azure/start-satellites.sh --dry-run

# Expected output: "DRY-RUN PASSED: all 5 repos validated"

# Then launch actual sessions
~/scripts/azure/start-satellites.sh

# Expected output: "DONE: 5 satellite session(s) running"
```

**What happens:**
- Creates tmux session for each repo: `sat-flora`, `sat-ComeRosquillas`, `sat-pixel-bounce`, `sat-ffs-squad-monitor`, `sat-FirstFrameStudios`
- Each session: `cd <repo> && copilot && Ralph, go`
- Ralph begins autonomous work (reading issues, creating PRs, etc.)

#### 2.4 Verify all sessions running

```bash
ssh ssadmin@<VM_IP>
tmux list-sessions

# Expected output:
# sat-ComeRosquillas: 1 windows (created Mon Mar 21 10:15:00 2026)
# sat-FirstFrameStudios: 1 windows (created Mon Mar 21 10:15:05 2026)
# sat-flora: 1 windows (created Mon Mar 21 10:15:02 2026)
# sat-ffs-squad-monitor: 1 windows (created Mon Mar 21 10:15:04 2026)
# sat-pixel-bounce: 1 windows (created Mon Mar 21 10:15:03 2026)
```

All 5 sessions should be listed. If any are missing, run `~/scripts/azure/reset-satellite.sh <repo-name>`.

---

### Phase 3: Enable Session Watchdog

#### 3.1 Install watchdog systemd units

```bash
ssh ssadmin@<VM_IP>

# Copy service and timer files
sudo cp ~/scripts/azure/session-watchdog.service /etc/systemd/system/
sudo cp ~/scripts/azure/session-watchdog.timer /etc/systemd/system/

# Create state and log directories
sudo mkdir -p /var/lib/ss-watchdog /var/log/
sudo touch /var/log/ss-watchdog.jsonl
sudo chown ssadmin:ssadmin /var/lib/ss-watchdog /var/log/ss-watchdog.jsonl
```

#### 3.2 Enable and start watchdog timer

```bash
sudo systemctl daemon-reload
sudo systemctl enable session-watchdog.timer
sudo systemctl start session-watchdog.timer

# Verify
sudo systemctl status session-watchdog.timer
# Expected: "active (waiting)" and "Trigger: Sat 2026-03-21 10:50:00 UTC; 29min 55s left"
```

#### 3.3 Run watchdog manually to verify

```bash
~/scripts/azure/session-watchdog.sh

# Expected output: JSON-formatted health check for each session
# Example:
# {"timestamp":"2026-03-21T10:21:00Z","level":"INFO","host":"ss-satellite-vm","session":"system","message":"watchdog check started","disk_usage_pct":42,"memory_usage_pct":28,"max_session_hours":6}
# {"timestamp":"2026-03-21T10:21:02Z","level":"INFO","host":"ss-satellite-vm","session":"sat-flora","message":"session healthy","uptime_hours":0,"uptime_seconds":125}
# ...
```

#### 3.4 Install auto-start satellites service (optional but recommended)

```bash
sudo cp ~/scripts/azure/satellites.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable satellites.service

# Verify: this ensures satellites restart on VM reboot
sudo systemctl status satellites.service
```

---

## Runtime Operations

### Monitoring Session Health

#### Check active sessions

```bash
ssh ssadmin@<VM_IP>
tmux list-sessions
```

#### View watchdog logs in real-time

```bash
ssh ssadmin@<VM_IP>
tail -f /var/log/ss-watchdog.jsonl | jq .

# Ctrl+C to stop tailing
```

**Log levels:**
- `INFO` — Session healthy, normal operations
- `WARNING` — Non-critical issue (session dead but restarting, disk >90%)
- `ERROR` — Restart attempt failed
- `CRITICAL` — Session failed to restart 3 consecutive times → manual intervention required

#### Attach to a live session

```bash
ssh ssadmin@<VM_IP>
tmux attach -t sat-flora
# Now viewing live Copilot CLI output from flora satellite
# Ctrl+B, D to detach (keep session running)
```

#### Check disk and memory usage

```bash
ssh ssadmin@<VM_IP>
df -h              # Disk usage
free -h            # Memory usage
ps aux | grep -E "copilot|node"  # Process list
```

---

### Watchdog Behavior

The session watchdog (`session-watchdog.sh`) runs on a timer every 30 minutes:

**Health Checks:**
1. **Session alive?** If dead → restart automatically
2. **Session uptime ≤ 6h?** If >6h → recycle (restart) to prevent memory bloat
3. **Disk usage ≤ 90%?** If >90% → log WARNING
4. **Memory usage ≤ 90%?** If >90% → log WARNING

**Auto-Restart Behavior:**
- Max 3 consecutive restart failures per session before CRITICAL alert
- On restart failure: logs ERROR, increments failure counter
- On restart success: resets failure counter to 0, logs INFO
- After 3 failures: CRITICAL alert written, manual intervention required

**Log Format:**
Each check writes one JSON line to `/var/log/ss-watchdog.jsonl`:

```json
{
  "timestamp": "2026-03-21T10:30:00Z",
  "level": "INFO",
  "host": "ss-satellite-vm",
  "session": "sat-flora",
  "message": "session healthy",
  "uptime_hours": 2,
  "uptime_seconds": 7200
}
```

---

### Manual Session Management

#### Reset a single satellite

```bash
ssh ssadmin@<VM_IP>
~/scripts/azure/reset-satellite.sh flora

# What it does:
# - Kills existing tmux session 'sat-flora'
# - Starts fresh session in ~/repos/flora
# - Runs: copilot → Ralph, go
```

#### Restart all satellites at once

```bash
ssh ssadmin@<VM_IP>
for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do
  ~/scripts/azure/reset-satellite.sh "$repo"
  sleep 5
done
```

#### Check a specific session's activity

```bash
ssh ssadmin@<VM_IP>
tmux capture-pane -t sat-flora -p | head -20
# Shows last 20 lines of output from sat-flora session
```

---

## Incident Response

### Scenario 1: A single session won't start

**Symptoms:** `tmux list-sessions` shows 4 sessions, one is missing

**Diagnosis:**
```bash
ssh ssadmin@<VM_IP>
tmux list-sessions  # Confirm missing session
tail -20 /var/log/ss-watchdog.jsonl | jq '. | select(.level=="ERROR")'
# Look for ERROR entries for the missing session
```

**Resolution:**
```bash
~/scripts/azure/reset-satellite.sh <repo-name>
sleep 5
tmux attach -t sat-<repo-name>
# Verify session started and Copilot CLI is running
# Ctrl+B, D to detach
```

**Root causes to check:**
- GitHub CLI auth failed: `gh auth status` on VM
- Repo directory corrupted: `cd ~/repos/<repo> && git status`
- Node.js crash: `ps aux | grep node` to find hung processes

---

### Scenario 2: All satellites crashed simultaneously

**Symptoms:** `tmux list-sessions` returns empty or all sessions marked as "(dead)"

**Diagnosis:**
```bash
ssh ssadmin@<VM_IP>
free -h                # Check available memory
df -h                  # Check disk space
journalctl -n 50 -e    # Check system logs
tail -50 /var/log/ss-watchdog.jsonl | jq . | grep CRITICAL
```

**Resolution:**
```bash
# Full restart procedure
ssh ssadmin@<VM_IP>

# Stop everything
sudo systemctl stop satellites.service session-watchdog.timer 2>/dev/null || true
pkill -f "tmux|copilot" || true
sleep 3

# Clean up tmux
tmux kill-server

# Clear any failed processes
sudo systemctl reset-failed 2>/dev/null || true

# Restart
sudo systemctl start satellites.service
sudo systemctl start session-watchdog.timer
sleep 5

# Verify
tmux list-sessions
```

**Root causes:**
- Out of disk space: `df -h /` — need to clean logs or enlarge volume
- Out of memory: Node.js process leaks — kill and restart
- Azure resource throttling — check Azure Portal for quota limits

---

### Scenario 3: Budget alert triggered

**Symptoms:** Azure sends notification that spending has reached 80% of €400 budget

**Investigation:**
1. Check Azure Cost Management: https://portal.azure.com → Cost Management + Billing
2. Review daily costs and identify high-spend resources
3. Filter by resource type (VMs, storage, networking)

**Resolution (if costs are too high):**
```bash
# Check VM size and usage
ssh ssadmin@<VM_IP>
top -b -n 1 | head -20    # CPU and memory usage
vmstat 1 5                 # I/O and context switches

# If CPU/memory idle, scale down VM size
# (out of scope for this runbook — contact Morpheus)

# Or reduce session count (temporary measure)
sudo systemctl stop satellites.service
# Manually manage sessions
```

---

### Scenario 4: Watchdog detects context overflow (high memory usage)

**Symptoms:** `tail /var/log/ss-watchdog.jsonl | jq . | grep memory_usage_pct` shows >90%

**Diagnosis:**
```bash
ssh ssadmin@<VM_IP>
ps aux --sort=-%mem | head -10  # Top 10 memory consumers
# Look for node, copilot, or tmux processes
```

**Resolution:**
The watchdog logs this as a WARNING. Sessions are auto-recycled after 6 hours to prevent memory bloat. If memory exceeds 90% between cycles:

```bash
ssh ssadmin@<VM_IP>

# Find the heaviest process
top -b -n 1 -p $(pgrep -f copilot | head -1)

# Kill it (watchdog will restart)
pkill -f "copilot|node" -u ssadmin

# Verify watchdog restarts it
sleep 60
tmux list-sessions
```

Watchdog will auto-recycle any session running >6 hours, clearing memory. If the issue persists, it may indicate a memory leak in @githubnext/github-copilot-cli — escalate to team.

---

## Success Metrics

Monitor these KPIs to confirm Test 3 success:

### Operational Metrics

| Metric | Target | Check |
|--------|--------|-------|
| **Uptime** | 24h+ continuous | `tmux list-sessions` shows all 5 sessions running |
| **Zero CRITICAL alerts** | 0 CRITICAL entries | `tail /var/log/ss-watchdog.jsonl \| grep CRITICAL \| wc -l` should be 0 |
| **Session recycle success** | 100% | After 6h, sessions restart automatically with no ERROR entries |
| **Auto-restart success** | ≥95% | Manual restarts needed <1 per day |

### Productivity Metrics

| Metric | Target | Check |
|--------|--------|-------|
| **Merged PRs per day** | >10 across constellation | `gh pr list -s merged --created=<date>` per repo |
| **Issues closed per day** | >8 | `gh issue list -s closed --created=<date>` per repo |
| **Test passing rate** | ≥95% | CI status in GitHub Actions per repo |
| **Unique features delivered** | >5 per repo | Review merged PR titles for feature scope |

### Cost Metrics

| Metric | Target | Check |
|--------|--------|-------|
| **Daily VM cost** | <€2 | Azure Cost Management: VM daily cost |
| **Monthly estimate** | <€50 | €25-30/mo for compute + ~€5 storage = €30-35 total |
| **Budget utilization** | <80% of €400 | Azure Portal: % of budget spent |

---

## Rollback & Cleanup

### Complete teardown (destroys all Azure resources)

```bash
./scripts/azure/provision-vm.sh --teardown
```

**What happens:**
- Deletes VM `ss-satellite-vm`
- Deletes resource group `ss-satellites-rg`
- All satellites terminate (Copilot CLI instances exit)
- Network interfaces, disks, public IPs cleaned up

**Time:** 2-3 minutes

**Consequence:** All in-flight work is lost. PRs in draft status or uncommitted changes are discarded. **Only use if Test 3 failed catastrophically.**

### Partial rollback (keep VM, reset sessions)

```bash
ssh ssadmin@<VM_IP>

# Stop watchdog temporarily
sudo systemctl stop session-watchdog.timer

# Kill all sessions
tmux kill-server

# Restart satellites fresh
~/scripts/azure/start-satellites.sh

# Re-enable watchdog
sudo systemctl start session-watchdog.timer
```

**Time:** <1 minute

**Use when:** Sessions are stuck or exhibiting weird behavior, but the VM and infrastructure are healthy.

### Keep downstream repos intact

**Important:** No matter which rollback option you choose, all downstream repo work is preserved.

- All merged PRs remain in the repo
- All closed issues remain in the GitHub issue tracker
- Branch history is untouched
- You can re-launch satellites anytime without data loss

The rollback only affects the Azure VM (infrastructure) and the Copilot CLI processes (workers), not the work products.

---

## Emergency Contacts & Escalation

| Issue | Escalate To | Action |
|-------|-------------|--------|
| **VM won't provision** | Tank (Cloud) | Check Azure quota, verify SSH key, check region availability |
| **Session won't start (all repos)** | Switch (Tester) | Check GitHub CLI auth, verify copilot CLI installed, check disk space |
| **Runaway costs** | Morpheus (Lead) | Review Azure Cost Management, consider scaling down |
| **Architecture questions** | Morpheus (Lead) | Refer to `.squad/decisions.md` and core charter |
| **Copilot CLI crash** | @copilot (Coding Agent) | Check logs, file issue in CLI repo, escalate to GitHub |

---

## Appendix: File Reference

### Azure Deployment Scripts

| File | Purpose |
|------|---------|
| `scripts/azure/provision-vm.sh` | Create Azure VM, install dependencies, clone repos |
| `scripts/azure/start-satellites.sh` | Launch tmux sessions for all 5 repos |
| `scripts/azure/reset-satellite.sh` | Kill and restart a single satellite |
| `scripts/azure/session-watchdog.sh` | Monitor session health, auto-restart stale sessions |
| `scripts/azure/session-watchdog.timer` | systemd timer (runs watchdog every 30 minutes) |
| `scripts/azure/session-watchdog.service` | systemd service unit for watchdog |
| `scripts/azure/satellites.service` | systemd unit for auto-start on boot |
| `scripts/azure/README.md` | Detailed architecture and troubleshooting guide |

### Key Environment Variables (on VM)

| Variable | Default | Description |
|----------|---------|-------------|
| `SATELLITE_BASE_DIR` | `~/repos` | Base directory for repo clones |
| `MAX_SESSION_HOURS` | `6` | Auto-recycle after 6h uptime |
| `WATCHDOG_LOG` | `/var/log/ss-watchdog.jsonl` | Structured log file |
| `WATCHDOG_STATE_DIR` | `/var/lib/ss-watchdog` | Restart failure state tracking |

### Satellite Repos

| Repo | Purpose | URL |
|------|---------|-----|
| flora | Ecosystem generation | github.com/jperezdelreal/flora |
| ComeRosquillas | Game backend | github.com/jperezdelreal/ComeRosquillas |
| pixel-bounce | Game engine | github.com/jperezdelreal/pixel-bounce |
| ffs-squad-monitor | Monitoring dashboard | github.com/jperezdelreal/ffs-squad-monitor |
| FirstFrameStudios | Hub/strategy repo | github.com/jperezdelreal/FirstFrameStudios |

---

## Test 3 Timeline

**Go/No-Go:** 2026-03-22 (founder approval)  
**Deployment:** 2026-03-22 — VM provision + satellite launch (assume 30 min)  
**24h milestone:** 2026-03-23 — First success checkpoint  
**Full phase:** 2026-03-25 (72h+ test window)  
**Analysis:** 2026-03-26 — Post-mortem, metrics review, scaling decisions  

---

**Author:** Morpheus (Lead/Architect)  
**Last Review:** 2026-03-21  
**Status:** DRAFT → APPROVED (pending founder sign-off)
