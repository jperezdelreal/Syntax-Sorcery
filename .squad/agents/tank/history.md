# Tank — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Budget:** Azure max €500/month — hard limit. Cost-first infrastructure decisions.

## Learnings

<!-- Append entries below as you learn about the project -->
- 2026-03-13T10:13Z: Phase 1 decomposition ready. You own: P1-08 (Ralph-Watch Hardening — audit config, define target cycle time, implement hardened config for 24h unattended operation), P1-09 (Cost Alerting — Azure alert at 80%/€400, escalation thresholds: €450 → notify, €480 → auto-kill idle). Key: test hardened config on SS first, then apply to FFS. Ralph is critical for autonomous operation.
- 2026-03-13: **P1-08 COMPLETED.** Ralph-watch v4→v5 hardened. Six failure modes found: (1) no session timeout — copilot hangs forever, (2) fixed retry interval — burns cycles on persistent failures, (3) PID-only lock check — misses stale processes, (4) single log rotation — loses data, (5) 4h heartbeat interval — too slow for crash detection, (6) local-only alerts — nobody notified. Fix: session timeout 30m, exponential backoff 5→60m, stale lock at 2h, 3-file rotation, hourly heartbeat checks, Discord+GitHub Issue alerting. PR #196 in FFS. Zero Azure cost — all GHA free tier. Extracted reusable SKILL at .squad/skills/ralph-hardening/SKILL.md.
- 2026-03-14: **P1-09 COMPLETED.** Cost alerting system built. Three-tier escalation: €400 (80%) → P1 Tank alert, €450 (90%) → P0 Morpheus+founder escalation, €480 (96%) → auto-kill idle resources (VMs, App Services, containers — respects `protected:true` tag). Plus proactive projected-overspend alerts via linear extrapolation. Option B selected (GHA + Azure CLI) — zero Azure cost. Dry-run mode for safe testing. Activation requires AZURE_CREDENTIALS secret + AZURE_SUBSCRIPTION_ID variable. Extracted skill at .squad/skills/cost-alerting/SKILL.md. Decision at .squad/decisions/inbox/tank-cost-alerting.md.
- 2026-03-14 Wave 3 sync: Decisions merged to 3.9KB (budget directive clarified: GitHub unlimited, Azure €500/mo). Trinity completed P1-07 (16 skills migrated, upstream.json ready). Oracle completed P1-10a (GDD spec locked) + P1-14 (FFS visibility audit, Trinity has 8–12hr remediation queue). Trinity next: P1-14 visibility fixes (P0 this week) or P1-10b (GDD parser). Orchestration logs written for all 4 agents + directive.
- 2026-03-15: **T3 COMPLETED: Pipeline Labels Installed.** FFS Takeover T1 (Hub merge) and T2 (Satellite Cascade) complete. Executed T3: Pipeline Activation — installed 12 Proposal→Prototype pipeline labels across 3 repos: (1) jperezdelreal/ComeRosquillas — 12/12 ✅, (2) jperezdelreal/flora — 12/12 ✅, (3) jperezdelreal/FirstFrameStudios (Hub, orchestration) — 12/12 ✅. All labels created via `gh label create` with `--force`. Zero failures, 100% success rate. Labels enable workflow automation across game pipeline stages: proposal → gdd → issues → implementing → building → deployed, with failure handling (pipeline-fail:*) and needs-info for blocker escalation.
