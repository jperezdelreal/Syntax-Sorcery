# GDD→Issue Mapping Specification

**For:** Trinity (Full-Stack Agent) building the GDD→Issue autonomous pipeline  
**Purpose:** Define exactly how each GDD section and field converts to GitHub Issues  
**Status:** Machine-executable specification  
**Last Updated:** 2026-03-14

---

## Quick Reference: Section → Issue Type Mapping

| GDD Section | Issue Type | Labels | Priority | Count | Parent Epic |
|---|---|---|---|---|---|
| High Concept | Epic | `type:epic`, `component:design` | P1 | 1 | {game} |
| Design Pillars | Reference only | N/A (no issue) | N/A | 0 | — |
| Core Mechanics | Feature tasks | `type:feature`, `component:gameplay` | P0 (unknowns), P1 (known) | 1/mechanic | High Concept Epic |
| Art & Visual Style | Asset/design task | `type:asset` or `type:design`, `component:art` | P1 | 1 category | High Concept Epic |
| Audio & Music Strategy | Audio task | `type:audio`, `component:audio` | P2 (if procedural), P1 (if sampled) | 1 | High Concept Epic |
| Game Loop & Progression | Feature tasks | `type:feature`, `component:gameplay` | P0, P1 | 2 tasks (per-run + meta) | High Concept Epic |
| Technical Architecture | Design task | `type:technical`, `component:architecture` | P0 | 1 | High Concept Epic |
| Content & Scope | Feature tasks | `type:feature`, `priority:p0` (MVP), `priority:p1` (post-MVP), `priority:p2` (stretch) | Varies | N | High Concept Epic |
| Success Criteria & Testing | QA task + checklist | `type:qa`, `component:testing`, `priority:p0` | P0 | 1–2 | High Concept Epic |
| Dependencies & Critical Path | Milestone tasks | `type:milestone`, `priority:p0` | P0 | 1 per phase | High Concept Epic |

---

## Detailed Parsing Rules

### Step 1: Parse YAML Frontmatter

Extract these fields for every issue:

```yaml
title: "{Game Title}"
status: "initial|vision|draft|final|archived"
designer: "{Primary Designer Name}"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
version: "1.0"
genre: "{Primary Genre}"
platforms: ["web-browser", "desktop", "mobile"]
target_audience: "{Age Range}, {Player Type}"
core_loop_duration_minutes: "{20-40}"
mvp_scope: "high|medium|low"
estimated_team_size: "{2-5}"
tech_stack: ["html5-canvas", "webgl", "pixi.js", ...]
design_pillars_count: "{Number}"
mechanic_types: ["movement", "combat", "puzzle", ...]
art_required: "none|low|medium|high"
audio_required: "none|procedural|sample-based|custom"
blocking_unknowns: "{List or 'none'}"
has_combat_system: false|true
has_multiplayer: false|true
requires_3d: false|true
```

**For every issue derived from this GDD:**
- Add label: `gdd-source:{game-slug}` (e.g., `gdd-source:flora`)
- Add label: `game:{game-title-kebab}` (e.g., `game:flora`)
- Set created_at = GDD `created_date`
- Set body prefix with: `**GDD Version:** {version} | **Designer:** {designer}`

---

### Step 2: Create Epic for "High Concept"

**Trigger:** If GDD status ≠ "archived"

**Epic Issue:**
- **Title:** `[Epic] Game: {title}` (e.g., `[Epic] Game: Flora`)
- **Description:** 
  ```markdown
  # High Concept
  
  **Genre:** {genre}  
  **Platforms:** {platforms}  
  **Target Audience:** {target_audience}  
  **Core Loop:** {core_loop_duration_minutes} minutes  
  
  **Vision:**  
  {High Concept section from GDD verbatim}
  
  ---
  
  ## Scope
  - **MVP Scope:** {mvp_scope}
  - **Estimated Team Size:** {estimated_team_size}
  - **Tech Stack:** {tech_stack list}
  - **Design Pillars:** {design_pillars_count}
  - **Blocking Unknowns:** {blocking_unknowns}
  ```

