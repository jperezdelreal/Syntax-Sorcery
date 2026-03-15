#!/usr/bin/env bash
# test-monitor-test3.sh — Tests for monitor-test3.sh
# Validates report formats, exit codes, and metric calculations

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/../monitor-test3.sh"

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helpers
assert_exit_code() {
  local expected=$1
  local actual=$2
  local test_name=$3
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [ "$actual" -eq "$expected" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name (expected exit $expected, got $actual)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

assert_contains() {
  local haystack=$1
  local needle=$2
  local test_name=$3
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if echo "$haystack" | grep -q "$needle"; then
    echo -e "${GREEN}✓${NC} $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name (string not found: $needle)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

assert_json_valid() {
  local json=$1
  local test_name=$2
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if echo "$json" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name (invalid JSON)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Test Suite
# ---------------------------------------------------------------------------

echo "=========================================="
echo "Monitor Test3 Script Test Suite"
echo "=========================================="
echo

# Test 1: Script exists and is executable
echo "Test 1: Script existence"
if [ -f "$MONITOR_SCRIPT" ]; then
  echo -e "${GREEN}✓${NC} monitor-test3.sh exists"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} monitor-test3.sh not found"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  exit 1
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo

# Test 2: Help/Usage (invalid flag should return error)
echo "Test 2: Error handling for invalid options"
set +e
bash "$MONITOR_SCRIPT" --invalid-flag > /dev/null 2>&1
EXIT_CODE=$?
set -e
assert_exit_code 2 $EXIT_CODE "Invalid flag returns exit code 2"
echo

# Test 3: JSON output format (mock VM unreachable scenario)
echo "Test 3: JSON output format"
set +e
# This will fail to connect to VM, but should still produce valid JSON
OUTPUT=$(bash "$MONITOR_SCRIPT" --json --vm-host invalid-host@invalid 2>&1 || true)
set -e
assert_json_valid "$OUTPUT" "JSON output is valid"
assert_contains "$OUTPUT" '"timestamp"' "JSON contains timestamp field"
assert_contains "$OUTPUT" '"status"' "JSON contains status field"
assert_contains "$OUTPUT" '"checks"' "JSON contains checks field"
echo

# Test 4: Human-readable output format
echo "Test 4: Human-readable output format"
set +e
OUTPUT=$(bash "$MONITOR_SCRIPT" --vm-host invalid-host@invalid 2>&1 || true)
set -e
assert_contains "$OUTPUT" "Test 3 Monitoring Report" "Contains report header"
assert_contains "$OUTPUT" "Timestamp:" "Contains timestamp"
assert_contains "$OUTPUT" "VM Health:" "Contains VM health section"
assert_contains "$OUTPUT" "Status:" "Contains status line"
echo

# Test 5: Exit code for critical failures
echo "Test 5: Exit code scenarios"
set +e
bash "$MONITOR_SCRIPT" --vm-host invalid-host@invalid > /dev/null 2>&1
EXIT_CODE=$?
set -e
assert_exit_code 2 $EXIT_CODE "VM unreachable returns exit code 2 (critical)"
echo

# Test 6: SSH key parameter acceptance
echo "Test 6: Parameter parsing"
set +e
OUTPUT=$(bash "$MONITOR_SCRIPT" --ssh-key /tmp/fake-key --vm-host invalid@invalid --json 2>&1 || true)
set -e
assert_json_valid "$OUTPUT" "Accepts --ssh-key parameter"
echo

# Test 7: Output structure validation
echo "Test 7: Output structure completeness"
set +e
OUTPUT=$(bash "$MONITOR_SCRIPT" --json --vm-host invalid@invalid 2>&1 || true)
set -e
assert_contains "$OUTPUT" '"vm"' "JSON contains vm check"
assert_contains "$OUTPUT" '"watchdog"' "JSON contains watchdog check"
assert_contains "$OUTPUT" '"github"' "JSON contains github check"
assert_contains "$OUTPUT" '"azure"' "JSON contains azure check"
assert_contains "$OUTPUT" '"ralph"' "JSON contains ralph check"
echo

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests Run:    $TESTS_RUN"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
