# Tank — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Budget:** Azure max €500/month — hard limit. Cost-first infrastructure decisions.

## Learnings (Summarized)

**Phase 1 Foundation (Ralph Hardening + Cost Alerting):**
- Ralph v5: 30m timeout, exponential backoff (5→60m), 2h stale lock detection, 3-file log rotation, hourly heartbeat, Discord+GitHub alerts. Zero Azure cost (GitHub Actions free).
- 3-tier cost escalation: €400 alert → €450 escalate → €480 auto-kill. Dry-run mode safe. AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID required.

**Phase 2 Perpetual Motion & Safety Net:**
- Event-driven workflow: issues.closed → roadmap depletion → auto-create next roadmap. Rate limiting semaphore, roadmap parser (numbered/bulleted lists).
- Daily escalation cron (00:00 UTC): detects >72h inactivity, >3 build fails, >7d stuck roadmap, >5d copilot-ready without PR. Idempotent.

**Phase 3 Infrastructure (Bicep IaC + Cloud-Init):**
- Bicep template for VM provisioning: cloud-init YAML (not runcmd), SSH-only NSG, Standard SKU static IP, user-assigned managed identity. Cost ~€25-30/mo.
- Azure VM Dry-Run findings: B-series unavailable West Europe → switched to North Europe (zone 1). Cloud-init fully successful. Node.js v18 instead of v20 (minor issue). SSH + gh auth working. 8GB RAM / 29GB disk ample.

**Phase 3 GitHub Token Provisioning & Session Watchdog:**
- Token injection via cloud-init write_files (safer than runcmd). Created setup/verify scripts for PAT validation. Bicep template optional param (empty by default, manual config post-deploy).
- Session watchdog (session-watchdog.sh): monitors 5 tmux satellite sessions every 30min. Checks: alive, uptime (recycles >6h), disk, memory. Systemd timer integration for journalctl logs. CRITICAL after 3 consecutive failures.

**Phase 2-A5 3-Layer Autonomy Architecture:**
- Layer 1: perpetual-motion.yml (Cloud, event-driven). Layer 2: ralph-watch.ps1 (Watch, 10min polling). Layer 3: Ralph sessions (Manual fallback).
- ralph-watch hardening: 10min cycle with exponential backoff, Squad CLI integration, max 3 consecutive auto-refuelings before escalation, structured logging to .squad/ralph-watch/*.log.
- Total cost: €0 perpetual motion + ~€25-30/mo Azure VM = €25-30/mo total. <15min/week human intervention needed.

**Phase 5 CityPulseLabs Function Deployment (#59, #60):**
- Deployed 5 Azure Functions to `func-citypulse-api` via `func azure functionapp publish`: health, stations, predict, weather, stationCollector (timer).
- Timer trigger: `0 */5 * * * *` — writes station snapshots to Cosmos DB every 5 minutes. Cosmos container: `bici-coruna/station-snapshots`, partitioned by `/stationId`.
- EasyAuth v2 was blocking all requests (401). Had to disable platform auth via REST API (`authsettingsV2`). Restart required after auth change.
- App Insights was NOT wired — added `APPLICATIONINSIGHTS_CONNECTION_STRING` app setting manually.
- CORS added for SWA: `https://icy-cliff-065550703.2.azurestaticapps.net`.
- Azure Monitor metric alert `citypulse-missing-data-alert`: fires if FunctionExecutionCount = 0 in 15min window, severity 2.
- CI/CD: Created `deploy-functions.yml` (OIDC-based, requires AZURE_CLIENT_ID/TENANT_ID/SUBSCRIPTION_ID secrets — not yet configured).
- Resource group: `rg-citypulse-citypulse-prod`. Function App: Linux, Node 20, Consumption plan.
- Key file paths: `api/src/functions/`, `api/src/shared/cosmos-client.ts`, `.github/workflows/deploy-functions.yml`.
- Cosmos client uses `ManagedIdentityCredential` when `COSMOS_ENDPOINT` is set (no connection string needed).
- **Session 2026-03-16:** PR #69 merged. Functions live. Data collection active ~22,752 snapshots/day. **PENDING:** Configure `ORS_API_KEY` in Function app settings for Trinity's route proxy: `az functionapp config appsettings set --name func-citypulse-api --resource-group rg-citypulse --settings ORS_API_KEY=<key>`
- **Cross-agent note:** Trinity built analytics skeleton awaiting Tank's data hookup; Switch has 116 contract tests defining Phase 5 shape; Mouse designed mobile UX with no dependency on analytics visual — all orthogonal.

**2026-04-07: Business Products Brainstorm v2 (Oracle):** 18 product ideas for non-developer users filed. Infrastructure insight: all products use Work IQ + Copilot SDK + Azure Functions. Estimated cost €41-71/mo per product. MVP decision pending from joperezd; Tank to scope Azure costs for selected products. **ACTION:** CityPulseLabs deployment returns 404 — fix needed to enable VIGÍA MVP production testing (Trinity blocked).


**Session 2026-03-21: PWA Cache-Busting Fix (PR #73):**
- Root cause: `CacheFirst` runtime cache for static assets (JS/CSS) with 30-day expiration was serving stale Vite-hashed bundles after new deploys. Users saw old Boost/Turbo option and old UI.
- Fix: Removed `static-assets` CacheFirst workbox rule (redundant — Vite content-hashes bundles, VitePWA precaches with revisions). Added `cleanupOutdatedCaches`, explicit `skipWaiting` + `clientsClaim`, manual SW registration with 60s periodic update checks, and `controllerchange` auto-reload with Spanish toast ("Nueva versión disponible").
- Key config: `injectRegister: false` (manual registration in `main.tsx`), `registerType: 'autoUpdate'`. OSM tile CacheFirst retained (external data, stable).
- Files: `vite.config.ts`, `src/main.tsx`, `tsconfig.app.json`, `tests/unit/serviceWorker.test.ts` (5 tests, all green). Build clean, 337 tests passing.
- Branch: `squad/cache-busting`. PR #73 created against `main`.

**Session 2026-03-25: Multi-Squad Azure VM R&D — Morpheus Proposal (T1 Architecture):**
- Morpheus delivered comprehensive R&D proposal for 5-session tmux-based VM constellation (~€44/mo B2s_v2 + Cosmos). No Docker, no per-service systemd — simple and proven pattern.
- Critical unknown: Copilot CLI rate limit (50-80 completions/hour per account, shared across sessions). Proposal recommends staggering (2-3 active max), with 4-phase rollout starting €2.40/week.
- Tank will own Phase 1 VM deployment when founder approves. Bicep template ready (PR #54), cloud-init proven. Prerequisite: founder decision + PAT.
- Cross-agent note: Morpheus also proposed 3 downstream products (CostaPulse, AccesoPulse, RutaViva) and BOLD services (FORJA, AUTONOMO.AI, CAMBIAZO). Both await founder approval. Tank's multi-squad work likely blocked until these foundational decisions made.

