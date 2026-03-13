---
title: "Chrono Tiles"
status: "draft"
designer: "Oracle"
created_date: "2026-03-14"
last_updated: "2026-03-14"
version: "1.0"

genre: "Puzzle Platformer"
platforms:
  - "web-browser"
  - "desktop"
target_audience: "12+, puzzle fans"
core_loop_duration_minutes: "15-25"

mvp_scope: "medium"
estimated_team_size: "3"
tech_stack:
  - "html5-canvas"
  - "pixi.js"

design_pillars_count: "3"
mechanic_types:
  - "puzzle"
  - "movement"
  - "collection"
art_required: "medium"
audio_required: "procedural"

blocking_unknowns: "Time-rewind memory cost"
has_combat_system: false
has_multiplayer: false
requires_3d: false
---

### 1. High Concept

**Genre:** Puzzle Platformer  
**Platforms:** Web Browser, Desktop  
**Target Audience:** 12+, puzzle fans  
**Core Loop:** Navigate tile-based levels by manipulating time. Rewind, pause, and fast-forward tiles to solve spatial puzzles. Each level takes 5–10 minutes.

### 2. Design Pillars

1. **Time as a Tool:** Time manipulation is the core mechanic, not just a gimmick. Every puzzle requires creative use of rewind/pause.
2. **Fair Challenge:** Solutions are logical. No pixel-perfect jumps, no hidden information.
3. **Minimalist Elegance:** Simple visuals, deep mechanics. Less is more.

### 3. Core Mechanics

#### Tile Movement
- **What:** Player moves on a grid of tiles. Each tile has properties (solid, breakable, moving, timed).
- **Why:** Grid movement keeps controls simple while enabling complex puzzles.
- **Interaction:** Time manipulation changes tile states—rewinding restores broken tiles, pausing freezes moving platforms.
- **State:** Tile positions and states tracked per-level. Reset on retry.

#### Time Manipulation
- **What:** Player can rewind (undo last N moves), pause (freeze all moving elements), and fast-forward (skip waiting sequences).
- **Why:** Core differentiator. Transforms standard puzzle platformer into something unique.
- **Interaction:** Rewind costs energy (limited uses per level). Pause is free but temporary. Fast-forward only works on passive elements.
- **State:** Time history buffer stores last 20 states. Energy resets per level. **Blocking Unknown: Memory cost of storing 20 tile states per level.**

#### Collection System
- **What:** Each level has 3 chrono-crystals to collect. Getting all 3 unlocks bonus levels.
- **Why:** Adds replayability and optional challenge for completionists.
- **Interaction:** Some crystals only accessible via specific time manipulation sequences.
- **State:** Collection status persists across sessions (localStorage). Level completion tracked separately.

### 4. Art & Visual Style

#### Pixel Art
- **Aesthetic:** Clean, geometric, with subtle glowing effects for time manipulation.
- **Resolution:** 16×16 base tiles, 32×32 for player character.
- **Color Palette:** Cool blues and purples (time theme), warm accents for collectibles.
- **Asset Count (MVP):**
  - Tiles: 6 (solid, breakable, moving, timed, ice, portal)
  - Characters: 1 (player, 4 animation states)
  - VFX: 3 (rewind sparkle, pause overlay, fast-forward trail)
  - UI: basic HUD (energy bar, crystal counter, timer)
- **Tool:** Aseprite
- **Reference:** Baba Is You (clean grid), Celeste (tight feel)

### 5. Audio & Music Strategy

#### Music
- **Style:** Ambient electronic, 80-100 BPM. Time-themed (clock ticks, reversed audio snippets).
- **Layers:** Base synth pad + rhythmic tick layer. Rewind triggers reversed audio.
- **Tool:** Web Audio API (procedural)
- **Duration (MVP):** 1 main loop (~20 seconds), rewind/pause variations

#### SFX
- **Approach:** Procedural Web Audio API
- **Key Sounds:**
  - Move: soft click
  - Rewind: reversed whoosh
  - Pause: low hum
  - Crystal collect: ascending chime
  - Level complete: satisfying sequence
- **Tool:** Web Audio API

### 6. Game Loop & Progression

#### Per-Run Loop
1. **Setup:** Select level from world map.
2. **Gameplay Loop:**
   - Move on tile grid (arrow keys / WASD)
   - Use time abilities (R = rewind, P = pause, F = fast-forward)
   - Collect crystals, reach exit tile
3. **End Condition:** Reach exit tile OR run out of energy (retry)
4. **Results:** Stars awarded (1 = complete, 2 = under par time, 3 = all crystals)

#### Meta-Progression
- **What Persists:** Level completions, crystal collection, best times, unlocked worlds.
- **Unlock Pattern:** Complete 5/8 levels in a world to unlock the next world.
- **Pacing:** New mechanic introduced every world (5 worlds, 8 levels each = 40 levels MVP).

### 7. Technical Architecture

#### Engine / Framework
- **Choice:** Pixi.js (2D WebGL renderer with Canvas fallback)
- **Why:** Lightweight, fast tile rendering, good animation support.
- **Key Dependencies:** Pixi.js v7, howler.js (audio fallback)

#### Performance Targets (MVP)
- **FPS:** 60 on desktop, 30+ on mobile
- **Memory:** <30 MB
- **Startup Time:** <2 seconds
- **File Size:** <5 MB total

#### Multiplayer / Backend
- **Local Only:** Yes
- **Cloud Save:** localStorage only
- **API:** None

### 8. Content & Scope

#### MVP (Must Have)
- Tile grid movement system
- 3 time manipulation abilities (rewind, pause, fast-forward)
- 20 levels across 3 worlds
- Crystal collection system
- Level select / world map
- Energy system for rewind
- Basic particle effects for time abilities

#### Post-MVP (Nice to Have)
- 20 additional levels (worlds 4-5)
- Speed-run timer and leaderboard
- Level editor
- Color-blind mode

#### Stretch (Experimental)
- Time-split mechanic (create temporal clone)
- Daily challenge levels

### 9. Success Criteria & Testing

#### Functional Requirements
- [ ] Player moves correctly on tile grid (no clipping through solid tiles)
- [ ] Rewind restores previous 20 states accurately
- [ ] Pause freezes all moving elements for 5 seconds
- [ ] Crystals persist in localStorage across sessions
- [ ] All 20 MVP levels completable without bugs

#### Quality Gates
- Performance: 60 FPS sustained on Chrome desktop
- Accessibility: Full keyboard controls, clear visual feedback for all actions
- Playtesting: 3+ sessions, average level completion 5-10 minutes

#### Known Issues / Blockers
- **Blocking Unknown: Time-rewind memory cost.** Impact: Storing 20 tile states per level may exceed memory budget on mobile. Mitigation: Test with compressed state snapshots; fall back to 10 states if needed.
- **Blocking Unknown: Pause interaction edge cases.** Impact: Pausing while on a moving tile creates ambiguous state. Mitigation: Player snaps to nearest stable tile on pause.

### 10. Dependencies & Critical Path

#### Critical Path
1. **Design Phase (1-2 days):** Finalize tile types, time ability rules, level design language
2. **Prototype Phase (2-3 days):** Single level with movement + rewind working
3. **Core Implementation (4-6 days):** All mechanics + 20 levels + progression
4. **Polish & Testing (2-3 days):** VFX, audio, playtesting, bug fixes

#### Blocking Dependencies
- Time manipulation system design blocks level design (levels depend on ability rules)
- Tile state serialization blocks rewind feature (must define state format first)
