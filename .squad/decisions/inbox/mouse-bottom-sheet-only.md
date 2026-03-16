# Decision: Mobile Bottom Sheet Only — No Duplicate Leaflet Popup

**By:** Mouse (UI/UX Designer)
**Tier:** T2 (Implementation)
**Date:** 2025-01
**Status:** ✅ COMPLETE — PR #81 merged

## Context

User reported duplicate info panels on mobile station tap: a Leaflet popup on the map AND a bottom sheet below it showing the same data. User directive (Spanish): "Me quedaría solo con el menú que sale del bottom. Que puedas deslizarlo para abajo y arriba facilmente con el dedo, más natural que andar dandole a aspas de cerrar."

## Decision

1. **Disable Leaflet popup on mobile** — `StationMarkers.tsx` conditionally renders `<StationPopup>` only on desktop via `useIsMobile()`.
2. **Remove ✕ close button from station info** — `MobileRoutePanel.tsx` no longer passes `onClose` to `<StationPanel>`. Swipe-down is the native mobile dismissal gesture.
3. **Swipe-down dismisses station info** — `handleTouchEnd` collapses sheet AND calls `onCloseStation()` when station-only (no routes). With routes, collapses to peek bar.

## Impact

- 2 files changed, 19 lines added, 6 removed
- All 356 tests pass
- Desktop popup behavior unchanged
- Mobile now has single information surface (bottom sheet only)

## Principle

Mobile should have ONE information surface. Duplicate panels and ✕ buttons are desktop patterns that feel wrong on touch devices. Swipe gestures are the native mobile language.
