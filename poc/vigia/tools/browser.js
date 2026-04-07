/**
 * ============================================================
 *  tools/browser.js — Wrapper de Playwright para VIGÍA
 * ============================================================
 *
 *  Gestiona una instancia de Chromium headless y expone
 *  funciones que el agente VIGÍA invoca como herramientas.
 *
 *  Cada función devuelve datos estructurados que el agente
 *  usa para decidir qué hacer a continuación.
 * ============================================================
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, "..", "screenshots");

// ── Estado del browser (singleton por sesión) ──────────────
let browser = null;
let context = null;
let page = null;
let screenshotCounter = 0;

/**
 * Inicializa Chromium. Usa --visible para ver el navegador en pantalla.
 * @param {object} opts - { visible: boolean }
 */
export async function initBrowser(opts = {}) {
  const headed = opts.visible || false;
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  browser = await chromium.launch({
    headless: !headed,
    slowMo: headed ? 500 : 0,
    args: headed ? ['--start-maximized'] : [],
  });
  context = await browser.newContext({
    viewport: headed ? null : { width: 1280, height: 720 }, // null = usa el tamaño de la ventana
    locale: "es-ES",
  });
  page = await context.newPage();

  // Capturar errores de consola para reportarlos
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({
        text: msg.text(),
        url: page.url(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  const mode = headed ? "visible (headed)" : "headless";
  console.log(`   🌐 Browser Chromium iniciado (${mode})`);
  return { status: "ok" };
}

// Errores de consola acumulados
const consoleErrors = [];

/**
 * Cierra el browser al terminar la sesión.
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
    console.log("   🌐 Browser cerrado");
  }
}

// ════════════════════════════════════════════════════════════
//  HERRAMIENTAS EXPUESTAS AL AGENTE
// ════════════════════════════════════════════════════════════

/**
 * Navega a una URL y espera a que cargue.
 */
export async function navigate(url) {
  const start = Date.now();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const elapsed = Date.now() - start;
    const title = await page.title();
    console.log(`   🧭 Navegado a: ${url} (${elapsed}ms)`);
    return {
      status: "ok",
      url: page.url(),
      title,
      loadTimeMs: elapsed,
    };
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`   ❌ Error navegando a ${url}: ${err.message}`);
    return {
      status: "error",
      url,
      error: err.message,
      loadTimeMs: elapsed,
    };
  }
}

/**
 * Hace click en un elemento por selector CSS.
 */
export async function click(selector) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    // Pequeña espera para que la UI reaccione
    await page.waitForTimeout(500);
    console.log(`   🖱️  Click en: ${selector}`);
    return {
      status: "ok",
      selector,
      currentUrl: page.url(),
    };
  } catch (err) {
    console.log(`   ❌ Error click en ${selector}: ${err.message}`);
    return {
      status: "error",
      selector,
      error: err.message,
    };
  }
}

/**
 * Hace click en un elemento por su texto visible.
 * Usa page.getByText() de Playwright — más robusto que selectores CSS.
 */
export async function clickText(text, opts = {}) {
  try {
    const exact = opts.exact ?? false;
    const locator = page.getByText(text, { exact });
    await locator.first().click({ timeout: 5000 });
    await page.waitForTimeout(500);
    console.log(`   🖱️  Click en texto: "${text}"`);
    return {
      status: "ok",
      text,
      currentUrl: page.url(),
    };
  } catch (err) {
    console.log(`   ❌ Error click en texto "${text}": ${err.message}`);
    return {
      status: "error",
      text,
      error: err.message,
    };
  }
}

/**
 * Escribe texto en un campo de formulario.
 */
export async function type(selector, text) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, text);
    console.log(`   ⌨️  Escrito "${text}" en: ${selector}`);
    return {
      status: "ok",
      selector,
      text,
    };
  } catch (err) {
    console.log(`   ❌ Error escribiendo en ${selector}: ${err.message}`);
    return {
      status: "error",
      selector,
      error: err.message,
    };
  }
}

/**
 * Captura un screenshot con nombre descriptivo.
 * Devuelve la ruta del archivo guardado.
 */
export async function screenshot(name) {
  screenshotCounter++;
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
  const filename = `${String(screenshotCounter).padStart(2, "0")}_${safeName}.png`;
  const filepath = join(SCREENSHOTS_DIR, filename);

  try {
    // Capturar screenshot y obtener buffer para codificar como base64
    const buffer = await page.screenshot({ path: filepath, fullPage: true });
    const sizeKB = Math.round(buffer.length / 1024);
    console.log(`   📸 Screenshot: ${filename} (${sizeKB}KB)`);

    // Codificar como base64 para visión del agente (límite: 5MB)
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    let base64 = null;
    if (buffer.length <= MAX_IMAGE_BYTES) {
      base64 = buffer.toString("base64");
    } else {
      console.log(`   ⚠️  Screenshot muy grande para visión (${(buffer.length / 1024 / 1024).toFixed(1)}MB), solo metadata`);
    }

    return {
      status: "ok",
      filename,
      filepath,
      base64,
      mimeType: "image/png",
      sizeKB,
    };
  } catch (err) {
    console.log(`   ❌ Error screenshot: ${err.message}`);
    return {
      status: "error",
      error: err.message,
    };
  }
}

