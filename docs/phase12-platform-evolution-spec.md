# Phase 12: Platform Evolution — Marketplace, MCP Ecosystem, Multi-Company Federation

**Issue:** #114  
**Status:** Feasibility Spec  
**Date:** 2026-03-22  
**Researcher:** Oracle (Product & Docs)  
**Tier:** Platform Evolution — moves SS from autonomous internal tool to extensible platform

---

## TLDR

Phase 12 transforms Syntax Sorcery from an internal autonomous development company into an **extensible, federated platform**. Three interconnected initiatives: (1) **Plugin Marketplace** — public registry enabling community-contributed skills and integrations; (2) **Expanded MCP Ecosystem** — exposing Squad operations as tools to GitHub Copilot and enterprise AI systems; (3) **Multi-Company Federation** — governance model allowing multiple independent companies (FFS Phase 2, additional studios) to share SS infrastructure while maintaining operational autonomy.

**Why now?** Phases 10-11 complete the internal foundation (24/7 Azure autonomy + gameplay testing at scale). Phase 12 leverages that foundation to enable ecosystem participation, unlocking network effects and revenue opportunities.

**Azure budget impact:** +€150-200/mo for managed database (plugin registry metadata) and API tier enhancements. Total: €350-400/mo (within €500 budget). No multi-cloud expansion — Azure only per founder directive.

---

## 1. Problem Statement

### Current State (End of Phase 11)

- ✅ **Internal excellence:** SS runs 24/7 on Azure VM, autonomously delivering features across 5 game satellites (629 tests passing, 18+ issues/session, zero manual intervention)
- ✅ **Operational maturity:** Bicep IaC, session watchdog, branch protection, metrics dashboard, gameplay testing framework in place
- ✅ **Primitive extensibility:** Plugin marketplace infrastructure exists (`.squad/skills/`, metadata.json, CLI commands) but **not public-facing** — no registry, no discovery, no revenue model

### Constraints & Opportunities

**Problem 1: Isolated Ecosystem**
- Squad skills are private to constellation (CONTRIBUTING.md, code-of-conduct.md, skills live in SS repo only)
- Other AI development teams cannot discover, learn from, or reuse Squad patterns
- Network effects unrealized — Copilot ecosystem has 83K+ MCP servers + 25K+ awesome-copilot resources but SS contributes zero
- **Opportunity:** Publish Squad as reusable instructions for Copilot, expose via MCP for enterprise integrations

**Problem 2: Governance Vacuum for Multi-Company**
- FFS Phase 2 (expansion to new game studios) requires model for **shared infrastructure + independent roadmaps**
- Current constellation assumes single company hub (SS). Scaling to 2+ studios requires:
  - Cost model: shared vs independent resource allocation
  - Decision model: whose roadmap takes priority when Azure budget is tight
  - Data isolation: can FFS Phase 2 see SS internal decisions?
  - Incident escalation: who on-calls for shared infrastructure?
- **Opportunity:** Design federated governance before adding 2nd downstream company

**Problem 3: Untapped Revenue Model**
- Marketplace infrastructure exists but has no monetization path
- Premium plugins, enterprise MCP server, white-label licensing all viable but undefined
- €500/mo Azure budget is sustainable for single company but not for scaling to 10+ repos without revenue
- **Opportunity:** Define tier system (free vs premium plugins, enterprise MCP licensing, white-label SaaS model)

### Phase 12 Goals

1. **Enable ecosystem participation** — other AI dev teams access Squad patterns without cloning SS
2. **Establish multi-company governance** — FFS Phase 2 expansion has decision framework ready
3. **Create sustainable revenue model** — platform partially self-funds via plugin marketplace + enterprise licensing
4. **Position as platform** — shift narrative from "autonomous company" to "autonomous company *framework*"

---

## 2. Scope Boundaries

### IN SCOPE (Phase 12 Deliverables)

#### 2.1 Plugin Marketplace Go-Live (Issue #40)
- **Public registry:** GitHub-searchable catalog of Squad plugins (topic: `squad-plugin`)
- **Metadata standards:** Enhanced `metadata.json` with versioning, ratings, downloads, compatibility
- **Marketplace UI:** Landing page displaying trending/verified plugins (on site or GitHub Pages)
- **Community examples:** 3-5 community-written plugins demonstrating extensibility
  - Example: `squad-playwright-testing` — gameplay testing integration
  - Example: `squad-azure-monitoring` — constellation health metrics
  - Example: `squad-github-enterprise` — GitHub Enterprise integration
