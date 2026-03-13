const fs = require('fs');
const path = require('path');

const SQUAD_DIR = path.join(__dirname, '..', '.squad');
const MAX_FILE_SIZE = 15 * 1024; // 15KB
const EXCLUDE_DIR = path.join('templates', '_reference');
let failures = 0;

function fail(msg) { console.error(`  FAIL: ${msg}`); failures++; }
function pass(msg) { console.log(`  PASS: ${msg}`); }

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

// --- Check 3: File size enforcement ---
console.log('\n[3] File size check (max 15KB, excluding templates/_reference/)');
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
for (const file of allFiles) {
  const rel = path.relative(SQUAD_DIR, file);
  if (rel.startsWith(EXCLUDE_DIR)) continue;
  const size = fs.statSync(file).size;
  checkedCount++;
  if (size > MAX_FILE_SIZE) {
    fail(`${rel} is ${(size / 1024).toFixed(1)}KB (limit: 15KB)`);
  }
}
pass(`${checkedCount} files checked for size`);

// --- Summary ---
console.log('\n' + '='.repeat(40));
if (failures > 0) {
  console.error(`FAILED: ${failures} check(s) failed`);
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED');
}
