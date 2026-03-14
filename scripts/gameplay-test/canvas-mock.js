#!/usr/bin/env node
'use strict';

/**
 * Lightweight Canvas 2D context mock for Node.js gameplay testing.
 * Tracks draw calls and pixel state without requiring a real browser or GPU.
 */

class CanvasRenderingContext2DMock {
  constructor(canvas) {
    this.canvas = canvas;
    this._calls = [];
    this._fillStyle = '#000000';
    this._strokeStyle = '#000000';
    this._font = '10px sans-serif';
    this._textAlign = 'start';
    this._textBaseline = 'alphabetic';
    this._globalAlpha = 1;
    this._lineWidth = 1;
    this._lineCap = 'butt';
    this._lineJoin = 'miter';
    this._imageSmoothingEnabled = true;
    this._globalCompositeOperation = 'source-over';
    this._transformMatrix = [1, 0, 0, 1, 0, 0];
    this._savedStates = [];
    this._currentPath = [];
    this._pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
  }

  get fillStyle() { return this._fillStyle; }
  set fillStyle(v) { this._fillStyle = v; }

  get strokeStyle() { return this._strokeStyle; }
  set strokeStyle(v) { this._strokeStyle = v; }

  get font() { return this._font; }
  set font(v) { this._font = v; }

  get textAlign() { return this._textAlign; }
  set textAlign(v) { this._textAlign = v; }

  get textBaseline() { return this._textBaseline; }
  set textBaseline(v) { this._textBaseline = v; }

  get globalAlpha() { return this._globalAlpha; }
  set globalAlpha(v) { this._globalAlpha = v; }

  get lineWidth() { return this._lineWidth; }
  set lineWidth(v) { this._lineWidth = v; }

  get lineCap() { return this._lineCap; }
  set lineCap(v) { this._lineCap = v; }

  get lineJoin() { return this._lineJoin; }
  set lineJoin(v) { this._lineJoin = v; }

  get globalCompositeOperation() { return this._globalCompositeOperation; }
  set globalCompositeOperation(v) { this._globalCompositeOperation = v; }

  get imageSmoothingEnabled() { return this._imageSmoothingEnabled; }
  set imageSmoothingEnabled(v) { this._imageSmoothingEnabled = v; }

  save() {
    this._record('save');
    this._savedStates.push({
      fillStyle: this._fillStyle,
      strokeStyle: this._strokeStyle,
      font: this._font,
      textAlign: this._textAlign,
      textBaseline: this._textBaseline,
      globalAlpha: this._globalAlpha,
      lineWidth: this._lineWidth,
      transformMatrix: [...this._transformMatrix],
    });
  }

  restore() {
    this._record('restore');
    const state = this._savedStates.pop();
    if (state) {
      Object.assign(this, {
        _fillStyle: state.fillStyle,
        _strokeStyle: state.strokeStyle,
        _font: state.font,
        _textAlign: state.textAlign,
        _textBaseline: state.textBaseline,
        _globalAlpha: state.globalAlpha,
        _lineWidth: state.lineWidth,
        _transformMatrix: state.transformMatrix,
      });
    }
  }

  translate(x, y) { this._record('translate', { x, y }); }
  rotate(angle) { this._record('rotate', { angle }); }
  scale(x, y) { this._record('scale', { x, y }); }
  setTransform(a, b, c, d, e, f) { this._record('setTransform', { a, b, c, d, e, f }); this._transformMatrix = [a, b, c, d, e, f]; }
  resetTransform() { this.setTransform(1, 0, 0, 1, 0, 0); }