- **Publishing workflow:** Documented process for community to create + publish plugins
- **Acceptance criteria:**
  - 10+ discoverable plugins (mix of SS-authored + community)
  - Registry searchable via `npm run plugin -- search`
  - Marketplace page shows plugin popularity, ratings, download counts
  - Zero access control issues (plugins run with @copilot agent permissions)

#### 2.2 Expanded MCP Ecosystem (Issue #41)
- **Enterprise MCP Server:** Enhanced GitHub MCP server variant exposing full Squad state
  - Tools: list issues/PRs, query decisions, trigger sprint planning, analyze roadmap, fetch constellation metrics, retrieve agent history
  - Context: Decision log, Phase roadmaps, agent decision record (SKILL.md patterns)
  - Rate limits: 10K calls/month baseline, +€50 for unlimited tier
- **GitHub Copilot Integration:** @copilot agent can natively query Squad state via MCP
  - Enable: "Build a feature for Flora, check constellation capacity first"
  - Auto-route work to least-loaded satellite repo
  - Dependency-aware: sprint planning respects upstream/downstream constraints
- **Enterprise Integration Examples:**
  - Azure DevOps + Squad roadmap sync
  - Jira + Squad decision log sync
  - Slack bot exposing real-time metrics
- **Acceptance criteria:**
  - MCP server passes 50+ integration tests (mock Copilot client)
  - GitHub Copilot extension (if available) can invoke tools
  - Enterprise customers can integrate without modifying Squad core
  - Rate limiting enforced; premium tier pricing model documented

#### 2.3 Multi-Company Federation (Issue #42)
- **Governance model documented:** `.squad/federation.md` defining:
  - **Company tiers:** Hub (SS), Primary (FFS), Secondary (future studios)
  - **Resource allocation:** How €500/mo Azure budget splits across companies
  - **Decision authority:** Who owns roadmap priority, incident escalation, major features
  - **Data isolation:** Audit log who can read whose decisions/metrics
  - **Onboarding checklist:** 10-step process to add new company without manual intervention
- **Registry enhancement:** `constellation.json` extended to include:
  - Company metadata (name, studio, owner, budget allocation)
  - Inter-company dependencies (game A cannot deploy until library B passes)
  - Governance tier (hub vs spoke vs federated)
- **Cost model:** Documented split of shared vs independent infrastructure
  - Shared: GitHub Actions CI, Bicep IaC templates, monitoring (€200/mo base)
  - Independent per company: Azure VM, storage, database (€75/mo per satellite)
  - Example: 2 companies = €200 + €75×2 = €350/mo
- **Acceptance criteria:**
  - Federation model reviewed + approved by founder (T0 decision)
  - FFS Phase 2 (2nd game studio) can be onboarded via documented checklist without code changes
  - Audit log confirms data isolation works (company A cannot read company B decisions)
  - Cost calculator tool exists; budget allocation transparent

### EXPLICITLY OUT OF SCOPE (Phase 13+)

- **White-label SaaS:** Hosting managed Squad instances for external customers (Phase 15)
- **Multi-cloud expansion:** AWS/Google Cloud support (VETOED by founder — Azure only)
- **Community governance:** RFC process, voting on strategic decisions (Phase 13)
- **Skills marketplace monetization:** Premium skill tiers, skill certifications (Phase 15)
- **Kubernetes scaling:** 50+ satellite orchestration (Phase 14)
- **Compliance certifications:** GDPR, SOC2, HIPAA (post-GA, commercial phase)

---

## 3. Technical Feasibility

### 3.1 Platform Maturity Assessment

**Dependency Readiness:** Phase 12 requires Phases 10-11 complete

| Phase | Target | Status | Risk | Blockers |
|-------|--------|--------|------|----------|
| **Phase 10** | Test 3 Azure Launch | Planned | 🟢 Low | None — infrastructure proven |
| **Phase 11** | Gameplay Testing Rollout | Planned | 🟢 Low | None — framework exists |
| **Phase 12** | Platform Evolution | **This spec** | 🟡 Medium | MCP library maturity (external dependency) |

