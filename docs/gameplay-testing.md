# Gameplay Testing Framework

> Test your games like you play them. No browser needed.

## Overview

The Gameplay Testing Framework is a **Node.js-based testing toolkit** for Syntax Sorcery downstream games. It provides a virtual DOM/Canvas environment that lets you simulate player input, advance game time, and assert game state — all without a browser.

**Why this exists:** Our game repos had zero meaningful gameplay tests. ComeRosquillas had 597 tests, but they were all `expect(10).toBe(10)` — not a single game class was instantiated. This framework makes it trivially easy to write real gameplay tests.

## Quick Start

### 1. Copy the template

For **platformer games** (pixel-bounce style):
```bash
cp path/to/Syntax-Sorcery/scripts/gameplay-test/templates/platformer-tests.template.js __tests__/gameplay.test.js
```

For **puzzle/strategy games** (flora style):
```bash
cp path/to/Syntax-Sorcery/scripts/gameplay-test/templates/puzzle-tests.template.js __tests__/gameplay.test.js
```

### 2. Install vitest

```bash
npm install --save-dev vitest
```

### 3. Add test script to package.json

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

### 4. Replace TODO markers

Open the template and replace each `TODO` with your game-specific code. The comments explain exactly what to do.

### 5. Run tests

```bash
npx vitest run
```

## Core Concepts

### GameTestRunner

The central class that manages the virtual environment:

```js
const { GameTestRunner } = require('path/to/gameplay-test/framework');

const runner = new GameTestRunner({
  width: 400,    // Canvas width (match your game)
  height: 600,   // Canvas height (match your game)
  fps: 60,       // Frame rate for time calculations
});

runner.setup();    // Initialize virtual DOM + Canvas
// ... run tests ...
runner.teardown(); // Clean up
```

### Input Simulation

```js
// Keyboard
runner.simulateKeyPress('ArrowLeft');   // keydown event
runner.simulateKeyRelease('ArrowLeft'); // keyup event
runner.simulateKeyTap('Enter', 3);     // press, hold 3 frames, release

// Mouse / Pointer
runner.simulateClick(200, 300);        // click at canvas coords

// Touch
runner.simulateTouch(100, 400);        // touch at canvas coords
```

### Time Control

```js
runner.tick();           // Advance 1 frame (1/fps seconds)
runner.tick(16.67);      // Advance specific milliseconds
runner.tickFrames(60);   // Advance 60 frames
runner.tickSeconds(2);   // Advance 2 seconds of game time
```

### Canvas Inspection

```js
// Get pixel data
const pixel = runner.getPixel(100, 200);  // { r, g, b, a }

// Check if content exists in a region
runner.hasContentInRegion(0, 0, 100, 50); // true/false

// Get all text rendered via fillText
const texts = runner.getRenderedText();   // ['Score: 42', 'Level 3']

// Get raw draw call history
const rects = runner.getDrawCalls('fillRect');
```

### Game State & Assertions

```js
// Custom state tracking (your game writes to this)
runner.setGameState('score', 42);
runner.assertState('score', 42);

// Score assertion (checks rendered text)
runner.assertScore(150);

// Game state assertions
runner.assertGameOver();
runner.assertGameRunning();

// Wait for a condition (ticks frames automatically)
await runner.waitForGameState(
  (r) => r.getGameState('level') === 3,
  5000  // timeout ms
);
```

### localStorage Helpers

```js
// Pre-seed saved data
runner.seedStorage({ pb_hi: '999', pb_stats: JSON.stringify({ totalGames: 5 }) });

// Read saved data
const highScore = runner.readStorage('pb_hi');

// Clear all storage
runner.clearStorage();
```

## Loading Your Game

### Vanilla JS Games (pixel-bounce style)

For single-file games, inject the mock environment as globals:

