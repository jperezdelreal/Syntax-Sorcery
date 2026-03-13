# Decision: Proposal→Prototype Autonomous Workflow Architecture

**Date:** 2026-03-15  
**Author:** Morpheus (Lead/Architect)  
**Status:** Approved (T1)  
**Task:** P1-11  
**Tier:** T1

## Context

Phase 1 requires a fully autonomous pipeline: text game proposal → playable prototype on GitHub Pages. This is the most complex Phase 1 item. Must integrate with existing GDD template (P1-10a) and GDD→Issue pipeline (P1-10b) while supporting any game type with zero human input.

## Decision

Six-stage pipeline with explicit contracts, label-based state machine, and per-game repository model.

### Architecture Summary

```
Stage 0: PROPOSAL    → docs/proposals/{slug}.proposal.md (YAML + text)
Stage 1: GDD GEN     → docs/gdds/{slug}.md (via @copilot in GHA)
Stage 2: ISSUES      → GitHub Issue tree (existing gdd-to-issues.js)
Stage 3: IMPLEMENT   → Game code in FirstFrameStudios/{slug} (via @copilot)
Stage 4: BUILD       → dist/ artifact (GHA in game repo)
Stage 5: DEPLOY      → GitHub Pages (GHA in game repo)
```

### Key Decisions Made

1. **GDD Generation via @copilot** — Zero Azure cost, natural audit trail in Issues
2. **Per-game repository** — Matches existing FFS pattern (ComeRosquillas, Flora)
3. **Static-first build** — HTML5 Canvas + vanilla JS default, build step opt-in
4. **Label-based state machine** — `pipeline:*` labels on Epic issue, Ralph monitors
5. **Pipeline logic in Syntax-Sorcery** — Game repos are products, this repo is the factory

### Implementation Decomposition

12 sub-tasks across 4 waves (A→D), ~20 hours Trinity work:
- Wave A: Foundation scripts (validate-proposal.js, proposal-to-gdd.js, pipeline-orchestrator.js, labels)
- Wave B: Orchestration (game repo template, implement-game.yml, gdd-to-issues.js extensions)
- Wave C: Build & deploy (template workflows, smoke test)
- Wave D: Integration (Ralph monitoring, end-to-end dry run)

## Constraints Respected

- ✅ Works for ANY game type (generic Canvas 2D default, override via GDD)
- ✅ Zero human input proposal→deployed
- ✅ GitHub unlimited (all pipeline on GHA, no Azure spend)
- ✅ Azure budget reserved for game infrastructure only
- ✅ Each stage independently testable (separate scripts, workflows)
- ✅ Extends existing GDD→Issue pipeline (gdd-to-issues.js gets 2 additions, not rewritten)

## Artifacts

- Architecture document: `docs/proposal-to-prototype.md`
- This decision: `.squad/decisions/inbox/morpheus-proposal-prototype.md`

## Dependencies

- Requires: P1-10a (GDD Template) ✅ Complete
- Requires: P1-10b (GDD→Issue Pipeline) ✅ Complete
- Requires: P1-08 (Ralph v5) ✅ Complete
- Enables: Full autonomous game production for FFS

## Risks

1. **@copilot GDD quality** — Generated GDDs may be shallow. Mitigation: strict validation gate + Oracle fallback.
2. **@copilot implementation quality** — Complex games may exceed @copilot's capability. Mitigation: Trinity as fallback, architecture-first approach.
3. **Cross-repo orchestration** — Syntax-Sorcery workflows must trigger actions in game repos. Mitigation: `gh` CLI with PAT, or repository_dispatch events.
