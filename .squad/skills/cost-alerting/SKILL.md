# Skill: Cost Alerting

**Confidence:** high
**Category:** infrastructure
**Source:** P1-09 — Azure cost alerting for SS + downstream companies

## TLDR

Three-tier cost alerting pattern using GitHub Actions + Azure CLI. Zero additional Azure cost. Escalating actions: warn → escalate → auto-kill. Reusable across any downstream company by adjusting budget env vars.

## Problem

Azure budget of €500/month is a hard limit. Without automated alerts, spend can silently exceed the budget before anyone notices. Manual monitoring doesn't scale across multiple downstream companies.

## Pattern: Three-Tier Cost Alerting

### Tier 1 — Warning (80% of budget)
- Creates a GitHub Issue labeled `cost-alert`, `priority:P1`, assigned to Cloud Engineer (Tank)
- If an alert issue already exists, adds a daily comment instead of duplicating
- Action: review resource usage, consider scaling down

### Tier 2 — Escalation (90% of budget)
- Creates P0 issue assigned to Lead (Morpheus) + Cloud Engineer
- Closes any existing P1 warning issues (superseded)
- Action: immediate resource audit, stop non-essential workloads

### Tier 3 — Emergency (96% of budget)
- **Automatic resource termination**: deallocates VMs, stops App Services, stops containers
- Resources tagged `protected: true` in Azure are exempt from auto-kill
- Creates incident issue documenting what was stopped
- Supports dry-run mode for testing

### Proactive: Projected Overspend
- Linear extrapolation from current spend rate
- Alerts if projected end-of-month spend would exceed escalation or emergency thresholds
- Gives early warning even when current spend is still low

## Implementation

### GitHub Actions Workflow
File: `.github/workflows/cost-alert.yml`
- Runs daily at 07:00 UTC (free tier)
- Supports `workflow_dispatch` with dry-run option
- Requires: `AZURE_CREDENTIALS` secret, `AZURE_SUBSCRIPTION_ID` repo variable
- Gracefully skips if Azure credentials aren't configured

### Reusable Script
File: `scripts/azure-cost-check.sh`
- Standalone cost check script for integration into other workflows
- Supports `--json` output for machine parsing
- Supports `--budget AMOUNT` to override default
- Exit codes: 0=ok, 1=warn, 2=escalate, 3=emergency, 4=error

### Integration with Squad CLI
The cost check can be integrated into Squad CLI session health checks:
```bash
# In session health check phase
COST_STATUS=$(./scripts/azure-cost-check.sh --json --budget 500 | jq -r '.level')
if [ "$COST_STATUS" = "emergency" ]; then
  echo "⚠️ Budget emergency — skipping resource-intensive operations"
fi
```

## Configuration

All thresholds are configurable via workflow `env:` block:
```yaml
env:
  BUDGET_LIMIT: '500'        # Total monthly budget (EUR)
  WARN_THRESHOLD: '400'      # 80% — engineer alert
  ESCALATE_THRESHOLD: '450'  # 90% — lead + founder alert
  EMERGENCY_THRESHOLD: '480' # 96% — auto-kill idle resources
```

### Azure Resource Protection
Tag any resource with `protected: true` to exempt it from auto-kill:
```bash
az resource tag --tags protected=true --ids /subscriptions/.../resourceGroups/.../...
```

## Anti-Patterns
- **Manual budget monitoring** — doesn't scale, humans forget
- **Alert-only without auto-remediation** — by the time someone reads the email, budget is blown
- **Hard-coded thresholds in scripts** — use env vars for reusability
- **Killing all resources blindly** — always respect `protected` tags for production services

## Applicability
Any Azure-hosted project with a budget constraint. Adjust `BUDGET_LIMIT` and threshold percentages per downstream company. The workflow is company-agnostic — it reads from Azure Cost Management API, not from any specific resource group.

## Prerequisites
1. Azure Service Principal with `Cost Management Reader` + `Contributor` roles
2. `AZURE_CREDENTIALS` secret in GitHub repo (JSON format from `az ad sp create-for-rbac`)
3. `AZURE_SUBSCRIPTION_ID` repository variable
