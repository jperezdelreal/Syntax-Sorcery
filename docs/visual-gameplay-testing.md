# Visual Gameplay Testing

Playwright-based visual testing framework that lets agents **literally play HTML5 games** — opening them in a real Chromium browser, simulating keyboard and mouse input, capturing screenshots, and validating what the player sees.

## How It Works

1. **Local HTTP server** spins up to serve the game's HTML/JS/CSS files
2. **Chromium launches** via Playwright with a configured viewport (800×600 default)
3. **VisualGameRunner** provides a high-level API to interact with the game:
   - Simulate keyboard input (`pressKey`)
   - Simulate mouse clicks (`clickAt`)
   - Capture screenshots (`screenshot`)
   - Read canvas pixel data (`getCanvasPixel`)
   - Compare screenshots for visual diffs (`compareScreenshot`)
   - Record gameplay as screenshot sequences (`recordGameplay`)
4. **Tests validate** that the game responds correctly to input, renders properly, and progresses through states

This is **not** headless unit testing — it's a real browser rendering a real game.

## Quick Start

```bash
# From the Syntax Sorcery repo root
npm run visual-test -- --game ../pixel-bounce

# Or via squad CLI
npm run squad -- visual-test --game ../pixel-bounce

# Headed mode (watch the browser play the game)
npm run squad -- visual-test --game ../pixel-bounce --headed
```

## Writing Visual Tests

Tests use Playwright's test runner with a `VisualGameRunner` fixture.

```javascript
const { test, expect } = require('@playwright/test');
const { VisualGameRunner } = require('./visual-runner');

let game;

test.beforeEach(async () => {
  game = new VisualGameRunner({ viewport: { width: 800, height: 600 } });
  await game.launchGame('/path/to/game/index.html');
});

test.afterEach(async () => {
  await game.close();
});

test('game loads and renders', async () => {
  const canvas = await game.page.$('canvas');
  expect(canvas).toBeTruthy();

  await game.screenshot('baseline');
  const hasContent = await game.hasVisualContent(0, 0, 400, 300);
  expect(hasContent).toBe(true);
});

test('player moves on input', async () => {
  await game.clickAt(200, 300); // start game
  const before = await game.screenshot('before');
  await game.pressKey('ArrowRight', 500);
  const after = await game.screenshot('after');
  const diff = await game.compareScreenshot('before', 'after');
  expect(diff).not.toBe('identical');
});
```

## API Reference

### `VisualGameRunner`

| Method | Description |
|--------|-------------|
| `launchGame(htmlPath)` | Opens game HTML in Chromium via local HTTP server |
| `screenshot(name)` | Saves PNG screenshot, returns file path |
| `pressKey(key, durationMs)` | Simulates key press with hold duration |
| `clickAt(x, y)` | Simulates mouse click at viewport coordinates |
| `waitForFrames(n)` | Waits for N `requestAnimationFrame` cycles |
| `getCanvasPixel(x, y)` | Returns `{ r, g, b, a }` of a canvas pixel |
| `getTextContent(selector)` | Reads text from a DOM element |
| `compareScreenshot(a, b)` | Compares two named screenshots; returns `'identical'` or `{ diffPixels, totalPixels, diffPercent }` |
| `recordGameplay(seconds, fps)` | Captures a sequence of screenshots over time |
| `hasVisualContent(x, y, w, h)` | Checks if a canvas region has non-uniform pixels |
| `getCanvasRegion(x, y, w, h)` | Returns raw pixel data for a canvas region |
| `close()` | Closes browser and stops HTTP server |

### Configuration

The Playwright config at `scripts/gameplay-test/visual/playwright.config.js`:

- **Browser:** Chromium only
- **Viewport:** 800×600 (configurable per-runner)
- **Timeout:** 30s per test
- **Screenshots:** Saved to `scripts/gameplay-test/visual/screenshots/`
- **Workers:** 1 (sequential — games need exclusive browser focus)

## Setting Up Baselines

1. Run tests once to capture initial screenshots
2. Screenshots are saved to `scripts/gameplay-test/visual/screenshots/`
3. Use `compareScreenshot()` to diff against baselines
4. For regression testing, commit baseline PNGs and compare in CI

```javascript
test('game over screen matches baseline', async () => {
  // ... trigger game over ...
  await game.screenshot('game-over-current');
  const diff = await game.compareScreenshot('game-over-baseline', 'game-over-current');
  if (diff !== 'identical') {
    expect(parseFloat(diff.diffPercent)).toBeLessThan(5); // < 5% change
  }
});
```

## Adopting in Downstream Repos

1. **Copy the template:**
   ```bash
   cp scripts/gameplay-test/visual/visual-tests.template.js your-game/visual.spec.js
   ```

2. **Edit the template:**
   - Set `GAME_HTML_PATH` to your game's `index.html`
   - Customize tests for your game's controls and mechanics

3. **Run from Syntax Sorcery:**
   ```bash
   npm run visual-test -- --game ../your-game
   ```

4. **Or install Playwright in your game repo:**
   ```bash
   cd your-game
   npm install --save-dev @playwright/test
   npx playwright install chromium
   npx playwright test visual.spec.js
   ```

## Architecture

```
scripts/gameplay-test/visual/
├── visual-runner.js          # Core: VisualGameRunner class + HTTP server
├── visual-tests.template.js  # Template for new games
├── playwright.config.js      # Playwright configuration
├── pixel-bounce.spec.js      # Pilot: pixel-bounce visual tests
└── screenshots/              # Captured screenshots (gitignored)
```

The visual testing module sits alongside the existing headless gameplay-test framework:

```
scripts/gameplay-test/
├── framework.js              # Headless: vm sandbox testing
├── canvas-mock.js            # Headless: canvas mocking
├── templates/                # Headless: test templates
├── pilot/                    # Headless: pilot tests
└── visual/                   # NEW: Playwright visual testing
```

Both approaches are valid — headless tests run fast in CI, visual tests prove the game actually works in a real browser. Use both.
