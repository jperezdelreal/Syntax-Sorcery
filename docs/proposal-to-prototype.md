# Proposal → Prototype: End-to-End Autonomous Workflow

> **Author:** Morpheus (Lead/Architect)  
> **Date:** 2026-03-15  
> **Status:** Architecture — Ready for Implementation  
> **Task:** P1-11  
> **Tier:** T1

---

## Overview

Six-stage pipeline that transforms a plain-text game proposal into a playable prototype deployed on GitHub Pages — zero human input required. Each stage has explicit input/output contracts, quality gates, and failure handling.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Stage 0    │     │  Stage 1    │     │    Stage 2      │
│  PROPOSAL   │────▶│  GDD GEN    │────▶│  ISSUE DECOMP   │
│  (text)     │     │  (AI fill)  │     │  (existing)     │
└─────────────┘     └─────────────┘     └─────────────────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────────┐
                    │  Stage 5    │     │    Stage 3      │
                    │  DEPLOY     │◀────│  IMPLEMENTATION │
                    │  (Pages)    │     │  (@copilot)     │
                    └─────────────┘     └──────┬──────────┘
                          ▲              ┌─────▼──────────┐
                          │              │    Stage 4      │
                          └──────────────│  BUILD          │
                                         │  (GHA)          │
                                         └────────────────┘
```

---

## State Machine

Each game has a **tracking issue** (the Epic from Stage 2) that carries the pipeline state via labels. Ralph monitors these labels.

```
pipeline:proposal → pipeline:gdd → pipeline:issues → pipeline:implementing → pipeline:building → pipeline:deployed
```

Failure at any stage applies `pipeline:blocked` + `pipeline-fail:{stage}`. Ralph escalates after 2 cycles without progress.

---

## Stage 0: PROPOSAL

### Purpose
Capture a game idea as structured input. The minimum viable seed for the entire pipeline.

### Input Contract
**Format:** Markdown file with YAML frontmatter  
**Location:** `docs/proposals/{game-slug}.proposal.md`  
**Minimum fields:**

```yaml
---
title: "Game Title"
slug: "game-slug"
genre: "puzzle|platformer|card|roguelite|arcade|strategy|other"
platforms:
  - "web-browser"
target_session_minutes: 20
---
```

**Body:** Free-text description of the game idea. Minimum 50 words, maximum 500. Must describe:
- What the player does (core loop)
- What makes it interesting (hook)
- Visual style hint (pixel art, minimalist, etc.)

### Output Contract
- File: `docs/proposals/{game-slug}.proposal.md` committed to `main`
- Tracking label: `pipeline:proposal` applied to any associated issue

### Triggering Mechanism
- **Primary:** File committed to `docs/proposals/` on `main` branch
- **Alternative:** GitHub Issue created with label `proposal` (body = proposal text; GHA workflow extracts and writes the file)

### Quality Gate
1. YAML frontmatter parses without error
2. Required fields present: `title`, `slug`, `genre`, `platforms`
3. Body ≥ 50 words
4. `slug` is valid kebab-case, unique (no existing `docs/gdds/{slug}.md`)

### Failure Handling
- Validation failure → Issue created: "Proposal Validation Failed: {title}" with `pipeline:blocked` label
- Missing fields → Comment on issue listing missing fields, label `needs-info`

### Who Executes
- **Human** (joperezd) — for founder-originated ideas
- **Oracle** (Squad agent) — for AI-generated game concepts in autonomous mode
- **External trigger** — future: API endpoint or Discord command

---

## Stage 1: GDD GENERATION

### Purpose
Transform the minimal proposal into a complete, machine-parseable GDD following `docs/gdd-template.md`.

### Input Contract
- File: `docs/proposals/{game-slug}.proposal.md` (validated by Stage 0 gate)
- Reference: `docs/gdd-template.md` (10-section template with YAML frontmatter spec)

### Output Contract
- File: `docs/gdds/{game-slug}.md` — full GDD with all 10 sections populated
- PR: `gdd/{game-slug}` branch → `main`, auto-created
- YAML frontmatter: All fields from template filled (genre, platforms, mechanic_types, art_required, audio_required, etc.)
- All 10 sections present with content (not placeholders)

### Triggering Mechanism
**GitHub Actions workflow:** `proposal-to-gdd.yml`
- Trigger: push to `docs/proposals/**/*.proposal.md` on `main`
- Alternative: `workflow_dispatch` with `proposal_file` input

### Process
```
1. Read proposal file
2. Read gdd-template.md as structural reference
3. Call @copilot (via GitHub Copilot coding agent) to generate full GDD:
   - System prompt: "You are a game designer. Generate a complete GDD..."
   - Input: proposal text + template structure
   - Output: complete markdown GDD