/**
 * Obtiene información de la página actual: título, URL,
 * texto visible, links, y estructura básica.
 */
export async function getPageInfo() {
  try {
    const title = await page.title();
    const url = page.url();

    // Extraer texto visible, links, botones, inputs
    const info = await page.evaluate(() => {
      const getText = (el) => el?.textContent?.trim()?.substring(0, 200) || "";

      // Links de navegación
      const links = [...document.querySelectorAll("a[href]")]
        .map((a) => ({
          text: getText(a),
          href: a.getAttribute("href"),
        }))
        .filter((l) => l.text && l.href)
        .slice(0, 15);

      // Botones
      const buttons = [...document.querySelectorAll("button, [role='button']")]
        .map((b) => ({
          text: getText(b),
          disabled: b.disabled || false,
        }))
        .filter((b) => b.text)
        .slice(0, 10);

      // Inputs/formularios
      const inputs = [...document.querySelectorAll("input, textarea, select")]
        .map((i) => ({
          type: i.type || i.tagName.toLowerCase(),
          name: i.name || i.id || "",
          placeholder: i.placeholder || "",
          required: i.required || false,
        }))
        .slice(0, 10);

      // Encabezados
      const headings = [...document.querySelectorAll("h1, h2, h3")]
        .map((h) => ({
          level: h.tagName,
          text: getText(h),
        }))
        .slice(0, 8);

      // Imágenes sin alt
      const imagesWithoutAlt = [...document.querySelectorAll("img")]
        .filter((img) => !img.alt || img.alt.trim() === "")
        .length;

      const totalImages = document.querySelectorAll("img").length;

      // Texto principal visible
      const mainText = getText(
        document.querySelector("main") ||
        document.querySelector("[role='main']") ||
        document.body
      );

      // Errores de contraste básicos (texto sobre fondo)
      const bodyStyles = window.getComputedStyle(document.body);

      return {
        links,
        buttons,
        inputs,
        headings,
        mainText: mainText.substring(0, 300),
        imagesWithoutAlt,
        totalImages,
        bodyBackground: bodyStyles.backgroundColor,
        bodyColor: bodyStyles.color,
        documentLang: document.documentElement.lang || "no definido",
        metaViewport: !!document.querySelector('meta[name="viewport"]'),
        consoleErrorCount: 0, // Se llena desde fuera
      };
    });

    info.consoleErrorCount = consoleErrors.length;

    console.log(`   📄 Info de página: ${title} (${url})`);
    return {
      status: "ok",
      title,
      url,
      ...info,
    };
  } catch (err) {
    console.log(`   ❌ Error getPageInfo: ${err.message}`);
    return {
      status: "error",
      error: err.message,
    };
  }
}

/**
 * Mide rendimiento de la página actual.
 */
export async function checkPerformance() {
  try {
    const metrics = await page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing || {};
      const navigation = perf.getEntriesByType("navigation")[0] || {};

      // Resource timing
      const resources = perf.getEntriesByType("resource");
      const slowResources = resources
        .filter((r) => r.duration > 1000)
        .map((r) => ({
          name: r.name.split("/").pop().substring(0, 50),
          type: r.initiatorType,
          durationMs: Math.round(r.duration),
        }))
        .slice(0, 10);

      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime) || 0,
        loadComplete: Math.round(navigation.loadEventEnd - navigation.startTime) || 0,
        domInteractive: Math.round(navigation.domInteractive - navigation.startTime) || 0,
        totalResources: resources.length,
        slowResources,
        transferSizeKB: Math.round(
          resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024
        ),
      };
    });

    console.log(`   ⚡ Performance: DOM=${metrics.domContentLoaded}ms, Load=${metrics.loadComplete}ms`);
    return {
      status: "ok",
      ...metrics,
    };
  } catch (err) {
    console.log(`   ❌ Error checkPerformance: ${err.message}`);
    return {
      status: "error",
      error: err.message,
    };
  }
}

/**
 * Cambia el viewport para emular mobile.
 */