**Feasibility verdict:** ✅ **FEASIBLE** given these constraints:

1. **Plugin marketplace** — existing infrastructure (`.squad/skills/`, CLI commands). Effort: 2-3 weeks to build registry + UI + examples
2. **MCP ecosystem** — GitHub MCP server is battle-tested (27K+ stars). Adaptation effort: 2-3 weeks to extend for Squad operations
3. **Multi-company governance** — pure documentation + light code changes to `constellation.json` schema. Effort: 1-2 weeks

### 3.2 Azure Budget Impact

#### Baseline (Phase 11)
- **Compute:** B2s_v2 VM (€60/mo) × 1 hub + 1 FFS satellite = €120/mo
- **Storage:** 50GB managed disks (€10/mo)
- **GitHub:** Free (unlimited)
- **Database:** None (JSON files in git)
- **Total:** ~€150/mo (within €500 budget)

#### Phase 12 Additions
- **Plugin registry database:** Azure Cosmos DB (multi-company data, metadata indexes)
  - Dev tier: €30/mo (suitable for phase 12 beta)
  - Production tier: €150+/mo (post-GA)
- **API gateway + throttling:** API Management service for MCP server rate limiting
  - €50/mo
- **Content delivery:** Marketplace UI served via CDN (part of static site, no additional cost)
- **Monitoring:** Extended Insights for enterprise MCP (included in B2s_v2)
- **Total Phase 12 delta:** +€80-100/mo

**New budget:** €230-250/mo (still within €500 limit with room for Phase 13-14 additions)

### 3.3 Implementation Path

**Phased rollout (not big-bang):**

1. **Sprint 1 (Week 1-2):** Plugin marketplace
   - GitHub topic auto-discovery (`squad-plugin`)
   - Marketplace UI PoC (10 plugins)
   - Community contribution docs

2. **Sprint 2 (Week 3-4):** MCP ecosystem
   - Extended MCP server (list all Squad operations as tools)
   - Enterprise server variant with rate limiting
   - 50+ integration tests

3. **Sprint 3 (Week 5-6):** Federation & multi-company
   - Federation governance document + decision
   - Enhanced `constellation.json` schema
   - Audit log implementation
   - Onboarding checklist for FFS Phase 2

4. **Sprint 4 (Week 7-8):** Integration & hardening
   - All 3 components working together
   - Performance benchmarking (marketplace queries, MCP throughput)
   - Security audit (plugin sandboxing, data isolation)

### 3.4 Technology Choices (Azure-Only Constraint)

**Plugin Registry Database Options:**

| Option | Cost | Fit | Risk |
|--------|------|-----|------|
| **Azure Cosmos DB** | €30-150/mo | ✅ Full-featured, multi-region-ready | None |
| **Azure Table Storage** | €2-5/mo | ⚠️ Primitive, no rich indexing | Scaling beyond 10K plugins requires rework |
| **Azure SQL Database** | €15-50/mo | ✅ Familiar RDBMS, good for relational metadata | Overkill for Phase 12 |

**Recommendation:** Cosmos DB (scale-ready, document model aligns with plugin metadata.json, global replication for future multi-region federation)

**MCP Server Hosting:**

| Option | Cost | Fit | Risk |
|--------|------|-----|------|
| **Azure Container Instances (ACI)** | €50-80/mo | ✅ Lightweight, auto-scaling | Cold starts if traffic sparse |
| **App Service (Standard tier)** | €75/mo | ✅ Production-grade, 24/7 uptime SLA | Slightly expensive for phase 12 beta |
| **Azure Functions** | €0.20 per M calls | ✅ Pay-per-use, serverless | Billed per invocation (transparency risk if spikes) |

**Recommendation:** Azure Container Instances for MVP (predictable €50/mo cost), migrate to Functions if demand exceeds 10M calls/month

---

## 4. Key Components

### 4.1 Plugin Marketplace

