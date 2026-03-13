#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const proposalFile = (() => {
  const idx = args.indexOf('--proposal');
  return idx !== -1 ? args[idx + 1] : null;
})();

if (!proposalFile) {
  console.error('Usage: node proposal-to-gdd.js --proposal <path> [--dry-run]');
  process.exit(1);
}

if (!fs.existsSync(proposalFile)) {
  console.error(`Error: Proposal file not found: ${proposalFile}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content };
  try {
    const meta = yaml.load(match[1]) || {};
    const body = content.slice(match[0].length).trim();
    return { meta, body };
  } catch (err) {
    console.error(`YAML parse error: ${err.message}`);
    process.exit(1);
  }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function inferTechStack(genre) {
  // Default: HTML5 Canvas + vanilla JS (Morpheus D3 decision)
  const stacks = {
    puzzle: ['html5-canvas', 'vanilla-js'],
    platformer: ['html5-canvas', 'vanilla-js'],
    card: ['html5-dom', 'css-animations', 'vanilla-js'],
    roguelite: ['html5-canvas', 'vanilla-js'],
    arcade: ['html5-canvas', 'vanilla-js'],
    strategy: ['html5-dom', 'html5-canvas', 'vanilla-js'],
  };
  return stacks[(genre || '').toLowerCase()] || ['html5-canvas', 'vanilla-js'];
}

function inferMechanics(genre, body) {
  const genreMechanics = {
    puzzle: ['puzzle-solving', 'pattern-matching', 'progression'],
    platformer: ['movement', 'jumping', 'collection'],
    card: ['card-play', 'deck-building', 'strategy'],
    roguelite: ['exploration', 'combat', 'progression', 'collection'],
    arcade: ['movement', 'collection', 'scoring'],
    strategy: ['resource-management', 'building', 'planning'],
  };
  return genreMechanics[(genre || '').toLowerCase()] || ['gameplay-core'];
}

// ---------------------------------------------------------------------------
// GDD Generation (template fill-in — no LLM, structural scaffold)
// ---------------------------------------------------------------------------
function generateGDD(meta, body) {
  const title = meta.title;
  const slug = meta.slug;
  const genre = meta.genre || 'other';
  const platforms = meta.platforms || ['web-browser'];
  const sessionMinutes = meta.target_session_minutes || 20;
  const techStack = inferTechStack(genre);
  const mechanics = inferMechanics(genre, body);
  const dateStr = today();

  // Extract core loop, hook, and visual hints from body
  const lines = body.split('\n').filter(l => l.trim());
  const coreLoop = lines[0] || 'Core gameplay loop to be defined.';
  const hook = lines.length > 1 ? lines[1] : 'Unique hook to be defined.';
  const visualHint = lines.length > 2 ? lines[2] : 'Visual style to be defined.';

  const gdd = `---
title: "${title}"
status: "initial"
designer: "Squad Pipeline (auto-generated)"
created_date: "${dateStr}"
last_updated: "${dateStr}"
version: "1.0"
genre: "${genre}"
platforms:
${platforms.map(p => `  - "${p}"`).join('\n')}
target_audience: "All ages, casual gamers"
core_loop_duration_minutes: "${sessionMinutes}"
mvp_scope: "medium"
estimated_team_size: "3"
tech_stack:
${techStack.map(t => `  - "${t}"`).join('\n')}
design_pillars_count: "3"
mechanic_types:
${mechanics.map(m => `  - "${m}"`).join('\n')}
art_required: "low"
audio_required: "procedural"
blocking_unknowns: "none"
has_combat_system: ${genre === 'roguelite' || genre === 'platformer'}
has_multiplayer: false
requires_3d: false
---

### 1. High Concept

**Genre:** ${genre.charAt(0).toUpperCase() + genre.slice(1)}  
**Platforms:** ${platforms.join(', ')}  
**Target Audience:** All ages, casual gamers  
**Core Loop:** ${coreLoop}

${body}

---

### 2. Design Pillars

1. **Accessible:** Easy to learn, satisfying to master. No complex controls.
2. **Session-Friendly:** Complete sessions in ${sessionMinutes} minutes or less.
3. **Replayable:** Each session offers variety through procedural elements or randomization.

---

### 3. Core Mechanics

${mechanics.map((m, i) => `#### ${m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
- **What:** Player engages with ${m.replace(/-/g, ' ')} system
- **Why:** Core to the ${genre} experience
- **Interaction:** Connects to other mechanics via game state
- **State:** Resets per session`).join('\n\n')}

---

### 4. Art & Visual Style

#### Visual Direction
- **Aesthetic:** ${visualHint}
- **Resolution:** Web-native, responsive canvas
- **Color Palette:** To be defined based on game theme
- **Asset Count (MVP):** Minimal — procedural/CSS art for prototype
- **Tool:** Canvas 2D API, CSS
- **Reference:** Browser-native games

---

### 5. Audio & Music Strategy

#### Music
- **Style:** Ambient loops, matching game mood
- **Layers:** Single background loop for MVP
- **Tool:** Web Audio API (procedural generation)
- **Duration (MVP):** 1 procedural loop

#### SFX
- **Approach:** Procedural via Web Audio API
- **Key Sounds:** Action feedback, success, failure, UI clicks
- **Tool:** Web Audio API oscillator-based

---

### 6. Game Loop & Progression

#### Per-Session Loop
1. Start new game/session
2. Core gameplay (${sessionMinutes} minutes target)
3. Score/result display
4. Option to replay

#### Meta-Progression
- High score tracking (localStorage)
- Session statistics
- Unlockable difficulty modes (post-MVP)

---

### 7. Technical Architecture

#### Stack
- **Runtime:** Web Browser (HTML5)
- **Rendering:** ${techStack[0] === 'html5-canvas' ? 'Canvas 2D API' : 'DOM + CSS'}
- **Language:** Vanilla JavaScript (ES6+)
- **Build:** None (static files) — deploy directly
- **State:** In-memory game state, localStorage for persistence

#### File Structure
\`\`\`
index.html      — Entry point
style.css       — Game styles
game.js         — Core game logic
assets/         — Game assets (if any)
\`\`\`

---

### 8. Content & Scope

#### MVP (Priority P0)
- [ ] Game canvas/container setup
- [ ] Core ${mechanics[0].replace(/-/g, ' ')} mechanic
${mechanics.slice(1).map(m => `- [ ] ${m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} system`).join('\n')}
- [ ] Score display
- [ ] Game over / restart flow

#### Post-MVP (Priority P1)
- [ ] Sound effects (Web Audio API)
- [ ] Visual polish and animations
- [ ] Difficulty scaling
- [ ] Mobile touch controls

#### Stretch Goals (Priority P2)
- [ ] Background music
- [ ] Leaderboard (localStorage)
- [ ] Additional content/levels
- [ ] Share score functionality

---

### 9. Success Criteria & Testing

#### Functional Tests
- [ ] Game loads without JavaScript errors
- [ ] Core loop is playable start-to-finish
- [ ] Score tracking works correctly
- [ ] Game restarts cleanly

#### Quality Gates
- [ ] Bundle size < 5MB
- [ ] Loads in < 3 seconds on broadband
- [ ] No external CDN dependencies
- [ ] Works in Chrome, Firefox, Safari

---

### 10. Dependencies & Critical Path

#### Phase 1: Foundation (P0)
- Project scaffolding (index.html, game.js, style.css)
- Canvas/DOM setup and game loop
- Core mechanic implementation

#### Phase 2: Gameplay (P0)
- All core mechanics integrated
- Score and progression system
- Game over and restart flow

#### Phase 3: Polish (P1)
- Visual improvements
- Audio integration
- Mobile support
- Performance optimization
`;

  return gdd;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Proposal → GDD Generator${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`${'═'.repeat(50)}\n`);

  const raw = fs.readFileSync(proposalFile, 'utf8');
  const { meta, body } = parseFrontmatter(raw);

  if (!meta.title || !meta.slug) {
    console.error('Error: Proposal must have "title" and "slug" in frontmatter.');
    process.exit(1);
  }

  const gdd = generateGDD(meta, body);
  // Resolve output paths from repo root (scripts/ is one level under root)
  const repoRoot = path.resolve(__dirname, '..');
  const outputDir = path.join(repoRoot, 'docs', 'gdds');
  const outputPath = path.join(outputDir, `${meta.slug}.md`);

  if (dryRun) {
    console.log(`[DRY-RUN] Would write GDD to: ${outputPath}`);
    console.log(`[DRY-RUN] GDD length: ${gdd.length} chars`);
    console.log(`[DRY-RUN] Sections: 10`);
    console.log('\n--- Preview (first 500 chars) ---');
    console.log(gdd.substring(0, 500));
    console.log('...\n');
  } else {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, gdd, 'utf8');
    console.log(`✅ GDD written to: ${outputPath}`);
  }

  // Validation: check all 10 sections present
  const sectionHeaders = [
    'High Concept', 'Design Pillars', 'Core Mechanics',
    'Art & Visual Style', 'Audio & Music Strategy', 'Game Loop & Progression',
    'Technical Architecture', 'Content & Scope', 'Success Criteria & Testing',
    'Dependencies & Critical Path'
  ];

  const sectionsFound = sectionHeaders.filter(h => gdd.includes(`### ${sectionHeaders.indexOf(h) + 1}. ${h}`));
  const allPresent = sectionsFound.length === 10;

  console.log(`\nSections: ${sectionsFound.length}/10 present`);
  if (!allPresent) {
    const missing = sectionHeaders.filter(h => !gdd.includes(`### ${sectionHeaders.indexOf(h) + 1}. ${h}`));
    console.log(`Missing: ${missing.join(', ')}`);
  }

  // Pipeline state
  const pipelineDir = path.join(repoRoot, '.pipeline', meta.slug);
  const statusFile = path.join(pipelineDir, 'status.json');
  const proposalMeta = path.join(pipelineDir, 'proposal.json');

  const status = {
    slug: meta.slug,
    title: meta.title,
    current_stage: 'gdd',
    stages: {
      proposal: { status: 'complete', timestamp: new Date().toISOString() },
      gdd: { status: 'complete', timestamp: new Date().toISOString() },
      issues: { status: 'pending' },
      implementation: { status: 'pending' },
      build: { status: 'pending' },
      deploy: { status: 'pending' }
    },
    repo: null,
    pages_url: null,
    blocked: false,
    block_reason: null
  };

  if (!dryRun) {
    if (!fs.existsSync(pipelineDir)) {
      fs.mkdirSync(pipelineDir, { recursive: true });
    }
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2), 'utf8');
    fs.writeFileSync(proposalMeta, JSON.stringify({ ...meta, body_preview: body.substring(0, 200) }, null, 2), 'utf8');
    console.log(`📊 Pipeline state written to: ${statusFile}`);
  }

  const report = {
    slug: meta.slug,
    title: meta.title,
    sections_found: sectionsFound.length,
    validation_passed: allPresent,
    output_path: outputPath,
    pipeline_state: statusFile
  };

  console.log(`\n${JSON.stringify(report, null, 2)}\n`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `gdd_report=${JSON.stringify(report)}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${meta.slug}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `output_path=${outputPath}\n`);
  }

  process.exit(allPresent ? 0 : 1);
}

run();
