# Squad Decisions

## TLDR

Autonomous AI dev company (€500/mo Azure, unlimited GitHub). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

## Active Decisions (Last 7 Days)

### 2026-07-10: VIGÍA Test Coverage Rule — Tests Must Import Production Modules

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Status:** ✅ DECISION FILED  

**Finding:** PR #171 had 155 passing tests but a runtime crash on multi-URL runs. Root cause: TDD tests in `multi-url.test.js` tested an inline reference implementation of `parseUrls`, not the actual production code. Production code diverged from spec (missing deduplication) with no failing tests to catch it.

**Decision:** All tests must import and test the actual production module, not inline reference implementations.

**Rule:** When writing TDD tests ahead of implementation:
- Gate tests with `it.todo()` or `it.skip()` if the module doesn't exist yet
- NEVER test an inline reference function as a proxy for production code  
- The test file note must become a failing test, not a comment

**Impact:** Affects Switch (test writing) and @copilot (implementation). Scribe: add to team conventions.

---

### 2026-07-14: VIGÍA v0.4 — click_text fallback for failed CSS clicks

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED

**Decision:** When a CSS `click(selector)` fails in VIGÍA and the selector contains `:contains('...')` or `:has-text('...')`, automatically retry with `clickText(text)` using the extracted text. If `clickText` also fails, return the original error.

**Rationale:** The agent often generates CSS-like selectors with `:contains()` which Playwright doesn't natively support. Instead of teaching the agent about locator engines, the fallback transparently handles it. This keeps the agent's prompt simple and makes `click` work for both pure CSS and text-based selectors.

**Files:** `poc/vigia/lib/execute-command.js`, `poc/vigia/tests/commands.test.js`  
**Tests:** 5 new tests, 118 total passing.

---

### 2026-07-14: VIGÍA v0.3.0 — axe-core via CDN, no npm dependency

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED

**Decision:** axe-core is injected at runtime via CDN (`page.addScriptTag()`) rather than added as an npm dependency. This keeps the VIGÍA package lean and avoids version lock-in — the CDN URL can be bumped without touching package.json.

**New Commands Added:**

| Command | Purpose |
|---------|---------|
| `type_and_select` | Char-by-char typing + autocomplete selection |
| `wait_for_stable` | Network idle + MutationObserver DOM quiescence |
| `check_accessibility` | axe-core WCAG audit (CDN injection) |
| `check_links` | HEAD-check all page links for 404s |

**Test Impact:** 95 → 113 tests. All green.

---

### 2026-07-13: VIGÍA v0.2.0 — Vision via SDK Blob Attachments

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED

**Context:** VIGÍA MVP took screenshots but couldn't see them — the agent only received DOM text. Screenshots were saved to disk as evidence but never analyzed visually.

**Decision:** Use the Copilot SDK's native `blob` attachment type to send screenshot images directly to the agent as base64-encoded data. The SDK's `MessageOptions.attachments` supports `{ type: "blob", data: base64, mimeType: "image/png" }`.

**Key Findings:**
- gpt-4.1 supports vision (`ModelCapabilities.supports.vision`)
- No external image processing needed — SDK handles inline images natively
- 5MB per-image limit (base64), max 5 images per turn for safety
- Base64 stripped from text results to avoid token bloat — images travel as attachments only

**Error Handling Strategy:**
- `executeCommand` wrapped in try/catch (returns `{status: "error"}` instead of crashing)
- `sendAndCollect` has 2-minute timeout per turn
- SIGINT handler saves partial report + closes browser cleanly
- `session.error` event listener for SDK disconnections
- Fatal crash handler saves partial report before exit

**Alternatives Considered:**
- **sharp/canvas for visual metadata**: Not needed — SDK supports vision natively
- **axe-core for accessibility**: Deferred to v0.3.0 (would add dependency weight)
- **gpt-4o model swap**: Unnecessary — gpt-4.1 already supports vision

**Impact:** VIGÍA can now detect visual issues (layout, contrast, spacing, responsive breakage) that DOM inspection alone misses. Error handling ensures no crash leaves the user without a report.

---

### 2026-07-10: VIGÍA Test Suite + Bug Fix

**By:** Switch (Tester/QA)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED

**Bug Found & Fixed:**
- **File:** `poc/vigia/tools/reporter.js` line 114
- **Bug:** Sort comparator used `|| 3` (logical OR) instead of `?? 3` (nullish coalescing). Since `critical` has order value `0` (falsy in JS), `0 || 3` evaluates to `3`, making critical issues sort LAST instead of first.
- **Fix:** Changed `||` to `??`. Critical issues now correctly appear first in reports.

**Test Architecture:**
- Extracted `extractCommands` and `executeCommand` from `vigia.js` into `poc/vigia/lib/` for testability
- Tests at `poc/vigia/tests/` (4 files, 95 tests)
- Updated root `vitest.config.js` to include VIGÍA test patterns
- All test names in Spanish per project convention

**Files Changed:**
- `poc/vigia/tools/reporter.js` — bug fix (|| → ??)
- `poc/vigia/vigia.js` — imports from lib/ instead of inline functions
- `poc/vigia/lib/extract-commands.js` — extracted pure function
- `poc/vigia/lib/execute-command.js` — extracted dispatch function
- `poc/vigia/tests/browser.test.js` — 31 tests
- `poc/vigia/tests/reporter.test.js` — 24 tests
- `poc/vigia/tests/commands.test.js` — 25 tests
- `poc/vigia/tests/edge-cases.test.js` — 15 tests
- `vitest.config.js` — added vigia test pattern

---

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

### 2026-04-07T14:31:01Z: No auto-generation of GitHub Issues from VIGÍA findings

**By:** joperezd (User Directive via Copilot)  
**Tier:** T0 (User Decision)  
**Status:** ⏳ ACTIVE (Quality Gate)

**Directive:** No auto-generation of GitHub Issues from VIGÍA findings until the tester is solid. Otherwise it would flood the repo with low-quality issues.

**Rationale:** User request — quality gate before automating issue creation.

---

### 2026-04-07T14:48:59Z: VIGÍA must be aggressive during testing

**By:** joperezd (User Directive via Copilot)  
**Tier:** T0 (User Decision)  
**Status:** ⏳ ACTIVE (Execution Style)

**Directive:** VIGÍA debe ser agresivo — darle una paliza total a la app que pruebe. No terminar pronto. Usar todos los turnos disponibles, probar búsqueda, formularios, navegación, interacciones, todo.

**Rationale:** User request — agent was terminating in 7/15 turnos without testing critical features like `type_and_select`.

---

### 2026-04-07T16:57:36Z: Version-over-version regression testing for VIGÍA

**By:** joperezd (User Directive via Copilot)  
**Tier:** T0 (User Decision)  
**Status:** ⏳ ACTIVE (Quality Gate)

**Directive:** Después de cada versión de VIGÍA, ejecutar un test headless contra CPL y comparar resultados con la versión anterior. Cada versión debe ser mejor que la anterior (más issues reales, menos falsos positivos, más turnos útiles).

**Rationale:** User request — quality gate para asegurar progreso real entre versiones.

---

### 2026-04-08: Vitest 4 — Options-as-Second-Arg Pattern for Timeouts

**By:** Switch (Tester/QA)  
**Tier:** T2 (Implementation)  
**Status:** ✅ DECISION FILED  

**Finding:** Vitest 4 removed the signature `describe('name', fn, { timeout })`. Options must now be the second argument: `describe('name', { timeout }, fn)`.

**Decision:** All new tests with custom timeouts must use the Vitest 4 pattern:
```js
describe('name', { timeout: 60000 }, () => { ... });
it('name', { timeout: 30000 }, async () => { ... });
```

**Impact:** Affects Switch (test writing) and @copilot (any test authoring). Existing tests without timeouts are unaffected.

---

### 2026-04-08: --output-format now functional (v1.1)

**By:** Trinity (Full-Stack Developer)  
**Tier:** T2 (Implementation)  
**Status:** ✅ IMPLEMENTED (PR #188)  

**Decision:** `--output-format` now controls report output. Default `md` generates only Markdown (no JSON). `json` generates only JSON. `html` generates a self-contained HTML report. `all` generates all three.

**Breaking Change:** Scripts that relied on `generateReport()` always producing both `.md` and `.json` files must now pass `--output-format all` (or `json`) to get JSON output. The default (`md`) no longer produces a `.json` file.

**HTML Report Features:** Inline CSS, severity color coding, responsive layout, collapsible sections, base64 screenshot embedding.

**Files:** `poc/vigia/tools/reporter.js`, `poc/vigia/vigia.js`, `poc/vigia/lib/config.js`, `poc/vigia/README.md`

---