#### Architecture
```
Squad Plugin Ecosystem:

GitHub (Source of Truth)
  ├─ jperezdelreal/* repos with topic: squad-plugin
  ├─ metadata.json per plugin
  └─ SKILL.md (skill definition)
         │
         ▼
Plugin Registry (Cosmos DB)
  ├─ Indexed by: name, domain, rating, downloads
  ├─ Metadata: version, author, compatibility, stats
  └─ Ratings: (average, count, newest, trending)
         │
         ▼
Marketplace UI (GitHub Pages)
  ├─ Search plugins by domain/tags
  ├─ Display rating, download count, last updated
  ├─ "Install" button → npm run plugin -- install owner/repo
  └─ Community examples + docs
         │
         ▼
CLI Integration (existing)
  npm run plugin -- search "testing patterns"
  npm run plugin -- install owner/repo
```

#### Key Metrics
- **Plugins:** Target 10 by end of Phase 12 (5 SS-authored, 5 community)
- **Downloads:** Tracking via GitHub API clones stat (proxy metric)
- **Rating system:** 1-5 stars, minimum 3 ratings to display
- **Update frequency:** Registry refreshes hourly via GitHub Actions job

#### Security Considerations
- **Plugin permissions:** Plugins run with @copilot agent permissions (no sandboxing initially)
- **Vetting:** Community plugins require T1 review before Marketplace feature
- **Malware scanning:** Integrate OWASP dependency-check into plugin CI
- **Deprecation:** Old plugins (6+ months without updates) marked "legacy" but not removed

### 4.2 Expanded MCP Ecosystem

#### Enterprise MCP Server Toolset

**Core Tools:**
```
squad_list_issues(owner?, repo?, state="all") → [{id, title, labels, body}]
squad_list_prs(owner?, repo?, state="all") → [{id, title, reviewers, status}]
squad_query_decisions(domain?, status?) → [{date, author, title, decision, impact}]
squad_get_roadmap(repo?) → [{item, phase, owner, status, acceptance_criteria}]
squad_get_metrics(repo?, since="7d") → {velocity, throughput, quality_rate, test_count}
squad_trigger_sprint_planning() → {session_id, status, created_issues}
squad_list_constellation() → [{repo, company, owner, budget_allocation, status}]
squad_fetch_skill(name) → {name, description, domain, patterns, examples}
squad_analyze_capacity(repo?) → {cpu_usage%, memory_usage%, active_agents, queue_depth}
```

**Context Tools:**
```
squad_read_document(path: ".squad/decisions.md" | ".squad/agents/*/history.md") → {content}
squad_search_history(keyword, since_date?) → [{match, context, relevance}]
```

#### Rate Limiting Tiers

| Tier | Calls/Month | Cost | Audience | Features |
|------|-------------|------|----------|----------|
| **Free** | 1K | Free | Individual developers | Read-only tools (list issues, decisions, metrics) |
| **Team** | 100K | €50/mo | Small companies (2-5 repos) | Read + trigger tools (sprint planning, capacity checks) |
| **Enterprise** | 1M | €200/mo | Large orgs | Full API + audit logging + SLA |

#### GitHub Copilot Integration

**Enable:** Copilot users can invoke Squad tools via custom instructions

```yaml
# Custom instruction (community-contributed)
name: "@squad-aware"
description: "Query Syntax Sorcery squad state before making decisions"
context: |
  When planning work that affects multiple repos, use these tools:
  - squad_list_constellation() — understand which repos exist
  - squad_analyze_capacity() — find the least-loaded repo
  - squad_query_decisions() — check if similar work was attempted
  - squad_get_metrics() — understand team velocity/throughput

example: |
  User: "Add login feature to Flora"
  Copilot invokes:
    squad_list_constellation() → finds Flora (game repo)
    squad_get_metrics("flora") → 3 active agents, 2.5 features/day velocity
    squad_query_decisions(domain="authentication") → finds Auth decisions from Phase 8
  Result: Proposes implementation respecting existing auth patterns
```

#### Acceptance Criteria
- MCP server passes 50+ unit tests
- Integration tests with mock Copilot client (simulating real calls)
- Latency: P99 < 500ms per tool invocation
- Rate limiting enforced (client gets `429 Too Many Requests` when over quota)
- Premium tier activated with test payment method

### 4.3 Multi-Company Federation

#### Governance Model Document (`.squad/federation.md`)

