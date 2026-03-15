# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-03-22T03:00Z: Perpetual Motion Event Logging & Rate Limiting Architecture

**By:** Tank (Cloud Engineer)  
**Tier:** T2 (Implementation)  
**Issue:** #149  
**PR:** #156  
**Status:** ✅ IMPLEMENTED (PR #156 ready for review)

**What:** Enhanced perpetual-motion.yml workflow with event logging, rate limiting, and concurrency control to prevent runaway GitHub Actions costs while maintaining event-driven autonomy.

**Key Decisions:**
1. **Event Logging:** Structured JSON to `.squad/motor-log/YYYY-MM-DD.json` (daily, ISO 8601 timestamps) for programmatic analysis and git history
2. **Rate Limiting:** 30-minute cooldown between runs (vs. cron polling rejected for event-driven requirement) — reads motor-log, calculates time since last event
3. **Concurrency Control:** `concurrency.group: perpetual-motion-${{ github.repository }}` with `cancel-in-progress: false` (prevents race conditions, ensures data integrity)
4. **Motor Log Persistence:** Git history (vs. GitHub Issues API rejected for query difficulty, vs. artifact uploads rejected for 90-day retention limit)
5. **Documentation:** 40+ line ASCII-art header explaining all 5 safety mechanisms (self-documenting for maintainers)

**Impact:** Critical path A1 unblocked. Enables autonomous roadmap progression across all repos.  
**Cost:** €0 (GitHub Actions free tier)  
**Deployment:** Immediate on merge (Syntax-Sorcery active, cross-repo rollout pending roadmap.md creation)

---

### 2026-03-22T00:00Z: FirstFrame Studios GitHub Page — Issue #150 Closure

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Issue:** #150  
**PR:** #155  
**Status:** ✅ VERIFIED COMPLETE (issue closed, PR #155 with docs verification)

**What:** FirstFrame Studios GitHub Pages site was already complete since 2026-03-13 (3 game embeds live). Decision: Verified all acceptance criteria met and closed issue rather than rebuilding.

**Technical Stack:**
- Framework: Astro 4.x (static site generation)
- Styling: Tailwind CSS with glass-morphism effects
- Deployment: GitHub Pages (€0 cost)
- Build Time: 1.38s (well under 30s requirement)
- CI/CD: Auto-deploy on push via deploy-pages.yml

**Acceptance Criteria Verified (All ✅):**
- Astro SSG site deployed to https://jperezdelreal.github.io/FirstFrameStudios/
- Hero section: "FirstFrame Studios — AI-Powered Game Development"
- Game Grid with 3 cards (Flora, ComeRosquillas, Pixel Bounce)
- Responsive design (mobile + desktop)
- All game embeds functional (iframes, zero CORS errors)
- Auto-deploy workflow operational

**Key Decision:** Verification over rebuild — when work already complete, verify → document → close (avoids waste)

**Impact:** First public-facing deliverable for FFS downstream company (marketing + shareable URL)  
**Cost:** €0 (GitHub Pages free tier)

---

### 2026-03-22T03:30Z: Phase 13 Feasibility Spec Approved — Community Opens

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ APPROVED & MERGED (PR #144)

**What:** Oracle's Phase 13 Community & Open-Source Feasibility Spec (955 lines, 15 sections) approved. Spec outlines three initiatives: (1) Public Documentation (Architecture Playbook, Squad Operations Manual, Autonomous Company Playbook), (2) Skills Marketplace with Community Vetting (Bronze/Silver/Gold certification tiers, community reviewer program), (3) Community Governance & RFC Process (weighted voting, decision log auto-publisher, transparent roadmap).

**Evaluation:**
- ✅ **Comprehensive:** Clear AC, realistic 10-week timeline, detailed sub-issues (#43-45)
- ✅ **Azure-only:** All tech choices explicitly Azure (Cosmos DB, Static Web Apps, AD B2C); multi-cloud vetoed per founding principles
- ✅ **Budget:** €240-250/mo Phase 13 burn (48-50% utilization), €250-260/mo headroom vs €500 limit
- ✅ **Dependency:** Phase 12 completion identified as blocker (marketplace, federation, MCP)
- ✅ **Community Model:** RFC voting weighted by contribution level; founder veto preserved; reviewer rotation prevents burnout
- ✅ **Risk Mitigated:** RFC spam gate (20-min read requirement), Gold cert quality bar (SS verification), phased rollout (docs → vetting → governance)

**Key Decisions:**
- **RFC Voting Threshold:** 60% weighted approval + founder veto override (threshold vs. supermajority deferred to Sprint 4)
- **Gold Certification Authority:** Deferred to Sprint 3 (test Bronze/Silver first)
- **IP Liability:** Deferred to T0 (legal review if proprietary game code concerns arise)
- **Roadmap Voting:** Quarterly batches (continuous for hot topics, T0-veto-able)

**Outcome:** ✅ APPROVED & MERGED. Sub-issues #43-45 ready for Phase 13 Sprint Planning.

**Phase Progression:**
- Phase 10: ✅ Complete
- Phase 11: Gameplay Testing (underway, Phase 10.7-11.5)
- Phase 12: Platform Evolution (target June 2026, on track for Phase 12 Sprint Planning by May)
- Phase 13: Community & Open-Source (NEW, T1 approved, ready for Sprint 1 Week 1)

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
**Status:** ✅ DELIVERED (PR #146 opened, pending review)

**What:** Oracle #2 delivered comprehensive Phase 15 Revenue & Sustainability research spec (docs/phase15-revenue-sustainability-spec.md). Spec outlines three-tier SaaS model, enterprise licensing, and professional services revenue streams targeting €22K/mo by month 6.

**Revenue Model:**
- **Tier 1 (Basic):** €49/mo — Small teams, 5 agents, 1000 tasks/mo, community support
- **Tier 2 (Pro):** €149/mo — Growing teams, 20 agents, 10K tasks/mo, email support
- **Tier 3 (Enterprise):** Custom (€500-5K/mo) — Custom agents, dedicated support, SLA guarantees
- **Revenue Split:** Subscriptions (65%), Enterprise contracts (25%), Professional services (10%)

**Go-to-Market Timeline (16 weeks):**
- Weeks 1-4: Market validation, early access program, feature parity enforcement
- Weeks 5-8: Public beta (5K users, €8K/mo revenue target)
- Weeks 9-12: General availability (20K users, €15K/mo target)
- Weeks 13-16: Enterprise outreach (5+ contracts, €22K/mo target)

**Cost Structure:**
- COGS: 15-20% (Azure infrastructure + payment processing)
- Marketing/Sales: 25-30% (community-first strategy, no paid ads initially)
- Operations: 20-25% (support, compliance, monitoring)
- Target operating margin: 25-30% (€5.5-6.6K/mo by month 6)

**Key Risks Identified:**
- Market demand validation required in weeks 1-4 (go/no-go gate)
- Churn risk if enterprise features delayed beyond week 8
- Payment processing compliance (PCI-DSS, VAT, multi-currency)

**Decisions (Pending T1 Approval):**
- Payment processor: Stripe vs. Adyen vs. AWS Billing? → Recommend Stripe (EU-compliant, agent-first integrations)
- Free tier (freemium) or free trial only? → Trial-only (churn risk mitigated, conversion clearer)
- Community contribution discount: 10% for active contributors? → Defer to Sprint 2 (loyalty program)

**Success Metrics:**
- €15K/mo by week 16 (proof of product-market fit)
- 20K signed-up users by week 16
- <5% monthly churn rate
- >25% enterprise conversion rate (5+ of 20 enterprise outreach targets)

**Status:** ✅ SPEC DELIVERED, PR #146 ready for Morpheus review  
**Label Removed:** `go:needs-research` from #117

---

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

### 2026-03-22T02:00Z: Phase 13 Research — Community & Open-Source Initiative

**By:** Oracle (Product & Docs)  
**Status:** ✅ RESEARCH COMPLETE — T1 approved & merged (see Phase 13 Feasibility Spec Approved entry above)

---

## Governance

| Tier | Authority | Scope |
|------|-----------|-------|
| T0 | Founder only | New downstream companies, principles changes, critical .squad/ structural changes |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing |
| T2 | Agent authority | Implementation details, test strategies, doc updates |
| T3 | Auto-approved | Scribe ops, history updates, log entries |

---

See decisions-archive-*.md for entries older than 2026-03-15.
**Last Updated:** 2026-03-15T01:40Z
