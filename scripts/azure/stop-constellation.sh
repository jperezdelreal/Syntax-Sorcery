#!/usr/bin/env bash
# stop-constellation.sh — Gracefully stop all constellation tmux sessions
# Saves session logs before killing. Idempotent.
set -euo pipefail

REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
LOG_DIR="${CONSTELLATION_LOG_DIR:-$HOME/logs/constellation}"
DRY_RUN=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Gracefully stop all constellation (ss-*) tmux sessions.
Saves session buffer to log files before killing.

Options:
  --dry-run       Show what would be stopped without acting
  --log-dir DIR   Directory for session logs (default: ~/logs/constellation)
  --help          Show this help message
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN=true; shift ;;
    --log-dir)  LOG_DIR="$2"; shift 2 ;;
    --help|-h)  usage ;;
    *)          echo "Unknown option: $1"; usage ;;
  esac
done

log() { echo -e "${BLUE}[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]${NC} $*"; }
ok()  { echo -e "${GREEN}[✓]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; }

# Check if any sessions exist
running_sessions=()
for repo in "${REPOS[@]}"; do
  session_name="ss-$repo"
  if tmux has-session -t "$session_name" 2>/dev/null; then
    running_sessions+=("$session_name")
  fi
done

if [[ ${#running_sessions[@]} -eq 0 ]]; then
  log "No constellation sessions running — nothing to stop"
  exit 0
fi

log "Found ${#running_sessions[@]} constellation session(s) to stop"

if $DRY_RUN; then
  echo ""
  echo "DRY-RUN: Would stop the following sessions:"
  for session in "${running_sessions[@]}"; do
    echo "  - $session"
  done
  echo "  Logs would be saved to: $LOG_DIR/"
  exit 0
fi

# Create log directory
mkdir -p "$LOG_DIR"

timestamp=$(date -u '+%Y%m%d-%H%M%S')
stopped=0
errors=0

for session_name in "${running_sessions[@]}"; do
  log "Stopping '${YELLOW}$session_name${NC}'..."

  # Save session buffer to log file
  log_file="$LOG_DIR/${session_name}-${timestamp}.log"
  if tmux capture-pane -t "$session_name" -p -S -5000 > "$log_file" 2>/dev/null; then
    ok "Saved buffer → $log_file ($(wc -l < "$log_file") lines)"
  else
    err "Could not capture buffer for '$session_name'"
  fi

  # Kill the session
  if tmux kill-session -t "$session_name" 2>/dev/null; then
    ok "Session '$session_name' stopped"
    stopped=$((stopped + 1))
  else
    err "Failed to kill session '$session_name'"
    errors=$((errors + 1))
  fi
done

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  CONSTELLATION SHUTDOWN"
echo "═══════════════════════════════════════════════════════════"
echo -e "  Stopped: ${GREEN}$stopped${NC} | Errors: ${RED}$errors${NC}"
echo "  Logs saved to: $LOG_DIR/"
echo "═══════════════════════════════════════════════════════════"

remaining=$(tmux list-sessions 2>/dev/null | grep -c '^ss-' || true)
if [[ $remaining -gt 0 ]]; then
  err "$remaining session(s) still running — may need manual cleanup"
  exit 1
fi

ok "All constellation sessions stopped cleanly"
