---
name: "feature-triage"
description: "Feature triage framework — Kill Your Darlings with discipline. Four-test gate for every feature candidate"
domain: "product"
confidence: "low"
source: "inherited from FFS — battle-tested across multiple product cycles"
---

## Context

Feature triage is the gating mechanism that prevents scope creep from destroying a project. Every feature candidate must prove it strengthens the core value proposition before earning development time. The core value is sacred — everything else is a candidate for the cut list.

## Core Patterns

### The Gate Question

Before triage: **"Does this strengthen our core value proposition?"** If NO → cut immediately. If YES → proceed to the four-test framework.

### The Four-Test Framework

Every feature that passes the gate question faces four tests. **Fail 2+ tests = CUT. No debate.**

| Test | Question | Pass Example | Fail Example |
|------|----------|-------------|-------------|
| **Core Value** | Does it strengthen what users get value from every session? | Feature that improves primary workflow | Parallel system unrelated to core |
| **User Impact** | Will a first-time user notice if this is missing? | Essential UI element, core action | Nice-to-have dashboard, cosmetic setting |
| **Cost-to-Joy** | Dev hours vs user delight? (target ratio ≥ 1:2) | 8h dev → scales across entire product | 40h dev → 5h value = CUT |
| **Coherence** | Does it feel like *this* product or bolted on? | Feature consistent with product identity | Feature from a different product category |

### Decision Matrix

```
4/4 pass → GREENLIT — Build it
3/4 pass → REVIEW — Product owner decides (1 hour max)
2/4 pass → CUT or SIMPLIFY — Find the 20% that delivers 80%
1/4 pass → CUT — No debate
0/4 pass → CUT — Save for next product
```

### Cut / Simplify / Defer

- **Cut:** Fails tests → log reason in decisions.md, celebrate the saved hours
- **Simplify:** Passes tests but too large → apply MoSCoW (MUST/SHOULD/COULD/WON'T), build only MUST version
- **Defer:** Passes tests but wrong timing → schedule to specific phase with documented dependencies

Never use a "someday" backlog. Features either pass triage and get scheduled, or they're cut.

### Scope Right-Sizing

- **MoSCoW split:** Every feature breaks into MUST (minimum viable), SHOULD (depth), COULD (polish), WON'T (future)
- **Timebox:** Don't estimate — allocate a fixed timebox, build MUST first, add SHOULD only if clear by midpoint
- **Vertical slice:** Build one feature to 100% quality before starting the next (quality ratchet)
- **Rule of 3:** If a feature needs 4+ sprints, split it. Each piece passes triage independently

## Key Examples

**MoSCoW for User Authentication:**
- MUST: Login, logout, password reset
- SHOULD: SSO integration, 2FA
- COULD: Social login, session management dashboard
- WON'T: Biometric auth, custom auth providers (future)

## Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| **Design by Addition** | Something broken → add new system instead of fixing | Ask: "Can we fix this by improving what exists?" |
| **Feature Parity Hunting** | Pressure to match competitor checklists | Their core value isn't yours. If it fails your tests, it's irrelevant |
| **Gold Plating** | Secondary features at 95% while core is at 70% | Quality ratchet: core ships first at high quality |
| **Scope Creep by Consensus** | Everyone adds "just one thing" | Every addition = proposal = must pass fast-track triage |
| **"It's Almost Done"** | Sunk cost drives finishing over cutting | Triage the current state, not the imagined final state |
