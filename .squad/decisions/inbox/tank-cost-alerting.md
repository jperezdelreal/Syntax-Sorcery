# Decision: Azure Cost Alerting System (P1-09)

**By:** Tank (Cloud Engineer)
**Date:** 2026-03-14
**Tier:** T2 (implementation detail)
**Issue:** P1-09

## What

Three-tier Azure cost alerting via GitHub Actions + Azure CLI:
1. **€400 (80%)** → P1 issue assigned to Tank — review resources
2. **€450 (90%)** → P0 escalation to Morpheus + founder — immediate audit
3. **€480 (96%)** → Auto-kill: deallocate VMs, stop App Services/containers (respects `protected:true` tag)

Plus proactive projected-overspend alerts via linear extrapolation.

## Option Selected

**Option B: GitHub Action + Azure CLI** over native Azure Budget Alerts (Option A) and Azure Monitor (Option C).

**Why Option B wins:**
- €0 cost (GHA free tier, `az consumption usage list` is free)
- Full control over alert logic — thresholds, escalation, auto-remediation all in code
- GitHub Issues as alert channel — fits our existing work system (no email/webhook needed)
- Reusable across any downstream company by changing env vars
- Dry-run mode for safe testing

**Why not Option A (Azure Budget Alerts):**
- Limited to email/webhook — can't auto-create GitHub Issues or auto-kill resources
- No projected spend alerts
- Less portable across subscriptions

**Why not Option C (Azure Monitor):**
- Small but non-zero cost (Action Groups, Log Analytics)
- Overkill for our budget monitoring needs

## Budget Impact

Zero. Uses GitHub Actions free tier (daily cron). Azure Cost Management API queries are free.

## Files

- `.github/workflows/cost-alert.yml` — main workflow
- `scripts/azure-cost-check.sh` — reusable CLI script
- `.squad/skills/cost-alerting/SKILL.md` — extracted skill

## Activation

Requires two GitHub repo settings:
1. Secret `AZURE_CREDENTIALS` — Service Principal JSON
2. Variable `AZURE_SUBSCRIPTION_ID` — target subscription

Workflow gracefully skips if not configured.
