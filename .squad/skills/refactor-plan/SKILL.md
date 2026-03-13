---
name: "refactor-plan"
description: "Plan a multi-file refactor with proper sequencing, verification steps, and rollback"
domain: "process"
confidence: "low"
source: "inherited from FFS"
---

## Context

Create a detailed plan before executing multi-file refactors. Proper sequencing prevents broken intermediate states and enables safe rollback.

## Instructions

1. Search the codebase to understand current state
2. Identify all affected files and their dependencies
3. Plan changes in a safe sequence (types first, then implementations, then tests)
4. Include verification steps between changes
5. Consider rollback if something fails

## Output Format

```markdown
## Refactor Plan: [title]

### Current State
[Brief description of how things work now]

### Target State
[Brief description of how things will work after]

### Affected Files
| File | Change Type | Dependencies |
|------|-------------|--------------|
| path | modify/create/delete | blocks X, blocked by Y |

### Execution Plan

#### Phase 1: Types and Interfaces
- [ ] Step 1.1: [action] in `file`
- [ ] Verify: [how to check it worked]

#### Phase 2: Implementation
- [ ] Step 2.1: [action] in `file`
- [ ] Verify: [how to check]

#### Phase 3: Tests
- [ ] Step 3.1: Update tests in `file.test`
- [ ] Verify: Run tests

#### Phase 4: Cleanup
- [ ] Remove deprecated code
- [ ] Update documentation

### Rollback Plan
If something fails:
1. [Step to undo]
2. [Step to undo]

### Risks
- [Potential issue and mitigation]
```

## Anti-Patterns

- **No rollback plan** — Always have a way to undo changes
- **Big bang refactors** — Phase changes so each step is independently verifiable
- **Skipping verification** — Test after each phase, not just at the end
- **Missing dependency analysis** — Changes that break downstream consumers
