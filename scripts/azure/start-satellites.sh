#!/usr/bin/env bash
# start-satellites.sh — Launch tmux sessions for all 5 downstream satellite repos
# Idempotent: skips sessions that already exist
set -euo pipefail

REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
OWNER="jperezdelreal"
BASE_DIR="${SATELLITE_BASE_DIR:-$HOME/repos}"
DRY_RUN=false

usage() {
  echo "Usage: $0 [--dry-run] [--base-dir DIR]"
  echo "  --dry-run    Validate config without launching tmux sessions"
  echo "  --base-dir   Base directory containing repo clones (default: ~/repos)"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN=true; shift ;;
    --base-dir) BASE_DIR="$2"; shift 2 ;;
    --help|-h)  usage ;;
    *)          echo "Unknown option: $1"; usage ;;
  esac
done

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

errors=0

for repo in "${REPOS[@]}"; do
  repo_dir="$BASE_DIR/$repo"

  if [[ ! -d "$repo_dir" ]]; then
    log "ERROR: repo directory not found: $repo_dir"
    errors=$((errors + 1))
    continue
  fi

  if ! command -v copilot &>/dev/null; then
    log "ERROR: 'copilot' CLI not found in PATH"
    exit 1
  fi

  if $DRY_RUN; then
    log "DRY-RUN: would launch tmux session 'sat-$repo' in $repo_dir"
    continue
  fi

  session_name="sat-$repo"

  if tmux has-session -t "$session_name" 2>/dev/null; then
    log "SKIP: session '$session_name' already exists"
    continue
  fi

  log "LAUNCH: creating tmux session '$session_name'"
  tmux new-session -d -s "$session_name" -c "$repo_dir"
  tmux send-keys -t "$session_name" "copilot" Enter
  sleep 2
  tmux send-keys -t "$session_name" "Ralph, go" Enter

  log "OK: session '$session_name' started"
done

if $DRY_RUN; then
  if [[ $errors -eq 0 ]]; then
    log "DRY-RUN PASSED: all ${#REPOS[@]} repos validated"
  else
    log "DRY-RUN FAILED: $errors error(s) found"
    exit 1
  fi
else
  running=$(tmux list-sessions 2>/dev/null | grep -c '^sat-' || true)
  log "DONE: $running satellite session(s) running"
fi
