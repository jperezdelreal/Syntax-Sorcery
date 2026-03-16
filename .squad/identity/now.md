---
updated_at: 2026-03-16T10:26:00.000Z
focus_area: CityPulse Labs — Production live, Google Maps UX deployed. Function code deploy blocking Phase 5.
active_issues: [59, 60, 62, 63, 64, 65]
---

# What We're Focused On

**CityPulse Labs is LIVE** at https://icy-cliff-065550703.2.azurestaticapps.net — Google Maps-style UX deployed. **Blocker: Azure Function code not deployed** (`scmType: None` on `func-citypulse-api`). This blocks data collection → blocks Phase 5 (prediction).

## Actual State

- **SWA:** ✅ Live, CI/CD working (76 successful runs), Google Maps-style route UX deployed
- **Azure Functions:** ⚠️ App exists + running + RBAC configured, but **no code deployed**. Need `func azure functionapp publish` or CI/CD addition.
- **Cosmos DB:** ✅ Running (`cosmos-citypulse-neu`, North Europe), RBAC assigned to Function App managed identity
- **Function App identity:** `da723ed3-8f50-468f-b076-63969284425b` (SystemAssigned)
- **252+ tests passing**, build green

## Critical Next Step

**Deploy function code** to `func-citypulse-api`. The code exists at `api/src/functions/` (stationCollector timer trigger, stations, predict, weather endpoints). Once deployed, Timer Trigger will collect GBFS snapshots every 10 min to Cosmos DB. This unblocks Phase 5 (prediction, analytics, anomaly detection).

## Open Issues

13 open: #59 #60 (HIGH — function deploy), #62-#65 (Phase 5), #38 #39 (post-deploy verification), #42 #44 #47 #48 #49 (quality/polish)

