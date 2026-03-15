# SKILL: Playwright Gameplay Testing

## Purpose

Enable AI agents (@copilot, Squad agents) to autonomously test HTML5 canvas games in real browsers. The framework lets agents "play" games — navigate menus, interact with gameplay, take screenshots, detect visual bugs, and auto-create GitHub issues from failures.

## Template Location

```
beneficial-bar/playwright-template/
├── package.json              # Dependencies (@playwright/test, typescript)
├── playwright.config.ts      # Config: 800×600, screenshots on failure, JSON reporter
├── tsconfig.json             # TypeScript config
├── lib/
│   └── game-runner.ts        # GameRunner class — the core testing harness
├── tests/
│   ├── smoke.spec.ts         # Load game → canvas renders → no JS errors
│   ├── gameplay.spec.ts      # Start game → input works → score updates
│   └── menu-navigation.spec.ts  # Title → play → pause → game over → restart
├── scripts/
│   └── create-issues-from-failures.js  # JSON results → GitHub issues
├── .gitignore
└── README.md
```

## Installation in a Downstream Repo

### Step 1: Copy the template

```bash
# From the game repo root
cp -r /path/to/Syntax-Sorcery/beneficial-bar/playwright-template/ ./playwright/
cd playwright
npm install
```

### Step 2: Configure for your game

1. **Set the game path** in each test file:
   - Static HTML games: `GAME_PATH=../index.html`
   - Vite/Webpack games: `GAME_URL=http://localhost:5173`

2. **Customize interactions** — search for `CUSTOMIZE` comments in each test file:
   - Start game trigger (click, Enter, etc.)
   - Movement controls (arrow keys, WASD, etc.)
   - Pause trigger (Escape, P, etc.)
   - Canvas selector if not default `canvas`

3. **Adjust viewport** in `playwright.config.ts` if your canvas isn't 800×600

### Step 3: Run tests

```bash
# All tests
npx playwright test

# Specific suite
npx playwright test tests/smoke.spec.ts

# Headed mode (see the browser)
npx playwright test --headed

# Debug mode (step through)
npx playwright test --debug
```

### Step 4: Auto-create issues from failures

```bash
# Run with JSON reporter
npx playwright test --reporter=json > test-results.json

# Create GitHub issues for each failure
node scripts/create-issues-from-failures.js

# Preview without creating (dry run)
DRY_RUN=true node scripts/create-issues-from-failures.js
```

## How Auto-Issue Creation Works

1. Tests run with `--reporter=json`, producing `test-results.json`
2. `create-issues-from-failures.js` parses the JSON, finds all `failed` / `timedOut` results
3. For each failure, it creates a GitHub issue via `gh issue create` with:
   - Title: `[Playwright] {test name} — {suite name}`
   - Body: Error message, stack trace, reproduction command
   - Labels: `squad,bug,playwright`
   - Screenshot reference (if captured on failure)
4. Environment variables:
   - `REPO` — Target repo (auto-detected from git remote)
   - `LABEL` — Custom labels (comma-separated)
   - `DRY_RUN=true` — Preview mode

## Testing Patterns for Canvas Games

### What the GameRunner Can Do

| Method | Use Case |
|--------|----------|
| `launchGame(path)` | Serve static HTML via built-in server |
| `launchUrl(url)` | Connect to Vite/Webpack dev server |
| `screenshot(name)` | Capture named screenshots |
| `pressKey(key, ms)` | Simulate keyboard input with hold duration |
| `clickAt(x, y)` | Simulate mouse clicks |
| `waitForFrames(n)` | Wait for N animation frames |
| `getCanvasPixel(x, y)` | Read RGBA pixel value |
| `hasVisualContent(x,y,w,h)` | Check if a region has drawn content |
| `compareScreenshots(a, b)` | Pixel-diff two screenshots |
| `getTextContent(selector)` | Read DOM text (HTML HUD) |
| `recordGameplay(secs, fps)` | Capture gameplay frame sequence |

### Pattern: Static HTML Games (ComeRosquillas, Pixel Bounce)

```typescript
// These games have no bundler — just serve index.html
const game = new GameRunner();
await game.launchGame('../index.html');
```

### Pattern: Bundler Games (Flora with Vite)

```typescript
// Start the dev server first: npm run dev
// Then connect Playwright to it
const game = new GameRunner();
await game.launchUrl('http://localhost:5173');
```