4. Validate generated GDD (all 10 H3 sections present, YAML valid)
5. Write to docs/gdds/{slug}.md
6. Create PR: gdd/{slug} → main
7. Auto-merge if validation passes (or request review if validation fails)
```

### Quality Gate
1. YAML frontmatter valid and complete (all required fields)
2. All 10 H3 sections present: High Concept, Design Pillars, Core Mechanics, Art & Visual Style, Audio & Music Strategy, Game Loop & Progression, Technical Architecture, Content & Scope, Success Criteria & Testing, Dependencies & Critical Path
3. Each section has substantive content (not empty, not placeholder text)
4. At least 3 Core Mechanics defined (H4 sub-sections)
5. MVP scope section has ≥ 5 items
6. Technical Architecture specifies `web-browser` compatible stack

### Failure Handling
- AI generation fails → Retry once with simplified prompt
- Validation fails → Create issue "GDD Generation Incomplete: {title}" listing missing sections, label `pipeline:blocked`, `pipeline-fail:gdd-gen`
- After 2 retries → Escalate to Oracle for manual GDD creation, label `needs-agent`

### Who Executes
- **GHA Workflow** + **@copilot** (Copilot coding agent for content generation)
- **Fallback:** Oracle (Squad agent) for manual intervention

### Implementation Detail — GDD Generation Script

New script: `scripts/proposal-to-gdd.js`

```
Usage: node scripts/proposal-to-gdd.js --proposal <path> [--dry-run]

1. Parse proposal YAML + body
2. Build prompt from template + proposal
3. Write GDD to docs/gdds/{slug}.md
4. Validate output structure
5. Return JSON report: { slug, sections_found, validation_passed, output_path }
```

The heavy lifting (AI content generation) happens via @copilot assigned to a generated issue, or via the Copilot API in GitHub Actions. The script handles structure/validation.

---

## Stage 2: ISSUE DECOMPOSITION

### Purpose
Convert the GDD into a structured GitHub Issue tree. **Already built** (P1-10b).

### Input Contract
- File: `docs/gdds/{game-slug}.md` — validated GDD (merged to `main`)
- Must follow `docs/gdd-template.md` format exactly

### Output Contract
- GitHub Issues: Full issue tree (Epic + feature/task/asset/audio/testing issues)
- Labels: Auto-derived from YAML and section types (see `docs/gdd-issue-mapping.md`)
- Typical output: 25–40 issues per GDD
- Tracking label on Epic: `pipeline:issues`

### Triggering Mechanism
**Existing workflow:** `.github/workflows/gdd-to-issues.yml`
- Trigger: push to `docs/gdds/**/*.md` (excluding `examples/`)
- Alternative: `workflow_dispatch` with `gdd_file` + `dry_run` inputs

### Quality Gate
1. Script exits with code 0
2. Epic issue created with `type:epic` label
3. At least 10 issues created (minimum viable decomposition)
4. All P0 issues have `priority:p0` label
5. No duplicate issues (check by title prefix)

### Failure Handling
- Script failure → Issue created: "GDD→Issue Pipeline Failed: {game}" with `pipeline:blocked`
- Partial issue creation → Log which issues were created, retry remaining
- Already handled in `gdd-to-issues.js` with graceful degradation

### Who Executes
- **GHA Workflow** (automated, zero-touch)
- Script: `scripts/gdd-to-issues.js`

### Extension Required
Add to `gdd-to-issues.js`:
- Apply `pipeline:issues` label to the Epic issue after creation
- Output a `{slug}-issues.json` manifest listing all created issue numbers (for Stage 3 consumption)

---

## Stage 3: IMPLEMENTATION

### Purpose
Convert GitHub Issues into working game code. The most complex stage — orchestrates multiple coding agents.

### Input Contract
- GitHub Issues: Full issue tree from Stage 2
- Epic issue with `pipeline:issues` label
- Issue manifest: `.pipeline/{game-slug}/issues.json` (list of issue numbers, types, priorities)
- Target repo: `FirstFrameStudios/{game-slug}` (created if not exists)

### Output Contract
- Game source code in `FirstFrameStudios/{game-slug}` repository
- Working `index.html` at repo root (or build output to `dist/`)
- `package.json` if build step needed (optional — pure HTML/JS games skip this)
- All P0 issues closed with linked PRs
- Tracking label on Epic: `pipeline:implementing` → `pipeline:building` when P0 complete

### Triggering Mechanism
**GHA Workflow:** `implement-game.yml`
- Trigger: Issue labeled `pipeline:issues` on Epic
- Process: Orchestrator workflow that dispatches implementation

### Process — Implementation Orchestrator

```
Phase 1: REPO SETUP (Tank)
  ├── Create repo FirstFrameStudios/{slug} if not exists
  ├── Initialize with game template (index.html, style.css, game.js scaffold)
  ├── Configure GitHub Pages (main branch, / root)
  └── Add standard workflows (build.yml, deploy.yml)

