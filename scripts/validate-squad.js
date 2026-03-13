const fs = require('fs');
const path = require('path');

const SQUAD_DIR = path.join(__dirname, '..', '.squad');
const EXCLUDE_DIRS = ['templates', 'archive'];
let failures = 0;

function fail(msg) { console.error(`  FAIL: ${msg}`); failures++; }
function pass(msg) { console.log(`  PASS: ${msg}`); }

// Per-type size limits (bytes) — mirrors context-hygiene SKILL.md
function getLimitBytes(relPath) {
  const name = path.basename(relPath);
  if (name === 'history.md') return 8 * 1024;
  if (name === 'decisions.md') return 12 * 1024;
  if (name === 'charter.md') return 15 * 1024;
  if (relPath.startsWith('orchestration-log')) return 2 * 1024;
  if (relPath.startsWith('log' + path.sep)) return 1 * 1024;
  return 25 * 1024; // any other .squad/ file
}

function getLimitLabel(relPath) {
  const limit = getLimitBytes(relPath);
  return `${limit / 1024}KB`;
}

// --- Check 1: Required files exist ---
console.log('\n[1] Required files');
for (const file of ['decisions.md', 'team.md', 'routing.md']) {
  const fp = path.join(SQUAD_DIR, file);
  fs.existsSync(fp) ? pass(`${file} exists`) : fail(`${file} missing`);
}

// --- Check 2: team.md contains ## Members header ---
console.log('\n[2] team.md structure');
try {
  const team = fs.readFileSync(path.join(SQUAD_DIR, 'team.md'), 'utf8');
  team.includes('## Members') ? pass('## Members header found') : fail('## Members header missing in team.md');
} catch { fail('Could not read team.md'); }

// --- Check 3: Per-type file size enforcement ---
console.log('\n[3] File size check (per-type limits, excluding templates/archive)');
function walkDir(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walkDir(SQUAD_DIR);
let checkedCount = 0;
let totalSize = 0;
let warnCount = 0;
for (const file of allFiles) {
  const rel = path.relative(SQUAD_DIR, file);
  if (EXCLUDE_DIRS.some(d => rel.startsWith(d))) continue;
  const size = fs.statSync(file).size;
  checkedCount++;
  totalSize += size;
  const limit = getLimitBytes(rel);
  const hardStop = 25 * 1024;
  if (size > hardStop) {
    fail(`${rel} is ${(size / 1024).toFixed(1)}KB (HARD STOP: 25KB)`);
  } else if (size > limit) {
    console.log(`  WARN: ${rel} is ${(size / 1024).toFixed(1)}KB (per-type limit: ${getLimitLabel(rel)}) — Scribe cleanup needed`);
    warnCount++;
  }
}
pass(`${checkedCount} files checked for size`);
if (warnCount > 0) {
  console.log(`  ⚠️  ${warnCount} file(s) exceed per-type limits — see context-hygiene SKILL`);
}

const totalKB = Math.round(totalSize / 1024);
if (totalKB >= 100) {
  console.log(`  WARN: Total .squad/ is ${totalKB}KB (limit: 100KB) — Scribe cleanup needed`);
} else {
  pass(`Total .squad/ size: ${totalKB}KB / 100KB`);
}

// --- Summary ---
console.log('\n' + '='.repeat(40));
if (failures > 0) {
  console.error(`FAILED: ${failures} check(s) failed`);
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED');
}
