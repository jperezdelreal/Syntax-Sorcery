# Autonomy Tests — Results Tracker

> Comparing 3 approaches to autonomous operation across the SS constellation.

## Test Matrix

| # | Name | Setup | Where Runs | Cost | Status |
|---|------|-------|------------|------|--------|
| 1 | ralph-watch.ps1 | Single script, polls all repos | PC local (background) | €0 | ✅ DONE |
| 2 | Ralph Go Multi-Terminal | 1 terminal per repo, `copilot` + "Ralph, go" | PC local (5 terminals) | €0 | 🔄 IN PROGRESS |
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
**Duration:** TBD  
**Started:** 2026-03-13T21:42:00+01:00  
**Setup:** 5 terminals on local PC, one per downstream repo, each running `copilot` + "Ralph, go"

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

### Metrics (fill after test)
| Metric | Value |
|--------|-------|
| Issues closed / hour | |
| PRs merged / hour | |
| New issues generated | |
| Avg cycle time (issue → PR merged) | |
| Repos that reached "board clear" | |
| Refueling triggered (roadmap issues created) | |
| Human intervention needed | |
| Errors / failures | |

### Observations
_(fill during/after test)_

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
| Issues/hour | ~5 (manual merge) | | |
| PRs/hour | ~3 (manual merge) | | |
| Autonomy level | 7/10 | /10 | /10 |
| Cost | €0 | €0 | €25-30/mo |
| 24/7 capable | ❌ (needs PC on) | ❌ (needs PC on) | ✅ |
| Human intervention | Merge PRs | TBD | TBD |
| Recommended for | Quick checks, fallback | Active development | Full autonomy |
