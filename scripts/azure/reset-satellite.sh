#!/usr/bin/env bash
# reset-satellite.sh — Kill and restart a single satellite tmux session by repo name
# Idempotent: works whether the session exists or not
set -euo pipefail

REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
BASE_DIR="${SATELLITE_BASE_DIR:-$HOME/repos}"

usage() {
  echo "Usage: $0 <repo-name>"
  echo "  Repo must be one of: ${REPOS[*]}"
  echo "  Kills existing tmux session (if any) and starts a fresh one."
  exit 1
}

if [[ $# -ne 1 ]]; then
  usage
fi

REPO="$1"

# Validate repo name
valid=false
for r in "${REPOS[@]}"; do
  if [[ "$r" == "$REPO" ]]; then
    valid=true
    break
  fi
done

if ! $valid; then
  echo "ERROR: '$REPO' is not a valid repo name."
  echo "Valid repos: ${REPOS[*]}"
  exit 1
fi

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

SESSION_NAME="sat-$REPO"
REPO_DIR="$BASE_DIR/$REPO"

if [[ ! -d "$REPO_DIR" ]]; then
  log "ERROR: repo directory not found: $REPO_DIR"
  exit 1
fi

# Kill existing session if present
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  log "KILL: terminating session '$SESSION_NAME'"
  tmux kill-session -t "$SESSION_NAME"
  sleep 1
fi

# Start fresh session
log "LAUNCH: creating tmux session '$SESSION_NAME'"
tmux new-session -d -s "$SESSION_NAME" -c "$REPO_DIR"
tmux send-keys -t "$SESSION_NAME" "copilot" Enter
sleep 2
tmux send-keys -t "$SESSION_NAME" "Ralph, go" Enter

log "OK: session '$SESSION_NAME' restarted"
