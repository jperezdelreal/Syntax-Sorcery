'use strict';

/**
 * ComeRosquillas — Visual Gameplay Tests
 *
 * These tests open the ComeRosquillas (Homer's Donut Quest) game in a real
 * Chromium browser, simulate player input, capture screenshots, and validate
 * visual game state.
 *
 * The game is a Pac-Man clone themed on The Simpsons:
 *   - Canvas: 672×744 (#gameCanvas), 28 columns × 31 rows × 24px tiles
 *   - States: START(0), READY(1), PLAYING(2), DYING(3), LEVEL_DONE(4), GAME_OVER(5), PAUSED(6)
 *   - Start: press ENTER on start screen → READY → PLAYING
 *   - Controls: Arrow keys (move Homer), P (pause), ENTER (start/continue)
 *   - HUD: DOM elements for score (#scoreDisplay), level (#levelDisplay), lives (#livesIcons)
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const { VisualGameRunner } = require('./visual-runner');

const COMEROSQUILLAS_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'ComeRosquillas', 'index.html');

let game;

test.beforeEach(async () => {
  game = new VisualGameRunner({
    viewport: { width: 750, height: 900 },
    headless: true,
  });
  await game.launchGame(COMEROSQUILLAS_PATH);
  // Let the start screen render
  await game.waitForFrames(15);
});

test.afterEach(async () => {
  await game.close();
});

// ── Test 1: Game loads and renders the maze ────────────────────────────────

test('game loads and renders the maze on canvas', async () => {
  const canvasEl = await game.page.$('#gameCanvas');
  expect(canvasEl).toBeTruthy();

  await game.screenshot('cr-start-screen');

  // The maze should be drawn — canvas has non-uniform pixels
  const hasContent = await game.hasVisualContent(50, 50, 400, 400);
  expect(hasContent).toBe(true);
});

// ── Test 2: HUD elements are present and visible ───────────────────────────

test('HUD displays score, level, and lives', async () => {
  const scoreText = await game.getTextContent('#scoreDisplay');
  expect(scoreText).not.toBeNull();

  const levelText = await game.getTextContent('#levelDisplay');
  expect(levelText).not.toBeNull();

  const livesEl = await game.page.$('#livesIcons');
  expect(livesEl).toBeTruthy();

  await game.screenshot('cr-hud-elements');
});

// ── Test 3: Game starts on ENTER key press ─────────────────────────────────

test('game transitions from start screen on ENTER', async () => {
  const beforeShot = await game.screenshot('cr-before-enter');

  // Press ENTER to start the game
  await game.pressKey('Enter', 100);
  await game.waitForFrames(30);

  const afterShot = await game.screenshot('cr-after-enter');

  // The screen should change after starting (READY → PLAYING transition)
  const diff = await game.compareScreenshot('cr-before-enter', 'cr-after-enter');
  expect(diff).not.toBe('identical');
});

// ── Test 4: Homer (player) is visible on the maze ──────────────────────────

test('Homer is visible on the maze after game starts', async () => {
  // Start the game
  await game.pressKey('Enter', 100);
  await game.waitForFrames(60);

  // Homer starts at tile (14, 23) → pixel approx (14*24, 23*24) = (336, 552)
  // Check region around Homer's start position
  const homerRegion = await game.hasVisualContent(300, 520, 80, 80);
  expect(homerRegion).toBe(true);

  await game.screenshot('cr-homer-visible');
});

// ── Test 5: Player movement causes visual change ───────────────────────────

test('arrow key input causes visual change', async () => {
  // Start the game
  await game.pressKey('Enter', 100);
  await game.waitForFrames(60);

  const before = await game.screenshot('cr-before-move');

  // Press left arrow to move Homer
  await game.pressKey('ArrowLeft', 300);
  await game.waitForFrames(20);

  const after = await game.screenshot('cr-after-move');

  // Game state should visually change (Homer moving, dots eaten, animation)
  const diff = await game.compareScreenshot('cr-before-move', 'cr-after-move');
  expect(diff).not.toBe('identical');
});

// ── Test 6: Game is actively animating ─────────────────────────────────────

test('game animation loop is running (not frozen)', async () => {
  // Start the game
  await game.pressKey('Enter', 100);
  await game.waitForFrames(60);

  const frame1 = await game.screenshot('cr-frame-1');
  await game.waitForFrames(30);
  const frame2 = await game.screenshot('cr-frame-2');

  // Consecutive frames should differ — ghosts move, animations play
  const diff = await game.compareScreenshot('cr-frame-1', 'cr-frame-2');
  expect(diff).not.toBe('identical');

  if (diff !== 'identical') {
    expect(parseFloat(diff.diffPercent)).toBeGreaterThan(0);
  }
});
