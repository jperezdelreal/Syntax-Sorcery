# Ceremonies

> Team meetings that happen before or after work. Each squad configures their own.

## Design Review

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | multi-agent task involving 2+ agents modifying shared systems |
| **Facilitator** | lead |
| **Participants** | all-relevant |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. Review the task and requirements
2. Agree on interfaces and contracts between components
3. Identify risks and edge cases
4. Assign action items

---

## Retrospective

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | after |
| **Condition** | build failure, test failure, or reviewer rejection |
| **Facilitator** | lead |
| **Participants** | all-involved |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. What happened? (facts only)
2. Root cause analysis
3. What should change?
4. Action items for next iteration

---

## Sprint Planning

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | board clear — no open issues with label `squad` |
| **Facilitator** | lead |
| **Participants** | lead-only |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. Read recent closed issues, merged PRs, roadmap.md, README.md, and .squad/decisions.md
2. Analyze project state holistically — what's been done, what's missing, what's next
3. Create N issues (2-7) that advance the project organically
4. Anti-repetition check: do NOT recreate issues that were recently closed or are duplicates
5. If project has reached a natural endpoint, declare "🏁 Natural endpoint" instead of creating issues
