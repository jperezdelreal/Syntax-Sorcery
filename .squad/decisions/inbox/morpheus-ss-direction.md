# Strategic Direction — Syntax Sorcery
**Author:** Morpheus (Lead/Architect)  
**Date:** 2026-03-15  
**Requested by:** jperezdelreal (founder)  
**Classification:** T1 Architecture Decision

---

## 1. Reality Audit — What Actually Exists

### ✅ What works
- **756 tests pass locally** (22 fail — pixel-bounce gameplay test has a `game.cleanup()` bug)
- **Scripts infrastructure is real:** 20+ operational scripts (squad-cli, metrics-engine, security-audit, bootstrap, dedup-guard, review-gate, etc.) with test coverage
- **MCP server** exists with source code and build config
- **GitHub Actions workflows:** 15 workflows configured (CI, deploy, perpetual-motion, security, triage, etc.)
- **Site source code** exists — Astro + Tailwind, Matrix-themed landing page, fully built
- **Documentation** is extensive — architecture, gameplay testing, onboarding, etc.
- **roadmap.md items 1-18** are genuinely delivered (CI, health monitoring, dedup guard, PR review gate, README, landing page, session reports, CLI, E2E tests, metrics engine, bootstrap, security audit, community kit, deploy pipeline)

### ❌ What's broken RIGHT NOW
1. **GitHub Pages 404** — The SS site gives a 404. Root cause: `deploy-site.yml` uses Node 20, but the installed Astro version requires Node ≥22.12.0. Every deploy run fails at the build step. **This is a 1-line fix** (change `node-version: '20'` to `'22'` in deploy-site.yml).
2. **CI pipeline failing on GitHub** — Same Node 20 issue. The CI matrix is `[20]` only. Astro build fails. Tests likely also need Node 22 to run cleanly in CI. **Also a small fix.**
3. **22 local test failures** — All in `pixel-bounce.test.js`. The `game` variable is undefined in `afterEach` because some test setup fails. Not catastrophic but CI shows red.
4. **Azure VM (#112)** — The only open issue. Never deployed. Bicep templates exist as code but have never been `az deployment` applied. No Azure resources are running. Zero cloud infrastructure.

### 📄 What's paper (exists as specs/code, never validated in production)
- **Roadmap items 19-36** — Marked `[x]` but many are scripts that have never run against real infrastructure (Azure Bicep template, session watchdog, preflight validation, downstream audit, plugin marketplace, gameplay testing framework). The code exists and tests mock the behavior, but nothing has been deployed.
- **Phases 12-15** — Oracle-invented specs (phase13-community-opensource-spec.md, phase14-scaling-ha-spec.md, phase15-revenue-sustainability-spec.md). These are 955+ line fantasy documents. **Founder has rejected these.** They should be archived or deleted.
- **Perpetual motion engine** — The workflow exists and is well-designed, but with CI broken, the whole loop is inert.
- **Plugin marketplace, MCP server** — Code exists, tests pass against mocks. No users, no deployment, no real integration.

---

## 2. Honest Assessment

**The system is impressive engineering with zero deployment.** We have ~800 tests, 20+ scripts, 15 workflows, an MCP server, a full Astro site, and exhaustive documentation — all running on localhost against mocks. Nothing is deployed. Nothing is live. Nothing is generating value outside this repo.

The team spent enormous energy on:
- Specs for phases that don't exist yet (12-15)
- Internal tooling that has no external users
- Test infrastructure that validates mocks, not reality
- A perpetual motion engine that can't run because CI is broken

Meanwhile, the two things the founder can actually show someone — the SS website and the Azure VM — don't work.

**This is a classic architecture astronaut problem.** We built the launch pad, the mission control, the telemetry system, and the crew training program. We never launched the rocket.

---

## 3. What Should SS Focus On THIS WEEK

### Priority 0: Fix what's broken (Day 1 — hours, not days)

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Fix deploy-site.yml: Node 20 → 22 | Any agent | 10 min | SS site goes live |
| Fix ci.yml: Node matrix 20 → 22 | Any agent | 10 min | CI goes green |
| Fix pixel-bounce test failures | Switch | 1-2 hours | 778/778 tests green |

**These three fixes make the entire system operational.** CI green → perpetual motion works → deploy pipeline works → site is live. This is the single highest-leverage work possible.

### Priority 1: Azure VM deployment (Days 2-3)

Issue #112 is the ONLY open issue and it's been open for weeks. This is the real blocker to autonomous operation.

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Deploy Azure B2s_v2 via Bicep | Tank | 1 day | Infra exists |
| Validate session watchdog works | Switch | 0.5 day | 24/7 operation |
| Run preflight checks on real VM | Tank | 0.5 day | Proven infrastructure |

**Budget reality:** B2s_v2 in West Europe ≈ €30-35/mo. We have €500/mo budget and are spending €0. We can afford this trivially.

### Priority 2: Clean up the mess (Day 3-4)

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Archive/delete Phase 12-15 specs from docs/ | Morpheus | 30 min | Remove false signals |
| Clean roadmap.md: remove items 40-51 (Phases 12-15) | Morpheus | 30 min | Honest roadmap |
| Remove AWS/GCP references from Phase 14 | Morpheus | 15 min | Respect founder veto |
| Validate roadmap items 19-36 are real | Switch | 1 day | Ground truth |

### Priority 3: Prove autonomous value (Week 1-2)

Once the VM is running and CI is green, the actual test of SS is: **can it autonomously deliver features to downstream repos?**

| Task | Owner | Effort | Impact |
|------|-------|--------|--------|
| Run perpetual motion end-to-end on 1 downstream repo | Tank + Trinity | 2 days | Proof of concept |
| Verify @copilot actually completes an issue autonomously | Morpheus (gate) | 1 day | Real validation |
| Founder reviews 1 autonomously-delivered feature | Founder | 30 min | Go/no-go signal |

---

## 4. What's Blocking Progress

### Things agents can do NOW
- Fix the Node version (trivial)
- Fix the failing tests (straightforward)
- Deploy Azure Bicep (scripts exist)
- Clean up rejected specs

### Things that need the founder
- **Azure subscription confirmation** — Do we have an active Azure subscription? Can agents authenticate via `az login`? This is the real blocker for #112.
- **GitHub Pages settings** — The Pages API says `status: "building"` but deploys fail. The workflow permissions look correct, but the founder may need to verify the Pages source is set to "GitHub Actions" (not "Deploy from branch") in repo settings.
- **Direction validation** — Does the founder want SS focused on (a) proving autonomous development works with FFS games, or (b) making SS itself a product? This fundamentally changes what we build next.

---

## 5. Strategic Direction — My Recommendation

**Stop building infrastructure. Start proving the thesis.**

SS's thesis is: "AI agents can autonomously develop software." We have all the infrastructure we need. What we don't have is proof. The next month should be:

### Week 1: Make everything real
- Fix CI + deploy (hours)
- Deploy Azure VM (days)
- Clean roadmap of fantasy phases

### Week 2: First autonomous sprint
- Pick ONE downstream repo (flora, ComeRosquillas, or pixel-bounce)
- Define 3 concrete features in that repo's roadmap
- Let the perpetual motion engine + @copilot deliver them without human intervention
- Measure: how many completed? How long? What quality?

### Week 3-4: Scale or iterate
- If autonomous delivery works → scale to all 3 repos, start thinking about what's next
- If it doesn't → diagnose why and fix the real problems (not build more tooling around it)

**No new phases. No specs. No grandiose plans.** Just: does the system actually work end-to-end?

---

## 6. Rejected / Archived

| Item | Status | Reason |
|------|--------|--------|
| Phases 12-15 (Oracle specs) | ❌ REJECTED | Founder directive — Oracle doesn't define strategic direction |
| ralph-watch.ps1 | ❌ REJECTED | Founder directive — 1 terminal per repo model |
| Centralized roadmaps from Oracle | ❌ REJECTED | Decentralized — local Leads own their roadmaps |
| AWS/GCP anything | ❌ VETOED | Azure only, founder directive |
| Phase 14 multi-cloud | ❌ VETOED | Contradicts Azure-only principle |

---

## 7. Decision

**I, Morpheus, as Lead/Architect and owner of Syntax Sorcery, direct the following:**

1. **Immediate:** Fix Node version in CI + deploy workflows. Fix pixel-bounce tests. This unblocks everything.
2. **This week:** Deploy Azure VM (#112). This has been deferred too long.
3. **This week:** Archive Phase 12-15 specs. Clean roadmap.md to reflect reality.
4. **Next week:** Run first REAL autonomous sprint on a downstream repo. Measure results.
5. **Standing order:** No agent defines new phases or strategic direction without my explicit approval. Oracle researches when asked. Morpheus decides.

The goal is simple: **by end of next week, we should have 1 feature autonomously delivered to a downstream repo, with a working SS website, running on Azure infrastructure.** That's the milestone. Everything else is noise.

---

*"I didn't say it would be easy, Neo. I just said it would be the truth."*
