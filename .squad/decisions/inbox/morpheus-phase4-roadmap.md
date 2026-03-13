# Decision — Phase 4 Roadmap: Marketing & Aesthetics

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ APPROVED
**Date:** 2026-03-19

## What

Defined Phase 4 roadmap with 3 items focused on VISIBLE impact per founder directive ("marketing y estética"). All Phase 2 and Phase 3 items marked complete (6/6 delivered). New items:

1. **README premium overhaul** (#41) — Rewrite with badges, architecture diagram, current stats, constellation overview. The #1 most visible artifact.
2. **Landing page visual upgrade** (#42) — Matrix-themed CSS animations, live constellation stats, OG meta tags, "How It Works" section. The public face of the company.
3. **Architecture documentation** (#43) — Professional docs (architecture.md, onboarding.md, constellation.md) with ASCII diagrams covering 3-layer monitoring, perpetual motion, hub/spoke.

## Rationale

Phases 2-3 built the engine (CI, health monitoring, dashboard, dedup guard, Azure launcher, review gate). Phase 4 builds the showroom. The founder explicitly requested marketing and aesthetics — the system should LOOK as impressive as it WORKS. Three items chosen to maximize what the founder SEES when waking up:

- README → first thing on GitHub
- Landing page → first thing on the web
- Architecture docs → first thing engineers read

Available agents: Mouse (UI/UX) for landing page, Oracle (Product & Docs) for architecture docs, @copilot for README.

## Impact

- 3 GitHub issues created (#41, #42, #43), all labeled `squad`
- Roadmap updated: items 1-6 marked `[x]`, items 7-9 added
- Ralph can detect and assign these to @copilot via perpetual-motion
- Phase 4 is the first roadmap cycle that mixes infrastructure with public-facing presentation

## Risk

LOW. All items are additive (no breaking changes to existing scripts or CI). Documentation and visual changes only.
