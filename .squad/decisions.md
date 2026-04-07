# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

## Active Decisions (Last 7 Days)
### 2026-07-08T00:00Z: Vercel AI SDK + Azure OpenAI confirmed for B2C Stack

**By:** Oracle (Product & Docs)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ APPROVED & RESEARCH COMPLETE

**Decision:** Adopt **Vercel AI SDK v6 + @ai-sdk/azure + MCP** as the official B2C stack for:
- AUTONOMO.AI (fiscal chat for autonomos)
- AccesoPulse (WCAG accessibility assistant)
- CAMBIAZO (residence change assistant)

**Key Metrics:**
- Cost: €35-85/mo for 1K users (vs Copilot SDK estimated €10-15/mo infra + development overhead)
- Cold start: <100ms vs Copilot SDK ~2.5s
- Production maturity: v6.x (stable) vs Copilot SDK v0.2.x (preview)
- React hooks: ✅ useChat() with native streaming
- Provider flexibility: 25+ (Azure, Anthropic, OpenAI, etc.) vs 1 (Copilot/BYOK)

**Architecture:**
- Deploys on Azure Container Apps (no Vercel required)
- Shared MCP servers across products (fiscal, banking, WCAG tools)
- Apache 2.0 license, zero lock-in

**Research:** `docs/research/vercel-ai-sdk-research.md` (29KB comprehensive analysis)

---

### 2026-07-08T12:00Z: Vercel AI SDK PoC Complete — 25-40x Faster Cold Start

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ PoC VALIDATED & COMMITTED

**Findings from side-by-side comparison (Copilot SDK vs Vercel AI SDK):**
- **Cold start:** <100ms (Vercel) vs ~2.5s (Copilot) — 25-40x improvement
- **Tool predictability:** Only custom tools (Vercel) vs built-ins compete (Copilot)
- **Cost at 100 users/day:** €2-5/day vs ~€20/day (4-10x cheaper with Vercel)
- **Code complexity:** 378 lines (with abstraction layer) vs 298 lines (Copilot hides complexity in subprocess)

**Deliverables:** 3 production-ready scripts at `poc/vercel-ai-chat/`:
- with-tools.js (FiscalBot multi-turn with tool use)
- streaming.js (streaming response patterns)
- basic-chat.js (minimal chat loop)

**Baseline for AUTONOMO.AI:** Start from `poc/vercel-ai-chat/with-tools.js`

**Verdict:** Vercel AI SDK wins decisively. Approved for all B2C products.

---
