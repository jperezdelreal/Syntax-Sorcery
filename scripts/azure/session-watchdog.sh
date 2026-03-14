#!/usr/bin/env bash
# session-watchdog.sh — Monitor and auto-restart tmux satellite sessions
# Runs every 30 minutes via systemd timer. Checks health, restarts stale sessions.
# Writes structured JSON log to /var/log/ss-watchdog.jsonl
set -euo pipefail

REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
BASE_DIR="${SATELLITE_BASE_DIR:-$HOME/repos}"
LOG_FILE="${WATCHDOG_LOG:-/var/log/ss-watchdog.jsonl}"
MAX_SESSION_HOURS="${MAX_SESSION_HOURS:-6}"
MAX_RESTART_FAILURES=3
DRY_RUN=false

usage() {
  echo "Usage: $0 [--dry-run]"
  echo "  --dry-run    Report checks without restarting sessions or writing logs"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN=true; shift ;;
    --help|-h)  usage ;;
    *)          echo "Unknown option: $1"; usage ;;
  esac
done

now_epoch=$(date +%s)
now_iso=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
hostname=$(hostname)

# State file to track consecutive restart failures per session
STATE_DIR="${WATCHDOG_STATE_DIR:-/var/lib/ss-watchdog}"
mkdir -p "$STATE_DIR" 2>/dev/null || true

json_log() {
  local level="$1" session="$2" message="$3"
  shift 3
  local extra=""
  if [[ $# -gt 0 ]]; then
    extra="$1"
  fi

  local entry
  entry=$(printf '{"timestamp":"%s","level":"%s","host":"%s","session":"%s","message":"%s"%s}' \
    "$now_iso" "$level" "$hostname" "$session" "$message" "${extra:+,$extra}")

  if $DRY_RUN; then
    echo "DRY-RUN LOG: $entry"
  else
    echo "$entry" >> "$LOG_FILE"
  fi
}

get_session_uptime_seconds() {
  local session_name="$1"
  local created_epoch
  # tmux display-message -p -t <session> '#{session_created}' returns epoch
  created_epoch=$(tmux display-message -p -t "$session_name" '#{session_created}' 2>/dev/null) || return 1
  echo $(( now_epoch - created_epoch ))
}

get_disk_usage_pct() {
  df --output=pcent / 2>/dev/null | tail -1 | tr -d ' %' || echo "0"
}

get_memory_usage_pct() {
  if command -v free &>/dev/null; then
    free | awk '/^Mem:/ {printf "%.0f", $3/$2*100}'
  else
    echo "0"
  fi
}

get_failure_count() {
  local session_name="$1"
  local state_file="$STATE_DIR/${session_name}.failures"
  if [[ -f "$state_file" ]]; then
    cat "$state_file"
  else
    echo "0"
  fi
}

set_failure_count() {
  local session_name="$1" count="$2"
  local state_file="$STATE_DIR/${session_name}.failures"
  if ! $DRY_RUN; then
    echo "$count" > "$state_file"
  fi
}

restart_session() {
  local repo="$1" session_name="$2" repo_dir="$3"

  # Kill existing session
  if tmux has-session -t "$session_name" 2>/dev/null; then
    tmux kill-session -t "$session_name"
    sleep 1
  fi

  # Start fresh
  tmux new-session -d -s "$session_name" -c "$repo_dir"
  tmux send-keys -t "$session_name" "copilot" Enter
  sleep 2
  tmux send-keys -t "$session_name" "Ralph, go" Enter

  # Verify it came up
  sleep 2
  if tmux has-session -t "$session_name" 2>/dev/null; then
    return 0
  else
    return 1
  fi
}

# System-level checks (once per run)
disk_pct=$(get_disk_usage_pct)
mem_pct=$(get_memory_usage_pct)

json_log "INFO" "system" "watchdog check started" \
  "\"disk_usage_pct\":$disk_pct,\"memory_usage_pct\":$mem_pct,\"max_session_hours\":$MAX_SESSION_HOURS"

if [[ "$disk_pct" -gt 90 ]]; then
  json_log "WARNING" "system" "disk usage above 90%" "\"disk_usage_pct\":$disk_pct"
fi

if [[ "$mem_pct" -gt 90 ]]; then
  json_log "WARNING" "system" "memory usage above 90%" "\"memory_usage_pct\":$mem_pct"
fi

# Per-session checks
for repo in "${REPOS[@]}"; do
  session_name="sat-$repo"
  repo_dir="$BASE_DIR/$repo"

  # Check if session is alive
  if ! tmux has-session -t "$session_name" 2>/dev/null; then
    json_log "WARNING" "$session_name" "session not running — attempting restart"

    if $DRY_RUN; then
      echo "DRY-RUN: would restart session '$session_name'"
      continue
    fi

    failures=$(get_failure_count "$session_name")

    if [[ "$failures" -ge "$MAX_RESTART_FAILURES" ]]; then
      json_log "CRITICAL" "$session_name" "session failed to restart $MAX_RESTART_FAILURES consecutive times — manual intervention required" \
        "\"consecutive_failures\":$failures"
      continue
    fi

    if restart_session "$repo" "$session_name" "$repo_dir"; then
      set_failure_count "$session_name" 0
      json_log "INFO" "$session_name" "session restarted successfully (was dead)"
    else
      failures=$((failures + 1))
      set_failure_count "$session_name" "$failures"
      json_log "ERROR" "$session_name" "restart failed" "\"consecutive_failures\":$failures"

      if [[ "$failures" -ge "$MAX_RESTART_FAILURES" ]]; then
        json_log "CRITICAL" "$session_name" "session failed to restart $MAX_RESTART_FAILURES consecutive times — manual intervention required" \
          "\"consecutive_failures\":$failures"
      fi
    fi
    continue
  fi

  # Session is alive — check uptime
  uptime_seconds=$(get_session_uptime_seconds "$session_name" || echo "0")
  uptime_hours=$(( uptime_seconds / 3600 ))
  max_seconds=$(( MAX_SESSION_HOURS * 3600 ))

  if [[ "$uptime_seconds" -gt "$max_seconds" ]]; then
    json_log "INFO" "$session_name" "session exceeded max uptime — recycling" \
      "\"uptime_hours\":$uptime_hours,\"max_hours\":$MAX_SESSION_HOURS"

    if $DRY_RUN; then
      echo "DRY-RUN: would recycle session '$session_name' (uptime: ${uptime_hours}h > ${MAX_SESSION_HOURS}h)"
      continue
    fi

    failures=$(get_failure_count "$session_name")

    if restart_session "$repo" "$session_name" "$repo_dir"; then
      set_failure_count "$session_name" 0
      json_log "INFO" "$session_name" "session recycled successfully" \
        "\"previous_uptime_hours\":$uptime_hours"
    else
      failures=$((failures + 1))
      set_failure_count "$session_name" "$failures"
      json_log "ERROR" "$session_name" "recycle restart failed" "\"consecutive_failures\":$failures"

      if [[ "$failures" -ge "$MAX_RESTART_FAILURES" ]]; then
        json_log "CRITICAL" "$session_name" "session failed to restart $MAX_RESTART_FAILURES consecutive times — manual intervention required" \
          "\"consecutive_failures\":$failures"
      fi
    fi
  else
    # Session healthy — clear failure counter and log OK
    set_failure_count "$session_name" 0
    json_log "INFO" "$session_name" "session healthy" \
      "\"uptime_hours\":$uptime_hours,\"uptime_seconds\":$uptime_seconds"
  fi
done

json_log "INFO" "system" "watchdog check completed"
