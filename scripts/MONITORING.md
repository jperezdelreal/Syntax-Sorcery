# Test 3 Monitoring Infrastructure

Automated monitoring and validation system for 24-hour Test 3 observation period.

## Overview

This suite provides:
1. **Real-time monitoring** — Check system health every 2-3 hours
2. **24-hour validation** — Verify success metrics after full observation period
3. **Structured logging** — Template for consistent observation records
4. **Automated testing** — Test suite to validate monitoring logic

## Components

### 1. `scripts/monitor-test3.sh`

**Purpose:** Real-time health monitoring of Test 3 deployment.

**Usage:**
```bash
# Human-readable report
./scripts/monitor-test3.sh

# JSON output for automation
./scripts/monitor-test3.sh --json

# Custom VM connection
./scripts/monitor-test3.sh --vm-host azureuser@10.0.0.4 --ssh-key ~/.ssh/azure_key
```

**Checks:**
- **VM Health:** SSH connectivity, tmux sessions, memory, disk, uptime
- **Watchdog Status:** Service active, cycle count, error counts
- **GitHub Activity:** PR counts per repo, daily/weekly totals
- **Azure Cost:** Current spend, burn rate, budget percentage
- **Ralph Activity:** Open issues, closed today, board status

**Exit Codes:**
- `0` = Healthy
- `1` = Warning (degraded but operational)
- `2` = Critical (requires immediate attention)

**Output Example:**
```
==========================================
Test 3 Monitoring Report
Timestamp: 2026-03-22T14:30:00Z
==========================================

VM Health:
  vm_health:reachable|tmux:5|memory:1024MB|disk:25GB|uptime:up 1 day, 6 hours

Watchdog Status:
  watchdog:active|cycles:48|errors:0|warnings:2|last_run:2026-03-22T14:00:00Z

GitHub Activity:
  github:merged_today=52|merged_7d=287|repos=5
  joperezd/game-squad-beneficial-bar:11
  joperezd/game-squad-ComeRosquillas:9
  ...

Azure Cost:
  azure_cost:spend=12.50|budget=500|percent=2.5|daily_target=1.50

Ralph Activity:
  ralph:open_issues=0|closed_today=3

==========================================
✅ Status: HEALTHY
==========================================
```

### 2. `scripts/verify-test3-metrics.sh`

**Purpose:** Validate 24-hour success criteria after observation period.

**Usage:**
```bash
# Human-readable pass/fail report
./scripts/verify-test3-metrics.sh

# JSON output
./scripts/verify-test3-metrics.sh --json
```

**Success Criteria:**
| Metric | Target | Weight |
|--------|--------|--------|
| Satellite Sessions | 5 continuously | Critical |
| Watchdog Cycles | ≥48 without CRITICAL | Critical |
| PR Throughput | ≥50 total (≥10/repo) | Critical |
| Cost Burn Rate | <€30/month projected | High |
| Manual Intervention | Zero required | Critical |
| Refuel Cycles | ≥1 complete | High |

**Exit Codes:**
- `0` = PASS or CONDITIONAL PASS (≥80% criteria met)
- `1` = FAIL

**Output Example:**
```
==========================================
Test 3 — 24-Hour Metrics Verification
Timestamp: 2026-03-23T10:00:00Z
==========================================

PASSED CHECKS:
  ✅ All 5 satellite sessions running
  ✅ Watchdog cycles: 52 (≥48)
  ✅ No CRITICAL watchdog errors
  ✅ Total PRs: 58 (≥50)
  ✅ Cost burn rate: €0.95/day (€28.50/month projected)
  ✅ Refuel cycles completed: 2

FAILED CHECKS:
  ❌ game-squad-Flora: 8 PRs (need ≥10)

==========================================
Summary: 6/7 passed (86%)
Result: CONDITIONAL PASS
==========================================
```

### 3. `.squad/test3-monitoring-template.md`

**Purpose:** Structured template for manual 24-hour observation log.

**Usage:**
1. Copy template to `.squad/test3-monitoring-[YYYY-MM-DD].md`
2. Fill in checkpoints every 2-3 hours
3. Run `monitor-test3.sh` at each checkpoint
4. Complete 24-hour summary at end
5. Archive to `.squad/test3-monitoring-archive/`

**Structure:**
- 10 checkpoint sections (2-3 hour intervals)
- Consistent data points at each checkpoint
- 24-hour summary with pass/fail matrix
- Appendix for raw logs and evidence

