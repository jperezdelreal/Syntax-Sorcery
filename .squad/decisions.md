# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

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
