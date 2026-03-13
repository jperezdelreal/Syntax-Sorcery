---
name: "skill-lifecycle"
description: "How skills are created, promoted, and maintained across projects and downstream companies"
domain: "operations"
confidence: "low"
source: "inherited from FFS SKILL-LIFECYCLE.md"
---

## Context

Skills are living documents that capture reusable knowledge. This skill defines how they move through creation, promotion, consumption, and deprecation across the upstream/downstream model.

## Skill Categories

| Category | Location | Example |
|----------|----------|---------|
| Company-wide | SS `.squad/skills/` | multi-agent-coordination, state-machine-patterns |
| Domain-specific | Downstream `.squad/skills/` | game-specific patterns, product-specific config |
| Local knowledge | Downstream repo | Architecture notes, debugging logs |

## Promotion Rule

If a local document contains knowledge that would benefit future projects, it MUST be generalized and promoted to a company-wide skill. Lead (Morpheus) decides whether knowledge is company-worthy or project-specific.

Flow: Downstream Repo (learning) → SS Skill (captured) → All Downstream Repos (consumed)

## Lifecycle Phases

| Phase | Action | Authority |
|-------|--------|-----------|
| Creation | Agent identifies reusable pattern | T1 (Lead) for new company skills |
| Authoring | Domain expert writes SKILL.md | T2 (assigned agent) |
| Review | Lead reviews for accuracy and scope | T1 (Lead) |
| Publication | Committed to SS `.squad/skills/` | T1 (Lead) |
| Consumption | Downstream repos access via upstream | Automatic |
| Update | Expert updates with new learnings | T2 minor, T1 structural |
| Deprecation | Marked superseded or archived | T1 (Lead) |

## Confidence Levels

| Level | Meaning | Trigger |
|-------|---------|---------|
| low | First observation | Agent noticed a pattern worth capturing |
| medium | Confirmed | Multiple agents/sessions validated independently |
| high | Established | Consistently applied, well-tested, team-agreed |

Confidence only goes up, never down.

## Cascade Mechanics

Agents in downstream repos have access to:
1. All SS skills (via upstream relationship)
2. All local documentation (in their repo)
3. Their charter and history (from SS agent definitions)

Skills don't need copying to downstream repos. The upstream relationship makes them available.

## Anti-Patterns

- **Duplicating skills downstream** — Use upstream inheritance, don't copy
- **Promoting too early** — Wait for 2nd confirmed use before promoting to company-wide
- **Never updating** — Skills should evolve with new learnings
- **No confidence tracking** — Always set and update confidence levels
