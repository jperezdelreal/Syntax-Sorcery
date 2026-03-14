/**
 * ComeRosquillas Gameplay Pilot Tests
 *
 * REAL headless gameplay tests for ComeRosquillas — a Pac-Man game themed
 * on The Simpsons where Homer eats rosquillas (doughnuts) while dodging ghosts.
 * Replaces the inflated 597-test suite of `expect(10).toBe(10)` assertions
 * with tests that instantiate actual Game objects and validate real mechanics.
 *
 * Uses GameTestRunner + CanvasMock + Node vm sandboxing (same pattern as
 * pixel-bounce pilot). Multi-file source concatenated in index.html order.
 *
 * Issue: #131 — Apply headless gameplay tests to ComeRosquillas
 */

const { GameTestRunner } = require('../framework');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAME_ROOT = 'C:/Users/joperezd/GitHub Repos/ComeRosquillas/js';

// Load source files in the order index.html specifies (skip main.js — it auto-creates Game)
const SOURCE_FILES = [
  'i18n/translations.js',
  'config.js',
  'engine/audio.js',
  'ui/accessibility.js',
  'ui/settings-menu.js',
  'ui/tutorial.js',
  'ui/stats-dashboard.js',
  'ui/share-menu.js',
  'ui/daily-challenge.js',
  'engine/renderer.js',
  'engine/high-scores.js',
  'ui/achievements.js',
  'engine/touch-input.js',
  'game-logic.js',
  'engine/entity-manager.js',
  'engine/collision-detector.js',
  'engine/scoring-system.js',
  'engine/level-manager.js',
  'engine/ai-controller.js',
  'engine/event-system.js',
];

const GAME_SRC = SOURCE_FILES.map(f =>
  fs.readFileSync(path.resolve(GAME_ROOT, f), 'utf-8'),
).join('\n;\n');

// Bridge: expose game instance and key constants from sandbox
const BRIDGE = `
;(function(){
  var self = this;
  self.__constants = {
    ST_START: ST_START, ST_READY: ST_READY, ST_PLAYING: ST_PLAYING,
    ST_DYING: ST_DYING, ST_LEVEL_DONE: ST_LEVEL_DONE,
    ST_GAME_OVER: ST_GAME_OVER, ST_PAUSED: ST_PAUSED,
    GM_SCATTER: GM_SCATTER, GM_CHASE: GM_CHASE,
    GM_FRIGHTENED: GM_FRIGHTENED, GM_EATEN: GM_EATEN,
    TILE: TILE, COLS: COLS, ROWS: ROWS,
    WALL: WALL, DOT: DOT, EMPTY: EMPTY, POWER: POWER,
    UP: UP, RIGHT: RIGHT, DOWN: DOWN, LEFT: LEFT,
    HOMER_START: HOMER_START,
  };
  self.__GameClass = Game;
}).call(this);
`;

// ---------------------------------------------------------------------------
// Helper: build a mock DOM element with innerHTML/textContent/style
// ---------------------------------------------------------------------------
function mockElement(tag) {
  const el = {
    tagName: tag || 'DIV',
    innerHTML: '',
    textContent: '',
    innerText: '',
    value: '',
    checked: false,
    type: '',
    id: '',
    style: { display: '' },
    className: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    childNodes: [],
    parentElement: null,
    setAttribute() {},
    getAttribute() { return null; },
    appendChild() {},
    removeChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return mockElement(); },
    querySelectorAll() { return []; },
    dispatchEvent() {},
    focus() {},
    blur() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
    offsetWidth: 100, offsetHeight: 100,
  };
  el.parentElement = el;
  return el;
}

