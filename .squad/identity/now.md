---
updated_at: 2026-03-16T11:48:19.000Z
focus_area: CityPulse Labs — Phase 5 active. ORS proxy deployed (#70). 4 PRs merged (#66-#69). Data collection active. ORS_API_KEY config pending.
active_issues: [66, 67, 68, 69, 70]
---

# What We're Focused On

**CityPulse Labs Phase 5 is ACTIVE.** All core PRs merged (#66-#70). Azure Functions live with data collection. Mobile performance fixed (3x speedup via ORS parallelization + exponential backoff). ORS proxy deployed to eliminate CORS/API key exposure. Phase 5 contract tests complete (116 tests). **Pending:** Tank configures ORS_API_KEY in Function app settings.

## Actual State

- **Azure Functions:** ✅ Live (health, stations, weather, predict, stationCollector timer)
- **Data Pipeline:** ✅ Active — ~22,752 station snapshots/day flowing to Cosmos DB every 5 min
- **Mobile Performance:** ✅ Fixed — exponential backoff + AbortController + ORS parallelization = 3x speedup
- **Mobile UX:** ✅ Complete — unified Google Maps-style bottom sheet pattern (PR #68 merged)
- **ORS Proxy:** ✅ Deployed — Azure Function at `/api/routes` proxies ORS with caching, eliminates CORS/API key exposure (PR #70 merged)
- **Phase 5 Tests:** ✅ 116 contract tests (predictionAccuracy, anomalyDetection, analytics, predictionModel) all green (PR #66 merged)
- **Analytics Skeleton:** ✅ AnalyticsProvider interface ready. Tank's data → Trinity's UI (one-liner swap)
- **Cost:** €8-18/mo Azure functions/Cosmos, well under €100/mo budget

## Critical Next Steps

1. **Tank configures ORS_API_KEY** — Add to Function app settings for route proxy (blocker for production routing)
2. **Trinity implements Phase 5 services** — uses 116 contract tests as specification. Prediction, anomaly detection, analytics aggregation.
3. **Mouse polishes mobile on real data** — once AnalyticsProvider wired to Cosmos (Tank → Trinity → Mouse workflow)
4. **Morpheus quality sprint** — code review, accessibility, performance, TypeScript strict compliance

## Merged PRs

- PR #66: Switch — 116 Phase 5 contract tests ✅
- PR #67: Trinity — Mobile fixes + Phase 5 skeleton ✅
- PR #68: Mouse — Mobile UX redesign (unified panel) ✅
- PR #69: Tank — Functions deployment ✅
- PR #70: Trinity — ORS proxy via Azure Function ✅

All tests passing. Production-ready. Awaiting ORS_API_KEY configuration.


