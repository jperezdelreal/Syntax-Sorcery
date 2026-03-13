# Syntax Sorcery — System Architecture

> The autonomous software development company, deconstructed.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Perpetual Motion Engine](#2-perpetual-motion-engine)
3. [Hub/Spoke Deployment Topology](#3-hubspoke-deployment-topology)
4. [3-Layer Monitoring Architecture](#4-3-layer-monitoring-architecture)
5. [Quality Gate Pipeline](#5-quality-gate-pipeline)
6. [Data Flow Summary](#6-data-flow-summary)
7. [Key Scripts & Components](#7-key-scripts--components)
8. [Related Documentation](#8-related-documentation)

---

## 1. Overview

Syntax Sorcery (SS) is an autonomous software development company that designs, builds, tests, and deploys software with minimal human intervention. The system is built on three pillars:

- **Perpetual Motion** — a self-sustaining cycle that converts roadmap items into shipped code
- **Hub/Spoke Topology** — a local hub orchestrating cloud-based satellite terminals
- **3-Layer Monitoring** — layered oversight ensuring the system self-heals and stays operational

The founder intervenes only for edge cases (<15 min/week). Everything else — issue creation, code generation, testing, review, and merging — runs autonomously through AI agents coordinated by [Squad](https://github.com/bradygaster/squad).

---

## 2. Perpetual Motion Engine

The perpetual motion engine is SS's core autonomous loop. It transforms roadmap items into merged pull requests without human intervention.

### 2.1 Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERPETUAL MOTION LIFECYCLE                       │
│                                                                     │
│   ┌───────────┐     ┌───────────┐     ┌───────────┐                │
│   │  ROADMAP  │────▶│   ISSUE   │────▶│   AGENT   │                │
│   │  (items)  │     │ (created) │     │  (builds) │                │
│   └─────▲─────┘     └───────────┘     └─────┬─────┘                │
│         │                                    │                      │
│         │           ┌───────────┐            │                      │
│         │           │  REVIEW   │            │                      │
│         │           │   GATE    │◀───────────┘                      │
│         │           └─────┬─────┘                                   │
│         │                 │                                          │
│         │           ┌─────▼─────┐     ┌───────────┐                │
│         │           │    CI     │────▶│   MERGE   │                │
│         │           │  (tests)  │     │ (squash)  │                │
│         │           └───────────┘     └─────┬─────┘                │
│         │                                    │                      │
│   ┌─────┴─────┐     ┌───────────┐           │                      │
│   │  REFUEL   │◀────│  DEPLETE  │◀──────────┘                      │
│   │ (ralph)   │     │ (roadmap) │                                   │
│   └───────────┘     └───────────┘                                   │
│                                                                     │
│   perpetual-motion.yml ──▶ @copilot ──▶ review-gate.js ──▶ CI     │
│   dedup-guard.js prevents duplicate issues                          │
│   ralph-watch.ps1 detects roadmap depletion and refuels             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Stage Details

| Stage | Actor | Mechanism | Output |
|-------|-------|-----------|--------|
| **Roadmap** | Human/Ralph | `roadmap.md` contains ordered work items | Numbered tasks with acceptance criteria |
| **Issue** | `perpetual-motion.yml` | GitHub Actions reads roadmap, creates issue | GitHub Issue assigned to `@copilot` |
| **Agent** | `@copilot` | Copilot implements the issue on a branch | Pull request with code changes |
| **Review Gate** | `review-gate.js` | Validates: linked issue, files match, CI, not draft | JSON verdict: APPROVE / REQUEST_CHANGES / NEEDS_HUMAN |
| **CI** | `ci.yml` | `npm ci` + `npm test` (168+ vitest tests) | Pass/fail status check |
| **Merge** | Ralph / Agent | `gh pr merge --squash` after gate approval | Code merged to master |
| **Deplete** | Automatic | Merged item struck through in roadmap | Roadmap shrinks |
| **Refuel** | `ralph-watch.ps1` | Detects depleted roadmap, triggers planning | New items added to roadmap |

### 2.3 Safety Mechanisms

- **Dedup Guard** (`scripts/dedup-guard.js`) — queries open issues before creating new ones; prevents duplicate issue storms during rapid roadmap cycling
- **Review Gate** (`scripts/review-gate.js`) — structured 4-check validation replaces superficial review
- **CI Pipeline** (`ci.yml`) — all PRs must pass 168+ tests before merge is possible

---

## 3. Hub/Spoke Deployment Topology

SS operates across two physical layers: a local development machine (hub) and a cloud VM (spoke).

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HUB/SPOKE TOPOLOGY                             │
│                                                                     │
│  ┌─────────────────────────┐          ┌────────────────────────┐   │
│  │     HUB (Local PC)      │          │   SPOKE (Azure VM)     │   │
│  │                         │   SSH    │   B2s v2, Ubuntu 24.04 │   │
│  │  ┌───────────────────┐  │◀───────▶│   West Europe           │   │
│  │  │  Syntax Sorcery   │  │          │   ~€25-30/month        │   │
│  │  │  (master repo)    │  │          │                        │   │
│  │  └───────────────────┘  │          │  ┌──────────────────┐  │   │
│  │                         │          │  │  tmux sessions    │  │   │
│  │  ┌───────────────────┐  │          │  │                  │  │   │
│  │  │  ralph-watch.ps1  │  │          │  │  sat-flora       │  │   │
│  │  │  (Layer 2 watch)  │  │          │  │  sat-ComeRosq.   │  │   │
│  │  └───────────────────┘  │          │  │  sat-pixel-b.    │  │   │
│  │                         │          │  │  sat-ffs-monitor  │  │   │
│  │  ┌───────────────────┐  │          │  │  sat-FFS          │  │   │
│  │  │  GitHub CLI (gh)  │  │          │  └──────────────────┘  │   │
│  │  │  Copilot CLI      │  │          │                        │   │
│  │  └───────────────────┘  │          │  systemd auto-start    │   │
│  └─────────────────────────┘          └────────────────────────┘   │
│                                                                     │
│  Hub = governance, orchestration, quality gates                     │
│  Spoke = parallel autonomous execution across 5 repos              │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Hub Responsibilities

| Responsibility | Component |
|----------------|-----------|
| Governance & decisions | `.squad/decisions.md` |
| Quality gates | `review-gate.js`, `ci.yml` |
| Roadmap management | `roadmap.md`, `perpetual-motion.yml` |
| Monitoring Layer 2 | `ralph-watch.ps1` |
| Constellation health | `constellation-health.js` |

### 3.3 Spoke (Azure VM) Details

- **VM Spec:** Standard_B2s_v2, Ubuntu 24.04 LTS
- **Cost:** ~€25-30/month (within €500/month budget)
- **Terminal Multiplexer:** tmux with 5 named sessions
- **Auto-start:** systemd unit `satellites.service` restarts on reboot
- **Auth:** SSH-key-only (no passwords, no hardcoded credentials)

**Satellite sessions:**

| Session | Repository | Purpose |
|---------|------------|---------|
| `sat-flora` | flora | Gardening roguelite game |
| `sat-ComeRosquillas` | ComeRosquillas | Pac-Man clone game |
| `sat-pixel-bounce` | pixel-bounce | Arcade platformer game |
| `sat-ffs-squad-monitor` | ffs-squad-monitor | FFS health monitoring |
| `sat-FirstFrameStudios` | FirstFrameStudios | Gaming studio hub |

### 3.4 Operational Scripts

| Script | Purpose |
|--------|---------|
| `scripts/azure/provision-vm.sh` | Create Azure VM with all dependencies |
| `scripts/azure/start-satellites.sh` | Launch all 5 tmux sessions (idempotent) |
| `scripts/azure/reset-satellite.sh` | Kill and restart a single satellite |
| `scripts/azure/satellites.service` | systemd unit for auto-start on boot |

---

## 4. 3-Layer Monitoring Architecture

SS uses a layered monitoring model where each layer watches a different scope, preventing circular dependencies.

### 4.1 Monitoring Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   3-LAYER MONITORING STACK                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LAYER 1 — Cloud Self-Monitor (GitHub Actions)               │  │
│  │                                                               │  │
│  │  perpetual-motion.yml   Automated issue creation from roadmap │  │
│  │  safety-net.yml         Daily .squad/ health checks           │  │
│  │  ci.yml                 Test gate on every PR and push        │  │
│  │                                                               │  │
│  │  Scope: Syntax Sorcery self-monitoring                        │  │
│  │  Cost: €0 (GitHub Actions free tier)                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LAYER 2 — Local Watch (ralph-watch.ps1)                     │  │
│  │                                                               │  │
│  │  ralph-watch.ps1        Monitors roadmap depletion, refuels   │  │
│  │  constellation.json     Tracks all 6 repos in the system      │  │
│  │  constellation-health   Validates repo health across all 6    │  │
│  │                                                               │  │
│  │  Scope: SS monitors all downstream repos                     │  │
│  │  Runs on: Hub (local PC), background process                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LAYER 2.5 — Azure VM Satellites                             │  │
│  │                                                               │  │
│  │  5 tmux sessions        Parallel Copilot CLI instances        │  │
│  │  systemd service        Auto-restart on failure/reboot        │  │
│  │                                                               │  │
│  │  Scope: Autonomous execution on downstream repos             │  │
│  │  Runs on: Azure VM (B2s v2, ~€25-30/mo)                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LAYER 3 — Squad Monitor (ffs-squad-monitor)                 │  │
│  │                                                               │  │
│  │  Monitors ONLY FFS game repos:                                │  │
│  │    flora, ComeRosquillas, pixel-bounce                        │  │
│  │                                                               │  │
│  │  Does NOT monitor SS or FFS hub (prevents circular deps)     │  │
│  │  Scope: Game-level health only                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  KEY PRINCIPLE: Each layer watches outward/downward, never inward  │
│  This prevents circular dependency loops and monitoring storms     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Layer Responsibilities

| Layer | Component | What It Monitors | Where It Runs |
|-------|-----------|------------------|---------------|
| **1** | GitHub Actions workflows | SS itself (CI, perpetual motion, safety net) | GitHub (cloud) |
| **2** | `ralph-watch.ps1` + `constellation-health.js` | All 6 repos — roadmap status, workflow health | Local PC (hub) |
| **2.5** | Azure satellite sessions | Downstream repo execution | Azure VM (spoke) |
| **3** | `ffs-squad-monitor` | FFS game repos only (flora, ComeRosquillas, pixel-bounce) | Separate repo |

### 4.3 Anti-Pattern: Circular Monitoring

A critical architectural decision: Layer 3 (`ffs-squad-monitor`) must **never** monitor Syntax Sorcery or FirstFrameStudios (hub repos). Monitoring flows downward only. If a monitor watches its own governor, a failure in the governor could disable the very system designed to detect the failure.

---

## 5. Quality Gate Pipeline

Every pull request passes through a multi-stage validation pipeline before merging.

### 5.1 PR Review Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PR REVIEW PIPELINE                              │
│                                                                     │
│  Developer / @copilot                                               │
│        │                                                            │
│        ▼                                                            │
│  ┌───────────┐                                                      │
│  │  PR Open  │                                                      │
│  └─────┬─────┘                                                      │
│        │                                                            │
│        ├────────────────────┐                                       │
│        ▼                    ▼                                       │
│  ┌───────────┐       ┌───────────┐                                  │
│  │  CI Gate  │       │  Review   │                                  │
│  │  ci.yml   │       │   Gate    │                                  │
│  │           │       │review-gate│                                  │
│  │ npm ci    │       │   .js     │                                  │
│  │ npm test  │       │           │                                  │
│  │ 168+ tests│       │ 4 checks: │                                  │
│  └─────┬─────┘       │ 1.Issue?  │                                  │
│        │             │ 2.Files?  │                                  │
│        │             │ 3.CI ok?  │                                  │
│        │             │ 4.!Draft? │                                  │
│        │             └─────┬─────┘                                  │
│        │                   │                                        │
│        ▼                   ▼                                        │
│  ┌─────────────────────────────────┐                                │
│  │         VERDICT ENGINE          │                                │
│  │                                 │                                │
│  │  All pass ──▶ APPROVE           │                                │
│  │  Critical fail ──▶ REQ_CHANGES  │                                │
│  │  Minor issue ──▶ NEEDS_HUMAN    │                                │
│  └───────────────┬─────────────────┘                                │
│                  │                                                  │
│           ┌──────┴──────┐                                           │
│           ▼             ▼                                           │
│     ┌──────────┐  ┌──────────┐                                      │
│     │  MERGE   │  │  BLOCK   │                                      │
│     │ (squash) │  │ (report) │                                      │
│     └──────────┘  └──────────┘                                      │
│                                                                     │
│  Morpheus provides architectural review on complex PRs             │
│  Ralph orchestrates the merge when gates are green                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Gate Details

| Gate | Tool | Checks | Failure Mode |
|------|------|--------|--------------|
| **CI** | `.github/workflows/ci.yml` | `npm ci` + `npm test` (168+ vitest tests) | PR cannot merge |
| **Review Gate** | `scripts/review-gate.js` | Linked issue, file match, CI status, not draft | JSON report with verdict |
| **Dedup Guard** | `scripts/dedup-guard.js` | No duplicate issues before creation | Prevents issue storm |
| **Architectural Review** | Morpheus (agent) | Design patterns, security, code quality | REQUEST_CHANGES on complex PRs |

### 5.3 Invoking the Pipeline

```bash
# Run CI tests locally
npm test

# Run review gate on a PR
npm run review:gate -- --pr <number>

# Run dedup check before creating issues
npm run dedup:check

# Check constellation health
npm run check:constellation
```

---

## 6. Data Flow Summary

```
roadmap.md ──▶ perpetual-motion.yml ──▶ GitHub Issue (@copilot)
                                              │
                                              ▼
                                        PR (code changes)
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                               ci.yml              review-gate.js
                            (168+ tests)          (4 structural checks)
                                    │                   │
                                    └─────────┬─────────┘
                                              ▼
                                        MERGE / BLOCK
                                              │
                                              ▼
                                    roadmap.md (depleted)
                                              │
                                              ▼
                                    ralph-watch.ps1 (refuel)
```

---

## 7. Key Scripts & Components

| Component | Path | Purpose |
|-----------|------|---------|
| Perpetual Motion | `.github/workflows/perpetual-motion.yml` | Roadmap → Issue automation |
| CI Pipeline | `.github/workflows/ci.yml` | Test gate (168+ vitest tests) |
| Safety Net | `.github/workflows/safety-net.yml` | Daily health checks |
| Review Gate | `scripts/review-gate.js` | 4-check PR validation |
| Dedup Guard | `scripts/dedup-guard.js` | Duplicate issue prevention |
| Constellation Health | `scripts/constellation-health.js` | 6-repo health check |
| Ralph Watch | `scripts/ralph-watch.ps1` | Layer 2 monitoring dashboard |
| Azure Launcher | `scripts/azure/start-satellites.sh` | VM satellite management |
| Constellation Config | `.squad/constellation.json` | Repo registry (6 repos) |

---

## 8. Related Documentation

- **[Constellation Map](constellation.md)** — all repos, relationships, and data flows
- **[Onboarding Guide](onboarding.md)** — adding a new downstream company
- **[Review Gate Guide](../.squad/guides/review-gate.md)** — detailed review gate usage
- **[CI Checks Guide](../.squad/guides/ci-checks.md)** — CI pipeline details
- **[Dedup Guard Guide](../.squad/guides/dedup-guard.md)** — dedup guard usage
- **[Azure Launcher](../scripts/azure/README.md)** — satellite VM setup
- **[Activation Guide](activation-guide.md)** — full system activation walkthrough

---

*Document maintained by Oracle (Product & Docs) · Last updated: 2026-03-19*
