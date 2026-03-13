---
name: "context-hygiene"
description: "Enforces file size limits, proactive summarization, and archival rules for all .squad/ files to prevent context window bloat"
domain: "operations"
confidence: "high"
source: "manual — learned from FFS project where files grew monstruous"
---

## Context

In the founder's first Squad project (FirstFrameStudios), history.md, decisions.md, and other files grew uncontrollably large, causing slow context windows and degraded agent performance. This skill defines **preventive** hard gates — not reactive cleanup — to keep all `.squad/` files lean.

**This is a hard engineering requirement, not optional.**

## File Size Limits

| File / Path | Proactive Trigger | Hard Limit | Action |
|---|---|---|---|
| `history.md` (any agent) | 6KB | 8KB | Summarize into `## Core Context`, compress `## Learnings` entries older than 5 sessions into bullet points |
| `decisions.md` | 10KB | 12KB | Archive entries older than 14 days to `decisions-archive.md`, delete references with no active use |
| `decisions-archive.md` | 40KB | 50KB | Split into `decisions-archive-YYYY-MM.md` dated files |
| `orchestration-log/*.md` | — | 2KB each | Prune entries older than 7 days |
| `log/*.md` | — | 1KB each | Prune entries older than 14 days |
| Any single `.squad/` file | 15KB (⚠️ ALERT) | 25KB (🛑 HARD STOP) | Alert at 15KB; at 25KB, Scribe must summarize/archive BEFORE any other work |

## Summarization Rules

- **History:** `## Core Context` is permanent and always kept. `## Learnings` entries older than 5 sessions → compress to single bullet points. Never exceed 3 lines per learning.
- **Decisions:** Active decisions stay. Decisions older than 14 days with no references from other files → archive to `decisions-archive.md`.
- **Never delete — always archive.** Archives exist for humans, not agents. Agents do NOT read archive files.

## Prevention Patterns

- **History entries:** Agents append 2–3 lines per session, not paragraphs.
- **Decision entries:** Max 5 lines each — timestamp, by, what, why. That's it.
- **Orchestration log:** Structured format (timestamp, agent, action, result). No prose.
- **TLDR rule:** If you need more than 3 lines to explain something, you're over-explaining. Compress.

## Monitoring

1. **Every Scribe run** checks all `.squad/` file sizes FIRST, before doing anything else.
2. If any file exceeds its hard limit → Scribe summarizes/archives BEFORE adding new content.
3. If any file exceeds its proactive trigger → Scribe summarizes/archives in the same run.
4. Violations logged in session log: `⚠️ {file} at {size}KB — summarized to {new_size}KB`
5. Switch audits file sizes periodically as a quality gate.

## Enforcement

- **Scribe:** Automatic enforcement on every run (responsibility #0).
- **Switch:** Periodic audit. Violations block merges.
- **All agents:** Must follow prevention patterns when writing to `.squad/` files.

## Examples

```
# GOOD — concise history entry
- 2026-03-13: Created context-hygiene skill with hard file size limits

# BAD — verbose history entry
- 2026-03-13: Today we had a long discussion about how files were getting too big
  and we decided that we needed to create a comprehensive system of rules and
  guidelines that would prevent files from growing beyond acceptable limits...
```

```
# GOOD — compact decision
### 2026-03-13T09:00:00Z: Context hygiene hard gates
**By:** Switch
**What:** All .squad/ files must respect size limits per skills/context-hygiene/SKILL.md
**Why:** Prevent FFS-style context bloat.

# BAD — verbose decision (too many lines)
### 2026-03-13T09:00:00Z: Context hygiene
**By:** Switch
**What:** We have established a comprehensive framework for managing file sizes...
(continues for 15 lines)
```

## Anti-Patterns

- **Waiting until 12KB to summarize** — by then context is already degraded. Trigger at 6KB.
- **Prose in orchestration logs** — use structured key:value format only.
- **Appending full paragraphs to history** — 2-3 lines max per session.
- **Keeping stale decisions** — if no agent references it after 14 days, archive it.
- **Reading archive files in agent context** — archives are for humans. Agents read only active files.
