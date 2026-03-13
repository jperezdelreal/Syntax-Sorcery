# Decision: GDD→Issue Autonomous Pipeline

**Date:** 2026-03-14  
**Author:** Trinity  
**Status:** Implemented  
**Task:** P1-10b

## Context

Oracle delivered the GDD template spec (P1-10a) with YAML frontmatter and 10 structured sections. We need a fully autonomous pipeline that converts any GDD file into a complete GitHub Issue tree — zero human input.

## Decision

Built a Node.js script (`scripts/gdd-to-issues.js`) + GitHub Actions workflow (`.github/workflows/gdd-to-issues.yml`) that:

1. **Triggers on:** push to `docs/gdds/` or manual dispatch
2. **Parses:** YAML frontmatter + all 10 GDD sections (H3/H4 headers)
3. **Creates:** Full issue tree per Oracle's mapping spec:
   - Epic from High Concept
   - Feature issues from Core Mechanics (1 per mechanic)
   - Art issues (epic+sub-issues if high, single issue if medium/low)
   - Audio issues (procedural=P2 task, sample-based/custom=epic+sub-issues)
   - Game Loop (per-run + meta-progression)
   - Architecture (P0 design task)
   - Content & Scope (per-item: MVP=P0, Post-MVP=P1, Stretch=P2)
   - Testing (functional reqs checklist + quality gates + investigation per blocker)
   - Critical Path (milestone epic + phase tasks)
4. **Labels:** Auto-derived from YAML fields + section types
5. **Dry-run mode:** `--dry-run` prints all issues without creating them
6. **Error handling:** Graceful failures for missing sections, malformed YAML, missing files

## Dependencies

- `js-yaml` npm package (added to package.json)
- `gh` CLI (available in GitHub Actions runners)
- No Azure resources (GitHub Actions = $0)

## Test Artifact

`docs/gdds/examples/test-game.md` — "Chrono Tiles" puzzle platformer GDD that exercises all sections and edge cases (blocking unknowns, procedural audio, medium art). Dry-run produces 31 issues.

## Constraints Respected

- GitHub Actions = unlimited (no cost)
- Zero human input in pipeline
- Game-type agnostic (not hardcoded)
- Design Pillars → no issues (reference only, per spec)
