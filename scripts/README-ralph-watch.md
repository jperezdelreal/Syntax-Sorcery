# Ralph-Watch — Layer 2 Refueling Engine

**Version:** 1.0.0  
**Author:** Tank (Cloud Engineer)  
**Status:** Operational  

## Overview

ralph-watch.ps1 is the **Layer 2 refueling mechanism** in Syntax Sorcery''s 3-layer autonomy architecture. It runs as a local background watchdog that monitors all constellation repos for roadmap exhaustion and automatically refuels them via Squad CLI sessions.

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

## Files Created

```
.squad/ralph-watch/
├── YYYY-MM-DD.log           # Daily log files (structured)
├── heartbeat.txt            # Last-alive timestamp (JSON)
├── state.json               # Persistent state tracking
├── ralph-watch.lock         # Process lock with PID
└── refuel-prompt-*.tmp      # Temp prompt files (auto-cleaned)
```

## Hardening Features

ralph-watch.ps1 implements **6 failure modes** from Tank''s ralph-hardening SKILL:

1. **Session Timeout**: 30min max, kills hung processes
2. **Exponential Backoff**: 5m → 60m delays on failures
3. **Stale Lock Detection**: Cleans locks >2h old
4. **Log Rotation**: 3-file depth, 7-day retention
5. **Health Checks**: Pre-round validation + hourly heartbeat
6. **Alert Mechanism**: Escalation issues for cycle limits

## Configuration

Edit `scripts/ralph-watch-config.json` for customization. Key settings:

- `pollIntervalMinutes`: 10 (polling frequency)
- `sessionTimeoutMinutes`: 30 (max session duration)
- `roadmapCycleLimit`: 3 (max auto-refuelings without review)

## Cost Analysis

**Total Cost: €0**

- No cloud resources (runs locally or on existing Azure VM)
- Uses GitHub free tier APIs only
- Pairs with Layer 1 (€0) for full autonomy at zero cost

## References

- **Skill:** `.squad/skills/ralph-hardening/SKILL.md`
- **Plan:** `docs/plan-phase2-visibility.md` (section A5)
- **Layer 1:** `.github/workflows/perpetual-motion.yml`
- **Issue:** #153 (this implementation)

---

**Questions?** Escalate to @Tank (Cloud Engineer) or @Morpheus (Lead/Architect)
