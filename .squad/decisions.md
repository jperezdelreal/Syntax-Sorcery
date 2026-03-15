# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ COMPLETE — All 6 workstream items operational

**What:** Phase 2 autonomy infrastructure fully delivered and operational. Three-layer architecture (Cloud + Watch + Manual) running at €0/month cost with <15min/week human intervention.

**Final Deliverables:**
- ✅ **A1:** Perpetual Motion Engine (PR #156) — Event-driven workflow, auto-creates issues from roadmap.md
- ✅ **A2:** Roadmap Bootstrap (PR #160) — 6 roadmaps × 3 features = 18 @copilot-ready work items
- ✅ **A3:** @copilot Issue Templates (PR #157) — 3 structured YAML forms with comprehensive guide
- ✅ **A5:** ralph-watch.ps1 Layer 2 (PR #161) — PowerShell watchdog with 6 failure modes, DryRun testing
- ✅ **B1:** FirstFrameStudios Page — GitHub Pages with live game embeds (verified operational)
- ✅ **B3:** Syntax Sorcery Main Page (PR #159) — Landing page with deploy fix

**Three-Layer Architecture:**
1. **Cloud (perpetual-motion.yml):** Event-driven (issues.closed) → Parse roadmap → Create issue → Assign @copilot
2. **Watch (ralph-watch.ps1):** 10min polling → Detect "Define next roadmap" → Open Squad session → Refuel
3. **Manual (Ralph sessions):** Human fallback for strategic decisions and blocked issues

**Validation:**
- ✅ Format compatibility: All roadmaps parse correctly with perpetual-motion.yml
- ✅ Scope lock: Max 3 features per repo (18 total), no new products
- ✅ Rate limiting: Max 1 open copilot-ready issue + 30min cooldown prevents runaway
- ✅ Hardening: Session timeout (30min), exponential backoff (5m→60m), stale lock detection (2h), log rotation (3-file), health checks (hourly), alert mechanism (cycle limit)

**Cost Analysis:** €0/month total
- Perpetual motion: €0 (GitHub Actions free tier)
- ralph-watch: €0 (local execution)
- GitHub Pages: €0 (free for public repos)
- Human time: <15 min/week (strategic oversight only)

**Key Learnings:**
1. Event-driven beats polling — Layer 1 primary, Layer 2 handles edge cases
2. Roadmap scope lock critical — Max 3 features prevents scope creep
3. DryRun mode essential — Testing without side effects is mandatory
4. Zero-cost autonomy viable — €0 infrastructure is production-ready

**Timeline:** 12 days (March 13 → March 24, 2026)  
**PRs Merged:** 6 (A1, A2, A3, A5, B3 + dependencies)  
**Issues Closed:** #148, #153 + supporting issues

**Status:** PERPETUAL MOTION ENGAGED. 🚀

---

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

See decisions-archive-2026-03-15.md for entries older than 2026-03-22.
**Last Updated:** 2026-03-15T03:31Z
