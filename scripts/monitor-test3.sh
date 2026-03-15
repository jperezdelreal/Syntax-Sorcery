#!/usr/bin/env bash
# monitor-test3.sh — Automated Test 3 monitoring script
# Checks VM health, watchdog status, GitHub activity, and Azure costs
# Returns: 0=healthy, 1=warning, 2=critical
#
# Usage:
#   ./scripts/monitor-test3.sh [--json] [--ssh-key PATH] [--vm-host USER@HOST]
#
# Requires: ssh, gh CLI, az CLI (optional), jq

set -euo pipefail

# Defaults
JSON_OUTPUT=false
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
VM_HOST="${VM_HOST:-azureuser@syntax-sorcery-vm}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --json) JSON_OUTPUT=true; shift ;;
    --ssh-key) SSH_KEY="$2"; shift 2 ;;
    --vm-host) VM_HOST="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

# Exit codes
EXIT_CODE=0
WARNINGS=()
CRITICALS=()

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ---------------------------------------------------------------------------
# VM Health Check
# ---------------------------------------------------------------------------
check_vm_health() {
  local status="unknown"
  local tmux_sessions=0
  local memory_free="N/A"
  local disk_free="N/A"
  local uptime="N/A"
  
  if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VM_HOST" "echo test" &>/dev/null; then
    status="unreachable"
    CRITICALS+=("VM unreachable")
    echo "vm_health:unreachable"
    return 2
  fi
  
  # VM is reachable
  status="reachable"
  
  # Check tmux sessions
  tmux_sessions=$(ssh -i "$SSH_KEY" "$VM_HOST" "tmux ls 2>/dev/null | wc -l" 2>/dev/null || echo "0")
  
  # Check memory (free -m | awk '/^Mem:/ {print $4}')
  memory_free=$(ssh -i "$SSH_KEY" "$VM_HOST" "free -m 2>/dev/null | awk '/^Mem:/ {print \$4}'" 2>/dev/null || echo "N/A")
  
  # Check disk (df -h / | awk 'NR==2 {print $4}')
  disk_free=$(ssh -i "$SSH_KEY" "$VM_HOST" "df -h / 2>/dev/null | awk 'NR==2 {print \$4}'" 2>/dev/null || echo "N/A")
  
  # Check uptime
  uptime=$(ssh -i "$SSH_KEY" "$VM_HOST" "uptime -p 2>/dev/null" 2>/dev/null || echo "N/A")
  
  # Validate expected sessions (5 satellites = 5 tmux sessions minimum)
  if [ "$tmux_sessions" -lt 5 ]; then
    WARNINGS+=("Only $tmux_sessions tmux sessions (expected ≥5)")
    [ $EXIT_CODE -lt 1 ] && EXIT_CODE=1
  fi
  
  echo "vm_health:$status|tmux:$tmux_sessions|memory:${memory_free}MB|disk:$disk_free|uptime:$uptime"
  return 0
}

# ---------------------------------------------------------------------------
# Watchdog Status Check
# ---------------------------------------------------------------------------
check_watchdog() {
  local status="unknown"
  local last_run="N/A"
  local cycle_count=0
  local errors=0
  local warnings=0
  
  # Check if watchdog service is active
  if ssh -i "$SSH_KEY" "$VM_HOST" "systemctl is-active session-watchdog.timer &>/dev/null" 2>/dev/null; then
    status="active"
  else
    status="inactive"
    CRITICALS+=("Watchdog timer inactive")
    echo "watchdog:inactive"
    return 2
  fi
  
  # Get last run timestamp from journal
  last_run=$(ssh -i "$SSH_KEY" "$VM_HOST" "journalctl -u session-watchdog.service -n 1 --no-pager --output=short-iso 2>/dev/null | head -1 | cut -d' ' -f1" 2>/dev/null || echo "N/A")
  
  # Count cycles (successful fires)
  cycle_count=$(ssh -i "$SSH_KEY" "$VM_HOST" "journalctl -u session-watchdog.service --no-pager 2>/dev/null | grep -c 'Watchdog cycle' || echo 0" 2>/dev/null || echo "0")
  
  # Count errors and warnings
  errors=$(ssh -i "$SSH_KEY" "$VM_HOST" "journalctl -u session-watchdog.service --no-pager 2>/dev/null | grep -c 'CRITICAL\\|ERROR' || echo 0" 2>/dev/null || echo "0")
  warnings=$(ssh -i "$SSH_KEY" "$VM_HOST" "journalctl -u session-watchdog.service --no-pager 2>/dev/null | grep -c 'WARN' || echo 0" 2>/dev/null || echo "0")
  
  # Validate
  if [ "$errors" -gt 5 ]; then
    CRITICALS+=("Watchdog has $errors critical errors")
    [ $EXIT_CODE -lt 2 ] && EXIT_CODE=2
  elif [ "$warnings" -gt 10 ]; then
    WARNINGS+=("Watchdog has $warnings warnings")
    [ $EXIT_CODE -lt 1 ] && EXIT_CODE=1
  fi
  
  echo "watchdog:$status|cycles:$cycle_count|errors:$errors|warnings:$warnings|last_run:$last_run"
  return 0
}

