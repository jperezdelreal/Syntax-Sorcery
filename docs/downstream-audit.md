# Downstream Repository Audit Report

> **Date:** 2026-03-21  
> **Auditor:** Morpheus (Lead/Architect)  
> **Issue:** #72  
> **Scope:** All 5 downstream repos — quality, testing, documentation, gameplay coverage

---

## Executive Summary

The founder's frustration is justified. Of 5 downstream repos, **only 2 have any tests at all**, and even the best-tested game repo (ComeRosquillas) writes tests that calculate `10 === 10` instead of actually playing the game. The agents are prolific at generating test *files* but fundamentally refuse to instantiate their own Game class and simulate a player session. Zero repos have gameplay integration tests.

| Repo | Tests | Pass Rate | Gameplay Tests | Grade |
|------|-------|-----------|----------------|-------|
| pixel-bounce | **0** | N/A | ❌ None | **F** |
| flora | **0** | N/A | ❌ None | **F** |
| ComeRosquillas | 597 | 100% | ❌ None (shallow mocks) | **C+** |
| FirstFrameStudios | **0** | N/A | ❌ None | **F** |
| ffs-squad-monitor | 544 | 99.8% (1 fail) | ✅ Real logic tested | **A-** |

**Verdict:** 3 of 5 repos have zero test infrastructure. The 1 game repo with tests (ComeRosquillas, 597 tests) is padding numbers with arithmetic assertions. Nobody is playing their own game.

---

## Per-Repo Scorecards

### 1. pixel-bounce

| Category | Score | Notes |
|----------|-------|-------|
| Testing Quality | 0/10 | Zero tests. Zero test infrastructure. No package.json. |
| Code Quality | 6/10 | 1,811-line single-file game. Works, but untestable monolith. |
| Documentation | 8/10 | Clean README with live link, controls, features. |
| Gameplay Coverage | 0/10 | Nothing tested. |
| **Overall** | **D** | Shipped game, plays well, completely untested. |

**Structure:** Single `game.js` file (1,811 lines) containing physics, collision, rendering, input, audio, achievements, daily challenges, and level editor. No build system. No package.json.

