/**
 * Pixel-Bounce Gameplay Pilot Tests
 *
 * Proves the Syntax Sorcery gameplay testing framework (Phase 8, #75) can
 * instantiate and validate a REAL downstream game — pixel-bounce — without
 * any browser.  Uses GameTestRunner + CanvasMock + Node vm sandboxing.
 *
 * Issue: #89 — Pilot gameplay testing framework in pixel-bounce
 */

const { GameTestRunner } = require('../framework');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAME_SRC = fs.readFileSync(
  path.resolve('C:/Users/joperezd/GitHub Repos/pixel-bounce/game.js'),
  'utf-8',
);

// Bridge appended to game source — runs in the SAME script scope so it can
// access let/const variables.  Exposes them via `this.__game` (sandbox global).
const BRIDGE = `
;(function(){
  var self = this;
  self.__game = {
    get state()  { return state; },
    set state(v) { state = v; },
    get score()  { return score; },
    set score(v) { score = v; },
    get ball()   { return ball; },
    get keys()   { return keys; },
    get platforms()  { return platforms; },
    set platforms(v) { platforms = v; },
    get stars()      { return stars; },
    set stars(v)     { stars = v; },
    get particles()  { return particles; },
    get powerups()   { return powerups; },
    get stats()      { return stats; },
    get highScore()  { return highScore; },
    get cameraY()    { return cameraY; },
    set cameraY(v)   { cameraY = v; },
    get maxHeight()  { return maxHeight; },
    set maxHeight(v) { maxHeight = v; },
    get activePower()  { return activePower; },
    set activePower(v) { activePower = v; },
    get STATE()  { return STATE; },
    startGame: function(daily) { startGame(daily); },
    update:    function()      { update(); },
    draw:      function()      { draw(); },
  };
}).call(this);
`;

// ---------------------------------------------------------------------------
// Helper: load pixel-bounce inside a fresh vm sandbox wired to the framework
// ---------------------------------------------------------------------------

function loadGame(runner) {
  const env = runner.getEnvironment();
  const intervals = [];
  const timeouts = [];

  const sandbox = {
    document: env.document,
    window:   env.window,
    canvas:   env.canvas,
    localStorage: env.localStorage,

    requestAnimationFrame: env.window.requestAnimationFrame,
    cancelAnimationFrame:  env.window.cancelAnimationFrame,
    setTimeout(cb, ms)  { const id = setTimeout(cb, ms);  timeouts.push(id);  return id; },
    clearTimeout(id)    { clearTimeout(id); },
    setInterval(cb, ms) { const id = setInterval(cb, ms); intervals.push(id); return id; },
    clearInterval(id)   { clearInterval(id); },

    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    AudioContext:        MockAudioContext,
    webkitAudioContext:  MockAudioContext,
    Audio: env.window.Audio,
    Image: env.window.Image,
    io: undefined,

    Date, Math, console, JSON,
    parseInt, parseFloat, isNaN, isFinite,
    String, Number, Boolean, Object, Array, Map, Set,
    Promise, Error, TypeError, RangeError, RegExp,
    Uint8ClampedArray, Float32Array,
    Infinity, NaN, undefined,
    encodeURIComponent, decodeURIComponent,
  };

  sandbox.window.AudioContext       = MockAudioContext;
  sandbox.window.webkitAudioContext = MockAudioContext;
  sandbox.window.ResizeObserver     = sandbox.ResizeObserver;

  const ctx = vm.createContext(sandbox);
  vm.runInContext(GAME_SRC + BRIDGE, ctx);

  return {
    g: sandbox.__game,
    cleanup() {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    },
  };
}

