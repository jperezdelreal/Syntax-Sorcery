#!/usr/bin/env bash
# verify-deployment.sh — Post-deployment verification for Syntax Sorcery Test 3 VM
# SSHs into the VM and runs a structured pass/fail check on all prerequisites.
# Outputs a structured report suitable for CI or human review.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOURCE_GROUP="${RESOURCE_GROUP:-syntax-sorcery-satellites}"
VM_NAME="${VM_NAME:-ss-satellite-vm}"
VM_USER="${VM_USER:-ssadmin}"
SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=no -o BatchMode=yes"
REPOS=(flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios)
BASE_DIR="${SATELLITE_BASE_DIR:-\$HOME/repos}"
DRY_RUN=false
VM_IP=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Verify Syntax Sorcery Test 3 VM deployment is healthy and ready.

Options:
  --ip IP       VM public IP (auto-detected from Azure if omitted)
  --dry-run     Print checks without executing them
  --help        Show this help message

Checks performed:
  - SSH connectivity
  - Cloud-init completion
  - Node.js installed and version
  - GitHub CLI installed and authenticated
  - Repos cloned (all 5)
  - tmux available
  - Disk space (>10% free)
  - Memory (>10% free)
  - Network connectivity (github.com reachable)
  - Watchdog dry-run
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ip)       VM_IP="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=true; shift ;;
    --help|-h)  usage ;;
    *)          echo "Unknown option: $1"; usage ;;
  esac
done

# --- Report tracking ---
PASS=0
FAIL=0
WARN=0
REPORT_LINES=()

report() {
  local status="$1" check="$2" detail="${3:-}"
  case "$status" in
    PASS) PASS=$((PASS + 1)); REPORT_LINES+=("$(printf "${GREEN}[PASS]${NC} %-35s %s" "$check" "$detail")") ;;
    FAIL) FAIL=$((FAIL + 1)); REPORT_LINES+=("$(printf "${RED}[FAIL]${NC} %-35s %s" "$check" "$detail")") ;;
    WARN) WARN=$((WARN + 1)); REPORT_LINES+=("$(printf "${YELLOW}[WARN]${NC} %-35s %s" "$check" "$detail")") ;;
  esac
}

ssh_cmd() {
  # shellcheck disable=SC2086
  ssh $SSH_OPTS "${VM_USER}@${VM_IP}" "$@" 2>/dev/null
}

# --- Resolve VM IP ---
if [[ -z "$VM_IP" ]]; then
  if $DRY_RUN; then
    echo "DRY-RUN: would auto-detect VM IP from Azure"
    VM_IP="<auto-detect>"
  else
    echo -e "${BLUE}[*]${NC} Resolving VM IP from Azure..."
    VM_IP=$(az vm show \
      --resource-group "$RESOURCE_GROUP" \
      --name "$VM_NAME" \
      --show-details \
      --query publicIps \
      --output tsv 2>/dev/null || echo "")

    if [[ -z "$VM_IP" ]]; then
      echo -e "${RED}[✗]${NC} Could not resolve VM IP. Use --ip to specify manually."
      exit 1
    fi
    echo -e "${GREEN}[✓]${NC} VM IP: $VM_IP"
  fi
fi

if $DRY_RUN; then
  echo ""
  echo "DRY-RUN: Would run the following checks against $VM_IP:"
  echo "  1. SSH connectivity"
  echo "  2. Cloud-init status"
  echo "  3. Node.js installed"
  echo "  4. GitHub CLI installed + authenticated"
  echo "  5. Repos cloned (5)"
  echo "  6. tmux available"
  echo "  7. Disk space (>10% free)"
  echo "  8. Memory (>10% free)"
  echo "  9. Network connectivity (github.com)"
  echo "  10. Watchdog dry-run"
  exit 0
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Syntax Sorcery Test 3 — Deployment Verification        ║"
echo "║  Target: ${VM_USER}@${VM_IP}                            "
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# --- 1. SSH connectivity ---
if ssh_cmd "echo ok" | grep -q "ok"; then
  report PASS "SSH connectivity"
else
  report FAIL "SSH connectivity" "Cannot reach ${VM_USER}@${VM_IP}"
  echo ""
  echo "Cannot SSH into VM — aborting remaining checks."
  for line in "${REPORT_LINES[@]}"; do echo -e "$line"; done
  exit 1
fi

# --- 2. Cloud-init ---
cloud_status=$(ssh_cmd "cloud-init status 2>/dev/null | head -1" || echo "unknown")
if echo "$cloud_status" | grep -q "done"; then
  report PASS "Cloud-init completed"
elif echo "$cloud_status" | grep -q "running"; then
  report WARN "Cloud-init still running" "$cloud_status"
else
  report FAIL "Cloud-init" "$cloud_status"
