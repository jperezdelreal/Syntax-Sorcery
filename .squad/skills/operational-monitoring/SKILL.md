# SKILL: Operational Monitoring Scripts

**Pattern:** Build monitoring automation with dual output, exit codes, and graceful degradation.

**When:** Creating health checks, observability tools, or validation scripts for production systems.

## Architecture

### Two-Script Pattern

Separate **monitoring** (real-time snapshot) from **validation** (historical aggregation):

- **Monitor:** Current state → "Is the system healthy NOW?"
- **Validate:** Historical analysis → "Did we meet our 24h goals?"

**Why separate:**
- Different use cases (alerting vs. acceptance)
- Different cadence (every 2h vs. once at end)
- Different exit codes (0/1/2 vs. 0/1)
- Single responsibility per script

### Exit Code Strategy

**Monitor scripts:**
- `0` = Healthy (all checks pass)
- `1` = Warning (degraded but operational)
- `2` = Critical (requires immediate attention)

**Validation scripts:**
- `0` = Pass (or Conditional Pass ≥80%)
- `1` = Fail

**Benefits:**
- Standard Unix convention
- Enables alerting (`if exit > 1, page ops`)
- Cron/CI compatible
- Works with `&&` and `||` operators

### Dual Output Format

Support both JSON and human-readable in same script:

```bash
if $JSON_OUTPUT; then
  cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "status": "healthy",
  "checks": { ... }
}
EOF
else
  echo "=========================================="
  echo "Monitoring Report"
  echo "Status: ✅ HEALTHY"
  echo "=========================================="
fi
```

**JSON:** Machine-readable for automation, logging, dashboards  
**Human:** Ops-friendly for manual checks, debugging

**Flag-based:** `--json` switches format, same checks underneath

## Implementation

### Check Function Pattern

```bash
check_component() {
  local status="unknown"
  local metric1="N/A"
  local metric2="N/A"
  
  # Try to get data
  if can_reach_component; then
    status="reachable"
    metric1=$(get_metric_1)
    metric2=$(get_metric_2)
  else
    CRITICALS+=("Component unreachable")
    [ $EXIT_CODE -lt 2 ] && EXIT_CODE=2
    echo "component:unreachable"
    return 2
  fi
  
  # Validate thresholds
  if [ "$metric1" -lt "$THRESHOLD" ]; then
    WARNINGS+=("Metric1 below threshold: $metric1")
    [ $EXIT_CODE -lt 1 ] && EXIT_CODE=1
  fi
  
  echo "component:$status|metric1:$metric1|metric2:$metric2"
  return 0
}
```

**Key points:**
- Return structured output (pipe-delimited)
- Accumulate warnings/criticals in arrays
- Update global EXIT_CODE (preserve highest severity)
- Fail fast on critical issues

### Graceful Degradation

```bash
check_optional_component() {
  local result="N/A"
  
  if command -v optional_cli &>/dev/null && optional_cli check &>/dev/null; then
    result=$(optional_cli get-data)
  else
    PASSED+=("⚠️  Optional check skipped (CLI not available)")
  fi
  
  echo "optional:$result"
  return 0
}
```

**Don't block the entire run for optional components.**

Return "N/A" or "skipped" explicitly. Operator decides if acceptable.

### Test Suite Pattern

```bash
# Test helpers
assert_exit_code() {
  local expected=$1
  local actual=$2
  local test_name=$3
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [ "$actual" -eq "$expected" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} $test_name"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Usage
set +e
bash script.sh --invalid > /dev/null 2>&1
EXIT_CODE=$?
set -e
assert_exit_code 2 $EXIT_CODE "Invalid option returns error"
```

**Shell-based tests:**
- Tests actual script as it runs in production
- No mocking framework needed
- Human-readable assertions
- Fast execution

## Anti-Patterns

❌ **Single script for everything**
- Mixes concerns (monitoring + validation)
- Harder to test, maintain, understand

❌ **No exit codes** (always exit 0)
- Can't automate alerting
- Forces manual log parsing

❌ **JSON-only output**
- Hard for humans to debug
- Requires jq for every check

❌ **Block entire run on optional deps**
- Azure CLI unavailable → entire script fails
- Should degrade gracefully, report "N/A"

❌ **No tests**
- Can't refactor safely
- Don't know if exit codes work

## Success Criteria Validation

For 24h observation periods:

```bash
# Track pass/fail per metric
PASSED=()
FAILED=()

check_metric() {
  if meets_criteria; then
    PASSED+=("✅ Metric passed")
  else
    FAILED+=("❌ Metric failed")
  fi
}

# Calculate percentage
TOTAL=$((${#PASSED[@]} + ${#FAILED[@]}))
PASS_PERCENT=$(echo "scale=0; ${#PASSED[@]} * 100 / $TOTAL" | bc)

# Conditional pass (≥80%)
if [ "${#FAILED[@]}" -eq 0 ]; then
  RESULT="PASS"
elif [ "$PASS_PERCENT" -ge 80 ]; then
  RESULT="CONDITIONAL PASS"
else
  RESULT="FAIL"
fi
```

**Why 80% threshold:**
- Stricter than "all or nothing"
- Allows one failure without invalidating test
- Catches major issues while tolerating edge cases

## Dependencies

**Required:**
- `jq` — JSON parsing
- `bc` — Arithmetic calculations
- Component-specific CLI (`gh`, `az`, `ssh`)

**Install check pattern:**
```bash
if ! command -v jq &>/dev/null; then
  echo "Error: jq required" >&2
  exit 2
fi
```

**Graceful fallback:**
```bash
if command -v az &>/dev/null; then
  # Use Azure CLI
else
  # Skip Azure checks
fi
```

## Integration

**Reuse existing scripts:**
- Don't duplicate logic
- Source from other scripts if needed
- Call existing tools (e.g., `azure-cost-check.sh`)

**Single source of truth:**
- Read systemd journal (watchdog logs)
- Use GitHub API via `gh` CLI
- Query Azure via `az` CLI

## Cron Automation

```cron
# Every 2 hours
0 */2 * * * /path/to/monitor.sh --json >> /var/log/monitor.log 2>&1

# Daily validation
0 0 * * * /path/to/validate.sh --json >> /var/log/validate.log 2>&1
```

## CI/CD Integration

```yaml
- name: Monitor system
  run: ./scripts/monitor.sh --json
  env:
    SSH_KEY: ${{ secrets.SSH_KEY }}
- name: Check exit code
  run: |
    if [ $? -eq 2 ]; then
      echo "Critical failure - paging ops"
      exit 1
    fi
```

## Example Structure

```
scripts/
  monitor-system.sh          # Real-time snapshot
  verify-system-metrics.sh   # 24h validation
  __tests__/
    test-monitor-system.sh
    test-verify-system-metrics.sh
  MONITORING.md              # Documentation
```

## Real-World Usage

**Syntax Sorcery Test 3:**
- `monitor-test3.sh` — Every 2h (VM, watchdog, GitHub, cost)
- `verify-test3-metrics.sh` — After 24h (6 success criteria)
- Exit codes: 0=healthy, 1=warning, 2=critical
- Both JSON + human output
- Test suite validates exit codes, JSON structure

**Key learnings:**
- Bash > Node.js for simplicity and portability
- Separate scripts clarify purpose
- Graceful degradation prevents false negatives
- Shell tests validate production behavior

---

**Created:** 2026-03-22  
**By:** Switch (Tester/QA)  
**Related:** Issue #128, PR #139  
**Pattern Type:** Observability / Testing
