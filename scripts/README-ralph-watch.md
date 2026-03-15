# Ralph-Watch — Layer 2 Refueling Engine

**Version:** 1.0.0  
**Author:** Tank (Cloud Engineer)  
**Status:** Operational  

## Overview

ralph-watch.ps1 is the **Layer 2 refueling mechanism** in Syntax Sorcery's 3-layer autonomy architecture. It runs as a local background watchdog that monitors all constellation repos for roadmap exhaustion and automatically refuels them via Squad CLI sessions.

## Three-Layer Architecture

| Layer | Component | Trigger | Purpose | Cost |
|-------|-----------|---------|---------|------|
| **1. Cloud** | perpetual-motion.yml | `issues.closed` | Issue creation & @copilot execution | €0 |
| **2. Watch** | ralph-watch.ps1 (THIS) | 10min polling | Roadmap refueling automation | €0 |
| **3. Manual** | Ralph sessions | Human-initiated | Strategic direction & fallback | €0 |

## Quick Start

### 1. Prerequisites

- PowerShell 7.x+ (cross-platform)
- GitHub CLI (`gh`) authenticated
- Squad CLI (`copilot` command available)
- Local clones of all constellation repos

### 2. Run the watchdog

```powershell
# Standard mode (10min polling, 30min session timeout)
.\scripts\ralph-watch.ps1

# Custom interval (5min polling)
.\scripts\ralph-watch.ps1 -PollIntervalMinutes 5

# Dry-run (test without opening sessions)
.\scripts\ralph-watch.ps1 -DryRun

# Custom timeout (45min sessions)
.\scripts\ralph-watch.ps1 -SessionTimeoutMinutes 45
```

### 3. Monitor operation

