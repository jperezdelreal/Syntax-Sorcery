/**
 * Tests unitarios para browser.js — Wrapper de Playwright
 * Mock completo de Playwright para testear lógica, no la integración.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mocks hoisted (antes de los imports) ────────────────────
const mocks = vi.hoisted(() => {
  const mockPage = {
    goto: vi.fn(),
    title: vi.fn(),
    url: vi.fn(),
    click: vi.fn(),
    fill: vi.fn(),
    screenshot: vi.fn(),
    waitForSelector: vi.fn(),
    waitForTimeout: vi.fn(),
    evaluate: vi.fn(),
    setViewportSize: vi.fn(),
    on: vi.fn(),
  };

  const mockContext = {
    newPage: vi.fn().mockResolvedValue(mockPage),
  };

  const mockBrowser = {
    newContext: vi.fn().mockResolvedValue(mockContext),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return { mockPage, mockContext, mockBrowser };
});

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue(mocks.mockBrowser),
  },
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import * as browser from '../tools/browser.js';
import { mkdir } from 'fs/promises';

// ════════════════════════════════════════════════════════════
//  A. UNIT TESTS — browser.js
// ════════════════════════════════════════════════════════════

describe('browser.js — herramientas de Playwright', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Defaults para cada test
    mocks.mockPage.url.mockReturnValue('https://example.com');
    mocks.mockPage.title.mockResolvedValue('Example Domain');
    mocks.mockPage.goto.mockResolvedValue(undefined);
    mocks.mockPage.waitForSelector.mockResolvedValue(undefined);
    mocks.mockPage.click.mockResolvedValue(undefined);
    mocks.mockPage.fill.mockResolvedValue(undefined);
    mocks.mockPage.waitForTimeout.mockResolvedValue(undefined);
    mocks.mockPage.setViewportSize.mockResolvedValue(undefined);
    mocks.mockPage.on.mockImplementation(() => {});
    mocks.mockContext.newPage.mockResolvedValue(mocks.mockPage);
    mocks.mockBrowser.newContext.mockResolvedValue(mocks.mockContext);
    mocks.mockBrowser.close.mockResolvedValue(undefined);

    // Screenshot devuelve un buffer falso
    mocks.mockPage.screenshot.mockResolvedValue(Buffer.from('fake-png-data'));

    await browser.initBrowser();
  });

  afterEach(async () => {
    await browser.closeBrowser();
  });

  // ── initBrowser ─────────────────────────────────────────
  describe('initBrowser()', () => {
    it('crea directorio de screenshots con mkdir recursivo', async () => {
      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('screenshots'),
        { recursive: true }
      );
    });

    it('lanza Chromium en modo headless por defecto', async () => {
      const { chromium } = await import('playwright');
      expect(chromium.launch).toHaveBeenCalledWith(
        expect.objectContaining({ headless: true })
      );
    });

    it('registra listener de errores de consola en la página', () => {
      expect(mocks.mockPage.on).toHaveBeenCalledWith('console', expect.any(Function));
    });

    it('devuelve status ok', async () => {
      // initBrowser ya se llamó en beforeEach, verificar que no lanza error
      const result = await browser.initBrowser({ visible: false });
      expect(result).toEqual({ status: 'ok' });
    });
  });

  // ── navigate ────────────────────────────────────────────
  describe('navigate(url)', () => {
    it('devuelve título, URL y tiempo de carga al navegar exitosamente', async () => {
      const result = await browser.navigate('https://example.com');

      expect(result.status).toBe('ok');
      expect(result.url).toBe('https://example.com');
      expect(result.title).toBe('Example Domain');
      expect(result.loadTimeMs).toBeTypeOf('number');
      expect(result.loadTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('usa networkidle y timeout de 30s', async () => {
      await browser.navigate('https://example.com');
      expect(mocks.mockPage.goto).toHaveBeenCalledWith(
        'https://example.com',
        { waitUntil: 'networkidle', timeout: 30000 }
      );
    });

    it('maneja errores de navegación devolviendo status error', async () => {
      mocks.mockPage.goto.mockRejectedValueOnce(new Error('net::ERR_NAME_NOT_RESOLVED'));
      const result = await browser.navigate('https://noexiste.invalid');

      expect(result.status).toBe('error');
      expect(result.error).toContain('ERR_NAME_NOT_RESOLVED');
      expect(result.url).toBe('https://noexiste.invalid');
      expect(result.loadTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('maneja timeout de navegación', async () => {
      mocks.mockPage.goto.mockRejectedValueOnce(new Error('Timeout 30000ms exceeded'));
      const result = await browser.navigate('https://slow-site.test');

      expect(result.status).toBe('error');
      expect(result.error).toContain('Timeout');
    });
  });

  // ── click ───────────────────────────────────────────────
  describe('click(selector)', () => {
    it('hace click exitoso y devuelve URL actual', async () => {
      const result = await browser.click('#submit-btn');

      expect(result.status).toBe('ok');
      expect(result.selector).toBe('#submit-btn');
      expect(result.currentUrl).toBe('https://example.com');
      expect(mocks.mockPage.waitForSelector).toHaveBeenCalledWith('#submit-btn', { timeout: 5000 });
      expect(mocks.mockPage.click).toHaveBeenCalledWith('#submit-btn');
    });

    it('espera 500ms después del click para que la UI reaccione', async () => {
      await browser.click('button.action');
      expect(mocks.mockPage.waitForTimeout).toHaveBeenCalledWith(500);
    });

    it('maneja selector no encontrado', async () => {
      mocks.mockPage.waitForSelector.mockRejectedValueOnce(
        new Error('Timeout 5000ms exceeded waiting for selector "#fantasma"')
      );
      const result = await browser.click('#fantasma');

      expect(result.status).toBe('error');
      expect(result.selector).toBe('#fantasma');
      expect(result.error).toContain('Timeout');
    });
  });

  // ── type ────────────────────────────────────────────────
  describe('type(selector, text)', () => {
    it('escribe texto exitosamente en un campo', async () => {
      const result = await browser.type('#email', 'test@vigia.dev');

      expect(result.status).toBe('ok');
      expect(result.selector).toBe('#email');
      expect(result.text).toBe('test@vigia.dev');
      expect(mocks.mockPage.fill).toHaveBeenCalledWith('#email', 'test@vigia.dev');
    });

    it('espera a que el selector exista antes de escribir', async () => {
      await browser.type('input[name="q"]', 'búsqueda');
      expect(mocks.mockPage.waitForSelector).toHaveBeenCalledWith('input[name="q"]', { timeout: 5000 });
    });

    it('maneja selector de input no encontrado', async () => {
      mocks.mockPage.waitForSelector.mockRejectedValueOnce(
        new Error('Timeout 5000ms exceeded waiting for selector "#no-existe"')
      );
      const result = await browser.type('#no-existe', 'texto');

      expect(result.status).toBe('error');
      expect(result.selector).toBe('#no-existe');
      expect(result.error).toContain('Timeout');
    });
  });

  // ── screenshot ──────────────────────────────────────────
  describe('screenshot(name)', () => {
    it('captura screenshot y devuelve ruta del archivo', async () => {
      const result = await browser.screenshot('homepage');

      expect(result.status).toBe('ok');
      expect(result.filename).toMatch(/^\d{2}_homepage\.png$/);
      expect(result.filepath).toContain('screenshots');
      expect(result.filepath).toContain('homepage.png');
    });

    it('sanitiza nombres con caracteres especiales', async () => {
      const result = await browser.screenshot('mi página / con <cosas> raras!');

      expect(result.status).toBe('ok');
      expect(result.filename).not.toMatch(/[^a-zA-Z0-9_.\-]/);
    });

    it('incluye base64 del screenshot para visión del agente', async () => {
      const fakeBuffer = Buffer.from('test-image-data');
      mocks.mockPage.screenshot.mockResolvedValueOnce(fakeBuffer);

      const result = await browser.screenshot('con-vision');

      expect(result.status).toBe('ok');
      expect(result.base64).toBe(fakeBuffer.toString('base64'));
      expect(result.mimeType).toBe('image/png');
      expect(result.sizeKB).toBeTypeOf('number');
    });

    it('maneja error de screenshot', async () => {
      mocks.mockPage.screenshot.mockRejectedValueOnce(new Error('Page crashed'));
      const result = await browser.screenshot('crash');

      expect(result.status).toBe('error');
      expect(result.error).toContain('Page crashed');
    });

    it('usa fullPage: true para capturar toda la página', async () => {
      await browser.screenshot('full');
      expect(mocks.mockPage.screenshot).toHaveBeenCalledWith(
        expect.objectContaining({ fullPage: true })
      );
    });
  });

  // ── getPageInfo ─────────────────────────────────────────
  describe('getPageInfo()', () => {
    it('devuelve título, URL, links, botones, formularios e imágenes', async () => {
      mocks.mockPage.evaluate.mockResolvedValueOnce({
        links: [{ text: 'Home', href: '/' }],
        buttons: [{ text: 'Submit', disabled: false }],
        inputs: [{ type: 'text', name: 'q', placeholder: 'Buscar', required: false }],
        headings: [{ level: 'H1', text: 'Bienvenido' }],
        mainText: 'Contenido principal',
        imagesWithoutAlt: 2,
        totalImages: 5,
        bodyBackground: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(0, 0, 0)',
        documentLang: 'es',
        metaViewport: true,
        consoleErrorCount: 0,
      });

      const result = await browser.getPageInfo();

      expect(result.status).toBe('ok');
      expect(result.title).toBe('Example Domain');
      expect(result.url).toBe('https://example.com');
      expect(result.links).toHaveLength(1);
      expect(result.buttons).toHaveLength(1);
      expect(result.inputs).toHaveLength(1);
      expect(result.headings).toHaveLength(1);
      expect(result.imagesWithoutAlt).toBe(2);
      expect(result.totalImages).toBe(5);
    });

    it('incluye conteo de errores de consola acumulados', async () => {
      mocks.mockPage.evaluate.mockResolvedValueOnce({
        links: [], buttons: [], inputs: [], headings: [],
        mainText: '', imagesWithoutAlt: 0, totalImages: 0,
        bodyBackground: '', bodyColor: '', documentLang: 'es',
        metaViewport: true, consoleErrorCount: 0,
      });

      const result = await browser.getPageInfo();
      // consoleErrorCount se sobreescribe con la longitud real del array
      expect(result.consoleErrorCount).toBeTypeOf('number');
    });

    it('maneja error al evaluar la página', async () => {
      mocks.mockPage.title.mockRejectedValueOnce(new Error('Execution context was destroyed'));
      const result = await browser.getPageInfo();

      expect(result.status).toBe('error');
      expect(result.error).toContain('Execution context');
    });
  });

  // ── checkPerformance ────────────────────────────────────
  describe('checkPerformance()', () => {
    it('devuelve métricas de DOM y carga', async () => {
      mocks.mockPage.evaluate.mockResolvedValueOnce({
        domContentLoaded: 450,
        loadComplete: 1200,
        domInteractive: 300,
        totalResources: 42,
        slowResources: [
          { name: 'bundle.js', type: 'script', durationMs: 1500 },
        ],
        transferSizeKB: 850,
      });

      const result = await browser.checkPerformance();

      expect(result.status).toBe('ok');
      expect(result.domContentLoaded).toBe(450);
      expect(result.loadComplete).toBe(1200);
      expect(result.domInteractive).toBe(300);
      expect(result.totalResources).toBe(42);
      expect(result.slowResources).toHaveLength(1);
      expect(result.transferSizeKB).toBe(850);
    });

    it('maneja error de evaluación de performance', async () => {
      mocks.mockPage.evaluate.mockRejectedValueOnce(new Error('Page closed'));
      const result = await browser.checkPerformance();

      expect(result.status).toBe('error');
      expect(result.error).toContain('Page closed');
    });
  });

  // ── setViewport ─────────────────────────────────────────
  describe('setViewport(width, height)', () => {
    it('cambia viewport a dimensiones mobile', async () => {
      const result = await browser.setViewport(375, 667);

      expect(result.status).toBe('ok');
      expect(result.width).toBe(375);
      expect(result.height).toBe(667);
      expect(mocks.mockPage.setViewportSize).toHaveBeenCalledWith({ width: 375, height: 667 });
    });

    it('espera 500ms después del cambio para que la UI se adapte', async () => {
      await browser.setViewport(1024, 768);
      expect(mocks.mockPage.waitForTimeout).toHaveBeenCalledWith(500);
    });

    it('maneja error al cambiar viewport', async () => {
      mocks.mockPage.setViewportSize.mockRejectedValueOnce(new Error('Invalid dimensions'));
      const result = await browser.setViewport(-1, -1);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid dimensions');
    });
  });

  // ── wait ────────────────────────────────────────────────
  describe('wait(ms)', () => {
    it('espera el tiempo indicado y devuelve ms esperados', async () => {
      const result = await browser.wait(1000);

      expect(result.status).toBe('ok');
      expect(result.waitedMs).toBe(1000);
      expect(mocks.mockPage.waitForTimeout).toHaveBeenCalledWith(1000);
    });
  });

  // ── closeBrowser ────────────────────────────────────────
  describe('closeBrowser()', () => {
    it('cierra el browser y limpia referencias', async () => {
      await browser.closeBrowser();
      expect(mocks.mockBrowser.close).toHaveBeenCalled();
    });

    it('no lanza error si se llama dos veces (idempotente)', async () => {
      await browser.closeBrowser();
      // Segunda llamada — browser ya es null, no debe llamar close() de nuevo
      await expect(browser.closeBrowser()).resolves.not.toThrow();
    });
  });

  // ── getConsoleErrors ────────────────────────────────────
  describe('getConsoleErrors()', () => {
    it('devuelve copia del array de errores de consola', () => {
      const errors = browser.getConsoleErrors();
      expect(Array.isArray(errors)).toBe(true);
    });
  });
});
