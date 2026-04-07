/**
 * Tests para VIGÍA v0.9: Regresión — re-test automático de issues conocidos
 * Issue #169
 *
 * Cubre:
 *  A. Regression module (lib/regression.js) — carga de reportes, plan de re-test,
 *     categorización (✅ resuelto, ❌ persiste, 🆕 nuevo)
 *  B. Regression output — secciones, conteos, formato terminal
 *  C. CLI --regression — flag, validaciones, integración con --quiet
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock fs ───────────────────────────────────────────────
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('{}'),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

import { readFile } from 'fs/promises';

import {
  loadBaselineReport,
  buildRegressionPlan,
  categorizeRegressionResults,
  formatRegressionOutput,
} from '../lib/regression.js';
import { parseArgs } from '../lib/config.js';

// ════════════════════════════════════════════════════════════
//  HELPERS — Factories para reportes VIGÍA (formato JSON real)
// ════════════════════════════════════════════════════════════

function makeIssue(title, description, severity = 'major', extra = {}) {
  const key = `${(title || '').toLowerCase().trim()}|${severity || 'unknown'}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  const fingerprint = `vigia-${Math.abs(hash).toString(36)}`;
  return {
    id: 1,
    title,
    description,
    severity,
    fingerprint,
    timestamp: '2026-07-15T10:00:00.000Z',
    ...extra,
  };
}

function makeReport(issueList, opts = {}) {
  const url = opts.url || 'https://app-de-prueba.com';
  const urls = opts.urls || [url];
  const issues = issueList.map((i, idx) => ({ ...i, id: idx + 1 }));
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const major = issues.filter((i) => i.severity === 'major').length;
  const minor = issues.filter((i) => i.severity === 'minor').length;

  return {
    version: '0.6.0',
    url,
    urls,
    timestamp: opts.timestamp || '2026-07-15T10:00:00.000Z',
    generatedAt: opts.generatedAt || opts.timestamp || '2026-07-15T10:00:00.000Z',
    summary: {
      totalIssues: issues.length,
      critical,
      major,
      minor,
      durationMin: opts.durationMin || 5.0,
      actionsExecuted: opts.actionsExecuted || 20,
    },
    issues,
    sessions: [{
      url,
      issues,
      actionsCount: opts.actionsExecuted || 20,
      duration: (opts.durationMin || 5.0) * 60000,
    }],
  };
}

// ════════════════════════════════════════════════════════════
//  A. REGRESSION MODULE — lib/regression.js
// ════════════════════════════════════════════════════════════

describe('loadBaselineReport() — carga de reporte previo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga un JSON válido y devuelve el reporte parseado', async () => {
    const report = makeReport([
      makeIssue('Bug 1', 'Error en login', 'critical'),
    ]);
    readFile.mockResolvedValueOnce(JSON.stringify(report));

    const result = await loadBaselineReport('reports/vigia-data-prev.json');

    expect(result).toBeDefined();
    expect(result.version).toBe('0.6.0');
    expect(result.issues).toHaveLength(1);
  });

  it('lanza error si el archivo no es un reporte VIGÍA válido', async () => {
    readFile.mockResolvedValueOnce(JSON.stringify({ random: 'data' }));

    await expect(loadBaselineReport('bad-file.json'))
      .rejects.toThrow('no es un reporte VIGÍA válido');
  });

  it('lanza error si el JSON es inválido (SyntaxError)', async () => {
    readFile.mockResolvedValueOnce('{ malformed json !!!');

    await expect(loadBaselineReport('corrupt.json'))
      .rejects.toThrow();
  });

  it('lee el archivo con la ruta correcta', async () => {
    const report = makeReport([]);
    readFile.mockResolvedValueOnce(JSON.stringify(report));

    await loadBaselineReport('reports/mi-reporte.json');

    expect(readFile).toHaveBeenCalledWith('reports/mi-reporte.json', 'utf-8');
  });
});

describe('buildRegressionPlan() — extracción de issues y conteos', () => {
  it('extrae issues de sesiones y reporta el conteo correcto', () => {
    const report = makeReport([
      makeIssue('Bug A', 'Desc A'),
      makeIssue('Bug B', 'Desc B'),
    ]);

    const plan = buildRegressionPlan(report);

    expect(plan.totalIssues).toBe(2);
  });

  it('extrae issues de sesiones con múltiples URLs', () => {
    const report = {
      version: '0.6.0',
      sessions: [
        { url: 'https://s1.com', issues: [makeIssue('Issue 1', 'D1')] },
        { url: 'https://s2.com', issues: [makeIssue('Issue 2', 'D2')] },
      ],
    };

    const plan = buildRegressionPlan(report);

    expect(plan.totalIssues).toBe(2);
    expect(plan.urls).toHaveLength(2);
  });

  it('reporte sin issues → totalIssues=0 y urls vacíos', () => {
    const report = makeReport([]);

    const plan = buildRegressionPlan(report);

    expect(plan.totalIssues).toBe(0);
    expect(plan.urls).toEqual([]);
  });

  it('devuelve issuesByUrl como Map vacío si no hay issues', () => {
    const report = makeReport([]);

    const plan = buildRegressionPlan(report);

    expect(plan.issuesByUrl.size).toBe(0);
  });
});

describe('buildRegressionPlan() — URLs únicas con issues', () => {
  it('extrae URLs de sesiones que tienen issues', () => {
    const report = {
      version: '0.6.0',
      sessions: [
        { url: 'https://site1.com', issues: [makeIssue('Bug', 'Error')] },
        { url: 'https://site2.com', issues: [] },
        { url: 'https://site3.com', issues: [makeIssue('Otro', 'Desc')] },
      ],
    };

    const plan = buildRegressionPlan(report);

    expect(plan.urls).toHaveLength(2);
    expect(plan.urls).toContain('https://site1.com');
    expect(plan.urls).toContain('https://site3.com');
    expect(plan.urls).not.toContain('https://site2.com');
  });

  it('no duplica URLs si la misma URL tiene múltiples sesiones con issues', () => {
    const report = {
      version: '0.6.0',
      sessions: [
        { url: 'https://same.com', issues: [makeIssue('Bug 1', 'D1')] },
        { url: 'https://same.com', issues: [makeIssue('Bug 2', 'D2')] },
      ],
    };

    const plan = buildRegressionPlan(report);

    expect(plan.urls).toHaveLength(1);
    expect(plan.urls[0]).toBe('https://same.com');
  });

  it('reporte con una sola URL con issues → devuelve esa URL', () => {
    const report = makeReport([makeIssue('Bug', 'Error')]);

    const plan = buildRegressionPlan(report);

    expect(plan.urls).toHaveLength(1);
    expect(plan.urls[0]).toBe('https://app-de-prueba.com');
  });

  it('devuelve array vacío si no hay sesiones con issues', () => {
    const report = makeReport([]);

    const plan = buildRegressionPlan(report);

    expect(plan.urls).toEqual([]);
  });
});

describe('buildRegressionPlan() — plan de re-test', () => {
  it('genera un plan con URLs e issues por URL', () => {
    const report = makeReport([
      makeIssue('Login roto', 'No redirige', 'critical'),
      makeIssue('Enlace 404', 'Página no encontrada', 'minor'),
    ]);

    const plan = buildRegressionPlan(report);
    const url = plan.urls[0];
    const issuesForUrl = plan.issuesByUrl.get(url);

    expect(plan.urls).toHaveLength(1);
    expect(issuesForUrl).toHaveLength(2);
    expect(issuesForUrl[0].title).toBe('Login roto');
    expect(issuesForUrl[0].severity).toBe('critical');
  });

  it('los issues del plan incluyen fingerprint, título, descripción y severidad', () => {
    const report = makeReport([
      makeIssue('API timeout', 'Tarda 30s', 'major'),
    ]);

    const plan = buildRegressionPlan(report);
    const url = plan.urls[0];
    const target = plan.issuesByUrl.get(url)[0];

    expect(target).toHaveProperty('fingerprint');
    expect(target).toHaveProperty('title', 'API timeout');
    expect(target).toHaveProperty('description', 'Tarda 30s');
    expect(target).toHaveProperty('severity', 'major');
  });

  it('reporte sin issues → plan vacío (urls=[], totalIssues=0)', () => {
    const report = makeReport([]);

    const plan = buildRegressionPlan(report);

    expect(plan.urls).toEqual([]);
    expect(plan.totalIssues).toBe(0);
    expect(plan.issuesByUrl.size).toBe(0);
  });

  it('reporte con un solo issue → plan con un solo target', () => {
    const report = makeReport([
      makeIssue('Único bug', 'Solitario', 'minor'),
    ]);

    const plan = buildRegressionPlan(report);
    const url = plan.urls[0];
    const issues = plan.issuesByUrl.get(url);

    expect(issues).toHaveLength(1);
    expect(issues[0].title).toBe('Único bug');
    expect(plan.totalIssues).toBe(1);
  });
});

// ════════════════════════════════════════════════════════════
//  A2. CATEGORIZACIÓN — categorizeResults()
// ════════════════════════════════════════════════════════════

describe('categorizeRegressionResults() — clasificación de issues de regresión', () => {
  it('todos los issues resueltos → todos ✅', () => {
    const baselineReport = makeReport([
      makeIssue('Bug A', 'Error A', 'critical'),
      makeIssue('Bug B', 'Error B', 'major'),
    ]);
    const retestReport = makeReport([]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.resolved).toHaveLength(2);
    expect(result.persists).toHaveLength(0);
    expect(result.new).toHaveLength(0);
    expect(result.resolved[0].regressionStatus).toBe('resolved');
    expect(result.resolved[1].regressionStatus).toBe('resolved');
  });

  it('todos los issues persisten → todos ❌', () => {
    const baselineReport = makeReport([
      makeIssue('Bug A', 'Error A', 'critical'),
      makeIssue('Bug B', 'Error B', 'major'),
    ]);
    const retestReport = makeReport([
      makeIssue('Bug A', 'Error A', 'critical'),
      makeIssue('Bug B', 'Error B', 'major'),
    ]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.persists).toHaveLength(2);
    expect(result.resolved).toHaveLength(0);
    expect(result.new).toHaveLength(0);
    expect(result.persists[0].regressionStatus).toBe('persists');
  });

  it('mezcla de resueltos, persistentes y nuevos', () => {
    const baselineReport = makeReport([
      makeIssue('Se resuelve', 'Ya no falla', 'critical'),
      makeIssue('Sigue roto', 'Persiste', 'major'),
    ]);
    const retestReport = makeReport([
      makeIssue('Sigue roto', 'Persiste', 'major'),
      makeIssue('Nuevo defecto', 'Apareció hoy', 'minor'),
    ]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0].title).toBe('Se resuelve');
    expect(result.persists).toHaveLength(1);
    expect(result.persists[0].title).toBe('Sigue roto');
    expect(result.new).toHaveLength(1);
    expect(result.new[0].title).toBe('Nuevo defecto');
    expect(result.new[0].regressionStatus).toBe('new');
  });

  it('issues nuevos (🆕) no presentes en el reporte previo se detectan', () => {
    const baselineReport = makeReport([
      makeIssue('Bug previo', 'Error viejo', 'major'),
    ]);
    const retestReport = makeReport([
      makeIssue('Bug previo', 'Error viejo', 'major'),
      makeIssue('Bug desconocido', 'No existía antes', 'critical'),
      makeIssue('Otro nuevo', 'Tampoco existía', 'minor'),
    ]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.new).toHaveLength(2);
    expect(result.new.map((i) => i.title)).toContain('Bug desconocido');
    expect(result.new.map((i) => i.title)).toContain('Otro nuevo');
    expect(result.new.every((i) => i.regressionStatus === 'new')).toBe(true);
  });

  it('reporte previo vacío → no hay targets de regresión, todo es nuevo', () => {
    const baselineReport = makeReport([]);
    const retestReport = makeReport([
      makeIssue('Bug X', 'Error X', 'minor'),
    ]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.resolved).toHaveLength(0);
    expect(result.persists).toHaveLength(0);
    expect(result.new).toHaveLength(1);
  });

  it('ambos vacíos → todo vacío', () => {
    const result = categorizeRegressionResults(makeReport([]), makeReport([]));

    expect(result.resolved).toHaveLength(0);
    expect(result.persists).toHaveLength(0);
    expect(result.new).toHaveLength(0);
  });

  it('reporte previo con un solo issue resuelto', () => {
    const baselineReport = makeReport([makeIssue('Único', 'Se fue', 'critical')]);
    const retestReport = makeReport([]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0].title).toBe('Único');
  });

  it('reporte previo con un solo issue que persiste', () => {
    const baselineReport = makeReport([makeIssue('Único', 'Sigue', 'major')]);
    const retestReport = makeReport([makeIssue('Único', 'Sigue', 'major')]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.persists).toHaveLength(1);
    expect(result.persists[0].title).toBe('Único');
  });

  it('la categorización usa fingerprint, no título crudo', () => {
    const issueA = makeIssue('Bug', 'Error', 'critical');
    const issueB = makeIssue('Bug', 'Error', 'minor'); // mismo título, distinta severidad → distinto fingerprint

    const baselineReport = makeReport([issueA]);
    const retestReport = makeReport([issueB]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    // Fingerprints difieren porque la severidad es parte del hash
    expect(result.resolved).toHaveLength(1);
    expect(result.new).toHaveLength(1);
    expect(result.persists).toHaveLength(0);
  });

  it('preserva la severidad original en los issues categorizados', () => {
    const baselineReport = makeReport([makeIssue('Critical bug', 'Crash', 'critical')]);
    const retestReport = makeReport([
      makeIssue('Critical bug', 'Crash', 'critical'),
      makeIssue('New minor', 'UI glitch', 'minor'),
    ]);

    const result = categorizeRegressionResults(baselineReport, retestReport);

    expect(result.persists[0].severity).toBe('critical');
    expect(result.new[0].severity).toBe('minor');
  });
});

// ════════════════════════════════════════════════════════════
//  B. REGRESSION REPORT OUTPUT — formatRegressionOutput()
// ════════════════════════════════════════════════════════════

describe('formatRegressionOutput() — salida de regresión formateada', () => {
  it('contiene secciones de resueltos, persistentes y nuevos', () => {
    const result = categorizeRegressionResults(
      makeReport([makeIssue('Arreglado', 'Desc', 'major'), makeIssue('Sigue roto', 'Desc2', 'critical')]),
      makeReport([makeIssue('Sigue roto', 'Desc2', 'critical'), makeIssue('Nuevo', 'Desc3', 'minor')]),
    );

    const output = formatRegressionOutput(result);

    expect(output).toContain('✅ Issues Resueltos');
    expect(output).toContain('❌ Issues que Persisten');
    expect(output).toContain('🆕 Issues Nuevos');
  });

  it('los conteos del resumen son correctos', () => {
    const result = categorizeRegressionResults(
      makeReport([
        makeIssue('A', 'DA'),
        makeIssue('B', 'DB'),
        makeIssue('C', 'DC', 'critical'),
      ]),
      makeReport([
        makeIssue('C', 'DC', 'critical'),
        makeIssue('D', 'DD', 'minor'),
        makeIssue('E', 'DE', 'minor'),
        makeIssue('F', 'DF', 'minor'),
      ]),
    );

    const output = formatRegressionOutput(result);

    expect(output).toContain('✅ Resueltos:    2');
    expect(output).toContain('❌ Persisten:    1');
    expect(output).toContain('🆕 Nuevos:       3');
  });

  it('muestra la fecha del baseline y las URLs analizadas', () => {
    const result = categorizeRegressionResults(
      makeReport([], { generatedAt: '2026-07-15T10:00:00.000Z', url: 'https://app-de-prueba.com' }),
      makeReport([]),
    );

    const output = formatRegressionOutput(result);

    expect(output).toContain('2026-07-15T10:00:00.000Z');
    expect(output).toContain('Baseline');
  });

  it('el formato de salida es legible — contiene título y sección de resumen', () => {
    const result = categorizeRegressionResults(makeReport([]), makeReport([]));

    const output = formatRegressionOutput(result);

    expect(output).toContain('VIGÍA');
    expect(output).toContain('Regresión');
    expect(output).toContain('Resumen');
  });

  it('omite secciones vacías (no muestra "Issues Resueltos" si no hay ninguno)', () => {
    const result = categorizeRegressionResults(
      makeReport([makeIssue('Persiste', 'D', 'major')]),
      makeReport([makeIssue('Persiste', 'D', 'major')]),
    );

    const output = formatRegressionOutput(result);

    expect(output).not.toContain('✅ Issues Resueltos');
    expect(output).toContain('❌ Issues que Persisten');
    expect(output).not.toContain('🆕 Issues Nuevos');
  });

  it('muestra severidad con emoji correcto por issue', () => {
    const result = categorizeRegressionResults(
      makeReport([makeIssue('Bug crítico', 'Crash', 'critical'), makeIssue('Bug menor', 'UI', 'minor')]),
      makeReport([makeIssue('Bug crítico', 'Crash', 'critical'), makeIssue('Bug menor', 'UI', 'minor')]),
    );

    const output = formatRegressionOutput(result);

    expect(output).toContain('🔴');
    expect(output).toContain('🟡');
  });

  it('incluye el título de cada issue en el informe', () => {
    const result = categorizeRegressionResults(
      makeReport([makeIssue('Login roto', 'No redirige tras autenticar', 'critical')]),
      makeReport([]),
    );

    const output = formatRegressionOutput(result);

    expect(output).toContain('Login roto');
  });

  it('reporte sin issues en ninguna categoría — muestra conteos en cero', () => {
    const result = categorizeRegressionResults(makeReport([]), makeReport([]));

    const output = formatRegressionOutput(result);

    expect(output).toContain('✅ Resueltos:    0');
    expect(output).toContain('❌ Persisten:    0');
    expect(output).toContain('🆕 Nuevos:       0');
  });
});

// ════════════════════════════════════════════════════════════
//  C. CLI --regression — Flag de regresión
// ════════════════════════════════════════════════════════════

describe('CLI --regression — parsing de argumentos', () => {
  it('--regression con archivo JSON válido devuelve la ruta', () => {
    const result = parseArgs([
      '--regression', 'reports/vigia-data-2026-07-15.json',
    ]);

    expect(result.regressionFile).toBe('reports/vigia-data-2026-07-15.json');
    expect(result.regressionFile).not.toBeNull();
  });

  it('--regression sin archivo → regressionFile es null', () => {
    const result = parseArgs(['--regression']);

    expect(result.regressionFile).toBeNull();
  });

  it('--regression con siguiente argumento que es flag → regressionFile es null', () => {
    const result = parseArgs(['--regression', '--url']);

    expect(result.regressionFile).toBeNull();
  });

  it('sin --regression → regressionFile es null (flujo normal de testing)', () => {
    const result = parseArgs(['--url', 'https://app.com', '--visible']);

    expect(result.regressionFile).toBeNull();
  });

  it('--regression skips el flujo normal (como --compare)', () => {
    const args = ['--regression', 'previous-report.json'];
    const result = parseArgs(args);

    // En modo regression, no se necesita --url ni se inicia el flujo normal
    expect(result.regressionFile).not.toBeNull();
    expect(result.regressionFile).toBe('previous-report.json');
    expect(result.urls).toHaveLength(0);
  });

  it('--regression combinado con --quiet captura quiet=true', () => {
    const result = parseArgs([
      '--regression', 'prev.json', '--quiet',
    ]);

    expect(result.regressionFile).toBe('prev.json');
    expect(result.quiet).toBe(true);
  });

  it('--regression combinado con -q (alias) captura quiet=true', () => {
    const result = parseArgs([
      '--regression', 'prev.json', '-q',
    ]);

    expect(result.regressionFile).toBe('prev.json');
    expect(result.quiet).toBe(true);
  });

  it('--regression sin --quiet tiene quiet=false', () => {
    const result = parseArgs([
      '--regression', 'prev.json',
    ]);

    expect(result.quiet).toBe(false);
  });
});

describe('CLI --regression — validación de archivos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('archivo JSON válido se lee correctamente', async () => {
    const report = makeReport([makeIssue('Bug', 'Error', 'major')]);
    readFile.mockResolvedValueOnce(JSON.stringify(report));

    const data = await loadBaselineReport('reports/prev.json');

    expect(data.issues).toHaveLength(1);
  });

  it('archivo inexistente lanza error', async () => {
    readFile.mockRejectedValueOnce(
      Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' }),
    );

    await expect(loadBaselineReport('no-existe.json'))
      .rejects.toThrow();
  });

  it('archivo con JSON inválido lanza error', async () => {
    readFile.mockResolvedValueOnce('not valid json {{{');

    await expect(loadBaselineReport('bad.json'))
      .rejects.toThrow();
  });

  it('archivo válido pero no es reporte VIGÍA lanza error descriptivo', async () => {
    readFile.mockResolvedValueOnce(JSON.stringify({ name: 'package.json', dependencies: {} }));

    await expect(loadBaselineReport('package.json'))
      .rejects.toThrow('no es un reporte VIGÍA válido');
  });
});

// ════════════════════════════════════════════════════════════
//  C2. FLUJO COMPLETO — integración end-to-end del flujo de regresión
// ════════════════════════════════════════════════════════════

describe('Flujo completo de regresión — parse → load → categorize → report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flujo completo: carga reporte → categoriza con resultados actuales → genera informe', async () => {
    const previousReport = makeReport([
      makeIssue('Login crash', 'NPE en auth', 'critical'),
      makeIssue('CSS roto', 'Sidebar desbordada', 'minor'),
    ]);
    readFile.mockResolvedValueOnce(JSON.stringify(previousReport));

    // 1. Cargar reporte previo
    const loaded = await loadBaselineReport('reports/prev.json');
    expect(loaded.sessions[0].issues).toHaveLength(2);

    // 2. Simular re-ejecución: login se arregló, CSS persiste, nuevo bug
    const currentReport = makeReport([
      makeIssue('CSS roto', 'Sidebar desbordada', 'minor'), // persiste
      makeIssue('Formulario sin validar', 'Email sin @', 'major'), // nuevo
    ]);

    // 3. Categorizar
    const result = categorizeRegressionResults(loaded, currentReport);
    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0].title).toBe('Login crash');
    expect(result.persists).toHaveLength(1);
    expect(result.persists[0].title).toBe('CSS roto');
    expect(result.new).toHaveLength(1);
    expect(result.new[0].title).toBe('Formulario sin validar');

    // 4. Generar salida formateada
    const output = formatRegressionOutput(result);
    expect(output).toContain('✅ Issues Resueltos');
    expect(output).toContain('Login crash');
    expect(output).toContain('❌ Issues que Persisten');
    expect(output).toContain('CSS roto');
    expect(output).toContain('🆕 Issues Nuevos');
    expect(output).toContain('Formulario sin validar');
  });

  it('flujo con reporte previo vacío → todo normal, sin targets de regresión', async () => {
    const previousReport = makeReport([]);
    readFile.mockResolvedValueOnce(JSON.stringify(previousReport));

    const loaded = await loadBaselineReport('reports/empty.json');
    const plan = buildRegressionPlan(loaded);

    expect(plan.urls).toEqual([]);
    expect(plan.totalIssues).toBe(0);
  });

  it('flujo con todos los issues resueltos → salida solo con ✅', async () => {
    const previousReport = makeReport([
      makeIssue('Bug 1', 'Error 1', 'critical'),
      makeIssue('Bug 2', 'Error 2', 'major'),
    ]);
    readFile.mockResolvedValueOnce(JSON.stringify(previousReport));

    const loaded = await loadBaselineReport('reports/prev.json');
    const currentReport = makeReport([]); // todo resuelto

    const result = categorizeRegressionResults(loaded, currentReport);
    const output = formatRegressionOutput(result);

    expect(result.resolved).toHaveLength(2);
    expect(output).toContain('✅ Issues Resueltos');
    expect(output).not.toContain('❌ Issues que Persisten');
    expect(output).not.toContain('🆕 Issues Nuevos');
  });
});
