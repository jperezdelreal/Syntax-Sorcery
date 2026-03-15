# Roadmaps Directory — Perpetual Motion Fuel

## TLDR

This directory contains `roadmap.md` specifications for all 6 repos in the Syntax Sorcery constellation. The **perpetual-motion.yml** workflow automatically parses these files and creates GitHub issues, enabling autonomous, self-sustaining product progress.

---

## Format Specification

Each roadmap file (e.g., `flora.md`, `comerosquillas.md`) follows a standardized format that perpetual-motion.yml can reliably parse:

### Structure
```markdown
# [Repo Name] Roadmap

## TLDR
[1-2 sentence summary of roadmap focus]

---

## Feature 1: [ ] Title of feature

Brief description of what this feature accomplishes.

- Acceptance criterion 1
- Acceptance criterion 2
- Acceptance criterion 3
- Files: file1.js, file2.ts, tests/file.test.js
- Context: Why this matters, what it unblocks

## Feature 2: [ ] Title of feature

...and so on, max 3 features per roadmap.
```

### Parsing Rules

The perpetual-motion.yml workflow looks for:

1. **Unchecked items:** Lines matching `[ ]` (with optional number prefix)
   - `1. [ ] Title` (numbered list)
   - `- [ ] Title` (bulleted list)

2. **Acceptance criteria:** Indented bullet points after title
   - Must start with `-` (dash)
   - Stop parsing at next unchecked item or non-indented line
   - Automatically included in GitHub issue body

3. **Files section:** Special line `- Files: file1.js, file2.ts`
   - Parsed as comma-separated list
   - Included in issue body with backticks

4. **Context section:** Special line `- Context: Why this matters`
   - Appended to issue body
   - Helps @copilot understand scope

### Checklist Convention

- [ ] = Not started (perpetual-motion.yml will create a GitHub issue)
- [x] = Completed (perpetual-motion.yml will skip to next unchecked item)

---

## How Perpetual Motion Uses Roadmaps

### Workflow: perpetual-motion.yml

**Trigger:** Issue closes with `roadmap` or `copilot-ready` label

**Steps:**
1. Read `roadmap.md` from repo root
2. Find first unchecked item (`[ ]`)
3. Parse title, acceptance criteria, files, context
4. Create GitHub issue with parsed content
5. Label new issue: `copilot-ready`, `squad:copilot`, `roadmap`
6. Log event to `.squad/motor-log/YYYY-MM-DD.json`
7. Mark item as complete: update `[x]` in roadmap.md
8. Commit roadmap progress to main branch

**Rate Limiting:**
- Max 1 open `copilot-ready` issue per repo (prevents runaway)
- Max 1 trigger per 30 minutes (cost control)

**Exhaustion:** When no unchecked items remain, workflow creates:
- Issue title: `Define next roadmap — [Repo Name]`
- Label: `squad:oracle`
- Assigns to Oracle or Repo Lead
- Stops perpetual motion until new roadmap provided

### Example: Flora Roadmap Execution

```
1. Issue #37 (spring planting) closes → Perpetual motion triggered
2. Reads roadmaps/flora.md
3. Finds: "## Feature 2: [ ] Add procedural weather system..."
4. Creates Issue #38 with title "Add procedural weather system affecting plant growth rates"
5. Includes acceptance criteria (3 items), files, context
6. Labels: copilot-ready, squad:copilot, roadmap
7. Assigns to @copilot
8. Updates roadmaps/flora.md: "## Feature 2: [x] Add procedural..."
9. Commits: "Update flora roadmap: weather system in progress (#38)"
10. Logs event with timestamp, issue numbers, trigger
```

---

## Roadmap Ownership & Maintenance

### Per-Repo Lead Ownership

Each repository has a designated **Lead** responsible for roadmap maintenance:

| Repo | Lead | Responsibilities |
|------|------|------------------|
| Syntax-Sorcery | Morpheus | Infrastructure, autonomy, architecture |
| FirstFrameStudios | Trinity | Visibility, landing page, devlog automation |
| flora | Trinity | Seasonal gameplay, plant mechanics |
| ComeRosquillas | Trinity | Game loops, enemy AI, progression |
| pixel-bounce | Trinity | Physics, visual feedback, game modes |
| ffs-squad-monitor | Switch | Status dashboards, metrics, timelines |

### Maintenance Cycle

**Quarterly Refresh:**
1. Review completed items (marked `[x]`)
2. Add 3 new features to backlog
3. Re-prioritize based on dependencies and capacity
4. Push to `main` branch

**On Roadmap Exhaustion:**
- Perpetual motion creates `Define next roadmap` issue
- Assigned to Repo Lead
- Lead creates new `roadmaps/[repo].md` with 3 features
- Closes "Define next roadmap" issue
- Perpetual motion resumes automatically

---

## Best Practices for @copilot-Ready Items

Each roadmap item should be:

### ✅ WHAT-focused (not HOW)
- ✅ "Add procedural weather system affecting growth rates"
- ❌ "Refactor weather class, use Perlin noise for generation"

### ✅ Acceptance criteria are testable
- ✅ "Verify workflow recovers correctly with 5 sequential test runs"
- ❌ "Make the workflow work better"

### ✅ Scope fits in 2-4 hour sprint
- ✅ Feature (defined scope, clear acceptance)
- ❌ Epic (too large, multiple dependent features)

### ✅ Files list is helpful but optional
- Guides @copilot on where to focus
- Helps with test coverage and integration

### ✅ Context explains *why* (not how)
- ✅ "Closes the autonomy loop — no human intervention needed for refueling"
- ❌ "Write the autonomous mode by adding a flag parameter"

---

## Format Validation Checklist

Before committing roadmap changes:

- [ ] TLDR is 1-2 sentences
- [ ] Exactly 3 features (no more, no less per scope lock)
- [ ] Each feature title is clear, action-oriented
- [ ] Each feature has 3-5 acceptance criteria
- [ ] Acceptance criteria are testable (not vague)
- [ ] Files section is present (even if empty: `- Files: `)
- [ ] Context section explains *why* (not implementation)
- [ ] All `[ ]` are unchecked (ready for perpetual motion)
- [ ] No markdown syntax errors (test with local preview)

---

## Troubleshooting

### Perpetual Motion Skips My Feature

**Possible causes:**
- Feature marked `[x]` (completed) — should be `[ ]`
- Feature not indented under title — parser missed it
- Line has invalid format — must start with `- [ ]` or number
- Acceptance criteria have wrong indentation

**Fix:** Ensure format matches examples above, test with `grep` locally.

### GitHub Issue Is Malformed

**Cause:** Acceptance criteria or files aren't indented properly

**Fix:** Verify indentation is consistent (4-space tabs, not mixed)

### Perpetual Motion Stops Triggering

**Cause:** Roadmap exhausted, no `[ ]` items found

**Fix:** Check for "Define next roadmap" issue in repo. Lead should create new roadmap.md, close the meta-issue, perpetual motion resumes.

---

## Examples in the Wild

- [Syntax Sorcery Roadmap](./syntax-sorcery.md) — Infrastructure focus
- [Flora Roadmap](./flora.md) — Game features (seasonal)
- [ComeRosquillas Roadmap](./comerosquillas.md) — Game features (progression)
- [Pixel-Bounce Roadmap](./pixel-bounce.md) — Game features (physics & modes)

---

## Integration with Other Workflows

### Perpetual Motion Workflow
- **Trigger:** Issue closes
- **Input:** `roadmap.md` (this directory)
- **Output:** New GitHub issue + updated roadmap.md

### Safety Net Workflow
- Monitors perpetual motion success
- Creates escalation issue if no progress 24h+
- Does not modify roadmaps

### Squad Heartbeat
- Logs roadmap completion milestones
- Reports phase progress to decisions.md
- No direct roadmap modification

---

**Last Updated:** 2026-03-18  
**Maintained By:** Oracle (Product & Docs)  
**Status:** Active, all repos operational
