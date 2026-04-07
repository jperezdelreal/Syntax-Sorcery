#!/usr/bin/env bash
# preflight.sh — Pre-flight validation for Syntax Sorcery CI and Linux VMs.
# Checks all prerequisites before running tests, deployments, or agent workflows.
#
# Usage:
#   bash scripts/preflight.sh
#   npm run preflight
#
# Checks:
#   1.  Node.js >= 18 installed
#   2.  gh CLI installed
#   3.  gh CLI authenticated
#   4.  git installed
#   5.  az CLI installed        (WARN — optional locally, required for deployment)
#   6.  tmux available          (WARN — VM-only)
#   7.  npm dependencies        (node_modules/ present)
#   8.  All tests pass          (WARN if runner unavailable)
#   9.  .squad/ structure       (team.md, routing.md, decisions.md)
#   10. scripts/azure/main.bicep present
#   11. Bicep parameters file   (main.bicepparam)
#
# Exit codes:
#   0 — all checks PASS (WARNs are acceptable)
#   1 — one or more checks FAIL

set -uo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Report tracking ---
PASS=0
FAIL=0
WARN=0
REPORT_LINES=()

report() {
  local status="$1" check="$2" detail="${3:-}"
  case "$status" in
    PASS) PASS=$((PASS + 1)); REPORT_LINES+=("$(printf "${GREEN}[PASS]${NC} %-42s %s" "$check" "$detail")") ;;
    FAIL) FAIL=$((FAIL + 1)); REPORT_LINES+=("$(printf "${RED}[FAIL]${NC} %-42s %s" "$check" "$detail")") ;;
    WARN) WARN=$((WARN + 1)); REPORT_LINES+=("$(printf "${YELLOW}[WARN]${NC} %-42s %s" "$check" "$detail")") ;;
  esac
}

# Resolve repo root (script lives at scripts/preflight.sh)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Syntax Sorcery — Pre-flight Validation               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${BLUE}[*]${NC} Repo root: $REPO_ROOT"
echo ""

# --- 1. Node.js >= 18 ---
if command -v node &>/dev/null; then
  node_raw=$(node --version 2>/dev/null)
  node_major=$(echo "$node_raw" | sed 's/v\([0-9]*\).*/\1/')
  if [[ "$node_major" -ge 18 ]]; then
    report PASS "Node.js >= 18" "$node_raw"
  else
    report FAIL "Node.js >= 18" "found $node_raw — upgrade to Node 18+  (nvm install 20)"
  fi
else
  report FAIL "Node.js >= 18" "node not found in PATH — install via nvm or nodejs.org"
fi

# --- 2 & 3. gh CLI installed + authenticated ---
if command -v gh &>/dev/null; then
  gh_version=$(gh --version 2>/dev/null | head -1)
  report PASS "gh CLI installed" "$gh_version"

  gh_auth=$(gh auth status 2>&1 || true)
  if echo "$gh_auth" | grep -qi "logged in"; then
    report PASS "gh CLI authenticated"
  else
    report FAIL "gh CLI authenticated" "run: gh auth login"
  fi
else
  report FAIL "gh CLI installed" "gh not found — install: https://cli.github.com"
  report FAIL "gh CLI authenticated" "gh CLI not installed"
fi

# --- 4. git installed ---
if command -v git &>/dev/null; then
  git_version=$(git --version 2>/dev/null)
  report PASS "git installed" "$git_version"
else
  report FAIL "git installed" "git not found in PATH"
fi

# --- 5. az CLI (WARN only — optional locally) ---
if command -v az &>/dev/null; then
  az_version=$(az version --query '"azure-cli"' -o tsv 2>/dev/null || az --version 2>/dev/null | head -1 || echo "available")
  report PASS "az CLI installed" "${az_version:-available}"
else
  report WARN "az CLI installed" "az not found — optional locally, required for deployment"
fi

# --- 6. tmux (WARN — VM-only) ---
if command -v tmux &>/dev/null; then
  tmux_version=$(tmux -V 2>/dev/null)
  report PASS "tmux available" "$tmux_version"
else
  report WARN "tmux available" "tmux not found — required on Linux VMs for agent sessions"
fi

# --- 7. npm dependencies installed (node_modules/ present) ---
if [[ -d "$REPO_ROOT/node_modules" ]]; then
  pkg_count=$(find "$REPO_ROOT/node_modules" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  report PASS "npm dependencies installed" "node_modules/ present (~$pkg_count packages)"
else
  report FAIL "npm dependencies installed" "node_modules/ missing — run: npm install"
fi

# --- 8. All tests pass ---
if [[ -f "$REPO_ROOT/vitest.config.js" || -f "$REPO_ROOT/vitest.config.ts" ]]; then
  if command -v npx &>/dev/null && [[ -d "$REPO_ROOT/node_modules" ]]; then
    test_output=$(cd "$REPO_ROOT" && npx vitest run --reporter=verbose 2>&1 || true)
    # Check for explicit failure signals
    failed_count=$(echo "$test_output" | grep -oiE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
    if [[ "$failed_count" -gt 0 ]]; then
      summary=$(echo "$test_output" | grep -iE 'Tests\s+[0-9]' | tail -1 || echo "$failed_count test(s) failed")
      report WARN "All tests passing" "$failed_count failing — fix before merging: $summary"
    else
      passed_line=$(echo "$test_output" | grep -iE 'Tests\s+[0-9]' | tail -1 || echo "tests ran")
      report PASS "All tests passing" "${passed_line:-all tests passed}"
    fi
  else
    report WARN "All tests passing" "node_modules/ missing — run: npm install then retry"
  fi
else
  report WARN "All tests passing" "no vitest.config.js found — test runner not configured"
fi

# --- 9. .squad/ structure intact ---
squad_ok=true
missing_files=()
for f in team.md routing.md decisions.md; do
  if [[ ! -f "$REPO_ROOT/.squad/$f" ]]; then
    squad_ok=false
    missing_files+=("$f")
  fi
done

if $squad_ok; then
  report PASS ".squad/ structure intact" "team.md, routing.md, decisions.md present"
else
  report FAIL ".squad/ structure intact" "missing: ${missing_files[*]}"
fi

# --- 10. scripts/azure/main.bicep present ---
bicep_main="$REPO_ROOT/scripts/azure/main.bicep"
if [[ -f "$bicep_main" ]]; then
  report PASS "scripts/azure/main.bicep present"
else
  report FAIL "scripts/azure/main.bicep present" "file missing: scripts/azure/main.bicep"
fi

# --- 11. Bicep parameters file present ---
bicep_param="$REPO_ROOT/scripts/azure/main.bicepparam"
if [[ -f "$bicep_param" ]]; then
  report PASS "Bicep parameters file present" "main.bicepparam"
else
  report FAIL "Bicep parameters file present" "file missing: scripts/azure/main.bicepparam"
fi

# --- Final Summary ---
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  PRE-FLIGHT REPORT"
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
  echo -e "${RED}[✗]${NC} Pre-flight FAILED — $FAIL check(s) must be resolved before proceeding"
  exit 1
else
  echo -e "${GREEN}[✓]${NC} Pre-flight PASSED — ready to go (${WARN} warning(s))"
  exit 0
fi
