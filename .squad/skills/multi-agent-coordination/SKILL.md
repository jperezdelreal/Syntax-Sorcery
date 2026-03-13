---
name: "multi-agent-coordination"
description: "Coordination patterns for multi-agent development — file ownership, integration contracts, conflict prevention"
domain: "process"
confidence: "low"
source: "inherited from FFS — earned from 72+ agent spawns, 12 agents, 101 backlog items"
---

## Context

Multi-agent parallel development creates coordination challenges. Patterns learned from 72+ agent spawns that shipped 214 LOC of unwired infrastructure, duplicate functions, and state machine overwrites. Apply when multiple agents edit shared codebases simultaneously to prevent conflicts and integration failures.

## Core Patterns

- **One agent per file per wave** — Parallel edits = conflicts/overwrites. Decompose large files (>200 LOC) into modules before parallelizing
- **Integration contracts in comments** — Every infrastructure PR must wire into ≥1 consumer OR include clear integration instructions
- **Decisions inbox** — `.squad/decisions/inbox/` for async agent communication. Append-only during wave, Lead reviews between waves
- **Integration pass after every wave** — Verify: imports wired, no duplicates, state machines intact, data formats consistent, system runs
- **Shared utilities manifest** — Prevent duplicate helpers. Check before adding functions
- **Data schema first** — Define formats once in shared config before agents create data

## Key Examples

**Integration contract:**
```javascript
// === INTEGRATION CONTRACT ===
// To wire NotificationService into UserController:
//   1. Import: import { NotificationService } from '../services/notification.js';
//   2. In UserController.createUser(): NotificationService.sendWelcome(user.email);
// ============================
```

**Code review checklist (pre-merge):**
```
□ No duplicate functions across files
□ Every new system wired to ≥1 consumer
□ State machines not overwritten
□ Data formats consistent
□ Application runs without errors
□ Smoke test passes
```

## Anti-Patterns

- **Build without wiring** — System exists but has zero effect. Always wire to at least one consumer
- **Two agents, one file** — Parallel edits = overwrites/conflicts. One agent per file per wave
- **Integration-last** — Integrate after EVERY wave, not after 5 waves. Small passes 10× cheaper than big-bang
- **Assuming another agent wired it** — Unless explicitly assigned, wire one consumer yourself
- **God file bottleneck** — Large files touched by everyone. Decompose before parallelizing
- **No smoke test** — Always run the application after integration passes
