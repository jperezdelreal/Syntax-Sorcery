<div align="center">

# Syntax Sorcery

**Autonomous software development company powered by AI agents**

[![CI](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/ci.yml/badge.svg)](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/ci.yml)
[![Deploy Site](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/deploy-site.yml/badge.svg)](https://github.com/jperezdelreal/Syntax-Sorcery/actions/workflows/deploy-site.yml)
![Tests](https://img.shields.io/badge/tests-453%20passing-brightgreen)
![Node](https://img.shields.io/badge/node-20-blue)
![License](https://img.shields.io/badge/license-ISC-blue)
![Phase](https://img.shields.io/badge/phase-9%20complete-blueviolet)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

*Where code writes itself.*

</div>

---

## What Is Syntax Sorcery?

Syntax Sorcery is an autonomous software development company. AI agents design, build, test, and deploy software products with minimal human intervention — the founder reviews only edge cases. Built on [Squad](https://github.com/bradygaster/squad) by Brady Gaster.

**Current status:** Phase 9 complete · 6 repos in constellation · 629 tests (453 hub + 176 satellites) · Gameplay framework deployed · MCP server live · 24/7 Azure autonomy ready

📡 **[Constellation Status](https://jperezdelreal.github.io/Syntax-Sorcery/status/)** — Live health dashboard for all 6 repos

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
│   Review gate validates · CI runs 629 tests                │
│   Gameplay framework validates real features                │
│   Squad-watch monitors constellation health 24/7            │
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
| **Trinity** | Full-Stack Developer | Gameplay framework, MCP server, core tooling |
| **Tank** | Cloud Engineer | Azure infrastructure, session watchdog, deployment |
| **Switch** | Tester / QA | 629 unit tests, gameplay validation, CI, review gate |
| **Oracle** | Product & Docs | Product strategy, documentation, roadmapping |
| **@copilot** | Coding Agent | Code generation from issues, autonomous implementation |
| **Scribe** | Session Logger | Context hygiene, log rotation, archive management |
| **Ralph** | Work Monitor | Perpetual motion engine, roadmap-to-issue automation, Sprint Planning |

---

## Quick Start

```bash
# Clone
git clone https://github.com/jperezdelreal/Syntax-Sorcery.git
cd Syntax-Sorcery

# Install
npm install

# Run 629 tests
npm test

# Check constellation health
npm run check:constellation

# Monitor team operations
npm run squad:watch
```

---

## Key Infrastructure

| Component | What It Does |
|---|---|
| `perpetual-motion.yml` | Automated issue creation from roadmap (refuel via Sprint Planning) |
| `scripts/review-gate.js` | PR validation — linked issue, CI, files match |
| `scripts/dedup-guard.js` | Prevents duplicate issue creation |
| `scripts/constellation-health.js` | Checks all 6 repos for operational health |
| `scripts/squad-watch.js` | Real-time monitoring: team dashboard + CLI |
| `scripts/gameplay-framework.js` | Real gameplay validation via Puppeteer (not just unit tests) |
| `mcp-server/` | MCP server exposing squad state to Copilot ecosystem |
| `.github/workflows/ci.yml` | Runs 629 vitest tests on every PR and push |
| `scripts/azure/session-watchdog.sh` | Auto-restarts sessions every 6 hours to prevent context overflow |

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
| Phase 4 | ✅ Complete | Landing page premium design, constellation status page, architecture docs |
| Phase 5 | ✅ Complete | Autonomous metrics engine, 399 tests passing, performance dashboards |
| Phase 6 | ✅ Complete | Session reports, squad CLI, unified developer operations interface |
| Phase 7 | ✅ Complete | Security hardening, community kit (CONTRIBUTING, CODE_OF_CONDUCT), auto-deploy |
| Phase 8 | ✅ Complete | Azure autonomy: pre-flight validation, Bicep IaC, session watchdog, metrics dashboard, badge automation |
| Phase 8b | ✅ Complete | Downstream audit, MCP server, plugin marketplace, gameplay framework, runbook |
| Phase 9 | ✅ Complete | Gameplay testing pilot, squad-watch CLI, MCP enhancement, downstream integration, research, 629 tests, this documentation |

---

## Strategic Vision (Phase 10+)

### Phase 10: Test 3 Azure Launch
24/7 autonomous operation on Azure VM. Full constellation running: 629 tests passing, Bicep infrastructure live, session watchdog active, metrics dashboard public. Zero human intervention — founder monitoring only.

### Phase 11: Gameplay Testing Rollout
Expand gameplay framework to all downstream repos. Real-time gameplay validation CI. Autonomous game feature delivery pipeline.

### Phase 12: Platform Evolution
Plugin marketplace goes public. Enterprise MCP ecosystem integration. Multi-company federation (FFS + additional studios).

### Phase 13: Community & Open-Source
Public documentation for AI dev teams. Skills marketplace with community certifications. RFC process for community governance.

### Phase 14: Multi-Cloud & Scaling
AWS + Google Cloud support. Kubernetes constellation (50+ satellite repos). Global deployment with regional failover.

### Phase 15: Revenue & Sustainability
Premium plugin marketplace. Enterprise Squad licensing. Autonomous Company-as-a-Service offering.

---

## Contributing

We welcome contributions! Whether you're fixing a bug, suggesting a feature, or improving documentation — we'd love your help.

- 📖 **[Contributing Guide](CONTRIBUTING.md)** — PR workflow, code style, DI pattern, commit format
- 📜 **[Code of Conduct](CODE_OF_CONDUCT.md)** — Contributor Covenant v2.1

---

<div align="center">

**Syntax Sorcery** · Autonomous software, zero intervention

[Issues](https://github.com/jperezdelreal/Syntax-Sorcery/issues) · [Pull Requests](https://github.com/jperezdelreal/Syntax-Sorcery/pulls) · [Actions](https://github.com/jperezdelreal/Syntax-Sorcery/actions)

</div>
