# Game Design Document Template

## YAML Frontmatter (Machine-Readable Metadata)

```yaml
---
title: "{Game Title}"
status: "initial|vision|draft|final|archived"
designer: "{Primary Designer Name}"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
version: "1.0"

# Core Identity (Auto-parsed for issue triage)
genre: "{Primary Genre}"
platforms:
  - "web-browser"
  - "desktop"
  - "mobile"
target_audience: "{Age Range}, {Player Type}"
core_loop_duration_minutes: "{20-40}"  # Typical play session

# Scope & Scale
mvp_scope: "high|medium|low"  # Complexity/time to MVP
estimated_team_size: "{2-5}"  # AI agents/humans needed
tech_stack:
  - "html5-canvas"
  - "webgl"
  - "pixi.js"
  - "babylon.js"
  - "custom"

# Issue Derivation (Auto-derivable)
design_pillars_count: "{Number of design pillars}"
mechanic_types: 
  - "movement|combat|puzzle|exploration|building|collection"
art_required: "{none|low|medium|high}"
audio_required: "{none|procedural|sample-based|custom}"

# Complexity Indicators (→ Priority)
blocking_unknowns: "{List or 'none'}"
has_combat_system: false|true
has_multiplayer: false|true
requires_3d: false|true
---
```

---

## Document Sections (Machine-Parseable)

Each section below maps 1:1 to GitHub Issues. Use consistent headers with **exactly** these titles.

### 1. High Concept

**Purpose:** One-paragraph elevator pitch. Machine-parsed for issue title.

Format:
```
**Genre:** {primary_genre}  
**Platforms:** {platform_list}  
**Target Audience:** {audience}  
**Core Loop:** {30-second description of one play session}
```

Example:
```
**Genre:** Cozy Gardening Roguelite  
**Platforms:** Web Browser  
**Target Audience:** Players 13+; fans of Stardew Valley and A Short Hike  
**Core Loop:** Seed plants, tend garden through weather hazards, harvest and sell crops to buy better tools. Each run lasts 20–40 minutes.
```

**→ Issue Mapping:** Becomes Epic issue "Game: {Title}" with scope overview. Label: `type:epic`, `component:design`

---

### 2. Design Pillars (3–5 statements)

**Purpose:** Guiding principles that inform all decisions. Used to evaluate feature trade-offs.

Format:
```
1. **{Pillar Name}:** {One-sentence justification}
2. **{Pillar Name}:** {One-sentence justification}
...
```

Example:
```
1. **Cozy, not Stressful:** Weather changes and pests present challenges, but failure is educational, not punishing. No time limits.
2. **Discovery-Driven:** Players learn synergies between plants and weather by experimentation, not tooltips.
3. **Non-Combat Depth:** Challenge comes from resource management and planning, not reflexes.
4. **One-Handed Play:** Desktop mouse-only or mobile touch; no keyboard gymnastics.
```

**→ Issue Mapping:** Does NOT create issues (meta-decision document). Referenced in PR reviews. Label: `scope:pillar-alignment`

---

### 3. Core Mechanics

**Purpose:** The 3–5 core systems that define gameplay.

Format:
```
#### {Mechanic Name}
- **What:** {One sentence—what player does}
- **Why:** {Why this is fun/interesting}
- **Interaction:** {How it connects to other mechanics}
- **State:** {What data persists? What resets per-run?}
```

Example:
```
#### Plant Growth & Synergy
- **What:** Player places plants on grid; each plant type grows when conditions match (soil, water, sunlight, temperature).
- **Why:** Experimenting with placement and plant pairings is the core puzzle.
- **Interaction:** Weather modifies growth rates; tools unlock new soil/water options; encycloped unlocks via discovery.
- **State:** Plant positions & growth state reset per-run. Tool unlocks persist across runs (meta-progression).

#### Weather System
- **What:** Each in-game day brings random weather (sunny, rainy, cold, hot). Plants thrive or suffer based on type.
- **Why:** Adds planning challenge: adapt plant selection to predicted weather or use tools to mitigate.
- **Interaction:** Soil quality + water affect weather resistance; pests spawn in specific conditions.
- **State:** Weather pattern visible 3 days ahead (planning window). Same pattern seed each run—replayable.

#### Pest & Hazard System
- **What:** Unwanted insects/animals appear based on plant types + weather. Player removes via tools or organic methods (companion plants).
- **Why:** Teaches synergies; creates secondary economy (pest solution = specific plant placement).
- **Interaction:** Pests damage plants; damaged plants attract more pests; tool usage prevents pests.
- **State:** Pest presence resets per-run but is predictable given plant choices.
```

