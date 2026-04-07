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

**2026-04-07: Business Products Brainstorm v2 (Oracle):** 18 non-developer product ideas filed. Top 3: LUNES (manager reports), CERRADOR (sales follow-up), PILOTO (autónomo daily). Key insight: all use identical Work IQ + Copilot SDK + Azure infrastructure. Awaiting joperezd MVP selection.

---

*Detailed session logs from Sessions 1-12 archived in history-backup-2026-07-09.md for reference.*
