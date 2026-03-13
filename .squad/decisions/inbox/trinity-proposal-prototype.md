# Decision: P1-11 Proposal→Prototype Pipeline Implementation

**By:** Trinity (Full-Stack Developer)  
**Date:** 2026-03-15  
**Status:** COMPLETE  
**Tier:** T1

## What

Implemented the full 6-stage Proposal→Prototype pipeline orchestration designed by Morpheus (docs/proposal-to-prototype.md). Covers Stages 0–5 with scripts, GHA workflows, and game repo templates.

## Artifacts Created

- `scripts/validate-proposal.js` — Stage 0 proposal validation (YAML, slug, word count)
- `scripts/proposal-to-gdd.js` — Stage 1 template-fill GDD generator (10/10 sections)
- `scripts/pipeline-orchestrator.js` — Cross-stage state machine (init/transition/block/status/list)
- `scripts/create-pipeline-labels.js` — 12 pipeline labels (created in repo)
- `.github/workflows/proposal-pipeline.yml` — Stage 0+1 GHA workflow
- `.github/workflows/implement-game.yml` — Stage 3 implementation orchestrator
- `scripts/game-repo-templates/build-deploy.yml` — Stage 4+5 template for game repos
- `docs/proposals/examples/chrono-tiles.proposal.md` — Example proposal
- Extended `scripts/gdd-to-issues.js` with `pipeline:issues` label + manifest output

## Key Decisions

1. **Template fill-in for Stage 1** — No LLM call from scripts. GDD scaffold is auto-generated with structure; a GitHub issue is created for @copilot/squad to refine content. This keeps scripts deterministic and testable.
2. **Label-based state machine** — Pipeline state tracked via GitHub labels on Epic issues + `.pipeline/{slug}/status.json` files. Ralph monitors labels.
3. **Static-first builds** — Game repo template auto-detects: if `package.json` with `build` script exists → npm build; otherwise → copy static files to `dist/`.
4. **Unified build+deploy** — Combined into single workflow template rather than two separate files. Simpler for game repos.

## Cost

€0 — All GitHub Actions (unlimited). No Azure resources.

## Next Steps

- End-to-end integration test with a real proposal through full pipeline
- Ralph monitoring rules for pipeline labels
- Tank: game repo template initialization script