Phase 2: ARCHITECTURE FIRST (@copilot)
  ├── Assign P0 architecture issue to @copilot
  ├── @copilot creates: project structure, core engine scaffold, game loop skeleton
  └── Gate: Architecture PR merged → proceed to features

Phase 3: FEATURE IMPLEMENTATION (@copilot, parallel)
  ├── For each P0 feature issue (sorted by dependency):
  │   ├── Assign to @copilot
  │   ├── @copilot creates branch, implements, opens PR
  │   └── Auto-merge if CI passes (Switch validates)
  ├── Parallel: Up to 3 issues simultaneously
  └── Gate: All P0 features merged

Phase 4: ASSETS & AUDIO (@copilot)
  ├── Generate placeholder/procedural art (Canvas drawing, CSS art, or SVG)
  ├── Generate procedural audio (Web Audio API)
  └── Gate: Game loads without 404s or missing asset errors

Phase 5: INTEGRATION (@copilot + Switch)
  ├── Integration test: game loads, core loop playable
  ├── Fix any integration issues
  └── Gate: Game runs end-to-end in browser
```

### Quality Gate
1. All P0 issues have linked, merged PRs
2. `index.html` exists and loads in browser (no JS errors)
3. Core game loop functional (start → play → end)
4. No build errors
5. Total bundle size < 10MB

### Failure Handling
- @copilot fails on issue → Retry with simplified prompt, then escalate to Trinity
- Build breaks → Revert last PR, re-attempt
- Integration failure → Create `bug:integration` issue, assign @copilot
- Stuck > 2 Ralph cycles → Label `pipeline:blocked`, `needs-agent`, escalate to Morpheus

### Who Executes
- **@copilot** — Primary implementer (assigned via GitHub Issues)
- **Trinity** — Complex integration, fallback for @copilot failures
- **Tank** — Repo setup, infrastructure
- **Switch** — PR review, quality validation
- **GHA Orchestrator Workflow** — Coordination and gating

### Implementation Strategy per Game Type

| Game Type | Engine | Build | Notes |
|-----------|--------|-------|-------|
| Puzzle | Canvas 2D / DOM | None (static) | Pure HTML/JS/CSS |
| Platformer | Canvas 2D | None or esbuild | May need sprite bundling |
| Card Game | DOM + CSS | None (static) | CSS animations |
| Roguelite | Canvas 2D | esbuild | Multiple source files |
| Arcade | Canvas 2D / WebGL | None or esbuild | Performance-sensitive |
| Strategy | DOM + Canvas | esbuild | Complex state management |

**Default stack decision:** HTML5 Canvas 2D + vanilla JS for MVP. No framework dependencies unless GDD specifies otherwise. This keeps builds simple and deployment trivial.

---

## Stage 4: BUILD

### Purpose
Compile/bundle game code into a deployable web artifact.

### Input Contract
- Source code in `FirstFrameStudios/{game-slug}` repository, `main` branch
- Either:
  - **Static game:** `index.html` + `*.js` + `*.css` at root → no build needed
  - **Bundled game:** `package.json` with `build` script → produces `dist/`

### Output Contract
- Deployable artifact in `dist/` (or root if static)
- `dist/index.html` exists and is valid HTML
- All referenced assets exist (no broken links)
- Bundle size report in PR comment

### Triggering Mechanism
**GHA Workflow:** `build-game.yml` in each game repo
- Trigger: Push to `main` branch
- Trigger: PR to `main` (for validation only — no deploy)

### Process
```
1. Detect build type:
   - If package.json exists AND has "build" script → npm ci && npm run build
   - If no package.json or no build script → copy root to dist/
