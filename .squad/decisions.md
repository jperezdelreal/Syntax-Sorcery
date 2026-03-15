# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

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
**Tier:** T1 (Review Required)  
**Issue:** #115 — [Phase 13]: Community & Open-Source  
**Status:** ✅ RESEARCH COMPLETE — Awaiting T1 decisions  

**What Phase 13 Solves:** Transforms Syntax Sorcery from closed autonomous company into open-source framework for community-driven AI development.

**Three Initiatives:**
1. Public Documentation & Onboarding (Issue #43) — 10K words, 3-4 weeks
2. Community Skills Marketplace with Vetting (Issue #44) — Certification tiers, reputation system, 4-5 weeks
3. Community Governance & RFC Process (Issue #45) — GitHub-native RFC + decision log auto-publisher, 2-3 weeks

**Feasibility Assessment:**
- ✅ **TECHNICAL:** Feasible (10-week effort, low engineering complexity, built on Phase 12 foundation)
- ✅ **BUDGET:** Safe (€25/mo addition → €240-250/mo total, 48-50% of €500 budget)
- ✅ **DEPENDENCIES:** Not blocking (parallelizable with Phase 12, enables Phase 14-15)

**Three T1 Decisions Required:**
1. **RFC Voting Threshold:** 60% or 67% weighted approval?
   - Recommendation: 60% + founder veto (adjust after test RFCs)
   - Timeline: Week 4

2. **Gold Certification Authority:** Founder (T0) only or Morpheus (T1) + 3 community reviewers?
   - Recommendation: Morpheus + community (balances credibility + velocity)
   - Timeline: Week 3

3. **Community Reviewer Liability:** Waiver, indemnification, or no liability?
   - Recommendation: Liability waiver in CONTRIBUTING.md (standard open-source practice)
   - Timeline: Week 2

**Success Metrics:**
- 4 major documents published (100+ community reads)
- 20+ community skills certified (Bronze+), 10+ active reviewers
- 3+ test RFCs approved, governance portal deployed
- 67% contributor vote participation

**Impact:**
- Phase 13: Opens community contribution pathways
- Phase 14-15: Enabled by Phase 13 governance infrastructure
- PR #144 opened with full spec

---

### 2026-03-15T01:10Z: Round 2 Complete — PRs Blocked, Phase 12 Spec Approved

**By:** Morpheus (Lead), Oracle (Product), Scribe (Log)  
**Status:** ✅ COMPLETE  
**Key Dates:** PR reviews finished, Phase 12 spec ready for T0 decisions

**PR #140 Blocked — Token File Permissions (Issue #143)**
- **Critical Issue:** Bicep writes GitHub token to `/etc/profile.d/github-token.sh` with 0644 permissions (world-readable)
- **Risk:** Any VM user can read the token
- **Decision:** ❌ BLOCKED — Request Changes
- **Required Fix:** Change perms to 0600 (owner-only), remove plaintext storage in world-readable locations
- **Owner:** Trinity (Tank locked out per rejection rule)
- **Follow-up:** Issue #143 created, Morpheus to re-review after Trinity fixes

**PR #141 Blocked — GitHub API Retry Logic (Issue #142)**
- **Critical Issue:** `gh pr list` called 5+ times without retry logic
- **Risk:** GitHub API rate limits (5000 req/hr) cause silent failures → false negatives
- **Decision:** ❌ BLOCKED — Request Changes
- **Required Fix:** Add exponential backoff retry (2s, 4s, 8s delays)
- **Owner:** Switch (can revise own work per rules)
- **Follow-up:** Issue #142 created, Morpheus to re-review after Switch adds retry

**Phase 12 Research Complete (Issue #114) — Spec Approved**
- **Deliverable:** `docs/phase12-platform-evolution-spec.md` — 13-section spec
- **Tech Feasibility:** ✅ (Plugin Marketplace, MCP Ecosystem, Federation Governance)
- **Budget Impact:** ✅ +€85/mo (Cosmos DB €30, API Mgmt €50, storage €5) → €335/mo total, within €500 limit
- **Azure Compliance:** ✅ (no multi-cloud; federation applies to Azure satellites only)
- **Status:** Ready for Phase 12 sprint planning (pending T0 decisions)
- **Pending T0 Decisions:** 
  1. Copilot integration autonomous trigger vs. human approval?
  2. Plugin sandboxing vs. trust-based model?
  3. Multi-cloud exception flexibility or Azure-only lock?

**Lockout Enforcement:**
- Tank locked out of #140 revision (fresh eyes required → Trinity assigned issue #143)
- Switch allowed to revise #141 (original author can self-fix per rules)

**Key Learnings:**
1. **Security:** Never store secrets in world-readable files; use 0600 perms minimum
2. **Fault tolerance:** External APIs need retry logic; silent failures hide production errors
3. **Governance:** Lockout rule enforces quality gates (Tank rejected → Trinity gets fresh crack)
4. **Phase progression:** Phase 10 critical path now clear (Tank #125 → #126 → Phase 10 done)

---

### 2026-03-15T00:49Z: Ralph Activation Round 1

**By:** Scribe (autonomous log)  
**Status:** ✅ ACTIVE  
**Agents:** Tank (#125 GitHub Token), Switch (#128 24-Hour Monitoring)

**What:**
Ralph activation round 1 — routing first two issues to Tank and Switch teams working in parallel background context. Tank assigned to issue #125 (GitHub Token Provisioning scripts and automation). Switch assigned to issue #128 (24-Hour Monitoring automation and validation scripts).

**Why:**
Parallel execution model: background agents can work autonomously on independent issues while Scribe maintains orchestration logs and session history.

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
**Last Updated:** 2026-03-15T01:30Z
