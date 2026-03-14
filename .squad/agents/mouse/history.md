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
