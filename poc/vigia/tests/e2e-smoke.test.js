/**
 * ============================================================
 *  E2E Smoke Test — Layer 1: Playwright Browser Automation
 * ============================================================
 *
 *  Tests REAL Playwright browser automation against example.com.
 *  No mocks. No SDK. No auth required.
 *  Proves the foundation VIGÍA depends on actually works.
 *
 *  This test ALWAYS runs — no environment variables needed.
 * ============================================================
 */
import { describe, it, expect, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('E2E Smoke — Playwright directo contra example.com', { timeout: 60000 }, () => {
  let browser;
  let context;
  let page;

  afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  });

  it('lanza Chromium headless sin crash', async () => {
    browser = await chromium.launch({ headless: true });
    expect(browser).toBeDefined();
    expect(browser.isConnected()).toBe(true);
  });

  it('crea contexto y página', async () => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'es-ES',
    });
    page = await context.newPage();
    expect(page).toBeDefined();
  });

  it('navega a example.com y carga correctamente', async () => {
    const response = await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    expect(response).toBeDefined();
    expect(response.status()).toBe(200);
    expect(page.url()).toContain('example.com');
  });

  it('obtiene el título de la página', async () => {
    const title = await page.title();
    expect(title).toBe('Example Domain');
  });

  it('toma screenshot y devuelve buffer PNG válido', async () => {
    const screenshot = await page.screenshot({ type: 'png' });
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(1000);
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    expect(screenshot[0]).toBe(0x89);
    expect(screenshot[1]).toBe(0x50);
    expect(screenshot[2]).toBe(0x4E);
    expect(screenshot[3]).toBe(0x47);
  });

  it('extrae información de la página (título, URL, enlaces)', async () => {
    const info = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map((a) => ({
        text: a.textContent.trim(),
        href: a.href,
      }));
      return {
        title: document.title,
        url: window.location.href,
        h1: document.querySelector('h1')?.textContent?.trim() || null,
        linkCount: links.length,
        links,
      };
    });

    expect(info.title).toBe('Example Domain');
    expect(info.url).toContain('example.com');
    expect(info.h1).toBe('Example Domain');
    expect(info.linkCount).toBeGreaterThan(0);
    expect(info.links[0]).toHaveProperty('text');
    expect(info.links[0]).toHaveProperty('href');
  });

  it('ejecuta click sin crash (enlace "More information...")', async () => {
    const linkCount = await page.locator('a').count();
    expect(linkCount).toBeGreaterThan(0);

    // Click and wait for navigation (example.com links to iana.org)
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 30000 }),
      page.locator('a').first().click(),
    ]);
    expect(response).toBeDefined();
    expect(page.url()).not.toBe('https://example.com/');
  });

  it('cierra browser limpiamente', async () => {
    await browser.close();
    expect(browser.isConnected()).toBe(false);
    browser = null;
    context = null;
    page = null;
  });
});
