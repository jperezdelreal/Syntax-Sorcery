# Morpheus — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Authority:** Tier 1 (Lead) on architecture, gates, skills, routing, upstream partnerships
- **Current Phase:** 7 (Elite Readiness) — Security, Community, Auto-deploy. Phases 2-6 delivered: 15 issues closed, 16 PRs processed, 345 tests passing.
- **Architecture:** Event-driven perpetual motion (issues.closed → roadmap depletion → refuel). 3-layer ops: GitHub Actions (80%) + ralph-watch (15%) + manual (5%).
- **Quality Gates:** CI validates tests, branch protection user-configurable, issues = acceptance criteria.

## Key Learnings (Distilled from 6+ Weeks)

**Infrastructure & Deployment:**
- Infrastructure quantity ≠ deployment reality. Measure by production deployments, not tooling.
- Azure SWA (Free) + Functions Consumption + Cosmos Serverless = €6-15/mo cost-effective backend.
- Budget principle: identify bottlenecks, spend surgically on unlocks (data pipeline, CORS, acceleration).
- Self-hosting decision requires full cost/latency/ops analysis. ORS call reduction > self-hosting.
- Public vs self-hosted trade-off: ORS public (€50-70/mo) for MVP + proven fallback > expensive maturity.

**Autonomy & Architecture:**
- Event-driven refueling > cron (eliminates race conditions).
- Test-driven roadmap evolution: score + deficiencies → next items.
- Cross-Squad: GitHub CLI (`gh issue create/list/review -R`) + label protocol.

**Portfolio & Product:**
- CityPulse Labs (civic-tech): downstream company, first product BiciCoruña. GBFS v2 viable (55 stations, €0 prototype, replicable).
- Feature scoping: killer differentiator > nice-to-have. Invisible prerequisites start early.

