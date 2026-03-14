# Autonomy Tests — Results Tracker

> Comparing 3 approaches to autonomous operation across the SS constellation.

## Test Matrix

| # | Name | Setup | Where Runs | Cost | Status |
|---|------|-------|------------|------|--------|
| 1 | ralph-watch.ps1 | Single script, polls all repos | PC local (background) | €0 | ✅ DONE |
| 2 | Ralph Go Multi-Terminal | 1 terminal per repo, `copilot` + "Ralph, go" | PC local (5 terminals) | €0 | ✅ DONE (8/10) |
| 3 | Azure VM Hub/Spoke | SS on PC, Azure VM runs satellite terminals via tmux | PC + Azure VM (~€25-30/mo) | €25-30/mo | 📋 PLANNED |

---

## Test 1: ralph-watch.ps1 (Single Script)

**Date:** 2026-03-13  
**Duration:** ~1 hour  
**Setup:** `ralph-watch.ps1` polling every 10min + manual Squad session on SS

### What Happened
- ralph-watch.ps1 detected 3 @copilot draft PRs across 3 repos
- Squad (SS session) reviewed and merged all 3 PRs autonomously
- Perpetual motion triggered on all 3 repos → new "Define next roadmap" issues created
- Deploy workflows pushed flora + pixel-bounce to GitHub Pages

### Metrics
| Metric | Value |
|--------|-------|
| Issues closed (today total) | 34 |
| PRs merged (today total) | 32 |
| PRs reviewed & merged (this test) | 3 |
| Cycle time (merge → new issue) | ~10 sec |
| Cycle time (scan → merge) | ~6 min |
| Repos active | 6 |
| Human intervention | 0 (autonomous decision to merge) |
| Failures | 2 workflows (safety-net, Squad Release) |

### Morpheus Evaluation
- **Score:** 7/10
- **Strengths:** Full cycle verified, perpetual motion works, @copilot delivers quality code
- **Weaknesses:** No CI checks on PRs, duplicate roadmap issues, review was superficial (coordinator read diffs instead of spawning reviewer), 2 workflow failures

### Learnings
- ralph-watch.ps1 is an autonomy motor, not a monitoring tool
- Perpetual motion creates duplicate "Define next roadmap" if issues close in quick succession → need dedup
- @copilot creates draft PRs that need manual merge → gap in the cycle without a reviewer

---

## Test 2: Ralph Go Multi-Terminal (Local)

**Date:** 2026-03-13 (started 21:42 CET)  
**Duration:** ~5 hours (21:42 CET → ~02:30 CET)  
**Started:** 2026-03-13T21:42:00+01:00  
**Ended:** ~2026-03-14T02:30:00+01:00  
**Setup:** 6 terminals on local PC (5 downstream + 1 hub), each running `copilot` + "Ralph, go"

### Repos & Teams
| Terminal | Repo | Lead | Universe |
|----------|------|------|----------|
| 1 | flora | Oak | Pokémon |
| 2 | ComeRosquillas | Moe | Simpsons |
| 3 | pixel-bounce | Proto Man | Mega Man |
| 4 | ffs-squad-monitor | Ripley | Alien |
| 5 | FirstFrameStudios | Solo | Star Wars |
| Hub | Syntax Sorcery (this terminal) | Morpheus | Matrix |

### Pre-conditions
- [x] All repos pulled with latest directives
- [x] Ralph refueling directive in all repos (board empty → create roadmap issue)
- [x] No cross-repo direct commits directive in all repos
- [x] Duplicate planning issues cleaned (1 per repo)
- [x] All planning issues assigned to local Lead (not Morpheus)
- [x] pixel-bounce Squad initialized (Mega Man universe)
- [x] Squad Monitor updated (only 3 FFS games)

### Metrics
| Metric | Value |
|--------|-------|
| Issues closed / hour | ~23 |
| PRs merged / hour | ~17 |
| New issues generated | ~113 (including ~57 duplicates) |
| Avg cycle time (issue → PR merged) | ~5 min |
| Repos that reached "board clear" | 4/6 (pixel-bounce, ffs-squad-monitor, flora, ComeRosquillas) |
| Refueling triggered (roadmap issues created) | Yes — all 4 active repos triggered perpetual motion |
| Human intervention needed | 0 |
| Errors / failures | FFS silent (0 output), 57+ duplicate roadmap issues across flora/ComeRosquillas |