2. Validate dist/index.html exists
3. Run basic checks:
   - HTML validation (no unclosed tags)
   - JS syntax check (no parse errors)
   - Asset reference check (all <img>, <script>, <link> targets exist)
4. Generate size report
5. Upload artifact (for deploy stage)
```

### Quality Gate
1. Build exits with code 0
2. `dist/index.html` exists
3. No JS syntax errors (quick `node --check` on .js files)
4. Total size < 10MB
5. No external CDN dependencies (fully self-contained for offline play)

### Failure Handling
- Build failure → Comment on PR with error log, label `build:failed`
- Size exceeded → Warning comment, not blocking (soft limit)
- Missing index.html → Hard fail, create issue "Missing index.html: {game}"

### Who Executes
- **GHA Workflow** (fully automated)
- Template workflow provided by Tank at repo creation

---

## Stage 5: DEPLOY

### Purpose
Make the game playable on a public URL via GitHub Pages.

### Input Contract
- Built artifact from Stage 4 (in `dist/` or root)
- GitHub Pages configured on the game repo

### Output Contract
- Game live at `https://firstframestudios.github.io/{game-slug}/`
- HTTP 200 on deployed URL
- Game loads and is interactive
- Epic issue labeled `pipeline:deployed`
- Comment on Epic with live URL

### Triggering Mechanism
**GHA Workflow:** `deploy-pages.yml` in each game repo
- Trigger: Successful completion of `build-game.yml` on `main`
- Uses: `actions/deploy-pages@v4` (official GitHub Pages deployment)

### Process
```
1. Build stage completes successfully
2. Upload pages artifact (actions/upload-pages-artifact)
3. Deploy to GitHub Pages (actions/deploy-pages)
4. Smoke test: curl deployed URL, verify 200
5. Update Epic issue:
   - Add label: pipeline:deployed
   - Remove label: pipeline:building
   - Comment: "🎮 Game deployed: https://firstframestudios.github.io/{slug}/"
6. Close Epic if all P0 issues resolved
```

### Quality Gate
1. HTTP 200 on `https://firstframestudios.github.io/{game-slug}/`
2. Response contains `<canvas>` or `<div id="game">` (game container present)
3. No mixed-content warnings (all resources relative)
4. Load time < 5 seconds on simulated 3G (optional, logged but not blocking)

### Failure Handling
- Deploy failure → Retry once (transient GitHub Pages issue)
- Smoke test failure → Label `deploy:failed`, create issue with deployment logs
- 404 after deploy → Check Pages settings, ensure source branch/path correct
- Rollback: Previous deployment remains until new successful deployment

### Who Executes
- **GHA Workflow** (fully automated)
- Pages configuration by Tank at repo setup (Stage 3, Phase 1)

---

## Cross-Stage Contracts

### File System Layout (per game)

```
Syntax-Sorcery/                          (this repo — pipeline orchestrator)
├── docs/proposals/{slug}.proposal.md    ← Stage 0 input
├── docs/gdds/{slug}.md                  ← Stage 1 output / Stage 2 input
├── .pipeline/{slug}/                    ← Pipeline state directory
│   ├── proposal.json                    ← Stage 0 metadata
│   ├── gdd-validation.json              ← Stage 1 gate result
│   ├── issues.json                      ← Stage 2 output manifest
│   └── status.json                      ← Current pipeline state
└── scripts/
    ├── proposal-to-gdd.js               ← NEW: Stage 1 script
    ├── gdd-to-issues.js                 ← EXISTING: Stage 2 script
    ├── validate-proposal.js             ← NEW: Stage 0 validation
    └── pipeline-orchestrator.js         ← NEW: Cross-stage coordinator

FirstFrameStudios/{slug}/                (game repo — created by pipeline)
├── index.html                           ← Game entry point
├── game.js                              ← Core game code
├── style.css                            ← Game styles
├── assets/                              ← Game assets (if any)
├── dist/                                ← Build output
├── package.json                         ← Optional (if build needed)
└── .github/workflows/
    ├── build.yml                        ← Stage 4
    └── deploy.yml                       ← Stage 5
```