export async function setViewport(width, height) {
  try {
    await page.setViewportSize({ width, height });
    // Esperar a que la UI se adapte
    await page.waitForTimeout(500);
    console.log(`   📱 Viewport cambiado a ${width}x${height}`);
    return {
      status: "ok",
      width,
      height,
    };
  } catch (err) {
    console.log(`   ❌ Error setViewport: ${err.message}`);
    return {
      status: "error",
      error: err.message,
    };
  }
}

/**
 * Espera un tiempo (ms) — útil para animaciones/transiciones.
 */
export async function wait(ms) {
  try {
    await page.waitForTimeout(ms);
    return { status: "ok", waitedMs: ms };
  } catch (err) {
    return { status: "error", error: err.message };
  }
}

/**
 * Types text character-by-character to trigger autocomplete/dropdown,
 * then clicks the first matching suggestion if one appears.
 */
export async function typeAndSelect(selector, text, opts = {}) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.fill(selector, '');
    for (const char of text) {
      await page.keyboard.type(char, { delay: 50 });
    }
    const suggestionsSelector = opts.suggestionsSelector || '[role="listbox"], [role="option"], .suggestions, .autocomplete-results, ul.dropdown-menu, [class*="suggestion"], [class*="dropdown"], [class*="autocomplete"], [class*="results"]';
    try {
      await page.waitForSelector(suggestionsSelector, { timeout: 3000 });
      const option = await page.$(suggestionsSelector + ' li, ' + suggestionsSelector + ' [role="option"], ' + suggestionsSelector + ' a, ' + suggestionsSelector + ' div');
      if (option) {
        const optionText = await option.textContent();
        await option.click();
        await page.waitForTimeout(500);
        console.log(`   ⌨️  Typed "${text}", selected: "${optionText.trim()}"`);
        return { status: "ok", typed: text, selected: optionText.trim(), method: "autocomplete" };
      }
    } catch {
      // No suggestions appeared
    }
    console.log(`   ⌨️  Typed "${text}", no suggestions found`);
    return { status: "ok", typed: text, selected: null, method: "no_suggestions" };
  } catch (err) {
    console.log(`   ❌ Error typeAndSelect en ${selector}: ${err.message}`);
    return { status: "error", selector, error: err.message };
  }
}

/**
 * Waits for DOM to stabilize — network idle + no mutations for a period.
 */
export async function waitForStable(opts = {}) {
  const timeout = opts.timeout || 5000;
  try {
    await page.waitForLoadState('networkidle', { timeout });
    await page.evaluate((stableMs) => {
      return new Promise((resolve) => {
        let timer;
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(() => { observer.disconnect(); resolve(); }, stableMs);
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        timer = setTimeout(() => { observer.disconnect(); resolve(); }, stableMs);
      });
    }, opts.stableMs || 500);
    console.log(`   ⏳ DOM stabilized`);
    return { status: "ok", settled: true };
  } catch {
    console.log(`   ⏳ DOM stabilization timeout`);
    return { status: "ok", settled: false, note: "timeout waiting for stability" };
  }
}

/**
 * Injects axe-core via CDN and runs accessibility audit on current page.
 */
export async function checkAccessibility() {
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js' });
    await page.waitForFunction(() => typeof window.axe !== 'undefined', { timeout: 5000 });

    const results = await page.evaluate(async () => {
      const res = await window.axe.run();
      return {
        violations: res.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length
        })),
        passes: res.passes.length,
        incomplete: res.incomplete.length
      };
    });

    console.log(`   ♿ Accessibility: ${results.violations.length} violations, ${results.passes} passes`);
    return { status: "ok", ...results };
  } catch (err) {
    console.log(`   ❌ Error checkAccessibility: ${err.message}`);
    return { status: "error", error: err.message };
  }
}

/**
 * Checks all links on the page for broken (non-2xx) responses.
 */
export async function checkLinks() {
  try {
    const links = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href]')]
        .map(a => ({ href: a.href, text: a.textContent.trim().substring(0, 50) }))
        .filter(l => l.href.startsWith('http'))
        .slice(0, 20);
    });

    const results = [];
    for (const link of links) {
      try {
        const response = await page.request.head(link.href, { timeout: 5000 });
        if (!response.ok()) {
          results.push({ ...link, status: response.status(), broken: true });
        }
      } catch {
        results.push({ ...link, status: 0, broken: true, error: "unreachable" });
      }
    }

    console.log(`   🔗 Links: ${links.length} total, ${results.length} broken`);
    return {
      status: "ok",
      totalLinks: links.length,
      brokenLinks: results.length,
      broken: results
    };
  } catch (err) {
    console.log(`   ❌ Error checkLinks: ${err.message}`);
    return { status: "error", error: err.message };
  }
}

/**
 * Devuelve los errores de consola acumulados.
 */
export function getConsoleErrors() {
  return [...consoleErrors];
}
