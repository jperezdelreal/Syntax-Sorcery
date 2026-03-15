---
name: "downstream-audit"
description: "Reusable checklist for auditing downstream autonomous companies on context health, squad maturity, code quality, governance, and autonomy readiness"
domain: "operations"
confidence: "low"
source: "manual — created from FFS evaluation patterns, needs validation on real downstream project"
---

## Quick Start

Run this audit on any downstream company (FFS, future clients). Score each category Pass/Warning/Fail. ~30 minutes with gh CLI.

## 1. Context Health — Critical ⚠️

| Item | Check | Score |
|---|---|---|
| `.squad/` bloat | Total size: `find .squad -type f -exec wc -l {} + \| tail -1`. **Pass:** <5KB total. **Warning:** 5–15KB. **Fail:** >15KB | ☐ |
| Per-file sizes | Any file >15KB? `ls -lSh .squad/**/*.md`. **Pass:** all <10KB. **Warning:** 10–15KB. **Fail:** >15KB | ☐ |
| TLDR coverage | Large files (>3KB) have `## TLDR`? Spot-check 3 largest. **Pass:** 3/3 yes. **Warning:** 2/3. **Fail:** 0–1/3 | ☐ |
| Archive discipline | `decisions-archive.md` exists & dated. `decisions.md` <12KB. **Pass:** yes & fresh. **Warning:** exists but stale. **Fail:** missing or >15KB | ☐ |
| Decision staleness | `grep -E "^### 20[0-2]" .squad/decisions.md` — any entries >90 days old without `[permanent]`? **Pass:** none. **Warning:** 1–2. **Fail:** 3+ | ☐ |

## 2. Architecture & Code Quality

| Item | Check | Score |
|---|---|---|
| Repo structure | `cat README.md` — clear purpose & setup? `ls .github/workflows/` — CI exists? **Pass:** yes to both. **Warning:** one missing. **Fail:** both missing | ☐ |
| Build health | Latest 5 workflow runs: `gh workflow view <workflow> --json conclusion`. **Pass:** 5/5 success. **Warning:** 3–4/5. **Fail:** <3/5 | ☐ |
| Test coverage | `grep -r "coverage\|test" README.md` or `.github/workflows/`. Target: >70%. **Pass:** ≥70%. **Warning:** 50–69%. **Fail:** <50% or unknown | ☐ |
| Dependency freshness | `npm outdated` (or equivalent). **Pass:** 0–1 outdated. **Warning:** 2–5. **Fail:** >5 or security vulns | ☐ |

## 3. Squad Setup Maturity

| Item | Check | Score |
|---|---|---|
| Agent roster | `.squad/agents/*/history.md` — count. **Pass:** 5+ active, <3 hibernated. **Warning:** 3–4 active, 4–6 hibernated. **Fail:** <3 active or >8 hibernated | ☐ |
| Agent health | Pick 2 agents. Read history.md (first 1KB). Entries date-stamped & actionable? **Pass:** yes. **Warning:** mostly yes, some noise. **Fail:** vague or stale | ☐ |
| Skills inventory | `.squad/skills/*/SKILL.md` — count & confidence. `grep confidence:`. **Pass:** 5+, mix of low/medium/high. **Warning:** 3–4, mostly low. **Fail:** <3 or all low | ☐ |
| Squad health | `.squad/config.json` — Squad CLI sessions active. **Pass:** sessions running. **Warning:** intermittent. **Fail:** missing or broken | ☐ |

## 4. Governance Effectiveness

| Item | Check | Score |
|---|---|---|
| Tier system | `grep -E "T[0-3]" .squad/decisions.md` — referenced in decisions? Count. **Pass:** 5+ refs across T0–T3. **Warning:** 2–4 refs. **Fail:** 0–1 or inconsistent | ☐ |
| Priority discipline | `.github/issues` — label usage. `gh issue list --label P0 --label P1` — any open P0? **Pass:** 0–1 P0, backlog visible. **Warning:** 2–3 P0. **Fail:** 4+ P0 or no labeling | ☐ |
| Ceremony tracking | `.squad/ceremonies.md` exists? Content fresh (<14 days)? **Pass:** yes & recent. **Warning:** exists, dated. **Fail:** missing or >30 days old | ☐ |
| Decision latency | Last 5 decisions in `.squad/decisions.md`. Compare timestamps to closed issues. **Pass:** <3 days avg gap. **Warning:** 3–7 days. **Fail:** >7 days or decisions without linked issues | ☐ |

## 5. Autonomous Operation Health

| Item | Check | Score |
|---|---|---|
| Intervention rate | `.squad/log/*.md` (last 7 days) — count entries vs total actions. **Pass:** human action <5%. **Warning:** 5–15%. **Fail:** >15% | ☐ |
| Failure recovery | `.squad/orchestration-log/*.md` — any "blocked" or "failed" entries? If yes, follow-up fix within 24h? **Pass:** 0 unresolved. **Warning:** 1–2 unresolved. **Fail:** 3+ unresolved | ☐ |
| Cross-repo sync | If hub-and-spoke model, check `.squad/routing.md`. Routes active? `gh pr list --state open` — any blocked on coordination? **Pass:** 0 blocked. **Warning:** 1–2 blocked. **Fail:** 3+ blocked | ☐ |
| Monitoring coverage | `.squad/config.json` — monitoring section. Alerts defined for uptime, cost, throughput? **Pass:** 3+ alerts. **Warning:** 1–2 alerts. **Fail:** 0 or missing config | ☐ |

## Scoring Rubric

**Per category:** Sum passes (=3), warnings (=1), fails (=0). Divide by item count → 0–1.0 score.

**Overall:**
- **A (≥0.85):** Production-ready autonomy. Minimal intervention needed.
- **B (0.70–0.84):** Solid foundation. 1–2 categories need attention.
- **C (0.55–0.69):** Operational, but systemic gaps. Recommend structured fixes.
- **D (0.40–0.54):** High risk. Autonomy fragile. Schedule intervention.
- **F (<0.40):** Critical failures. Block autonomy until remediated.

## Known Limitations

- File size checks are heuristic (may vary by encoding/OS).
- Agent quality is subjective — adjust "actionable" threshold to team standards.
- Ralph-watch cycle time depends on workload — context above ~15KB slows it proportionally.
- Scores improve iteratively as downstream team applies fixes.
