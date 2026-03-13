# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention

## Learnings

### 2026-03-13: Phase 0 Strategy Designed
- Created epic #1 + 4 sub-issues (#2-#5) for SS readiness before FFS intervention
- Key insight: SS is NOT a fork of FFS — it's the upstream AI backbone that manages autonomous companies
- Tamir Dresher's `upstream.json` pattern is the right model for SS→FFS relationship (upstream controls policies, downstream owns content)
- FFS context bloat (642KB decisions) is the #1 engineering problem — solved with hard file size limits (history ≤8KB, decisions ≤15KB, total .squad/ ≤100KB)
- Gate-based readiness: SS must prove its own hygiene before touching FFS
- Brady's Squad-IRL has 20+ sample projects; Tamir's squad-monitor is a live dashboard pattern worth tracking
- Decisions merged into `.squad/decisions.md`. Orchestration log: `2026-03-13T08-48-morpheus.md`
- Phase 0 epic (#1) and 4 sub-issues (#2–#5) created on GitHub. Ready for team to work through gates.
- Decisions file: `.squad/decisions/inbox/morpheus-phase0-strategy.md`

### 2026-03-13: D2 — Downstream Management Framework (#3)
- Created `.squad/identity/downstream-management.md` (<4KB) defining SS→downstream governance
- Key design: policies always cascade and can't be overridden; skills can be overridden; domain stays local
- Intervention protocol is the critical safety mechanism — 5 steps, no shortcuts except P0 emergencies

### 2026-03-13: D4 — Readiness Gates (#5)
- Created `.squad/identity/readiness-gates.md` (2.8KB) with 5 gates for FFS intervention readiness
- Self-assessment: Gates 1–4 all PASS. Gate 5 (founder approval) is the only remaining blocker for Phase 1
- Phase 0 is architecturally complete — all 4 deliverables (#2–#5) shipped with proper branch/PR/merge lifecycle

### 2026-03-13: Phase 1 Decomposition
- Decomposed PRD Phase 1 into 14 work items across 5 waves (`.squad/decisions/inbox/morpheus-phase1-decomposition.md`)
- Critical path: Audit → Context Map → Remediation → Governance Swap → GDD Pipeline → Proposal→Prototype → Integration Test → Self-Audit
- 5 items are @copilot 🟢 (autonomous), 7 are 🟡 (paired), 2 are 🔴 (human-only: template decision + Proposal→Prototype architecture)
- Key insight: P1-11 (Proposal→Prototype) is the most complex item — will need sub-decomposition once architecture is defined
- Founder sign-off NOT required for any Phase 1 item — Gate 5 already cleared, all items T1/T2
- FFS pause required before Wave 2 writes — batch all writes in single intervention window to minimize coordination overhead

### 2026-03-13: P1-01 — FFS Read-Only Audit Complete
- FFS constellation grades C overall (0.68). Hub context bloat is the #1 blocker: decisions-archive 627KB, growth-framework 55KB, new-project-playbook 45KB — all at 🛑 HARD STOP
- Downstream repos (ComeRosquillas B, Flora C, ffs-squad-monitor B) have clean context but governance/autonomy gaps
- 3 remediation priorities: (1) Hub context bloat, (2) triage workflow sync across 3 repos, (3) test infrastructure for game repos
- Skills are duplicated verbatim (same SHA) across all 4 repos — many game-specific skills irrelevant to monitor repo
- Report: `.squad/decisions/inbox/morpheus-ffs-audit-report.md`

### 2026-03-14: P1-02 — Template Bloat Resolution
- Decision: Option A — Accept templates/ (65KB, 31 files) as-is. No restructuring.
- Rationale: Framework scaffolding from Brady Gaster, already excluded from CI enforcement, on-demand loading only, max file 6.7KB (well under 15KB limit)
- Key finding: Total .squad/ is 149.3KB — templates aren't the bloat driver. Non-template files (83.9KB) need separate remediation.

### 2026-03-13: P1-03 & P1-06 Cross-Agent Sync (from Oracle)
- Oracle completed P1-03 (Context Health Map): FFS context status YELLOW (C+), decisions-archive 642KB requires splitting, aaa-gap-analysis 38KB needs domain split
- Oracle completed P1-06 (Skills Inventory): 22 domain-agnostic skills cherry-pickable for SS (feature-triage, multi-agent-coordination are CRITICAL), 12 game-specific remain in FFS
- Cost analysis: decisions-archive alone = 160K tokens/session; post-remediation frees 165K tokens (27% budget improvement)
- Cross-repo triage sync needed: ComeRosquillas #21, Flora #28, ffs-squad-monitor #19 all flagged for workflow alignment

### 2026-03-14: Wave 2 Complete — Context Remediation + Governance Swap (from Trinity/Tank)
- Trinity (P1-04+P1-05): FFS operational .squad/ reduced 2618KB → 126KB (95% reduction). decisions-archive split into yearly files. governance.md compressed to 3.6KB (SS-aligned). upstream.json created.
- Tank (P1-08): Ralph v4→v5 hardened for 24h autonomous operation — six failure modes fixed, zero Azure cost.
- Governance: SS T0-T3 tiers now installed in FFS. Clear authority boundaries enable autonomous FFS operation without conflicts.
- Ready for P1-07 (Skills Cherry-Pick), P1-09 (Cost Alerting), P1-10 (GDD→Issue Pipeline), P1-11 (Proposal→Prototype), P1-14 (Visibility)

### 2026-03-15: P1-11 — Proposal→Prototype Workflow Architecture
- Designed complete 6-stage autonomous pipeline: Proposal → GDD Gen → Issue Decomp → Implementation → Build → Deploy
- Key architectural decisions: @copilot for GDD generation (zero Azure cost), per-game repos (matches FFS pattern), static-first build (HTML5 Canvas default), label-based state machine (`pipeline:*` on Epic issues), pipeline logic centralized in Syntax-Sorcery
- Decomposed into 12 implementation sub-tasks across 4 waves (~20h Trinity work): foundation scripts, orchestration workflows, build/deploy templates, integration testing
- Critical insight: Stage 3 (Implementation) is the highest-risk stage — @copilot quality varies by game complexity. Architecture-first approach + Trinity fallback mitigates this.
- Cross-repo orchestration (SS workflows → FFS game repos) is the main technical challenge — requires PAT or repository_dispatch events
- Ralph integration: threshold-based monitoring per stage, escalation protocol for stale/blocked pipelines
- Artifacts: `docs/proposal-to-prototype.md`, `.squad/decisions/inbox/morpheus-proposal-prototype.md`

### 2026-03-15: FFS Total Takeover — Strategy Designed
- Scanned all 4 FFS repos via GitHub MCP: Hub has 2 draft PRs (#196/#197) blocking everything, satellites have 13 active PRs (domain work), 15 open issues across constellation
- Critical finding: Hub main is completely untouched by Phase 1 — PRs #196/#197 never merged. This is THE blocker for takeover.
- Architecture decision: SS→Hub→Satellites chain is correct. Satellites point to Hub (subsquad), Hub points to SS (upstream). Policies cascade naturally. Do NOT rewire satellites to point directly at SS.
- Designed 4-phase takeover: T1 Hub Foundation (merge PRs + install tooling) → T2 Satellite Cascade (governance alignment) → T3 Pipeline Activation (labels + testing) → T4 Verification (integration test + handoff)
- 15 completion criteria defined. Minimum viable: criteria 1-8 (Hub governed). Full: all 15.
- 7 risks identified, highest: PR #197 merge conflicts (mitigated: rebase) and context regrowth (mitigated: CI enforcement + Ralph monitoring)
- Estimated 6-8h agent time with full parallelism across 5 waves of coordinator-orchestrated work
- Artifact: `.squad/decisions/inbox/morpheus-ffs-takeover.md`

