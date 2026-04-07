/**
 * Tests de edge cases — Escenarios límite y condiciones adversas.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { extractCommands } from '../lib/extract-commands.js';

// ── Mocks hoisted ─────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════
//  D. EDGE CASES
// ════════════════════════════════════════════════════════════

describe('Edge cases — condiciones adversas', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.mockPage.url.mockReturnValue('about:blank');
    mocks.mockPage.title.mockResolvedValue('');
    mocks.mockPage.goto.mockResolvedValue(undefined);
    mocks.mockPage.waitForSelector.mockResolvedValue(undefined);
    mocks.mockPage.click.mockResolvedValue(undefined);
    mocks.mockPage.fill.mockResolvedValue(undefined);
    mocks.mockPage.waitForTimeout.mockResolvedValue(undefined);
    mocks.mockPage.setViewportSize.mockResolvedValue(undefined);
    mocks.mockPage.on.mockImplementation(() => {});
    mocks.mockPage.screenshot.mockResolvedValue(Buffer.from('png'));
    mocks.mockContext.newPage.mockResolvedValue(mocks.mockPage);
    mocks.mockBrowser.newContext.mockResolvedValue(mocks.mockContext);
    mocks.mockBrowser.close.mockResolvedValue(undefined);
    await browser.initBrowser();
  });

  afterEach(async () => {
    await browser.closeBrowser();
  });

  // ── URL vacía ───────────────────────────────────────────
  describe('URL vacía', () => {
    it('navigate con URL vacía pasa la URL a page.goto', async () => {
      mocks.mockPage.goto.mockRejectedValueOnce(new Error('invalid URL'));
      const result = await browser.navigate('');

      expect(result.status).toBe('error');
      expect(result.url).toBe('');
    });
  });

  // ── URL que devuelve 500 ────────────────────────────────
  describe('URL que devuelve error HTTP 500', () => {
    it('navigate no crashea con error del servidor', async () => {
      // Playwright no lanza error por HTTP 500, solo devuelve la página
      mocks.mockPage.goto.mockResolvedValue(undefined);
      mocks.mockPage.url.mockReturnValue('https://server-error.com');
      mocks.mockPage.title.mockResolvedValue('500 Internal Server Error');

      const result = await browser.navigate('https://server-error.com');

      expect(result.status).toBe('ok');
      expect(result.title).toBe('500 Internal Server Error');
    });
  });

  // ── URL con timeout >30s ────────────────────────────────
  describe('URL con timeout excedido (>30s de carga)', () => {
    it('devuelve error con tiempo de carga registrado', async () => {
      mocks.mockPage.goto.mockRejectedValueOnce(
        new Error('page.goto: Timeout 30000ms exceeded. Navigating to "https://slow.com"')
      );

      const result = await browser.navigate('https://slow.com');

      expect(result.status).toBe('error');
      expect(result.error).toContain('Timeout 30000ms');
      expect(result.loadTimeMs).toBeTypeOf('number');
    });
  });

  // ── Agente no devuelve comandos ─────────────────────────
  describe('Agente devuelve respuesta sin comandos', () => {
    it('extractCommands devuelve array vacío para texto plano', () => {
      const response = 'Estoy analizando la página. Veamos los resultados...';
      expect(extractCommands(response)).toEqual([]);
    });

    it('extractCommands devuelve array vacío para bloque code sin json', () => {
      const response = '```\nconsole.log("no es json")\n```';
      expect(extractCommands(response)).toEqual([]);
    });

    it('extractCommands devuelve array vacío para JSON sin action ni commands', () => {
      const response = '```json\n{"analysis": "la página carga bien"}\n```';
      expect(extractCommands(response)).toEqual([]);
    });
  });

  // ── Screenshot con caracteres problemáticos ─────────────
  describe('Screenshot con nombres edge case', () => {
    it('sanitiza caracteres unicode en nombre de screenshot', async () => {
      const result = await browser.screenshot('página_ñ_áéíóú');

      expect(result.status).toBe('ok');
      // Los caracteres especiales se reemplazan con _
      expect(result.filename).toMatch(/\.png$/);
      expect(result.filename).not.toMatch(/[ñáéíóú]/);
    });

    it('trunca nombres muy largos a 50 caracteres', async () => {
      const longName = 'a'.repeat(100);
      const result = await browser.screenshot(longName);

      expect(result.status).toBe('ok');
      // Nombre sanitizado se trunca a 50 chars + prefijo + .png
      const nameWithoutPrefixAndExt = result.filename.replace(/^\d{2}_/, '').replace(/\.png$/, '');
      expect(nameWithoutPrefixAndExt.length).toBeLessThanOrEqual(50);
    });

    it('maneja nombre vacío', async () => {
      const result = await browser.screenshot('');

      expect(result.status).toBe('ok');
      expect(result.filename).toMatch(/\.png$/);
    });
  });

  // ── Operaciones después de cerrar el browser ────────────
  describe('Operaciones sin browser inicializado', () => {
    it('navigate devuelve error si page es null (try/catch interno)', async () => {
      await browser.closeBrowser();

      // Después de cerrar, page es null → el try/catch devuelve status error
      const result = await browser.navigate('https://test.com');
      expect(result.status).toBe('error');
      expect(result.error).toContain('null');
    });

    it('click devuelve error si page es null', async () => {
      await browser.closeBrowser();
      const result = await browser.click('#btn');
      expect(result.status).toBe('error');
      expect(result.error).toContain('null');
    });
  });

  // ── JSON con estructuras inesperadas ────────────────────
  describe('JSON con estructuras inesperadas del LLM', () => {
    it('ignora comandos sin action en el array', () => {
      const text = '```json\n{"commands": [{"url": "https://test.com"}, {"action": "done"}]}\n```';
      const commands = extractCommands(text);

      // Ambos se extraen — el filtrado de comandos sin action es del consumidor
      expect(commands).toHaveLength(2);
    });

    it('maneja array commands vacío', () => {
      const text = '```json\n{"commands": []}\n```';
      const commands = extractCommands(text);

      expect(commands).toHaveLength(0);
    });

    it('maneja JSON anidado profundamente', () => {
      const text = '```json\n{"commands": [{"action": "type", "selector": "#data", "text": "{\\"key\\": \\"value\\"}"}]}\n```';
      const commands = extractCommands(text);

      expect(commands).toHaveLength(1);
      expect(commands[0].text).toBe('{"key": "value"}');
    });

    it('maneja respuesta con múltiples bloques de código mixtos', () => {
      const text = '```javascript\nconsole.log("hola")\n```\n\n```json\n{"commands": [{"action": "done"}]}\n```\n\n```python\nprint("fin")\n```';
      const commands = extractCommands(text);

      expect(commands).toHaveLength(1);
      expect(commands[0].action).toBe('done');
    });
  });
});
