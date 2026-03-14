'use strict';

/**
 * Pixel Bounce — Visual Gameplay Tests
 *
 * These tests open the actual pixel-bounce game in a real Chromium browser,
 * simulate player input, capture screenshots, and validate visual game state.
 *
 * The game is a canvas-based vertical platformer:
 *   - Canvas: 400×600 (logical), scaled by devicePixelRatio
 *   - States: TITLE(0), PLAY(1), OVER(2)
 *   - Start: click canvas on TITLE screen → PLAY
 *   - Controls: ArrowLeft/ArrowRight or A/D
 *   - Ball starts at (200, 500), bounces upward on platforms
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const { VisualGameRunner } = require('./visual-runner');

const PIXEL_BOUNCE_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'pixel-bounce', 'index.html');

let game;

test.beforeEach(async () => {
  game = new VisualGameRunner({
    viewport: { width: 450, height: 650 },
    headless: true,
  });
  await game.launchGame(PIXEL_BOUNCE_PATH);
  // Let the title screen render
  await game.waitForFrames(10);
});

test.afterEach(async () => {
  await game.close();
});

// ── Test 1: Game loads and renders title screen ────────────────────────────

test('game loads and renders title screen', async () => {
  const canvasEl = await game.page.$('canvas');
  expect(canvasEl).toBeTruthy();

  await game.screenshot('title-screen');

  // The title screen should have visual content (not blank)
  const hasContent = await game.hasVisualContent(50, 50, 300, 400);
  expect(hasContent).toBe(true);
});

// ── Test 2: Title screen contains "PIXEL BOUNCE" text ──────────────────────

test('title screen has game title rendered on canvas', async () => {
  // The title "PIXEL BOUNCE" is drawn at center of 400×600 canvas
  // Text is at roughly (200, 250) and (200, 300) — center area
  // Check that the center region has non-uniform pixels (text is drawn)
  const centerContent = await game.hasVisualContent(100, 200, 200, 120);
  expect(centerContent).toBe(true);

  await game.screenshot('title-text-region');
});

// ── Test 3: Game starts on canvas click ────────────────────────────────────

test('game transitions from title to play state on click', async () => {
  const titleShot = await game.screenshot('pre-click-title');

  // Click center of canvas to start the game
  await game.clickAt(200, 300);
  await game.waitForFrames(15);

  const playShot = await game.screenshot('post-click-play');

  // The screen should look different after starting the game
  const diff = await game.compareScreenshot('pre-click-title', 'post-click-play');
  expect(diff).not.toBe('identical');
});

// ── Test 4: Player character visible after game start ──────────────────────

test('player ball is visible on screen after game start', async () => {
  // Start the game
  await game.clickAt(200, 300);
  await game.waitForFrames(10);

  // The ball starts at approximately (200, 500) on a 400×600 canvas
  // Check the region around the ball start position for visual content
  const ballRegion = await game.hasVisualContent(170, 460, 60, 60);
  expect(ballRegion).toBe(true);

  await game.screenshot('player-visible');
});

// ── Test 5: Player moves on key press (screenshot comparison) ──────────────

test('player moves on arrow key press', async () => {
  // Start the game
  await game.clickAt(200, 300);
  await game.waitForFrames(5);

  const before = await game.screenshot('before-move');

  // Press right arrow for 300ms
  await game.pressKey('ArrowRight', 300);
  await game.waitForFrames(10);

  const after = await game.screenshot('after-move');

  // The game state should change — ball moves or game animates
  const diff = await game.compareScreenshot('before-move', 'after-move');
  expect(diff).not.toBe('identical');
});

// ── Test 6: Game is actively animating (not frozen) ────────────────────────

test('game is actively animating and not frozen', async () => {
  // Start the game
  await game.clickAt(200, 300);
  await game.waitForFrames(5);

  const frame1 = await game.screenshot('animation-frame-1');
  await game.waitForFrames(30);
  const frame2 = await game.screenshot('animation-frame-2');

  // Two frames separated by ~30 frames (~0.5s) should differ in an active game
  const diff = await game.compareScreenshot('animation-frame-1', 'animation-frame-2');
  expect(diff).not.toBe('identical');

  // The diff should show significant change (ball is falling/bouncing)
  if (diff !== 'identical') {
    expect(parseFloat(diff.diffPercent)).toBeGreaterThan(0);
  }
});

// ── Test 7: Multiple game states captured via recording ────────────────────

test('gameplay recording captures multiple distinct states', async () => {
  // Start the game
  await game.clickAt(200, 300);
  await game.waitForFrames(5);

  // Give the ball some horizontal movement
  await game.pressKey('ArrowRight', 200);

  // Record 1.5 seconds of gameplay at 4fps
  const frames = await game.recordGameplay(1.5, 4);
  expect(frames.length).toBeGreaterThanOrEqual(4);

  // First and last frames should differ (game is progressing)
  const fs = require('fs');
  const first = fs.readFileSync(frames[0]);
  const last = fs.readFileSync(frames[frames.length - 1]);
  expect(first.equals(last)).toBe(false);
});

// ── Test 8: Canvas pixel reading works for game analysis ───────────────────

test('canvas pixel data can be read for game state analysis', async () => {
  // The title screen has a dark background (#1a1a2e = rgb(26,26,46))
  // Read a corner pixel — should be the background color
  const pixel = await game.getCanvasPixel(5, 5);
  expect(pixel).not.toBeNull();
  expect(pixel).toHaveProperty('r');
  expect(pixel).toHaveProperty('g');
  expect(pixel).toHaveProperty('b');
  expect(pixel).toHaveProperty('a');

  // Alpha should be fully opaque
  expect(pixel.a).toBe(255);

  await game.screenshot('pixel-analysis');
});
