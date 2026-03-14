# Switch — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings (Current)

- **Visual Gameplay Testing (PR #129):** Playwright-based visual testing framework — agents can now literally open HTML5 games in Chromium, simulate inputs, capture screenshots, and validate visuals. Built `VisualGameRunner` class with full API: `launchGame`, `screenshot`, `pressKey`, `clickAt`, `waitForFrames`, `getCanvasPixel`, `compareScreenshot`, `recordGameplay`, `hasVisualContent`. 8/8 pilot tests pass against pixel-bounce. Key insight: canvas-only games (no DOM score display) need pixel-level validation via `getImageData` — reading regions for non-uniformity proves content is rendered without needing to parse drawn text. The local HTTP server pattern (listen on port 0 → random port) avoids port conflicts in CI. 730 existing tests remain green. CLI integration via `visual-test` subcommand.

- **Issue #89 (2026-03-21):** Gameplay testing pilot for pixel-bounce (PR #98). 22 tests validating real game code via vm sandbox + framework bridge pattern. Found & fixed canvas-mock parseColor bug (gradient objects). Key insight: procedural games with `let`/`const` globals require a same-scope bridge pattern to expose internals from `vm.runInContext()`. 651 total tests passing (629 existing + 22 new). Proves the Phase 8 gameplay framework (#75) works on real downstream games.

- **Phase 5 (2026-03-19 to 2026-03-20):** Session Report Generator PR #51 merged. Automated session summary generation. Issue #48 CLOSED. Moved from QA-only role to infrastructure enablement.

- **Phase 4 (2026-03-19):** README Premium Overhaul (PR #44 merged). Created marketing-grade front page with badges, ASCII diagrams, constellation table, team roster. Issue #41 CLOSED.

- **Phase 3 (2026-03-18):** Constellation health monitoring (PR #33) + ralph-watch dashboard (PR #34). Issue #29, #31 CLOSED. Board clear at phase end.

## Archived Learnings (Phases 2-0)

**Phase 2:** Unit tests (34 tests), E2E tests (92 new, 126 total), CI checks (PR #32), constellation monitoring infrastructure.
**Phase 1:** Ralph v5 hardening, GDD→Issue pipeline, P1-10b-P1-13 completion, FFS takeover verification (Grade 🟢 GREEN), full constellation check.
**Phase 0:** Context hygiene SKILL, self-audit (D→B grade), governance setup, decision capture patterns.
