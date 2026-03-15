#!/usr/bin/env bash
# test-verify-test3-metrics.sh — Tests for verify-test3-metrics.sh
# Validates metric calculations and pass/fail criteria

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERIFY_SCRIPT="$SCRIPT_DIR/../verify-test3-metrics.sh"

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

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
echo "Verify Test3 Metrics Script Test Suite"
echo "=========================================="
echo

# Test 1: Script exists
echo "Test 1: Script existence"
if [ -f "$VERIFY_SCRIPT" ]; then
  echo -e "${GREEN}✓${NC} verify-test3-metrics.sh exists"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} verify-test3-metrics.sh not found"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  exit 1
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo

# Test 2: Invalid options handling
echo "Test 2: Error handling"
set +e
bash "$VERIFY_SCRIPT" --invalid-option > /dev/null 2>&1
EXIT_CODE=$?
set -e
assert_exit_code 1 $EXIT_CODE "Invalid option returns exit code 1"
echo

# Test 3: JSON output format
echo "Test 3: JSON output format"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --json --vm-host invalid@invalid 2>&1 || true)
set -e
assert_json_valid "$OUTPUT" "JSON output is valid"
assert_contains "$OUTPUT" '"timestamp"' "JSON contains timestamp"
assert_contains "$OUTPUT" '"result"' "JSON contains result field"
assert_contains "$OUTPUT" '"summary"' "JSON contains summary"
assert_contains "$OUTPUT" '"passed"' "JSON contains passed array"
assert_contains "$OUTPUT" '"failed"' "JSON contains failed array"
echo

# Test 4: Human-readable output format
echo "Test 4: Human-readable output format"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --vm-host invalid@invalid 2>&1 || true)
set -e
assert_contains "$OUTPUT" "24-Hour Metrics Verification" "Contains report header"
assert_contains "$OUTPUT" "PASSED CHECKS:" "Contains passed section"
assert_contains "$OUTPUT" "Summary:" "Contains summary line"
assert_contains "$OUTPUT" "Result:" "Contains result line"
echo

# Test 5: Metric structure validation
echo "Test 5: Metric validation structure"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --json --vm-host invalid@invalid 2>&1 || true)
set -e
# Check that all 6 metric categories are evaluated
assert_contains "$OUTPUT" "satellite" "Checks satellite sessions"
assert_contains "$OUTPUT" "Watchdog" "Checks watchdog cycles"
# Can't check for PR throughput without real GitHub access, but structure should exist
echo

# Test 6: Pass/Fail logic
echo "Test 6: Pass/Fail determination"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --json --vm-host invalid@invalid 2>&1 || true)
set -e
# Should fail when VM is unreachable
assert_contains "$OUTPUT" '"result": "FAIL"' "Returns FAIL when checks fail"
echo

# Test 7: Summary calculations
echo "Test 7: Summary statistics"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --json --vm-host invalid@invalid 2>&1 || true)
set -e
assert_contains "$OUTPUT" '"total_checks"' "Calculates total checks"
assert_contains "$OUTPUT" '"passed"' "Counts passed checks"
assert_contains "$OUTPUT" '"failed"' "Counts failed checks"
assert_contains "$OUTPUT" '"pass_percent"' "Calculates pass percentage"
echo

# Test 8: Parameter acceptance
echo "Test 8: Parameter parsing"
set +e
OUTPUT=$(bash "$VERIFY_SCRIPT" --ssh-key /tmp/fake --vm-host test@test --json 2>&1 || true)
set -e
assert_json_valid "$OUTPUT" "Accepts custom SSH key and VM host"
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
