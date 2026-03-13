#!/usr/bin/env bash
# azure-cost-check.sh — Reusable Azure cost check for any downstream company
# Usage: ./scripts/azure-cost-check.sh [--json] [--budget AMOUNT]
# Exit codes: 0=ok, 1=warn(80%), 2=escalate(90%), 3=emergency(96%), 4=error
#
# Requires: az CLI logged in, bc

set -euo pipefail

BUDGET="${BUDGET:-500}"
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --json) JSON_OUTPUT=true; shift ;;
    --budget) BUDGET="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 4 ;;
  esac
done

WARN_THRESHOLD=$(echo "scale=2; $BUDGET * 0.80" | bc -l)
ESCALATE_THRESHOLD=$(echo "scale=2; $BUDGET * 0.90" | bc -l)
EMERGENCY_THRESHOLD=$(echo "scale=2; $BUDGET * 0.96" | bc -l)

# Billing period
START_DATE=$(date -u -d "$(date +%Y-%m-01)" +%Y-%m-%d)
END_DATE=$(date -u +%Y-%m-%d)
DAYS_IN_MONTH=$(date -u -d "$(date -u -d 'next month' +%Y-%m-01) -1 day" +%d)
CURRENT_DAY=$(date -u +%d | sed 's/^0//')

# Query Azure
SPEND_RAW=$(az consumption usage list \
  --start-date "$START_DATE" \
  --end-date "$END_DATE" \
  --query "[].pretaxCost" \
  --output tsv 2>/dev/null | paste -sd+ | bc -l 2>/dev/null || echo "0")

SPEND=$(printf "%.2f" "$SPEND_RAW")

# Project end-of-month
if [ "$CURRENT_DAY" -gt 0 ]; then
  PROJECTED=$(echo "scale=2; $SPEND * $DAYS_IN_MONTH / $CURRENT_DAY" | bc -l)
else
  PROJECTED="0.00"
fi

PERCENT=$(echo "scale=1; $SPEND * 100 / $BUDGET" | bc -l)

# Determine level
EXIT_CODE=0
LEVEL="ok"
if (( $(echo "$SPEND >= $EMERGENCY_THRESHOLD" | bc -l) )); then
  LEVEL="emergency"; EXIT_CODE=3
elif (( $(echo "$SPEND >= $ESCALATE_THRESHOLD" | bc -l) )); then
  LEVEL="escalate"; EXIT_CODE=2
elif (( $(echo "$SPEND >= $WARN_THRESHOLD" | bc -l) )); then
  LEVEL="warn"; EXIT_CODE=1
fi

if $JSON_OUTPUT; then
  cat <<EOF
{
  "spend": $SPEND,
  "budget": $BUDGET,
  "percent": $PERCENT,
  "projected": $PROJECTED,
  "level": "$LEVEL",
  "day": $CURRENT_DAY,
  "days_in_month": $DAYS_IN_MONTH,
  "thresholds": {
    "warn": $WARN_THRESHOLD,
    "escalate": $ESCALATE_THRESHOLD,
    "emergency": $EMERGENCY_THRESHOLD
  }
}
EOF
else
  echo "Azure Cost Check"
  echo "================"
  echo "Spend:     €$SPEND / €$BUDGET ($PERCENT%)"
  echo "Projected: €$PROJECTED (EOM)"
  echo "Level:     $LEVEL"
  echo "Day:       $CURRENT_DAY / $DAYS_IN_MONTH"
fi

exit $EXIT_CODE
