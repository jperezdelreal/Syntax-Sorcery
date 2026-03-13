---
name: "github-project-board"
description: "Manage GitHub Project Board V2 for work tracking across repos"
domain: "github"
confidence: "low"
source: "inherited from FFS — adapted to generic project board management"
---

## Context

Central mission control for all work across repos. Uses GitHub Projects V2. Tracks Todo/In Progress/Done with custom fields: Priority, Project, Size, Sprint, Agent.

## Core Patterns

- **Setup:** Create project via `gh project create` or GitHub UI. Note project number and ID
- **Status field:** Map to TODO, IN_PROGRESS, DONE. Use single-select option IDs
- **Priority field:** P0_CRITICAL, P1_HIGH, P2_MEDIUM, P3_LOW
- **Workflow:** Check if on board → Add if needed → Set fields → Move to In Progress → Work → Move to Done

## Key Examples

**Add item to board:**
```bash
gh project item-add {PROJECT_NUMBER} --owner {OWNER} --url <ISSUE_URL>
```

**Move to In Progress:**
```bash
gh project item-edit \
  --project-id {PROJECT_ID} \
  --id <ITEM_ID> \
  --field-id {STATUS_FIELD_ID} \
  --single-select-option-id {IN_PROGRESS_OPTION_ID}
```

**Get field IDs (first-time setup):**
```bash
gh project field-list {PROJECT_NUMBER} --owner {OWNER} --format json
```

**Duplicate prevention (CRITICAL):**
```bash
gh search issues --owner {OWNER} --state open "search terms"
gh project item-list {PROJECT_NUMBER} --owner {OWNER} --format json | jq '...'
```

## Anti-Patterns

- **Creating issue without duplicate check** — Always search first
- **Not setting required fields** — Keep all fields populated for board views
- **Forgetting to move status** — Keep board in sync with actual work state
- **Hardcoding field IDs** — Document them per-project, don't memorize