**→ Issue Mapping:** Each mechanic with unknowns → "Implement {Mechanic}" task issue. Label: `type:feature`, `component:gameplay`. If **blocking unknown** exists → `priority:p0` (must prototype first). Otherwise: `priority:p1-p2` based on core vs. nice-to-have.

---

### 4. Art & Visual Style

**Purpose:** Visual target, asset budgets, and tool recommendations.

Format:
```
#### Pixel Art / Voxel / 3D
- **Aesthetic:** {One-sentence vibe}
- **Resolution:** {e.g., "16×16 base grid, 32×32 for characters"}
- **Color Palette:** {e.g., "Warm earths + seasonal shifts: Spring (greens), Summer (yellows), Fall (oranges), Winter (blues/grays)"}
- **Asset Count (MVP):** {Trees: 12, NPCs: 4, Items: 20, Tiles: 8}
- **Tool Recommendation:** {Aseprite, Photoshop, Krita, PixelStudio, Spine for animation}
- **Reference/Inspiration:** {Stardew Valley, A Short Hike, pixel_artist_name}
```

Example:
```
#### Pixel Art
- **Aesthetic:** Warm, earthy, cozy. Day/night cycle visible. Seasonal color shifts (Spring: fresh greens → Summer: golden → Fall: oranges/browns → Winter: cool blues/whites).
- **Resolution:** 16×16 base grid for terrain. Plants scale 32×32 (blooming states: seed, sprout, growing, mature, withering).
- **Color Palette:** ~10 primary (greens, browns, blues), ~20 secondary (seasonal shifts, soil variants).
- **Asset Count (MVP):**
  - Tiles: 8 (soil types, water, path)
  - Plants: 12 (carrot, wheat, sunflower, etc., each 3 growth states)
  - Weather VFX: 4 (rain, snow, clouds, sun)
  - UI: buttons, panels, icons for tools
  - Seasonal overlays: 4 (subtle background & lighting shifts)
- **Tool:** Aseprite (animation) + Krita (large comps) or PixelStudio (mobile)
- **Reference:** Stardew Valley (color/mood), Crops N Critters (scale), A Short Hike (cozy vibe)
```

**→ Issue Mapping:** 
- If **art_required: high** → "Art Sprint: {Game} Assets" epic with sub-issues per asset category (tiles, characters, VFX).
- Per-category issue → "Create {Asset Type}" task. Label: `type:asset`, `component:art`, `priority:p1`.
- If **art_required: low/none** → Single "Placeholder Art" checklist issue.

---

### 5. Audio & Music Strategy

**Purpose:** Sound design approach, budget, and tools.

Format:
```
#### Music
- **Style:** {Genre, BPM, mood}
- **Layers:** {Underscore + ambient layers + action/event layers}
- **Tool:** {Ableton, GarageBand, Beepbox, procedural Web Audio API}
- **Duration (MVP):** {1 main loop = X minutes}

#### SFX
- **Approach:** {Recorded samples, synth/procedural, DAW}
- **Key Sounds:** {List critical SFX: footstep, jump, hit, collect, error}
- **Tool:** {Audacity, SFXR, Flesh, etc.}
```

Example:
```
#### Music
- **Style:** Looping ambient underscores. 60–90 BPM. Warm, earthy. Seasonal variations (subtle instrument swaps).
- **Layers:** Base loop (12–16 bars) + ambient pad + gentle percussion. Action layer when pest appears (tension).
- **Tool:** Beepbox (free, browser-based) or Web Audio API procedural generation (no external files).
- **Duration (MVP):** 1 main loop (~30 seconds), 2 variations (growth event, pest encounter).

#### SFX
- **Approach:** Procedural Web Audio API (no external audio files). Keeps game tiny.
- **Key Sounds:**
  - Plant placed: rising tone (success confirmation)
  - Plant grows: subtle chime + visual bloom
  - Pest appears: dissonant spike tone
  - Pest removed: descending clear tone
  - Tool used: mechanical click
  - Harvest: bright ascending sequence (reward)
  - Game over: sad descending tone
- **Tool:** Web Audio API; consider SFXR for reference samples.
```

