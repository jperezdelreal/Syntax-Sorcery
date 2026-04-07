/**
 * Tests de integración para el parsing y ejecución de comandos JSON.
 * Cubre extractCommands (parsing) y executeCommand (dispatch).
 */
import { describe, it, expect, vi } from 'vitest';
import { extractCommands } from '../lib/extract-commands.js';

// ── Mock browser y reporter para executeCommand ───────────
vi.mock('../tools/browser.js', () => ({
  navigate: vi.fn().mockResolvedValue({ status: 'ok', url: 'https://test.com', title: 'Test', loadTimeMs: 100 }),
  click: vi.fn().mockResolvedValue({ status: 'ok', selector: '#btn', currentUrl: 'https://test.com' }),
  clickText: vi.fn().mockResolvedValue({ status: 'ok', text: 'Mecánica', currentUrl: 'https://test.com/mecanica' }),
  type: vi.fn().mockResolvedValue({ status: 'ok', selector: '#input', text: 'hello' }),
  screenshot: vi.fn().mockResolvedValue({ status: 'ok', filename: '01_test.png', filepath: '/path/01_test.png' }),
  getPageInfo: vi.fn().mockResolvedValue({ status: 'ok', title: 'Test', url: 'https://test.com' }),
  checkPerformance: vi.fn().mockResolvedValue({ status: 'ok', domContentLoaded: 200, loadComplete: 500 }),
  setViewport: vi.fn().mockResolvedValue({ status: 'ok', width: 375, height: 667 }),
  wait: vi.fn().mockResolvedValue({ status: 'ok', waitedMs: 1000 }),
  typeAndSelect: vi.fn().mockResolvedValue({ status: 'ok', typed: 'Mad', selected: 'Madrid', method: 'autocomplete' }),
  waitForStable: vi.fn().mockResolvedValue({ status: 'ok', settled: true }),
  checkAccessibility: vi.fn().mockResolvedValue({ status: 'ok', violations: [], passes: 50, incomplete: 1 }),
  checkLinks: vi.fn().mockResolvedValue({ status: 'ok', totalLinks: 5, brokenLinks: 0, broken: [] }),
}));

vi.mock('../tools/reporter.js', () => ({
  reportIssue: vi.fn().mockReturnValue({ id: 1, title: 'Test Issue', severity: 'major' }),
}));

// Importar mocks para verificar llamadas
import * as browser from '../tools/browser.js';
import * as reporter from '../tools/reporter.js';
import { executeCommand, extractTextFromSelector } from '../lib/execute-command.js';

// ════════════════════════════════════════════════════════════
//  C. TESTS — extractCommands (Parsing de JSON)
// ════════════════════════════════════════════════════════════

describe('extractCommands() — parsing de respuesta del agente', () => {
  it('parsea un comando único en bloque ```json', () => {
    const text = 'Análisis:\n```json\n{"commands": [{"action": "navigate", "url": "https://example.com"}]}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(1);
    expect(commands[0].action).toBe('navigate');
    expect(commands[0].url).toBe('https://example.com');
  });

  it('parsea múltiples comandos en un solo bloque', () => {
    const text = '```json\n{"commands": [\n  {"action": "navigate", "url": "https://example.com"},\n  {"action": "screenshot", "name": "home"},\n  {"action": "get_page_info"}\n]}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(3);
    expect(commands[0].action).toBe('navigate');
    expect(commands[1].action).toBe('screenshot');
    expect(commands[2].action).toBe('get_page_info');
  });

  it('parsea múltiples bloques ```json separados', () => {
    const text = 'Primero hago:\n```json\n{"commands": [{"action": "navigate", "url": "https://a.com"}]}\n```\nAhora:\n```json\n{"commands": [{"action": "screenshot", "name": "step2"}]}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(2);
    expect(commands[0].action).toBe('navigate');
    expect(commands[1].action).toBe('screenshot');
  });

  it('parsea comando suelto (sin array commands)', () => {
    const text = '```json\n{"action": "done"}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(1);
    expect(commands[0].action).toBe('done');
  });

  it('maneja JSON malformado sin crashear', () => {
    const text = '```json\n{esto no es json válido}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(0); // No explota
  });

  it('limpia trailing commas en JSON (tolerancia a LLM)', () => {
    const text = '```json\n{"commands": [{"action": "navigate", "url": "https://test.com",},]}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(1);
    expect(commands[0].action).toBe('navigate');
  });

  it('devuelve array vacío para respuesta sin JSON', () => {
    const text = 'No tengo comandos que ejecutar en este momento. Necesito más información.';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(0);
  });

  it('devuelve array vacío para string vacío', () => {
    expect(extractCommands('')).toEqual([]);
  });

  it('devuelve array vacío para undefined (no crashea)', () => {
    // RegExp.exec convierte undefined a "undefined" — no hay JSON, devuelve []
    expect(extractCommands(undefined)).toEqual([]);
  });

  it('usa fallback de JSON suelto sin backticks', () => {
    const text = 'Aquí van los comandos: {"commands": [{"action": "screenshot", "name": "test"}]}';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(1);
    expect(commands[0].action).toBe('screenshot');
  });

  it('prioriza bloques ```json sobre JSON suelto', () => {
    const text = '```json\n{"commands": [{"action": "navigate", "url": "https://a.com"}]}\n```\nExtra: {"commands": [{"action": "done"}]}';
    const commands = extractCommands(text);

    // El bloque ```json tiene prioridad; el fallback solo se usa si no hay bloques
    expect(commands).toHaveLength(1);
    expect(commands[0].action).toBe('navigate');
  });

  it('maneja comando done en array de comandos', () => {
    const text = '```json\n{"commands": [{"action": "report_issue", "title": "Bug", "description": "Error", "severity": "major"}, {"action": "done"}]}\n```';
    const commands = extractCommands(text);

    expect(commands).toHaveLength(2);
    expect(commands[1].action).toBe('done');
  });
});