### Per-Repo Results
| Repo | PRs Merged | Issues Closed | Duplicate Issues | Verdict |
|------|------------|---------------|------------------|---------|
| pixel-bounce | 8 | 8 | 0 | ⭐ PERFECT |
| ffs-squad-monitor | 30 | 30 | 0 | ⭐ MOST PRODUCTIVE |
| flora | 16 | 30+ | 41 (25 closed + 16 open) | ⚠️ Productive but messy |
| ComeRosquillas | 14 | 28 | 16 (14 closed + 2 open) | ✅ Solid |
| Syntax Sorcery (hub) | 17 (+1 rejected) | ~15 | 0 | ✅ Excellent |
| FirstFrameStudios | 0 | 0 | 0 | ❌ Failed (silent) |

### Morpheus Evaluation
- **Score:** 8/10
- **Strengths:** 86 PRs in 5 hours (2767% improvement over Test 1), real features delivered (game systems, dashboards, CI pipelines), multi-universe teams work independently, zero human intervention, quality gate functional (PR#45 rejected for design-only)
- **Weaknesses:** Duplicate roadmap issue storm (flora: 41, ComeRosquillas: 16 — WORSE than Test 1), FFS completely inactive (0 output), auto-merge without review in downstream repos, no cross-repo coordination

### Learnings
- Multi-terminal is a multiplier, not an adder (3→86 PRs = 29x)
- Dedup guard is BLOCKING for scale — duplicates scale worse than linearly
- Hub repos (FFS) need actionable issues, not strategic ones
- Branch protection mandatory in downstream repos before Test 3

---

## Test 3: Azure VM Hub/Spoke

**Date:** TBD  
**Duration:** TBD  
**Setup:** SS on local PC (hub), Azure B2s v2 VM running 5 tmux sessions (satellites). SSH + `tmux send-keys` for communication.

### Architecture
```
PC Local (Hub)                     Azure VM (Spokes)
┌──────────────┐                   ┌─────────────────────┐
│ SS Terminal   │ ──── SSH ────→  │ tmux: satellites     │
│ (Morpheus)    │                  │  ├─ flora            │
│               │                  │  ├─ ComeRosquillas   │
│ Communicates  │                  │  ├─ pixel-bounce     │
│ via GH Issues │                  │  ├─ ffs-squad-monitor│
│ only          │                  │  └─ FirstFrameStudios│
└──────────────┘                   └─────────────────────┘
```

### Pre-conditions
- [ ] Azure VM provisioned (B2s v2, Ubuntu 24.04, West Europe)
- [ ] SSH configured, gh CLI authenticated
- [ ] All repos cloned on VM
- [ ] start-satellites.sh + reset-satellite.sh deployed
- [ ] systemd auto-restart configured

### Metrics (fill after test)
| Metric | Value |
|--------|-------|
| Issues closed / hour | |
| PRs merged / hour | |
| 24/7 uptime verified | |
| Context resets needed | |
| VM cost (actual) | |
| Human intervention needed | |

### Observations
_(fill after test)_

---

## Comparison (fill after all tests)

| Metric | Test 1 (ralph-watch) | Test 2 (multi-terminal) | Test 3 (Azure VM) |
|--------|---------------------|------------------------|--------------------|
| Issues/hour | ~6 | ~23 | |
| PRs/hour | ~3 | ~17 | |
| Total PRs | 3 | 86 | |
| Autonomy level | 7/10 | 8/10 | /10 |
| Cost | €0 | €0 | €25-30/mo |
| 24/7 capable | ❌ (needs PC on) | ❌ (needs PC on) | ✅ |
| Human intervention | Merge PRs | 0 | TBD |
| Duplicate issues | Yes (minor) | Yes (critical — 57+) | TBD |
| Repos producing | 3/6 | 5/6 | TBD |
| Recommended for | Quick checks, fallback | Active development | Full autonomy |