- **Labels:**
  - `type:epic`
  - `component:design`
  - `game:{game-slug}`
  - `gdd-source:{game-slug}`
  - If `status: "initial"` → `status:exploratory`
  - If `status: "draft"` → `status:planning`
  - If `status: "final"` → `status:ready`
  - If `has_combat_system: true` → `has:combat`
  - If `has_multiplayer: true` → `has:multiplayer`
  - If `requires_3d: true` → `requires:3d`
  - If `art_required: high` → `art:high-fidelity`
  - If `art_required: medium` → `art:stylized`
  - If `audio_required: custom` → `audio:custom-composition`

- **Priority:** Always `priority:p0` (epics are always top-level)

- **Assignee Suggestion:** `{designer}` if known team member, else unassigned

---

### Step 3: Parse "Design Pillars" (NO ISSUES CREATED)

**Trigger:** Section exists

**Action:** Extract as metadata (referenced in PR reviews, decision logs). NO GitHub issue created.

**Store as:**
```json
{
  "game": "{game-slug}",
  "design_pillars": [
    { "name": "Pillar 1", "rationale": "..." },
    { "name": "Pillar 2", "rationale": "..." },
    ...
  ]
}
```

**Used for:** Policy check in code review automation. Any PR that violates a pillar should be flagged `needs-review:pillar-alignment`.

---

### Step 4: Parse "Core Mechanics" (Feature Issues)

**Trigger:** H4 header exists (e.g., `#### Plant Growth & Synergy`)

**Per mechanic:**

1. **Extract fields:**
   - `What:` → **Summary** (for issue title + description body)
   - `Why:` → **Rationale** (add to issue description)
   - `Interaction:` → **Dependencies** (link related issues)
   - `State:` → **Design note** (add to description under "State Management")
   - Check if section contains phrase "Blocking Unknown:" → Flag as P0

2. **Create Task Issue:**
   - **Title:** `Implement {Mechanic Name}` (e.g., `Implement Plant Growth & Synergy`)
   - **Description:**
     ```markdown
     ## Overview
     {What} section verbatim
     
     ## Why This Matters
     {Why} section verbatim
     
     ## Design Details
     - **Interactions:** {Interaction} section verbatim
     - **State Management:** {State} section verbatim
     
     ## Acceptance Criteria
     - [ ] System implemented in code
     - [ ] Integrated with referenced mechanics
     - [ ] Playtested (runs for ≥1 full cycle)
     - [ ] No blocking unknowns remain (or documented as post-MVP)
     ```

   - **Labels:**
     - `type:feature`
     - `component:gameplay`
     - `game:{game-slug}`
     - `gdd-source:{game-slug}`
     - If "Blocking Unknown" in section → `priority:p0`, `needs:research`
     - Else → `priority:p1`

   - **Parent:** Link to Epic with "is-part-of" relationship

   - **Blocking Dependencies:** If `Interaction` mentions other mechanics, create link: "is-blocked-by: Implement {Other Mechanic}"

---

### Step 5: Parse "Art & Visual Style" (Asset/Design Issues)

**Trigger:** Section exists

**Case 1: art_required = "high"**
- Create **Epic:** `Art Sprint: {game-title}`
  - Description: Entire Art section
  - Labels: `type:epic`, `component:art`, `game:{game-slug}`, `priority:p1`

