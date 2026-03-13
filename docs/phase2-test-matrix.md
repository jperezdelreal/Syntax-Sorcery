# Phase 2 Game Acceptance Test Matrix

> **Quality gate for the Proposal→Prototype pipeline.**
> A game is not ready until it passes every stage gate AND the game quality checklist.

---

## 1. Pipeline Stage Tests

Each stage has a **hard gate** (must pass to advance) and **soft checks** (warnings, won't block).

| Stage | What to Test | Pass ✅ | Fail ❌ | Automated? |
|-------|-------------|---------|---------|------------|
| **Proposal** | YAML frontmatter validity | YAML parses, `title`/`slug`/`genre`/`platforms` present, slug is kebab-case, body ≥ 50 words | Missing required fields, invalid YAML, slug not kebab-case, body < 50 words | ✅ `validate-proposal.js` |
| **Proposal** | Slug uniqueness | No existing GDD with same slug | Duplicate slug detected in `docs/gdds/` | ✅ `validate-proposal.js` |
| **Proposal** | Genre recognition | Genre in allowed list: `puzzle`, `platformer`, `card`, `roguelite`, `arcade`, `strategy`, `other` | Unsupported genre (warning, not blocking) | ✅ `validate-proposal.js` |
| **GDD** | Section completeness | All 10 sections present: High Concept, Design Pillars, Core Mechanics, Art & Visual Style, Audio & Music Strategy, Game Loop & Progression, Technical Architecture, Content & Scope, Success Criteria & Testing, Dependencies & Critical Path | Any section missing | ✅ GHA workflow |
| **GDD** | YAML frontmatter validity | All required GDD fields: `title`, `status`, `designer`, `genre`, `platforms`, `mvp_scope`, `tech_stack` | Missing fields, invalid YAML | ✅ GHA workflow |
| **GDD** | Testable requirements | Success Criteria section has `- [ ]` checklist items; at least 3 functional requirements | Vague requirements, no checklists, no acceptance criteria | ✅ Parseable |
| **GDD** | Quality gates defined | Quality Gates subsection present with measurable targets (FPS, accessibility, playtesting) | No quality gates or unmeasurable criteria | 🟡 Manual review |
| **Issues** | Issue decomposition | ≥ 1 Epic + ≥ 3 feature issues + ≥ 1 QA issue created | Zero issues, missing epic, no QA issue | ✅ `gdd-to-issues.js` |
| **Issues** | Label correctness | All issues have `game:{slug}` + `gdd-source:{slug}` labels; epics have `type:epic`; features have `type:feature` | Missing game labels, wrong type labels | ✅ `gdd-to-issues.js` |
| **Issues** | Dependency mapping | Blocking issues marked with `priority:p0`; `needs:research` on blocking unknowns; milestone issue links critical path | Circular dependencies, missing blockers | ✅ `gdd-to-issues.js` |
| **Issues** | Manifest output | `.pipeline/{slug}/issues.json` written with all created issues | Manifest missing or incomplete | ✅ `gdd-to-issues.js` |
| **Implementation** | Build success | `npm run build` (or equivalent) exits 0 | Build errors, missing dependencies | ✅ GHA workflow |
| **Implementation** | Runtime check | Game loads in browser without console errors | Runtime exceptions, import failures | ✅ GHA (`implement-game.yml`) |
| **Implementation** | Spec adherence | Core mechanics from GDD implemented; acceptance criteria from issues met | Missing mechanics, unfulfilled acceptance criteria | 🟡 Manual review |
| **Implementation** | Security | No hardcoded secrets, no unsafe `eval()`, CSP-compatible | Secrets in code, XSS vectors, unsafe patterns | ✅ Static analysis |
| **Build** | Zero errors | Build completes with exit code 0 | Any build error | ✅ GHA |
| **Build** | Assets bundled | All referenced assets (images, audio, fonts) included in output | Missing assets, broken references | ✅ GHA |
| **Build** | Bundle size | Total artifact < 10 MB (games should be lightweight web apps) | > 10 MB without justification | ✅ GHA (size check) |
| **Deploy** | Accessibility | Game accessible via GitHub Pages URL; HTTP 200 | 404, 500, DNS failure | ✅ GHA (curl check) |
| **Deploy** | Load test | Page loads completely in < 5 seconds; no broken asset references | Blank page, broken CSS/JS/images | 🟡 Manual smoke test |
| **Deploy** | Interactivity | Game responds to user input within 2 seconds of load | Frozen UI, no event listeners, crash on input | 🟡 Manual smoke test |

---

## 2. Game Quality Checklist

What makes a game **"playable and impressive"** (founder requirement):

### Visual Quality
- [ ] Game renders without visual glitches (no z-fighting, no clipping, no flicker)
- [ ] Consistent art style matching GDD specification
- [ ] Smooth animations (no stuttering transitions)
- [ ] UI elements are readable and properly positioned
- [ ] Color contrast sufficient for readability (WCAG AA minimum)

### Interactivity
- [ ] Keyboard input works (WASD/arrows as applicable)
- [ ] Touch/click input works on mobile
- [ ] Input response time < 100ms (feels instant)
- [ ] No dead states (player can always act or game clearly shows "game over")
- [ ] All interactive elements have visual feedback (hover, press, etc.)

### Performance
- [ ] Stable 30+ FPS on mobile, 60 FPS on desktop
- [ ] No memory leaks (stable heap over 10-minute session)
- [ ] Load time < 3 seconds on 4G connection
- [ ] No layout shifts after initial render

### Completeness
- [ ] Title screen present with game name
- [ ] Core gameplay loop functional (start → play → end condition)
- [ ] Game over / win state with clear messaging
- [ ] Restart capability without page reload
- [ ] Score / progress feedback visible during gameplay

### Accessibility & Responsiveness
- [ ] Playable on mobile viewport (320px minimum width)
- [ ] Responsive layout adapts to screen size
- [ ] Full keyboard navigation (no mouse-only interactions)
- [ ] No auto-playing audio without user interaction
- [ ] Clear visual indicators for game state changes

---

## 3. Automated vs Manual Test Breakdown

### Fully Automated (CI/GHA) ✅
| Test | Script / Workflow | Trigger |
|------|-------------------|---------|
| Proposal validation | `scripts/validate-proposal.js` | `proposal-pipeline.yml` on PR |
| GDD section parsing | `scripts/gdd-to-issues.js --dry-run` | `gdd-to-issues.yml` on label |
| Unit tests (proposal validator) | `scripts/__tests__/validate-proposal.test.js` | PR to `main` |
| Unit tests (GDD parser) | `scripts/__tests__/gdd-to-issues.test.js` | PR to `main` |
| Build success | Game repo build workflow | Push to game repo `main` |
| Bundle size check | Build workflow artifact size | Post-build step |
| Deploy accessibility | `curl` health check | Post-deploy step |
| `.squad/` size limits | `squad-size-check.yml` | PR to `main` |

### Semi-Automated (needs human trigger) 🟡
| Test | Method | When |
|------|--------|------|
| GDD quality review | Checklist in PR template | GDD submission PR |
| Spec adherence | Issue acceptance criteria | Post-implementation |
| Deploy smoke test | Manual browser check | Post-deploy |

### Manual Only (human judgment) 🔴
| Test | Method | When |
|------|--------|------|
| "Playable and impressive" | Founder review | Pre-ship |
| Visual quality | Screenshot / screen recording | Post-deploy |
| Game feel / fun factor | Playtesting session | Post-deploy |

---

## 4. CI Integration Points

### GitHub Actions Workflows

```
proposal-pipeline.yml
├── validate-proposal.js --file <proposal>
├── Unit tests (npm test)
└── Label: pipeline:proposal → pipeline:gdd

gdd-to-issues.yml
├── gdd-to-issues.js --file <gdd> --dry-run (validation)
├── gdd-to-issues.js --file <gdd> (create issues)
└── Label: pipeline:gdd → pipeline:issues

implement-game.yml
├── Code generation via @copilot
├── Build verification
└── Label: pipeline:issues → pipeline:implementation

build + deploy (game repo)
├── npm run build
├── Bundle size assertion (< 10MB)
├── GitHub Pages deploy
├── curl health check (HTTP 200)
└── Label: pipeline:build → pipeline:deployed
```

### Quality Gate Enforcement

Each pipeline label transition requires the previous stage gate to pass:
- `pipeline:proposal` → `pipeline:gdd` : Proposal validation passes
- `pipeline:gdd` → `pipeline:issues` : GDD has all 10 sections + valid frontmatter
- `pipeline:issues` → `pipeline:implementation` : ≥ 1 epic + ≥ 3 features created
- `pipeline:implementation` → `pipeline:build` : Code builds, no runtime errors
- `pipeline:build` → `pipeline:deployed` : Zero build errors, assets bundled
- `pipeline:deployed` → **SHIP** : Deploy accessible, game interactive

---

## 5. Grading System

Every game is graded before shipping:

| Grade | Meaning | Action | Criteria |
|-------|---------|--------|----------|
| 🟢 **Ship** | Ready for production | Deploy to GitHub Pages, announce | All pipeline stages pass, game quality checklist ≥ 80% (20/25 checks), no P0 bugs, performance targets met |
| 🟡 **Fix First** | Close but needs work | Return to implementation, fix listed issues | Pipeline passes but game quality < 80%, or 1-2 non-critical bugs, or performance slightly under target |
| 🔴 **Reject** | Fundamental problems | Return to GDD or proposal stage | Pipeline stage fails, game unplayable, missing core mechanics, security issues, < 60% quality checklist |

### Grading Process
1. **Automated gates** run first (CI). If any fail → 🔴 automatic.
2. **Game quality checklist** scored (25 items, each = 4%). Score < 60% → 🔴, 60-79% → 🟡, ≥ 80% → 🟢.
3. **Founder review** (optional override): Can promote 🟡 → 🟢 or demote 🟢 → 🟡.
4. Grade recorded in `.pipeline/{slug}/grade.json`.

---

## Appendix: Test Data Requirements

For automated testing of pipeline scripts, maintain these fixtures:
- `scripts/__tests__/fixtures/valid-proposal.md` — Passes all checks
- `scripts/__tests__/fixtures/missing-fields-proposal.md` — Missing required YAML fields
- `scripts/__tests__/fixtures/invalid-yaml-proposal.md` — Malformed YAML
- `scripts/__tests__/fixtures/short-body-proposal.md` — Body under 50 words
- `scripts/__tests__/fixtures/valid-gdd.md` — Full 10-section GDD
- `scripts/__tests__/fixtures/minimal-gdd.md` — Only required sections
- `scripts/__tests__/fixtures/empty-gdd.md` — Empty file
