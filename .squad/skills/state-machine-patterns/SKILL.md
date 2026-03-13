---
name: "state-machine-patterns"
description: "Robust state machine design — exit paths, transition guards, timeout safety nets, and common anti-patterns for any stateful system"
domain: "architecture"
confidence: "low"
source: "inherited from FFS — earned from critical bugs (entity freezes, passivity, timer conflation)"
---

## Context

Robust state machine design for any stateful system, distilled from critical production bugs (entity freezes, unresponsive states, timer conflation). Apply when implementing, debugging, or reviewing state machines in workflows, entities, services, or processes. Applicable to UI state, process orchestration, entity behavior, and service lifecycle management.

## Core Patterns

### Every State Must Have an Exit Path
Before adding any state, answer: **"How does the entity leave this state?"** If you can't answer in one sentence, the state is broken. Document states using a transition table with Entry Condition, Per-Frame/Tick Behavior, and Exit Path(s) — empty exit cells indicate dead-ends.

### Guard Conditions on Transitions
Not every transition is valid from every state. Maintain an `actionableStates` list for input-driven transitions and a `protectedStates` list (e.g., `'processing'`, `'initializing'`, `'recovering'`) that are immune to external override.

### Timeout Safety Nets
Every timed state needs a maximum duration fallback. Only `idle`, `waiting`, `terminated` are intentionally unbounded. All active states should have a configurable max duration.

### Separate Timers for Separate Concerns
Never use one timer for multiple purposes (operation duration AND cooldown AND retry delay). Each concern gets its own timer variable to prevent state corruption.

### Single Point of State Change
Route all state changes through a single `setState()` method with guards. Multiple systems writing state directly causes same-cycle conflicts.

## Key Examples

**Dead-end state (freeze bug):**
```javascript
// ❌ 'processing' state with no exit — entity frozen forever
startProcessing() { this.state = 'processing'; this.timeout = 30; }
update(dt) { this.timeout -= dt; /* no transition back! */ }

// ✅ Explicit exit path
update(dt) {
    this.timeout -= dt;
    if (this.state === 'processing' && this.timeout <= 0) {
        this.state = 'idle';
    }
}
```

**Unguarded override (passivity bug):**
```javascript
// ❌ Scheduler resets state every tick, killing active operations
schedulerTick(dt) {
    if (this.cooldown > 0) { this.state = 'idle'; return; }
}

// ✅ Protected states immune to override
schedulerTick(dt) {
    const protectedStates = ['processing', 'initializing', 'recovering'];
    if (protectedStates.includes(this.state)) return;
    if (this.cooldown > 0) { this.state = 'idle'; return; }
}
```

## Anti-Patterns

1. **Dead-end states** — No exit path; entity enters and never leaves. Highest-severity bug class
2. **Timer conflation** — One timer for multiple concerns causes state corruption
3. **Unguarded state override** — External system sets state without checking protected states
4. **Missing negative code** — Bug is in code that doesn't exist (missing exit transition)
5. **Testing by reading, not tracing** — Always simulate 3-5 consecutive cycles mentally

## Checklist

- [ ] New state has documented exit path reachable within reasonable time
- [ ] Timeout safety net exists for all timed states
- [ ] Protected states list updated for critical states
- [ ] No timer serves double duty
- [ ] Transition table updated; no empty exit cells
- [ ] No code path sets state without guards