- For each asset category in "Asset Count (MVP)" (e.g., "Tiles: 8"):
  - Create **Task Issue:**
    - **Title:** `Create {Asset Type}` (e.g., `Create Tiles (8 base, 3+ seasonal variants)`)
    - **Description:**
      ```markdown
      ## Asset Details
      - **Type:** {Asset Type}
      - **Count (MVP):** {Count}
      - **Resolution:** {e.g., 16×16}
      - **Animation States:** {e.g., 3 (seed, grow, mature)}
      - **Color Palette:** {Palette hex codes or reference}
      
      ## References
      {Reference games/artists}
      
      ## Acceptance Criteria
      - [ ] All {Count} assets created
      - [ ] All animation states complete
      - [ ] Color palette matches spec
      - [ ] Integrated into game (testable in-engine)
      ```
    - **Labels:** `type:asset`, `component:art`, `game:{game-slug}`, `priority:p1`
    - **Parent:** Art Sprint Epic

**Case 2: art_required = "medium" or "low"**
- Create single **Task Issue:**
  - **Title:** `Art Specification: {game-title}` (or `Placeholder Art` if low)
  - **Description:** Entire Art section
  - **Labels:** `type:design` (or `type:asset` if creating assets), `component:art`, `priority:p1`

**Case 3: art_required = "none"**
- No issue created (art out of scope)

---

### Step 6: Parse "Audio & Music Strategy"

**Trigger:** Section exists AND `audio_required ≠ "none"`

**Case 1: audio_required = "procedural"**
- Create **Task Issue:**
  - **Title:** `Audio Design (Procedural): {game-title}`
  - **Description:**
    ```markdown
    ## Audio Strategy
    {Audio section verbatim}
    
    ## Procedural Approach
    - Tool: {e.g., Web Audio API}
    - No external files required
    - Key SFX: {List}
    
    ## Acceptance Criteria
    - [ ] All key SFX generated via {tool}
    - [ ] Audio loops seamlessly
    - [ ] SFX feedback clear on gameplay events
    - [ ] File size < {target MB}
    ```
  - **Labels:** `type:audio`, `component:audio`, `game:{game-slug}`, `priority:p2` (optional for MVP)

**Case 2: audio_required = "sample-based" or "custom"**
- Create **Epic:** `Audio Production: {game-title}`
  - Sub-issues for:
    1. `Compose Music`
    2. `Produce SFX`
  - **Labels:** `type:epic`, `component:audio`, `priority:p1` (music core to UX)

**Case 3: audio_required = "none"**
- No issue created

---

### Step 7: Parse "Game Loop & Progression"

**Trigger:** Section exists

**Create 2 Task Issues:**

**Issue 1: Per-Run Loop**
- **Title:** `Implement Per-Run Loop: {game-title}`
- **Description:**
  ```markdown
  ## Loop Structure
  {Per-Run Loop section verbatim}
  
  ## Implementation Requirements
  - Setup phase: {detail}
  - Repeating loop: {detail}
  - End conditions: {detail}
  - Results calculation: {detail}
  
  ## Acceptance Criteria
  - [ ] Full 1 run completes end-to-end
  - [ ] All loop steps execute in order
  - [ ] End condition triggers correctly
  - [ ] Results displayed to player
  ```
- **Labels:** `type:feature`, `component:gameplay`, `priority:p0`, `game:{game-slug}`
- **Parent:** Epic (High Concept)

**Issue 2: Meta-Progression System**
- **Title:** `Implement Meta-Progression: {game-title}`
- **Description:**
  ```markdown
  ## Progression Model
  {Meta-Progression section verbatim}
  
  ## Persistent State
  - What persists: {list}
  - Storage method: {e.g., localStorage}
  - Unlock triggers: {formulas}
  
  ## Acceptance Criteria
  - [ ] Unlocks persist across runs
  - [ ] Unlock timing matches spec
  - [ ] Player sees unlock notifications
  - [ ] Progression speed feels rewarding (playtesting ≥3 sessions)
  ```
- **Labels:** `type:feature`, `component:progression`, `priority:p1`, `game:{game-slug}`
- **Parent:** Epic

**Blocking Dependency:** Meta-Progression is-blocked-by Per-Run Loop

---

### Step 8: Parse "Technical Architecture"

**Trigger:** Section exists

