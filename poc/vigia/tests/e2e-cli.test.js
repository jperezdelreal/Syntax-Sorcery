/**
 * ============================================================
 *  E2E Smoke Test — Layer 2: Full CLI (requires SDK auth)
 * ============================================================
 *
 *  Runs `node vigia.js` as a child process against example.com.
 *  Verifies exit behavior, report generation, and output format.
 *
 *  SKIPPED if GITHUB_TOKEN / COPILOT_SDK_TOKEN is not set.
 * ============================================================
 */
import { describe, it, expect, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const VIGIA_ROOT = join(__dirname, '..');
const VIGIA_JS = join(VIGIA_ROOT, 'vigia.js');
const REPORTS_DIR = join(VIGIA_ROOT, 'reports');

const hasAuth = !!(process.env.GITHUB_TOKEN || process.env.COPILOT_SDK_TOKEN);

// Track report files created during this test run for cleanup
let reportFilesBefore = [];

async function listReports() {
  try {
    return await readdir(REPORTS_DIR);
  } catch {
    return [];
  }
}

describe.skipIf(!hasAuth)('E2E CLI — vigia.js contra example.com (requiere SDK auth)', { timeout: 180000 }, () => {

  afterAll(async () => {
    const reportsAfter = await listReports();
    const newFiles = reportsAfter.filter((f) => !reportFilesBefore.includes(f));
    for (const file of newFiles) {
      await rm(join(REPORTS_DIR, file), { force: true }).catch(() => {});
    }
  });

  it('ejecuta vigia.js --url example.com --turns 1 --quiet sin crash', { timeout: 150000 }, async () => {
    reportFilesBefore = await listReports();

    let exitCode;
    let stdout = '';
    let stderr = '';

    try {
      const result = await execFileAsync(
        process.execPath,
        [VIGIA_JS, '--url', 'https://example.com', '--turns', '1', '--quiet'],
        {
          cwd: VIGIA_ROOT,
          timeout: 120000,
          env: { ...process.env },
        }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
      exitCode = 0;
    } catch (err) {
      stdout = err.stdout || '';
      stderr = err.stderr || '';
      exitCode = err.code ?? err.status ?? 1;
    }

    // Exit 0 or 1 are both valid — 0 = no critical issues, 1 = critical found
    expect([0, 1]).toContain(exitCode);
  });

  it('genera al menos un archivo de reporte', async () => {
    const reportsAfter = await listReports();
    const newFiles = reportsAfter.filter((f) => !reportFilesBefore.includes(f));
    expect(newFiles.length).toBeGreaterThan(0);
  });

  it('el reporte generado es markdown o JSON válido', async () => {
    const reportsAfter = await listReports();
    const newFiles = reportsAfter.filter((f) => !reportFilesBefore.includes(f));

    for (const file of newFiles) {
      const content = await readFile(join(REPORTS_DIR, file), 'utf-8');
      expect(content.length).toBeGreaterThan(0);

      if (file.endsWith('.json')) {
        const parsed = JSON.parse(content);
        expect(parsed).toBeDefined();
        expect(typeof parsed).toBe('object');
      } else if (file.endsWith('.md')) {
        expect(content).toMatch(/^#/m);
      }
    }
  });
});