### Pattern: Canvas-Only Score Validation

```typescript
// Games that draw score on canvas (no DOM)
// Use pixel comparison to detect score changes
await game.screenshot('before-scoring');
await game.pressKey('ArrowRight', 1000);
await game.screenshot('after-scoring');
const diff = await game.compareScreenshots('before-scoring', 'after-scoring');
expect(diff).not.toBe('identical');
```

### Pattern: DOM HUD Validation

```typescript
// Games with HTML elements for score/lives/level
const score = await game.getTextContent('#score');
expect(parseInt(score!)).toBeGreaterThanOrEqual(0);
```

### Pattern: Animation Loop Verification

```typescript
// Verify the game isn't frozen
await game.screenshot('frame-a');
await game.waitForFrames(30);
await game.screenshot('frame-b');
const diff = await game.compareScreenshots('frame-a', 'frame-b');
expect(diff).not.toBe('identical');
```

### Pattern: Graceful Skip for Missing Features

```typescript
// Skip tests that require features your game doesn't have
test('pause menu works', async () => {
  // ... interact ...
  if (diff === 'identical') {
    test.skip(true, 'Game has no pause menu');
  }
});
```

## Guidelines for @copilot Writing Playwright Tests

### ✅ DO Test

- **Game loads** — canvas renders, no JS errors
- **Core input works** — player responds to keyboard/mouse
- **State transitions** — title → play → game over → restart
- **Animation is running** — frames differ over time
- **Visual content exists** — canvas has non-uniform pixels
- **Score/HUD updates** — state changes are reflected visually
- **No crashes** — extended random input doesn't produce errors
- **Menu navigation** — all menus are reachable and functional

### ❌ DO NOT Test

- **Exact pixel colors** — These break with any visual change. Use `hasVisualContent()` instead.
- **Specific score values** — Games with randomness won't have deterministic scores.
- **Frame-perfect timing** — Browser rendering is non-deterministic. Use `waitForFrames()` not `setTimeout`.
- **Audio playback** — Browsers auto-mute. Audio testing requires different tools.
- **Performance/FPS** — Playwright adds overhead. Use browser DevTools for perf.
- **Responsive design** — Test at one viewport. Resize testing is separate.
- **Cross-browser** — Start with Chromium only. Add Firefox/WebKit later if needed.
- **Network requests** — These are offline canvas games. No API testing needed.

### Writing Good Test Assertions

```typescript
// ✅ GOOD — Checks behavior, not exact values
const hasContent = await game.hasVisualContent(0, 0, 400, 300);
expect(hasContent).toBe(true);

// ✅ GOOD — Checks change occurred, not what changed
const diff = await game.compareScreenshots('before', 'after');
expect(diff).not.toBe('identical');

// ❌ BAD — Brittle, breaks if colors change
const pixel = await game.getCanvasPixel(100, 100);
expect(pixel).toEqual({ r: 26, g: 26, b: 46, a: 255 });

// ❌ BAD — Score is random/variable
const score = await game.getTextContent('#score');
expect(score).toBe('1500');
```

## CI/CD Integration

Add to your game repo's GitHub Actions workflow:

```yaml
- name: Install Playwright
  run: cd playwright && npm ci

- name: Run Playwright tests
  run: cd playwright && npx playwright test --reporter=json > test-results.json
  continue-on-error: true

- name: Create issues from failures
  if: failure()
  run: cd playwright && node scripts/create-issues-from-failures.js
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Proven Track Record

This framework is based on Syntax Sorcery's visual testing infrastructure:
- **20+ tests** across 3 games (pixel-bounce, ComeRosquillas, Flora)
- **PR #129:** Original VisualGameRunner (8/8 tests pass)
- **PR #138:** Extended to ComeRosquillas (6/6) and Flora (3/6 + 3 graceful skips)
- **730+ existing tests** remain green after integration

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Canvas not found | Check `CANVAS_SELECTOR` — some games use `#gameCanvas` |
| Timeout on load | Increase `timeout` in config. Check if game needs dev server. |
| Tests pass locally, fail in CI | Add `--headed` flag for debugging. Check viewport size. |
| Vite game doesn't load | Use `GAME_URL` with `npm run dev`, not static serving |
| Screenshots are blank | Wait for more frames before screenshot. Game may need loading time. |
| `getCanvasPixel` returns null | Game may use WebGL, not 2D context. Use `screenshot()` instead. |