**Create Task Issue:**
- **Title:** `Architecture Design: {game-title}`
- **Description:**
  ```markdown
  ## Technology Stack
  - Engine: {e.g., Canvas 2D}
  - Framework: {e.g., Vanilla JS + Pixi.js}
  - Key Dependencies: {list}
  - Why: {Rationale from GDD}
  
  ## Performance Targets (MVP)
  - FPS: {target}
  - Memory: {target MB}
  - Startup Time: {target sec}
  - File Size: {target MB}
  
  ## Infrastructure
  - Multiplayer: {Yes/No}
  - Backend: {Yes/No}
  - Cloud Save: {Yes/No}
  
  ## Implementation Plan
  1. {Step 1}
  2. {Step 2}
  ...
  
  ## Acceptance Criteria
  - [ ] Architecture document approved
  - [ ] Technology choices tested for performance
  - [ ] Build pipeline set up
  - [ ] Performance targets achievable (prototype)
  ```
- **Labels:** `type:technical`, `component:architecture`, `priority:p0`, `game:{game-slug}`
- **Parent:** Epic
- **Blocking:** Per-Run Loop, Core Mechanics (architecture must define first)

---

### Step 9: Parse "Content & Scope"

**Trigger:** Section exists

**For MVP items:**
- Create **Task Issue** per item:
  - **Title:** `Feature: {Feature Name}`
  - **Description:** Feature details + acceptance criteria
  - **Labels:** `type:feature`, `priority:p0`, `game:{game-slug}`
  - **Parent:** Epic

**For Post-MVP items:**
- Create **Task Issue** per item:
  - **Title:** `Feature (Post-MVP): {Feature Name}`
  - **Labels:** `type:feature`, `priority:p1`, `game:{game-slug}`
  - **Parent:** Epic

**For Stretch items:**
- Create **Research Issue** per item:
  - **Title:** `Exploration: {Feature Name}`
  - **Labels:** `type:research`, `priority:p2`, `game:{game-slug}`
  - **Parent:** Epic

---

### Step 10: Parse "Success Criteria & Testing"

**Trigger:** Section exists

**Create 1–2 Test Issues:**

**Issue 1: Functional Requirements Checklist**
- **Title:** `Testing: {game-title} Functional Requirements`
- **Description:**
  ```markdown
  ## Functional Requirements
  {All - [ ] items from GDD section}
  
  ## Verification Steps
  {All numbered steps from GDD section}
  ```
- **Type:** Task with checkboxes
- **Labels:** `type:qa`, `component:testing`, `priority:p0`, `game:{game-slug}`
- **Parent:** Epic

**Issue 2: Quality Gates & Known Issues** (if blockers exist)
- **Title:** `Testing: {game-title} Quality Gates & Blockers`
- **Description:**
  ```markdown
  ## Quality Gates
  {Quality Gates section verbatim}
  
  ## Known Blocking Issues
  {Known Issues section verbatim}
  
  ## Investigation Tasks
  {Create sub-issue for each blocker}
  ```
- **Labels:** `type:qa`, `component:testing`, `priority:p0`, `game:{game-slug}`
- **Parent:** Epic

**For each "Blocking Unknown":**
- Create **Research Issue:**
  - **Title:** `Investigation: {Blocker Name}`
  - **Description:** Impact + mitigation plan from GDD
  - **Labels:** `type:research`, `priority:p0`, `needs:prototype`, `game:{game-slug}`
  - **Parent:** Functional Requirements issue

---

### Step 11: Parse "Dependencies & Critical Path"

**Trigger:** Section exists

**Create 1 Milestone Epic + Phase Issues:**

**Milestone Epic:**
- **Title:** `[Milestone] {game-title} Development Path`
- **Description:**
  ```markdown
  ## Critical Path
  {All phases verbatim}
  
  ## Dependencies
  {All blocking dependencies verbatim}
  
  ## Execution Order
  See phase tasks below.
  ```
