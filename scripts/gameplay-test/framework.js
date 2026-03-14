#!/usr/bin/env node
'use strict';

/**
 * Gameplay Testing Framework for Syntax Sorcery downstream games.
 *
 * Provides utilities to load HTML games in Node.js (no browser needed),
 * simulate player input, advance game loops, and assert game state.
 */

const { CanvasMock } = require('./canvas-mock');

// ---------------------------------------------------------------------------
// DOM Environment
// ---------------------------------------------------------------------------

function createDOMEnvironment(options = {}) {
  const width = options.width || 400;
  const height = options.height || 600;
  const canvas = new CanvasMock(width, height);

  const localStorage = createLocalStorageMock();
  const listeners = {};
  let rafCallbacks = [];
  let rafId = 0;
  let currentTime = 0;

  const document = {
    createElement(tag) {
      if (tag === 'canvas') return new CanvasMock(width, height);
      return { style: {}, setAttribute() {}, getAttribute() { return null; }, appendChild() {}, innerHTML: '' };
    },
    getElementById(id) {
      if (id === 'gameCanvas' || id === 'canvas' || id === 'game') return canvas;
      return null;
    },
    querySelector(sel) {
      if (sel === 'canvas' || sel === '#gameCanvas' || sel === '#canvas') return canvas;
      return null;
    },
    querySelectorAll() { return []; },
    addEventListener(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeEventListener(event, handler) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    body: {
      appendChild() {},
      removeChild() {},
      style: {},
      clientWidth: width,
      clientHeight: height,
    },
    documentElement: { style: {} },
    onkeydown: null,
    onkeyup: null,
  };

  const window = {
    document,
    canvas,
    localStorage,
    innerWidth: width,
    innerHeight: height,
    devicePixelRatio: 1,
    requestAnimationFrame(cb) {
      rafId++;
      rafCallbacks.push({ id: rafId, cb });
      return rafId;
    },
    cancelAnimationFrame(id) {
      rafCallbacks = rafCallbacks.filter(r => r.id !== id);
    },
    setTimeout(cb, ms) { return setTimeout(cb, ms); },
    clearTimeout(id) { clearTimeout(id); },
    setInterval(cb, ms) { return setInterval(cb, ms); },
    clearInterval(id) { clearInterval(id); },
    addEventListener(event, handler) { document.addEventListener(event, handler); },
    removeEventListener(event, handler) { document.removeEventListener(event, handler); },
    performance: { now() { return currentTime; } },
    navigator: { userAgent: 'GameTestRunner/1.0', language: 'en-US' },
    location: { href: 'http://localhost/test', hash: '', search: '' },
    screen: { width, height },
    Audio: function MockAudio() {
      return { play() { return Promise.resolve(); }, pause() {}, load() {}, addEventListener() {}, volume: 1, currentTime: 0 };
    },
    Image: function MockImage() {
      return { onload: null, onerror: null, src: '', width: 0, height: 0, addEventListener() {} };
    },
  };

  function dispatchEvent(target, eventType, eventData = {}) {
    const event = { type: eventType, preventDefault() {}, stopPropagation() {}, ...eventData };
    const targetListeners = listeners[eventType] || [];
    for (const handler of targetListeners) {
      handler(event);
    }
    const directHandler = document[`on${eventType}`];
    if (typeof directHandler === 'function') {
      directHandler(event);
    }
  }

  function advanceTime(ms) {
    currentTime += ms;
  }

  function flushRAF() {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    for (const { cb } of callbacks) {
      cb(currentTime);
    }
    return callbacks.length;
  }

  return {
    canvas,
    document,
    window,
    localStorage,
    listeners,
    dispatchEvent,
    advanceTime,
    flushRAF,
    getCurrentTime() { return currentTime; },
    getPendingRAFCount() { return rafCallbacks.length; },
  };
}

// ---------------------------------------------------------------------------
// LocalStorage mock
// ---------------------------------------------------------------------------

function createLocalStorageMock() {
  const store = {};
  return {
    getItem(key) { return store[key] !== undefined ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key(index) { return Object.keys(store)[index] || null; },
    _store: store,
  };
}

// ---------------------------------------------------------------------------
// GameTestRunner
// ---------------------------------------------------------------------------

class GameTestRunner {
  constructor(options = {}) {
    this.options = {
      width: options.width || 400,
      height: options.height || 600,
      fps: options.fps || 60,
      ...options,
    };
    this.env = null;
    this.frameTime = 1000 / this.options.fps;
    this.frameCount = 0;
    this.keysDown = new Set();
    this._gameState = {};
    this._stateWatchers = [];
  }

  setup() {
    this.env = createDOMEnvironment(this.options);
    this.frameCount = 0;
    this.keysDown.clear();
    this._gameState = {};
    return this;
  }

  teardown() {
    this.keysDown.clear();
    this._stateWatchers = [];
    this._gameState = {};
    this.env = null;
  }

  getCanvas() {
    this._ensureSetup();
    return this.env.canvas;
  }

  getContext() {
    return this.getCanvas().getContext('2d');
  }

  getEnvironment() {
    this._ensureSetup();
    return this.env;
  }

  // --- Input simulation ---

  simulateKeyPress(key, options = {}) {
    this._ensureSetup();
    this.keysDown.add(key);
    this.env.dispatchEvent(this.env.document, 'keydown', {
      key,
      code: options.code || keyToCode(key),
      keyCode: options.keyCode || keyToKeyCode(key),
      repeat: options.repeat || false,
    });
    return this;
  }

  simulateKeyRelease(key, options = {}) {
    this._ensureSetup();
    this.keysDown.delete(key);
    this.env.dispatchEvent(this.env.document, 'keyup', {
      key,
      code: options.code || keyToCode(key),
      keyCode: options.keyCode || keyToKeyCode(key),
    });
    return this;
  }

  simulateKeyTap(key, holdFrames = 1) {
    this.simulateKeyPress(key);
    this.tick(this.frameTime * holdFrames);
    this.simulateKeyRelease(key);
    return this;
  }

  simulateClick(x, y, options = {}) {
    this._ensureSetup();
    const eventBase = { clientX: x, clientY: y, pageX: x, pageY: y, button: 0, buttons: 1, ...options };
    this.env.canvas.dispatchEvent({ type: 'mousedown', ...eventBase, preventDefault() {}, stopPropagation() {} });
    this.env.canvas.dispatchEvent({ type: 'mouseup', ...eventBase, preventDefault() {}, stopPropagation() {} });
    this.env.canvas.dispatchEvent({ type: 'click', ...eventBase, preventDefault() {}, stopPropagation() {} });
    return this;
  }

  simulateTouch(x, y) {
    this._ensureSetup();
    const touch = { clientX: x, clientY: y, pageX: x, pageY: y, identifier: 0 };
    const eventBase = { touches: [touch], changedTouches: [touch], preventDefault() {}, stopPropagation() {} };
    this.env.canvas.dispatchEvent({ type: 'touchstart', ...eventBase });
    this.env.canvas.dispatchEvent({ type: 'touchend', ...eventBase });
    return this;
  }

  // --- Frame / time control ---

  tick(ms) {
    this._ensureSetup();
    if (ms === undefined) ms = this.frameTime;
    this.env.advanceTime(ms);
    this.env.flushRAF();
    this.frameCount++;
    this._checkWatchers();
    return this;
  }

  tickFrames(n) {
    for (let i = 0; i < n; i++) {
      this.tick(this.frameTime);
    }
    return this;
  }

  tickSeconds(seconds) {
    const totalFrames = Math.ceil(seconds * this.options.fps);
    return this.tickFrames(totalFrames);
  }

  // --- Canvas state inspection ---

  getCanvasState() {
    const ctx = this.getContext();
    return ctx.getImageData(0, 0, this.env.canvas.width, this.env.canvas.height);
  }

  getPixel(x, y) {
    const ctx = this.getContext();
    const data = ctx.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
  }

  hasContentInRegion(x, y, w, h) {
    const imageData = this.getContext().getImageData(x, y, w, h);
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) return true;
    }
    return false;
  }

  getRenderedText() {
    return this.getContext().getTextDrawn();
  }

  getDrawCalls(methodName) {
    return this.getContext().getCalls(methodName);
  }

  resetDrawCalls() {
    this.getContext().resetCalls();
    return this;
  }

  // --- Game state ---

  setGameState(key, value) {
    this._gameState[key] = value;
    return this;
  }

  getGameState(key) {
    return this._gameState[key];
  }

  assertScore(expected) {
    const texts = this.getRenderedText();
    const scoreStr = String(expected);
    const found = texts.some(t => t.includes(scoreStr));
    if (!found) {
      throw new GameAssertionError(
        `Expected score "${scoreStr}" in rendered text, but found: [${texts.join(', ')}]`
      );
    }
    return this;
  }

  assertState(key, expected) {
    const actual = this._gameState[key];
    if (actual !== expected) {
      throw new GameAssertionError(
        `Expected state "${key}" to be "${expected}", but was "${actual}"`
      );
    }
    return this;
  }

  assertGameOver() {
    const texts = this.getRenderedText();
    const gameOverPatterns = ['game over', 'you lose', 'you died', 'final score', 'try again', 'restart'];
    const found = texts.some(t =>
      gameOverPatterns.some(p => t.toLowerCase().includes(p))
    );
    if (!found && this._gameState.state !== 'over' && this._gameState.gameOver !== true) {
      throw new GameAssertionError(
        `Expected game over state, but no game-over indicators found. Text: [${texts.join(', ')}], State: ${JSON.stringify(this._gameState)}`
      );
    }
    return this;
  }

  assertGameRunning() {
    if (this._gameState.state === 'over' || this._gameState.gameOver === true) {
      throw new GameAssertionError(
        `Expected game to be running, but state indicates game over. State: ${JSON.stringify(this._gameState)}`
      );
    }
    return this;
  }

  async waitForGameState(predicate, timeoutMs = 5000) {
    this._ensureSetup();
    const maxFrames = Math.ceil(timeoutMs / this.frameTime);
    for (let i = 0; i < maxFrames; i++) {
      if (predicate(this)) return this;
      this.tick(this.frameTime);
    }
    throw new GameAssertionError(
      `waitForGameState timed out after ${timeoutMs}ms (${maxFrames} frames)`
    );
  }

  onTick(callback) {
    this._stateWatchers.push(callback);
    return this;
  }

  // --- localStorage helpers ---

  seedStorage(data) {
    this._ensureSetup();
    for (const [key, value] of Object.entries(data)) {
      this.env.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return this;
  }

  readStorage(key) {
    this._ensureSetup();
    return this.env.localStorage.getItem(key);
  }

  clearStorage() {
    this._ensureSetup();
    this.env.localStorage.clear();
    return this;
  }

  // --- Internal ---

  _ensureSetup() {
    if (!this.env) {
      throw new Error('GameTestRunner: call setup() before using the runner');
    }
  }

  _checkWatchers() {
    for (const watcher of this._stateWatchers) {
      watcher(this);
    }
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

class GameAssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GameAssertionError';
  }
}

// ---------------------------------------------------------------------------
// Key mapping
// ---------------------------------------------------------------------------

const KEY_CODE_MAP = {
  ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, ArrowDown: 40,
  Enter: 13, ' ': 32, Escape: 27, Tab: 9, Backspace: 8,
  a: 65, b: 66, c: 67, d: 68, e: 69, f: 70, g: 71, h: 72,
  i: 73, j: 74, k: 75, l: 76, m: 77, n: 78, o: 79, p: 80,
  q: 81, r: 82, s: 83, t: 84, u: 85, v: 86, w: 87, x: 88,
  y: 89, z: 90,
  '0': 48, '1': 49, '2': 50, '3': 51, '4': 52,
  '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,
};

function keyToKeyCode(key) {
  return KEY_CODE_MAP[key] || key.charCodeAt(0);
}

function keyToCode(key) {
  if (key.startsWith('Arrow')) return key;
  if (key === ' ') return 'Space';
  if (key === 'Enter') return 'Enter';
  if (key === 'Escape') return 'Escape';
  if (key.length === 1 && /[a-z]/i.test(key)) return `Key${key.toUpperCase()}`;
  if (key.length === 1 && /[0-9]/.test(key)) return `Digit${key}`;
  return key;
}

module.exports = {
  GameTestRunner,
  GameAssertionError,
  createDOMEnvironment,
  createLocalStorageMock,
};