```js
beforeEach(() => {
  runner = new GameTestRunner({ width: 400, height: 600 });
  runner.setup();

  const env = runner.getEnvironment();
  global.document = env.document;
  global.window = env.window;
  global.canvas = env.canvas;
  global.localStorage = env.localStorage;
  global.requestAnimationFrame = env.window.requestAnimationFrame;
  global.cancelAnimationFrame = env.window.cancelAnimationFrame;
  global.Audio = env.window.Audio;
  global.Image = env.window.Image;

  // Load the game
  require('../game.js');
});
```

### TypeScript / Vite Games (flora style)

**Option A:** Test the built output:
```bash
npm run build
```

```js
const { ScoringSystem } = require('../dist/systems/ScoringSystem');
```

**Option B:** Use vitest with TypeScript (recommended):
```ts
import { ScoringSystem } from '../src/systems/ScoringSystem';
import { GameTestRunner } from 'path/to/gameplay-test/framework';
```

**Option C:** Test systems in isolation (no canvas needed):
```js
const scoring = new ScoringSystem();
scoring.addHarvest('rose', 100);
expect(scoring.breakdown.harvests).toBe(100);
```

## Squad CLI Integration

```bash
# Show help
npm run squad -- gameplay-test --help

# Initialize a platformer test template in a game repo
npm run squad -- gameplay-test --init --type platformer --target /path/to/game

# Initialize a puzzle test template
npm run squad -- gameplay-test --init --type puzzle --target /path/to/game
```

## Writing Good Gameplay Tests

### DO ✅

- **Test real game behavior** — instantiate actual game classes, simulate real input
- **Test state transitions** — menu → playing → game over → restart
- **Test edge cases** — boundary collisions, zero health, max score
- **Test persistence** — save/load, high scores, unlocks
- **Keep tests fast** — the mock canvas makes everything synchronous

### DON'T ❌

- Don't write `expect(10).toBe(10)` — that tests nothing
- Don't mock everything — test the real behavior
- Don't test implementation details — test the contract
- Don't skip game over testing — that's where most bugs live

## Architecture

```
scripts/gameplay-test/
├── framework.js              # GameTestRunner, DOM environment, assertions
├── canvas-mock.js            # Canvas 2D context mock with pixel tracking
└── templates/
    ├── platformer-tests.template.js  # Template for platformer games
    └── puzzle-tests.template.js      # Template for puzzle/strategy games
```

## API Reference

### GameTestRunner

| Method | Description |
|--------|-------------|
| `setup()` | Initialize virtual environment |
| `teardown()` | Clean up |
| `getCanvas()` | Get mock canvas element |
| `getContext()` | Get 2D context with call tracking |
| `getEnvironment()` | Get full DOM environment for injection |
| `simulateKeyPress(key)` | Dispatch keydown event |
| `simulateKeyRelease(key)` | Dispatch keyup event |
| `simulateKeyTap(key, frames)` | Press + hold + release |
| `simulateClick(x, y)` | Dispatch click at coordinates |
| `simulateTouch(x, y)` | Dispatch touch at coordinates |
| `tick(ms?)` | Advance time and flush rAF |
| `tickFrames(n)` | Advance N frames |
| `tickSeconds(s)` | Advance S seconds |
| `getCanvasState()` | Get full canvas pixel data |
| `getPixel(x, y)` | Get pixel color at coordinates |
| `hasContentInRegion(x, y, w, h)` | Check for non-transparent pixels |
| `getRenderedText()` | Get all fillText strings |
| `getDrawCalls(method?)` | Get draw call history |
| `resetDrawCalls()` | Clear draw call log |
| `setGameState(key, value)` | Set custom state |
| `getGameState(key)` | Get custom state |
| `assertScore(expected)` | Assert score in rendered text |
| `assertState(key, expected)` | Assert custom state value |
| `assertGameOver()` | Assert game over state |
| `assertGameRunning()` | Assert game is running |
| `waitForGameState(predicate, timeout)` | Wait for condition |
| `seedStorage(data)` | Pre-seed localStorage |
| `readStorage(key)` | Read localStorage value |
| `clearStorage()` | Clear localStorage |
| `onTick(callback)` | Register per-frame watcher |