fi

# --- 3. Node.js ---
node_version=$(ssh_cmd "node --version 2>/dev/null" || echo "")
if [[ -n "$node_version" ]]; then
  report PASS "Node.js installed" "$node_version"
else
  report FAIL "Node.js installed" "not found in PATH"
fi

# --- 4. GitHub CLI ---
gh_version=$(ssh_cmd "gh --version 2>/dev/null | head -1" || echo "")
if [[ -n "$gh_version" ]]; then
  report PASS "GitHub CLI installed" "$gh_version"
else
  report FAIL "GitHub CLI installed" "not found in PATH"
fi

gh_auth=$(ssh_cmd "gh auth status 2>&1 | head -2" || echo "not authenticated")
if echo "$gh_auth" | grep -qi "logged in"; then
  report PASS "GitHub CLI authenticated"
else
  report FAIL "GitHub CLI authenticated" "run: gh auth login"
fi

# --- 5. Repos cloned ---
for repo in "${REPOS[@]}"; do
  repo_check=$(ssh_cmd "test -d ~/repos/$repo/.git && echo yes || echo no")
  if [[ "$repo_check" == "yes" ]]; then
    report PASS "Repo cloned: $repo"
  else
    report FAIL "Repo cloned: $repo" "missing ~/repos/$repo"
  fi
done

# --- 6. tmux ---
tmux_version=$(ssh_cmd "tmux -V 2>/dev/null" || echo "")
if [[ -n "$tmux_version" ]]; then
  report PASS "tmux available" "$tmux_version"
else
  report FAIL "tmux available" "not found in PATH"
fi

# --- 7. Disk space ---
disk_free=$(ssh_cmd "df --output=avail / 2>/dev/null | tail -1 | tr -d ' '" || echo "0")
disk_pct_used=$(ssh_cmd "df --output=pcent / 2>/dev/null | tail -1 | tr -d ' %'" || echo "100")
disk_free_gb=$(echo "scale=1; $disk_free / 1048576" | bc 2>/dev/null || echo "?")
if [[ "$disk_pct_used" -lt 90 ]]; then
  report PASS "Disk space" "${disk_free_gb}GB free (${disk_pct_used}% used)"
else
  report FAIL "Disk space" "${disk_free_gb}GB free (${disk_pct_used}% used — above 90%)"
fi

# --- 8. Memory ---
mem_pct=$(ssh_cmd "free | awk '/^Mem:/ {printf \"%.0f\", \$3/\$2*100}'" || echo "100")
mem_free_mb=$(ssh_cmd "free -m | awk '/^Mem:/ {print \$4}'" || echo "0")
if [[ "$mem_pct" -lt 90 ]]; then
  report PASS "Memory" "${mem_free_mb}MB free (${mem_pct}% used)"
else
  report WARN "Memory" "${mem_free_mb}MB free (${mem_pct}% used — above 90%)"
fi

# --- 9. Network ---
net_check=$(ssh_cmd "curl -so /dev/null -w '%{http_code}' --connect-timeout 5 https://github.com 2>/dev/null" || echo "000")
if [[ "$net_check" == "200" || "$net_check" == "301" ]]; then
  report PASS "Network (github.com)" "HTTP $net_check"
else
  report FAIL "Network (github.com)" "HTTP $net_check — cannot reach github.com"
fi

# --- 10. Watchdog dry-run ---
watchdog_path="~/scripts/azure/session-watchdog.sh"
watchdog_exists=$(ssh_cmd "test -f $watchdog_path && echo yes || echo no")
if [[ "$watchdog_exists" == "yes" ]]; then
  watchdog_output=$(ssh_cmd "bash $watchdog_path --dry-run 2>&1 | tail -3" || echo "error")
  if echo "$watchdog_output" | grep -qi "dry-run\|watchdog"; then
    report PASS "Watchdog dry-run" "executes successfully"
  else
    report WARN "Watchdog dry-run" "unexpected output"
  fi
else
  report WARN "Watchdog not deployed" "copy scripts to VM first"
fi

# --- Report ---
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  VERIFICATION REPORT"
echo "═══════════════════════════════════════════════════════════"
echo ""
for line in "${REPORT_LINES[@]}"; do
  echo -e "  $line"
done
echo ""
echo "═══════════════════════════════════════════════════════════"
total=$((PASS + FAIL + WARN))
echo -e "  Total: $total checks | ${GREEN}$PASS passed${NC} | ${RED}$FAIL failed${NC} | ${YELLOW}$WARN warnings${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo -e "${RED}[✗]${NC} Verification FAILED — $FAIL check(s) need attention before Test 3"
  exit 1
else
  echo -e "${GREEN}[✓]${NC} Verification PASSED — VM is ready for Test 3"
  exit 0
fi