### Pipeline State File: `.pipeline/{slug}/status.json`

```json
{
  "slug": "chrono-tiles",
  "title": "Chrono Tiles",
  "current_stage": "implementing",
  "stages": {
    "proposal": { "status": "complete", "timestamp": "2026-03-15T10:00:00Z" },
    "gdd": { "status": "complete", "timestamp": "2026-03-15T10:05:00Z", "pr": 42 },
    "issues": { "status": "complete", "timestamp": "2026-03-15T10:10:00Z", "issue_count": 31, "epic": 100 },
    "implementation": { "status": "in_progress", "p0_total": 8, "p0_closed": 5 },
    "build": { "status": "pending" },
    "deploy": { "status": "pending" }
  },
  "repo": "FirstFrameStudios/chrono-tiles",
  "pages_url": null,
  "blocked": false,
  "block_reason": null
}
```

### Label Taxonomy (Pipeline-Specific)

| Label | Meaning | Applied By |
|-------|---------|------------|
| `pipeline:proposal` | Game is in proposal stage | Stage 0 workflow |
| `pipeline:gdd` | GDD being generated | Stage 1 workflow |
| `pipeline:issues` | Issues created, ready for implementation | Stage 2 workflow |
| `pipeline:implementing` | Code being written | Stage 3 orchestrator |
| `pipeline:building` | Build in progress | Stage 4 workflow |
| `pipeline:deployed` | Game is live | Stage 5 workflow |
| `pipeline:blocked` | Stage failed, needs intervention | Any stage on failure |
| `pipeline-fail:gdd-gen` | GDD generation failed | Stage 1 |
| `pipeline-fail:implementation` | Implementation stuck | Stage 3 |
| `pipeline-fail:build` | Build failed | Stage 4 |
| `pipeline-fail:deploy` | Deployment failed | Stage 5 |

---

## Ralph Integration

Ralph monitors the pipeline via label presence on Epic issues.

### Ralph Monitoring Rules

```
Every cycle (configurable, default 30 min):
1. Query: issues with label pipeline:* in Syntax-Sorcery repo
2. For each game in pipeline:
   a. Check current_stage from status.json
   b. Check time_in_stage (from status.json timestamp)
   c. If time_in_stage > threshold for that stage → flag stale
   d. If pipeline:blocked → escalate

Thresholds:
  - proposal → gdd: 10 minutes (AI generation should be fast)
  - gdd → issues: 5 minutes (script execution)
  - issues → implementing: 2 hours (first @copilot assignment)
  - implementing (P0 complete): 24 hours (full implementation)
  - building: 10 minutes (CI build)
  - deploy: 10 minutes (Pages deployment)

Escalation:
  - Stale > 1.5× threshold → Comment on Epic: "⚠️ Stage {X} stale"
  - Stale > 3× threshold → Label pipeline:blocked, notify via issue mention
  - Blocked > 2 cycles → Create escalation issue, mention @morpheus
```

---

## Key Design Decisions

### D1: GDD Generation via @copilot in Issues

**Decision:** Use @copilot mention in a GitHub Issue to generate GDDs, not a custom AI API.

**Rationale:**
- @copilot is already available at zero cost (GitHub unlimited)
- No Azure spend for AI generation (budget preserved for game infra)
- @copilot understands markdown, can follow template instructions
- Issues provide natural audit trail for generated content
- If @copilot quality insufficient, Oracle can intervene manually

**Alternative considered:** Azure OpenAI API — rejected because it consumes €500/mo budget that's reserved for game infrastructure.

### D2: Per-Game Repository Model

**Decision:** Each game gets its own repo under `FirstFrameStudios/` org.

