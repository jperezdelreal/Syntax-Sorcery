/**
 * Tests for scripts/security-audit.js
 *
 * Uses vitest globals mode (vi, describe, it, expect, beforeEach, afterEach are global).
 * All external calls (exec, fs) are DI-mocked — no real npm audit or file I/O.
 */

const path = require('path');

const {
  parseArgs,
  SECRET_PATTERNS,
  SCAN_IGNORE,
  SCAN_EXTENSIONS,
  shouldScanFile,
  scanFileForSecrets,
  walkDirectory,
  scanForSecrets,
  runNpmAudit,
  runNpmAuditFix,
  classifyVulnerabilities,
  hasHighOrCritical,
  generateSBOM,
  formatHumanReport,
  run,
} = require('../security-audit');

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses no flags', () => {
    const result = parseArgs(['node', 'security-audit.js']);
    expect(result).toEqual({ fix: false, sbomOnly: false, json: false, save: false });
  });

  it('parses --fix flag', () => {
    const result = parseArgs(['node', 'security-audit.js', '--fix']);
    expect(result.fix).toBe(true);
  });

  it('parses --sbom-only flag', () => {
    const result = parseArgs(['node', 'security-audit.js', '--sbom-only']);
    expect(result.sbomOnly).toBe(true);
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'security-audit.js', '--json']);
    expect(result.json).toBe(true);
  });

  it('parses --save flag', () => {
    const result = parseArgs(['node', 'security-audit.js', '--save']);
    expect(result.save).toBe(true);
  });

  it('parses multiple flags', () => {
    const result = parseArgs(['node', 'security-audit.js', '--json', '--save', '--fix']);
    expect(result).toEqual({ fix: true, sbomOnly: false, json: true, save: true });
  });
});

// ---------------------------------------------------------------------------
// shouldScanFile
// ---------------------------------------------------------------------------

