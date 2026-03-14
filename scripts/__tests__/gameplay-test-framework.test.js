'use strict';

/**
 * Tests for scripts/gameplay-test/ framework.
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach, afterEach are global).
 */

const { GameTestRunner, GameAssertionError, createDOMEnvironment, createLocalStorageMock } = require('../gameplay-test/framework');
const { CanvasMock, CanvasRenderingContext2DMock, parseColor } = require('../gameplay-test/canvas-mock');

// ===========================================================================
// Canvas Mock Tests
// ===========================================================================

describe('CanvasMock', () => {
  it('should create a canvas with default dimensions', () => {
    const canvas = new CanvasMock();
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(600);
  });

  it('should create a canvas with custom dimensions', () => {
    const canvas = new CanvasMock(800, 450);
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(450);
  });

  it('should return a 2d context', () => {
    const canvas = new CanvasMock();
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeInstanceOf(CanvasRenderingContext2DMock);
  });

  it('should return null for unsupported context types', () => {
    const canvas = new CanvasMock();
    expect(canvas.getContext('webgl')).toBeNull();
    expect(canvas.getContext('3d')).toBeNull();
  });

  it('should provide getBoundingClientRect', () => {
    const canvas = new CanvasMock(320, 240);
    const rect = canvas.getBoundingClientRect();
    expect(rect.width).toBe(320);
    expect(rect.height).toBe(240);
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
  });

  it('should dispatch and receive events', () => {
    const canvas = new CanvasMock();
    let received = false;
    canvas.addEventListener('click', () => { received = true; });
    canvas.dispatchEvent({ type: 'click' });
    expect(received).toBe(true);
  });

  it('should remove event listeners', () => {
    const canvas = new CanvasMock();
    let count = 0;
    const handler = () => { count++; };
    canvas.addEventListener('click', handler);
    canvas.dispatchEvent({ type: 'click' });
    expect(count).toBe(1);
    canvas.removeEventListener('click', handler);
    canvas.dispatchEvent({ type: 'click' });
    expect(count).toBe(1);
  });
});

