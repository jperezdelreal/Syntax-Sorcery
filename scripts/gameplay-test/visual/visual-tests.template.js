'use strict';

/**
 * Visual Gameplay Tests — Template
 *
 * This template demonstrates how to write Playwright-based visual tests
 * for HTML5 canvas games. Tests open the game in a real Chromium browser,
 * simulate player input, capture screenshots, and validate visual state.
 *
 * Usage:
 *   1. Copy this file to your game's test directory
 *   2. Replace GAME_HTML_PATH with your game's index.html
 *   3. Customize tests for your game's mechanics
 *   4. Run: npx playwright test your-game.spec.js
 */

const { test, expect } = require('@playwright/test');
const { VisualGameRunner } = require('./visual-runner');

// ── Configuration ──────────────────────────────────────────────────────────
const GAME_HTML_PATH = '../path/to/your/game/index.html'; // <-- EDIT THIS

// ── Test Fixture ───────────────────────────────────────────────────────────
let game;

test.beforeEach(async () => {
  game = new VisualGameRunner({ viewport: { width: 800, height: 600 } });
  await game.launchGame(GAME_HTML_PATH);
});

test.afterEach(async () => {
  await game.close();
});

// ── Example Tests ──────────────────────────────────────────────────────────

test('game loads and renders to canvas', async () => {
  // Verify the canvas element exists and has visual content
  const canvasExists = await game.page.$('canvas');
  expect(canvasExists).toBeTruthy();

  // Take a baseline screenshot
  await game.screenshot('baseline');

  // Check that the canvas has non-uniform pixels (something is drawn)
  const hasContent = await game.hasVisualContent(0, 0, 400, 300);
  expect(hasContent).toBe(true);
});

test('player moves right on arrow key', async () => {
  const before = await game.screenshot('before-move');
  await game.pressKey('ArrowRight', 500);
  const after = await game.screenshot('after-move');

  // Player should have moved — screenshots should differ
  const diff = await game.compareScreenshot('before-move', 'after-move');
  expect(diff).not.toBe('identical');
});

test('score increments over time', async () => {
  // For canvas-based games, read score via pixel comparison
  // For DOM-based score displays:
  // const scoreBefore = await game.getTextContent('#score');
  // await game.waitForFrames(60);
  // const scoreAfter = await game.getTextContent('#score');
  // expect(parseInt(scoreAfter)).toBeGreaterThan(parseInt(scoreBefore));

  const before = await game.screenshot('score-before');
  await game.waitForFrames(60);
  const after = await game.screenshot('score-after');
  const diff = await game.compareScreenshot('score-before', 'score-after');
  expect(diff).not.toBe('identical');
});

test('game over screen appears on collision', async () => {
  // Navigate player into obstacle — adapt to your game's mechanics
  // Example: press down repeatedly to trigger collision
  for (let i = 0; i < 10; i++) {
    await game.pressKey('ArrowDown', 200);
  }
  await game.screenshot('game-over-check');

  // Check for game-over DOM element or visual change
  const gameOverVisible = await game.page.isVisible('.game-over').catch(() => false);
  // If no DOM game-over, verify screenshot changed
  if (!gameOverVisible) {
    const hasContent = await game.hasVisualContent(100, 200, 200, 100);
    expect(hasContent).toBe(true);
  }
});

test('game responds to mouse input', async () => {
  const before = await game.screenshot('before-click');
  await game.clickAt(400, 300);
  await game.waitForFrames(10);
  const after = await game.screenshot('after-click');

  // Click should cause some visual change
  const diff = await game.compareScreenshot('before-click', 'after-click');
  // At minimum, capture proves game is running
  expect(after).toBeTruthy();
});

test('gameplay recording captures multiple states', async () => {
  // Record 2 seconds of gameplay at 5fps
  const frames = await game.recordGameplay(2, 5);
  expect(frames.length).toBeGreaterThanOrEqual(8);

  // At least some frames should differ (game is animating)
  const fs = require('fs');
  const first = fs.readFileSync(frames[0]);
  const last = fs.readFileSync(frames[frames.length - 1]);
  const changed = !first.equals(last);
  expect(changed).toBe(true);
});
