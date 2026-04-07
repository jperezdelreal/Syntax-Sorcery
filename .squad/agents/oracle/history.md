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

- **VIGÍA v1.0 Documentation (2026-07-15):** Completed full documentation sprint for issue #170. Key facts for future docs work: VIGÍA uses a command loop pattern (not SDK tools) which means the SYSTEM_PROMPT must document all available actions inline as a table. The SDK 128 tool_calls limit is per-session, but multi-URL mode opens a new session per URL, effectively bypassing it. npm pack --dry-run is a fast way to validate package.json `files` array before actual publish. The shebang line (`#!/usr/bin/env node`) must be the very first line of the entry file for global CLI installs to work. vitest is already a dev dependency at root level but VIGÍA's package.json should also declare it for standalone installs.

- **Session 2026-04-07 (VIGÍA v1.0 Documentation Release):** PR #176 opened with complete v1.0 documentation. README, CHANGELOG, npm publish configuration ready. Documentation sprint completes issue #170. Quality gates now available for nightly regression testing.

- **Autonomous App Tester Pattern — VIGÍA (2026-07-12):**joperezd discovered LLM-Fighter (jrubiosainz) where Copilot SDK acts as a fighting game brain. Breakthrough insight: apply the same AOPR pattern (Act → Observe → Propose → Repeat) to app testing — AI that USES your app like a real user with product judgment. Research found $1B+ market (20% CAGR), 15+ competitors analyzed (Applitools, Momentic, Octomind, QA Wolf, etc.), but NONE combine autonomous navigation + product judgment + actionable proposals + verification + evolution loop. The "judgment" gap is real and unoccupied. Product concept: VIGÍA ("Tu app bajo la lupa de una IA"). Three models: audits (€500-2K), SaaS (€199-999/mo), CI/CD (€99-299/mo). Margins 70-85%. Stack: Copilot SDK (brain) + Playwright (hands) + Vision API + MCP tools + Azure. PoC: test CityPulseLabs 24h, find ≥5 real problems including ≥2 judgment issues. Key research refs: EvolveR (ICLR 2026), SE-Agent, Self-Evolving Agents Survey. Deliverable: docs/research/autonomous-app-tester.md. This is SS's most differentiated concept — the first where we don't compete with existing tools.

- **Business Products Brainstorm v2 (2026-07-11):**joperezd rejected v1 brainstorm — too developer-focused ("los proyectos son muy de desarrollador"). V2 pivots entirely to non-technical users: managers, sales, HR, legal, autónomos, teachers, clinics, real estate. 18 product ideas across 7 categories. Key insight: the money is NOT in selling to developers — it's in automating what everyone does with email. Email IS the operating system of 90% of companies. Top 3: LUNES (weekly status reports that write themselves, €15-25/user/mo), CERRADOR (sales follow-up that reads your email, €29-49/user/mo), PILOTO (daily assistant for autónomos, €9-15/mo). All share same infra: Work IQ MCP + Copilot SDK + Azure Functions. Building 1 product = building the platform; 2nd is 70% faster. Spain market: 3.4M autónomos, 800K managers, 500K PYMES with active contracts. Kit Digital subsidies (€12K) = acquisition channel. Deliverable: docs/research/copilot-sdk-business-products.md.

- **SDK + Work IQ Integrated Pattern (2026-07-10):**Morpheus's Patrón B (Automated Bridge) unlocks all 20 creative ideas via shared `mcp-m365` infrastructure. Event-driven eliminates dual-source latency (~5.6s). Bridge architecture: Azure Functions + Event Grid + MCP encapsulation (€41-71/mo). Integration complete: NEXUS/CENTINELA/PULSO now have clear path to product; quick wins (StandupZero, HERMES) can begin immediately post-mcp-m365. Oracle-Morpheus alignment: both docs filed, decisions merged to decisions.md (#18 Oracle, #19 Morpheus), next gate = joperezd PoC sequencing approval.

