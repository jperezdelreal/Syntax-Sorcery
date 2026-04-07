/**
 * Ejecuta un comando JSON devuelto por el agente.
 * Mapea cada acción a la función correspondiente de browser/reporter.
 */
import * as browser from "../tools/browser.js";
import * as reporter from "../tools/reporter.js";

/** Extract text from :contains('...') or :has-text('...') pseudo-selectors */
export function extractTextFromSelector(selector) {
  const match = selector.match(/:(?:contains|has-text)\(\s*['"](.+?)['"]\s*\)/i);
  return match ? match[1] : null;
}

export async function executeCommand(cmd) {
  try {
    switch (cmd.action) {
      case "navigate":
        return await browser.navigate(cmd.url);

      case "click": {
        const result = await browser.click(cmd.selector);
        if (result.status === "error") {
          const text = extractTextFromSelector(cmd.selector);
          if (text) {
            console.log(`   🔄 CSS click failed, retrying with clickText("${text}")`);
            const fallback = await browser.clickText(text);
            if (fallback.status === "ok") return fallback;
          }
        }
        return result;
      }

      case "click_text":
        return await browser.clickText(cmd.text, { exact: cmd.exact });

      case "type":
        return await browser.type(cmd.selector, cmd.text);

      case "screenshot":
        return await browser.screenshot(cmd.name);

      case "get_page_info":
        return await browser.getPageInfo();

      case "check_performance":
        return await browser.checkPerformance();

      case "report_issue":
        return reporter.reportIssue(
          cmd.title,
          cmd.description,
          cmd.severity,
          cmd.screenshot || null
        );

      case "set_viewport":
        return await browser.setViewport(cmd.width, cmd.height);

      case "wait":
        return await browser.wait(cmd.ms);

      case "type_and_select":
        return await browser.typeAndSelect(cmd.selector, cmd.text, {
          suggestionsSelector: cmd.suggestionsSelector,
        });

      case "wait_for_stable":
        return await browser.waitForStable({
          timeout: cmd.timeout,
          stableMs: cmd.stableMs,
        });

      case "check_accessibility":
        return await browser.checkAccessibility();

      case "check_links":
        return await browser.checkLinks();

      case "done":
        return { status: "done" };

      default:
        return { status: "error", error: `Acción desconocida: ${cmd.action}` };
    }
  } catch (err) {
    console.log(`   ❌ Error inesperado en ${cmd.action}: ${err.message}`);
    return { status: "error", action: cmd.action, error: err.message };
  }
}
