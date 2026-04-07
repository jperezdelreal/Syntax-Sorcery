/**
 * Ejecuta un comando JSON devuelto por el agente.
 * Mapea cada acción a la función correspondiente de browser/reporter.
 */
import * as browser from "../tools/browser.js";
import * as reporter from "../tools/reporter.js";

export async function executeCommand(cmd) {
  try {
    switch (cmd.action) {
      case "navigate":
        return await browser.navigate(cmd.url);

      case "click":
        return await browser.click(cmd.selector);

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