- **Labels:** `type:milestone`, `priority:p0`, `game:{game-slug}`

**For each phase in Critical Path:**
- Create **Phase Task:**
  - **Title:** `Phase: {Phase Name}` (e.g., `Phase: Design Phase`)
  - **Description:** Tasks listed in phase + estimated duration
  - **Labels:** `type:milestone`, `priority:p0`, `game:{game-slug}`
  - **Parent:** Milestone Epic
  - **Blocking:** Link as "is-blocked-by" if dependencies noted

**Link Blocking Dependencies:**
- For each "blocks" relationship, create GitHub Issue Link: `{Task A} blocks {Task B}`

---

## Auto-Labeling Rules (Applied to All Issues)

| Condition | Auto-Add Labels |
|---|---|
| Any field `status: "initial"` | `status:exploratory` |
| Any field `status: "draft"` | `status:planning` |
| Any field `status: "final"` | `status:ready` |
| Any field `mvp_scope: "high"` | `scope:large` |
| Any field `mvp_scope: "medium"` | `scope:medium` |
| Any field `mvp_scope: "low"` | `scope:small` |
| Any field `estimated_team_size > 4` | `needs:collaboration` |
| Title contains "Blocking Unknown" | `priority:p0`, `needs:research` |
| Title contains "Performance" | `component:performance`, `priority:p1` |
| Any section mentions "unknown", "TBD", "TBD" | `needs:research`, flag for investigation phase |

---

## Post-Creation Workflow (Trinity's Responsibilities)

After creating all issues:

1. **Link Relationships:**
   - All feature/asset/audio tasks → parent Epic
   - Blocking dependencies → "is-blocked-by" GitHub links
   - Research tasks → linked to parent testing issue

2. **Validate Completeness:**
   - [ ] All GDD sections processed
   - [ ] All H3 sections have corresponding issues (except Design Pillars)
   - [ ] All H4 sub-sections have corresponding task issues
   - [ ] All checklists attached to appropriate issue
   - [ ] No orphaned sections

3. **Sort & Prioritize:**
   - P0 tasks first (blockers, unknowns, critical path)
   - P1 tasks after (MVP scope)
   - P2 tasks last (post-MVP, exploration)

4. **Notify Designer:**
   - Tag {designer} in Epic issue with summary of derived issues
   - Example: `@{designer} GDD converted to {X} issues. See linked tasks. Please review blockers (marked P0).`

5. **Archive GDD Source:**
   - After issues created, GDD markdown file remains in `/docs/games/{slug}.gdd.md`
   - Link to GDD file in Epic description for future reference

---

## Error Handling & Edge Cases

### Missing Sections
If a GDD is missing section(s):
- **Missing Core Mechanics:** Warn + create placeholder issue `Design: Core Mechanics for {game}`
- **Missing Technical Architecture:** Warn + create placeholder `Design: Technical Architecture`
- **Missing Success Criteria:** Warn + create generic testing issue `Testing: {game-title} (requirements TBD)`

### Malformed YAML
- Default to all P1 priorities
- Use game title from "title:" field only
- Warn: "Metadata incomplete—using defaults"

### Empty Sections (no content, only header)
- Skip (no issue created)

### Duplicate H4 Headers
- Create issues for all instances; Trinity will deduplicate later (flag for manual review)

---

## Implementation Checklist for Trinity

- [ ] Parse YAML frontmatter → extract to metadata object
- [ ] Create Epic issue from "High Concept"
- [ ] Loop through H3 sections (skip Design Pillars)
- [ ] For each H3, loop through H4 sub-sections
- [ ] Create task/feature/asset/audio issue per H4 (per rules above)
- [ ] Extract all checklist items (- [ ]) → attach to parent issue
- [ ] Apply auto-labels per rules
- [ ] Create blocking relationships for dependencies
- [ ] Link all issues to parent Epic
- [ ] Validate completeness
- [ ] Post notification to designer
- [ ] Return JSON report: `{ game, epic_id, issues_created: [{id, title, type, labels}], warnings: [] }`

