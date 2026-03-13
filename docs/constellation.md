# Syntax Sorcery — Constellation Map

> Every repo, every relationship, every data flow.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Constellation Diagram](#2-constellation-diagram)
3. [Repository Details](#3-repository-details)
4. [Data Flows](#4-data-flows)
5. [Governance Model](#5-governance-model)
6. [Constellation Health](#6-constellation-health)
7. [Related Documentation](#7-related-documentation)

---

## 1. Overview

Syntax Sorcery governs a constellation of 6 repositories under the `jperezdelreal` GitHub account. The constellation follows a **hub/spoke model** where SS is the central hub providing governance, orchestration, and quality gates, while downstream repos operate semi-autonomously under SS's monitoring umbrella.

**Constellation registry:** `.squad/constellation.json`

---

## 2. Constellation Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SYNTAX SORCERY CONSTELLATION                    │
│                                                                     │
│                    ┌──────────────────────┐                          │
│                    │   Syntax Sorcery     │                          │
│                    │   (Company Hub)      │                          │
│                    │                      │                          │
│                    │  governance          │                          │
│                    │  orchestration       │                          │
│                    │  quality gates       │                          │
│                    │  monitoring (L1+L2)  │                          │
│                    └──────────┬───────────┘                          │
│                               │                                     │
│              ┌────────────────┼────────────────┐                    │
│              │                │                │                     │
│              ▼                ▼                ▼                     │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐           │
│  │ FirstFrame    │  │ ffs-squad-     │  │  (Future     │           │
│  │ Studios       │  │ monitor        │  │  companies)  │           │
│  │ (Studio Hub)  │  │ (Game Monitor) │  │              │           │
│  └───────┬───────┘  └────────────────┘  └──────────────┘           │
│          │                                                          │
│    ┌─────┼─────────────┐                                            │
│    │     │             │                                            │
│    ▼     ▼             ▼                                            │
│  ┌─────┐ ┌───────────┐ ┌────────────┐                              │
│  │flora│ │ComeRosq.  │ │pixel-bounce│                              │
│  │ 🌿  │ │    🍩     │ │    🕹️     │                              │
│  └─────┘ └───────────┘ └────────────┘                              │
│                                                                     │
│  ──▶ = governance/monitoring flows downward                        │
│  SS never monitors itself via downstream repos                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Details

### 3.1 Hub Repositories

| Repository | Type | Description | Key Files |
|------------|------|-------------|-----------|
| **[Syntax-Sorcery](https://github.com/jperezdelreal/Syntax-Sorcery)** | 🏠 Company Hub | Autonomous dev company — governance, orchestration, quality gates, monitoring | `roadmap.md`, `.squad/`, `scripts/`, `.github/workflows/` |
| **[FirstFrameStudios](https://github.com/jperezdelreal/FirstFrameStudios)** | 🎮 Studio Hub | AI gaming studio — game proposals, GDD pipeline, deployment coordination | `docs/gdds/`, proposals pipeline |

### 3.2 Game Repositories (FFS Downstream)

| Repository | Type | Stack | Description |
|------------|------|-------|-------------|
| **[flora](https://github.com/jperezdelreal/flora)** | 🌿 Game | PixiJS, TypeScript, Vite | Cozy gardening roguelite — 8×8 grid, 12 plant types, turn-based, encyclopedia |
| **[ComeRosquillas](https://github.com/jperezdelreal/ComeRosquillas)** | 🍩 Game | Vanilla JS, ES6 modules | Pac-Man clone with Simpsons theme — 8 mazes, 4-ghost AI, mobile touch |
| **[pixel-bounce](https://github.com/jperezdelreal/pixel-bounce)** | 🕹️ Game | HTML5 Canvas, vanilla JS | Endless climber arcade — touch/keyboard, moving platforms, particles |

### 3.3 Infrastructure Repositories

| Repository | Type | Description |
|------------|------|-------------|
| **[ffs-squad-monitor](https://github.com/jperezdelreal/ffs-squad-monitor)** | 📊 Monitor | Health monitoring for FFS game repos only (flora, ComeRosquillas, pixel-bounce) |

---

## 4. Data Flows

### 4.1 Governance Flow (Top → Down)

```
Syntax Sorcery
    │
    ├──▶ decisions.md          Architectural decisions, policies
    ├──▶ constellation.json    Registry of all 6 repos
    ├──▶ review-gate.js        PR validation standards
    ├──▶ ci.yml                Quality gate enforcement
    │
    └──▶ FirstFrameStudios
              │
              ├──▶ GDD pipeline     Game design → issues
              ├──▶ Proposal system   New game evaluation
              │
              └──▶ flora / ComeRosquillas / pixel-bounce
                        │
                        └──▶ roadmap.md → perpetual-motion.yml → @copilot
```

### 4.2 Monitoring Flow (Layered)

```
Layer 1 (GitHub Actions)
    │  SS self-monitors via perpetual-motion.yml, safety-net.yml, ci.yml
    ▼
Layer 2 (Local Hub)
    │  ralph-watch.ps1 monitors all 6 repos
    │  constellation-health.js validates operational status
    ▼
Layer 2.5 (Azure VM)
    │  5 tmux satellite sessions execute on downstream repos
    ▼
Layer 3 (ffs-squad-monitor)
       Monitors only: flora, ComeRosquillas, pixel-bounce
       Does NOT monitor SS or FFS hub
```

### 4.3 Code Delivery Flow (Per Repo)

```
roadmap.md
    │
    ▼ (perpetual-motion.yml)
GitHub Issue (assigned to @copilot)
    │
    ▼ (@copilot implements)
Pull Request
    │
    ├──▶ ci.yml (npm test)
    ├──▶ review-gate.js (4 checks)
    └──▶ Morpheus review (architecture)
            │
            ▼
      MERGE (squash) ──▶ roadmap depleted ──▶ ralph refuels
```

---

## 5. Governance Model

### 5.1 Decision Tiers

| Tier | Authority | Scope | Examples |
|------|-----------|-------|----------|
| **T0** | Founder only | Structural changes | New downstream companies, principle changes |
| **T1** | Morpheus (Lead) | Architecture | Quality gates, routing, skills, ceremonies |
| **T2** | Agent authority | Implementation | Test strategy, doc updates, scripts |
| **T3** | Auto-approved | Operations | Scribe log entries, history updates |

### 5.2 Upstream/Downstream Model

- **Upstream (SS):** Sets policies, maintains quality gates, monitors health
- **Downstream (FFS, games):** Operates semi-autonomously under SS governance
- **Gate-based readiness:** Downstream repos must meet SS audit criteria before activation
- **Max 3 features constraint:** Each downstream repo limited to 3 roadmap features per audit cycle

---

## 6. Constellation Health

### 6.1 Health Check Command

```bash
npm run check:constellation
```

This runs `scripts/constellation-health.js`, which validates all 6 repos for:

- `perpetual-motion.yml` workflow exists
- `roadmap.md` exists
- Recent workflow runs (not stale)

### 6.2 Health Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ Healthy | All checks pass, recent activity |
| ⚠️ Warning | Missing optional components |
| ❌ Unhealthy | Missing critical files or stale workflows |

---

## 7. Related Documentation

- **[System Architecture](architecture.md)** — full architecture with diagrams
- **[Onboarding Guide](onboarding.md)** — adding a new downstream company
- **[Activation Guide](activation-guide.md)** — full system activation walkthrough
- **[Constellation Config](../.squad/constellation.json)** — repo registry

---

*Document maintained by Oracle (Product & Docs) · Last updated: 2026-03-19*
