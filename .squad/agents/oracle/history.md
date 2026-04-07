# Oracle — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Key patterns (from Squad ecosystem):** Skills after 2nd use, TLDR on all long docs, issues as task system, proactive skill extraction
- **Critical Phase 0-1 learnings:** Context bloat prevention (34 skills classified), GDD template spec, GitHub Pages live, 7 visibility blockers

## Learnings (Current)

- **SDK + Work IQ Integrated Pattern (2026-07-10):** Morpheus's Patrón B (Automated Bridge) unlocks all 20 creative ideas via shared `mcp-m365` infrastructure. Event-driven eliminates dual-source latency (~5.6s). Bridge architecture: Azure Functions + Event Grid + MCP encapsulation (€41-71/mo). Integration complete: NEXUS/CENTINELA/PULSO now have clear path to product; quick wins (StandupZero, HERMES) can begin immediately post-mcp-m365. Oracle-Morpheus alignment: both docs filed, decisions merged to decisions.md (#18 Oracle, #19 Morpheus), next gate = joperezd PoC sequencing approval.

- **Copilot SDK Creative Brainstorm (2026-07-10):** 20 creative project ideas combining Copilot SDK + Work IQ (M365) + MCP + GitHub. Key insight: the intersection CODE × CONTEXT (code intelligence + workplace intelligence) is an empty field nobody occupies. Top 3: NEXUS (context-aware PRs, $5-25K/yr), CENTINELA (EU AI Act compliance-as-code, $10-50K/yr), PULSO (DevEx analytics crossing GitHub + Calendar data). Quick wins: StandupZero (1 week), HERMES (1 week), CHRONO (1 week). The pattern "SDK for code analysis + Work IQ MCP for human context" is SS's unique competitive advantage. EU AI Act enforcement (Aug 2026) creates massive urgency for CENTINELA. Deliverable: docs/research/copilot-sdk-creative-projects.md.

- **Vercel AI SDK Decision Approved (2026-07-09):**Research confirmed + Trinity PoC validated. Recommendation: Vercel AI SDK v6 + Azure OpenAI + MCP for AUTONOMO.AI, AccesoPulse, CAMBIAZO. Cost €35-85/mo for 1K users. Trinity found 25-40x cold-start improvement vs Copilot SDK, 4-10x cost reduction. Baseline architecture: `poc/vercel-ai-chat/with-tools.js`. Approved for B2C; Copilot SDK reserved for FORJA/Squad.

- **Vercel AI SDK Deep Research (2026-07-08):** Full investigation of Vercel AI SDK v6 + Azure OpenAI + MCP for B2C products. Confirmed: Apache 2.0 license, native Azure provider (`@ai-sdk/azure`), first-class MCP support, `useChat()` React hooks, deploys on Azure Container Apps (not Vercel-dependent). Cost: ~€35-85/mo for 1K users with GPT-4o-mini. Prototype in 2-3 days. Recommended over Azure AI Agent Service (still preview), OpenAI Assistants (deprecated), and chat-as-a-service platforms. Deliverable: docs/research/vercel-ai-sdk-research.md.

- **Copilot SDK Research (2026-03-27):**MIT-licensed multi-language API; Top opportunities: (1) Extensions-as-a-Service via FORJA (unserved €2K-10K), (2) Squad headless runtime, (3-5) marketplace + domain products. Phase 1 approved (€0, 1w). Deliverable: docs/research/copilot-sdk-research.md.

- **Copilot SDK Conversational Engine — Final Verdict (2026-04-07):** NOT suitable for B2C (2.5s overhead, dev-focused tools, BYOK strips value, no UI). Recommendation: Vercel AI SDK + MCP + Azure OpenAI for AUTONOMO.AI/AccesoPulse/CAMBIAZO; Copilot SDK for FORJA/Squad headless. Deliverable: docs/research/copilot-sdk-chat-patterns.md.

- **CityPulseLabs Features (2026-03-25):** 12 features proposed (Quick/Medium/Ambitious tiers). Moat: hyper-local (heatmaps, scenic routing). All within €100/mo.

- **Awesome-Copilot Plugins (2025-03-19):** 9 SKILL.md installed (azure-cloud-dev 4, frontend-web 2, testing-automation 3). 12 agent templates skipped.

- **BiciCoruña Knowledge Audit (2026-03-22):** 3 awesome-* repos critical. 3 new skills needed. Prep: 6h.

- **Phase 13 Research (2026-03-22):** Feasibility spec (38.5KB): Public docs (10K words), Community marketplace, RFC governance. Viable, 10-week, +€25/mo.

- **Phase 9 Marketing (2026-03-22):** README updated (730 tests, Phase 8-9 deliverables). Blog: autonomy stats (18 issues/session, 15+ PRs/session).

- **Phase 5-3 Docs (2026-03-20-19):** Architecture docs (PR #46): architecture.md, constellation.md, onboarding.md. Game features + devlog B2.

