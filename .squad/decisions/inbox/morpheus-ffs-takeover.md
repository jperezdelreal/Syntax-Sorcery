# FFS Total Takeover — Strategy & Execution Plan

**Decision ID:** D-TAKEOVER-001
**Author:** Morpheus (Lead/Architect)
**Date:** 2026-03-15
**Tier:** T1 (Lead authority — architecture + cross-functional coordination)
**Status:** APPROVED — Ready for execution

---

## 1. Situation Assessment

### 1.1 FFS Constellation State (as of scan)

| Repo | Open PRs | Open Issues | upstream.json | Governance | Context Health |
|------|----------|-------------|---------------|------------|----------------|
| **Hub (FFS)** | 2 (draft: #196, #197) | 2 (digests only) | ❌ main / ✅ PR branch | Old (pre-SS) | 🔴 642KB decisions-archive |
| **ComeRosquillas** | 5 (#27-#31) | 6 (#21-#26) | ⚠️ Old format → FFS Hub | Old (pre-SS) | 🟢 Clean |
| **Flora** | 1 (#29) | 2 (#27-#28) | ⚠️ Old format → FFS Hub | Old (pre-SS) | 🟢 Clean |
| **ffs-squad-monitor** | 7 (#26-#32) | 7 (#18-#25) | ⚠️ Old format → FFS Hub | Old (pre-SS) | 🟢 Clean |

### 1.2 Critical Findings

1. **FFS Hub main branch is untouched by Phase 1.** PRs #196 (Ralph v5) and #197 (context remediation + governance swap) are both draft, unmerged. This is the single biggest blocker — everything cascades from Hub.

2. **Satellite repos point to FFS Hub, not SS.** This is architecturally CORRECT — SS governs Hub, Hub governs satellites. The chain is: `SS → Hub → {CR, Flora, Monitor}`. We do NOT rewire satellites to point directly at SS.

3. **All 4 repos have active domain work.** 15 open PRs across the constellation represent real FFS sprint work. Takeover must NOT block or disrupt domain development.

4. **Triage sync is pending everywhere.** PRs for content-aware triage (#27 on CR, #29 on Flora, #30 on Monitor) are waiting. These align governance but are FFS-internal fixes.

5. **Phase 1 delivered 100% of SS-side tooling.** GDD pipeline, Proposal→Prototype, cost alerting, Ralph v5, skills — all built and tested in SS. The gap is deployment to FFS.

### 1.3 Governance Chain Model

```
Syntax Sorcery (SS)
  └── upstream.json on FFS Hub
        ├── Policies (T0-T3) — MUST cascade, cannot override
        ├── Skills (19 inherited) — can override locally
        └── Quality gates — MUST cascade
              │
              ├── ComeRosquillas (subsquad of Hub)
              │     └── upstream.json → Hub (existing)
              ├── Flora (subsquad of Hub)
              │     └── upstream.json → Hub (existing)
              └── ffs-squad-monitor (subsquad of Hub)
                    └── upstream.json → Hub (existing)
```

---

## 2. Takeover Phases

### Phase T1: Hub Foundation (CRITICAL PATH)

**Goal:** FFS Hub on main branch reflects all Phase 1 deliverables.
**Duration:** ~2 hours
**Blocker for:** Everything else

| # | Task | Owner | Method | Risk |
|---|------|-------|--------|------|
| T1.1 | Merge PR #196 (Ralph v5 hardening) | Trinity | `gh pr merge 196 --squash --repo jperezdelreal/FirstFrameStudios` | Low — isolated change |
| T1.2 | Merge PR #197 (Context + Governance + upstream.json) | Trinity | `gh pr merge 197 --squash --repo jperezdelreal/FirstFrameStudios` | Medium — 95% context reduction |
| T1.3 | Verify post-merge: upstream.json exists, decisions-archive split, governance.md has T0-T3 | Switch | Read-only validation | Low |
| T1.4 | Install cost alerting workflow | Tank | Copy `scripts/azure-cost-check.sh` + workflow to Hub | Low — €0 cost |
| T1.5 | Install GDD→Issue pipeline | Trinity | Copy `scripts/gdd-to-issues.js` + `.github/workflows/gdd-to-issues.yml` to Hub | Low — tested |
| T1.6 | Install Proposal→Prototype pipeline hooks | Trinity | Copy pipeline scripts + workflows to Hub | Medium — cross-repo orchestration |
| T1.7 | Update `.squad/copilot-instructions.md` — add SS upstream reference | Oracle | Direct edit | Low |
| T1.8 | Verify Ralph v5 starts successfully | Tank | Dry-run: `ralph-watch.ps1 -DryRun -MaxRounds 1` | Low |

**Merge order matters:** #196 first (no conflicts), then #197 (larger, context change).

### Phase T2: Satellite Governance Cascade

**Goal:** All 3 satellite repos acknowledge SS governance chain via Hub.
**Duration:** ~3 hours
**Depends on:** T1.2 complete (Hub governance installed)

#### T2-A: ComeRosquillas

| # | Task | Owner | Method |
|---|------|-------|--------|
| T2-A.1 | Merge PR #27 (triage sync) | @copilot | `gh pr merge 27 --squash` |
| T2-A.2 | Update upstream.json to SS-compatible schema | Trinity | Update to include `inherits`, `overrides`, `sync` fields per SS spec |
| T2-A.3 | Review PRs #28-#31 — merge if clean, flag if conflicts | @copilot | `gh pr review` + `gh pr merge` for each |
| T2-A.4 | Verify GitHub Pages deployment | Oracle | Check https://jperezdelreal.github.io/ComeRosquillas |

#### T2-B: Flora

| # | Task | Owner | Method |
|---|------|-------|--------|
| T2-B.1 | Merge PR #29 (triage sync) | @copilot | `gh pr merge 29 --squash` |
| T2-B.2 | Update upstream.json to SS-compatible schema | Trinity | Same as T2-A.2 |
| T2-B.3 | Address Sprint Planning issue #27 | FFS local squad (Oak/Misty) | NOT SS concern — domain work |
| T2-B.4 | Assess web build / GitHub Pages gap | Oracle | Audit found no web build — needs P1 remediation issue |

#### T2-C: ffs-squad-monitor

| # | Task | Owner | Method |
|---|------|-------|--------|
| T2-C.1 | Merge PR #30 (triage sync) | @copilot | `gh pr merge 30 --squash` |
| T2-C.2 | Update upstream.json to SS-compatible schema | Trinity | Same as T2-A.2 |
| T2-C.3 | Merge PR #26 (sprint planning) — unblocks sprint 1 | @copilot | `gh pr merge 26 --squash` |
| T2-C.4 | Review PRs #27-#29, #31-#32 — merge sequentially | @copilot | Review + merge, handle conflicts |

### Phase T3: Pipeline Activation

**Goal:** SS pipelines operational and tested end-to-end against FFS.
**Duration:** ~2 hours
**Depends on:** T1.5, T1.6 complete

| # | Task | Owner | Method |
|---|------|-------|--------|
| T3.1 | Create pipeline labels (`pipeline:*`) in Hub repo | Trinity | Run `scripts/create-pipeline-labels.js` |
| T3.2 | Create pipeline labels in ComeRosquillas | Trinity | Same script, different repo |
| T3.3 | Create pipeline labels in Flora | Trinity | Same script, different repo |
| T3.4 | Test GDD→Issue pipeline with existing test GDD | Switch | Trigger workflow, verify issue creation |
| T3.5 | Test Proposal→Prototype with Chrono Tiles proposal | Switch | End-to-end pipeline validation |
| T3.6 | Configure Ralph to monitor pipeline labels | Tank | Update ralph-watch config |

### Phase T4: Verification & Handoff

**Goal:** Confirm takeover is complete, all systems green.
**Duration:** ~1 hour
**Depends on:** T1-T3 all complete

| # | Task | Owner | Method |
|---|------|-------|--------|
| T4.1 | Full integration test — all 4 repos | Switch | Rerun P1-12 test suite on merged main |
| T4.2 | SS self-audit rerun — target A (0.80+) | Switch | Rerun P1-13 with updated scores |
| T4.3 | FFS constellation re-audit — target B+ | Switch | Rerun P1-01 audit methodology |
| T4.4 | Document final state in SS decisions.md | Oracle | Append takeover completion to decisions |
| T4.5 | Create `[SS-takeover-complete]` issue in Hub | Morpheus | Formal announcement per intervention protocol |
| T4.6 | Verify founder interaction model | Morpheus | Confirm: joperezd → SS only, never FFS direct |

---

## 3. Dependency Graph

```
T1.1 (Ralph merge) ─┐
                     ├── T1.3 (verify) ── T1.8 (Ralph dry-run)
T1.2 (Context merge) ┘
    │
    ├── T1.4 (cost alerting) ──────────── T3.6 (Ralph pipeline config)
    ├── T1.5 (GDD pipeline) ────────────── T3.1-T3.3 (labels) ── T3.4 (test GDD)
    ├── T1.6 (Proposal→Prototype) ──────── T3.5 (test proposal)
    ├── T1.7 (copilot-instructions) 
    │
    └── T2-A, T2-B, T2-C (parallel satellites)
              │
              └── T4.1-T4.6 (verification, all deps met)
```

**Critical path:** T1.1 → T1.2 → T1.3 → {T2-* parallel, T1.4-T1.6 parallel} → T3.* → T4.*

---

## 4. Coordinator Instructions

The coordinator should execute in this exact sequence:

### Wave 1: Hub PRs (sequential, blocking)

**Spawn: Trinity**
```
Prompt: "You are Trinity. Merge FFS Hub PRs in this order:
1. gh pr merge 196 --squash --repo jperezdelreal/FirstFrameStudios (Ralph v5)
2. gh pr merge 197 --squash --repo jperezdelreal/FirstFrameStudios (Context + Governance)
Both are draft PRs — mark ready-for-review first if needed (gh pr ready <number>).
After merge, verify: .squad/upstream.json exists on main, decisions-archive.md gone or split, governance.md contains T0-T3 tiers.
Report merge SHAs."
```

### Wave 2: Hub Tooling Installation (parallel)

**Spawn: Trinity** (pipelines)
```
Prompt: "You are Trinity. Install SS pipelines into FFS Hub (jperezdelreal/FirstFrameStudios):
1. Copy scripts/gdd-to-issues.js from SS to FFS scripts/
2. Copy .github/workflows/gdd-to-issues.yml from SS to FFS .github/workflows/
3. Copy scripts/validate-proposal.js, proposal-to-gdd.js, pipeline-orchestrator.js, create-pipeline-labels.js from SS to FFS scripts/
4. Copy .github/workflows/proposal-pipeline.yml, implement-game.yml from SS to FFS .github/workflows/
5. Create branch squad/ss-pipeline-install, commit, push, create PR, merge.
Adapt paths if needed — scripts reference SS repo structure."
```

**Spawn: Tank** (cost alerting + Ralph verification)
```
Prompt: "You are Tank. Two tasks:
1. Install cost alerting in FFS Hub: copy scripts/azure-cost-check.sh and .github/workflows/azure-cost-check.yml from SS to FFS Hub. Create branch, PR, merge.
2. After Trinity merges PRs #196/#197, verify Ralph v5 works: clone FFS Hub, run tools/ralph-watch.ps1 -DryRun -MaxRounds 1. Report pass/fail."
```

**Spawn: Oracle** (documentation)
```
Prompt: "You are Oracle. Update FFS Hub .squad/copilot-instructions.md to include:
- Reference to SS as upstream governance authority
- Link to SS upstream.json schema
- Note that T0-T3 governance tiers are inherited from SS
- Note that policies cannot be overridden, skills can
Create branch, PR, merge."
```

### Wave 3: Satellite Governance (parallel, 3 agents)

**Spawn: @copilot** (or Trinity for all 3 — sequential within, parallel across if possible)
```
Prompt: "Merge triage sync PRs across FFS satellite repos:
1. gh pr merge 27 --squash --repo jperezdelreal/ComeRosquillas
2. gh pr merge 29 --squash --repo jperezdelreal/flora
3. gh pr merge 30 --squash --repo jperezdelreal/ffs-squad-monitor
Then merge sprint planning PR: gh pr merge 26 --squash --repo jperezdelreal/ffs-squad-monitor
Report results."
```

**Spawn: Trinity** (upstream.json updates)
```
Prompt: "You are Trinity. Update upstream.json in all 3 satellite repos to SS-compatible schema.
Keep 'source' pointing to FFS Hub (they are subsquads of Hub, not SS directly).
Add these fields per the SS downstream-management.md spec:
- inherits.policies: true
- inherits.skills: [list from Hub's upstream.json inherited_skills]
- inherits.governance: true
- overrides.skills: [repo-specific domain skills]
- sync.auto: false
- sync.notify_on_upstream_change: true
Repos: ComeRosquillas, flora, ffs-squad-monitor.
Create branches, PRs, merge for each."
```

### Wave 4: Pipeline Activation + Testing (sequential)

**Spawn: Trinity** (labels)
```
Prompt: "You are Trinity. Run scripts/create-pipeline-labels.js against all 4 FFS repos to install pipeline:* labels.
Use gh CLI: gh label create 'pipeline:proposal' --color '#fbca04' --repo jperezdelreal/FirstFrameStudios (etc.)
Repos: FirstFrameStudios, ComeRosquillas, flora, ffs-squad-monitor."
```

**Spawn: Switch** (integration test)
```
Prompt: "You are Switch. Run full integration test of SS→FFS governance:
1. Verify upstream.json on Hub main points to SS
2. Verify all 3 satellites' upstream.json points to Hub
3. Verify governance T0-T3 present on Hub main
4. Verify cost alerting workflow exists on Hub
5. Verify GDD→Issue pipeline workflow exists on Hub
6. Verify Proposal→Prototype pipeline workflow exists on Hub
7. Verify pipeline:* labels exist on all 4 repos
8. Verify Ralph v5 is on Hub main
9. Verify context health: Hub .squad/ total <100KB
10. Test GDD→Issue pipeline: use existing test GDD, trigger dry-run
Grade: GREEN if all pass, AMBER if 8-9 pass, RED if <8.
Report to .squad/decisions/inbox/switch-takeover-verification.md"
```

### Wave 5: Formal Handoff

**Spawn: Morpheus** (self)
```
After Switch reports GREEN:
1. Create issue in FFS Hub: "[SS-takeover-complete] Syntax Sorcery Governance Active"
2. Update SS decisions.md with takeover completion
3. Update SS history.md with learnings
```

---

## 5. Takeover Complete Criteria

All of the following MUST be true:

| # | Criterion | Verifier |
|---|-----------|----------|
| 1 | FFS Hub main has upstream.json → SS | Switch |
| 2 | FFS Hub decisions-archive <15KB per file | Switch |
| 3 | FFS Hub .squad/ total <100KB | Switch |
| 4 | FFS Hub governance.md has T0-T3 aligned with SS | Switch |
| 5 | FFS Hub has Ralph v5 on main (operational) | Tank |
| 6 | FFS Hub has cost alerting workflow | Tank |
| 7 | FFS Hub has GDD→Issue pipeline | Switch |
| 8 | FFS Hub has Proposal→Prototype pipeline hooks | Switch |
| 9 | All 3 satellites have SS-compatible upstream.json | Switch |
| 10 | All 4 repos have pipeline:* labels | Switch |
| 11 | Triage sync merged on all 3 satellites | @copilot |
| 12 | Integration test: GREEN | Switch |
| 13 | SS self-audit ≥ B (0.75+) | Switch |
| 14 | [SS-takeover-complete] issue exists in Hub | Morpheus |
| 15 | Founder interaction model: SS-only (never FFS direct) | Morpheus |

**Minimum for "takeover active":** Criteria 1-8 (Hub governed by SS).
**Full takeover:** All 15 criteria.

---

## 6. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| PR #197 merge conflicts with main | HIGH — blocks everything | LOW — main hasn't changed since PR creation | Rebase before merge. Trinity resolves conflicts. |
| Satellite PRs have merge conflicts | MEDIUM — blocks domain work | MEDIUM — multiple old PRs against old base | Merge sequentially. Rebase as needed. Skip if risky — not SS concern. |
| Ralph v5 crashes in production | HIGH — monitoring gap | LOW — tested in P1-08 | Fallback to v4. Tank monitors first 24h cycle. |
| Pipeline scripts assume SS repo structure | MEDIUM — broken pipelines | MEDIUM — scripts written for SS paths | Trinity adapts paths during installation. Test before merge. |
| Downstream squads confused by governance change | MEDIUM — FFS agents don't understand new rules | LOW — governance was already partially installed | Update copilot-instructions.md in each repo. First agent session after takeover gets new context. |
| Cost alerting secrets not configured | LOW — alerts don't fire | CERTAIN — secrets need manual setup | Document requirement. Not a blocker — alerts are defense-in-depth. |
| Context regrowth after remediation | HIGH — undoes P1-04 work | MEDIUM — Scribe may not enforce limits | Install CI enforcement for file size limits. Ralph monitors context health. |

### Risk Escalation Protocol

- **P0 (system down):** Tank fixes, Morpheus informed. Skip Announce step per intervention protocol.
- **P1 (degraded):** Full intervention protocol. Trinity/Tank pair on fix.
- **P2+ (cosmetic):** Queue for next sprint. Don't block takeover.

---

## 7. What @copilot Handles Autonomously

These tasks are safe for @copilot coding agent with no human oversight:

1. **Merging clean PRs** — triage sync PRs are trivially safe (workflow file updates only)
2. **Creating pipeline labels** — additive, no destructive changes
3. **Updating upstream.json** — file creation/update, well-defined schema
4. **Running dry-run tests** — read-only validation
5. **Creating GitHub issues** — [SS-intervention] and [SS-takeover-complete] issues

These require paired oversight (Trinity/Tank review):

1. **PR #197 merge** — large context change, verify post-merge state
2. **Pipeline script installation** — path adaptation needed
3. **Ralph v5 operational verification** — needs environment context

---

## 8. Timeline Estimate

| Phase | Duration | Parallelism |
|-------|----------|-------------|
| T1 (Hub Foundation) | 2h | Sequential (merges), then parallel (tooling) |
| T2 (Satellites) | 2h | All 3 repos in parallel |
| T3 (Pipeline Activation) | 1h | Labels parallel, testing sequential |
| T4 (Verification) | 1h | Sequential |
| **Total** | **~6h** | With full parallelism |

Buffer: +2h for conflict resolution, unexpected issues.
**Realistic delivery: 8 hours of agent time.**

---

## 9. Post-Takeover Steady State

Once takeover is complete, the operating model is:

1. **Founder (joperezd)** → talks to SS only. Submits game proposals, reviews showcases.
2. **SS (Morpheus)** → governs FFS via upstream policies. Monitors health via Ralph.
3. **FFS Hub (local lead)** → coordinates game development. Receives SS policy updates.
4. **Game repos** → develop autonomously within governance constraints.
5. **Pipeline** → Proposal → GDD → Issues → Code → Build → Deploy. Fully autonomous.
6. **Monitoring** → Ralph v5 + ffs-squad-monitor dashboard. Alerts to SS on anomalies.

**Intervention cadence:** Weekly health check (automated), monthly audit (SS-initiated), on-demand for P0.

---

*Morpheus — "I can only show you the door. You're the one that has to walk through it."*
*But in this case, I'm walking through it too. The coordinator has the plan. Execute.*