**Structure:**
```
# Federation Governance

## Company Tiers
- Hub (SS): Central governance, master roadmap, shared infrastructure decisions
- Primary (FFS): Gaming studio, semi-autonomous roadmap, shared resource pool
- Secondary: Future studios under same federation rules

## Budget Allocation Algorithm
shared_base = €200 (GitHub, Bicep templates, monitoring)
per_company = €75 × N
total = shared_base + per_company × num_companies
  
Example: 2 companies = €200 + €75×2 = €350/mo

## Decision Authority Matrix
  Hub        Primary    Secondary   Veto Power
Roadmap       YES       SEMI        NO         Hub (unless unanimous dissent)
Incident      YES       YES         CONSULT    Hub (authority)
Major Feature YES       YES         NO         Hub + 1 other required
Promotion     YES       YES         NO         All companies (consensus)

## Data Isolation Rules
Company A cannot:
  - Read Company B's .squad/decisions/ directory
  - View Company B's sprint backlog
  - Access Company B's agent history (SKILL.md learning)
  - But CAN see: shared constellation metrics, shared roadmap, public decisions

## Audit Log
Every access to cross-company data logged with:
  - Timestamp, actor, company, resource, action, result
  - Automatic daily report to Hub
  - Weekly audit review by governance lead

## Onboarding Checklist (New Company)
1. Create GitHub org/repo
2. Copy Squad structure (.squad/, scripts/, .github/workflows/)
3. Register in constellation.json (company object)
4. Allocate budget ($X/mo from shared pool)
5. Assign governance tier (Hub/Primary/Secondary)
6. Create 3 initial roadmap items
7. Run preflight validation + activate Ralph
8. Add to monitoring dashboard
9. Invite to Sprint Planning ceremony (monthly)
10. Document in onboarding.md for reference
```

#### Enhanced `constellation.json` Schema

```json
{
  "version": "2.0",
  "federationModel": "hub-spoke-federation",
  "companies": [
    {
      "id": "ss-hub",
      "name": "Syntax Sorcery",
      "tier": "hub",
      "repos": ["jperezdelreal/Syntax-Sorcery"],
      "budgetAllocation": {
        "currency": "EUR",
        "monthlyLimit": 200,
        "shared": true
      },
      "governance": {
        "decisionAuthority": "founder",
        "roadmapOwner": "morpheus"
      }
    },
    {
      "id": "ffs-primary",
      "name": "FirstFrame Studios",
      "tier": "primary",
      "repos": [
        "jperezdelreal/FirstFrameStudios",
        "jperezdelreal/flora",
        "jperezdelreal/ComeRosquillas",
        "jperezdelreal/pixel-bounce"
      ],
      "budgetAllocation": {
        "currency": "EUR",
        "monthlyLimit": 150,
        "shared": false
      },
      "governance": {
        "decisionAuthority": "lead",
        "roadmapOwner": "trinity"
      },
      "dataIsolation": {
        "canRead": ["shared-decisions", "constellation-metrics"],
        "canWrite": ["own-decisions", "own-roadmap"]
      }
    }
  ],
  "auditLog": {
    "enabled": true,
    "location": ".squad/audit/",
    "retention": "90d"
  }
}
```

#### Cost Transparency Dashboard

**Landing page widget:**
```
Federation Budget Allocation

Total Monthly: €350 / €500 limit

├─ Shared Infrastructure:     €200 (57%)
│  ├─ GitHub Actions CI       €30
│  ├─ Bicep IaC templates     €20
│  ├─ Monitoring (Insights)   €60
│  └─ API Management          €90
│
├─ Syntax Sorcery Hub:        €75 (21%)
│  ├─ Azure VM (B2s_v2)       €60
│  └─ Storage                 €15
│
└─ FirstFrame Studios:        €75 (21%)
   ├─ Azure VM (B2s_v2)       €60
   └─ Storage                 €15

Next budget review: 2026-04-22
```

---

## 5. Dependencies

### Must Complete Before Phase 12 Start

