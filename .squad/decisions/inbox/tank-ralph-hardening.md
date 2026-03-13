# Decision: Ralph-Watch Hardened for 24h Unattended Operation

**By:** Tank (Cloud Engineer)
**Date:** 2026-03-13
**Tier:** T2 (implementation detail)
**PR:** jperezdelreal/FirstFrameStudios#196

## What

Ralph-watch upgraded v4→v5 with six hardening measures for 24h unattended operation:
1. Session timeout (30m) — kills hung copilot processes
2. Exponential backoff (5m→60m) — prevents rapid-retry storms
3. Stale lock detection (2h) — handles crashes/restarts
4. 3-file log rotation — preserves diagnostic data
5. Pre-round health checks — skips instead of crashing
6. Hourly heartbeat monitoring — Discord + auto P0 issue on critical

## Why

Ralph is the autonomous execution engine. If it dies silently, the entire squad stops producing. The v4 script had no session timeout (could hang forever), fixed-interval retries (burns GHA minutes on persistent failures), and only checked heartbeat every 4 hours (too slow for crash detection).

## Budget Impact

Zero additional Azure cost. Monitoring uses GitHub Actions free tier only.

## Reusable Pattern

Extracted to `.squad/skills/ralph-hardening/SKILL.md` — applies to any long-running agent loop in any downstream company.
