#!/usr/bin/env bash
# start-constellation.sh — Start tmux sessions for all 5 downstream repos (Test 3)
# Each session: cd to repo, git pull, start copilot session
# Named sessions: ss-{repo-name}
# Idempotent: skips sessions that already exist
set -euo pipefail

REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
OWNER="jperezdelreal"
BASE_DIR="${SATELLITE_BASE_DIR:-$HOME/repos}"
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

Start tmux constellation sessions for all 5 downstream repos.
Each session runs: cd <repo> → git pull → copilot → Ralph, go

Options:
  --dry-run      Validate config without launching sessions
  --base-dir DIR Base directory containing repo clones (default: ~/repos)
  --help         Show this help message

Sessions created: ss-flora, ss-ComeRosquillas, ss-pixel-bounce,
                  ss-ffs-squad-monitor, ss-FirstFrameStudios
EOF
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

log() { echo -e "${BLUE}[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]${NC} $*"; }
ok()  { echo -e "${GREEN}[✓]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; }

# Preflight
errors=0
for repo in "${REPOS[@]}"; do
  repo_dir="$BASE_DIR/$repo"
  if [[ ! -d "$repo_dir" ]]; then
    err "Repo directory not found: $repo_dir"
    errors=$((errors + 1))
  fi
done

if ! command -v copilot &>/dev/null; then
  err "'copilot' CLI not found in PATH"
  errors=$((errors + 1))
fi

if ! command -v tmux &>/dev/null; then
  err "'tmux' not found in PATH"
  errors=$((errors + 1))
fi

if [[ $errors -gt 0 ]]; then
  err "$errors preflight error(s) — fix before launching"
  exit 1
fi

if $DRY_RUN; then
  log "DRY-RUN: All ${#REPOS[@]} repos validated"
  for repo in "${REPOS[@]}"; do
    echo "  Would create session: ss-$repo → $BASE_DIR/$repo"
  done
  exit 0
fi

# Launch sessions
started=0
skipped=0
failed=0

for repo in "${REPOS[@]}"; do
  session_name="ss-$repo"
  repo_dir="$BASE_DIR/$repo"

  if tmux has-session -t "$session_name" 2>/dev/null; then
    log "SKIP: session '${YELLOW}$session_name${NC}' already exists"
    skipped=$((skipped + 1))
    continue
  fi

  log "LAUNCH: creating session '${GREEN}$session_name${NC}'"

  # Create session in repo directory
  tmux new-session -d -s "$session_name" -c "$repo_dir"

  # Pull latest changes
  tmux send-keys -t "$session_name" "git pull --rebase 2>/dev/null; echo '--- repo updated ---'" Enter
  sleep 2

  # Start copilot
  tmux send-keys -t "$session_name" "copilot" Enter
  sleep 2

  # Kick off Ralph
  tmux send-keys -t "$session_name" "Ralph, go" Enter

  # Verify session came up
  if tmux has-session -t "$session_name" 2>/dev/null; then
    ok "Session '$session_name' started"
    started=$((started + 1))
  else
    err "Session '$session_name' failed to start"
    failed=$((failed + 1))
  fi
done

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  CONSTELLATION STATUS"
echo "═══════════════════════════════════════════════════════════"

running=$(tmux list-sessions 2>/dev/null | grep -c '^ss-' || true)
echo -e "  Started: ${GREEN}$started${NC} | Skipped: ${YELLOW}$skipped${NC} | Failed: ${RED}$failed${NC}"
echo -e "  Total running ss-* sessions: ${GREEN}$running${NC}/${#REPOS[@]}"
echo "═══════════════════════════════════════════════════════════"

# List active sessions
if [[ $running -gt 0 ]]; then
  echo ""
  echo "Active constellation sessions:"
  tmux list-sessions 2>/dev/null | grep '^ss-' | while read -r line; do
    echo "  $line"
  done
fi

if [[ $failed -gt 0 ]]; then
  exit 1
fi
