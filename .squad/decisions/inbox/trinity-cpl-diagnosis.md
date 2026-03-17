# CPL Route Service Diagnosis — Fix Applied

**By:** Trinity (Full-Stack Developer)  
**Date:** 2026-03-17T14:20Z  
**Tier:** T2 (Implementation)  
**Status:** ✅ ROUTES FIXED — Data pipeline needs Tank

## What Was Broken

1. **"Route service not configured" (503)** — The SWA managed API served the `/api/routes` function but couldn't find `ORS_API_KEY` in its environment. The key was set on the standalone function app (`func-citypulse-api`), not on the SWA.

2. **Variable name mismatch** — SWA had `VITE_ORS_API_KEY` (client-side prefix). The server-side proxy reads `ORS_API_KEY` (no `VITE_` prefix).

## What Was Fixed

1. Set `ORS_API_KEY` as SWA app setting (correct resource, correct name)
2. Redeployed SWA with managed API to propagate the new setting
3. Deployed routes function to standalone function app (for future linked-backend use)
4. Verified: Routes return 200 with full GeoJSON data through SWA ✅
5. Verified: Health returns 200 with cosmos:configured ✅

## What Still Needs Fixing (Tank)

1. **Standalone function app container instability** — Multiple deployments/restarts caused a container restart loop. The function app returns 404 for all HTTP endpoints. Needs a clean redeployment.
2. **stationCollector timer is DOWN** — Timer trigger depends on the standalone function app being healthy. No Cosmos writes since ~midnight March 17.
3. **deploy-functions.yml needs OIDC secrets** — `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` never configured as GitHub repo secrets. CI/CD for standalone function app has never run.

## Architecture Note

The CPL API has two hosting layers:
- **SWA managed API** (`--api-location ./api`): HTTP functions — takes precedence over linked backend
- **Standalone function app** (linked backend): Timer triggers only

Environment variables must be set on the **correct resource**:
- HTTP function env vars → SWA app settings (`az staticwebapp appsettings set`)
- Timer function env vars → Function app settings (`az functionapp config appsettings set`)