**Open Issues (6):** Multiplayer foundation (#28), community gallery (#27), race mode (#26), level metadata (#25), level validation (#24), leaderboards (#21). All are feature requests — no testing issues filed.

**What exists but is untested:**
- Ball physics engine with gravity, air resistance, bounce multipliers
- Collision detection (ball-platform with platform-type behaviors)
- Level validation (7-point checklist for user-generated content)
- Achievement system (10 achievements with complex unlock conditions)
- Seeded RNG for daily challenges (deterministic cross-timezone)
- Platform generation (probabilistic type assignment scaling with score)

---

### 2. flora

| Category | Score | Notes |
|----------|-------|-------|
| Testing Quality | 0/10 | Zero tests. Zero test runner. No vitest/jest dependency. |
| Code Quality | 8/10 | Excellent TypeScript architecture. 87 files, ~16,841 LOC. |
| Documentation | 3/10 | 25-line README. Claims "L-systems" but uses PixiJS primitives. |
| Gameplay Coverage | 0/10 | Nothing tested. |
| **Overall** | **D+** | Best-architected game, worst test coverage. |

**Structure:** Professional system-based architecture with EventBus, 14 game systems (PlantSystem, WeatherSystem, SynergySystem, etc.), typed entities, scene management. This is the most testable codebase — and the one with zero tests.

**Open Issues (10):** Encyclopedia polish (#205), GitHub Pages deploy (#204), procedural audio (#203), seasonal effects (#202), season selection (#201), scene transitions (#200), harvest particles (#199), cosmetic rewards (#198), procedural visuals (#196), sprint roadmap (#195). Zero testing issues.

**The irony:** Flora has the cleanest architecture for testing — typed events, pure system interfaces (`update(delta): void`), decoupled components via EventBus. A PlantSystem test could be written in 10 lines. Nobody wrote one.

**Critical code quality issue:** `GardenScene.ts` is 84.6 KB monolith. 2 TODO comments found. 15 console.log instances in production code.

---

### 3. ComeRosquillas

| Category | Score | Notes |
|----------|-------|-------|
| Testing Quality | 4/10 | 597 tests, but majority are arithmetic assertions. |
| Code Quality | 7/10 | Well-organized vanilla JS. Clean separation of concerns. |
| Documentation | 8/10 | Professional README with architecture, controls, features. |
| Gameplay Coverage | 1/10 | Tests calculate scores but never play the game. |
| **Overall** | **C+** | Most tests ≠ best tests. Quantity over quality. |

**Test Inventory:** 22 test files across 4 categories:
- Regression tests (5): scoring, settings, ghost AI, difficulty, sprint3
- Feature tests (11): combo, stats, tutorial, mobile, audio, daily challenges, etc.
- Integration tests (3): cross-feature, sprint3, sprint4
- Core tests (2): game-logic, config

**Open Issues (10):** Multiple themes (#99), achievements (#98), architecture refactor (#97), ghost personalities (#96), i18n (#95), screen shake (#94), animations (#93), power-ups (#92), accessibility (#91), procedural events (#90). No testing quality issues filed.

#### Shallow Test Examples (the problem)

**Example 1 — Testing a constant, not gameplay:**
```javascript
// game-logic.test.js:11-18
it('should award 10 points for regular dot', () => {
  const score = 10; // DOT_POINTS
  expect(score).toBe(10);
});
```
This test creates a variable, assigns it 10, and checks it equals 10. It does not instantiate a Game, move Homer to a dot tile, or verify the score increases after collision detection runs.

**Example 2 — Testing arithmetic, not combos:**
```javascript
// feature-combo.test.js:15-20
it('1st ghost: 1x multiplier → 200 pts', () => {
  expect(comboMultiplier(1)).toBe(1);
  expect(comboScore(1)).toBe(200);
});
```
Tests a standalone helper function. Does not test: player collects power pellet → eats frightened ghost → combo counter increments → score multiplied → display updates.

**Example 3 — Testing distance math, not collision:**
```javascript
// game-logic.test.js:117-128
it('should detect collision when distance < TILE * 0.8', () => {
  const homer = { x: 100, y: 100 };
  const ghost = { x: 110, y: 110 };
  const dx = ghost.x - homer.x;
  const dy = ghost.y - homer.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const threshold = TILE * 0.8;
  expect(dist < threshold).toBe(true);
});
```
Re-implements the distance formula inline instead of calling the actual `checkCollisions()` method on a real Game instance.

#### Better Tests (the minority)

**Example — localStorage integration:**
```javascript
// regression-scoring.test.js:207-231
it('should add a score and persist to localStorage', () => {
  const mgr = createManager();
  mgr.addScore('HOM', 5000, 3);
  expect(mgr.scores).toHaveLength(1);
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored[0].score).toBe(5000);
});
```
This actually instantiates a real HighScoreManager and tests persistence. Represents <5% of the test suite.

**Example — Cross-feature integration:**
```javascript
// integration-cross-feature.test.js:15-32
it('Easy difficulty gives more time for ghost combos', () => {
  const easyFright = FRIGHT_TIME * DIFFICULTY_PRESETS.easy.frightTimeMultiplier;
  const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier;
  expect(easyFright).toBeGreaterThan(normalFright);
});
```
Tests real config interactions. Still no Game instance, but validates game design constraints.

#### What's Missing — A Real Gameplay Test

This test does not exist anywhere in the codebase:
```javascript
it('Homer eats a donut and score increases', () => {
  const game = new Game();
  game.state = ST_PLAYING;
  game.maze[23][1] = DOT;
  game.homer = { col: 1, row: 23, x: 1 * TILE, y: 23 * TILE };
  const before = game.score;
  game.checkDots();
  expect(game.score).toBe(before + 10);
  expect(game.maze[23][1]).toBe(EMPTY);
});
```

---

### 4. FirstFrameStudios

| Category | Score | Notes |
|----------|-------|-------|
| Testing Quality | 0/10 | Zero tests despite 310-line test specification document. |
| Code Quality | 6/10 | Hub repo. Embedded ComeRosquillas copy without tests. |
| Documentation | 7/10 | Extensive game analysis docs. README is good. |
| Gameplay Coverage | 0/10 | QUICK_TEST_REFERENCE.txt describes everything to test. Nobody tested it. |
| **Overall** | **D** | Governance hub with excellent specs and zero implementation. |

**The paradox:** This repo contains `QUICK_TEST_REFERENCE.txt` (310 lines) — a comprehensive test specification covering collision detection thresholds, score calculations, state transitions, and required mocks. It also contains `BONUS_SYSTEM_ANALYSIS.md` (22KB) with system specifications. The agents wrote detailed specs about what to test and then tested nothing.

**Open Issues (3):** Pixel Bounce pipeline game (#198), Daily Digest #195, #174. Stale — last digest is from March 13.

**ComeRosquillas embedded copy:** Contains the game code with `test: "echo \"Error: no test specified\" && exit 1"` in package.json. Hard-coded failure.

---

### 5. ffs-squad-monitor

| Category | Score | Notes |
|----------|-------|-------|
| Testing Quality | 9/10 | 544 tests. Real logic tested. 80% coverage thresholds enforced. |
| Code Quality | 8/10 | Clean monorepo. Express + React + Zustand. |
| Documentation | 7/10 | Good README but status contradicts features. Duplicated section. |
| Gameplay Coverage | N/A | Not a game — monitoring dashboard. |
| **Overall** | **A-** | Best-tested repo by far. Only 1 failing test. |

**Why this repo succeeds where others fail:** ffs-squad-monitor tests *real behavior*, not arithmetic:

**Example — SSE reconnection with exponential backoff:**
```javascript
// useSSE.test.js — Tests real monitoring behavior
it('should fall back to polling after 3 SSE failures', () => {
  // Tests actual state machine: connecting → streaming → error → reconnect → fallback
});
```

**Example — Event bus debouncing:**
```javascript
// event-bus.test.js — Tests rate-limiting
it('should coalesce 3 rapid events into 1', () => {
  // Uses fake timers to test debouncing under load
});
```

**Example — XSS protection:**
```javascript
// util.test.js — Tests security
it('should escape HTML to prevent XSS', () => {
  expect(escapeHtml('<script>alert("xss")</script>')).toBe('...');
});
```

**Test categories:** 25 frontend tests (components, hooks, services, utils), 9 backend tests (API, event bus, metrics, notifications), 1 Playwright E2E smoke test (7 scenarios).

**Issues:** 1 failing test, README "Sprint 0" status contradicts implemented features, no ESLint/Prettier config, duplicated README section.

**Open Issues (10):** Sprint 3 architecture (#119-124), data export (#118), performance monitoring (#117), dark mode (#115), accessibility (#114). Active development backlog — not stale.

---

## The Gameplay Testing Gap

### The Core Problem

Agents write tests that **describe** game behavior without **executing** it. They create helper functions that mirror game logic, test those helpers, and claim coverage. The actual Game class — with its state machine, collision detection, entity interactions, and rendering pipeline — is never instantiated in any test.

### Pattern Analysis

| What agents do | What they should do |
|---------------|-------------------|
| `const score = 10; expect(score).toBe(10)` | `game.collectDot(); expect(game.score).toBe(10)` |
| `const dist = Math.sqrt(dx*dx+dy*dy)` | `game.checkCollisions(); expect(game.state).toBe(DYING)` |
| `comboMultiplier(3) === 4` | `game.eatGhost(); game.eatGhost(); game.eatGhost(); expect(game.comboMultiplier).toBe(4)` |
| Write 310-line test spec, test nothing | Instantiate Game, simulate 10 turns, assert outcomes |

### Why This Happens

1. **Game classes are monoliths.** A 1,811-line `game.js` or 1,222-line `game-logic.js` with canvas/audio dependencies makes instantiation hard without mocking.
2. **Agents avoid mocking complexity.** Instead of mocking Canvas2D and AudioContext, agents extract helper functions and test those in isolation.
3. **No gameplay test template exists.** Agents have no example of a proper gameplay integration test to follow.
4. **Test count is the metric, not test quality.** 597 tests sounds impressive. That 95% test arithmetic is invisible.

### Specific Suggestions

#### 1. Create a Gameplay Test Template (highest priority)

Every game repo should have a `tests/gameplay.test.js` that:

```javascript
import { Game } from '../js/game-logic.js';

// Minimal mock for headless testing
const mockCanvas = { getContext: () => ({
  fillRect: () => {}, clearRect: () => {}, beginPath: () => {},
  arc: () => {}, fill: () => {}, stroke: () => {},
  fillText: () => {}, measureText: () => ({ width: 0 }),
  save: () => {}, restore: () => {}, translate: () => {},
  drawImage: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }),
}) };

describe('Gameplay — actually playing the game', () => {
  let game;
  
  beforeEach(() => {
    document.getElementById = () => mockCanvas;
    game = new Game();
    game.state = ST_PLAYING;
  });

  it('Homer collects a dot and score increases', () => {
    game.maze[game.homer.row][game.homer.col] = DOT;
    const before = game.score;
    game.checkDots();
    expect(game.score).toBe(before + DOT_POINTS);
  });

  it('Homer dies when touching a ghost in chase mode', () => {
    game.ghosts[0].x = game.homer.x;
    game.ghosts[0].y = game.homer.y;
    game.ghosts[0].mode = 'chase';
    game.checkCollisions();
    expect(game.state).toBe(ST_DYING);
    expect(game.lives).toBeLessThan(3);
  });

  it('completing a level transitions to next level', () => {
    game.dotsLeft = 0;
    game.update();
    expect(game.level).toBe(2);
  });
});
```

#### 2. Add Headless Game Runner

Create a shared skill/utility that runs a game headlessly for N frames and reports state:

```javascript
function simulateGame(game, frames = 300) {
  for (let i = 0; i < frames; i++) {
    game.update();
  }
  return {
    score: game.score,
    state: game.state,
    level: game.level,
    lives: game.lives,
  };
}
```

#### 3. Require Gameplay Tests in CI Gate

Add a CI check that fails if no test file imports and instantiates the main Game class. Pattern: `grep -r "new Game" tests/` must return at least 1 result.

#### 4. Define Test Quality Tiers

| Tier | Description | Example |
|------|-------------|---------|
| T0 | Arithmetic assertion | `expect(10).toBe(10)` |
| T1 | Isolated helper test | `expect(comboMultiplier(3)).toBe(4)` |
| T2 | Real class instantiation | `new HighScoreManager().addScore(...)` |
| T3 | Gameplay simulation | `game.update(); expect(game.score)...` |
| T4 | Multi-turn scenario | Simulate 5 levels, verify progression |

Require ≥50% T2+ and ≥20% T3+ tests before merge.

---

## Priority-Ordered Recommendations

### 🔴 Critical (Do Now)

1. **Add test infrastructure to pixel-bounce.** Create package.json, install vitest, write ≥10 gameplay tests that instantiate the game and simulate player actions. Currently zero tests on a shipped product.

2. **Add test infrastructure to flora.** Install vitest + jsdom. Flora has the best architecture for testing — write ≥20 tests covering PlantSystem, SynergySystem, WeatherSystem. These are pure functions behind typed interfaces.

3. **Replace shallow tests in ComeRosquillas.** The 597 tests inflate confidence. Add 30+ gameplay tests that instantiate Game and test real collision/scoring/state transitions. Don't delete existing tests, but stop counting T0 arithmetic as coverage.

4. **Fix the 1 failing test in ffs-squad-monitor.** 543/544 passing is close to perfect — investigate and fix the regression.

### 🟡 High Priority (This Sprint)

5. **Create gameplay test template as a shared Squad skill.** Add to `.squad/skills/` so all game repos get a standardized approach to headless game testing with Canvas mocks.

6. **Add CI test gates to all repos.** pixel-bounce and flora have no CI test step. ComeRosquillas has vitest but no gameplay quality gate.

7. **Clean up FirstFrameStudios.** Either delete the embedded ComeRosquillas copy (use the standalone repo) or add tests to it. The 310-line `QUICK_TEST_REFERENCE.txt` should become actual tests.

8. **Fix flora README.** 25 lines for a 16,841 LOC TypeScript project is inadequate. Document game mechanics, systems architecture, development setup.

### 🟢 Medium Priority (Next Sprint)

9. **Refactor game monoliths.** `pixel-bounce/game.js` (1,811 lines) and `ComeRosquillas/game-logic.js` (1,222 lines) are untestable monoliths. Extract physics, collision, state management into separate modules.

10. **Add E2E browser tests.** Use Playwright to launch each game in a browser, simulate keyboard input, and verify the game reaches certain states (title → playing → scoring → game over).

11. **Clean stale issues.** FirstFrameStudios has daily digest issues from March 13 (#174, #195). Flora has 10+ open issues with no assignee. ComeRosquillas has 10 open feature requests.

12. **Update ffs-squad-monitor README.** Fix "Sprint 0" status contradiction, remove duplicated testing section.

---

## Action Items Created

Based on this audit, Morpheus created concrete improvement issues in each downstream repo (Issue #90, 2026-03-21). All issues are labeled `squad` and reference the gameplay test template documented in this audit.

### Issues Created

| Repo | Issues | Links |
|------|--------|-------|
| **pixel-bounce** | 2 | [#37 Add gameplay tests](https://github.com/jperezdelreal/pixel-bounce/issues/37), [#38 Improve test coverage](https://github.com/jperezdelreal/pixel-bounce/issues/38) |
| **flora** | 2 | [#225 Add gameplay tests](https://github.com/jperezdelreal/flora/issues/225), [#226 Improve test coverage](https://github.com/jperezdelreal/flora/issues/226) |
| **ComeRosquillas** | 2 | [#106 Replace inflated tests](https://github.com/jperezdelreal/ComeRosquillas/issues/106), [#107 Add Game class tests](https://github.com/jperezdelreal/ComeRosquillas/issues/107) |
| **FirstFrameStudios** | 2 | [#200 Add test infrastructure](https://github.com/jperezdelreal/FirstFrameStudios/issues/200), [#201 Define roadmap](https://github.com/jperezdelreal/FirstFrameStudios/issues/201) |
| **ffs-squad-monitor** | 1 | [#138 Expand integration tests](https://github.com/jperezdelreal/ffs-squad-monitor/issues/138) |

**Total: 9 issues created across 5 repos**

### Next Steps for Squad

1. **Gameplay Framework (Issue #75):** Implement the Canvas mock templates and shared headless game runner referenced in these issues. Template location: `.squad/skills/gameplay-test-template.js`
2. **Test Quality Gates:** Add CI checks requiring `grep -r "new Game" tests/` to catch instances where Game class is actually instantiated
3. **CI Workflows:** Each game repo needs `npm test` step in GitHub Actions, with merge gate requiring tests to pass
4. **Branch Protection:** All downstream repos require ≥1 passing CI check before merge (enforce with `gh repo edit`)

---

## Conclusion

The constellation produces impressive volume — 597 tests in ComeRosquillas, 544 in ffs-squad-monitor, rich feature sets across all games. But the founder sees through the numbers. When 95% of your game tests verify that `10 === 10`, you haven't tested your game — you've tested JavaScript's equality operator.

The fix is architectural: give agents a gameplay test template, require Game class instantiation in tests, and gate merges on test quality tiers, not just test count. The agents can clearly write tests. They need to be told to *play the game*.

---

*Report generated by Morpheus (Lead/Architect) — Syntax Sorcery*  
*"I can only show you the door. You're the one that has to walk through it."*