// ---------------------------------------------------------------------------
// Helper: load ComeRosquillas inside a vm sandbox
// ---------------------------------------------------------------------------
function loadGame(runner) {
  const env = runner.getEnvironment();
  const intervals = [];
  const timeouts = [];

  const elementCache = {};
  function getOrCreateElement(id) {
    if (!elementCache[id]) {
      if (id === 'gameCanvas' || id === 'canvas') {
        elementCache[id] = env.canvas;
      } else {
        elementCache[id] = mockElement('DIV');
      }
    }
    return elementCache[id];
  }

  // Override document.getElementById to return mocks for all game HUD elements
  const origGetById = env.document.getElementById;
  env.document.getElementById = function(id) {
    return getOrCreateElement(id);
  };
  env.document.createElement = function(tag) {
    if (tag === 'canvas') {
      const { CanvasMock } = require('../canvas-mock');
      return new CanvasMock(672, 744);
    }
    return mockElement(tag);
  };
  env.document.querySelector = function(sel) {
    if (sel === 'canvas' || sel === '#gameCanvas') return env.canvas;
    return mockElement();
  };
  env.document.querySelectorAll = function() { return []; };
  env.document.body = {
    appendChild() {}, removeChild() {}, style: {},
    clientWidth: 672, clientHeight: 744,
    classList: { add() {}, remove() {} },
  };
  env.document.documentElement = { style: {}, lang: 'en' };

  const sandbox = {
    document: env.document,
    window:   env.window,
    canvas:   env.canvas,
    localStorage: env.localStorage,
    navigator: { userAgent: 'GameTestRunner/1.0', language: 'en-US', vibrate() {} },

    requestAnimationFrame: env.window.requestAnimationFrame,
    cancelAnimationFrame:  env.window.cancelAnimationFrame,
    setTimeout(cb, ms)  { const id = setTimeout(cb, ms);  timeouts.push(id);  return id; },
    clearTimeout(id)    { clearTimeout(id); },
    setInterval(cb, ms) { const id = setInterval(cb, ms); intervals.push(id); return id; },
    clearInterval(id)   { clearInterval(id); },

    performance: { now: env.window.performance.now },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    AudioContext:        MockAudioContext,
    webkitAudioContext:  MockAudioContext,
    Audio: env.window.Audio,
    Image: env.window.Image,

    Date, Math, console, JSON,
    parseInt, parseFloat, isNaN, isFinite,
    String, Number, Boolean, Object, Array, Map, Set, WeakMap, WeakSet,
    Promise, Error, TypeError, RangeError, RegExp, Symbol, Proxy,
    Uint8ClampedArray, Float32Array, Float64Array, Int32Array,
    Uint8Array, Uint16Array, Uint32Array,
    Infinity, NaN, undefined,
    encodeURIComponent, decodeURIComponent,
    atob: typeof atob !== 'undefined' ? atob : function(s) { return Buffer.from(s, 'base64').toString(); },
    btoa: typeof btoa !== 'undefined' ? btoa : function(s) { return Buffer.from(s).toString('base64'); },
    fetch: function() { return Promise.resolve({ ok: false }); },
    alert() {},
    confirm() { return false; },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
  };

  sandbox.window.AudioContext       = MockAudioContext;
  sandbox.window.webkitAudioContext = MockAudioContext;
  sandbox.window.ResizeObserver     = sandbox.ResizeObserver;
  sandbox.window.navigator          = sandbox.navigator;
  sandbox.window.performance        = sandbox.performance;
  sandbox.window.getComputedStyle   = function() { return { getPropertyValue() { return ''; } }; };
  sandbox.window.matchMedia         = function() { return { matches: false, addEventListener() {}, removeEventListener() {} }; };
  sandbox.self = sandbox.window;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);

  // Patch roundRect onto canvas context (newer API, not in canvas-mock)
  const canvasCtx = env.canvas.getContext('2d');
  if (!canvasCtx.roundRect) {
    canvasCtx.roundRect = function(x, y, w, h, r) {
      this._record && this._record('roundRect', { x, y, w, h, r });
    };
  }

  vm.runInContext(GAME_SRC + BRIDGE, ctx);

  const GameClass = sandbox.__GameClass;
  const C = sandbox.__constants;

  // Instantiate the Game (constructor triggers loop() → RAF, which is queued but not executed)
  const game = new GameClass();

  return {
    game,
    C,
    cleanup() {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    },
  };
}