**→ Issue Mapping:**
- If **audio_required: none/procedural** → Single "Audio Design (Procedural)" task. Label: `type:audio`, `component:audio`, `priority:p2` (nice-to-have).
- If **audio_required: sample-based** → "Music/SFX Production" epic with sub-issues (Music, SFX creation). Label: `priority:p1` (core UX).

---

### 6. Game Loop & Progression

**Purpose:** Moment-to-moment play, session structure, long-term progress.

Format:
```
#### Per-Run Loop (Session structure)
1. **Setup:** {e.g., "Select 3 starter plants from unlocked pool"}
2. **Gameplay Loop (repeats X times):**
   - Step A: {e.g., "Advance 1 in-game day (weather rolls)"}
   - Step B: {e.g., "Player can place/tend/harvest plants or use tools"}
   - Check: {e.g., "If pest count > threshold, trigger encounter"}
3. **End Condition:** {e.g., "Run ends after 12 in-game days or all plants dead"}
4. **Results:** {e.g., "Gold earned = seeds sold + tool usage cost"}

#### Meta-Progression (Across runs)
- **What Persists:** {Tools, seeds unlocked, garden plot size, encyclopedia}
- **Unlock Pattern:** {e.g., "Tools unlock via gold spending; new plants unlock via discovery"}
- **Pacing:** {e.g., "New unlock every 2–3 runs, diminishing after 20 runs"}
```

Example:
```
#### Per-Run Loop
1. **Setup:** Select garden layout (8×8 default) and 3 starter plants.
2. **Gameplay Loop (repeats 12 times for 12 in-game days):**
   - Weather rolls (revealed 1 day at a time)
   - Player taps/clicks to: place plant, remove plant, use tool, check plant growth
   - Weather applies effects: growth boost/penalty, pest spawn, soil dry/muddy
   - Pests auto-damage if no counter installed
3. **End Condition:** 12 days pass OR all plants dead
4. **Results:** Count ripe plants × base_seed_value = gold earned (minus tool costs). Add gold to treasury.

#### Meta-Progression
- **Persists:** Gold balance, tool inventory (hoe, watering can, pesticide sprayer, soil enricher), unlocked seed types (start: 3 common; unlock 9 more via discovery).
- **Unlock Pattern:** 
  - Tools: Each costs 50/75/100/150 gold (unlocked after Nth run).
  - Seeds: Unlock when first grown successfully in-run. Displayed in encyclopedia (visual reward).
- **Pacing:** New tool every 5 runs; encyclopedia fills over 15–20 runs.
```

**→ Issue Mapping:**
- "Implement Per-Run Loop" task. Label: `type:feature`, `component:gameplay`, `priority:p0`.
- "Implement Meta-Progression System" task. Label: `type:feature`, `component:progression`, `priority:p1`.
- For each unknown: create "Design {Element}" task with `:p0` priority.

---

### 7. Technical Architecture

**Purpose:** Engine, framework, platform constraints, performance targets.

Format:
```
#### Engine / Framework
- **Choice:** {Canvas 2D, WebGL, Babylon.js, custom engine, etc.}
- **Why:** {Constraints, performance goals, team expertise}
- **Key Dependencies:** {Libraries: Pixi.js, Phaser, Three.js, etc.}

#### Performance Targets (MVP)
- **FPS:** {60 target, 30 minimum}
- **Memory (MB):** {Browsers must load in <50 MB RAM}
- **Startup Time:** {<3 seconds to playable}
- **File Size:** {<5 MB zip, <2 MB JS bundle if possible}

#### Multiplayer / Backend
- **Local Only:** {No server}
- **Cloud Save:** {Optional for future; MVP saves to localStorage}
- **API:** {None required for MVP}
```

Example:
```
#### Engine / Framework
- **Choice:** HTML5 Canvas 2D (vanilla JS for MVP, migrate to Pixi.js if performance drops below 60 FPS)
- **Why:** Lightweight, runs on any browser, no build complexity needed. Can migrate to Pixi.js for particles/scale.
- **Key Dependencies:** None for MVP. Optional: Pixi.js (graphics), Howler.js (audio fallback), seed-random (deterministic RNG).

#### Performance Targets (MVP)
- **FPS:** 60 on desktop, 30+ on mobile
- **Memory:** <20 MB on load (game + assets)
- **Startup:** <2 seconds to playable
- **File Size:** <3 MB total (game + assets)

#### Multiplayer / Backend
- **Local Only:** Yes. No multiplayer for MVP.
- **Cloud Save:** localStorage for run history; no cloud sync.
- **API:** None. Fully client-side.
```

