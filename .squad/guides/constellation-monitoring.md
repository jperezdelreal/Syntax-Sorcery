# Constellation Health Monitoring

## Overview

`scripts/constellation-health.js` checks every repo listed in `.squad/constellation.json` and produces a GREEN / YELLOW / RED health report.

## What it checks

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | `perpetual-motion.yml` | File exists at `.github/workflows/perpetual-motion.yml` |
| 2 | `roadmap.md` | File exists at repo root |
| 3 | Recent workflow runs | ≥ 1 workflow run in the last 7 days |

## Status definitions

| Status | Meaning |
|--------|---------|
| 🟢 GREEN | All 3 checks pass |
| 🟡 YELLOW | 1–2 checks pass |
| 🔴 RED | All checks fail — repo may be dead |

## Running locally

```bash
npm run check:constellation
```

For JSON output (machine-readable):

```bash
node scripts/constellation-health.js --json
```

### Prerequisites

- **`gh` CLI** installed and authenticated (`gh auth login`)
- Token must have `repo` scope to read workflow data from all constellation repos

## GitHub Actions workflow

`.github/workflows/constellation-health.yml` runs:

- **Weekly** on Mondays at 06:00 UTC (schedule)
- **On demand** via `workflow_dispatch` (Actions → Constellation Health → Run workflow)

The workflow uploads a JSON report as a build artifact (retained 30 days).

## Adding or removing repos

Edit `.squad/constellation.json` — the `repos` array is the single source of truth.

## Relationship to safety-net.yml

| Concern | safety-net.yml | constellation-health.js |
|---------|---------------|------------------------|
| Scope | Deep checks (72h activity, build failures, stale issues) | Structural checks (files exist, workflows running) |
| Action | Creates escalation issues + files | Reports only (exit code 1 on RED) |
| Schedule | Daily 00:00 UTC | Weekly Monday 06:00 UTC + on demand |
| Best for | Ongoing operational monitoring | Quick "are all repos alive?" sanity check |

Use both: safety-net catches operational drift daily; constellation-health gives a fast structural snapshot on demand.
