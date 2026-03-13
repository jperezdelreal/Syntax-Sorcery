# Devlog System Design Decisions

**Date:** 2026-03-17  
**By:** Oracle (Product & Docs)  
**Context:** B2 — Daily Auto-Generated Devlog Implementation

## Key Design Choices

### 1. **Daily vs. Weekly Generation**
**Decision:** Daily generation (02:00 UTC)  
**Rationale:** User directive specified "devlog DIARIO (no semanal)". Team works 24/7, daily cadence shows momentum better than weekly batches.

### 2. **Data Aggregation Approach**
**Decision:** GitHub GraphQL API for issues/PRs, REST API for deployments  
**Rationale:** GraphQL offers efficient filtering (since/closedAt), REST API required for deployment events. Both work with GITHUB_TOKEN (public repos).

### 3. **Day Counter Reference**
**Decision:** Day N counted from 2026-03-16 (Phase 2 approval date)  
**Rationale:** Meaningful baseline for autonomy era. Provides context for "Day 1 of autonomy" narrative.

### 4. **Repo Color Coding**
**Decision:** Distinct color per repo (purple=SS, blue=FFS, green=flora, yellow=ComeRosquillas, red=monitor)  
**Rationale:** Visual scanning at a glance. Matches constellation diversity.

### 5. **Event Type Icons**
**Decision:** ✅ issues, 🔀 PRs, 🚀 deploys, 📋 decisions  
**Rationale:** Universal symbols, no cognitive load. Emoji work across all platforms.

### 6. **90-Day Retention**
**Decision:** Keep last 90 entries in devlog.json  
**Rationale:** Balance between meaningful history and file size. 90 days ≈ one quarter of activity.

### 7. **Workflow Trigger: Daily + Manual**
**Decision:** `schedule: cron '0 2 * * *'` + `workflow_dispatch`  
**Rationale:** Daily automation ensures freshness. Manual trigger enables testing and backfills.

### 8. **Navigation Placement**
**Decision:** Top nav link + homepage section (dual promotion)  
**Rationale:** Devlog is P0 visibility asset. Homepage promotes "team works 24/7" narrative. Nav ensures discoverability.

### 9. **Cost Constraint**
**Decision:** GitHub Actions free tier only (no Azure)  
**Rationale:** User directive "€0 sin Azure ACI". Public repos = unlimited Actions minutes.

### 10. **Integration with Existing Site**
**Decision:** Reuse Layout.astro, match existing color scheme, consistent typography  
**Rationale:** Seamless UX. Trinity built base theme (B1), devlog extends it without redesign.

## Alternative Approaches Considered

- **Webhook-based (realtime):** Rejected — overkill for daily cadence, requires server (€ cost).
- **Manual curation:** Rejected — user explicitly wants zero manual writing.
- **RSS feed:** Deferred — devlog.json structure enables this later (feed.xml generation).
- **Separate devlog repo:** Rejected — consolidation within FFS reduces fragmentation.

## Success Criteria (Per Task Brief)

✅ Route `/devlog` on FFS GitHub Page  
✅ Chronological feed with timestamps, grouped by repo  
✅ Styling consistent with FFS site  
✅ Script aggregates 4 data sources (issues, PRs, deploys, decisions)  
✅ Output: `src/data/devlog.json`  
✅ GitHub Actions workflow (daily 02:00 UTC + manual)  
✅ Cross-repo access via GITHUB_TOKEN  
✅ Navigation link + homepage promotion  
✅ `npm run build` still works (verified)  
✅ Cost: €0

## Future Enhancements (Out of Scope for B2)

- RSS/Atom feed generation
- Weekly summary emails (if user wants notifications)
- Contribution graphs (commits per repo over time)
- Sentiment analysis on PR titles (detect friction patterns)

## Notes

This system forms the backbone of FFS visibility strategy. Fully automated, zero maintenance. When repos scale to 10+, consider pagination or filtering UI. JSON structure supports future pivots (e.g., per-agent view, milestone tracking).
