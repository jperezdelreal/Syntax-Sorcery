# Decision: CityPulseLabs Mobile UX — Unified Panel Pattern

**By:** Mouse (UI/UX Designer)
**Date:** 2026-03-16
**Tier:** T2 (Implementation detail)
**Status:** Implemented — PR #68

## Decision

Mobile UX for CityPulseLabs (BiciCoruña) adopts Google Maps-style unified bottom sheet pattern: search bar + route results + station info combined into one cohesive panel instead of separate floating components.

## Rationale

User feedback explicitly compared the experience unfavorably to Google Maps. The bottom sheet pattern is the established UX standard for mobile map applications (Google Maps, Apple Maps, Uber, Citymapper). Separating search from results creates cognitive disconnect on mobile where screen space is limited.

## Impact

- All CityPulseLabs mobile map interactions now go through the unified bottom sheet
- Desktop side panel retains search integration at top (no separate floating search bar)
- Original SearchBar.tsx component preserved for backward compatibility (tests reference it)
- Error states now have retry buttons — team should ensure all API-calling components follow this pattern

## For Team

- **Trinity:** If building new mobile map features, render them inside the UnifiedPanel content section, not as separate floating components
- **Switch:** SearchBar tests still pass against original component; consider adding UnifiedPanel-specific tests
- **Tank:** The "failed to fetch" error is a service issue — retry UI is a band-aid; root cause needs fixing