---

## Testing the Pipeline (Pre-Launch)

1. **Test on Flora GDD:** `docs/games/flora.gdd.md` (exists in FFS)
   - Expected output: 1 epic + ~25 issues (design, art, audio, features, testing, phases)
   - Spot-check: Art Sprint epic has N sub-issues per asset category
   - Spot-check: All MVP features marked P0

2. **Test on Minimal GDD:** Create 2-section stub (just High Concept + Core Mechanics)
   - Expected output: 1 epic + 1–2 feature issues
   - No errors/warnings

3. **Test Edge Cases:**
   - Missing YAML → defaults applied
   - Missing Critical Path section → skip gracefully
   - Empty Content & Scope section → no issues created

---

## Success Criteria (Pipeline Complete)

✅ GDD markdown → Full GitHub Issue tree without human touch  
✅ Labels auto-derived from YAML + sections  
✅ Priorities assigned (P0 for blockers, P1 for MVP, P2 for post-MVP)  
✅ Blocking dependencies linked  
✅ Designer notified with summary  
✅ All 10 GDD sections map to issues (or explicitly skipped)  
✅ <30 sec parsing time for typical GDD (~5KB file)  
✅ Zero data loss (every GDD detail appears in an issue)  

---

## Example Trace: Flora GDD → Issues

**Input:** `docs/games/flora.gdd.md` (FFS repo)

**Process:**
1. Parse YAML → title: "Flora", status: "draft", designer: "Yoda", art_required: "high"
2. Create Epic: `[Epic] Game: Flora` with labels `type:epic`, `component:design`, `game:flora`, `status:planning`
3. Design Pillars section → skip (no issue)
4. Core Mechanics section:
   - H4: "Plant Growth & Synergy" → Issue: `Implement Plant Growth & Synergy`, labels: `type:feature`, `component:gameplay`, `priority:p1`
   - H4: "Weather System" → Issue: `Implement Weather System`, P0 (if "Blocking Unknown"), else P1
   - H4: "Pest & Hazard System" → Issue: `Implement Pest & Hazard System`, P1
5. Art & Visual Style:
   - art_required: "high" → Create Epic: `Art Sprint: Flora`
   - H4: "Pixel Art" → Create sub-issues:
     - `Create Tiles (8 base + seasonal)`
     - `Create Plants (12 types × 3 growth states)`
     - `Create Weather VFX (4 types)`
     - `Create UI Assets`
6. Audio & Music:
   - audio_required: "procedural" → Issue: `Audio Design (Procedural): Flora`, P2
7. Game Loop & Progression:
   - Issue: `Implement Per-Run Loop: Flora`, P0
   - Issue: `Implement Meta-Progression: Flora`, P1
8. Technical Architecture:
   - Issue: `Architecture Design: Flora`, P0
9. Content & Scope:
   - MVP features → 8 issues, P0
   - Post-MVP features → 5 issues, P1
   - Stretch features → 2 issues, P2
10. Success Criteria & Testing:
    - Issue: `Testing: Flora Functional Requirements` (checklist with N items), P0
    - Issue: `Testing: Flora Quality Gates & Blockers`, P0 (if blocking unknowns exist)
11. Dependencies & Critical Path:
    - Milestone Epic: `[Milestone] Flora Development Path`
    - 4 phase task issues (Design, Prototype, Core, Polish)

**Output:**
- 1 Epic (High Concept)
- 1 Epic (Art Sprint)
- 1 Epic (Milestone)
- 3 Core Mechanics issues
- 4–5 Art Sub-task issues
- 1 Audio issue
- 2 Game Loop issues
- 1 Architecture issue
- 15 Content issues (MVP + Post-MVP + Stretch)
- 2 Testing issues
- 4 Phase milestone issues

**Total: ~37 issues** auto-derived from GDD, zero human touch.
