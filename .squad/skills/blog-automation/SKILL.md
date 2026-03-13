---
name: "blog-automation"
description: "Automated blog post generation from project milestones, ceremonies, and releases"
domain: "operations"
confidence: "low"
source: "inherited from FFS — adapted from game studio blog automation to generic software"
---

## Context

Automated blog post generation for project hub sites. Milestones and ceremonies produce blog posts that chronicle team activity and showcase autonomous operation.

## Triggers

Blog posts are generated when:
1. **Ceremony completion** — After any ceremony (retro, design review, kickoff), Scribe generates a summary blog post
2. **Milestone closure** — When a GitHub milestone is closed, Ralph detects it and triggers a post
3. **Release tags** — When a repo creates a release tag (v0.1, v1.0, etc.), a blog post is generated
4. **Manual request** — User says "write a blog post about X"

## Blog Post Format

Posts are markdown files in the project's blog directory.

File naming: `{YYYY-MM-DD}-{slug}.md`

Frontmatter:
```yaml
---
title: "Project v0.2 — New Features!"
date: 2026-03-11
tags: ["release", "project-name"]
author: "Squad"
---
```

## Content Guidelines

- Keep posts SHORT (200-400 words max)
- Lead with what's new/interesting
- Include screenshots or diagrams if available
- End with call-to-action (try it, give feedback, etc.)
- Tone: excited but genuine, not corporate

## Automation Flow

```
Repo event (milestone/release/ceremony)
  → Ralph detects during work-check cycle
  → Ralph spawns Scribe with blog post task
  → Scribe writes .md to blog directory
  → Scribe creates PR
  → Push to main triggers site rebuild
  → Blog post live
```

## What NOT to Blog

- Internal tooling changes (unless significant)
- Routine PR merges
- Agent reassignments or squad mechanics
- Anything that requires user approval first

## Anti-Patterns

- **Wall of text** — Blog posts over 400 words lose readers
- **No call-to-action** — Every post should tell the reader what to do next
- **Technical jargon** — Write for humans, not agents
- **Missing frontmatter** — Posts without proper metadata break site generators
