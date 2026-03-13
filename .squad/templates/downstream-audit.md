# Audit: [Company Name] — Autonomous Health Check

**Auditor:** [Your name]  
**Date:** YYYY-MM-DD  
**Repository:** [GitHub URL]  
**Confidence:** Low (first-time audit — needs validation)

---

## Executive Summary

**Overall Grade:** [A–F]  
**Risk Level:** [Low | Medium | High | Critical]  
**Recommendation:** [Describe next steps — fix context bloat, hardening, gate readiness, etc.]

---

## 1. Context Health

| Item | Finding | Score |
|---|---|---|
| `.squad/` bloat | [Actual size in KB; breakdown if multiple large files] | Pass / Warning / Fail |
| Per-file sizes | [List any files >10KB; specific remediation if >15KB] | Pass / Warning / Fail |
| TLDR coverage | [How many large files lack ## TLDR?] | Pass / Warning / Fail |
| Archive discipline | [Is decisions-archive.md present? How old?] | Pass / Warning / Fail |
| Decision staleness | [Count of decisions >90 days without [permanent] tag] | Pass / Warning / Fail |

**Category Score:** [0.0–1.0] → [A–F]

---

## 2. Architecture & Code Quality

| Item | Finding | Score |
|---|---|---|
| Repo structure | [README clarity? CI/CD present?] | Pass / Warning / Fail |
| Build health | [Last 5 workflow outcomes; pass rate] | Pass / Warning / Fail |
| Test coverage | [Coverage %; any security vulns?] | Pass / Warning / Fail |
| Dependency freshness | [Count of outdated packages; severity] | Pass / Warning / Fail |

**Category Score:** [0.0–1.0] → [A–F]

---

## 3. Squad Setup Maturity

| Item | Finding | Score |
|---|---|---|
| Agent roster | [Count active / hibernated; growth trajectory?] | Pass / Warning / Fail |
| Agent health | [Sample 2 agents — are learnings actionable?] | Pass / Warning / Fail |
| Skills inventory | [Count, confidence distribution; gaps?] | Pass / Warning / Fail |
| Ralph health | [Version, cycle time; any issues?] | Pass / Warning / Fail |

**Category Score:** [0.0–1.0] → [A–F]

---

## 4. Governance Effectiveness

| Item | Finding | Score |
|---|---|---|
| Tier system | [Are T0–T3 actually used in decisions?] | Pass / Warning / Fail |
| Priority discipline | [Open P0 count; backlog health?] | Pass / Warning / Fail |
| Ceremony tracking | [ceremonies.md fresh? Adherence visible?] | Pass / Warning / Fail |
| Decision latency | [Avg gap between decision timestamp & issue closure?] | Pass / Warning / Fail |

**Category Score:** [0.0–1.0] → [A–F]

---

## 5. Autonomous Operation Health

| Item | Finding | Score |
|---|---|---|
| Intervention rate | [% of actions requiring human input (target: <5%)] | Pass / Warning / Fail |
| Failure recovery | [Unresolved blocked/failed entries in orchestration-log?] | Pass / Warning / Fail |
| Cross-repo sync | [Any long-blocked PRs or coordination gaps?] | Pass / Warning / Fail |
| Monitoring coverage | [Alerts defined for uptime, cost, throughput?] | Pass / Warning / Fail |

**Category Score:** [0.0–1.0] → [A–F]

---

## Detailed Findings

### Strengths
- [What's working well]

### Critical Gaps
- [Highest-priority issues blocking autonomy]

### Recommended Actions (Priority Order)
1. [Action], Expected impact: [why]
2. [Action], Expected impact: [why]
3. [Action], Expected impact: [why]

---

## Validation Notes

- Script used for file size checks: [shell commands run]
- Agents sampled for quality: [names]
- Workflow runs checked: [date range]
- Any blocking issues: [describe if found]

---

## Next Audit

**Scheduled:** [When to re-audit]  
**Focus Areas:** [Based on this audit's findings]

---

*Use `.squad/skills/downstream-audit/SKILL.md` for detailed checklist methodology.*
