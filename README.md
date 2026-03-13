<div align="center">

# Syntax Sorcery

**Autonomous software development company powered by AI agents**

[![CI](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/ci.yml/badge.svg)](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-168%20passing-brightgreen)
![Node](https://img.shields.io/badge/node-20-blue)
![License](https://img.shields.io/badge/license-ISC-blue)
![Phase](https://img.shields.io/badge/phase-3%20complete-blueviolet)

*Where code writes itself.*

</div>

---

## What Is Syntax Sorcery?

Syntax Sorcery is an autonomous software development company. AI agents design, build, test, and deploy software products with minimal human intervention — the founder reviews only edge cases. Built on [Squad](https://github.com/bradygaster/squad) by Brady Gaster.

**Current status:** Phase 3 complete · 6 repos in constellation · 168 tests · 6 PRs merged autonomously

---

## How It Works

Syntax Sorcery runs on a **perpetual motion engine** — an autonomous cycle that continuously delivers software:

```
┌─────────────────────────────────────────────────────────────┐
│                  PERPETUAL MOTION ENGINE                    │
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │ ROADMAP  │───▶│  ISSUE   │───▶│  AGENT   │             │
│   │ (refuel) │    │ (create) │    │ (build)  │             │
│   └────▲─────┘    └──────────┘    └────┬─────┘             │
│        │                               │                    │
│        │                               ▼                    │
│   ┌────┴─────┐    ┌──────────┐    ┌──────────┐             │
│   │  DEPLETE │◀───│  MERGE   │◀───│    PR    │             │
│   │ roadmap  │    │ (gate ✓) │    │ (review) │             │
│   └──────────┘    └──────────┘    └──────────┘             │
│                                                             │
│   Ralph monitors · Dedup guard prevents duplicates          │
│   Review gate validates · CI runs 168 tests                 │
└─────────────────────────────────────────────────────────────┘
```

**Three steps, zero human intervention:**

1. **Ralph watches** — monitors the roadmap for pending work items, creates GitHub issues
2. **Agents build** — @copilot writes code, Switch tests, Morpheus reviews PRs
3. **Gate merges** — review gate validates linked issues, CI passes, PR merges automatically

---

## Constellation

Syntax Sorcery governs a constellation of 6 repositories through a hub/spoke model:

| Repository | Type | Description |
|---|---|---|
| [**Syntax-Sorcery**](https://github.com/jperezdelreal/Syntax-Sorcery) | 🏠 Hub | Autonomous dev company — governance, orchestration, quality gates |
| [**FirstFrameStudios**](https://github.com/jperezdelreal/FirstFrameStudios) | 🎮 Studio Hub | AI gaming studio — game proposals, GDD pipeline, deployment |
| [**flora**](https://github.com/jperezdelreal/flora) | 🌿 Game | Autonomous game project under FFS |
| [**ComeRosquillas**](https://github.com/jperezdelreal/ComeRosquillas) | 🍩 Game | Autonomous game project under FFS |
| [**pixel-bounce**](https://github.com/jperezdelreal/pixel-bounce) | 🕹️ Game | Autonomous game project under FFS |
| [**ffs-squad-monitor**](https://github.com/jperezdelreal/ffs-squad-monitor) | 📊 Monitor | Health monitoring for FFS game satellites |

---

## Team

| Agent | Role | Responsibility |
|---|---|---|
| **Morpheus** | Lead / Architect | Architecture decisions, PR reviews, quality gates |
| **Trinity** | Full-Stack Developer | Pipeline scripts, GDD parser, core tooling |
| **Tank** | Cloud Engineer | Azure infrastructure, Ralph hardening, deployment |
| **Switch** | Tester / QA | 168 unit tests, CI, review gate, constellation health |
| **Oracle** | Product & Docs | Documentation, product strategy, skills system |
| **@copilot** | Coding Agent | Code generation from issues, autonomous implementation |
| **Scribe** | Session Logger | Context hygiene, log rotation, archive management |
| **Ralph** | Work Monitor | Perpetual motion engine, roadmap-to-issue automation |

---

## Quick Start

```bash
# Clone
git clone https://github.com/jperezdelreal/Syntax-Sorcery.git
cd Syntax-Sorcery

# Install
npm install

# Run 168 tests
npm test

# Check constellation health
npm run check:constellation
```

---

## Key Infrastructure

| Component | What It Does |
|---|---|
| `perpetual-motion.yml` | Automated issue creation from roadmap |
| `scripts/review-gate.js` | PR validation — linked issue, CI, files match |
| `scripts/dedup-guard.js` | Prevents duplicate issue creation |
| `scripts/constellation-health.js` | Checks all 6 repos for operational health |
| `.github/workflows/ci.yml` | Runs 168 vitest tests on every PR and push |

---

## Documentation

| Document | Description |
|---|---|
| [**Architecture**](docs/architecture.md) | System architecture — perpetual motion, hub/spoke, 3-layer monitoring, quality gates |
| [**Constellation Map**](docs/constellation.md) | All 6 repos, relationships, data flows, governance model |
| [**Onboarding Guide**](docs/onboarding.md) | Step-by-step guide for adding a new downstream company |
| [**Activation Guide**](docs/activation-guide.md) | Full system activation walkthrough |

---

## Built With

- **[Squad](https://github.com/bradygaster/squad)** — AI agent orchestration framework by Brady Gaster
- **GitHub CLI** + **GitHub Actions** — automation backbone
- **Azure** — satellite VM infrastructure (€500/mo budget)
- **Vitest** — 168 tests across 7 test files
- **Node.js 20** — runtime

---

## Progress

| Phase | Status | Highlights |
|---|---|---|
| Phase 0 | ✅ Complete | Team infrastructure, context hygiene, skills system |
| Phase 1 | ✅ Complete | FFS takeover, integration testing, constellation governance |
| Phase 2 | ✅ Complete | 168 unit tests, E2E pipeline coverage, proposal→prototype validation |
| Phase 3 | ✅ Complete | CI quality gate, dedup guard, review gate, Azure launcher |

---

<div align="center">

**Syntax Sorcery** · Autonomous software, zero intervention

[Issues](https://github.com/jperezdelreal/Syntax-Sorcery/issues) · [Pull Requests](https://github.com/jperezdelreal/Syntax-Sorcery/pulls) · [Actions](https://github.com/jperezdelreal/Syntax-Sorcery/actions)

</div>
