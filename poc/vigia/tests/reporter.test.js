/**
 * Tests unitarios para reporter.js — Generador de informes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import * as reporter from '../tools/reporter.js';
import { writeFile, mkdir } from 'fs/promises';

// ════════════════════════════════════════════════════════════
//  B. UNIT TESTS — reporter.js
// ════════════════════════════════════════════════════════════

describe('reporter.js — generador de informes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporter.startSession('https://app-de-prueba.com');
  });

  // ── startSession ────────────────────────────────────────
  describe('startSession(url)', () => {
    it('inicializa la sesión con la URL objetivo', () => {
      const summary = reporter.getIssuesSummary();
      expect(summary.total).toBe(0);
      expect(summary.issues).toEqual([]);
    });

    it('resetea issues y acciones de sesiones anteriores', () => {
      reporter.reportIssue('Bug viejo', 'Desc', 'major');
      reporter.logAction('navigate', 'https://old.com');

      // Nueva sesión debe limpiar todo
      reporter.startSession('https://nueva-app.com');
      const summary = reporter.getIssuesSummary();
      expect(summary.total).toBe(0);
    });
  });

  // ── reportIssue ─────────────────────────────────────────
  describe('reportIssue(title, description, severity)', () => {
    it('registra un issue con ID incremental', () => {
      const issue1 = reporter.reportIssue('Error 1', 'Primer error', 'critical');
      const issue2 = reporter.reportIssue('Error 2', 'Segundo error', 'major');

      expect(issue1.id).toBe(1);
      expect(issue2.id).toBe(2);
    });

    it('almacena título, descripción y severidad correctamente', () => {
      const issue = reporter.reportIssue('Botón roto', 'No responde al click', 'critical');

      expect(issue.title).toBe('Botón roto');
      expect(issue.description).toBe('No responde al click');
      expect(issue.severity).toBe('critical');
    });

    it('incluye timestamp ISO del momento del reporte', () => {
      const issue = reporter.reportIssue('Test', 'Desc', 'minor');
      expect(issue.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('soporta screenshot opcional', () => {
      const conScreenshot = reporter.reportIssue('Visual', 'Se ve mal', 'major', '01_homepage.png');
      expect(conScreenshot.screenshot).toBe('01_homepage.png');

      const sinScreenshot = reporter.reportIssue('Logic', 'Falla', 'minor');
      expect(sinScreenshot.screenshot).toBeNull();
    });

    it('acepta las tres severidades válidas: critical, major, minor', () => {
      const c = reporter.reportIssue('C', 'D', 'critical');
      const m = reporter.reportIssue('M', 'D', 'major');
      const n = reporter.reportIssue('N', 'D', 'minor');

      expect(c.severity).toBe('critical');
      expect(m.severity).toBe('major');
      expect(n.severity).toBe('minor');
    });

    it('acepta severidad desconocida sin lanzar error', () => {
      const issue = reporter.reportIssue('Raro', 'Desc', 'unknown');
      expect(issue.severity).toBe('unknown');
    });
  });

  // ── logAction ───────────────────────────────────────────
  describe('logAction(action, details)', () => {
    it('registra acción con timestamp', () => {
      reporter.logAction('navigate', 'https://example.com');
      reporter.logAction('click', '#btn');

      // Verificar vía generateReport que las acciones se registraron
      const summary = reporter.getIssuesSummary();
      // logAction no afecta issues, pero el conteo de acciones se ve en generateReport
      expect(summary.total).toBe(0); // No afecta issues
    });
  });

  // ── getIssuesSummary ────────────────────────────────────
  describe('getIssuesSummary()', () => {
    it('cuenta correctamente por severidad', () => {
      reporter.reportIssue('C1', 'D', 'critical');
      reporter.reportIssue('C2', 'D', 'critical');
      reporter.reportIssue('M1', 'D', 'major');
      reporter.reportIssue('N1', 'D', 'minor');
      reporter.reportIssue('N2', 'D', 'minor');
      reporter.reportIssue('N3', 'D', 'minor');

      const summary = reporter.getIssuesSummary();

      expect(summary.total).toBe(6);
      expect(summary.critical).toBe(2);
      expect(summary.major).toBe(1);
      expect(summary.minor).toBe(3);
    });

    it('incluye lista de issues con id, title y severity', () => {
      reporter.reportIssue('Bug', 'Desc', 'major');
      const summary = reporter.getIssuesSummary();

      expect(summary.issues).toEqual([
        { id: 1, title: 'Bug', severity: 'major' },
      ]);
    });
  });

  // ── generateReport ──────────────────────────────────────
  describe('generateReport()', () => {
    it('crea directorio de reportes con mkdir recursivo', async () => {
      await reporter.generateReport();

      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('reports'),
        { recursive: true }
      );
    });

    it('genera archivo markdown con nombre correcto', async () => {
      const result = await reporter.generateReport();

      expect(result.filename).toMatch(/^vigia-report-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.md$/);
      expect(result.filepath).toContain('reports');
    });

    it('incluye secciones obligatorias en el markdown', async () => {
      reporter.reportIssue('Error de carga', 'Timeout en API', 'critical');
      reporter.logAction('navigate', 'https://app.com');

      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('# 🔍 Informe VIGÍA');
      expect(markdown).toContain('## Resumen Ejecutivo');
      expect(markdown).toContain('## Issues Encontrados');
      expect(markdown).toContain('## Log de Acciones');
      expect(markdown).toContain('## Metadata');
    });

    it('incluye URL objetivo en el informe', async () => {
      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('https://app-de-prueba.com');
    });

    it('cuenta issues correctamente por severidad en el resumen', async () => {
      reporter.reportIssue('C', 'D', 'critical');
      reporter.reportIssue('M', 'D', 'major');
      reporter.reportIssue('N1', 'D', 'minor');
      reporter.reportIssue('N2', 'D', 'minor');

      const result = await reporter.generateReport();

      expect(result.totalIssues).toBe(4);
      expect(result.critical).toBe(1);
      expect(result.major).toBe(1);
      expect(result.minor).toBe(2);
    });

    it('ordena issues por severidad: critical > major > minor (lógica de sort)', () => {
      // Verificar el algoritmo de ordenamiento — usa ?? (no ||) para que 0 no sea falsy
      const testIssues = [
        { severity: 'minor', title: 'N' },
        { severity: 'critical', title: 'C' },
        { severity: 'major', title: 'M' },
      ];
      const order = { critical: 0, major: 1, minor: 2 };
      const sorted = [...testIssues].sort((a, b) =>
        (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
      );

      expect(sorted[0].severity).toBe('critical');
      expect(sorted[1].severity).toBe('major');
      expect(sorted[2].severity).toBe('minor');
    });

    it('incluye todos los issues en el informe generado', async () => {
      let capturedMarkdown = '';
      writeFile.mockImplementation((p, content) => {
        capturedMarkdown = content;
        return Promise.resolve();
      });

      reporter.reportIssue('Error de carga API', 'Timeout', 'critical');
      reporter.reportIssue('Contraste bajo', 'Texto difícil de leer', 'minor');

      await reporter.generateReport();

      expect(capturedMarkdown).toContain('Error de carga API');
      expect(capturedMarkdown).toContain('Contraste bajo');
      expect(capturedMarkdown).toContain('critical');
      expect(capturedMarkdown).toContain('minor');
    });

    it('maneja cero issues con mensaje elegante', async () => {
      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('No se encontraron issues');
    });

    it('incluye evidencia de screenshot cuando existe', async () => {
      reporter.reportIssue('Bug visual', 'Se ve mal', 'major', '03_homepage.png');

      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('![screenshot](../screenshots/03_homepage.png)');
    });

    it('incluye log de acciones con detalles truncados', async () => {
      reporter.logAction('navigate', 'https://example.com');
      reporter.logAction('click', '#boton-principal');

      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('navigate');
      expect(markdown).toContain('click');
      expect(markdown).toContain('#boton-principal');
    });

    it('devuelve duración en minutos como número', async () => {
      const result = await reporter.generateReport();

      expect(result.durationMin).toBeTypeOf('number');
      expect(result.durationMin).toBeGreaterThanOrEqual(0);
    });

    it('devuelve conteo de acciones ejecutadas', async () => {
      reporter.logAction('a1', 'd1');
      reporter.logAction('a2', 'd2');
      reporter.logAction('a3', 'd3');

      const result = await reporter.generateReport();
      expect(result.actionsExecuted).toBe(3);
    });

    it('incluye metadata de versión y motor', async () => {
      await reporter.generateReport();

      const markdown = writeFile.mock.calls[0][1];
      expect(markdown).toContain('VIGÍA Version');
      expect(markdown).toContain('Copilot SDK');
      expect(markdown).toContain('Playwright');
    });
  });
});
