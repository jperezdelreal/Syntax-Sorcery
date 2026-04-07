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
    slowMo: headed ? 500 : 0, // 500ms entre acciones para que puedas ver qué hace
  });
  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
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
        .slice(0, 30);

      // Botones
      const buttons = [...document.querySelectorAll("button, [role='button']")]
        .map((b) => ({
          text: getText(b),
          disabled: b.disabled || false,
        }))
        .filter((b) => b.text)
        .slice(0, 20);

      // Inputs/formularios
      const inputs = [...document.querySelectorAll("input, textarea, select")]
        .map((i) => ({
          type: i.type || i.tagName.toLowerCase(),
          name: i.name || i.id || "",
          placeholder: i.placeholder || "",
          required: i.required || false,
        }))
        .slice(0, 20);

      // Encabezados
      const headings = [...document.querySelectorAll("h1, h2, h3")]
        .map((h) => ({
          level: h.tagName,
          text: getText(h),
        }))
        .slice(0, 15);

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
        mainText: mainText.substring(0, 500),
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
 * Devuelve los errores de consola acumulados.
 */
export function getConsoleErrors() {
  return [...consoleErrors];
}