- **Copilot SDK Creative Brainstorm (2026-07-10):** 20 creative project ideas combining Copilot SDK + Work IQ (M365) + MCP + GitHub. Key insight: the intersection CODE × CONTEXT (code intelligence + workplace intelligence) is an empty field nobody occupies. Top 3: NEXUS (context-aware PRs, $5-25K/yr), CENTINELA (EU AI Act compliance-as-code, $10-50K/yr), PULSO (DevEx analytics crossing GitHub + Calendar data). Quick wins: StandupZero (1 week), HERMES (1 week), CHRONO (1 week). The pattern "SDK for code analysis + Work IQ MCP for human context" is SS's unique competitive advantage. EU AI Act enforcement (Aug 2026) creates massive urgency for CENTINELA. Deliverable: docs/research/copilot-sdk-creative-projects.md.

- **Vercel AI SDK Decision Approved (2026-07-09):**Research confirmed + Trinity PoC validated. Recommendation: Vercel AI SDK v6 + Azure OpenAI + MCP for AUTONOMO.AI, AccesoPulse, CAMBIAZO. Cost €35-85/mo for 1K users. Trinity found 25-40x cold-start improvement vs Copilot SDK, 4-10x cost reduction. Baseline architecture: `poc/vercel-ai-chat/with-tools.js`. Approved for B2C; Copilot SDK reserved for FORJA/Squad.

- **Vercel AI SDK Deep Research (2026-07-08):** Full investigation of Vercel AI SDK v6 + Azure OpenAI + MCP for B2C products. Confirmed: Apache 2.0 license, native Azure provider (`@ai-sdk/azure`), first-class MCP support, `useChat()` React hooks, deploys on Azure Container Apps (not Vercel-dependent). Cost: ~€35-85/mo for 1K users with GPT-4o-mini. Prototype in 2-3 days. Recommended over Azure AI Agent Service (still preview), OpenAI Assistants (deprecated), and chat-as-a-service platforms. Deliverable: docs/research/vercel-ai-sdk-research.md.

- **Copilot SDK Research (2026-03-27):**MIT-licensed multi-language API; Top opportunities: (1) Extensions-as-a-Service via FORJA (unserved €2K-10K), (2) Squad headless runtime, (3-5) marketplace + domain products. Phase 1 approved (€0, 1w). Deliverable: docs/research/copilot-sdk-research.md.

- **Copilot SDK Conversational Engine — Final Verdict (2026-04-07):** NOT suitable for B2C (2.5s overhead, dev-focused tools, BYOK strips value, no UI). Recommendation: Vercel AI SDK + MCP + Azure OpenAI for AUTONOMO.AI/AccesoPulse/CAMBIAZO; Copilot SDK for FORJA/Squad headless. Deliverable: docs/research/copilot-sdk-chat-patterns.md.

- **VIGÍA Research Completion (2026-04-07):** Joint sprint with Morpheus completed. AOPR pattern research document filed (25KB). Market validated ($1B+, 20% CAGR). Competitive analysis (15+ vendors) confirms gap: no competitor combines autonomous navigation + product judgment + actionable proposals + verification + evolution loop. Product concept VIGÍA locked: three models (audits €500-2K, SaaS €199-999/mo, CI/CD €99-299/mo). PoC criteria defined: test CityPulseLabs 24h, ≥5 real problems, ≥2 judgment issues. Decision #20 filed. Awaiting joperezd approval for Phase 1 PoC (2 weeks). Orchestration log: 2026-04-07T10-25-37Z-oracle.md.

- **CityPulseLabs Features (2026-03-25):** 12 features proposed (Quick/Medium/Ambitious tiers). Moat: hyper-local (heatmaps, scenic routing). All within €100/mo.

- **Awesome-Copilot Plugins (2025-03-19):** 9 SKILL.md installed (azure-cloud-dev 4, frontend-web 2, testing-automation 3). 12 agent templates skipped.

- **BiciCoruña Knowledge Audit (2026-03-22):** 3 awesome-* repos critical. 3 new skills needed. Prep: 6h.

- **Phase 13 Research (2026-03-22):** Feasibility spec (38.5KB): Public docs (10K words), Community marketplace, RFC governance. Viable, 10-week, +€25/mo.

- **Phase 9 Marketing (2026-03-22):** README updated (730 tests, Phase 8-9 deliverables). Blog: autonomy stats (18 issues/session, 15+ PRs/session).

- **Phase 5-3 Docs (2026-03-20-19):** Architecture docs (PR #46): architecture.md, constellation.md, onboarding.md. Game features + devlog B2.