# ---------------------------------------------------------------------------
# GitHub Activity Check
# ---------------------------------------------------------------------------
check_github_activity() {
  local repos=(
    "joperezd/game-squad-beneficial-bar"
    "joperezd/game-squad-ComeRosquillas"
    "joperezd/game-squad-Flora"
    "joperezd/game-squad-FossilFuelSimulator"
    "joperezd/game-squad-pixel-bounce"
  )
  
  local total_prs=0
  local merged_today=0
  local repo_details=()
  
  for repo in "${repos[@]}"; do
    # Count merged PRs in last 24h
    local count=$(gh pr list --repo "$repo" --state merged --search "merged:>=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)" --json number --jq 'length' 2>/dev/null || echo "0")
    merged_today=$((merged_today + count))
    
    # Total PRs in last 7 days
    local total=$(gh pr list --repo "$repo" --state merged --search "merged:>=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)" --json number --jq 'length' 2>/dev/null || echo "0")
    total_prs=$((total_prs + total))
    
    repo_details+=("$repo:$count")
  done
  
  # Validate (target: ≥10 PRs/day across constellation)
  if [ "$merged_today" -lt 10 ]; then
    WARNINGS+=("Only $merged_today PRs merged today (target: ≥10)")
    [ $EXIT_CODE -lt 1 ] && EXIT_CODE=1
  fi
  
  echo "github:merged_today=$merged_today|merged_7d=$total_prs|repos=${#repos[@]}"
  for detail in "${repo_details[@]}"; do
    echo "  $detail"
  done
  return 0
}

# ---------------------------------------------------------------------------
# Azure Cost Check
# ---------------------------------------------------------------------------
check_azure_cost() {
  local spend="N/A"
  local budget=500
  local percent="N/A"
  local daily_target=1.50
  
  # Try to use existing azure-cost-check.sh if available
  if [ -f "$SCRIPT_DIR/azure-cost-check.sh" ]; then
    if command -v az &>/dev/null && az account show &>/dev/null 2>&1; then
      local cost_output=$(bash "$SCRIPT_DIR/azure-cost-check.sh" --json 2>/dev/null || echo '{}')
      spend=$(echo "$cost_output" | jq -r '.spend // "N/A"' 2>/dev/null || echo "N/A")
      percent=$(echo "$cost_output" | jq -r '.percent // "N/A"' 2>/dev/null || echo "N/A")
      local level=$(echo "$cost_output" | jq -r '.level // "ok"' 2>/dev/null || echo "ok")
      
      case "$level" in
        warn)
          WARNINGS+=("Azure cost at warning level: €$spend ($percent%)")
          [ $EXIT_CODE -lt 1 ] && EXIT_CODE=1
          ;;
        escalate)
          CRITICALS+=("Azure cost at escalate level: €$spend ($percent%)")
          [ $EXIT_CODE -lt 2 ] && EXIT_CODE=2
          ;;
        emergency)
          CRITICALS+=("Azure cost at EMERGENCY level: €$spend ($percent%)")
          EXIT_CODE=2
          ;;
      esac
    fi
  fi
  
  echo "azure_cost:spend=$spend|budget=$budget|percent=$percent|daily_target=$daily_target"
  return 0
}

# ---------------------------------------------------------------------------
# Ralph Activity Check
# ---------------------------------------------------------------------------
check_ralph_activity() {
  local open_issues=0
  local closed_today=0
  
  # Check open issues on project board
  open_issues=$(gh issue list --repo joperezd/Syntax-Sorcery --state open --json number --jq 'length' 2>/dev/null || echo "0")
  
  # Check issues closed in last 24h
  closed_today=$(gh issue list --repo joperezd/Syntax-Sorcery --state closed --search "closed:>=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)" --json number --jq 'length' 2>/dev/null || echo "0")
  
  echo "ralph:open_issues=$open_issues|closed_today=$closed_today"
  return 0
}

# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------

if ! $JSON_OUTPUT; then
  echo "=========================================="
  echo "Test 3 Monitoring Report"
  echo "Timestamp: $TIMESTAMP"
  echo "=========================================="
  echo
fi

# Run all checks
VM_RESULT=$(check_vm_health)
WATCHDOG_RESULT=$(check_watchdog)
GITHUB_RESULT=$(check_github_activity)
AZURE_RESULT=$(check_azure_cost)
RALPH_RESULT=$(check_ralph_activity)

# Output
if $JSON_OUTPUT; then
  cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "status": "$([ $EXIT_CODE -eq 0 ] && echo "healthy" || [ $EXIT_CODE -eq 1 ] && echo "warning" || echo "critical")",
  "exit_code": $EXIT_CODE,
  "checks": {
    "vm": "$VM_RESULT",
    "watchdog": "$WATCHDOG_RESULT",
    "github": "$GITHUB_RESULT",
    "azure": "$AZURE_RESULT",
    "ralph": "$RALPH_RESULT"
  },
  "warnings": $(printf '%s\n' "${WARNINGS[@]}" | jq -R . | jq -s .),
  "criticals": $(printf '%s\n' "${CRITICALS[@]}" | jq -R . | jq -s .)
}
EOF
else
  echo "VM Health:"
  echo "  $VM_RESULT"
  echo
  echo "Watchdog Status:"
  echo "  $WATCHDOG_RESULT"
  echo
  echo "GitHub Activity:"
  echo "  $GITHUB_RESULT"
  echo
  echo "Azure Cost:"
  echo "  $AZURE_RESULT"
  echo
  echo "Ralph Activity:"
  echo "  $RALPH_RESULT"
  echo
  
  if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo "⚠️  WARNINGS:"
    for warn in "${WARNINGS[@]}"; do
      echo "  - $warn"
    done
    echo
  fi
  
  if [ ${#CRITICALS[@]} -gt 0 ]; then
    echo "🚨 CRITICAL ISSUES:"
    for crit in "${CRITICALS[@]}"; do
      echo "  - $crit"
    done
    echo
  fi
  
  echo "=========================================="
  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Status: HEALTHY"
  elif [ $EXIT_CODE -eq 1 ]; then
    echo "⚠️  Status: WARNING"
  else
    echo "🚨 Status: CRITICAL"
  fi
  echo "=========================================="
fi

exit $EXIT_CODE
