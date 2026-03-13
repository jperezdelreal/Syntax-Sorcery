# Syntax Sorcery — Company Showcase

This is the GitHub Pages site for Syntax Sorcery, the autonomous software development company.

## Features

- **Hero Section**: Company introduction and mission
- **Downstream Companies**: Cards for FirstFrame Studios and future companies
- **Recent Activity**: Last 5 decisions from `.squad/decisions.md`
- **Team Roster**: All 8 AI agents with roles and status
- **System Health**: Pipeline metrics and budget tracking (placeholder data)

## Tech Stack

- **Astro 4.x**: Static site generation
- **Tailwind CSS 4.x**: Styling
- **GitHub Actions**: Automated deployment
- **GitHub Pages**: Hosting (€0 cost)

## Development

```bash
npm install
npm run dev      # Start dev server at http://localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

Automatically deployed via GitHub Actions on:
- Push to `main` (when `site/**` or `.squad/decisions.md` changes)
- Daily at 2 AM UTC (to update activity feed)
- Manual trigger via workflow_dispatch

**Live URL**: https://jperezdelreal.github.io/Syntax-Sorcery/

## Data Sources

- **Decisions**: Parsed from `../.squad/decisions.md` at build time
- **Team**: Hardcoded in `src/utils/data.ts` (matches `.squad/team.md`)
- **Metrics**: Placeholder data (will be replaced with real metrics later)

## Lighthouse Scores

Target: Performance >90, Accessibility >90

Build time: ~3 seconds