describe('CanvasRenderingContext2DMock', () => {
  let canvas, ctx;

  beforeEach(() => {
    canvas = new CanvasMock(100, 100);
    ctx = canvas.getContext('2d');
  });

  it('should track fillRect calls', () => {
    ctx.fillRect(10, 20, 50, 30);
    const calls = ctx.getCalls('fillRect');
    expect(calls).toHaveLength(1);
    expect(calls[0].args).toEqual({ x: 10, y: 20, w: 50, h: 30 });
  });

  it('should track multiple draw calls', () => {
    ctx.fillRect(0, 0, 10, 10);
    ctx.strokeRect(5, 5, 20, 20);
    ctx.clearRect(0, 0, 100, 100);
    expect(ctx.getCalls()).toHaveLength(3);
    expect(ctx.getCalls('fillRect')).toHaveLength(1);
    expect(ctx.getCalls('strokeRect')).toHaveLength(1);
    expect(ctx.getCalls('clearRect')).toHaveLength(1);
  });

  it('should track fillText and return drawn text', () => {
    ctx.fillText('Score: 42', 10, 20);
    ctx.fillText('Game Over', 50, 50);
    const texts = ctx.getTextDrawn();
    expect(texts).toEqual(['Score: 42', 'Game Over']);
  });

  it('should return last call for a method', () => {
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillRect(10, 10, 5, 5);
    const last = ctx.getLastCall('fillRect');
    expect(last.args).toEqual({ x: 10, y: 10, w: 5, h: 5 });
  });

  it('should return null for getLastCall with no matching calls', () => {
    expect(ctx.getLastCall('arc')).toBeNull();
  });

  it('should reset call history', () => {
    ctx.fillRect(0, 0, 10, 10);
    ctx.fillText('hello', 0, 0);
    expect(ctx.getCalls()).toHaveLength(2);
    ctx.resetCalls();
    expect(ctx.getCalls()).toHaveLength(0);
  });

  it('should save and restore state', () => {
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.5;
    ctx.save();
    ctx.fillStyle = '#00ff00';
    ctx.globalAlpha = 1;
    expect(ctx.fillStyle).toBe('#00ff00');
    ctx.restore();
    expect(ctx.fillStyle).toBe('#ff0000');
    expect(ctx.globalAlpha).toBe(0.5);
  });

  it('should handle nested save/restore', () => {
    ctx.fillStyle = '#111111';
    ctx.save();
    ctx.fillStyle = '#222222';
    ctx.save();
    ctx.fillStyle = '#333333';
    ctx.restore();
    expect(ctx.fillStyle).toBe('#222222');
    ctx.restore();
    expect(ctx.fillStyle).toBe('#111111');
  });

  it('should write pixels via fillRect and read via getImageData', () => {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 10, 10);
    const imgData = ctx.getImageData(0, 0, 1, 1);
    expect(imgData.data[0]).toBe(255); // R
    expect(imgData.data[1]).toBe(0);   // G
    expect(imgData.data[2]).toBe(0);   // B
    expect(imgData.data[3]).toBe(255); // A
  });

  it('should clear pixels via clearRect', () => {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 10, 10);
    ctx.clearRect(0, 0, 10, 10);
    const imgData = ctx.getImageData(0, 0, 1, 1);
    expect(imgData.data[3]).toBe(0);
  });

  it('should measureText returning approximate width', () => {
    ctx.font = '16px Arial';
    const m = ctx.measureText('Hello');
    expect(m.width).toBeGreaterThan(0);
    expect(m.width).toBe(5 * 16 * 0.6);
  });

  it('should create gradients without errors', () => {
    const lg = ctx.createLinearGradient(0, 0, 100, 100);
    expect(lg.addColorStop).toBeTypeOf('function');
    const rg = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
    expect(rg.addColorStop).toBeTypeOf('function');
  });

  it('should support all path operations without errors', () => {
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(50, 50);
    ctx.arc(25, 25, 10, 0, Math.PI * 2);
    ctx.quadraticCurveTo(30, 30, 40, 40);
    ctx.bezierCurveTo(10, 20, 30, 40, 50, 60);
    ctx.rect(0, 0, 100, 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    expect(ctx.getCalls('beginPath')).toHaveLength(1);
    expect(ctx.getCalls('fill')).toHaveLength(1);
    expect(ctx.getCalls('stroke')).toHaveLength(1);
  });

  it('should set and get all style properties', () => {
    ctx.strokeStyle = '#0000ff';
    expect(ctx.strokeStyle).toBe('#0000ff');
    ctx.lineWidth = 3;
    expect(ctx.lineWidth).toBe(3);
    ctx.lineCap = 'round';
    expect(ctx.lineCap).toBe('round');
    ctx.lineJoin = 'bevel';
    expect(ctx.lineJoin).toBe('bevel');
    ctx.textAlign = 'center';
    expect(ctx.textAlign).toBe('center');
    ctx.textBaseline = 'middle';
    expect(ctx.textBaseline).toBe('middle');
  });
});

describe('parseColor', () => {
  it('should parse 6-digit hex colors', () => {
    expect(parseColor('#ff0000')).toEqual([255, 0, 0, 255]);
    expect(parseColor('#00ff00')).toEqual([0, 255, 0, 255]);
    expect(parseColor('#0000ff')).toEqual([0, 0, 255, 255]);
  });

  it('should parse 3-digit hex colors', () => {
    expect(parseColor('#f00')).toEqual([255, 0, 0, 255]);
    expect(parseColor('#0f0')).toEqual([0, 255, 0, 255]);
  });

  it('should parse 8-digit hex colors with alpha', () => {
    expect(parseColor('#ff000080')).toEqual([255, 0, 0, 128]);
  });

  it('should parse rgb() strings', () => {
    expect(parseColor('rgb(128, 64, 32)')).toEqual([128, 64, 32, 255]);
  });

  it('should parse rgba() strings', () => {
    expect(parseColor('rgba(255, 128, 0, 0.5)')).toEqual([255, 128, 0, 128]);
  });

  it('should parse named colors', () => {
    expect(parseColor('red')).toEqual([255, 0, 0, 255]);
    expect(parseColor('white')).toEqual([255, 255, 255, 255]);
    expect(parseColor('black')).toEqual([0, 0, 0, 255]);
  });

  it('should return transparent for null/empty', () => {
    expect(parseColor(null)).toEqual([0, 0, 0, 0]);
    expect(parseColor('rgba(0,0,0,0)')).toEqual([0, 0, 0, 0]);
  });
});