// ════════════════════════════════════════════════════════════
//  C. TESTS — executeCommand (Dispatch de acciones)
// ════════════════════════════════════════════════════════════

describe('executeCommand() — despacho de acciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('despacha navigate a browser.navigate con la URL', async () => {
    await executeCommand({ action: 'navigate', url: 'https://test.com' });
    expect(browser.navigate).toHaveBeenCalledWith('https://test.com');
  });

  it('despacha click a browser.click con el selector', async () => {
    await executeCommand({ action: 'click', selector: '#btn' });
    expect(browser.click).toHaveBeenCalledWith('#btn');
  });

  it('despacha type a browser.type con selector y texto', async () => {
    await executeCommand({ action: 'type', selector: '#input', text: 'hola' });
    expect(browser.type).toHaveBeenCalledWith('#input', 'hola');
  });

  it('despacha screenshot a browser.screenshot con nombre', async () => {
    await executeCommand({ action: 'screenshot', name: 'pagina' });
    expect(browser.screenshot).toHaveBeenCalledWith('pagina');
  });

  it('despacha get_page_info a browser.getPageInfo', async () => {
    await executeCommand({ action: 'get_page_info' });
    expect(browser.getPageInfo).toHaveBeenCalled();
  });

  it('despacha check_performance a browser.checkPerformance', async () => {
    await executeCommand({ action: 'check_performance' });
    expect(browser.checkPerformance).toHaveBeenCalled();
  });

  it('despacha report_issue a reporter.reportIssue con datos', async () => {
    await executeCommand({
      action: 'report_issue',
      title: 'Bug',
      description: 'Se rompe',
      severity: 'critical',
      screenshot: '01_bug.png',
    });
    expect(reporter.reportIssue).toHaveBeenCalledWith('Bug', 'Se rompe', 'critical', '01_bug.png');
  });

  it('despacha report_issue con screenshot null si no viene', async () => {
    await executeCommand({
      action: 'report_issue',
      title: 'Bug',
      description: 'Error',
      severity: 'minor',
    });
    expect(reporter.reportIssue).toHaveBeenCalledWith('Bug', 'Error', 'minor', null);
  });

  it('despacha set_viewport a browser.setViewport con dimensiones', async () => {
    await executeCommand({ action: 'set_viewport', width: 375, height: 667 });
    expect(browser.setViewport).toHaveBeenCalledWith(375, 667);
  });

  it('despacha wait a browser.wait con milisegundos', async () => {
    await executeCommand({ action: 'wait', ms: 2000 });
    expect(browser.wait).toHaveBeenCalledWith(2000);
  });

  it('devuelve {status: "done"} para acción done', async () => {
    const result = await executeCommand({ action: 'done' });
    expect(result).toEqual({ status: 'done' });
  });

  it('devuelve error para acción desconocida', async () => {
    const result = await executeCommand({ action: 'fly_to_moon' });
    expect(result.status).toBe('error');
    expect(result.error).toContain('Acción desconocida');
    expect(result.error).toContain('fly_to_moon');
  });

  it('captura excepciones inesperadas sin crashear', async () => {
    browser.navigate.mockRejectedValueOnce(new Error('Boom'));
    const result = await executeCommand({ action: 'navigate', url: 'https://crash.com' });
    expect(result.status).toBe('error');
    expect(result.error).toContain('Boom');
  });

  // ── click_text fallback tests ─────────────────────────────
  it('fallback: retries with clickText when CSS click fails and selector has :contains', async () => {
    browser.click.mockResolvedValueOnce({ status: 'error', selector: "button:contains('Mecánica')", error: 'not found' });
    browser.clickText.mockResolvedValueOnce({ status: 'ok', text: 'Mecánica', currentUrl: 'https://test.com/mecanica' });

    const result = await executeCommand({ action: 'click', selector: "button:contains('Mecánica')" });

    expect(browser.click).toHaveBeenCalledWith("button:contains('Mecánica')");
    expect(browser.clickText).toHaveBeenCalledWith('Mecánica');
    expect(result.status).toBe('ok');
    expect(result.text).toBe('Mecánica');
  });

  it('fallback: no retry when CSS click succeeds', async () => {
    browser.click.mockResolvedValueOnce({ status: 'ok', selector: '#btn', currentUrl: 'https://test.com' });

    await executeCommand({ action: 'click', selector: '#btn' });

    expect(browser.click).toHaveBeenCalledWith('#btn');
    expect(browser.clickText).not.toHaveBeenCalled();
  });

  it('fallback: no retry when selector has no :contains text', async () => {
    browser.click.mockResolvedValueOnce({ status: 'error', selector: '#missing', error: 'not found' });

    const result = await executeCommand({ action: 'click', selector: '#missing' });

    expect(browser.clickText).not.toHaveBeenCalled();
    expect(result.status).toBe('error');
  });

  it('fallback: returns original error when clickText also fails', async () => {
    browser.click.mockResolvedValueOnce({ status: 'error', selector: "a:contains('Gone')", error: 'not found' });
    browser.clickText.mockResolvedValueOnce({ status: 'error', text: 'Gone', error: 'text not found' });

    const result = await executeCommand({ action: 'click', selector: "a:contains('Gone')" });

    expect(browser.clickText).toHaveBeenCalledWith('Gone');
    expect(result.status).toBe('error');
  });

  it('extractTextFromSelector extracts text from :contains patterns', () => {
    expect(extractTextFromSelector("button:contains('Mecánica')")).toBe('Mecánica');
    expect(extractTextFromSelector('a:contains("About Us")')).toBe('About Us');
    expect(extractTextFromSelector(':has-text("Login")')).toBe('Login');
    expect(extractTextFromSelector('#btn')).toBeNull();
    expect(extractTextFromSelector('.nav-link')).toBeNull();
  });

  it('despacha type_and_select a browser.typeAndSelect con selector, texto y opciones', async () => {
    await executeCommand({ action: 'type_and_select', selector: '#city', text: 'Mad', suggestionsSelector: '.dropdown' });
    expect(browser.typeAndSelect).toHaveBeenCalledWith('#city', 'Mad', { suggestionsSelector: '.dropdown' });
  });

  it('despacha type_and_select sin suggestionsSelector usa undefined', async () => {
    await executeCommand({ action: 'type_and_select', selector: '#q', text: 'test' });
    expect(browser.typeAndSelect).toHaveBeenCalledWith('#q', 'test', { suggestionsSelector: undefined });
  });

  it('despacha wait_for_stable a browser.waitForStable con opciones', async () => {
    await executeCommand({ action: 'wait_for_stable', timeout: 10000, stableMs: 1000 });
    expect(browser.waitForStable).toHaveBeenCalledWith({ timeout: 10000, stableMs: 1000 });
  });

  it('despacha wait_for_stable sin opciones usa defaults', async () => {
    await executeCommand({ action: 'wait_for_stable' });
    expect(browser.waitForStable).toHaveBeenCalledWith({ timeout: undefined, stableMs: undefined });
  });

  it('despacha check_accessibility a browser.checkAccessibility', async () => {
    const result = await executeCommand({ action: 'check_accessibility' });
    expect(browser.checkAccessibility).toHaveBeenCalled();
    expect(result.status).toBe('ok');
  });

  it('despacha check_links a browser.checkLinks', async () => {
    const result = await executeCommand({ action: 'check_links' });
    expect(browser.checkLinks).toHaveBeenCalled();
    expect(result.status).toBe('ok');
    expect(result.totalLinks).toBe(5);
  });
});