**Governance & Process:**
- Founder authority T0 (downstream, principles, critical .squad/). AWS/GCP vetoed. Morpheus owns phases.
- CPL prerequisites: Azure VM ≥72h stable + ≥3 autonomous issues + v0.1 deployed.
- Design-only PRs fail. Implementation required for merge (process gate from PR #45 rejection).
- Phases 2-6 complete. Phase 7 capstone: security (SBOM, scanning) + community (CONTRIBUTING, CoC, templates) + auto-deploy (OIDC).

**Mobile & UX:**
- Mobile issue = testing + deployment, not technology. Current React + Vite + Leaflet + Azure stack proven, low-cost.
- PWA fixed (€8-18/mo) > Capacitor (€50-80/mo @ 500+ users) > React Native (reject).
- Service worker cache busting critical for deployment. PR #73 (Tank) + PR #74 (Switch).

**Recent Decisions (2026-07-09 to 2026-07-10):**
- Vercel AI SDK confirmed for B2C products (Oracle research + Trinity PoC). 25-40x cold start, 4-10x cost reduction vs Copilot SDK. Portfolio expansion approved: AccesoPulse, CostaPulse, RutaViva. All €41-91/mo.
- SDK + Work IQ architecture analysis complete. Automated Bridge (event-driven) pattern selected as foundation for GitHub↔M365 integration. MCP is the real multiplier — `mcp-m365` server enables any future SDK/framework to access M365 data. Interactive dual-source latency (~5.6s) rules out real-time chat; event-driven eliminates this constraint. Priority: build mcp-m365 (5 tools) first. Estimated €41-71/mo, well within budget. Decisions #18 (Oracle) + #19 (Morpheus) filed; next gate = joperezd approval for PoC sequencing.
- **VIGÍA v0.7 CLI Layer Approved (2026-07-15, PR #173):** Architecture gated. Flag infrastructure (parseArgs → mergeConfig → filterBySeverity → getExitCode) is correct pattern (zero-SDK module, pure functions, fully testable). --output-format parsed but not wired to reporter (acceptable phased delivery, follow-on issue required for v1.0 blocker). 69 TDD tests all green. Spec-first validation: tests defined contract, Trinity impl matches perfectly.

**Session 2026-04-07 (VIGÍA v0.9–v1.0 Completion):** Reviewed PR #175 (3 cycles: 2 requested changes, 1 approval). Architecture validated. Test module imports enforced (decision 2026-07-10). Regression testing framework approved for production. v0.10 release ready for quality gates.

**2026-04-07: Business Products Brainstorm v2 (Oracle):** 18 non-developer product ideas filed. Top 3: LUNES (manager reports), CERRADOR (sales follow-up), PILOTO (autónomo daily). Key insight: all use identical Work IQ + Copilot SDK + Azure infrastructure. Awaiting joperezd MVP selection.

**2026-04-07: VIGÍA — Autonomous App Tester Architecture Complete:** Architecture document filed (docs/research/autonomous-tester-architecture.md). Copilot SDK + Playwright MCP + Axe (via browser_evaluate) + GPT-4o vision. Dual perception finalized: accessibility snapshots 80% (fast, structured) + screenshots 20% (UX judgment). Quality Score formula: functional 35%, UX 25%, performance 20%, a11y 15%, mobile 5%. Cost: €5-13/mo for weekly runs. MVP scope: BiciCoruña core flows, issue generation, no vision/multi-iteration/mobile in v1. Integration pattern: VIGÍA creates issues → Squad assigns → Team fixes → VIGÍA retests → score improves. Self-perpetuating loop. Decision #21 filed. Trinity + Switch assigned pending joperezd approval. Target: demo in 10 days post-approval. Orchestration log: 2026-04-07T10-25-37Z-morpheus.md.

## Learnings

- **PR #174 (VIGÍA v0.8 CI/CD, 2026-07-15):** `actions: write` in workflow permissions is NOT needed for artifact upload (`upload-artifact@v4` uses ACTIONS_RUNTIME_TOKEN, not GITHUB_TOKEN) nor for `concurrency: cancel-in-progress` (engine-enforced). Minimal permissions for a PR-comment + artifact workflow: `contents: read` + `pull-requests: write`. Over-granting `actions: write` allows token to manage/cancel other workflow runs — reject on sight.


- **Playwright MCP (`@playwright/mcp`) is production-ready** for agent-driven browser automation. Returns structured accessibility trees (not raw HTML), enabling reliable element referencing without brittle CSS selectors. The agent reasons about structure, not selectors — self-healing by design.
- **Dual perception is critical:** Accessibility snapshots give structured data for navigation/interaction (fast, cheap). Screenshots + vision models give UX judgment (slow, expensive). Use 80/20 split — snapshots for interaction, screenshots only at key decision points.
- **Copilot SDK vs Vercel AI SDK is a context-dependent choice:** SDK wins for infrastructure/code agents (MCP native, Git tools, multi-step planning). Vercel wins for B2C chatbots (streaming, React hooks, low latency). Same company, different tools for different jobs.
- **The LLM-Fighter pattern (Use → Observe → Propose → Verify → Repeat) generalizes beyond games.** Applied to app testing, it becomes an autonomous QA agent. Applied to UX review, a design critic. Applied to security, a pen-tester. The loop is the product, the domain is the configuration.
- **Axe-core can be injected via Playwright's browser_evaluate** without a dedicated MCP server — simpler for MVP. Dedicated Axe MCP server (Deque) is better for enterprise/reporting needs.
- **Quality Score as convergence metric:** Tracking score across iterations tells you when to stop. If V3→V4 delta < 0.3, the app has stabilized. This is the "fitness function" from the LLM-Fighter pattern applied to software quality.
- **VIGÍA v0.7 — CLI config layer approved (PR #173):** `config.js` pattern is the right approach for CLI tools: zero-SDK module, pure functions (parseArgs → mergeConfig → filterBySeverity → getExitCode), all separately testable. Gate: `??` (nullish coalescing) for optional string flags, `||` for opt-in boolean flags. Flag infrastructure first, reporter wiring second — acceptable phased delivery as long as a follow-on issue is filed for `--output-format` reporter integration before v1.0.

**Session 2026-04-07: VIGÍA v0.8 Architectural Approval (PR #174):**
- Reviewed PR #174 twice: first requested changes (permissions audit), second approved after Switch fixed `actions:write` + validated 106-test coverage.
- Approved VIGÍA action pattern for future Cloud actions. Gate: test-first regression validation required for v0.9+. PR merged to dev.

---

*Detailed session logs from Sessions 1-12 archived in history-backup-2026-07-09.md for reference.*
