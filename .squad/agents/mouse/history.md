# Mouse — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** Astro, React, Tailwind CSS, GitHub Pages
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), Mouse (UI/UX), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

### 2026-01-10: FirstFrame Studios Redesign
- **Context:** joperezd requested redesign of FirstFrameStudios GitHub Pages site — said it was "muy de ingeniero, poco estética" (too engineer-y, not aesthetic enough)
- **Goal:** Transform from functional prototype to premium indie game studio aesthetic
- **Approach:** Complete visual overhaul while maintaining all functionality
- **Design decisions:**
  - **Color palette:** Shifted from generic gray/purple to vibrant cyan/purple/pink neon accents on deep dark backgrounds (#0a0e27 base)
  - **Glassmorphism:** Implemented blur effects and transparent overlays for modern premium feel
  - **Typography:** Added Inter font, increased hierarchy with bold displays, better spacing
  - **Animations:** Floating elements, glow effects, smooth hover transforms, slide-up intros
  - **Hero section:** Animated gradients, visual depth with overlapping blur circles, stronger CTAs
  - **Game cards:** Two-column layout with depth (shadows, gradients), hover scale effects, visual thumbnails
  - **Navigation:** Sticky with backdrop blur, animated devlog button with gradient
  - **Footer:** Proper multi-column layout with sections, better information architecture
- **Technical implementation:**
  - Updated Tailwind config with custom colors, animations, keyframes
  - Added Google Fonts integration for Inter
  - Created reusable CSS classes (.glass, .glass-dark, .text-glow)
  - Maintained accessibility and performance (Lighthouse goals)
- **Results:** Site now has premium indie studio vibe (Devolver Digital / Supergiant Games aesthetic) instead of basic template look
- **Build:** Successful — all pages built cleanly, no errors
- **Deployment:** Pushed to main, will auto-deploy via GitHub Actions

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

### 2026-03-19: Syntax Sorcery Landing Page — Matrix-Themed Visual Upgrade

**Context:** Issue #42 — Ralph requested "marketing y estética" during autonomous 8h session while founder sleeps.
**Goal:** Transform SS landing page from functional engineer-site to premium Matrix-themed showcase.

**Design decisions:**
- **Color system:** Matrix green (#00ff41) as primary accent on deep black (#0a0a0a), monochromatic with emerald tones
- **Typography:** JetBrains Mono for terminal/code feel, Inter for readability, strong hierarchy
- **Matrix Rain:** Pure CSS/JS canvas animation — Japanese katakana + hex chars, 12% opacity, subtle not overwhelming
- **Glassmorphism:** `.glass` utility with backdrop-blur(12px), subtle white borders (6% opacity)
- **Hero:** Full-viewport with Matrix rain background, floating ⟨SS⟩ logo mark, TypeWriter tagline, dual CTAs
- **How It Works:** 3-step flow with timeline connector, terminal code snippets, staggered fade-ins
- **Constellation:** Live data from constellation.json, color-coded by repo type (hub/downstream/game/tool)
- **Squad cards:** Added taglines per agent for personality, hover scale effects
- **Footer:** 3-column layout with org links, constellation repos, tech stack
- **Micro-interactions:** card-hover with translateY + glow, scroll-fade with IntersectionObserver
- **OG meta tags:** Full Open Graph + Twitter Card for social sharing

**Technical:**
- Custom Tailwind v4 @theme with CSS custom properties for Matrix palette
- Custom @keyframes: fade-in, slide-up, glow-pulse, float
- `.scroll-fade` + IntersectionObserver for on-scroll reveal
- prefers-reduced-motion: animations disabled, text shown immediately
- Pure canvas for Matrix rain (no dependencies)
- Updated data.ts with `getConstellation()` reading from constellation.json
- Added `tagline` field to TeamMember interface

**Learnings:**
- Matrix aesthetic requires restraint — 12% opacity rain, subtle glows, NOT full green everywhere
- Font-mono for UI creates instant "hacker" feel without being cheesy
- Constellation data from JSON gives real repo stats without API calls at build time
- TypeWriter needs IntersectionObserver to avoid firing before visible
- Canvas-based rain is more performant than CSS column animation for this density
- Build-time data is perfect for Astro — constellation.json parsed server-side
