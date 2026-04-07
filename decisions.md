# Syntax Sorcery — Team Decisions

## 2026-04-07T09:54Z: User directive
**By:** joperezd (via Copilot)  
**Tier:** Context  
**Status:** 📝 Captured

Los proyectos propuestos con Copilot SDK son demasiado centrados en desarrolladores. Quiere ideas para usuarios NO técnicos — negocios, oficinas, managers, ventas, RRHH, legal, finanzas. Pensar más allá del mundo dev.

---

## 2026-07-11: Business Products Brainstorm v2 — Non-Developer Focus
**By:** Oracle (Product & Docs)  
**Tier:** T1 (Product Strategy)  
**Status:** 🟡 PENDING joperezd REVIEW

### Decision
Pivot product strategy from developer tools to **non-technical business users**. 18 product ideas developed across 7 categories: Management, Sales, HR, Legal, Finance, Small Business/Autónomos, and Sector-Specific.

### Top 3 Recommendations
1. **LUNES** — Automated weekly status reports from M365 data. €15-25/user/mo. Quick win (1-2 weeks).
2. **CERRADOR** — AI sales follow-up assistant reading email. €29-49/user/mo. Quick win (2 weeks).
3. **PILOTO** — Daily assistant for autónomos/small business. €9-15/mo. Quick win (1-2 weeks).

### Key Insight
All 18 products share identical infrastructure (Work IQ MCP + Copilot SDK + Azure Functions). Building the first product = building the platform. The 2nd product is 70% faster, the 3rd is 90% faster.

### Market Data (Spain)
- 3.4M autónomos, 800K managers, 1.2M comerciales
- Kit Digital subsidies (€12K) available as acquisition channel
- Only 10-22% of PYMES have adopted AI
- M365 Copilot too expensive for SMBs (€28.10/user + license)

### Action Required
joperezd: Select 2-3 products for MVP development. Oracle recommends LUNES + PILOTO as first pair (B2B + B2C coverage, maximum quick-win potential).

### Deliverable
`docs/research/copilot-sdk-business-products.md` (18 ideas, full analysis, prioritization matrix)

---

## 2026-07-12: Autonomous App Tester Pattern — "VIGÍA"
**By:** Oracle (Product & Docs)  
**Tier:** T1 (Product Strategy)  
**Status:** 🟡 PENDING joperezd REVIEW

### Decision
Research validates the "Autonomous Judgment Tester" pattern (AOPR: Act → Observe → Propose → Repeat) as SS's most differentiated product concept to date. The pattern — inspired by jrubiosainz's LLM-Fighter where the Copilot SDK acts as a game-playing brain — transfers naturally to app testing: an AI that **uses** your app like a real user, judges the experience, and proposes improvements.

### Key Findings
1. **Market is $1B+ (2025), growing 20% CAGR** — AI testing is exploding but every player focuses on "self-healing tests" and "AI test generation". Nobody does autonomous judgment of product/UX quality.
2. **The gap is real** — 15+ competitors analyzed (Applitools, Momentic, Octomind, QA Wolf, Testim, etc.). None combine all 5 elements: autonomous navigation + product judgment + actionable proposals + verification + evolution loop.
3. **The Copilot SDK is the right engine** — Its agentic reasoning capability (plan-act-observe) is exactly what's needed. LLM-Fighter proves the pattern works in games; the transfer to apps is a natural extension.
4. **Product name: VIGÍA** — "Tu app bajo la lupa de una IA que piensa como usuario." Three models: audit reports (€500-2K), SaaS monitoring (€199-999/mo), CI/CD integration (€99-299/mo). Margins 70-85%.
5. **PoC success criteria defined** — VIGÍA tests CityPulseLabs for 24h, finds ≥5 real problems not in backlog, including ≥2 "judgment" issues (UX/perception, not just functional bugs).

### Action Required
joperezd: Approve Phase 1 PoC (2 weeks). Deliverable: VIGÍA v0 testing CityPulseLabs with Playwright + Copilot SDK (or Vercel AI SDK fallback).

### Deliverable
`docs/research/autonomous-app-tester.md` (25KB, 7 sections, 50+ references)

---

## 2026-07-12: VIGÍA — Autonomous App Tester Architecture
**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ⏳ PENDING joperezd APPROVAL

### Decision
Adopt **VIGÍA** as SS's autonomous testing product, using the **Copilot SDK + Playwright MCP + Axe MCP + GPT-4o vision** architecture. The agent uses web apps like a real user, discovers problems, and generates prioritized GitHub Issues with evidence and proposed fixes.

### Key Architecture Choices
1. **Copilot SDK** (not Vercel AI SDK) for orchestration — this is an infrastructure agent, not a B2C chatbot. MCP native support, multi-step planning, and Git tools are exactly right.
2. **Playwright MCP** (`@playwright/mcp`) for browser control — official Microsoft server, accessibility snapshots + screenshots, mobile emulation built-in.
3. **Dual perception:** Accessibility snapshots (structured, for interaction) + GPT-4o vision (screenshots, for UX judgment).
4. **GitHub Actions** as runtime — zero cost, schedule weekly, manual trigger for on-demand.
5. **Quality Score** formula: weighted average of functional (35%), UX (25%), performance (20%), accessibility (15%), mobile (5%).

### Cost
- MVP: €5-13/month (4 weekly runs)
- Per run: €0.80-1.30
- 10 apps: €45-85/month — well within budget

### MVP Scope (10 days)
Script that navigates BiciCoruña, tests core flows, runs axe-core, measures performance, and creates GitHub Issues. No vision, no multi-iteration, no mobile in v1.

### Integration
VIGÍA creates issues → Squad perpetual motion assigns → Team fixes → VIGÍA retests → quality score improves. Self-perpetuating QA loop.

### Deliverable
`docs/research/autonomous-tester-architecture.md`

### Next Steps
1. joperezd approval to start MVP
2. Assign to Trinity (SDK script) + Switch (testing validation)
3. Target: working demo in 10 days

