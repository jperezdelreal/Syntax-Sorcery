# Decision: VIGÍA — Autonomous App Tester Architecture

**Date:** 2026-07-11  
**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ⏳ PENDING joperezd APPROVAL

## Decision

Adopt **VIGÍA** as SS's autonomous testing product, using the **Copilot SDK + Playwright MCP + Axe MCP + GPT-4o vision** architecture. The agent uses web apps like a real user, discovers problems, and generates prioritized GitHub Issues with evidence and proposed fixes.

## Key Architecture Choices

1. **Copilot SDK** (not Vercel AI SDK) for orchestration — this is an infrastructure agent, not a B2C chatbot. MCP native support, multi-step planning, and Git tools are exactly right.
2. **Playwright MCP** (`@playwright/mcp`) for browser control — official Microsoft server, accessibility snapshots + screenshots, mobile emulation built-in.
3. **Dual perception:** Accessibility snapshots (structured, for interaction) + GPT-4o vision (screenshots, for UX judgment).
4. **GitHub Actions** as runtime — zero cost, schedule weekly, manual trigger for on-demand.
5. **Quality Score** formula: weighted average of functional (35%), UX (25%), performance (20%), accessibility (15%), mobile (5%).

## Cost

- MVP: €5-13/month (4 weekly runs)
- Per run: €0.80-1.30
- 10 apps: €45-85/month — well within budget

## MVP Scope (10 days)

Script that navigates BiciCoruña, tests core flows, runs axe-core, measures performance, and creates GitHub Issues. No vision, no multi-iteration, no mobile in v1.

## Integration

VIGÍA creates issues → Squad perpetual motion assigns → Team fixes → VIGÍA retests → quality score improves. Self-perpetuating QA loop.

## Full Architecture

See: `docs/research/autonomous-tester-architecture.md`

## Next Steps

1. joperezd approval to start MVP
2. Assign to Trinity (SDK script) + Switch (testing validation)
3. Target: working demo in 10 days

---

*This is the most architecturally interesting product SS has designed. An agent that genuinely uses software and provides human-quality feedback.*