describe('shouldScanFile', () => {
  it('returns true for .js files outside ignored dirs', () => {
    expect(shouldScanFile('src/index.js', SCAN_IGNORE)).toBe(true);
  });

  it('returns false for node_modules paths', () => {
    expect(shouldScanFile(`node_modules${path.sep}foo${path.sep}index.js`, SCAN_IGNORE)).toBe(false);
  });

  it('returns false for .git paths', () => {
    expect(shouldScanFile(`.git${path.sep}config`, SCAN_IGNORE)).toBe(false);
  });

  it('returns false for unsupported extensions', () => {
    expect(shouldScanFile('image.png', SCAN_IGNORE)).toBe(false);
  });

  it('returns true for .env files', () => {
    expect(shouldScanFile('config/.env', SCAN_IGNORE)).toBe(true);
  });

  it('returns true for .yml files', () => {
    expect(shouldScanFile('.github/workflows/ci.yml', SCAN_IGNORE)).toBe(true);
  });

  it('returns false for package-lock.json', () => {
    expect(shouldScanFile('package-lock.json', SCAN_IGNORE)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scanFileForSecrets
// ---------------------------------------------------------------------------

describe('scanFileForSecrets', () => {
  it('detects GitHub tokens', () => {
    const content = 'const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn";';
    const findings = scanFileForSecrets('config.js', content);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].pattern).toBe('GitHub Token');
    expect(findings[0].line).toBe(1);
    expect(findings[0].match).toContain('***REDACTED***');
  });

  it('detects AWS access keys', () => {
    const content = 'AWS_KEY=AKIAIOSFODNN7EXAMPLE';
    const findings = scanFileForSecrets('env.js', content);
    const awsFindings = findings.filter(f => f.pattern === 'AWS Access Key');
    expect(awsFindings.length).toBe(1);
  });

  it('detects generic API keys', () => {
    const content = 'api_key = "abcdef1234567890abcdef"';
    const findings = scanFileForSecrets('.env', content);
    const apiFindings = findings.filter(f => f.pattern === 'Generic API Key');
    expect(apiFindings.length).toBe(1);
  });

  it('detects generic tokens', () => {
    const content = 'token = "supersecrettoken12345678"';
    const findings = scanFileForSecrets('.env', content);
    const tokenFindings = findings.filter(f => f.pattern === 'Generic Token');
    expect(tokenFindings.length).toBe(1);
  });

  it('returns empty array for clean files', () => {
    const content = 'const x = 42;\nfunction hello() { return "world"; }';
    const findings = scanFileForSecrets('clean.js', content);
    expect(findings).toEqual([]);
  });

  it('redacts matched values', () => {
    const content = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn';
    const findings = scanFileForSecrets('test.js', content);
    expect(findings[0].match).not.toContain('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn');
  });

  it('reports correct line numbers', () => {
    const content = 'line1\nline2\nghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn\nline4';
    const findings = scanFileForSecrets('test.js', content);
    expect(findings[0].line).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// walkDirectory (DI-mocked fs)
// ---------------------------------------------------------------------------

describe('walkDirectory', () => {
  it('collects files recursively', () => {
    const mockReadDir = vi.fn((dir) => {
      if (dir === '/root') return ['src', 'readme.md'];
      if (dir === `${path.sep}root${path.sep}src` || dir === '/root/src') return ['index.js'];
      return [];
    });
    const mockStat = vi.fn((f) => ({
      isDirectory: () => f.endsWith('src'),
      isFile: () => !f.endsWith('src'),
    }));

    const files = walkDirectory('/root', mockReadDir, mockStat);
    expect(files.length).toBe(2);
  });

  it('skips node_modules directories', () => {
    const mockReadDir = vi.fn((dir) => {
      if (dir === '/root') return ['node_modules', 'src'];
      if (dir === `${path.sep}root${path.sep}src` || dir === '/root/src') return ['app.js'];
      return [];
    });
    const mockStat = vi.fn((f) => ({
      isDirectory: () => f.includes('src'),
      isFile: () => !f.includes('src'),
    }));

    const files = walkDirectory('/root', mockReadDir, mockStat);
    // Should only contain src/app.js, not node_modules content
    const hasNodeModules = files.some(f => f.includes('node_modules'));
    expect(hasNodeModules).toBe(false);
  });

  it('handles readDir errors gracefully', () => {
    const mockReadDir = vi.fn(() => { throw new Error('EACCES'); });
    const files = walkDirectory('/nope', mockReadDir);
    expect(files).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// runNpmAudit (DI-mocked exec)
// ---------------------------------------------------------------------------

describe('runNpmAudit', () => {
  it('parses clean audit result', () => {
    const mockExec = vi.fn(() => JSON.stringify({
      metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 } },
    }));
    const result = runNpmAudit(mockExec);
    expect(result.metadata.vulnerabilities.total).toBe(0);
  });

  it('handles audit with vulnerabilities (non-zero exit)', () => {
    const err = new Error('audit failed');
    err.stdout = JSON.stringify({
      metadata: { vulnerabilities: { critical: 1, high: 2, moderate: 3, low: 1, total: 7 } },
    });
    const mockExec = vi.fn(() => { throw err; });
    const result = runNpmAudit(mockExec);
    expect(result.metadata.vulnerabilities.critical).toBe(1);
    expect(result.metadata.vulnerabilities.high).toBe(2);
  });

  it('returns error on total failure', () => {
    const mockExec = vi.fn(() => { throw new Error('command not found'); });
    const result = runNpmAudit(mockExec);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// runNpmAuditFix (DI-mocked exec)
// ---------------------------------------------------------------------------

describe('runNpmAuditFix', () => {
  it('returns success on successful fix', () => {
    const mockExec = vi.fn(() => 'fixed 0 vulnerabilities');
    const result = runNpmAuditFix(mockExec);
    expect(result.success).toBe(true);
  });

  it('returns failure on fix error', () => {
    const mockExec = vi.fn(() => { throw new Error('fix failed'); });
    const result = runNpmAuditFix(mockExec);
    expect(result.success).toBe(false);
    expect(result.error).toContain('fix failed');
  });
});

// ---------------------------------------------------------------------------
// classifyVulnerabilities
// ---------------------------------------------------------------------------

describe('classifyVulnerabilities', () => {
  it('extracts vulnerability counts from metadata', () => {
    const audit = {
      metadata: { vulnerabilities: { critical: 2, high: 1, moderate: 3, low: 5, info: 0, total: 11 } },
    };
    const vulns = classifyVulnerabilities(audit);
    expect(vulns.critical).toBe(2);
    expect(vulns.high).toBe(1);
    expect(vulns.moderate).toBe(3);
    expect(vulns.total).toBe(11);
  });

  it('returns zeros for empty metadata', () => {
    const vulns = classifyVulnerabilities({});
    expect(vulns.critical).toBe(0);
    expect(vulns.high).toBe(0);
    expect(vulns.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// hasHighOrCritical
// ---------------------------------------------------------------------------

describe('hasHighOrCritical', () => {
  it('returns true when critical > 0', () => {
    expect(hasHighOrCritical({ critical: 1, high: 0 })).toBe(true);
  });

  it('returns true when high > 0', () => {
    expect(hasHighOrCritical({ critical: 0, high: 3 })).toBe(true);
  });

  it('returns false when both are 0', () => {
    expect(hasHighOrCritical({ critical: 0, high: 0 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateSBOM (DI-mocked readFile)
// ---------------------------------------------------------------------------

describe('generateSBOM', () => {
  it('generates valid CycloneDX SBOM', () => {
    const mockReadFile = vi.fn((filePath) => {
      if (filePath.includes('package.json') && !filePath.includes('lock')) {
        return JSON.stringify({
          name: 'test-project',
          version: '1.0.0',
          dependencies: { lodash: '^4.17.21' },
          devDependencies: { vitest: '^1.0.0' },
        });
      }
      if (filePath.includes('package-lock.json')) {
        return JSON.stringify({
          packages: {
            'node_modules/lodash': { version: '4.17.21' },
            'node_modules/vitest': { version: '1.6.0' },
          },
        });
      }
      throw new Error('not found');
    });

    const sbom = generateSBOM(mockReadFile);
    expect(sbom.bomFormat).toBe('CycloneDX');
    expect(sbom.specVersion).toBe('1.5');
    expect(sbom.components.length).toBe(2);
    expect(sbom.metadata.component.name).toBe('test-project');

    const lodashComp = sbom.components.find(c => c.name === 'lodash');
    expect(lodashComp.version).toBe('4.17.21');
    expect(lodashComp.scope).toBe('required');
    expect(lodashComp.purl).toBe('pkg:npm/lodash@4.17.21');

    const vitestComp = sbom.components.find(c => c.name === 'vitest');
    expect(vitestComp.scope).toBe('optional');
  });

  it('handles missing package.json', () => {
    const mockReadFile = vi.fn(() => { throw new Error('ENOENT'); });
    const sbom = generateSBOM(mockReadFile);
    expect(sbom.error).toBeDefined();
  });

  it('handles missing lock file gracefully', () => {
    const mockReadFile = vi.fn((filePath) => {
      if (filePath.includes('package.json') && !filePath.includes('lock')) {
        return JSON.stringify({
          name: 'test',
          version: '1.0.0',
          dependencies: { express: '^4.18.0' },
        });
      }
      throw new Error('no lock file');
    });

    const sbom = generateSBOM(mockReadFile);
    expect(sbom.bomFormat).toBe('CycloneDX');
    expect(sbom.components.length).toBe(1);
    // Without lock file, strips version prefix
    expect(sbom.components[0].version).toBe('4.18.0');
  });
});

// ---------------------------------------------------------------------------
// formatHumanReport
// ---------------------------------------------------------------------------

describe('formatHumanReport', () => {
  it('includes all sections', () => {
    const vulns = { critical: 0, high: 0, moderate: 1, low: 2, total: 3 };
    const secrets = [];
    const sbom = { bomFormat: 'CycloneDX', specVersion: '1.5', components: [], metadata: { timestamp: '2026-01-01' } };
    const report = formatHumanReport({}, vulns, secrets, sbom);

    expect(report).toContain('Security Audit Report');
    expect(report).toContain('Dependency Audit');
    expect(report).toContain('Secret Scanning');
    expect(report).toContain('SBOM');
    expect(report).toContain('No high/critical');
    expect(report).toContain('No secrets detected');
  });

  it('shows warning for high/critical vulns', () => {
    const vulns = { critical: 1, high: 0, moderate: 0, low: 0, total: 1 };
    const report = formatHumanReport({}, vulns, [], { error: 'skip' });
    expect(report).toContain('HIGH/CRITICAL');
  });

  it('shows secret findings', () => {
    const secrets = [{ pattern: 'GitHub Token', file: 'config.js', line: 5, match: 'ghp_ABCD***REDACTED***' }];
    const vulns = { critical: 0, high: 0, moderate: 0, low: 0, total: 0 };
    const report = formatHumanReport({}, vulns, secrets, { error: 'skip' });
    expect(report).toContain('1 potential secret');
    expect(report).toContain('GitHub Token');
  });
});

// ---------------------------------------------------------------------------
// run — full integration (all deps mocked)
// ---------------------------------------------------------------------------

describe('run', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function makeDeps(overrides = {}) {
    return {
      exec: overrides.exec || vi.fn(() => JSON.stringify({
        metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 } },
      })),
      readFile: overrides.readFile || vi.fn((filePath) => {
        if (filePath.includes('package.json') && !filePath.includes('lock')) {
          return JSON.stringify({ name: 'test', version: '1.0.0', dependencies: { foo: '^1.0.0' } });
        }
        if (filePath.includes('package-lock.json')) {
          return JSON.stringify({ packages: { 'node_modules/foo': { version: '1.0.0' } } });
        }
        return '';
      }),
      readDir: overrides.readDir || vi.fn(() => []),
      stat: overrides.stat || vi.fn(() => ({ isDirectory: () => false, isFile: () => true })),
      writeFile: overrides.writeFile || vi.fn(),
      rootDir: overrides.rootDir || '/test-root',
    };
  }

  it('returns exitCode 0 when no issues found', () => {
    const deps = makeDeps();
    const result = run(['node', 'security-audit.js'], deps);
    expect(result.exitCode).toBe(0);
  });

  it('returns exitCode 1 when high vulns found', () => {
    const deps = makeDeps({
      exec: vi.fn(() => JSON.stringify({
        metadata: { vulnerabilities: { critical: 0, high: 2, moderate: 0, low: 0, info: 0, total: 2 } },
      })),
    });
    const result = run(['node', 'security-audit.js'], deps);
    expect(result.exitCode).toBe(1);
  });

  it('returns exitCode 1 when secrets detected', () => {
    const deps = makeDeps({
      readDir: vi.fn((dir) => {
        if (dir === '/test-root') return ['config.js'];
        return [];
      }),
      stat: vi.fn(() => ({ isDirectory: () => false, isFile: () => true })),
      readFile: vi.fn((filePath) => {
        if (filePath.includes('config.js')) {
          return 'const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn";';
        }
        if (filePath.includes('package.json') && !filePath.includes('lock')) {
          return JSON.stringify({ name: 'test', version: '1.0.0', dependencies: {} });
        }
        if (filePath.includes('package-lock.json')) {
          return JSON.stringify({ packages: {} });
        }
        return '';
      }),
    });
    const result = run(['node', 'security-audit.js'], deps);
    expect(result.exitCode).toBe(1);
    expect(result.secrets.length).toBeGreaterThan(0);
  });

  it('outputs JSON when --json flag set', () => {
    const deps = makeDeps();
    run(['node', 'security-audit.js', '--json'], deps);
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.passed).toBe(true);
    expect(parsed.audit).toBeDefined();
    expect(parsed.sbom).toBeDefined();
  });

  it('outputs human-readable by default', () => {
    const deps = makeDeps();
    run(['node', 'security-audit.js'], deps);
    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('Security Audit Report');
  });

  it('handles --sbom-only mode', () => {
    const deps = makeDeps();
    const result = run(['node', 'security-audit.js', '--sbom-only'], deps);
    expect(result.exitCode).toBe(0);
    expect(result.sbom).toBeDefined();
    expect(result.sbom.bomFormat).toBe('CycloneDX');
  });

  it('handles --sbom-only with --json', () => {
    const deps = makeDeps();
    run(['node', 'security-audit.js', '--sbom-only', '--json'], deps);
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.bomFormat).toBe('CycloneDX');
  });

  it('saves SBOM when --save flag set', () => {
    const writeFn = vi.fn();
    const deps = makeDeps({ writeFile: writeFn });
    run(['node', 'security-audit.js', '--sbom-only', '--save'], deps);
    expect(writeFn).toHaveBeenCalled();
    const savedPath = writeFn.mock.calls[0][0];
    expect(savedPath).toContain('sbom.json');
  });

  it('calls npm audit fix when --fix flag set', () => {
    const execFn = vi.fn((cmd) => {
      if (cmd.includes('audit fix')) return 'fixed';
      return JSON.stringify({
        metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 } },
      });
    });
    const deps = makeDeps({ exec: execFn });
    run(['node', 'security-audit.js', '--fix'], deps);
    const fixCalls = execFn.mock.calls.filter(c => c[0].includes('audit fix'));
    expect(fixCalls.length).toBe(1);
  });

  it('handles save errors in full audit mode', () => {
    const deps = makeDeps({
      writeFile: vi.fn(() => { throw new Error('EACCES'); }),
    });
    const result = run(['node', 'security-audit.js', '--save'], deps);
    // Should still complete, just log error
    expect(result.exitCode).toBe(0);
    const errorOutput = errorSpy.mock.calls.map(c => c[0]).join('\n');
    expect(errorOutput).toContain('Failed to save SBOM');
  });

  it('handles save errors in sbom-only mode', () => {
    const deps = makeDeps({
      writeFile: vi.fn(() => { throw new Error('EACCES'); }),
    });
    const result = run(['node', 'security-audit.js', '--sbom-only', '--save'], deps);
    expect(result.exitCode).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// SECRET_PATTERNS constant
// ---------------------------------------------------------------------------

describe('SECRET_PATTERNS', () => {
  it('contains at least 4 patterns', () => {
    expect(SECRET_PATTERNS.length).toBeGreaterThanOrEqual(4);
  });

  it('all patterns have name and regex', () => {
    for (const p of SECRET_PATTERNS) {
      expect(p.name).toBeDefined();
      expect(p.pattern).toBeInstanceOf(RegExp);
    }
  });
});

// ---------------------------------------------------------------------------
// SCAN_IGNORE and SCAN_EXTENSIONS constants
// ---------------------------------------------------------------------------

describe('SCAN_IGNORE', () => {
  it('includes node_modules and .git', () => {
    expect(SCAN_IGNORE).toContain('node_modules');
    expect(SCAN_IGNORE).toContain('.git');
  });
});

describe('SCAN_EXTENSIONS', () => {
  it('includes common source file extensions', () => {
    expect(SCAN_EXTENSIONS).toContain('.js');
    expect(SCAN_EXTENSIONS).toContain('.ts');
    expect(SCAN_EXTENSIONS).toContain('.env');
  });
});