  beginPath() { this._record('beginPath'); this._currentPath = []; }
  closePath() { this._record('closePath'); }
  moveTo(x, y) { this._record('moveTo', { x, y }); this._currentPath.push({ op: 'moveTo', x, y }); }
  lineTo(x, y) { this._record('lineTo', { x, y }); this._currentPath.push({ op: 'lineTo', x, y }); }
  arc(x, y, r, startAngle, endAngle, ccw) { this._record('arc', { x, y, r, startAngle, endAngle, ccw }); }
  arcTo(x1, y1, x2, y2, r) { this._record('arcTo', { x1, y1, x2, y2, r }); }
  quadraticCurveTo(cpx, cpy, x, y) { this._record('quadraticCurveTo', { cpx, cpy, x, y }); }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this._record('bezierCurveTo', { cp1x, cp1y, cp2x, cp2y, x, y }); }
  rect(x, y, w, h) { this._record('rect', { x, y, w, h }); }
  ellipse(x, y, rx, ry, rotation, startAngle, endAngle, ccw) { this._record('ellipse', { x, y, rx, ry, rotation, startAngle, endAngle, ccw }); }

  fill(fillRuleOrPath) { this._record('fill', { fillRuleOrPath }); }
  stroke() { this._record('stroke'); }
  clip() { this._record('clip'); }

  fillRect(x, y, w, h) {
    this._record('fillRect', { x, y, w, h });
    this._fillPixels(x, y, w, h, this._fillStyle);
  }

  strokeRect(x, y, w, h) { this._record('strokeRect', { x, y, w, h }); }
  clearRect(x, y, w, h) {
    this._record('clearRect', { x, y, w, h });
    this._fillPixels(x, y, w, h, 'rgba(0,0,0,0)');
  }

  fillText(text, x, y, maxWidth) { this._record('fillText', { text, x, y, maxWidth }); }
  strokeText(text, x, y, maxWidth) { this._record('strokeText', { text, x, y, maxWidth }); }
  measureText(text) {
    this._record('measureText', { text });
    const fontSize = parseInt(this._font) || 10;
    return { width: text.length * fontSize * 0.6 };
  }

  drawImage(...args) { this._record('drawImage', { args }); }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  getImageData(x, y, w, h) {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcIdx = ((y + row) * this.canvas.width + (x + col)) * 4;
        const dstIdx = (row * w + col) * 4;
        data[dstIdx] = this._pixels[srcIdx] || 0;
        data[dstIdx + 1] = this._pixels[srcIdx + 1] || 0;
        data[dstIdx + 2] = this._pixels[srcIdx + 2] || 0;
        data[dstIdx + 3] = this._pixels[srcIdx + 3] || 0;
      }
    }
    return { width: w, height: h, data };
  }
  putImageData(imageData, dx, dy) { this._record('putImageData', { dx, dy }); }

  createLinearGradient(x0, y0, x1, y1) {
    return { addColorStop: () => {}, _type: 'linearGradient', x0, y0, x1, y1 };
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return { addColorStop: () => {}, _type: 'radialGradient', x0, y0, r0, x1, y1, r1 };
  }
  createPattern() { return { _type: 'pattern' }; }

  setLineDash(segments) { this._record('setLineDash', { segments }); }
  getLineDash() { return []; }

  isPointInPath() { return false; }
  isPointInStroke() { return false; }

  _record(method, args = {}) {
    this._calls.push({ method, args, timestamp: Date.now() });
  }

  _fillPixels(x, y, w, h, color) {
    const rgba = parseColor(color);
    const cx = Math.max(0, Math.floor(x));
    const cy = Math.max(0, Math.floor(y));
    const cw = Math.min(this.canvas.width, cx + Math.floor(w));
    const ch = Math.min(this.canvas.height, cy + Math.floor(h));
    for (let row = cy; row < ch; row++) {
      for (let col = cx; col < cw; col++) {
        const idx = (row * this.canvas.width + col) * 4;
        this._pixels[idx] = rgba[0];
        this._pixels[idx + 1] = rgba[1];
        this._pixels[idx + 2] = rgba[2];
        this._pixels[idx + 3] = rgba[3];
      }
    }
  }

  getCalls(methodName) {
    if (!methodName) return [...this._calls];
    return this._calls.filter(c => c.method === methodName);
  }

  getLastCall(methodName) {
    const calls = this.getCalls(methodName);
    return calls[calls.length - 1] || null;
  }

  getTextDrawn() {
    return this.getCalls('fillText').map(c => c.args.text);
  }

  resetCalls() {
    this._calls = [];
  }
}

class CanvasMock {
  constructor(width = 400, height = 600) {
    this.width = width;
    this.height = height;
    this.style = {};
    this._context2d = new CanvasRenderingContext2DMock(this);
    this._listeners = {};
  }

  getContext(type) {
    if (type === '2d') return this._context2d;
    return null;
  }

  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(h => h !== handler);
  }

  dispatchEvent(event) {
    const handlers = this._listeners[event.type] || [];
    for (const handler of handlers) {
      handler(event);
    }
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, right: this.width, bottom: this.height, width: this.width, height: this.height };
  }

  toDataURL() {
    return 'data:image/png;base64,mock';
  }
}

function parseColor(color) {
  if (!color || color === 'rgba(0,0,0,0)') return [0, 0, 0, 0];
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        255,
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255,
    ];
  }
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255,
    ];
  }
  const named = { black: [0,0,0,255], white: [255,255,255,255], red: [255,0,0,255], green: [0,128,0,255], blue: [0,0,255,255] };
  return named[color] || [0, 0, 0, 255];
}

module.exports = { CanvasMock, CanvasRenderingContext2DMock, parseColor };