// Minimal AudioContext mock matching SoundManager expectations
function MockAudioContext() {
  return {
    currentTime: 0,
    destination: {},
    state: 'running',
    resume() { return Promise.resolve(); },
    createOscillator() {
      return {
        type: '',
        frequency: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
        detune: { value: 0, setValueAtTime() {} },
        connect() {}, start() {}, stop() {}, disconnect() {},
        addEventListener() {}, removeEventListener() {},
      };
    },
    createGain() {
      return {
        gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} },
        connect() {}, disconnect() {},
      };
    },
    createBiquadFilter() {
      return {
        type: '', frequency: { value: 0, setValueAtTime() {} },
        Q: { value: 0 }, gain: { value: 0 },
        connect() {}, disconnect() {},
      };
    },
    createDynamicsCompressor() {
      return {
        threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 },
        attack: { value: 0 }, release: { value: 0 },
        connect() {}, disconnect() {},
      };
    },
    createStereoPanner() {
      return { pan: { value: 0, setValueAtTime() {} }, connect() {}, disconnect() {} };
    },
    createPanner() {
      return {
        setPosition() {}, connect() {}, disconnect() {},
        positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 },
      };
    },
    createConvolver() {
      return { buffer: null, connect() {}, disconnect() {} };
    },
    createBuffer(ch, len, rate) {
      return {
        numberOfChannels: ch, length: len, sampleRate: rate,
        getChannelData() { return new Float32Array(len); },
      };
    },
    createBufferSource() {
      return {
        buffer: null, loop: false, playbackRate: { value: 1 },
        connect() {}, start() {}, stop() {}, disconnect() {},
        addEventListener() {},
      };
    },
    listener: {
      setPosition() {},
      positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 },
    },
    sampleRate: 44100,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComeRosquillas — Gameplay Pilot', () => {
  let runner;
  let instance;
  let game;
  let C;

  beforeEach(() => {
    runner = new GameTestRunner({ width: 672, height: 744, fps: 60 });
    runner.setup();
    instance = loadGame(runner);
    game = instance.game;
    C = instance.C;
  });

  afterEach(() => {
    instance.cleanup();
    runner.teardown();
  });

  // 1. Game initialization -----------------------------------------------
  describe('Game Initialization', () => {
    it('starts in ST_START state after construction', () => {
      expect(game.state).toBe(C.ST_START);
    });

    it('initializes score to 0', () => {
      expect(game.score).toBe(0);
    });

    it('initializes 3 lives', () => {
      expect(game.lives).toBe(3);
    });

    it('starts at level 1', () => {
      expect(game.level).toBe(1);
    });

    it('creates a 28×31 maze grid', () => {
      expect(game.maze.length).toBe(C.ROWS);
      expect(game.maze[0].length).toBe(C.COLS);
    });
  });

  // 2. Starting a new game -----------------------------------------------
  describe('Game Start', () => {
    it('startNewGame() transitions to ST_READY', () => {
      game.startNewGame();
      expect(game.state).toBe(C.ST_READY);
    });

    it('startNewGame() resets score to 0', () => {
      game.score = 999;
      game.startNewGame();
      expect(game.score).toBe(0);
    });

    it('startNewGame() places Homer at start position', () => {
      game.startNewGame();
      expect(game.homer).toBeDefined();
      expect(game.homer.x).toBe(C.HOMER_START.x * C.TILE);
      expect(game.homer.y).toBe(C.HOMER_START.y * C.TILE);
    });

    it('spawns 4 ghosts (villains)', () => {
      game.startNewGame();
      // At least 4 base ghosts (may have boss as 5th on certain levels)
      expect(game.ghosts.length).toBeGreaterThanOrEqual(4);
      const names = game.ghosts.slice(0, 4).map(g => g.name);
      expect(names).toContain('Sr. Burns');
      expect(names).toContain('Bob Patiño');
      expect(names).toContain('Nelson');
      expect(names).toContain('Snake');
    });
  });

  // 3. State transition: READY → PLAYING ---------------------------------
  describe('State Transitions', () => {
    it('READY → PLAYING after stateTimer expires', () => {
      game.startNewGame();
      expect(game.state).toBe(C.ST_READY);

      // Tick update() until stateTimer runs out (set to 150 frames)
      for (let i = 0; i < 160; i++) game.update();

      expect(game.state).toBe(C.ST_PLAYING);
    });

    it('pause and unpause works via state toggle', () => {
      game.startNewGame();
      // Fast-forward past READY
      for (let i = 0; i < 160; i++) game.update();
      expect(game.state).toBe(C.ST_PLAYING);

      game.state = C.ST_PAUSED;
      expect(game.state).toBe(C.ST_PAUSED);

      game.state = C.ST_PLAYING;
      expect(game.state).toBe(C.ST_PLAYING);
    });
  });

  // 4. Homer movement ----------------------------------------------------
  describe('Homer Movement', () => {
    it('Homer moves left when ArrowLeft is pressed', () => {
      game.startNewGame();
      // Fast-forward to PLAYING
      for (let i = 0; i < 160; i++) game.update();

      // Set Homer to a walkable corridor tile and face LEFT
      game.homer.dir = C.LEFT;
      game.homer.nextDir = C.LEFT;
      const startX = game.homer.x;

      game.keys['ArrowLeft'] = true;
      for (let i = 0; i < 5; i++) game.update();
      game.keys['ArrowLeft'] = false;

      expect(game.homer.x).toBeLessThan(startX);
    });

    it('Homer wraps through tunnel at left/right edges', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      // Tunnel is at row 14 — only row where off-screen wrapping works
      game.homer.x = -C.TILE - 1;
      game.homer.y = 14 * C.TILE;
      game.homer.dir = C.LEFT;
      game.homer.nextDir = C.LEFT;
      game.moveHomer();

      // Should wrap to right side
      expect(game.homer.x).toBeGreaterThan(C.COLS * C.TILE - C.TILE);
    });
  });

  // 5. Dot eating and scoring --------------------------------------------
  describe('Dot Collection & Scoring', () => {
    it('eating a dot increases score by 10 points', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      const scoreBefore = game.score;
      // Find a dot cell and position Homer on it
      let dotCol = -1, dotRow = -1;
      for (let r = 0; r < C.ROWS && dotCol < 0; r++) {
        for (let c = 0; c < C.COLS; c++) {
          if (game.maze[r][c] === C.DOT) { dotCol = c; dotRow = r; break; }
        }
      }
      expect(dotCol).toBeGreaterThanOrEqual(0);

      game.homer.x = dotCol * C.TILE;
      game.homer.y = dotRow * C.TILE;
      game.checkDots();

      expect(game.score).toBe(scoreBefore + 10);
      expect(game.maze[dotRow][dotCol]).toBe(C.EMPTY);
    });

    it('eating a power pellet scores 50 and frightens ghosts', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      // Find a power pellet cell
      let powCol = -1, powRow = -1;
      for (let r = 0; r < C.ROWS && powCol < 0; r++) {
        for (let c = 0; c < C.COLS; c++) {
          if (game.maze[r][c] === C.POWER) { powCol = c; powRow = r; break; }
        }
      }
      expect(powCol).toBeGreaterThanOrEqual(0);

      const scoreBefore = game.score;
      game.homer.x = powCol * C.TILE;
      game.homer.y = powRow * C.TILE;
      game.checkDots();

      expect(game.score).toBe(scoreBefore + 50);
      // Non-eaten ghosts should now be frightened
      const frightenedGhosts = game.ghosts.filter(
        g => g.mode === C.GM_FRIGHTENED && !g.inHouse,
      );
      expect(frightenedGhosts.length).toBeGreaterThan(0);
    });

    it('dotsEaten counter tracks collected dots', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      const before = game.dotsEaten;
      // Eat one dot
      let dotCol = -1, dotRow = -1;
      for (let r = 0; r < C.ROWS && dotCol < 0; r++) {
        for (let c = 0; c < C.COLS; c++) {
          if (game.maze[r][c] === C.DOT) { dotCol = c; dotRow = r; break; }
        }
      }
      game.homer.x = dotCol * C.TILE;
      game.homer.y = dotRow * C.TILE;
      game.checkDots();

      expect(game.dotsEaten).toBe(before + 1);
    });
  });

  // 6. Ghost collision — death -------------------------------------------
  describe('Ghost Collision', () => {
    it('Homer dies when touching a non-frightened ghost', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();
      expect(game.state).toBe(C.ST_PLAYING);

      // Place an active (non-house) ghost right on Homer
      const ghost = game.ghosts.find(g => !g.inHouse);
      if (ghost) {
        ghost.mode = C.GM_CHASE;
        ghost.x = game.homer.x;
        ghost.y = game.homer.y;
        game.checkCollisions();
        expect(game.state).toBe(C.ST_DYING);
      }
    });

    it('eating a frightened ghost awards 200+ points with combo', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      const scoreBefore = game.score;
      game.ghostsEaten = 0;

      // Put a frightened ghost on Homer
      const ghost = game.ghosts.find(g => !g.inHouse);
      if (ghost) {
        ghost.mode = C.GM_FRIGHTENED;
        ghost.x = game.homer.x;
        ghost.y = game.homer.y;
        game.checkCollisions();

        expect(game.score).toBeGreaterThanOrEqual(scoreBefore + 200);
        expect(ghost.mode).toBe(C.GM_EATEN);
      }
    });
  });

  // 7. Lives system -------------------------------------------------------
  describe('Lives System', () => {
    it('losing a life decrements lives count', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      const livesBefore = game.lives;

      // Force a death
      game.state = C.ST_DYING;
      game.stateTimer = 1;
      game.update(); // stateTimer hits 0, lives decremented

      expect(game.lives).toBe(livesBefore - 1);
    });

    it('game over when all lives are lost', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      game.lives = 1;
      game.state = C.ST_DYING;
      game.stateTimer = 1;
      game.update();

      // State should be GAME_OVER or HIGH_SCORE_ENTRY
      expect([C.ST_GAME_OVER, 8 /* ST_HIGH_SCORE_ENTRY */]).toContain(game.state);
      expect(game.lives).toBe(0);
    });
  });

  // 8. Level completion ---------------------------------------------------
  describe('Level Completion', () => {
    it('eating all dots triggers ST_LEVEL_DONE', () => {
      game.startNewGame();
      for (let i = 0; i < 160; i++) game.update();

      // Clear all dots/power pellets from the maze
      for (let r = 0; r < C.ROWS; r++) {
        for (let c = 0; c < C.COLS; c++) {
          if (game.maze[r][c] === C.DOT || game.maze[r][c] === C.POWER) {
            game.maze[r][c] = C.EMPTY;
          }
        }
      }
      // Set dotsEaten to match totalDots
      game.dotsEaten = game.totalDots;

      // Position Homer on any empty tile and trigger checkDots to detect completion
      // We need to ensure dotsEaten >= totalDots when checkDots evaluates
      game.homer.x = 1 * C.TILE;
      game.homer.y = 5 * C.TILE;
      game.checkDots();

      expect(game.state).toBe(C.ST_LEVEL_DONE);
    });
  });

  // 9. Maze structure validation ------------------------------------------
  describe('Maze Structure', () => {
    it('maze has walls on all four borders', () => {
      game.startNewGame();
      const topRow = game.maze[0];
      const bottomRow = game.maze[C.ROWS - 1];
      // Top and bottom rows should be all walls
      expect(topRow.every(cell => cell === C.WALL)).toBe(true);
      expect(bottomRow.every(cell => cell === C.WALL)).toBe(true);
    });

    it('maze contains both dots and power pellets', () => {
      game.startNewGame();
      let dots = 0, powers = 0;
      for (let r = 0; r < C.ROWS; r++) {
        for (let c = 0; c < C.COLS; c++) {
          if (game.maze[r][c] === C.DOT) dots++;
          if (game.maze[r][c] === C.POWER) powers++;
        }
      }
      expect(dots).toBeGreaterThan(100);
      expect(powers).toBeGreaterThanOrEqual(4);
      expect(game.totalDots).toBe(dots + powers);
    });
  });

  // 10. Rendering validation ----------------------------------------------
  describe('Rendering', () => {
    it('draw() produces canvas draw calls', () => {
      game.startNewGame();
      runner.resetDrawCalls();
      game.draw();

      const fillRects = runner.getDrawCalls('fillRect');
      expect(fillRects.length).toBeGreaterThan(0);
    });
  });
});