```powershell
# Watch logs in real-time
Get-Content .squad/ralph-watch/$(Get-Date -Format 'yyyy-MM-dd').log -Wait

# Check heartbeat
Get-Content .squad/ralph-watch/heartbeat.txt | ConvertFrom-Json

# View state
Get-Content .squad/ralph-watch/state.json | ConvertFrom-Json
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. POLL CYCLE (every 10 minutes)                          │
│    • Check all 6 constellation repos                      │
│    • Query: issues with label "squad:morpheus"            │
│    • Filter: title matches "Define next roadmap"          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. REFUELING DETECTED                                      │
│    • Verify repo clone exists locally                     │
│    • Check roadmap cycle limit (max 3 without review)    │
│    • If limit exceeded → create escalation issue          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SQUAD SESSION (with 30min timeout)                     │
│    • Launch copilot --mode session in repo directory     │
│    • Prompt: "Define next roadmap with 3-5 items"        │
│    • Lead agent defines roadmap.md                        │
│    • Commit to main branch                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CLEANUP                                                 │
│    • Close "Define next roadmap" issue                    │
│    • Update state: increment refuel_count                 │
│    • Log success                                          │
│    • perpetual-motion.yml resumes (Layer 1)               │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Edit `scripts/ralph-watch-config.json` to customize behavior:

```json
{
  "pollIntervalMinutes": 10,        // Polling frequency
  "sessionTimeoutMinutes": 30,       // Max session duration
  "roadmapCycleLimit": 3,            // Max auto-refuelings without review
  "staleLockHours": 2,               // Lock timeout threshold
  "backoff": {
    "baseMinutes": 5,                // Initial backoff delay
    "maxMinutes": 60                 // Maximum backoff delay
  }
}
```

## Hardening Features

ralph-watch.ps1 implements **6 failure modes** from Tank's ralph-hardening SKILL:

### 1. Session Timeout
- Wraps Squad sessions with 30min timeout
- Kills hung processes automatically
- Prevents indefinite blocking

### 2. Exponential Backoff
- On failure: 5m → 10m → 20m → 40m → 60m delays
- Prevents rapid-retry storms
- Resets to 10m on success

### 3. Stale Lock Detection
- Checks lock file age, not just PID existence
- Cleans up locks >2 hours old
- Handles crashes, OS restarts, zombies

### 4. Log Rotation
- Keeps last 3 log files + 7 days retention
- Prevents diagnostic data loss
- Automatic cleanup of old logs

### 5. Health Checks
- Pre-round validation: gh CLI, disk space, temp cleanup
- Hourly heartbeat updates
- Skips rounds (doesn't crash) on health failures

### 6. Alert Mechanism
- Creates escalation issues for cycle limit breaches
- Structured logging to `.squad/ralph-watch/*.log`
- Pairs with external monitoring (safety-net.yml)

## Files Created

```
.squad/ralph-watch/
├── YYYY-MM-DD.log           # Daily log files (structured)
├── heartbeat.txt            # Last-alive timestamp (JSON)
├── state.json               # Persistent state tracking
├── ralph-watch.lock         # Process lock with PID
└── refuel-prompt-*.tmp      # Temp prompt files (auto-cleaned)
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Clean shutdown |
| 1 | Fatal error (lock contention, missing deps, unhandled exception) |

## Roadmap Cycle Limit

To prevent infinite refueling without human oversight:

- **Limit:** 3 consecutive auto-refuelings
- **Action:** Create escalation issue "🚨 Roadmap Refueling Paused"
- **Resolution:** Human reviews last 3 roadmaps, closes escalation
- **Reset:** Next refueling increments counter from 0

This enforces the "roadmaps should have natural endpoints" principle.

## Integration with Layer 1

ralph-watch.ps1 **complements** perpetual-motion.yml:

- **Layer 1** (perpetual-motion.yml): Creates issues from roadmap items
- **Layer 2** (ralph-watch.ps1): Refuels roadmap.md when exhausted
- **Together:** Perpetual motion with zero human intervention

## Deployment Scenarios

### Developer Machine (Local)
```powershell
# Start in background (Windows)
Start-Process pwsh -ArgumentList "-File", ".\scripts\ralph-watch.ps1" -WindowStyle Hidden

# View logs
Get-Content .squad/ralph-watch/$(Get-Date -Format 'yyyy-MM-dd').log -Tail 50
```

### Azure VM (24/7 Operation)
```bash
# Create systemd service
sudo tee /etc/systemd/system/ralph-watch.service <<EOF
[Unit]
Description=Ralph-Watch Layer 2 Refueling Engine
After=network-online.target

[Service]
Type=simple
User=azureuser
WorkingDirectory=/home/azureuser/Syntax-Sorcery
ExecStart=/usr/bin/pwsh -File /home/azureuser/Syntax-Sorcery/scripts/ralph-watch.ps1
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable ralph-watch
sudo systemctl start ralph-watch

# Monitor
sudo journalctl -u ralph-watch -f
```

## Monitoring

### Check if running
```powershell
# View lock file
Get-Content .squad/ralph-watch/ralph-watch.lock | ConvertFrom-Json

# Check heartbeat age
$hb = Get-Content .squad/ralph-watch/heartbeat.txt | ConvertFrom-Json
$age = (Get-Date) - [DateTime]$hb.timestamp
Write-Host "Last heartbeat: $($age.TotalMinutes) minutes ago"
```

### View refueling history
```powershell
# Parse today's log for SUCCESS events
Select-String -Path .squad/ralph-watch/$(Get-Date -Format 'yyyy-MM-dd').log -Pattern "SUCCESS.*Refueling completed"

# View state (refuel counts per repo)
Get-Content .squad/ralph-watch/state.json | ConvertFrom-Json | Select-Object -ExpandProperty repos
```

## Troubleshooting

### "Another ralph-watch instance is running"
- Check lock file: `.squad/ralph-watch/ralph-watch.lock`
- If stale (>2h), it auto-cleans
- Manual override: `Remove-Item .squad/ralph-watch/ralph-watch.lock -Force`

### "Failed to list issues for repo"
- Verify `gh auth status`
- Check repo names in `.squad/constellation.json`
- Ensure repos are accessible (not private without auth)

### "Session timeout after 30m"
- Increase timeout: `-SessionTimeoutMinutes 45`
- Check Squad CLI responsiveness
- Review session logs in repo directory

### "Health check failed"
- Check `gh --version` (GitHub CLI installed?)
- Verify disk space: `Get-PSDrive C`
- Review log for specific health failure

## Cost Analysis

**Total Cost: €0**

- No cloud resources (runs locally or on existing Azure VM)
- Uses GitHub free tier APIs only
- No external services or databases
- Pairs with Layer 1 (€0) for full autonomy at zero cost

## Future Enhancements

- [ ] Discord webhook alerts (optional, configured in config)
- [ ] Prometheus metrics export (for Grafana dashboards)
- [ ] Multi-org support (currently single-owner constellation)
- [ ] Roadmap quality scoring (complexity, specificity, completeness)
- [ ] Smart interval adjustment (faster during active development)

## References

- **Skill:** `.squad/skills/ralph-hardening/SKILL.md`
- **Plan:** `docs/plan-phase2-visibility.md` (section A5)
- **Layer 1:** `.github/workflows/perpetual-motion.yml`
- **Issue:** #153 (this implementation)

---

**Questions?** Escalate to @Tank (Cloud Engineer) or @Morpheus (Lead/Architect)