### 4. Test Suite

**Purpose:** Validate monitoring script logic and output formats.

**Tests:**
- `scripts/__tests__/test-monitor-test3.sh` — Tests for monitor-test3.sh
- `scripts/__tests__/test-verify-test3-metrics.sh` — Tests for verify-test3-metrics.sh

**Run Tests:**
```bash
# On Linux/VM (requires bash, jq)
bash scripts/__tests__/test-monitor-test3.sh
bash scripts/__tests__/test-verify-test3-metrics.sh
```

**Test Coverage:**
- Script existence and permissions
- Parameter parsing
- JSON output validity
- Exit code correctness
- Output structure completeness
- Error handling

## Automation

### Cron Schedule (VM)

Add to crontab for automated monitoring:

```cron
# Test 3 monitoring — every 2 hours
0 */2 * * * /home/azureuser/Syntax-Sorcery/scripts/monitor-test3.sh --json >> /var/log/test3-monitor.log 2>&1

# Daily summary
0 0 * * * /home/azureuser/Syntax-Sorcery/scripts/verify-test3-metrics.sh --json >> /var/log/test3-metrics.log 2>&1
```

### GitHub Actions (Optional)

For external monitoring from CI:

```yaml
name: Test 3 Monitor
on:
  schedule:
    - cron: '0 */3 * * *'  # Every 3 hours
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Monitor Test 3
        run: ./scripts/monitor-test3.sh --json
        env:
          SSH_KEY: ${{ secrets.AZURE_VM_SSH_KEY }}
          VM_HOST: ${{ secrets.AZURE_VM_HOST }}
```

## Dependencies

### Required
- `ssh` — VM connectivity
- `gh` CLI — GitHub API access
- `jq` — JSON parsing

### Optional
- `az` CLI — Azure cost tracking (falls back gracefully if unavailable)
- `bc` — Arithmetic calculations

### Install on Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y jq bc ssh
```

## Integration with Existing Tools

### Uses Existing Scripts
- `scripts/azure-cost-check.sh` — Reused for cost validation
- `scripts/constellation-health.js` — Similar pattern for downstream checks

### Complements Watchdog
- Watchdog handles autonomous recovery
- Monitor scripts provide observability
- Both write to systemd journal for unified logging

## Troubleshooting

### Monitor Script Returns Critical
```bash
# Check specific component
./scripts/monitor-test3.sh --json | jq '.criticals'

# SSH issues
ssh -v -i ~/.ssh/id_rsa azureuser@syntax-sorcery-vm

# Watchdog issues
ssh azureuser@syntax-sorcery-vm "journalctl -u session-watchdog.service -n 50"
```

### Metrics Verification Fails
```bash
# See which checks failed
./scripts/verify-test3-metrics.sh | grep "❌"

# Check PR counts manually
gh pr list --repo joperezd/game-squad-pixel-bounce --state merged --search "merged:>=2026-03-22"

# Check watchdog cycles
ssh azureuser@syntax-sorcery-vm "journalctl -u session-watchdog.service --since '24 hours ago' | grep 'Watchdog cycle'"
```

## Architecture Decisions

### Why Bash Over Node.js
- **Portability:** Runs anywhere (VM, CI, local dev)
- **Simplicity:** Shell scripts for shell operations (ssh, gh, az)
- **Minimal deps:** Only jq, bc beyond standard Linux tools
- **Existing patterns:** Aligns with `azure-cost-check.sh`, deployment scripts

### Why Separate Monitor vs. Verify
- **Monitor:** Real-time snapshot (current state)
- **Verify:** Historical validation (24h aggregation)
- Different use cases: monitoring loop vs. acceptance test
- Different cadence: every 2h vs. once at end

### Why Both JSON and Human Output
- **JSON:** Machine-readable for automation, logging, alerting
- **Human:** Ops-friendly for manual checks, debugging
- Single script does both (flag-based)

## Future Enhancements

- [ ] Slack/Discord webhook notifications on critical alerts
- [ ] Grafana dashboard visualization (metrics export)
- [ ] Anomaly detection (ML-based baseline deviations)
- [ ] Multi-test comparison (Test 3 vs. Test 4 trends)
- [ ] Cost forecasting with 7-day rolling average

---

**Created:** 2026-03-22  
**Owner:** Switch (Tester/QA)  
**Issue:** #128 (Phase 10.6)  
**Status:** ✅ READY FOR TEST 3
