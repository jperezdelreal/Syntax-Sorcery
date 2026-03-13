# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## 1. [ ] Add perpetual-motion workflow template validation

**Acceptance Criteria:**
- Validation script checks all `.github/workflows/perpetual-motion.yml` files exist in downstream repos
- Script verifies workflow has correct trigger: `on: issues: types: [closed]`
- Script validates roadmap.md parsing logic matches standardized format
- Script reports missing or misconfigured perpetual-motion workflows with actionable errors
- Add to existing `scripts/validate-squad.js` or create `scripts/validate-perpetual-motion.js`

**Files:**
- `scripts/validate-perpetual-motion.js` (create new validator)
- `package.json` (add test:validate-perpetual-motion script)
- `.squad/skills/perpetual-motion/SKILL.md` (document validation patterns)

**Context:**
Perpetual motion workflows are the backbone of autonomy (A1 from Phase 2 plan). This validation ensures all 6 repos have correctly configured perpetual-motion.yml files that can create issues from roadmap.md when prior issues close. The validator prevents silent failures where a repo stops progressing because the workflow is misconfigured.

---

## 2. [ ] Create roadmap depletion detection utility

**Acceptance Criteria:**
- Utility function reads roadmap.md and counts unchecked items
- Returns true if roadmap has 0 unchecked items remaining
- Utility can be called from GitHub Actions workflow context
- Documentation includes usage examples for perpetual-motion.yml integration
- Unit tests cover empty roadmap, partially complete roadmap, fully complete roadmap scenarios

**Files:**
- `scripts/check-roadmap-status.js` (new utility)
- `scripts/__tests__/check-roadmap-status.test.js` (unit tests)
- `.squad/guides/roadmap-management.md` (document usage patterns)

**Context:**
This utility enables perpetual-motion.yml (A1) to detect when a roadmap is exhausted and trigger creation of "📋 Define next roadmap" issues. ralph-watch.ps1 (A5) depends on this signal to know when to refuel a repo. Without this utility, perpetual motion workflows cannot detect depletion and the refueling cycle breaks.

---

## 3. [ ] Implement GitHub Actions reusable workflow for issue creation

**Acceptance Criteria:**
- Reusable workflow file: `.github/workflows/create-issue-from-roadmap.yml`
- Input parameters: roadmap_path (default: roadmap.md), assignee (default: @copilot), label_prefix (default: copilot-ready)
- Workflow parses next unchecked item from roadmap, extracts title, acceptance criteria, files list
- Creates GitHub issue with extracted content, assigns to specified user, applies labels
- Returns created issue number and URL as outputs
- Can be called from perpetual-motion.yml with: `uses: ./.github/workflows/create-issue-from-roadmap.yml`
- Test demonstrates calling the workflow and verifying issue creation

**Files:**
- `.github/workflows/create-issue-from-roadmap.yml` (reusable workflow)
- `.github/workflows/test-issue-creation.yml` (test workflow, can be manual trigger)
- `.squad/guides/reusable-workflows.md` (document pattern for other workflows)

**Context:**
Perpetual-motion.yml needs to create issues automatically. Rather than duplicating issue creation logic across all 6 repos, this reusable workflow provides a single source of truth. All downstream repos can call this workflow, reducing maintenance burden and ensuring consistent issue format across the constellation.
