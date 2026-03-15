# Squad Decisions Archive

**Archived:** 2026-03-13T10:57:00Z by Scribe  
**Reason:** decisions.md exceeded 15KB alert threshold. Archived audit/assessment entries (P1-01 through P1-03, P1-06) for reference; active work decisions retained in main file.

## Archived Entries

### 2026-03-13: P1-01 FFS Read-Only Audit Complete
**By:** Morpheus (Lead/Architect)
**Status:** COMPLETE
**What:** FFS constellation grades C overall (0.68). Hub context bloat critical: decisions-archive 627KB (12.5× over 50KB limit), growth-framework 55KB, new-project-playbook 45KB. Downstream repos (ComeRosquillas B, Flora C, ffs-squad-monitor B) have clean context but governance/autonomy gaps. Top 3 remediation priorities: (1) Hub context bloat, (2) triage workflow sync, (3) test infrastructure.
**Why:** Audit-first approach validates FFS maturity before intervention. C-grade is acceptable per readiness gates.

### 2026-03-14: P1-02 Template Bloat Resolution
**By:** Morpheus (Lead/Architect)
**Status:** DECIDED
**What:** Templates 65KB (31 files, largest 6.7KB) accepted as-is. Framework-provided scaffolding, on-demand loading only, CI already excludes. No individual file violates 15KB limit. Non-template .squad/ files (83.9KB) flagged as separate P1 concern.
**Why:** Templates are reference material, not operational bloat. Restructuring breaks Squad framework. Limit applies to operational files that inflate context windows.

### 2026-03-13: P1-03 FFS Context Health Map Complete
**By:** Oracle (Product & Docs)
**Status:** COMPLETE
**What:** FFS context health YELLOW (C+). Critical violations: decisions-archive.md (642KB—42× limit), aaa-gap-analysis.md (38KB—2.5× limit). Active governance files healthy (6/7 <15KB with TLDR layers). Remediation: split archives by era, index creation, domain-specific split for gap analysis. Post-remediation frees ~165K tokens/session (27% budget improvement).
**Why:** Context bloat is bottleneck. Efficient archive structure enables downstream operations at scale.

### 2026-03-13: P1-06 FFS Skills Inventory Complete
**By:** Oracle (Product & Docs)
**Status:** COMPLETE
**What:** 34 FFS skills classified: 22 domain-agnostic (→SS cherry-pick), 12 game-specific (→FFS reference), 3 overlapping (merge), 2 flagged hidden dependencies. Immediate cherry-pick: feature-triage, multi-agent-coordination (CRITICAL for SS parallel work).
**Why:** Skills classification enables efficient cherry-pick migration without game-baggage bloat.

---

### 2026-03-20T04:00Z: Decision — Phase 7 Roadmap: Elite Readiness

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ DEFINED
**Date:** 2026-03-20

**What:** Phase 7 roadmap defined after Phase 6 completion. Strategic shift: Phases 2-3 built the engine, Phase 4 built the showroom, Phase 5 built operational intelligence, Phase 6 made the system self-proving, Phase 7 makes the system *elite-ready* — secure, community-open, and fully automated end-to-end. Three items mixing deep infrastructure + visible polish + automation completion:

