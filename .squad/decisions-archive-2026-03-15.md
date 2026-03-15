# Squad Decisions Archive — 2026-03-15

**Archived:** 2026-03-15T03:31:00Z by Scribe  
**Reason:** decisions.md at 14.36KB (exceeds 12KB hard limit). Archived Phase 15 entries from 2026-03-15 (older than 7 days); retained Phase 22-24 entries (within 7 days) in main file for active reference.

## Recent Archived Entries (2026-03-15)

### 2026-03-15T02:00Z: PR Re-Review Process — Security & Reliability Gates

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Quality Gate Authority)  
**Status:** ✅ COMPLETE  

**Context:** Round 2 review blocked two PRs with critical issues. Trinity assigned blocker issues #143 and #142 to fix both PRs. Re-review conducted after fixes pushed.

**Decisions:**
- **PR #140 (GitHub Token Provisioning):** ✅ APPROVED & MERGED
  - Bicep cloud-init sets `/etc/profile.d/github-token.sh` permissions to `0600` (owner-only)
  - `/etc/environment` removed from setup-github-token.sh (no system-wide world-readable storage)
  - Token storage limited to secure locations: `~/.config/gh/hosts.yml` (0600), `~/.bashrc` (0600), `/etc/profile.d/github-token.sh` (0600)
  - **Outcome:** Closed #143 (permissions blocker), #125 (parent issue) auto-closed on merge

- **PR #141 (24-Hour Monitoring):** ✅ APPROVED & MERGED
  - `gh_retry()` function with `max_attempts=3`, exponential backoff `[2, 4, 8]` seconds
  - ALL 5 gh CLI calls wrapped with retry logic
  - **Outcome:** Closed #142 (retry logic blocker), #128 (parent issue) auto-closed on merge

**Key Learnings:**
1. Surgical verification: Check actual implementation vs. documentation examples
2. Exponential backoff standard: 3 attempts with [2s, 4s, 8s] balances reliability vs. responsiveness
3. Wrapper functions scale: `gh_retry()` pattern reusable across multiple scripts
4. Approval vs. merge authority: Lead can gate-keep via merge when operating from same account

**Impact:**
- Phase 10.3 & 10.6 complete (2/6 issues)
- Security: All token storage now 0600 (owner-only)
- Reliability: GitHub API rate limits handled with exponential backoff

---

### 2026-03-15T01:35Z: Phase 14 Scaling & High-Availability Spec Delivered

