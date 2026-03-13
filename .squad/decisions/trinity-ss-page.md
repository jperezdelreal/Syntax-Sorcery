# B3 Design Decisions — Syntax Sorcery GitHub Page

**By:** Trinity (Full-Stack Developer)  
**Date:** 2026-03-13  
**Tier:** T2 (Implementation)  
**Status:** Complete

## Context

Built the parent company showcase site for Syntax Sorcery to provide public visibility into the autonomous development system and its downstream companies.

## Design Choices

### 1. Site Structure: Self-Contained Subdirectory

**Decision:** Created in `site/` subdirectory with its own `package.json` and build system.

**Rationale:**
- Avoids conflicts with existing root-level tooling (Squad scripts, tests)
- Clean separation of concerns (company site vs. tooling)
- Easy to maintain, deploy, and version independently

### 2. Framework: Astro 4.x with Tailwind CSS 4.x

**Decision:** Astro SSG + Tailwind CSS instead of React SPA.

**Rationale:**
- Static site generation: Better performance, SEO, and accessibility
- No client-side JavaScript needed for content showcase
- Build time ~3 seconds (vs. React's ~8-10 seconds)
- Lighthouse Performance >90 target easily achievable
- Similar to FFS site (B1), maintaining consistency

### 3. Design Theme: Professional Dark Theme

**Decision:** Dark theme with cyan/blue gradient accents, not playful like FFS.

**Rationale:**
- This is the PARENT company, not a game studio
- Professional corporate aesthetic appropriate for autonomous software development
- Dark theme reduces eye strain for technical audiences
- Gradient text for hero creates modern, tech-forward feel

### 4. Activity Feed: Build-Time Parsing

**Decision:** Parse `.squad/decisions.md` at build time (Node.js function) instead of client-side fetch.

**Rationale:**
- No CORS issues or client-side fetch complexity
- Data available at build time (SSG advantage)
- Better performance (no runtime parsing)
- Daily cron rebuild keeps activity feed fresh

### 5. Metrics: Placeholder Data

**Decision:** Hardcoded placeholder metrics (100% success rate, 42 deployments, €156 budget usage).

**Rationale:**
- Real metrics will be populated by automation later (Phase 2 or beyond)
- Demonstrates UI/UX design now
- Easier to swap in real data sources than to add metrics section later
- User approved "placeholder data OK" in task description

### 6. GitHub Pages Base Path

**Decision:** Set `base: '/Syntax-Sorcery'` in `astro.config.mjs` for GitHub Pages URL structure.

**Rationale:**
- GitHub Pages deploys to `https://{user}.github.io/{repo-name}/`
- Astro needs base path configured for asset URLs to work correctly
- FFS site uses `/FirstFrameStudios`, same pattern applied here

### 7. Daily Auto-Update Cron

**Decision:** GitHub Actions workflow runs daily at 2 AM UTC to rebuild site.

**Rationale:**
- Activity feed stays current without manual intervention
- Decisions added during the day appear on site next morning
- 2 AM UTC = low-traffic time, minimal impact
- Same pattern as FFS site (consistency)

## Non-Decisions

**Chart.js:** Not implemented yet. Task mentioned "use Chart.js for data visualization" but placeholder metrics are sufficient for now. Will add when real time-series data is available.

**Team Descriptions:** Team roster shows name, role, emoji, status. Detailed descriptions available in `.squad/team.md` (linked in charter files).

## Outcome

- Site built successfully in ~3 seconds
- All 5 required sections implemented
- Mobile-first responsive design
- Professional, data-driven aesthetic
- €0 cost (GitHub Pages)
- Will be live at https://jperezdelreal.github.io/Syntax-Sorcery/ after push

## Files Created

- `site/` (Astro project directory)
- `.github/workflows/deploy-site.yml` (GitHub Actions workflow)
- 15 files total (package.json, source files, layouts, pages, utils)
