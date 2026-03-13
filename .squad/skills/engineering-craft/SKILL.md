---
name: "engineering-craft"
description: "Meta-skills of running an engineering team — creative vision, feature triage, iteration, postmortems, decision rights, methodology, knowledge capture"
domain: "operations"
confidence: "low"
source: "inherited from FFS studio-craft — adapted from game studio to autonomous software engineering team"
---

## Context

This skill covers *running* the engineering team, not building specific products. It captures how we organize, decide, iterate, and compound knowledge across projects — the operating system that makes a team ship consistently. Every agent should internalize these patterns before their first sprint.

## Core Patterns

### 1. Technical Vision Management
One Lead (Morpheus default) acts as a **filter, not bottleneck** — attends cross-domain reviews, asks "does this fit the product vision?", breaks architecture/design ties. Maintains coherence across components.

### 2. Feature Triage — "Kill Your Darlings"
Every feature passes **four tests** before greenlit (fail 2+ → cut immediately):
1. **Core value** — strengthens or distracts from core proposition?
2. **User impact** — would a first-time user miss it?
3. **Cost-to-joy ratio** — dev hours vs. user delight
4. **Coherence** — feels native or bolted on?

Sunk cost is never justification. Cutting is celebrated.

### 3. Iteration-Driven Development
Core features require **3+ iteration cycles**: `Build → Test → Measure → Revise`. Iteration count correlates with quality. "Works on first try" = hasn't been tested hard enough.

### 4. Postmortem Discipline
Mandatory after every milestone: individual reflection (5 right / 5 wrong) → synthesis → documentation → follow-up. Findings stored in agent history and `decisions.md`.

### 5. Developer Joy Metric
1-5 excitement check every retrospective. Scores below 3 trigger a **design review, not a pep talk**. Team excitement is a leading indicator of product quality.

### 6. Decision Rights Matrix
Every decision type has explicit **Decides / Advises / Informed** roles. Prevents invisible hierarchies. Map to governance tiers (T0-T3).

### 7. Methodology: Scrumban
- **Discovery/Spike:** Kanban — continuous flow, WIP limit 2/agent, weekly reviews
- **Development:** 2-week sprints — demo the build as sprint review, score principles in retros
- **Hardening:** 1-week fix sprints — P0 only, no new features, Switch assesses ship-readiness

### 8. 20% Load Cap
No agent carries >20% of phase backlog items. Exceeding triggers immediate redistribution. Anti-burnout insurance audited by Ralph every sprint.

### 9. Cross-Domain Review
Changes affecting other domains require a **5-minute review**: "Does this create work for me? Does this break my assumptions?"

### 10. Knowledge Capture
After every milestone: extract reusable modules, document lessons, update skills, tag insights. Scribe owns the process. Skills are living documents.

## Anti-Patterns

- **Skipping postmortems** — leads to repeating the same mistakes across projects
- **Sunk cost reasoning** — "we already spent two weeks on this" is never justification
- **Flat structure without explicit decision rights** — creates invisible hierarchies
- **Ignoring low developer excitement** — fix the design or scope, not the team's attitude
- **Agent overload (>20%)** — top predictor of burnout; redistribute immediately