// Minimal AudioContext mock
function MockAudioContext() {
  return {
    currentTime: 0,
    destination: {},
    createOscillator() {
      return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {} };
    },
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 1 }, connect() {} };
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Pixel-Bounce — Gameplay Pilot', () => {
  let runner;
  let game;
  let g;

  beforeEach(() => {
    runner = new GameTestRunner({ width: 400, height: 600, fps: 60 });
    runner.setup();
    game = loadGame(runner);
    g = game.g;
  });

  afterEach(() => {
    game.cleanup();
    runner.teardown();
  });

  // 1. Game initialization -------------------------------------------------
  describe('Game Initialization', () => {
    it('starts in TITLE state (STATE.TITLE = 0)', () => {
      expect(g.state).toBe(g.STATE.TITLE);
    });

    it('score is 0 at boot', () => {
      expect(g.score).toBe(0);
    });

    it('ball exists with default radius', () => {
      expect(g.ball).toBeDefined();
      expect(g.ball.r).toBe(8);
    });

    it('canvas context is usable', () => {
      const ctx = runner.getContext();
      expect(ctx.fillRect).toBeTypeOf('function');
    });
  });

  // 2. Starting a game -----------------------------------------------------
  describe('Game Start', () => {
    it('startGame() transitions to PLAY state', () => {
      g.startGame();
      expect(g.state).toBe(g.STATE.PLAY);
    });

    it('startGame() resets score to 0', () => {
      g.score = 42;
      g.startGame();
      expect(g.score).toBe(0);
    });

    it('startGame() positions ball near bottom', () => {
      g.startGame();
      expect(g.ball.y).toBe(500); // H(600) - 100
    });

    it('startGame() creates platforms', () => {
      g.startGame();
      expect(g.platforms.length).toBeGreaterThan(0);
    });
  });

  // 3. Player movement via keyboard ----------------------------------------
  describe('Player Movement', () => {
    it('ArrowLeft moves player left', () => {
      g.startGame();
      const startX = g.ball.x;

      g.keys['ArrowLeft'] = true;
      for (let i = 0; i < 10; i++) g.update();
      g.keys['ArrowLeft'] = false;

      expect(g.ball.x).toBeLessThan(startX);
    });

    it('ArrowRight moves player right', () => {
      g.startGame();
      const startX = g.ball.x;

      g.keys['ArrowRight'] = true;
      for (let i = 0; i < 10; i++) g.update();
      g.keys['ArrowRight'] = false;

      expect(g.ball.x).toBeGreaterThan(startX);
    });

    it('horizontal wrap: ball wraps from left edge to right', () => {
      g.startGame();
      g.ball.x = -10;
      g.ball.vx = 0;
      g.update();
      expect(g.ball.x).toBeGreaterThan(300);
    });
  });

  // 4. Platform collision ---------------------------------------------------
  describe('Collision Detection', () => {
    it('ball bounces upward when landing on a platform', () => {
      g.startGame();
      const plat = g.platforms[0];

      g.ball.x  = plat.x + plat.w / 2;
      g.ball.y  = plat.y - g.ball.r - 1;
      g.ball.vy = 5;
      g.ball.vx = 0;

      g.update();

      expect(g.ball.vy).toBeLessThan(0);
    });

    it('breakable platform breaks on contact', () => {
      g.startGame();
      const bp = { x: 150, y: 400, w: 80, h: 10, type: 'breakable', dir: 0, speed: 0, broken: false, pulse: 0 };
      g.platforms.push(bp);

      g.ball.x  = 190;
      g.ball.y  = bp.y - g.ball.r - 1;
      g.ball.vy = 5;
      g.ball.vx = 0;

      g.update();

      expect(bp.broken).toBe(true);
    });
  });

  // 5. Score incrementing ---------------------------------------------------
  describe('Scoring', () => {
    it('score increases as ball climbs higher', () => {
      g.startGame();
      expect(g.score).toBe(0);

      g.ball.vy = -10;
      for (let i = 0; i < 60; i++) g.update();

      expect(g.score).toBeGreaterThan(0);
    });

    it('collecting a star adds 25 to score', () => {
      g.startGame();
      // Tick a few frames so ball settles, then snapshot score
      for (let i = 0; i < 5; i++) g.update();
      const scoreBefore = g.score;

      g.stars.push({
        x: g.ball.x,
        y: g.ball.y,
        r: 5,
        pulse: 0,
        collected: false,
      });

      g.update();

      // Score increases by at least 25 (star) — may also gain height points
      expect(g.score).toBeGreaterThanOrEqual(scoreBefore + 25);
    });
  });

  // 6. Stats tracking (totalGames, totalDeaths) ----------------------------
  describe('Stats & Lives', () => {
    it('totalGames increments on startGame()', () => {
      const before = g.stats.totalGames;
      g.startGame();
      expect(g.stats.totalGames).toBe(before + 1);
    });

    it('totalDeaths increments on game over', () => {
      g.startGame();
      const deathsBefore = g.stats.totalDeaths;

      g.ball.y = g.cameraY + 700;
      g.activePower = null;
      g.update();

      expect(g.stats.totalDeaths).toBe(deathsBefore + 1);
    });
  });

  // 7. Game over state transition -------------------------------------------
  describe('Game Over', () => {
    it('transitions to OVER state when ball falls off screen', () => {
      g.startGame();
      expect(g.state).toBe(g.STATE.PLAY);

      g.ball.y = g.cameraY + 700;
      g.activePower = null;
      g.update();

      expect(g.state).toBe(g.STATE.OVER);
    });

    it('high score is saved to localStorage on game over', () => {
      g.startGame();

      g.ball.vy = -12;
      for (let i = 0; i < 120; i++) g.update();
      const earnedScore = g.score;
      expect(earnedScore).toBeGreaterThan(0);

      g.ball.y = g.cameraY + 700;
      g.activePower = null;
      g.update();

      const stored = parseInt(runner.readStorage('pb_hi') || '0', 10);
      expect(stored).toBeGreaterThanOrEqual(earnedScore);
    });
  });

  // 8. Game restart ---------------------------------------------------------
  describe('Game Restart', () => {
    it('can start a new game after game over', () => {
      g.startGame();

      g.ball.y = g.cameraY + 700;
      g.activePower = null;
      g.update();
      expect(g.state).toBe(g.STATE.OVER);

      g.startGame();
      expect(g.state).toBe(g.STATE.PLAY);
      expect(g.score).toBe(0);
      expect(g.ball.y).toBe(500);
    });
  });

  // 9. Shield power-up saves from death ------------------------------------
  describe('Power-ups', () => {
    it('shield prevents game over once', () => {
      g.startGame();
      g.activePower = { type: 'shield', timer: -1 };

      g.ball.y = g.cameraY + 700;
      g.update();

      expect(g.state).toBe(g.STATE.PLAY);
      expect(g.activePower).toBeNull();
    });
  });

  // 10. Draw calls — framework canvas mock records rendering ----------------
  describe('Rendering Validation', () => {
    it('draw() produces fillRect calls (background rendering)', () => {
      g.startGame();
      runner.resetDrawCalls();
      g.draw();

      const fillRects = runner.getDrawCalls('fillRect');
      expect(fillRects.length).toBeGreaterThan(0);
    });
  });
});
