# Layer 2 Architecture: ralph-watch vs squad watch

## TLDR

**ralph-watch.ps1 = ACTS** (autonomously refuels roadmaps)  
**squad watch = SUGGESTS** (AI triage complement from Brady's tool)

Both complement Layer 1 (perpetual-motion.yml), but serve different purposes.

---

## The Complete 3-Layer Stack

### Layer 1: Perpetual Motion (Cloud)
- **Tool:** `perpetual-motion.yml` (GitHub Actions)
- **Trigger:** Event-driven (`on: issues: types: [closed]`)
- **Action:** Detects roadmap exhaustion → creates "📋 Define next roadmap" issue
- **Coverage:** 100% autonomous for well-defined work (80% of all work)
- **Cost:** €0 (GitHub Actions free tier)

### Layer 2: Refueling + Triage
Two complementary tools:

#### A. ralph-watch.ps1 (PRIMARY — ACTS)
- **Purpose:** Roadmap refueling engine
- **What it does:** 
  - Polls constellation repos every 10 minutes
  - Detects "Define next roadmap" issues (created by Layer 1)
  - Opens Squad CLI session to invoke Lead
  - Lead defines new roadmap.md
  - Commits roadmap and closes issue
- **Result:** Perpetual motion continues without human intervention
- **Hardening:** 6 failure modes (timeout, backoff, stale locks, rotation, health, alerts)
- **Location:** `scripts/ralph-watch.ps1`
- **Runtime:** Background PowerShell loop (local machine or server)
- **Coverage:** Closes the refueling loop (final 10% automation gap)

#### B. squad watch (COMPLEMENT — SUGGESTS)
- **Purpose:** AI-powered triage and cross-repo pattern detection
- **What it does:**
  - Monitors issues across constellation
  - Suggests priorities, labels, routing
  - Detects patterns (e.g., "3 repos have similar bugs")
  - Provides AI insights to Leads
- **Result:** Smarter work prioritization, but does NOT act autonomously
- **Tool:** Brady Gaster's squad watch (external)
- **Runtime:** Run manually or on-demand
- **Coverage:** Advisory layer for complex decision-making

### Layer 3: Manual Intervention
- **Purpose:** Handle edge cases and T0 decisions
- **Who:** joperezd (founder) + Morpheus (Lead)
- **When:** Architecture changes, new repos, budget decisions
- **Target:** <15 minutes/week intervention

---

## When to Use Which

| Scenario | Tool | Reason |
|----------|------|--------|
| Roadmap depleted | ralph-watch.ps1 | Automatically refuels (ACTS) |
| Multiple repos have similar issues | squad watch | Detects patterns (SUGGESTS) |
| Issue needs prioritization | squad watch | AI triage guidance (SUGGESTS) |
| Stuck work >72h | squad watch | Cross-repo diagnostic (SUGGESTS) |
| New repo creation | Manual (Layer 3) | T0 decision (founder only) |
| Emergency shutdown | Manual (Layer 3) | Human override required |

---

## How to Run Both Together

### Option 1: ralph-watch.ps1 Only (Fully Autonomous)
```powershell
# Run in background (recommended for unattended operation)
Start-Process powershell -ArgumentList "-File scripts\ralph-watch.ps1" -WindowStyle Hidden

# OR run in current terminal (see logs in real-time)
.\scripts\ralph-watch.ps1
```

This alone achieves perpetual motion. Layer 2 is operational.

### Option 2: ralph-watch.ps1 + squad watch (Maximum Intelligence)
```powershell
# Terminal 1: Start ralph-watch.ps1 (refueling engine)
.\scripts\ralph-watch.ps1

# Terminal 2: Run squad watch periodically (AI triage)
squad watch --repos .squad\constellation.json --interval 1h
```

This gives you:
- **Autonomous refueling** (ralph-watch.ps1 closes the loop)
- **AI insights** (squad watch suggests optimizations)

### Option 3: Dry Run Testing
```powershell
# Test ralph-watch without taking real actions
.\scripts\ralph-watch.ps1 -DryRun -PollIntervalMinutes 2

# Verify it detects issues correctly
cat .squad\ralph-watch\$(Get-Date -Format "yyyy-MM-dd").log
```

---

## Architecture Decisions

### Why ralph-watch.ps1 is Primary
1. **Closes the loop:** Layer 1 depletes roadmap → ralph-watch refuels → Layer 1 continues
2. **Autonomous action:** No human required (opens Squad, commits roadmap, closes issue)
3. **Hardened for 24h+ runtime:** 6 failure modes prevent silent death
4. **Scoped to refueling:** Single responsibility (define roadmaps)

### Why squad watch is Complement
1. **Advisory only:** Suggests actions, does NOT execute autonomously
2. **Cross-repo intelligence:** Detects patterns Layer 1 can't see
3. **On-demand:** Run when you need insights, not continuously
4. **External tool:** Brady's tool, not SS-owned infrastructure

### Why Not Merge Them?
- **Separation of concerns:** ACTS vs SUGGESTS are fundamentally different
- **Failure isolation:** ralph-watch crash doesn't break AI triage
- **Tool ownership:** ralph-watch (SS-owned), squad watch (Brady's tool)
- **Runtime model:** ralph-watch (always-on loop), squad watch (periodic/manual)

---

## Monitoring ralph-watch.ps1

### Check if Running
```powershell
# Find ralph-watch process
Get-Process powershell | Where-Object { 
    $_.MainWindowTitle -match "ralph-watch" -or 
    (Get-Content ".squad\ralph-watch\ralph-watch.lock" -ErrorAction SilentlyContinue | ConvertFrom-Json).pid -eq $_.Id
}
```

### View Logs
```powershell
# Today's log
Get-Content ".squad\ralph-watch\$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50 -Wait

# All logs (last 7 days)
Get-ChildItem .squad\ralph-watch\*.log | Sort-Object LastWriteTime -Descending
```

### Check Heartbeat
```powershell
# Heartbeat file shows last activity
Get-Content .squad\ralph-watch\heartbeat.txt | ConvertFrom-Json
```

### Stop ralph-watch
```powershell
# Graceful stop (reads PID from lock file)
$lockFile = ".squad\ralph-watch\ralph-watch.lock"
if (Test-Path $lockFile) {
    $pid = (Get-Content $lockFile | ConvertFrom-Json).pid
    Stop-Process -Id $pid
}
```

---

## Failure Modes & Mitigations

ralph-watch.ps1 implements all 6 hardening patterns from Tank's `ralph-hardening` SKILL:

1. **Session Timeout:** Squad sessions killed after 30min (prevents hung processes)
2. **Exponential Backoff:** 5m → 10m → 20m → 60m on failures (prevents rapid-retry storms)
3. **Stale Lock Detection:** Locks >2h old are cleaned up (handles crashes/restarts)
4. **Log Rotation:** Keeps 3 files + 7 days (prevents diagnostic data loss)
5. **Health Checks:** Pre-round validation (gh CLI, disk space, temp cleanup)
6. **Alert Mechanism:** Creates escalation issues for persistent failures

These patterns ensure 24h+ unattended operation without silent failures.

---

## Roadmap Convergence Rules

ralph-watch.ps1 includes safeguards against infinite roadmap generation:

- **Limit:** 3 consecutive refueling cycles per repo without user review
- **Action on limit:** Pauses refueling + creates escalation issue (🚨 "User Review Required")
- **Rationale:** Roadmaps should have natural endpoints, not infinite work
- **Reset:** User closes escalation issue → refuel counter resets → refueling resumes

This prevents autonomous systems from generating work indefinitely without human direction.

---

## Configuration

All parameters exposed in `ralph-watch.ps1`:

```powershell
param(
    [int]$PollIntervalMinutes = 10,        # Polling frequency
    [int]$SessionTimeoutMinutes = 30,      # Max time per refueling
    [string]$ConstellationFile = ".squad\constellation.json",  # Repo list
    [switch]$DryRun                        # Test mode (no real actions)
)
```

Adjust based on:
- **Faster polling:** Reduce `PollIntervalMinutes` (min: 1m, not recommended <5m)
- **Complex roadmaps:** Increase `SessionTimeoutMinutes` (e.g., 45m for large repos)
- **Testing:** Use `-DryRun` flag to simulate without side effects

---

## Success Metrics

Layer 2 is successful when:
- ✅ Roadmaps refuel automatically within 10 minutes of depletion
- ✅ Zero manual intervention for roadmap definition (autonomous Lead invocation)
- ✅ No silent failures (escalation issues created for persistent problems)
- ✅ Logs show clear audit trail (who, what, when for each refueling)
- ✅ squad watch provides actionable insights (cross-repo patterns detected)

Target: **<15 minutes/week** total human intervention across all 3 layers.

---

## Future Enhancements

Possible improvements (not in scope for Phase 2):

1. **GitHub Actions runner:** Deploy ralph-watch.ps1 on GitHub-hosted runner (eliminate local machine dependency)
2. **Slack alerts:** Notify team on escalation issues (faster response to convergence checks)
3. **Metrics dashboard:** Visualize refueling latency, cycle counts, failure rates
4. **Multi-tenant:** Support multiple constellation files (separate autonomous domains)

For now, local PowerShell loop + squad watch complement is sufficient for Phase 2 targets.

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-17  
**Authors:** Morpheus (Lead/Architect), Tank (Cloud Engineer)  
**Related:** `.squad/skills/ralph-hardening/SKILL.md`, `docs/plan-phase2-visibility.md`
