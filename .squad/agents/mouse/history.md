# Mouse — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** Astro, React, Tailwind CSS, GitHub Pages
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), Mouse (UI/UX), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

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