// ===========================================================================
// LocalStorage Mock Tests
// ===========================================================================

describe('createLocalStorageMock', () => {
  let ls;

  beforeEach(() => {
    ls = createLocalStorageMock();
  });

  it('should store and retrieve items', () => {
    ls.setItem('key1', 'value1');
    expect(ls.getItem('key1')).toBe('value1');
  });

  it('should return null for missing keys', () => {
    expect(ls.getItem('nonexistent')).toBeNull();
  });

  it('should convert values to strings', () => {
    ls.setItem('num', 42);
    expect(ls.getItem('num')).toBe('42');
  });

  it('should remove items', () => {
    ls.setItem('key', 'val');
    ls.removeItem('key');
    expect(ls.getItem('key')).toBeNull();
  });

  it('should clear all items', () => {
    ls.setItem('a', '1');
    ls.setItem('b', '2');
    ls.clear();
    expect(ls.length).toBe(0);
    expect(ls.getItem('a')).toBeNull();
  });

  it('should report correct length', () => {
    expect(ls.length).toBe(0);
    ls.setItem('x', '1');
    expect(ls.length).toBe(1);
    ls.setItem('y', '2');
    expect(ls.length).toBe(2);
  });

  it('should access by index via key()', () => {
    ls.setItem('alpha', '1');
    ls.setItem('beta', '2');
    const keys = [ls.key(0), ls.key(1)].sort();
    expect(keys).toEqual(['alpha', 'beta']);
  });
});

// ===========================================================================
// DOM Environment Tests
// ===========================================================================

describe('createDOMEnvironment', () => {
  let env;

  beforeEach(() => {
    env = createDOMEnvironment({ width: 320, height: 240 });
  });

  it('should create canvas with correct dimensions', () => {
    expect(env.canvas.width).toBe(320);
    expect(env.canvas.height).toBe(240);
  });

  it('should provide document.getElementById for canvas', () => {
    expect(env.document.getElementById('gameCanvas')).toBe(env.canvas);
    expect(env.document.getElementById('canvas')).toBe(env.canvas);
    expect(env.document.getElementById('game')).toBe(env.canvas);
    expect(env.document.getElementById('other')).toBeNull();
  });

  it('should provide document.querySelector for canvas', () => {
    expect(env.document.querySelector('canvas')).toBe(env.canvas);
    expect(env.document.querySelector('#gameCanvas')).toBe(env.canvas);
  });

  it('should provide requestAnimationFrame and flush', () => {
    let called = false;
    env.window.requestAnimationFrame(() => { called = true; });
    expect(called).toBe(false);
    env.flushRAF();
    expect(called).toBe(true);
  });

  it('should advance time correctly', () => {
    expect(env.getCurrentTime()).toBe(0);
    env.advanceTime(100);
    expect(env.getCurrentTime()).toBe(100);
    env.advanceTime(50);
    expect(env.getCurrentTime()).toBe(150);
  });

  it('should pass current time to rAF callbacks', () => {
    let receivedTime = -1;
    env.advanceTime(500);
    env.window.requestAnimationFrame((t) => { receivedTime = t; });
    env.flushRAF();
    expect(receivedTime).toBe(500);
  });

  it('should cancel requestAnimationFrame', () => {
    let called = false;
    const id = env.window.requestAnimationFrame(() => { called = true; });
    env.window.cancelAnimationFrame(id);
    env.flushRAF();
    expect(called).toBe(false);
  });

  it('should dispatch keydown events', () => {
    let receivedKey = null;
    env.document.addEventListener('keydown', (e) => { receivedKey = e.key; });
    env.dispatchEvent(env.document, 'keydown', { key: 'ArrowLeft' });
    expect(receivedKey).toBe('ArrowLeft');
  });

  it('should dispatch to direct onkeydown handler', () => {
    let receivedKey = null;
    env.document.onkeydown = (e) => { receivedKey = e.key; };
    env.dispatchEvent(env.document, 'keydown', { key: 'Enter' });
    expect(receivedKey).toBe('Enter');
  });

  it('should provide mock Audio constructor', () => {
    const audio = new env.window.Audio();
    expect(audio.play).toBeTypeOf('function');
    expect(audio.pause).toBeTypeOf('function');
  });

  it('should report pending rAF count', () => {
    expect(env.getPendingRAFCount()).toBe(0);
    env.window.requestAnimationFrame(() => {});
    env.window.requestAnimationFrame(() => {});
    expect(env.getPendingRAFCount()).toBe(2);
    env.flushRAF();
    expect(env.getPendingRAFCount()).toBe(0);
  });

  it('should provide window.performance.now()', () => {
    env.advanceTime(1234);
    expect(env.window.performance.now()).toBe(1234);
  });
});

