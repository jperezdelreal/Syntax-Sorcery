# Downstream Company Management Framework

## TLDR
SS governs autonomous companies (first: FFS). SS controls policies, gates, squad infra; downstream owns domain, projects, team composition. Interventions: announce → pause → intervene → validate → resume.

## Relationship Model

```
SS (upstream) ──governs──▶ FFS (downstream)
              ──governs──▶ Future Co. N
```

### What Cascades (SS → Downstream)
- **Governance:** tier definitions (T0–T3), priorities (P0–P3), ceremony cadence
- **Context hygiene:** file size limits, archival triggers, bloat prevention
- **Squad infra:** agent patterns, skill templates, Squad CLI core
- **Quality gates:** definitions, metrics thresholds, merge requirements

### What Stays Local (Downstream Owns)
- **Domain:** projects, repos, product decisions, release schedules
- **Domain skills:** game dev, web dev — whatever the company builds
- **Team composition:** agent casting, theming, personality
- **Gate execution:** how they meet gates, remediation strategies
- **Overrides:** can override inherited skills but NEVER policies

## Intervention Protocol

Modifying a live autonomous system is surgery.

| Step | Action | Who |
|------|--------|-----|
| **1. Announce** | Issue in downstream with `[SS-intervention]` label. State scope. | SS Lead |
| **2. Pause** | Ralph pauses execution. Confirm before proceeding. | Downstream |
| **3. Intervene** | Make changes. Only touch what was announced. | SS Agent |
| **4. Validate** | Run tests/checks. Confirm no regression. | SS + Downstream |
| **5. Resume** | Ralph resumes. Monitor for 1 cycle. | Downstream |

### Escalation
- **P0 (autonomy at risk):** Skip Announce, go to Pause. File issue retroactively.
- **P1–P3:** Full protocol. No shortcuts.
- **Read-only audits:** No pause needed. File `[SS-audit]` issue with findings.

## Health Monitoring

SS monitors downstream health via these signals:

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| **Issue throughput** | Issues closing within SLA per tier | >20% overdue | >50% overdue or queue growing |
| **File sizes** | All `.squad/` files within limits | Any file >80% of limit | Any file over limit |
| **Squad CLI uptime** | Sessions active, completing cycles | >2 consecutive failed cycles | Stopped or crashlooping |
| **Error rate** | <5% of agent actions error | 5–15% error rate | >15% error rate |
| **Context window** | Total `.squad/` <100KB | >80KB | >100KB |

### Monitoring Cadence
- **Automated:** Squad CLI sessions check every cycle
- **Weekly:** SS reviews issue throughput
- **On-demand:** read-only audit anytime

## Upstream Config

Each downstream repo contains `upstream.json` at `.squad/upstream.json`:

```json
{
  "upstream": {
    "org": "jperezdelreal",
    "repo": "Syntax-Sorcery",
    "branch": "master"
  },
  "inherits": {
    "policies": true,
    "skills": ["context-hygiene", "conventional-commits", "issue-workflow"],
    "quality_gates": true,
    "governance": true
  },
  "overrides": {
    "skills": ["game-design", "unity-development"],
    "theme": "star-wars"
  },
  "sync": {
    "auto": false,
    "notify_on_upstream_change": true
  }
}
```

### Schema Rules
- `inherits.policies` — MUST be `true`. Policies cannot be opted out.
- `inherits.skills` — List of SS skill IDs to inherit. Downstream adds domain skills locally.
- `overrides.skills` — Downstream-only skills that replace inherited ones by ID.
- `sync.auto` — If `true`, upstream changes auto-apply. Default `false` (notify-only).
- `sync.notify_on_upstream_change` — Creates issue in downstream when SS pushes updates.

### Sync Flow
1. SS merges a policy/skill change to `master`
2. If `notify_on_upstream_change: true` → issue created in downstream with `[SS-upstream-update]` label
3. Downstream reviews and pulls changes (manual) or auto-applies (if `sync.auto: true`)
4. Conflicts: downstream overrides win for skills; SS wins for policies
