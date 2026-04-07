# Mouse — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** Astro, React, Tailwind CSS, GitHub Pages
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), Mouse (UI/UX), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

### 2026-03: CityPulseLabs Mobile Bottom Sheet — Flexbox Scroll Trap

**Context:** Founder reported mobile users cannot scroll step-by-step route directions inside the expanded bottom sheet. Content was there but scroll was completely blocked.

**Root Cause:** CSS flexbox scroll trap — two compounding issues:
1. Outer container used `maxHeight` (not `height`). CSS spec: `height: 100%` on children doesn't resolve against `max-height`, only explicit `height`. The inner div's `h-full` had no definite height to resolve against → the inner div grew unbounded.
2. Content div had `flex-1 overflow-y-auto` but lacked `min-h-0`. Flexbox default `min-height: auto` prevents flex children from shrinking below content size. `overflow-y: auto` never triggered because the element was always tall enough.

**The Fix (PR #83):**
- Outer container: `maxHeight` → `height` + `overflow-hidden` (definite height for `h-full`)
- Content div: added `min-h-0` (allows flex child to shrink, activates overflow scroll)
- Transition: `max-height` → `height` animation property
- Tests updated: `style.maxHeight` → `style.height` assertions

**Lesson:** In flex column layouts, ALWAYS add `min-h-0` to any scrollable flex child. And never use `maxHeight` on a parent when children use `h-full` — use explicit `height` instead. This is the #1 most common CSS layout bug in bottom sheets.

### 2025-01: CityPulseLabs Mobile UX — Leaflet Z-Index Stacking Bug

**Context:** User reported search bar invisible on mobile. Screenshot showed ONLY the map and WelcomeCTA — no search bar at top.

**Root Cause:** CSS stacking context violation. The `<main>` wrapping MapView had `position: relative` but NO `z-index`, so it did NOT create a stacking context. Leaflet's internal z-indexes (tile pane: z-200, overlay pane: z-400, marker pane: z-600) "leaked out" and rendered ABOVE the search bar's z-[40].

**The Fix:** Added `z-[1]` to `<main className="flex-1 relative min-h-0 z-[1]">`. This creates a proper stacking context, constraining Leaflet's z-indexes within the map container. The search bar at z-[40] now renders ABOVE the entire map.

**Technical Insight:** Without a stacking context, child elements' z-indexes are compared globally against other positioned elements. With `z-[1]`, the map container itself is at z-1, and all Leaflet layers (z-200, z-400, z-600) are contained WITHIN that context. The search bar at z-[40] is in a different stacking context and renders above.

**Complete Fix Bundle (PR #77):**
1. Bottom sheet stays collapsed (peek bar) when routes arrive
2. Route cards in vertical list (Google Maps pattern)
3. Z-index unification (GeolocationButton, BikeTypeSelector)
4. Drag handle visual feedback during swipe
5. WelcomeCTA hides during route loading
6. **Leaflet stacking context** (search bar visibility bug)

**Outcome:** 21 new tests, 356 total passing. Google Maps alignment: 9/9. Mobile QA checklist provided.

**Lesson:** Always verify stacking context when positioning layers. `position: relative` alone does NOT create a stacking context — need `z-index` (or other triggers like `transform`, `opacity < 1`). Third-party UI libraries (Leaflet, Mapbox, etc.) often use high z-indexes internally; wrap them in a stacking context to prevent interference with app-level UI.

### 2026-03-19: Landing Page Design System (Phase 4)

Matrix-themed design system for Syntax Sorcery landing page. Established as specification for implementation team.

**Design System Elements:**
- Primary accent: `#00ff41` (Matrix green) on `#0a0a0a` backgrounds
- Glass utility: `backdrop-blur(12px)` with `rgba(17,17,17,0.8)` overlay
- Font stack: JetBrains Mono (terminal), Inter (body)
- Animation system: fade-in, slide-up, glow-pulse, float (all respect `prefers-reduced-motion`)
- Components defined: MatrixRain (canvas rain effect), TypeWriter (IntersectionObserver reveal), HowItWorks (3-step flow)

**Outcome:**
- PR #45 submitted 2026-03-19T02:00Z
- **Status: ❌ REJECTED** — zero implementation code (design spec only)
- Design blueprint is perfect and comprehensive; Trinity assigned for implementation
- PR #47 (Trinity implementation) merged 2026-03-19T04:00Z — full feature set delivered per design spec
- Issue #42 CLOSED via Trinity's work, not Mouse's design submission

**Quality Gate Lesson:** Design-only PRs fail merge gate. Implementation required. Process improvement: design specs as .squad/agents/X/history.md entries = perfect documentation but require separate implementation PR with actual code.

**Impact:** Landing page now has professional Matrix branding, pixel-perfect glassmorphism, and accessible animations. Design system ready for reuse across all SS pages.


### 2025-01: FFS Squad Monitor Complete Visual Overhaul

**Context:** User reported monitor UI as "horrible" and "desconectado" (disconnected/not working). Trinity built functional React SPA with 4 features, but aesthetics were ugly/default-looking.

**Mission:** Transform dashboard from ugly-but-functional into a sleek modern ops dashboard (Vercel/Linear/Raycast aesthetic).

**What I did:**
- Redesigned entire visual system with glassmorphism and modern dark theme
- Custom Tailwind theme: ops-specific colors (`#0a0e14` bg, `#151920` surfaces), custom animations
- Implemented `.glass` utility class with `backdrop-blur(8px)` and transparent overlays
- Created smooth animations: `fade-in`, `slide-up`, `pulse-glow` with staggered delays
- Redesigned all 4 core features:
  - **Activity Feed:** Timeline-style with colored repo dots, smooth entry animations, elegant empty states
  - **Pipeline Visualizer:** Gradient status cells (emerald=complete, amber=progress, red=blocked), hover effects, modal details
  - **Team Board:** Glowing agent cards with pulsing status indicators (green dot with ping animation), workload progress bars
  - **Cost Tracker:** HUGE celebratory €0 display (120px gradient text), prominent savings cards (€320/mo total)
- Enhanced header with pulsing connection indicator (green dot with ping = live, red = offline)
- Loading states: Skeleton screens instead of generic text
- Error states: Retry CTAs with helpful messages instead of console errors
- Empty states: Delightful messages with emoji (📭 "No activity yet")

**Design system:**
- **Colors:** Emerald (success), Cyan/Blue (primary), Amber (warning), Red (error)
- **Typography:** System sans-serif for UI, monospace for metrics/data
- **Spacing:** Generous padding (p-6), consistent gaps (gap-4)
- **Borders:** Subtle white/10 opacity borders
- **Shadows:** Colored glow effects on hover (shadow-cyan-500/25)
- **Animation philosophy:** Subtle, purposeful, never distracting

**Technical:**
- Extended `tailwind.config.js` with custom colors, animations, keyframes
- Enhanced `index.css` with custom scrollbars, utility classes
- All components now use consistent glass design pattern
- Build successful: 181kb JS bundle (acceptable for dashboard)
- No breaking changes to data flow, hooks, or API calls

**"Desconectado" fix:**
- Added visual connection status in header (pulsing green dot = live)
- Implemented proper error handling with retry buttons
- Graceful fallback UI when data fetch fails
- Clear "last updated" timestamp with clock icon

**Learnings:**
- Users judge with their eyes FIRST — if it looks ugly, they assume it's broken even if functional
- Loading states need personality (skeletons > spinners > generic text)
- Empty states are opportunities to delight, not just say "no data"
- Connection status MUST be visual (pulsing dot) not just text
- Cost savings deserve celebration — make €0 HUGE and proud with gradients/emojis
- Consistent design language across all views creates professional feel
- Glassmorphism + dark theme = instant premium perception

### 2026-03-22: Dashboard Design System (#111)

**Context:** Monitoring dashboard needs a visual spec for Trinity to implement. Issue #111.

**What I did:**
- Created `docs/design/dashboard-design-system.md` — full Matrix-themed design spec covering color palette (8 semantic tokens), typography (JetBrains Mono headings, system-ui body, KPI glow effect), 6 animation specs (pulse, data refresh, pipeline flow, status transitions, matrix rain, reduced motion), 4 component specs (Repo Card, KPI Widget, Pipeline Stage, Activity Feed Item) with ASCII wireframes, responsive breakpoints (3/2/1 column), and accessibility notes (WCAG AA, reduced motion, focus states)
- Created `site/src/styles/design-tokens.css` — 50+ CSS custom properties implementing every design token: colors, typography scale, spacing, radii, shadows/glows, transitions, component sizes, grid system, z-index layers, plus responsive grid and dashboard-specific keyframe animations
- Extended existing landing page design language (same `#0a0a0a` bg, `#00ff41` green, glass utility) into dashboard-specific patterns

**Outcome:**
- PR #122 submitted
- Both spec doc and implementation tokens included — learned from PR #45 rejection that design-only PRs fail merge gate
- Design tokens are immediately consumable: Trinity can `@import 'design-tokens.css'` and reference `var(--text-primary)` etc.

**Learnings:**
- Include implementation artifacts (CSS tokens) alongside spec docs — spec-only PRs get rejected
- Align new design tokens with existing `global.css` theme to avoid conflicts
- ASCII wireframes in spec docs communicate layout intent better than prose descriptions
- Accessibility must be baked into the spec, not an afterthought — contrast ratios, reduced motion, focus states all specified upfront

### 2026-03-16: CityPulseLabs Mobile UX Redesign — Google Maps-style Unified Panel

**Context:** User feedback (verbatim Spanish): mobile experience is "far from Google Maps", routes slow to load, "failed to fetch" errors, and suggestion to unify search+routes into one panel. Desktop was "bastante guapo" (quite nice). Issue: jperezdelreal/CityPulseLabs.

**What I did:**
- Created `src/components/UnifiedPanel/UnifiedPanel.tsx` — Google Maps-style bottom sheet combining search bar + route results + station info into one cohesive panel
- Created `src/components/UnifiedPanel/RouteSkeleton.tsx` — shimmer/skeleton loading animation replacing generic spinner
- Restructured `src/App.tsx` — removed floating SearchBar and separate aside, replaced with unified panel
- Added `retry()` function to `useRoutes` hook for error recovery
- Added friendly error state with retry button ("😵 No pudimos calcular las rutas" + connection hint)

**Mobile bottom sheet behavior:**
- Collapsed by default: shows just `🔍 ¿A dónde quieres ir?` peek (76px)
- Tap to expand: reveals origin/destination fields + route results
- Drag handle with swipe gestures (up to expand, down to collapse)
- Auto-expands when routes load, station selected, or map clicked
- `overscroll-behavior: contain` prevents scroll-through to page
- Max-height 75vh when expanded, scrollable content section

**Map click → fills form:**
- Clicking map auto-fills origin (first click) or destination (second click)
- Shows "📍 Punto en el mapa" in the search field
- Geolocation shows "📍 Mi ubicación"
- Used ref flags (`originSetBySearch`/`destSetBySearch`) to distinguish search-set vs map-set coordinates

**Desktop preserved:**
- Side panel with integrated search at top (360px/400px)
- Same layout philosophy but search now part of the panel instead of floating overlay
- User said desktop "looks great" — kept the aesthetic

**Technical decisions:**
- Kept original `SearchBar.tsx` untouched (tests import it directly)
- Reused existing `RoutePanel` and `StationPanel` as sub-components in unified panel
- Skeleton shimmer via CSS `background-size: 200%` animation (no JS shimmer library)
- Repositioned WelcomeCTA (z-index 30, bottom-24 mobile) and GeolocationButton (bottom-24) above bottom sheet

**Outcome:**
- PR #68 in jperezdelreal/CityPulseLabs on branch `squad/mobile-ux-redesign`
- Build passes, all 218 tests pass (2 pre-existing backend test failures unrelated)
- 681 lines added, 73 removed across 8 files

**Learnings:**
- Bottom sheets > sidebars for mobile map apps — users expect the Google Maps pattern
- Skeleton/shimmer loading creates perception of speed even when actual load time doesn't change
- Error states with retry buttons are essential for flaky network APIs — users need agency, not just error text
- Ref flags are the cleanest React pattern for distinguishing internal vs external state changes
- `overscroll-behavior: contain` is a CSS one-liner that prevents the frustrating scroll-through problem on bottom sheets
- Always position floating elements (CTAs, buttons) above the bottom sheet z-layer on mobile — `bottom-24` + lower z-index

**Cross-agent note (2026-03-16 Phase 5):**
- Trinity fixed "failed to fetch" root cause (secondary API calls lacked retry/timeout). Mobile experience now faster (3x via ORS parallelization).
- Tank deployed functions (PR #69) — Timer collecting station snapshots. API endpoints live.
- Switch built 116 contract tests (PR #66) — defines Phase 5 shape. Trinity will implement against these.
- Mouse's UX work is orthogonal — bottom sheet pattern is independent of analytics data.

### 2026-07: CityPulseLabs Mobile-Specific UX Redesign — PR #72

**Context:** User feedback (verbatim Spanish): mobile touch experience broken, origin/destination input not visible, "adapting desktop to mobile is an error" — mobile needs its OWN design, not responsive adaptation. Also: hide Turbo/BOOST (unavailable bikes), fix desktop banner, fix button text disappearing bug.

**What I did:**
- Created `src/hooks/useIsMobile.ts` — platform detection hook (matchMedia-based, jsdom-safe)
- Created `src/components/SearchBar/MobileSearchBar.tsx` — touch-first search bar with 48px targets, 16px font (prevents iOS zoom), full-width autocomplete overlay
- Created `src/components/RoutePanel/MobileRoutePanel.tsx` — bottom sheet with peek bar, swipe gestures, horizontal snap-scrolling route cards, step-by-step expandable
- Rewrote `src/App.tsx` — completely separate component trees for mobile vs desktop via `useIsMobile()` (NOT responsive breakpoints)
- Stripped mobile code from `UnifiedPanel.tsx` — now desktop-only
- Commented out BOOST option in `BikeTypeSelector.tsx` (one-line, code preserved)
- Fixed desktop header: replaced green gradient with clean white + border
- Fixed button text bug: CSS cascade issue where header's `text-white` was leaking into BikeTypeSelector children; fixed with explicit per-state colors
- Added mobile CSS: safe-area-inset-top, overscroll containment, zoom prevention

**Mobile design principles applied:**
- Full-screen map with floating search at top (Google Maps pattern)
- Bottom sheet for results — peek bar when collapsed, 65vh when expanded
- Touch targets >= 48px everywhere
- Swipe-to-expand/collapse gestures on drag handle
- Auto-expand when routes load or station selected
- `overscroll-behavior: contain` prevents scroll-through to map
- `font-size: 16px` on inputs prevents iOS auto-zoom
- iOS safe area support via `env(safe-area-inset-top)`

**Outcome:**
- PR #72 in jperezdelreal/CityPulseLabs on branch `squad/mobile-specific-ux`
- Build passes, TypeScript clean, 333 tests pass (2 pre-existing backend failures unrelated)
- 821 lines added, 170 removed across 9 files

**Learnings:**
- Users distinguish between "responsive" and "mobile-specific" — adapting desktop is perceived as lazy/broken even when technically functional
- CSS cascade bugs in Tailwind v4: parent `text-white` can bleed into child components that set their own text colors — always use explicit per-state colors
- `matchMedia` not available in jsdom — hooks must guard with `typeof window.matchMedia !== 'function'`
- 16px minimum font size on mobile inputs is non-negotiable — anything smaller triggers iOS Safari zoom
- Separate component trees > responsive classes for fundamentally different experiences (search at top vs side panel, bottom sheet vs sidebar)

## Cross-Agent Updates (2026-03-21)

**Trinity (PR #71 — ORS Call Reduction):** Reduced 18→9 calls per route. Cache optimization: 5min TTL, 110m precision rounding. All 335 tests passing. Free tier capacity doubled (~222 routes/day). Production-ready.

**Morpheus (ORS Evaluation):** Self-hosted ORS rejected (€52–70/mo). Recommendation: Trinity's call reduction path forward. Re-evaluate v0.2 if traffic >500 routes/day.

**Cross-Phase Note:** Mobile UX (PR #72) orthogonal to analytics (Phase 5 tests). Mobile complete; Trinity will wire real Cosmos data via AnalyticsProvider.

### 2026-07: CityPulseLabs Mobile UX Audit — Phase 1 Iterative Feedback Process

**Context:** User feedback that mobile UX "still isn't right" after PR #72 (mobile-specific UX redesign). User requests iterative, human-in-loop process to "fix it for real" with approval at each stage. This is Phase 1: comprehensive audit only, no code changes yet.

**What I did:**
- Read all mobile-related code: `useIsMobile.ts`, `MobileSearchBar.tsx`, `MobileRoutePanel.tsx`, `App.tsx` (mobile tree), `GeolocationButton.tsx`, `BikeTypeSelector.tsx`
- Reviewed E2E tests (mobile.spec.ts, desktop.spec.ts) — 10 mobile test cases covering touch targets, layout, swipe interactions
- Analyzed decisions.md context: PR #72 (mobile-specific UX), PR #73 (cache busting), PR #74 (Playwright tests + QA checklist)
- Ran test suite: 333 unit tests passing, no regressions
- Examined CSS: safe-area-inset, overscroll containment, 16px font inputs, webkit-tap-highlight

**Findings:**
1. **Architecture:** Separate mobile/desktop component trees (NOT responsive) — correct approach ✅
2. **Touch targets:** >= 48px everywhere in mobile tree (MobileSearchBar inputs, buttons, route cards) ✅
3. **Bottom sheet:** Proper peek/expand behavior, swipe gestures, overscroll containment ✅
4. **Z-index layering:** Search z-40, welcome CTA z-30, bike selector z-35, route panel z-45 — potential conflict area
5. **Geolocation button:** Fixed at bottom-24, z-1000, conflicts with bottom sheet positioning (both at "bottom-24")
6. **Welcome CTA (mobile):** Shows at bottom-28 with z-30, covered by bottom sheet (z-45) when expanded
7. **Text sizing:** 16px on inputs (iOS zoom prevention) ✅, but no `text-base` consistency on other mobile UI elements
8. **Accessibility:** Touch targets meet WCAG 2.5.5 (44px minimum), tests enforce this ✅
9. **Horizontal scroll:** E2E test verifies no overflow-x ✅

**Problems Detected:**
- **Z-index conflicts:** Geolocation button (z-1000) vs bottom sheet (z-45) — no visual stacking issues but inconsistent scale
- **Bottom positioning:** Both GeolocationButton and MobileRoutePanel use `bottom-24`, may overlap when sheet is collapsed
- **Bike selector positioning:** Floating at `top-[140px]` (hardcoded), not responsive to safe-area or search bar height
- **No haptic feedback:** Touch interactions lack iOS/Android haptic feedback patterns (vibration on tap)
- **Missing states:** No "dragging" visual feedback during bottom sheet swipe
- **Route card snap:** Horizontal scroll snap works but no visual indicator which card is "active" beyond border color
- **Search autocomplete z-index:** Results overlay is inside search bar container (z-40), may be covered by other floating elements

**Benchmarked vs Google Maps Mobile:**
- Google Maps: Unified bottom sheet with drag handle, search at top inside sheet, 1-tap to expand ✅ (we have this)
- Google Maps: Route cards are vertical list, not horizontal scroll ⚠️ (we differ)
- Google Maps: Clear visual hierarchy — search > content > map ✅ (we have this)
- Google Maps: Bottom sheet starts collapsed (tiny peek) ⚠️ (ours auto-expands, maybe too aggressive)
- Google Maps: Floating action buttons (geolocation, layers) always visible at fixed positions ⚠️ (ours may be covered)

**Learnings:**
- User perception of "not right" often comes from z-index conflicts and micro-interaction smoothness, not major architectural flaws
- Horizontal swipe for route cards is unconventional (Google uses vertical list) — may feel "off" to users expecting standard pattern
- Auto-expanding bottom sheet may be intrusive — Google Maps keeps it collapsed until user explicitly drags
- Fixed positioning on mobile requires careful z-index choreography to avoid elements covering each other

### 2026-07: CityPulseLabs Mobile UX Fix — Less Aggressive Bottom Sheet + Vertical Route List

**Context:** User feedback after mobile audit that identified two highest-impact UX issues. User approved both fixes. This is iterative improvement on top of PR #72 (mobile-specific UX).

**What I changed:**

**Fix 1: Bottom Sheet Auto-Expand Behavior**
- **Before:** Bottom sheet auto-expanded to 65vh whenever routes arrived (useEffect on routesWithConfidence.length)
- **After:** Sheet stays COLLAPSED (peek bar ~80px) when routes arrive. Only auto-expands when user taps a specific station (selectedStation change).
- **Peek bar enhancement:** Now shows "X rutas disponibles · ~Y min" summary plus "Toca para ver" hint, so users know routes are ready but have control over when to expand.
- **Rationale:** Google Maps pattern — bottom sheet stays collapsed until user explicitly interacts. Auto-expand on routes was intrusive and interrupted map browsing.

**Fix 2: Route Cards Layout — Horizontal → Vertical**
- **Before:** Horizontal scroll container (`overflow-x-auto snap-x snap-mandatory`) with pagination dots below
- **After:** Vertical stack (`space-y-3`), full-width route cards, selected route highlighted with 3px left border (`border-l-[3px] border-primary-500`) + `bg-primary-50/30`
- **Removed:** Pagination dots, horizontal scroll ref, handleScroll callback
- **Kept:** All card content (duration, stations, confidence badges, time saved), touch targets ≥48px, swipe gestures on drag handle
- **Rationale:** Vertical list is the standard mobile pattern (Google Maps, Citymapper, Transit). Horizontal swipe felt unconventional and hidden — users didn't realize they could scroll sideways.

**Code changes:**
- `MobileRoutePanel.tsx` lines 100-109: Removed auto-expand useEffect on routes, kept only selectedStation trigger
- `MobileRoutePanel.tsx` lines 169-185: Enhanced peek bar summary text
- `MobileRoutePanel.tsx` lines 230-313: Replaced horizontal scroll container with vertical `<div className="px-4 space-y-3 pb-3">`, changed route cards from `<div>` to `<button>` with `border-l-[3px]` highlight
- `MobileRoutePanel.tsx` lines 315-329: Deleted pagination dot indicators
- `MobileRoutePanel.tsx` lines 81-144: Removed unused `scrollRef` and `handleScroll` callback
- `MobileRoutePanel.tsx` lines 1-10: Updated file header comment (removed "Swipeable horizontal cards")

**Outcome:**
- All 335 tests passing (2 pre-existing Azure Functions import failures unrelated)
- No breaking changes to functionality
- User now has more control over bottom sheet expansion
- Route comparison is clearer with vertical list + left border highlight

**Learnings:**
- Auto-expand on data arrival = intrusive. Users prefer explicit control (tap/swipe).
- Horizontal scroll on mobile requires visual affordance (visible overflow, arrows) — otherwise users don't discover it
- Vertical list > horizontal scroll for route cards — matches user mental model from other transit apps

### 2026-07: CityPulseLabs Mobile UX Fix — Z-Index + Geolocation Positioning + Visual Feedback (Fixes 3-5)

**Context:** Continuing iterative mobile UX improvements after Fixes 1-2 (bottom sheet behavior + vertical route list). User approved 3 remaining fixes from mobile audit. User says "no puedo probar, pero sigue con los fixes" (can't test, but continue with fixes).

**What I changed:**

**Fix 3: Z-Index Unified + Geolocation Button Positioning**
- **GeolocationButton.tsx line 78:** Reduced z-index from `z-[1000]` to `z-50` for consistency with global stacking scale
- **GeolocationButton.tsx line 78:** Moved position from `bottom-24` to `bottom-32` to prevent overlap with MobileRoutePanel peek bar (80px height)
- **App.tsx line 207:** Fixed BikeTypeSelector positioning from hardcoded `top-[140px]` to `top-20` (more flexible, relative to safe area)
- **Z-index scale now consistent:**
  - MobileRoutePanel: z-[45] (highest — bottom sheet overlays everything)
  - MobileSearchBar: z-[40] (search bar — above map, below sheet)
  - BikeTypeSelector: z-[35]
  - WelcomeCTA: z-[30]
  - GeolocationButton: z-50 (inside MapView's stacking context)

**Fix 4: Visual Feedback During Bottom Sheet Swipe**
- **MobileRoutePanel.tsx line 83:** Added `isDragging` state (useState boolean)
- **MobileRoutePanel.tsx line 106:** Set `isDragging = true` on `onTouchStart`
- **MobileRoutePanel.tsx line 110:** Set `isDragging = false` on `onTouchEnd`
- **MobileRoutePanel.tsx line 138:** Changed drag handle bar from static `bg-gray-300` to dynamic `${isDragging ? 'bg-gray-400 scale-x-110' : 'bg-gray-300'}` with `transition-all`
- **Result:** Drag handle darkens and slightly expands when user touches it, providing immediate tactile feedback that the sheet is responding

**Fix 5: WelcomeCTA Hide During Loading**
- **App.tsx line 174:** Added `routeLoading` to WelcomeCTA hide condition
- **Before:** `{!hasActiveContent && !loading && stations.length > 0 && !mobileActiveField && (`
- **After:** `{!hasActiveContent && !loading && !routeLoading && stations.length > 0 && !mobileActiveField && (`
- **Result:** WelcomeCTA now hides when routes are loading, preventing brief overlap where CTA is visible behind the loading bottom sheet

**Outcome:**
- All 335 tests passing (2 pre-existing Azure Functions import failures unrelated)
- No breaking changes to functionality
- Z-index conflicts resolved — all floating elements now follow consistent stacking order
- Geolocation button no longer overlaps with bottom sheet peek bar
- Bottom sheet swipe gesture now has visual feedback
- WelcomeCTA no longer briefly visible during route loading

**Learnings:**
- Z-index conflicts create subtle "something feels off" perception even when elements don't visually overlap — consistency matters
- `top-[140px]` hardcoded positioning breaks when search bar height changes (safe area, dynamic content) — use relative Tailwind scales (top-20) instead
- Tactile feedback on touch gestures (isDragging state) makes interactions feel responsive even before the action completes
- Loading states should hide all non-essential UI elements to avoid visual clutter and overlap artifacts
- `scale-x-110` is the perfect subtle transform for horizontal drag handles — enough to be noticed, not enough to be distracting
- Peek bar must be informative enough to convey "routes are ready" without forcing expansion
- "Toca para ver" (tap to view) hint reduces confusion when sheet stays collapsed
- 3px left border is a subtle but effective selected-state indicator (doesn't require background color change alone)

### 2025-01: CityPulseLabs Mobile UX — Bottom Sheet Only (No Duplicate Popup)

**Context:** User tapped a station on mobile and saw TWO info panels: a Leaflet popup on the map AND a bottom sheet below it, both showing the same station data. User said (Spanish): keep only the bottom sheet, make it swipeable, remove ✕ buttons.

**Three Changes (PR #81):**
1. **Disable Leaflet popup on mobile** — `StationMarkers.tsx` now calls `useIsMobile()` and conditionally renders `<StationPopup>` only when `!isMobile`. Desktop popups unchanged.
2. **Remove ✕ close button** — `MobileRoutePanel.tsx` no longer passes `onClose` to `<StationPanel>`, so no close button renders. Swipe-down on drag handle is the natural mobile dismissal gesture.
3. **Swipe-down dismisses station info** — `handleTouchEnd` in `MobileRoutePanel.tsx` now collapses the sheet AND calls `onCloseStation()` when swiping down with station-only content (no routes). If routes exist, swipe-down collapses to peek bar.

**Key Insight:** Duplicate information panels are a common anti-pattern when adapting desktop patterns (Leaflet popups) to mobile. Mobile should have ONE information surface — the bottom sheet — and all interactions should route through it. Close buttons (✕) feel janky on mobile; swipe gestures are the native language.

**Files Changed:** `StationMarkers.tsx`, `MobileRoutePanel.tsx`
**Tests:** All 356 pass, no regressions.