// ===========================================================================
// GameTestRunner Tests
// ===========================================================================

describe('GameTestRunner', () => {
  let runner;

  beforeEach(() => {
    runner = new GameTestRunner({ width: 400, height: 600, fps: 60 });
    runner.setup();
  });

  afterEach(() => {
    runner.teardown();
  });

  describe('setup & teardown', () => {
    it('should initialize environment on setup', () => {
      expect(runner.env).toBeDefined();
      expect(runner.getCanvas()).toBeDefined();
      expect(runner.getContext()).toBeDefined();
    });

    it('should throw if used before setup', () => {
      const r = new GameTestRunner();
      expect(() => r.getCanvas()).toThrow('call setup()');
    });

    it('should clean up on teardown', () => {
      runner.teardown();
      expect(runner.env).toBeNull();
    });

    it('should use custom dimensions', () => {
      const r = new GameTestRunner({ width: 800, height: 450 });
      r.setup();
      expect(r.getCanvas().width).toBe(800);
      expect(r.getCanvas().height).toBe(450);
      r.teardown();
    });
  });

  describe('input simulation', () => {
    it('should track key presses', () => {
      runner.simulateKeyPress('ArrowLeft');
      expect(runner.keysDown.has('ArrowLeft')).toBe(true);
    });

    it('should track key releases', () => {
      runner.simulateKeyPress('ArrowRight');
      runner.simulateKeyRelease('ArrowRight');
      expect(runner.keysDown.has('ArrowRight')).toBe(false);
    });

    it('should dispatch keydown events to environment', () => {
      let received = null;
      runner.env.document.addEventListener('keydown', (e) => { received = e.key; });
      runner.simulateKeyPress('Enter');
      expect(received).toBe('Enter');
    });

    it('should dispatch keyup events to environment', () => {
      let received = null;
      runner.env.document.addEventListener('keyup', (e) => { received = e.key; });
      runner.simulateKeyRelease(' ');
      expect(received).toBe(' ');
    });

    it('should simulateKeyTap (press + tick + release)', () => {
      let downCount = 0;
      let upCount = 0;
      runner.env.document.addEventListener('keydown', () => { downCount++; });
      runner.env.document.addEventListener('keyup', () => { upCount++; });
      runner.simulateKeyTap('a', 3);
      expect(downCount).toBe(1);
      expect(upCount).toBe(1);
      expect(runner.keysDown.has('a')).toBe(false);
      expect(runner.frameCount).toBe(1);
    });

    it('should dispatch click events to canvas', () => {
      let clickPos = null;
      runner.getCanvas().addEventListener('click', (e) => {
        clickPos = { x: e.clientX, y: e.clientY };
      });
      runner.simulateClick(100, 200);
      expect(clickPos).toEqual({ x: 100, y: 200 });
    });

    it('should dispatch touch events to canvas', () => {
      let touchPos = null;
      runner.getCanvas().addEventListener('touchstart', (e) => {
        touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      });
      runner.simulateTouch(150, 300);
      expect(touchPos).toEqual({ x: 150, y: 300 });
    });

    it('should support method chaining', () => {
      const result = runner
        .simulateKeyPress('ArrowLeft')
        .tick()
        .simulateKeyRelease('ArrowLeft');
      expect(result).toBe(runner);
    });
  });

  describe('frame control', () => {
    it('should advance time on tick', () => {
      runner.tick(16.67);
      expect(runner.env.getCurrentTime()).toBeCloseTo(16.67, 1);
      expect(runner.frameCount).toBe(1);
    });

    it('should use default frame time when no ms specified', () => {
      runner.tick();
      expect(runner.env.getCurrentTime()).toBeCloseTo(1000 / 60, 1);
    });

    it('should advance multiple frames', () => {
      runner.tickFrames(10);
      expect(runner.frameCount).toBe(10);
    });

    it('should advance by seconds', () => {
      runner.tickSeconds(1);
      expect(runner.frameCount).toBe(60);
    });

    it('should flush rAF callbacks on tick', () => {
      let cbCalled = false;
      runner.env.window.requestAnimationFrame(() => { cbCalled = true; });
      runner.tick();
      expect(cbCalled).toBe(true);
    });

    it('should call state watchers on every tick', () => {
      let tickCount = 0;
      runner.onTick(() => { tickCount++; });
      runner.tickFrames(5);
      expect(tickCount).toBe(5);
    });
  });

  describe('canvas state inspection', () => {
    it('should get canvas state as ImageData', () => {
      const state = runner.getCanvasState();
      expect(state.width).toBe(400);
      expect(state.height).toBe(600);
      expect(state.data).toBeInstanceOf(Uint8ClampedArray);
    });

    it('should get pixel color at coordinates', () => {
      const ctx = runner.getContext();
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(5, 5, 10, 10);
      const pixel = runner.getPixel(7, 7);
      expect(pixel.r).toBe(0);
      expect(pixel.g).toBe(255);
      expect(pixel.b).toBe(0);
      expect(pixel.a).toBe(255);
    });

    it('should detect content in region', () => {
      expect(runner.hasContentInRegion(0, 0, 10, 10)).toBe(false);
      const ctx = runner.getContext();
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 10, 10);
      expect(runner.hasContentInRegion(0, 0, 10, 10)).toBe(true);
    });

    it('should track rendered text', () => {
      const ctx = runner.getContext();
      ctx.fillText('Hello World', 10, 10);
      ctx.fillText('Score: 100', 10, 30);
      expect(runner.getRenderedText()).toEqual(['Hello World', 'Score: 100']);
    });

    it('should get draw calls by method', () => {
      const ctx = runner.getContext();
      ctx.fillRect(0, 0, 10, 10);
      ctx.arc(50, 50, 25, 0, Math.PI * 2);
      const fillCalls = runner.getDrawCalls('fillRect');
      expect(fillCalls).toHaveLength(1);
      const arcCalls = runner.getDrawCalls('arc');
      expect(arcCalls).toHaveLength(1);
    });

    it('should reset draw calls', () => {
      const ctx = runner.getContext();
      ctx.fillRect(0, 0, 10, 10);
      expect(runner.getDrawCalls('fillRect')).toHaveLength(1);
      runner.resetDrawCalls();
      expect(runner.getDrawCalls('fillRect')).toHaveLength(0);
    });
  });

  describe('game state', () => {
    it('should set and get custom state', () => {
      runner.setGameState('score', 42);
      expect(runner.getGameState('score')).toBe(42);
    });

    it('should return undefined for unset state', () => {
      expect(runner.getGameState('nonexistent')).toBeUndefined();
    });
  });

  describe('assertions', () => {
    it('should assertScore when text matches', () => {
      const ctx = runner.getContext();
      ctx.fillText('Score: 150', 10, 10);
      expect(() => runner.assertScore(150)).not.toThrow();
    });

    it('should throw on assertScore when text does not match', () => {
      const ctx = runner.getContext();
      ctx.fillText('Score: 100', 10, 10);
      expect(() => runner.assertScore(999)).toThrow(GameAssertionError);
    });

    it('should assertState when state matches', () => {
      runner.setGameState('level', 3);
      expect(() => runner.assertState('level', 3)).not.toThrow();
    });

    it('should throw on assertState when state does not match', () => {
      runner.setGameState('level', 3);
      expect(() => runner.assertState('level', 5)).toThrow(GameAssertionError);
    });

    it('should assertGameOver when state is set', () => {
      runner.setGameState('state', 'over');
      expect(() => runner.assertGameOver()).not.toThrow();
    });

    it('should assertGameOver when gameOver flag is true', () => {
      runner.setGameState('gameOver', true);
      expect(() => runner.assertGameOver()).not.toThrow();
    });

    it('should assertGameOver when "game over" text is rendered', () => {
      const ctx = runner.getContext();
      ctx.fillText('GAME OVER', 200, 300);
      expect(() => runner.assertGameOver()).not.toThrow();
    });

    it('should throw on assertGameOver when game is running', () => {
      expect(() => runner.assertGameOver()).toThrow(GameAssertionError);
    });

    it('should assertGameRunning when no game-over state', () => {
      expect(() => runner.assertGameRunning()).not.toThrow();
    });

    it('should throw on assertGameRunning when game is over', () => {
      runner.setGameState('state', 'over');
      expect(() => runner.assertGameRunning()).toThrow(GameAssertionError);
    });
  });

  describe('waitForGameState', () => {
    it('should resolve immediately if predicate is true', async () => {
      runner.setGameState('ready', true);
      await runner.waitForGameState((r) => r.getGameState('ready') === true);
    });

    it('should tick frames until predicate becomes true', async () => {
      let counter = 0;
      runner.onTick(() => {
        counter++;
        if (counter >= 5) runner.setGameState('loaded', true);
      });
      await runner.waitForGameState((r) => r.getGameState('loaded') === true, 1000);
      expect(counter).toBe(5);
    });

    it('should throw on timeout', async () => {
      await expect(
        runner.waitForGameState(() => false, 100)
      ).rejects.toThrow('timed out');
    });
  });

  describe('localStorage helpers', () => {
    it('should seed storage with string values', () => {
      runner.seedStorage({ high_score: '999', player_name: 'Neo' });
      expect(runner.readStorage('high_score')).toBe('999');
      expect(runner.readStorage('player_name')).toBe('Neo');
    });

    it('should seed storage with object values (auto-stringify)', () => {
      runner.seedStorage({ stats: { games: 10, wins: 7 } });
      const raw = runner.readStorage('stats');
      const parsed = JSON.parse(raw);
      expect(parsed.games).toBe(10);
      expect(parsed.wins).toBe(7);
    });

    it('should clear storage', () => {
      runner.seedStorage({ key: 'value' });
      runner.clearStorage();
      expect(runner.readStorage('key')).toBeNull();
    });
  });
});

// ===========================================================================
// GameAssertionError Tests
// ===========================================================================

describe('GameAssertionError', () => {
  it('should be an instance of Error', () => {
    const err = new GameAssertionError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(GameAssertionError);
  });

  it('should have correct name', () => {
    const err = new GameAssertionError('test');
    expect(err.name).toBe('GameAssertionError');
  });

  it('should preserve message', () => {
    const err = new GameAssertionError('something failed');
    expect(err.message).toBe('something failed');
  });
});
