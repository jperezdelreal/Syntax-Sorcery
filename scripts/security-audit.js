#!/usr/bin/env node
'use strict';

/**
 * Security Audit Script — dependency audit, secret scanning, SBOM generation.
 *
 * Usage:
 *   node scripts/security-audit.js
 *   node scripts/security-audit.js --fix
 *   node scripts/security-audit.js --sbom-only
 *   node scripts/security-audit.js --json
 *   node scripts/security-audit.js --json --save
 *
 * Flags:
 *   --fix        Auto-fix vulnerabilities via npm audit fix
 *   --sbom-only  Only generate SBOM, skip audit and secret scan
 *   --json       Machine-readable JSON output
 *   --save       Save SBOM to docs/sbom/sbom.json
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — high/critical vulnerabilities found or secrets detected
 *   2 — execution error
 *
 * No new dependencies — uses only Node.js built-ins and npm CLI.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    fix: args.includes('--fix'),
    sbomOnly: args.includes('--sbom-only'),
    json: args.includes('--json'),
    save: args.includes('--save'),
  };
}

// ---------------------------------------------------------------------------
// Secret scanning patterns
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /(?<![A-Z0-9])(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/g },
  { name: 'AWS Secret Key', pattern: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g, requiresContext: true },
  { name: 'GitHub Token', pattern: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}/g },
  { name: 'Azure Storage Key', pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{88}/g },
  { name: 'Generic API Key', pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
  { name: 'Generic Token', pattern: /(?:token|secret|password|passwd|pwd)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
];

// Directories/files to skip during secret scanning
const SCAN_IGNORE = [
  'node_modules', '.git', 'package-lock.json', '.squad',
  'dist', 'build', '.next', 'coverage',
];

const SCAN_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml',
  '.env', '.sh', '.ps1', '.md', '.html', '.css',
];

// ---------------------------------------------------------------------------
// Dependency audit (injectable exec)
// ---------------------------------------------------------------------------

function runNpmAudit(execFn) {
  const exec = execFn || ((cmd, opts) => execSync(cmd, opts));
  try {
    const raw = exec('npm audit --json 2>&1', {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities found; stdout still has JSON
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        // fall through
      }
    }
    // If execFn threw with parseable output on the error itself
    if (err.message) {
      try {
        return JSON.parse(err.message);
      } catch {
        // fall through
      }
    }
    return { error: err.message || 'npm audit failed' };
  }
}

function runNpmAuditFix(execFn) {
  const exec = execFn || ((cmd, opts) => execSync(cmd, opts));
  try {
    const raw = exec('npm audit fix --json 2>&1', {
      encoding: 'utf8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: raw };
  } catch (err) {
    return { success: false, error: err.message || 'npm audit fix failed' };
  }
}

function classifyVulnerabilities(auditResult) {
  const metadata = auditResult.metadata || auditResult.audit?.metadata || {};
  const vulnerabilities = metadata.vulnerabilities || {};
  return {
    critical: vulnerabilities.critical || 0,
    high: vulnerabilities.high || 0,
    moderate: vulnerabilities.moderate || 0,
    low: vulnerabilities.low || 0,
    info: vulnerabilities.info || 0,
    total: vulnerabilities.total || 0,
  };
}

function hasHighOrCritical(vulns) {
  return (vulns.critical || 0) > 0 || (vulns.high || 0) > 0;
}

// ---------------------------------------------------------------------------
// Secret scanning (injectable filesystem)
// ---------------------------------------------------------------------------

function shouldScanFile(filePath, ignoreList) {
  const ignore = ignoreList || SCAN_IGNORE;
  const segments = filePath.split(path.sep);
  // Also split on forward slash for cross-platform paths
  const allSegments = filePath.split(/[\\/]/);
  for (const seg of allSegments) {
    if (ignore.includes(seg)) return false;
  }
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  // Handle dotfiles like .env (path.extname returns '' for these)
  const effectiveExt = ext || (basename.startsWith('.') ? basename.toLowerCase() : '');
  return SCAN_EXTENSIONS.includes(effectiveExt);
}

function scanFileForSecrets(filePath, content) {
  const findings = [];
  const lines = content.split('\n');

  for (const { name, pattern, requiresContext } of SECRET_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        // Skip AWS Secret Key pattern unless line has contextual keywords
        if (requiresContext) {
          const lower = line.toLowerCase();
          const hasContext = lower.includes('secret') || lower.includes('aws') ||
            lower.includes('key') || lower.includes('credential');
          if (!hasContext) continue;
        }
        findings.push({
          pattern: name,
          file: filePath,
          line: lineNum + 1,
          match: match[0].substring(0, 8) + '***REDACTED***',
        });
      }
    }
  }

  return findings;
}

function walkDirectory(dir, readDirFn, statFn) {
  const readDir = readDirFn || ((d) => fs.readdirSync(d));
  const stat = statFn || ((f) => fs.statSync(f));
  const results = [];

  let entries;
  try {
    entries = readDir(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SCAN_IGNORE.includes(entry)) continue;
    const fullPath = path.join(dir, entry);
    try {
      const s = stat(fullPath);
      if (s.isDirectory()) {
        results.push(...walkDirectory(fullPath, readDirFn, statFn));
      } else if (s.isFile()) {
        results.push(fullPath);
      }
    } catch {
      // Skip inaccessible files
    }
  }

  return results;
}

function scanForSecrets(rootDir, deps) {
  const readDir = deps?.readDir;
  const stat = deps?.stat;
  const readFile = deps?.readFile || ((f) => fs.readFileSync(f, 'utf8'));

  const files = walkDirectory(rootDir, readDir, stat);
  const allFindings = [];

  for (const file of files) {
    if (!shouldScanFile(file, SCAN_IGNORE)) continue;
    try {
      const content = readFile(file);
      const findings = scanFileForSecrets(file, content);
      allFindings.push(...findings);
    } catch {
      // Skip unreadable files
    }
  }

  return allFindings;
}

// ---------------------------------------------------------------------------
// SBOM generation (CycloneDX from package.json)
// ---------------------------------------------------------------------------

function generateSBOM(readFileFn) {
  const readFile = readFileFn || ((f) => fs.readFileSync(f, 'utf8'));
  const pkgPath = path.resolve('package.json');
  const lockPath = path.resolve('package-lock.json');

  let pkg;
  try {
    pkg = JSON.parse(readFile(pkgPath));
  } catch (err) {
    return { error: `Cannot read package.json: ${err.message}` };
  }

  let lockfile = null;
  try {
    lockfile = JSON.parse(readFile(lockPath));
  } catch {
    // Lock file is optional for SBOM
  }

  const components = [];

  // Add dependencies from package.json
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  for (const [name, version] of Object.entries(allDeps)) {
    const resolvedVersion = lockfile?.packages?.[`node_modules/${name}`]?.version
      || version.replace(/^[\^~>=<]/, '');

    components.push({
      type: 'library',
      name,
      version: resolvedVersion,
      purl: `pkg:npm/${name}@${resolvedVersion}`,
      scope: pkg.devDependencies?.[name] ? 'optional' : 'required',
    });
  }

  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: 'application',
        name: pkg.name || 'unknown',
        version: pkg.version || '0.0.0',
      },
    },
    components,
  };
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatHumanReport(auditResult, vulns, secrets, sbom) {
  const lines = [];
  lines.push('');
  lines.push('╔══════════════════════════════════════════════════╗');
  lines.push('║            Security Audit Report                 ║');
  lines.push('╚══════════════════════════════════════════════════╝');
  lines.push('');

  // Dependency audit
  lines.push('=== Dependency Audit ===');
  if (auditResult.error) {
    lines.push(`  Error: ${auditResult.error}`);
  } else {
    lines.push(`  Critical: ${vulns.critical}`);
    lines.push(`  High:     ${vulns.high}`);
    lines.push(`  Moderate: ${vulns.moderate}`);
    lines.push(`  Low:      ${vulns.low}`);
    lines.push(`  Total:    ${vulns.total}`);
    if (hasHighOrCritical(vulns)) {
      lines.push('  ⚠️  HIGH/CRITICAL vulnerabilities found!');
    } else {
      lines.push('  ✅ No high/critical vulnerabilities.');
    }
  }
  lines.push('');

  // Secret scanning
  lines.push('=== Secret Scanning ===');
  if (secrets.length === 0) {
    lines.push('  ✅ No secrets detected.');
  } else {
    lines.push(`  ⚠️  ${secrets.length} potential secret(s) found:`);
    for (const s of secrets) {
      lines.push(`    - ${s.pattern} in ${s.file}:${s.line} (${s.match})`);
    }
  }
  lines.push('');

  // SBOM
  lines.push('=== SBOM ===');
  if (sbom.error) {
    lines.push(`  Error: ${sbom.error}`);
  } else {
    lines.push(`  Format:     ${sbom.bomFormat} ${sbom.specVersion}`);
    lines.push(`  Components: ${sbom.components.length}`);
    lines.push(`  Generated:  ${sbom.metadata.timestamp}`);
  }
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run(argv, deps) {
  const execFn = deps?.exec;
  const readFileFn = deps?.readFile;
  const writeFileFn = deps?.writeFile || ((p, c) => {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, c, 'utf8');
  });
  const rootDir = deps?.rootDir || process.cwd();

  const parsed = parseArgs(argv || process.argv);
  let exitCode = 0;

  // SBOM-only mode
  if (parsed.sbomOnly) {
    const sbom = generateSBOM(readFileFn);
    if (parsed.json) {
      console.log(JSON.stringify(sbom, null, 2));
    } else {
      console.log('=== SBOM ===');
      if (sbom.error) {
        console.log(`  Error: ${sbom.error}`);
      } else {
        console.log(`  Format:     ${sbom.bomFormat} ${sbom.specVersion}`);
        console.log(`  Components: ${sbom.components.length}`);
        console.log(`  Generated:  ${sbom.metadata.timestamp}`);
      }
    }
    if (parsed.save) {
      const sbomPath = path.join('docs', 'sbom', 'sbom.json');
      try {
        writeFileFn(sbomPath, JSON.stringify(sbom, null, 2));
        console.log(`SBOM saved to: ${sbomPath}`);
      } catch (err) {
        console.error(`Failed to save SBOM: ${err.message}`);
        return { exitCode: 2 };
      }
    }
    return { exitCode: 0, sbom };
  }

  // Full audit
  // 1. npm audit
  const auditResult = runNpmAudit(execFn);
  const vulns = classifyVulnerabilities(auditResult);

  // 2. Auto-fix if requested
  if (parsed.fix) {
    const fixResult = runNpmAuditFix(execFn);
    if (!fixResult.success) {
      console.error(`npm audit fix failed: ${fixResult.error}`);
    }
  }

  // 3. Secret scanning
  const secrets = scanForSecrets(rootDir, {
    readDir: deps?.readDir,
    stat: deps?.stat,
    readFile: readFileFn,
  });

  // 4. SBOM
  const sbom = generateSBOM(readFileFn);

  // Determine exit code
  if (hasHighOrCritical(vulns)) exitCode = 1;
  if (secrets.length > 0) exitCode = 1;

  const result = {
    audit: { vulnerabilities: vulns, raw: auditResult },
    secrets,
    sbom,
    exitCode,
  };

  // Output
  if (parsed.json) {
    console.log(JSON.stringify({
      audit: { vulnerabilities: vulns },
      secrets,
      sbom,
      passed: exitCode === 0,
    }, null, 2));
  } else {
    console.log(formatHumanReport(auditResult, vulns, secrets, sbom));
  }

  // Save SBOM if requested
  if (parsed.save) {
    const sbomPath = path.join('docs', 'sbom', 'sbom.json');
    try {
      writeFileFn(sbomPath, JSON.stringify(sbom, null, 2));
      console.log(`SBOM saved to: ${sbomPath}`);
    } catch (err) {
      console.error(`Failed to save SBOM: ${err.message}`);
    }
  }

  return { exitCode, ...result };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const result = run();
  process.exit(result.exitCode);
}

module.exports = {
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
};