- ✅ **Phase 10 — Test 3 Azure Launch** (Issue #37)
  - Rationale: Plugin marketplace requires @copilot agent infrastructure (Azure VM, perpetual motion)
  - Blocker if: VM not running 24/7 — marketplace examples won't execute

- ✅ **Phase 11 — Gameplay Testing Rollout** (Issue #38-39)
  - Rationale: One reference community plugin: `squad-playwright-testing` depends on gameplay framework
  - Blocker if: Gameplay framework breaks — examples won't validate

### External Dependencies (Out of SS Control)

| Dependency | Risk | Mitigation |
|------------|------|-----------|
| **GitHub API rate limits** | 🟡 Medium | Implement caching layer for constellation data; refresh hourly |
| **Azure Cosmos DB reliability** | 🟢 Low | Fallback to JSON file-based registry if DB unavailable |
| **MCP library maturity** | 🟡 Medium | Monitor https://github.com/punkpeye/awesome-mcp-servers; adapt if API changes |
| **Copilot extensions API stability** | 🟡 Medium | Test against latest Copilot version; version-pin MCP library |

---

## 6. Risks & Open Questions

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Plugin security:** Malicious plugin steals agent credentials | 🟡 Medium | 🔴 Critical | Implement sandboxing; code review all community plugins before Marketplace listing |
| **MCP server rate limiting fails:** Copilot overwhelms API | 🟡 Medium | 🟡 Medium | Load testing with 100K/hr throughput; implement exponential backoff |
| **Cosmos DB costs exceed budget:** Spike in metadata queries | 🟢 Low | 🟡 Medium | Use dev tier for Phase 12; migrate to Functions if costs exceed €50/mo |
| **Data isolation breach:** Company A reads Company B decisions | 🟢 Low | 🔴 Critical | Implement Row-Level Security (RLS) on Cosmos DB; quarterly audit |
| **Plugin incompatibility:** Community plugin breaks @copilot | 🟡 Medium | 🟡 Medium | Compatibility matrix in metadata.json; CI test all plugins quarterly |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Marketplace spam:** Low-quality plugins dilute discovery | 🟡 Medium | 🟡 Medium | Require 3-star minimum rating to feature; hide <1-star plugins |
| **Support burden:** Community plugins require maintenance | 🟢 Low | 🟡 Medium | Document that community plugins are unsupported; liability waiver in CONTRIBUTING.md |
| **Federation governance fails:** Conflicting roadmaps paralyze decision-making | 🟢 Low | 🔴 Critical | Weekly sync ceremony; founder has veto power; escalation to T0 for deadlocks |
| **FFS Phase 2 onboarding takes 2 weeks:** Checklist incomplete | 🟡 Medium | 🟡 Medium | Automate 8 of 10 steps; dry-run with test repo first |

### Open Questions

**Q1: Should free vs premium plugins be technically enforced, or honor-system?**
- Current: All plugins equal (no license enforcement)
- Option A: Separate namespaces (`squad-plugins/` vs `squad-enterprise-plugins/`)
- Option B: Honor-system + documentation only
- **Decision deferred to:** Phase 13 (when revenue model stabilizes)

**Q2: Can Copilot @agent invoke squad_trigger_sprint_planning()?**
- Risk: Unattended agents spawn infinite issue chains
- Safeguard: Require human confirmation? Rate limit to 1x/day?
- **Decision deferred to:** Security review (Phase 12 week 4)

**Q3: What if a downstream company wants multi-cloud (AWS satellite)?**
- Current policy: Azure only (founder veto)
- Workaround: Separate "Federation Lite" (shared Azure hub, independent AWS satellites)?
- **Decision required:** T0 (founder) — out of scope for this spec

**Q4: How does plugin versioning interact with agent skill learning?**
- Plugin v1.0 teaches agent pattern X
- Plugin updates to v1.1 with breaking change
- Agent trained on v1.0 now runs against v1.1 — incompatibility?
- **Mitigation:** Semantic versioning enforced; CI pin plugin versions to roadmap phases

---

## 7. Proposed Sub-Issues (Breakdown of Epic #114)

### Phase 12 Epic Breakdown

**#40 — Plugin Marketplace Go-Live** (Assigned: @copilot / squad:trinity)
- **Complexity:** 🟢 Medium (2-3 weeks)
- **Acceptance Criteria:**
  - GitHub topic `squad-plugin` auto-discovery working
  - Marketplace UI displays 10+ plugins with ratings
  - Community contribution docs + examples (3 reference plugins)
  - `npm run plugin -- search` returns ranked results
  - 50+ unit tests for registry
- **Dependencies:** Phase 10-11 complete

**#41 — Expanded MCP Ecosystem** (Assigned: @copilot / squad:tank)
- **Complexity:** 🟡 Medium-High (3-4 weeks)
- **Acceptance Criteria:**
  - Enterprise MCP server with 12 tools (list/query/trigger operations)
  - Rate limiting enforced (Free/Team/Enterprise tiers)
  - 50+ integration tests passing
  - GitHub Copilot integration example (custom instructions)
  - SLA documentation (latency, availability targets)
- **Dependencies:** Phase 10-11 complete, MCP library v0.7+ available

**#42 — Multi-Company Federation** (Assigned: squad:oracle / squad:morpheus)
- **Complexity:** 🟢 Medium (2-3 weeks)
- **Acceptance Criteria:**
  - `.squad/federation.md` written + reviewed (T1 decision)
  - Enhanced `constellation.json` schema validated
  - Audit log implementation (logs to `.squad/audit/`)
  - Onboarding checklist tested with dry-run repo
  - Cost transparency widget on landing page
  - FFS Phase 2 governance tier assigned
- **Dependencies:** Phase 10-11 complete, founder governance decision (T0)

**#114-documentation — Phase 12 Specification Review** (Assigned: squad:oracle)
- **Complexity:** 🟢 Low (1 week)
- **Acceptance Criteria:**
  - This spec document reviewed + approved (T1)
  - Spec linked in issue #114 + roadmap.md Phase 12
  - Marketing narrative prepared (public-facing announcement)
  - Feasibility verified (Azure cost model confirmed)

---

## 8. Cost Implications & Budget Allocation

### Phase 12 Total Cost of Ownership

#### One-Time Costs (Phase 12 Development)
- Developer time: ~8 weeks × 1 FTE = ~€8K (absorbed in salary, not incremental)
- Marketplace UI design: €1K (or free if using GH Pages template)
- Security audit (plugin + data isolation): €2K
- **Total: €3K**

#### Monthly Recurring Costs (Post-Phase 12)

| Resource | Unit | Phase 11 | Phase 12 | Delta | Justification |
|----------|------|---------|---------|-------|---------------|
| **Compute (B2s_v2 VMs)** | €60/ea/mo | €60 (1 hub) | €120 (1 hub + 1 FFS) | +€60 | FFS Phase 2 satellite (planned Phase 11, accounted here) |
| **Cosmos DB** | €30-150/mo | €0 | €30 | +€30 | Plugin registry metadata + multi-company data |
| **API Management** | €50/mo | €0 | €50 | +€50 | MCP server rate limiting + throttling |
| **Storage (disks)** | €10/mo | €10 | €15 | +€5 | 50GB→75GB for constellation audit logs |
| **Total Monthly** | | €70 | €215 | +€145 | **Projected Phase 12: €215-250/mo** |

**Budget Status:**
- Limit: €500/mo
- Phase 12 burn: €215-250/mo
- Headroom: €250-285/mo (for Phase 13-14 additions)
- Risk tolerance: 🟢 Safe (51% utilization)

#### Contingency & Overage Scenarios

**Scenario A: Plugin registry traffic exceeds 100K queries/day**
- Current Cosmos DB: €30/mo (dev tier, 400 RU/s)
- Required: €150/mo (standard tier, 4000 RU/s)
- Delta: +€120/mo
- **Action:** Migrate to Azure Functions (pay-per-use) — cost becomes €10-40/mo instead

**Scenario B: MCP server invoked 10M times/month**
- Current Container Instances: €50/mo
- Migrating to Functions: €100-150/mo estimated
- **Action:** Tiered pricing model — charge Enterprise tier €200/mo to offset costs

**Scenario C: FFS Phase 2 launches with 2 additional studios**
- Additional compute: 2 × €60/mo = +€120/mo
- Additional storage: 2 × €5/mo = +€10/mo
- Total: €345/mo (69% utilization)
- **Action:** Still within budget; may trigger Phase 15 revenue model if scaling continues

---

## 9. Timeline & Milestones

### Phase 12 Roadmap (Assuming Phase 10-11 Complete by Late April 2026)

```
Week 1-2: Sprint 1 — Plugin Marketplace MVP
├─ Issue #40 created (Squad: Trinity)
├─ Marketplace UI scaffold (GitHub Pages template)
├─ Community example plugins: 3x validated
└─ Target: 10 plugins discoverable

Week 3-4: Sprint 2 — MCP Ecosystem
├─ Issue #41 created (Squad: Tank)
├─ Enterprise server: 12 tools implemented
├─ Rate limiting: Free/Team/Enterprise tiers
└─ Target: 50 integration tests passing

Week 5-6: Sprint 3 — Federation & Governance
├─ Issue #42 created (Squad: Oracle + Morpheus)
├─ federation.md written + T1 review
├─ constellation.json schema v2.0
├─ Audit log scaffold
└─ Target: FFS Phase 2 onboarding checklist ready

Week 7-8: Sprint 4 — Integration & Hardening
├─ All 3 components integrated
├─ Security audit (plugins, data isolation)
├─ Performance benchmarking
├─ Documentation review
└─ Target: Phase 12 epic #114 CLOSED

**Contingency:** +1-2 weeks if MCP library update breaks compatibility
**Success criteria:** All 3 initiatives (40, 41, 42) shipped + merged to master
```

---

## 10. Acceptance & Decision Criteria

### Phase 12 Is DONE When

1. ✅ Issue #40 CLOSED: Marketplace has 10+ discoverable plugins, search working, 50+ unit tests
2. ✅ Issue #41 CLOSED: MCP server running on Azure, all 12 tools callable, rate limiting enforced, 50+ integration tests
3. ✅ Issue #42 CLOSED: Federation governance documented, constellation.json v2.0 deployed, audit log active, FFS Phase 2 tier assigned
4. ✅ Phase 12 epic #114 CLOSED: Specification validated, all sub-issues resolved, no regressions in Phase 10-11 features

### Decision Checkpoints

| Checkpoint | Decision Maker | Decision | Default | |
|-----------|-----------------|----------|---------|---|
| **Plugin sandboxing required?** | Squad:Switch (security) | Yes/No sandbox model | No (honor-system) | Week 2 |
| **Copilot _trigger_sprint_planning()_ safe?** | Squad:Morpheus (architecture) | Require human confirm or hard rate limit | Rate limit 1x/day | Week 4 |
| **Multi-company data isolation: RLS or separate DBs?** | Squad:Tank (cloud) | Azure SQL RLS or separate Cosmos accounts | Separate accounts (higher cost, simpler) | Week 5 |
| **Phase 13 roadmap: include community governance RFC?** | Founder (T0) | Yes/No | Yes (assumes Phase 12 success) | Week 8 |

---

## 11. Related Documentation

- `.squad/decisions.md` — Team decisions (Azure-only policy, refueling v2, federation tier assignment)
- `docs/ecosystem-research.md` — Awesome-Copilot, MCP servers, Azure AI context
- `docs/plugins.md` — Existing plugin guide (will be enhanced for Phase 12)
- `docs/constellation.md` — Hub/spoke topology (will evolve to federation model)
- `docs/onboarding.md` — Company onboarding (will include federation checklist)
- `.squad/federation.md` — NEW — Governance model (to be written in Phase 12 Sprint 3)
- `roadmap.md` — Project roadmap (Phase 12 items 40-42 will move from "Planned" to "In Progress")

---

## 12. Appendix: Glossary

**Federation:** Multi-company governance model where Syntax Sorcery hub coordinates with independent downstream studios (FFS Phase 2, future studios)

**Hub-Spoke Topology:** Central hub (SS) provides governance, orchestration, quality gates; spokes (game studios) operate semi-autonomously

**MCP (Model Context Protocol):** Standard for exposing tools/context to AI models; used by GitHub Copilot, Claude, other LLMs

**Plugin Marketplace:** Public registry of Squad-compatible skills (`.squad/skills/`) that can be discovered, installed, and rated

**Multi-Company Data Isolation:** Mechanism preventing Company A from reading Company B's internal decisions, though public constellation metrics remain visible

**Enterprise MCP Server:** Extended variant of GitHub MCP server exposing full Squad operations (metrics, decisions, roadmap) with rate limiting and audit logging

**Tier (Decision Tiers):**
- **T0:** Founder decision (veto power, strategic direction)
- **T1:** Architecture decision (Morpheus, binding on all agents)
- **T2:** Implementation decision (delivery lead, binding on assigned squad member)

---

**Spec Status:** 🟢 READY FOR REVIEW  
**Next Step:** Oracle submits spec to issue #114, requests T1 decision on federation governance + T0 decision on Copilot integration scope
