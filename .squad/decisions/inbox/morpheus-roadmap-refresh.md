# Decision — Roadmap Refresh: Phase 3 Autonomy Hardening

**Date:** 2026-03-18  
**By:** Morpheus (Lead/Architect)  
**Tier:** T1  
**Status:** ✅ APPROVED  
**Issues:** #36 (dedup guard), #35 (Azure launcher), #37 (review gate)

## What

Previous roadmap (3/3 items) COMPLETE. All merged and closed:
- ✅ #30: CI checks + branch protection (PR #32)
- ✅ #31: Constellation health monitoring (PR #33)
- ✅ #29: Ralph-watch dashboard (PR #34)

New roadmap defines 3 items focused on **autonomy hardening** — closing the remaining Test 1 gaps and unblocking Test 3 (Azure VM Hub/Spoke):

1. **Issue dedup guard** (#36) — Prevents perpetual-motion from creating duplicate planning issues. Directly addresses Test 1 deficiency: "duplicate roadmap issues when issues close in quick succession."

2. **Azure satellite launcher scripts** (#35) — Infrastructure scripts (start-satellites.sh, reset-satellite.sh, provision-vm.sh, systemd) to unblock Test 3. This is the path to 24/7 autonomous operation at €25-30/mo.

3. **Autonomous PR review gate** (#37) — Replaces the "coordinator reads diffs" anti-pattern with automated PR validation against acceptance criteria. Two-layer quality gate: CI (correctness) + review-gate (completeness).

## Rationale

Selection criteria applied:
- **Test 1 gap closure:** Items #36 and #37 directly address 2 of the 5 identified deficiencies (duplicate issues, superficial review)
- **Test 3 enablement:** Item #35 unblocks the Azure VM architecture (approved, not built)
- **Orchestrator focus:** All 3 items are SS hub infrastructure — canonical implementations that downstream repos can adopt
- **3-feature limit:** Respected per audit conditions

## Strategic Sequence

1. Dedup guard FIRST — prevents noise in the system, makes all other autonomous work cleaner
2. Review gate SECOND — enables safe autonomous merging without human review
3. Azure launcher THIRD — depends on stable autonomous operation (dedup + review) before scaling to 24/7

## Risk

LOW. All items are additive (no breaking changes). Each has unit tests in acceptance criteria. CI workflow validates all PRs.
