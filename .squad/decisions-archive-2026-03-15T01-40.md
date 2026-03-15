# Decisions Archive — 2026-03-15T01:40Z Round 5

Archived entries from decisions.md when file exceeded 10KB threshold.

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