**Rationale:**
- Matches existing pattern (ComeRosquillas, Flora already separate repos)
- Independent GitHub Pages per game (clean URLs)
- Independent CI/CD (game failures don't affect other games)
- Independent issue tracking (game-specific backlogs)
- Repo template provides consistent structure

**Alternative considered:** Monorepo — rejected because Pages deployment becomes complex and game isolation is lost.

### D3: Static-First Build Strategy

**Decision:** Default to no-build (static HTML/JS/CSS). Only add build step if GDD specifies complex stack.

**Rationale:**
- Simplest deployment path (copy files → Pages)
- No build dependencies to break
- Fastest iteration cycle
- Canvas 2D + vanilla JS handles 80% of game types
- Build step opt-in via `package.json` presence

### D4: Label-Based State Machine

**Decision:** Pipeline state tracked via GitHub Issue labels on the Epic.

**Rationale:**
- Native to GitHub (no external state store)
- Queryable via `gh issue list --label`
- Visible in GitHub UI (human can see pipeline status)
- Ralph already monitors labels
- GHA workflows can trigger on label events

### D5: Pipeline Orchestrator in Syntax-Sorcery Repo

**Decision:** All pipeline logic lives in Syntax-Sorcery (this repo), not in game repos.

**Rationale:**
- Single source of truth for pipeline automation
- Game repos only contain game code + build/deploy workflows
- Upgrades to pipeline don't require updating every game repo
- Syntax-Sorcery is the "factory" — game repos are the "products"

---

## Implementation Tasks for Trinity

### Wave A: Foundation (No dependencies)

| ID | Task | Script/File | Estimate |
|----|------|-------------|----------|
| P1-11a | Proposal validation script | `scripts/validate-proposal.js` | 1h |
| P1-11b | Proposal-to-GDD workflow | `.github/workflows/proposal-to-gdd.yml` + `scripts/proposal-to-gdd.js` | 3h |
| P1-11c | Pipeline state manager | `scripts/pipeline-orchestrator.js` | 2h |
| P1-11d | Pipeline label set | Create labels via `gh label create` | 30m |

### Wave B: Orchestration (Depends on Wave A)

| ID | Task | Script/File | Estimate |
|----|------|-------------|----------|
| P1-11e | Game repo template | `FirstFrameStudios/.github-game-template/` | 2h |
| P1-11f | Implementation orchestrator workflow | `.github/workflows/implement-game.yml` | 4h |
| P1-11g | Extend `gdd-to-issues.js` — add pipeline labels + manifest output | `scripts/gdd-to-issues.js` | 1h |

### Wave C: Build & Deploy (Depends on Wave B)

| ID | Task | Script/File | Estimate |
|----|------|-------------|----------|
| P1-11h | Game build workflow (template) | Template: `.github/workflows/build.yml` | 1h |
| P1-11i | Game deploy workflow (template) | Template: `.github/workflows/deploy.yml` | 1h |
| P1-11j | Smoke test script | `scripts/smoke-test.js` | 1h |

### Wave D: Integration (Depends on all above)

| ID | Task | Script/File | Estimate |
|----|------|-------------|----------|
| P1-11k | Ralph pipeline monitoring rules | Ralph config update | 1h |
| P1-11l | End-to-end dry run (test game through full pipeline) | Integration test | 2h |

**Total estimated: ~20 hours of Trinity implementation time**

---

## Appendix: Workflow Files Summary

### New Workflows (Syntax-Sorcery repo)

1. **`proposal-to-gdd.yml`** — Triggers on `docs/proposals/` push, generates GDD
2. **`implement-game.yml`** — Triggers on `pipeline:issues` label, orchestrates implementation

### New Workflows (Game repo template)

3. **`build.yml`** — Triggers on push to `main`, builds game
4. **`deploy.yml`** — Triggers on successful build, deploys to Pages

### Existing Workflows (No changes needed)

5. **`gdd-to-issues.yml`** — Triggers on `docs/gdds/` push (Stage 2 — already built)

### Modified Scripts

6. **`gdd-to-issues.js`** — Add: pipeline label application, issues.json manifest output

### New Scripts

7. **`validate-proposal.js`** — Stage 0 quality gate
8. **`proposal-to-gdd.js`** — Stage 1 GDD generation + validation
9. **`pipeline-orchestrator.js`** — Cross-stage state management
10. **`smoke-test.js`** — Stage 5 deployment validation
