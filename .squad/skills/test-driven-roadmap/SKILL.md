---
name: "test-driven-roadmap"
description: "Use test results to prioritize roadmap items. Fix critical gaps before building nice-to-have tooling."
domain: "architecture"
confidence: "medium"
source: "Morpheus Test 1→2 roadmap evolution (2026-03-18)"
---

## Context

Autonomous systems require roadmaps that evolve based on operational test results. Test-driven roadmap evolution treats each autonomy test as a feedback loop: test → identify deficiencies → prioritize roadmap items that address critical gaps → test again.

**Core principle:** Fix CRITICAL operational gaps before building meta-infrastructure or nice-to-have tooling.

## Core Patterns

### Test → Deficiency → Roadmap

1. **Run autonomy test** (e.g., "leave system unattended, let it work")
2. **Score results** (0-10 scale) and **identify deficiencies** (critical / important / nice-to-fix)
3. **Evaluate current roadmap:** Does it address the critical gaps? If NO → replace items.
4. **Prioritize:** Critical gaps → Important improvements → Nice-to-have tooling
5. **Iterate:** Next test validates fixes and reveals new deficiencies

### Deficiency Severity Classification

| Severity | Definition | Example | Roadmap Priority |
|----------|-----------|---------|------------------|
| **CRITICAL** | Breaks autonomous operation or allows unsafe outcomes | PRs merge without CI checks (broken code enters main) | MUST fix in next roadmap |
| **IMPORTANT** | Degrades autonomy quality or visibility | No health monitoring for downstream repos | SHOULD fix soon |
| **NICE-TO-FIX** | Improves DRY, reduces duplication, adds convenience | Reusable workflow vs inline code | CAN defer |

**Rule:** CRITICAL deficiencies ALWAYS take priority over meta-infrastructure improvements.

### Roadmap Strength Evaluation (3-Question Test)

Before accepting a roadmap item, ask:
1. **Does this fix a known critical gap?** (Yes = HIGH strength)
2. **Does this enable/harden autonomous operations?** (Yes = MEDIUM strength)
3. **Is this meta-infrastructure that makes future work easier?** (Yes = LOW strength unless critical gap exists)

**Decision Matrix:**
- 3 HIGH-strength items → STRONG roadmap (greenlit)
- 2 HIGH + 1 MEDIUM → ACCEPTABLE
- 3 MEDIUM → REVIEW (might be avoiding hard problems)
- Mix with LOW-strength items → WEAK (replace LOW items with HIGH)
- All LOW-strength → REJECT (meta-tooling obsession, ignoring operational reality)

### Orchestrator vs Product Roadmap Focus

| Repo Type | Roadmap Focus | Example Items |
|-----------|---------------|---------------|
| **Orchestrator** (Syntax Sorcery) | Infrastructure hardening, quality gates, monitoring, visibility | CI checks, branch protection, health monitoring, dashboards |
| **Product** (game repos) | Features, gameplay, polish, content | New game mechanics, UI improvements, level design |

**Anti-pattern:** Orchestrator roadmap filled with product features (wrong repo) or product roadmap filled with infrastructure (wrong repo).

## Test 1 → Test 2 Example (Syntax Sorcery)

### Test 1 Results (Score: 7/10)

**Deficiencies identified:**
1. CRITICAL: Zero CI checks — PRs merged without validation
2. IMPORTANT: Race condition in flora (duplicate issues)
3. IMPORTANT: ComeRosquillas Squad Release failed
4. IMPORTANT: pixel-bounce safety-net.yml (0 jobs)
5. NICE-TO-FIX: Manual review instead of spawning reviewer agent

### Original Roadmap (Pre-Test 2)

❌ **WEAK roadmap — all LOW-strength items:**
1. Perpetual-motion workflow template validation (meta-tooling)
2. Roadmap depletion detection utility (redundant, already inline in workflow)
3. GitHub Actions reusable workflow for issue creation (DRY but not urgent)

**Problem:** Zero items address Test 1's CRITICAL gap (CI checks). Roadmap focused on meta-infrastructure instead of operational hardening.

### Strengthened Roadmap (Test 2)

✅ **STRONG roadmap — all HIGH-strength items:**
1. **Configure CI checks + branch protection** → Fixes Test 1 CRITICAL gap
2. **Add constellation-wide health monitoring** → Enables proactive orchestration (SS is hub for 6 repos)
3. **Add constellation-wide health monitoring dashboard** → Operational visibility for Layer 2

**Strength:** All 3 items directly address Test 1 learnings + multi-terminal orchestration needs.

### Outcome

Test 2 target score: 9/10 (up from 7/10) by eliminating CI gap and adding operational visibility.

## Key Examples

### Example 1: CI Checks (Critical → Immediate)

**Deficiency:** PRs merge without validation (Test 1, severity CRITICAL)  
**Roadmap Item:** "Configure CI checks and branch protection"  
**Strength:** HIGH (fixes critical gap)  
**Action:** Add to roadmap immediately, displace LOW-strength item if at 3-item limit

### Example 2: Reusable Workflow (Nice-to-have → Defer)

**Observation:** perpetual-motion.yml creates issues inline (467 lines, working)  
**Proposal:** Extract to reusable workflow (DRY principle)  
**Strength:** LOW (nice-to-have, no operational gap)  
**Action:** Defer until critical gaps are fixed

## Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| **Meta-tooling obsession** | Roadmap full of validators, utilities, reusable workflows while critical operational gaps exist | Apply 3-question test: does this fix a known gap? If NO, defer |
| **Test results ignored** | Test identifies critical gaps but roadmap unchanged | ALWAYS review roadmap after each test, prioritize critical fixes |
| **Feature creep in orchestrator** | SS roadmap has game features, product improvements | Orchestrator roadmap = infrastructure only. Features belong in product repos |
| **"Nice to have" paralysis** | Roadmap has 10 LOW-strength items, team debates which 3 to pick | Use test results as tiebreaker: what fixes the highest-severity gap? |
| **Roadmap inertia** | "We already committed to these 3 items" despite test showing different critical gap | Roadmap is living document. If test reveals urgent gap, replace non-critical items |

## Decision Workflow

```
1. Run autonomy test
2. Score results (0-10) + list deficiencies (critical / important / nice-to-fix)
3. Read current roadmap
4. Apply 3-question test to each roadmap item (HIGH / MEDIUM / LOW strength)
5. IF roadmap has ≥1 LOW-strength item AND test has CRITICAL gap:
   → Replace LOW item with item that fixes CRITICAL gap
6. IF roadmap has all MEDIUM-strength items:
   → Review: are we avoiding the hard problems? Add 1 HIGH-strength item
7. ELSE (roadmap has ≥2 HIGH-strength items):
   → Approve roadmap
8. Create GitHub issues for approved roadmap items
9. Execute test with new roadmap
10. GOTO step 1 (iterate)
```

## Success Metrics

- **Test score improves** (e.g., 7/10 → 9/10) after roadmap addresses critical gaps
- **Critical deficiencies decrease** (test N has 1 critical gap, test N+1 has 0 critical gaps)
- **Roadmap item completion rate** remains high (≥80%) — indicates items are correctly scoped and actionable
- **Roadmap strength** trends toward HIGH (operational hardening) vs LOW (meta-tooling)

---

**When to use this skill:** After each autonomy test, when evaluating/strengthening a roadmap, when prioritizing between competing feature proposals for orchestrator repos.