**→ Issue Mapping:**
- "Architecture Design: {Game}" task. Label: `type:technical`, `component:architecture`, `priority:p0`.
- "Performance Audit" task (post-MVP). Label: `type:qa`, `priority:p2`.

---

### 8. Content & Scope

**Purpose:** Feature list with MVP/post-launch tiers.

Format:
```
#### MVP (Must Have)
- {Feature A}
- {Feature B}
...

#### Post-MVP (Nice to Have)
- {Feature X}
- {Feature Y}
...

#### Stretch (Experimental)
- {Feature Z}
```

Example:
```
#### MVP (Must Have)
- 8×8 garden grid with drag-to-place plants
- 12 plant types with growth/withering states
- Weather system (4 weather types, 3-day forecast)
- Pest system (3 pest types, 2 removal methods per)
- 3 tools (hoe, watering can, pesticide spray)
- 12 in-game day run structure
- Gold earned + spending UI
- Encyclopedia (plant discovery tracker)
- 1 run = playable end-to-end in <45 minutes

#### Post-MVP (Nice to Have)
- Garden plot expansion (10×10, 12×12)
- Seasonal visual overhauls (4 art passes)
- NPC visitors (trading, requests)
- Soil quality management
- Seed breeding (2 plants → hybrid)
- Leaderboard (localStorage-based)
- Mobile touch controls polish

#### Stretch (Experimental)
- Co-op garden (2-player local)
- Weather prediction mini-game
- Composting system
- Garden decorations
```

**→ Issue Mapping:**
- "Feature: {Feature Name}" per MVP item. Label: `type:feature`, `priority:p0`.
- "Feature: {Feature Name}" per Post-MVP item. Label: `type:feature`, `priority:p1`.
- "Exploration: {Feature Name}" per Stretch item. Label: `type:research`, `priority:p2`.

---

### 9. Success Criteria & Testing

**Purpose:** How to measure completion and quality gates.

Format:
```
#### Functional Requirements
- [ ] {Requirement A}: {Verification step}
- [ ] {Requirement B}: {Verification step}

#### Quality Gates
- Performance: {FPS target met on target platforms}
- Accessibility: {Keyboard + mouse + touch all functional}
- Playtesting: {X test sessions, average session time ±5 min target}

#### Known Issues / Blockers
- {Blocker A}: {Impact, mitigation plan}
- {Blocker B}: {Impact, mitigation plan}
```

Example:
```
#### Functional Requirements
- [ ] Plants grow visibly over 12 in-game days when conditions met: {Load run, place plant, simulate 12 days, verify final sprite state = mature}
- [ ] Weather forecast updates daily: {Load run, check 3-day forecast at start, advance 1 day, verify forecast shifted + new day appended}
- [ ] Pests spawn + damage plants correctly: {Run to pest spawn condition, verify plant health reduced after 1 day unpesticide'd}
- [ ] Gold earned matches formula: {Calculate expected gold, end run, verify displayed gold = expected}
- [ ] Tools correctly modify plant conditions: {Place plant, use tool, verify plant state change matches tool effect}

#### Quality Gates
- Performance: 60 FPS sustained during 12-day simulation on desktop Chrome; 30+ FPS on mobile Safari.
- Accessibility: Full keyboard navigation (arrow keys to place/tool select, Enter to confirm). Touch support on mobile.
- Playtesting: 3+ test sessions with average run time 25–35 minutes (target: 30 ±5).

#### Known Issues / Blockers
- **Blocking Unknown: Pest AI Strategy.** Impact: Player behavior in pest scenarios unpredictable. Mitigation: Playtest prototype with simple pest (just spawn, damage, no escape).
- **Blocking Unknown: Tool balance.** Impact: Run difficulty may be too hard/easy. Mitigation: Pre-balance with 3 cost tiers, test after plant synergy prototype.
```

**→ Issue Mapping:**
- "Testing: {Game} Functional Requirements" checklist issue. Label: `type:qa`, `component:testing`, `priority:p0`.
- "Testing: {Game} Accessibility" task. Label: `type:qa`, `priority:p1`.
- Per blocker: "Investigation: {Blocker Name}" research task. Label: `type:research`, `priority:p0`.

---

### 10. Dependencies & Critical Path

**Purpose:** What must be done first; what blocks what.