**By:** Oracle #1 (Product/Research)  
**Tier:** T1 (Phase Authority — pending Morpheus approval)  
**Status:** ✅ DELIVERED (PR #145 opened, pending review)

**What:** Oracle #1 delivered comprehensive Phase 14 Scaling & High-Availability research spec (docs/phase14-scaling-ha-spec.md). Spec covers multi-region failover, load balancing, database replication, and monitoring strategy for 10K+ concurrent users.

**Architecture:**
- Azure-exclusive (Standard Load Balancer, Traffic Manager, multi-region setup)
- Database: Cosmos DB multi-region replication (strong consistency in primary, eventual in replicas)
- Monitoring: Azure Monitor + Application Insights with 5-minute SLA enforcement
- Network: DDoS protection (Standard tier), WAF enabled

**Cost Model:**
- Infrastructure baseline: €439/mo (€250/mo primary, €189/mo disaster recovery)
- Scaling elasticity: ±€50/mo per 100K MAU
- Within €500 budget (headroom: €61/mo)

**Key Risks Identified:**
- Multi-region failover testing complexity in rapid sprint cycles
- Eventual consistency in replicas requires application-level conflict resolution
- DDoS protection upgrade needed if attack patterns emerge

**Decisions (Pending T1 Approval):**
- Primary region: EU-West (Ireland) vs. EU-North (Sweden)? → Defer to Sprint Planning
- Failover RTO/RPO targets: 15 min RTO / 5 min RPO? → Validate against SLA
- Database strong consistency scope: Global or primary-region only? → Primary-only (lower latency)

**Status:** ✅ SPEC DELIVERED, PR #145 ready for Morpheus review  
**Label Removed:** `go:needs-research` from #116

---

### 2026-03-15T01:37Z: Phase 15 Revenue & Sustainability Model Delivered

**By:** Oracle #2 (Product/Research)  
**Tier:** T1 (Phase Authority — pending Morpheus approval)  
**Status:** ✅ DELIVERED (PR #146 opened, pending review & revision)

**What:** Oracle #2 delivered Phase 15 Revenue & Sustainability Model research spec (docs/phase15-revenue-spec.md). Spec covers €11.6K/mo conservative baseline model + €25K/mo optimistic upside, freemium player acquisition strategy (Stripe, paywall at feature-tier), and enterprise partnerships (Copilot, GitHub, Azure).

**Conservative Model (PRIMARY — Weeks 1–8):**
- 50 customers (founder referrals + organic via GitHub)
- 20% plugin adoption (10 plugins/customer)
- €16/mo per plugin subscription
- **Total:** €1.6K/mo plugins + €10K/mo SaaS = **€11.6K/mo** revenue target

**Freemium Strategy:**
- Tier 1 (Free): 5 games, basic Squad skills, read-only status dashboard
- Tier 2 (Pro): Unlimited games, premium Squad skills, write API, advanced metrics (€24/mo)
- Tier 3 (Enterprise): Custom skills, dedicated Squad agent, SLA support (€249+/mo)

**Payment Processing & Partnerships:**
- Payment processor: Stripe (recommended, EU-compliant, agent-friendly APIs)
- GitHub Marketplace integration: Revenue split TBD (40-60% GitHub vs SS)
- Azure credits partnership: Negotiable, low priority Phase 15

**Infrastructure Scaling (Phased, Revenue-Contingent):**
- Weeks 1–8 (PRIMARY): €480/mo lean tier (B2s v2 VM, basic monitoring, 2-hour CI window)
- Weeks 9–16: €520/mo ONLY if €2K+/mo revenue covers delta (scaling contingent on proven demand)
- Weeks 17+: €600-700/mo ONLY after €10K+/mo proven (premium tier investment)

**Success Metrics:**
- €15K/mo by week 16 (proof of product-market fit)
- 20K signed-up users by week 16
- <5% monthly churn rate
- >25% enterprise conversion rate (5+ of 20 enterprise outreach targets)

**Status:** ✅ SPEC DELIVERED, PR #146 ready for Morpheus review  
**Label Removed:** `go:needs-research` from #117

---

## Phase 1-14 Historical Entries

See decisions-archive-2026-03-15.md (moved at 2026-03-15T12:00:00Z).

**Last Updated:** 2026-03-15T03:31Z

### 2026-03-14: P1-07 Skills Cherry-Pick Complete

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**What:** Cherry-picked 16 domain-agnostic FFS skills into SS. Adapted 6 (removed game refs), direct-copied 10. Skipped 4 game-specific. SS total: 20 skills, all <15KB. upstream.json ready on FFS PR #197.  
**Why:** Skills reuse is primary ROI of upstream/downstream model. FFS's 21 weeks of operational wisdom inherited into SS without game baggage.

### 2026-03-14: P1-09 Cost Alerting System — Azure Budget Protection

**By:** Tank (Cloud Engineer)  
**Status:** COMPLETE  
**What:** Three-tier cost alerts (€400→P1, €450→P0, €480→auto-kill) via GitHub Actions + Azure CLI. Proactive overspend projection. Dry-run mode. Zero Azure cost.  
**Why:** €500/mo budget is hard constraint. Early alerts + auto-remediation prevent overspend incidents. GHA option eliminates Azure Monitor cost.  
**Activation:** Requires AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID secrets.

### 2026-03-14: P1-10a GDD Template Specification — Machine-Executable Spec

**By:** Oracle (Product & Docs)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Finalized GDD template (YAML frontmatter + 10 markdown sections) + Trinity's parsing specification. YAML controls priority/labels. Validated vs Flora GDD (37 issues). No ambiguity.  
**Why:** GDD→Issue pipeline (P1-10b) needs executable spec. Prevents per-GDD custom logic. Enables scale to 100s of games.  
**Artifacts:** docs/gdd-template.md, docs/gdd-issue-mapping.md

### 2026-03-14: P1-10b GDD→Issue Autonomous Pipeline — Fully Automated Issue Generation

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Built Node.js parser + GitHub Actions workflow for fully autonomous GDD→GitHub Issues conversion. Script parses YAML frontmatter + 10 GDD sections, generates complete issue tree per Oracle's spec. Dry-run mode for safe testing. Tested with "Chrono Tiles" game (31 issues generated correctly with auto labels/priorities). js-yaml added as dependency.  
**Why:** Pipeline eliminates manual issue creation, enables GDD-driven development, scales to 100s of games. Zero cost (GHA). Unblocks P1-10c (GDD submission gate) and P1-12 (integration testing).  
**Constraints Respected:** No hardcoded game logic. Design Pillars correctly skipped. GitHub Actions unlimited budget. Zero Azure cost.  
**Artifacts:** scripts/gdd-to-issues.js, .github/workflows/gdd-to-issues.yml, docs/gdds/examples/test-game.md

### 2026-03-14: P1-14 FFS Visibility Audit — Showcase Remediation Roadmap

**By:** Oracle (Product & Docs)  
**Status:** COMPLETE  
**Tier:** T2  
**What:** Comprehensive audit of GitHub Pages, blog, game playability. Grade: 🟡 AMBER (60%). ComeRosquillas playable but not discoverable. FLORA no web build. Blog inactive. Missing "Play Games" page. 7 P0/P1 blockers identified. Remediation: 8–12 hrs (Trinity owner).  
**Why:** Founder requires games visible+playable+impressive. Current state blocks requirement 1 (playability proof) and 2 (visibility).  
**Next:** Trinity remediation this week (before Phase 1 close-out).

### 2026-03-15: P1-12 FFS Integration Testing Report

**By:** Switch (Tester/QA)  
**Status:** 🟡 AMBER — 3 PASS, 4 WARNING, 0 FAIL  
**Tier:** T2  
**What:** Comprehensive integration test of Phase 1 deliverables against FFS main branch. Skills cherry-pick (P1-07) ✅, Cost Alerting (P1-09) ✅, GDD Pipeline (P1-10b) ✅. Context Remediation (P1-04), Governance Swap (P1-05), Ralph Hardening (P1-08) blocked by unmerged FFS PRs #196/#197.  
**Why:** SS-side implementation complete; FFS-side merge gate required to confirm upstream/downstream integration.  
**Recommendation:** Morpheus merge FFS PRs #196/#197 to unlock Phase 1 verification on main branch.  
**Deliverable:** `.squad/decisions/inbox/switch-integration-report.md`

### 2026-03-15: P1-13 SS Self-Audit Report

**By:** Switch (Tester/QA)  
**Status:** COMPLETE  
**Tier:** T2  
**Grade:** 🟢 B (0.71) — Up from D (0.43)  
**What:** Comprehensive self-assessment across 5 categories (Context Health 0.87/A, Architecture 0.33/F, Squad Setup 0.67/C, Governance 0.83/B, Autonomy 0.83/B). Context hygiene strong; Architecture weak (zero tests, 19 outdated deps); Governance & Autonomy excellent (tier system clear, zero human issues, Ralph/cost-alerting live, squad heartbeat working).  
**Critical Violation:** Oracle history.md at 8.59KB exceeds 8KB hard limit per context-hygiene SKILL. Requires Scribe summarization.  
**Systemic Gap:** CI uses 15KB generic limit; SKILL specifies 8KB/12KB per-type limits. Founder directive ("hygiene systemic") requires CI enforcement.  
**Deliverable:** `.squad/decisions/inbox/switch-self-audit.md`

### 2026-03-15: P1-11 Proposal→Prototype Pipeline — COMPLETE

**By:** Trinity (Full-Stack Developer)  
**Status:** COMPLETE  
**Tier:** T1  
**What:** Implemented full 6-stage pipeline: Proposal (YAML) → GDD (@copilot) → Issues (gdd-to-issues.js) → Code (@copilot) → Build (GHA) → Deploy (Pages). 5 foundation scripts (validate-proposal.js, proposal-to-gdd.js, pipeline-orchestrator.js, create-pipeline-labels.js, extended gdd-to-issues.js), 2 GHA workflows (proposal-pipeline.yml, implement-game.yml), 1 game repo template (build-deploy.sh), 1 test proposal (chrono-tiles.md). Label-based state machine (pipeline:*) for Ralph monitoring.  
**Key Decisions:** No LLM calls from scripts (deterministic). GDD generation via @copilot issue (human/bot flow). Static-first auto-detect for game repos. Unified build+deploy workflow.  
**Cost:** €0 (GitHub Actions unlimited).  
**Deliverable:** All scripts + workflows + templates in Syntax-Sorcery repo. Documented in `.squad/agents/trinity/history.md`
