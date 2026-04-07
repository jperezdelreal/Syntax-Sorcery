# Mouse — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** Astro, React, Tailwind CSS, GitHub Pages
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), Mouse (UI/UX), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Focus:** CityPulseLabs mobile UX, landing page design system, dashboard design

## Key Learnings (Distilled from 6+ Weeks)

**Mobile UX Patterns:**
- **Bottom sheets > sidebars** on mobile map apps — users expect Google Maps pattern (peek bar → drag to expand → swipe-down dismisses).
- **One info surface:** Mobile should have single information surface. Remove duplicate panels (Leaflet popup + bottom sheet). Desktop popups remain unchanged.
- **Skeleton/shimmer loading** creates perception of speed. CSS `background-size: 200%` animation sufficient.
- **Error states with retry buttons** essential for flaky APIs — users need agency. "😵 No pudimos..." messaging with helpful hints.
- **Ref flags** (`originSetBySearch`, `destSetBySearch`) cleanest React pattern for distinguishing internal vs external state.
- **`overscroll-behavior: contain`** prevents frustrating scroll-through on bottom sheets.

**CSS & Layout Bugs:**
- **Flexbox scroll trap:** Inner `h-full` needs explicit parent `height` (not `max-height`). Child needs `min-h-0` to trigger `overflow-y: auto`.
- **Stacking context:** `position: relative` alone does NOT create stacking context — need `z-index` (or `transform`, `opacity < 1`). Leaflet's z-indexes (z-200, z-400, z-600) leak out without wrapping context. Added `z-[1]` to `<main>` to contain them.
- **Service worker cache busting:** Missing cache busting causes stale assets. PR #73 (Tank) + PR #74 (Switch) fixed via `skipWaiting + clientsClaim`.

**Design System:**
- **Landing page Matrix theme:** `#00ff41` (Matrix green) on `#0a0a0a`, JetBrains Mono (terminal), glass utility (`backdrop-blur(12px)`), animations (fade-in, slide-up, glow-pulse) with `prefers-reduced-motion` respect.
- **Design-only PRs fail merge gate** — learned from PR #45 rejection. Always include implementation artifacts (CSS tokens, component code) alongside specs.
- **Dashboard design tokens:** 50+ CSS custom properties in `design-tokens.css` (colors, typography, spacing, radii, shadows, animations). Immediately consumable via `var(--text-primary)` etc.
- **Glassmorphism + dark theme = instant premium perception.** Users judge with eyes FIRST.

**Mobile UX Fixes (Completed):**
1. **Bottom sheet flex scroll trap (PR #83):** `max-height` → `height`, added `min-h-0` on content
2. **Leaflet z-index stacking (PR #77):** Added `z-[1]` context wrap, search bar now visible
3. **Duplicate popups removed (PR #81):** Disable Leaflet on mobile, remove ✕ buttons, swipe-down dismisses
4. **Remove WelcomeCTA during loading:** Hidden during route calculation
5. **DragHandle visual feedback (isDragging):** Opacity + cursor changes

**Latest (2026-07-09):**
- Vercel AI SDK decision impacts future B2C dashboard UX (Angular vs React decision now locked).

---

*Detailed session logs from 6+ weeks archived in history-backup-2026-07-09.md for reference.*
