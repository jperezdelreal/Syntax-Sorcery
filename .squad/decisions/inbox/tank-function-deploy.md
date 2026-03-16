# Decision: Azure Functions Deployment for CityPulseLabs

**Date:** 2026-03-16T11:20Z
**By:** Tank (Cloud Engineer)
**Tier:** T2 (Implementation)
**Status:** ✅ COMPLETE
**References:** #59, #60, PR #69

## What

Deployed all Azure Function code to `func-citypulse-api` and activated timer trigger data collection. This was the Phase 5 blocker.

## Key Decisions

1. **EasyAuth disabled** — The Function App had EasyAuth v2 enabled with `requireAuthentication: true`, blocking all unauthenticated requests. Disabled for public API access since functions use `authLevel: 'anonymous'`.
2. **Timer trigger at 5-minute intervals** — Changed from `*/10` to `*/5` per spec. ~79 stations × 288 snapshots/day = ~22,752 Cosmos writes/day. Within Serverless tier budget.
3. **Managed Identity for Cosmos** — Uses `ManagedIdentityCredential` with `COSMOS_ENDPOINT` (no connection strings). More secure.
4. **CI/CD via OIDC** — Created `deploy-functions.yml` using `azure/login@v2` with OIDC (not publish profile). Requires GitHub secrets setup.
5. **Missing data alert** — Azure Monitor metric alert at severity 2: fires if zero function executions in 15-minute window.

## Cost Impact

- Function executions: ~22,752 writes/day to Cosmos + HTTP proxy calls. Consumption plan — estimated €2-5/mo.
- Cosmos DB: ~22,752 RUs/day for upserts (1 RU per write × batched). Within Serverless €5-12/mo estimate.
- Total CityPulseLabs Azure: estimated €8-18/mo, well under €100/mo budget.

## Team Impact

- Frontend (Trinity): All API endpoints now live at `https://func-citypulse-api.azurewebsites.net/api/{health,stations,weather,predict}`
- CI/CD: joperezd needs to configure AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID secrets for automated deploys