Format:
```
#### Critical Path (in order)
1. **Design Phase:** {List design docs / decisions needed}
2. **Prototype Phase:** {First playable—which features minimal?)
3. **Core Implementation:** {What must be done before scaling}
4. **Polish & Testing:** {When do QA tasks start?}

#### Blocking Dependencies
- {Task A} blocks {Task B} because {reason}
```

Example:
```
#### Critical Path
1. **Design Phase (1–2 days):**
   - Finalize plant synergy table (growth, pests, weather impacts)
   - Decide on 12 starter plant types
   - Lock weather formula (4 types, effect magnitudes)
   
2. **Prototype Phase (2–3 days):**
   - Single plant growth + weather simulation (no UI)
   - Render plants on canvas, weather overlay
   - Verify growth math feels reasonable in playtesting
   
3. **Core Implementation (5–7 days):**
   - Full garden grid + placement UI
   - All plants + weather types
   - Pest system (spawn, damage, removal)
   - 12-day run loop + gold calculation
   
4. **Polish & Testing (3–5 days):**
   - Encyclopedia UI + persistence
   - Tool selection + feedback
   - Accessibility + mobile touch
   - Playtesting sessions
   - Bug fixes

#### Blocking Dependencies
- Weather system design (blockes pest spawn logic) — do first
- Plant synergy table (blocks prototype testing) — do first
- Pest AI behavior (blocks fun assessment) — prototype early
```

**→ Issue Mapping:**
- "Task: {Phase Name}" per phase. Label: `type:milestone`, `priority:p0`.
- Per blocking dependency: Note in GitHub Epic as blocking relationship (GitHub Issue Links).

---

## Auto-Parsing Rules for Trinity (GDD→Issue Pipeline)

### How Trinity Reads This Template

1. **Metadata Extract (YAML):**
   - Parse frontmatter YAML → issue title, labels, assignee hints
   - If `status: "initial"` → `priority:p2` (exploratory)
   - If `status: "draft"` → `priority:p1` (planning)
   - If `status: "final"` → Issues are work items

2. **Section Headers (H3 `###`):**
   - Each H3 = potential issue category
   - Title = `{Section Name}: {Game Title}`

3. **Sub-Headers (H4 `####`):**
   - Each H4 within section = potential task issue
   - Title = `{Sub-Header Name}`

4. **Checklist Items (- [ ]):**
   - Each unchecked item = test/acceptance criterion
   - Auto-attached to parent issue

5. **Labels Auto-Derivation:**
   - `type:epic` if section is High Concept
   - `type:feature` if section is Core Mechanics, Content & Scope
   - `type:audio` if section is Audio
   - `type:asset` if section is Art & Visual Style
   - `type:technical` if section is Technical Architecture
   - `type:qa` if section is Success Criteria & Testing
   - `type:milestone` if section is Dependencies & Critical Path
   - `component:{section-name-kebab}` always added
   - `priority:p0` if flagged as "blocking unknown" or in Critical Path
   - `priority:p1` if MVP scope
   - `priority:p2` if Post-MVP or Stretch

6. **Assignment Hints** (for non-autonomous teams):
   - Game Designer → High Concept, Design Pillars, Core Mechanics, Art & Visual Style, Game Loop & Progression
   - Engineer → Technical Architecture, Performance Targets
   - Tester → Success Criteria & Testing
   - Artist → Art & Visual Style, Asset Counts
   - Audio → Audio & Music Strategy

---

## File Naming Convention

Save GDDs with naming pattern:
```
docs/games/{game-slug}.gdd.md
```

Examples:
- `docs/games/flora.gdd.md`
- `docs/games/firstpunch.gdd.md`
- `docs/games/comerosquillas.gdd.md`

---

## Example Minimal GDD (2 hours design work)

See attached `flora.gdd.md` example for a complete, production-ready GDD that fits this template.

---

## Notes for Autonomous Teams

- **Completeness before parsing:** Ensure all 10 sections are present before feeding to Trinity. Partial GDDs cause orphaned issues.
- **YAML is critical:** Trinity's label/priority logic depends on frontmatter fields. Missing fields = defaults to `priority:p1`, `type:feature`.
- **Blocking unknowns:** Flag explicitly in YAML or as **Blocking Unknown: {Name}** headers. These auto-escalate to `priority:p0`.
- **Reuse this template:** Every new game uses this structure. Consistency enables fast parsing and issue generation.
