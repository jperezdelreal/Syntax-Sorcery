'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Simple static file server for serving game HTML files.
 */
function createGameServer(rootDir) {
  const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
    filePath = decodeURIComponent(filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, url: `http://127.0.0.1:${port}` });
    });
  });
}

/**
 * Visual game testing harness powered by Playwright.
 * Opens an HTML5 game in a real Chromium browser, simulates inputs,
 * captures screenshots, and validates visual game state.
 */
class VisualGameRunner {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.server = null;
    this.serverInfo = null;
    this.screenshotDir = options.screenshotDir || SCREENSHOTS_DIR;
    this.viewport = options.viewport || { width: 800, height: 600 };
    this.headless = options.headless !== undefined ? options.headless : true;
    this.screenshots = new Map();
  }

  /**
   * Launch a game from an HTML file path. Starts a local server and opens Chromium.
   */
  async launchGame(htmlPath) {
    const resolvedPath = path.resolve(htmlPath);
    const gameDir = path.dirname(resolvedPath);
    const htmlFile = path.basename(resolvedPath);

    this.serverInfo = await createGameServer(gameDir);
    const gameUrl = `${this.serverInfo.url}/${htmlFile}`;

    await this._openBrowser(gameUrl);
    return this.page;
  }

  /**
   * Launch a game from an already-running URL (e.g., Vite dev server).
   * Use this for games that require a build tool to serve (TypeScript, bundlers).
   */
  async launchUrl(url) {
    await this._openBrowser(url);
    return this.page;
  }

  /**
   * Internal: open Chromium and navigate to a URL.
   */
  async _openBrowser(url) {
    this.browser = await chromium.launch({
      headless: this.headless,
    });

    this.context = await this.browser.newContext({
      viewport: this.viewport,
    });

    this.page = await this.context.newPage();
    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Wait for canvas to be present
    await this.page.waitForSelector('canvas', { timeout: 10000 }).catch(() => {
      // Some games may not use canvas — that's fine
    });
  }

  /**
   * Capture a screenshot of the current game state.
   */
  async screenshot(name) {
    const filename = `${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    await this.page.screenshot({ path: filepath });
    this.screenshots.set(name, filepath);

    return filepath;
  }

  /**
   * Simulate a key press with optional hold duration.
   */
  async pressKey(key, durationMs = 100) {
    await this.page.keyboard.down(key);
    await this.page.waitForTimeout(durationMs);
    await this.page.keyboard.up(key);
  }

  /**
   * Simulate a mouse click at specific coordinates.
   */
  async clickAt(x, y) {
    await this.page.mouse.click(x, y);
  }

  /**
   * Wait for N animation frames to elapse in the browser.
   */
  async waitForFrames(n) {
    await this.page.evaluate((frameCount) => {
      return new Promise((resolve) => {
        let count = 0;
        function tick() {
          count++;
          if (count >= frameCount) {
            resolve();
          } else {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
      });
    }, n);
  }

  /**
   * Read a pixel color from the canvas element at (x, y).
   * Returns { r, g, b, a } object.
   */
  async getCanvasPixel(x, y) {
    return await this.page.evaluate(({ px, py }) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const data = ctx.getImageData(px * dpr, py * dpr, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2], a: data[3] };
    }, { px: x, py: y });
  }

  /**
   * Read text content from a DOM selector (for games with DOM-based UI).
   */
  async getTextContent(selector) {
    const element = await this.page.$(selector);
    if (!element) return null;
    return await element.textContent();
  }

  /**
   * Compare two screenshots by name. Returns a diff result.
   * Result: 'identical' if images match, otherwise { diffPixels, totalPixels, diffPercent }.
   */
  async compareScreenshot(nameA, nameB) {
    const pathA = this.screenshots.get(nameA);
    const pathB = this.screenshots.get(nameB);

    if (!pathA || !pathB) {
      throw new Error(`Screenshot not found: ${!pathA ? nameA : nameB}`);
    }

    const bufA = fs.readFileSync(pathA);
    const bufB = fs.readFileSync(pathB);

    // Fast path: binary identical
    if (bufA.equals(bufB)) {
      return 'identical';
    }

    // PNG pixel-level comparison via canvas in-browser
    const result = await this.page.evaluate(async ({ imgA, imgB }) => {
      function loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
        });
      }

      const imageA = await loadImage(imgA);
      const imageB = await loadImage(imgB);

      const w = Math.max(imageA.width, imageB.width);
      const h = Math.max(imageA.height, imageB.height);

      const canvasA = document.createElement('canvas');
      canvasA.width = w; canvasA.height = h;
      const ctxA = canvasA.getContext('2d');
      ctxA.drawImage(imageA, 0, 0);
      const dataA = ctxA.getImageData(0, 0, w, h).data;

      const canvasB = document.createElement('canvas');
      canvasB.width = w; canvasB.height = h;
      const ctxB = canvasB.getContext('2d');
      ctxB.drawImage(imageB, 0, 0);
      const dataB = ctxB.getImageData(0, 0, w, h).data;

      let diffPixels = 0;
      const totalPixels = w * h;
      for (let i = 0; i < dataA.length; i += 4) {
        if (dataA[i] !== dataB[i] || dataA[i+1] !== dataB[i+1] ||
            dataA[i+2] !== dataB[i+2] || dataA[i+3] !== dataB[i+3]) {
          diffPixels++;
        }
      }

      return { diffPixels, totalPixels, diffPercent: (diffPixels / totalPixels * 100).toFixed(2) };
    }, {
      imgA: `data:image/png;base64,${bufA.toString('base64')}`,
      imgB: `data:image/png;base64,${bufB.toString('base64')}`,
    });

    return result;
  }

  /**
   * Record gameplay as a series of screenshots over a duration.
   */
  async recordGameplay(seconds, fps = 5) {
    const frames = [];
    const interval = 1000 / fps;
    const totalFrames = Math.ceil(seconds * fps);

    for (let i = 0; i < totalFrames; i++) {
      const name = `recording-frame-${String(i).padStart(4, '0')}`;
      const filepath = await this.screenshot(name);
      frames.push(filepath);
      if (i < totalFrames - 1) {
        await this.page.waitForTimeout(interval);
      }
    }

    return frames;
  }

  /**
   * Get a snapshot of a canvas region as raw pixel data.
   * Useful for checking if a region has changed or contains specific colors.
   */
  async getCanvasRegion(x, y, width, height) {
    return await this.page.evaluate(({ rx, ry, rw, rh }) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const data = ctx.getImageData(rx * dpr, ry * dpr, rw * dpr, rh * dpr).data;
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        pixels.push({ r: data[i], g: data[i+1], b: data[i+2], a: data[i+3] });
      }
      return { width: rw * dpr, height: rh * dpr, pixels };
    }, { rx: x, ry: y, rw: width, rh: height });
  }

  /**
   * Check if a canvas region has non-uniform pixels (something is drawn there).
   */
  async hasVisualContent(x, y, width, height) {
    return await this.page.evaluate(({ rx, ry, rw, rh }) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const data = ctx.getImageData(rx * dpr, ry * dpr, rw * dpr, rh * dpr).data;
      const first = [data[0], data[1], data[2], data[3]];
      for (let i = 4; i < data.length; i += 4) {
        if (data[i] !== first[0] || data[i+1] !== first[1] ||
            data[i+2] !== first[2] || data[i+3] !== first[3]) {
          return true;
        }
      }
      return false;
    }, { rx: x, ry: y, rw: width, rh: height });
  }

  /**
   * Clean up: close browser and stop local server.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    if (this.serverInfo && this.serverInfo.server) {
      this.serverInfo.server.close();
      this.serverInfo = null;
    }
  }
}

module.exports = { VisualGameRunner, createGameServer, SCREENSHOTS_DIR };