1. **Security hardening — dependency audit, secret scanning, SBOM** (#62) — GitHub Actions workflow + local script for supply chain security. 
pm audit fails CI on high/critical vulns. Regex-based secret scanning catches leaked tokens. CycloneDX SBOM generation for transparency. 
pm run security + squad-cli integration. The responsible autonomy signal: 345 tests prove it works, security audit proves it's safe.
2. **Community contribution kit** (#61) — CONTRIBUTING.md (PR workflow, code style, DI pattern), CODE_OF_CONDUCT.md (Contributor Covenant v2.1), issue templates (bug, feature, squad task) with YAML form syntax, PR template with review checklist. The final showroom piece: README explains, landing page impresses, contribution kit WELCOMES.
3. **Automated site deployment pipeline** (#60) — GitHub Actions deploys Astro site to GitHub Pages on push to main. Path-filtered triggers (site/**, docs/**), build caching, concurrency control, OIDC deployment. The final automation piece: code → CI → security → deploy. Zero manual steps.

**Rationale:** The engine runs (Phase 2-3), the showroom shines (Phase 4), the system reports on itself (Phase 5), and it proves its own correctness (Phase 6). But it can't verify its supply chain is secure (no audit), can't welcome external contributors (no templates), and can't deploy without manual intervention (no CD pipeline). Phase 7 closes all three — the system becomes elite-ready. Security + Community + Automation = production-grade open-source project.

**Impact:** Roadmap items 13-15 marked done. Items 16-18 added. Issues #60, #61, #62 created with label squad. Board refueled — Ralph can assign to @copilot.

---

### 2026-03-24T12:00Z: Phase 2 Autonomy Infrastructure Complete — Perpetual Motion Engaged

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ COMPLETE — All 6 workstream items operational

**What:** Phase 2 autonomy infrastructure fully delivered and operational. Three-layer architecture (Cloud + Watch + Manual) running at €0/month cost with <15min/week human intervention.

**Final Deliverables:**
- ✅ **A1:** Perpetual Motion Engine (PR #156) — Event-driven workflow, auto-creates issues from roadmap.md
- ✅ **A2:** Roadmap Bootstrap (PR #160) — 6 roadmaps × 3 features = 18 @copilot-ready work items
- ✅ **A3:** @copilot Issue Templates (PR #157) — 3 structured YAML forms with comprehensive guide
- ✅ **A5:** Layer 2 — 1 terminal per repo with continuous Squad CLI sessions
- ✅ **B1:** FirstFrameStudios Page — GitHub Pages with live game embeds (verified operational)
- ✅ **B3:** Syntax Sorcery Main Page (PR #159) — Landing page with deploy fix

**Three-Layer Architecture:**
1. **Cloud (perpetual-motion.yml):** Event-driven (issues.closed) → Parse roadmap → Create issue → Assign @copilot
2. **Watch (1 terminal per repo):** Squad CLI session per repo → continuous monitoring and refueling
3. **Manual (Ralph sessions):** Human fallback for strategic decisions and blocked issues

**Validation:**
- ✅ Format compatibility: All roadmaps parse correctly with perpetual-motion.yml
- ✅ Scope lock: Max 3 features per repo (18 total), no new products
- ✅ Rate limiting: Max 1 open copilot-ready issue + 30min cooldown prevents runaway
- ✅ Hardening: Session timeout (30min), exponential backoff (5m→60m), stale lock detection (2h), log rotation (3-file), health checks (hourly), alert mechanism (cycle limit)

**Cost Analysis:** €0/month total

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
**Status:** ✅ IMPLEMENTED

**What:** Enhanced perpetual-motion.yml workflow with event logging, rate limiting, and concurrency control to prevent runaway GitHub Actions costs while maintaining event-driven autonomy.

**Key Decisions:**
1. **Event Logging:** Structured JSON to `.squad/motor-log/YYYY-MM-DD.json` (daily, ISO 8601 timestamps)
2. **Rate Limiting:** 30-minute cooldown between runs; reads motor-log, calculates time since last event
3. **Concurrency Control:** `concurrency.group: perpetual-motion-${{ github.repository }}` with `cancel-in-progress: false`
4. **Motor Log Persistence:** Git history for programmatic analysis and audit trail
5. **Documentation:** 40+ line ASCII-art header explaining all 5 safety mechanisms

**Impact:** Critical path A1 unblocked. Enables autonomous roadmap progression across all repos.  
**Cost:** €0 (GitHub Actions free tier)

---

### 2026-03-22T00:00Z: FirstFrame Studios GitHub Page — Issue #150 Closure

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Issue:** #150  
**PR:** #155  
**Status:** ✅ VERIFIED COMPLETE

**What:** FirstFrame Studios GitHub Pages site was already complete since 2026-03-13 (3 game embeds live). Verified all acceptance criteria met and closed issue.

**Technical Stack:**
- Framework: Astro 4.x (static site generation)
- Styling: Tailwind CSS with glass-morphism effects
- Deployment: GitHub Pages (€0 cost)
- Build Time: 1.38s

**Key Decision:** Verification over rebuild — when work already complete, verify → document → close

**Impact:** First public-facing deliverable for FFS downstream company (marketing + shareable URL)  
**Cost:** €0 (GitHub Pages free tier)

---

### 2026-03-22T03:30Z: Phase 13 Feasibility Spec Approved — Community Opens

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ APPROVED & MERGED (PR #144)

**What:** Oracle's Phase 13 Community & Open-Source Feasibility Spec (955 lines, 15 sections) approved. Spec outlines three initiatives: (1) Public Documentation (Architecture Playbook, Squad Operations Manual, Autonomous Company Playbook), (2) Skills Marketplace with Community Vetting (Bronze/Silver/Gold certification tiers), (3) Community Governance & RFC Process (weighted voting, decision log, transparent roadmap).

**Key Decisions:**
- **RFC Voting Threshold:** 60% weighted approval + founder veto override
- **Gold Certification Authority:** Deferred to Sprint 3 (test Bronze/Silver first)
- **Risk Mitigated:** RFC spam gate (20-min read requirement), Gold cert quality bar (SS verification), phased rollout (docs → vetting → governance)

**Outcome:** ✅ APPROVED & MERGED. Sub-issues #43-45 ready for Phase 13 Sprint Planning.

---

### 2026-03-15T01:35Z: Phase 14 Scaling & High-Availability Spec Delivered

**By:** Oracle #1 (Product/Research)  
**Tier:** T1 (Phase Authority — pending Morpheus approval)  
**Status:** ✅ DELIVERED

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

**Status:** ✅ SPEC DELIVERED, PR #145 ready for Morpheus review

---

### 2026-03-22T02:00Z: Phase 13 Research — Community & Open-Source Initiative

**By:** Oracle (Product & Docs)  
**Status:** ✅ RESEARCH COMPLETE — T1 approved & merged (Phase 13 Feasibility Spec entry above)
