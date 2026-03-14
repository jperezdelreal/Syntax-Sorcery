# Tank — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Budget:** Azure max €500/month — hard limit. Cost-first infrastructure decisions.

## Core Learnings

- **Phase 1 Ralph Hardening:** Identified 6 failure modes (session timeout, retry interval, lock check, log rotation, heartbeat, alerts). Fixed via v5: 30m timeout, exponential backoff (5→60m), 2h stale lock, 3-file rotation, hourly heartbeat, Discord+GitHub alerting. Zero Azure cost (GHA free tier).

- **Phase 1 Cost Alerting:** 3-tier escalation (€400 alert → €450 escalate → €480 auto-kill). Dry-run mode safe. Requires AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID. Deployed via GHA + Azure CLI.

- **Phase 2 Perpetual Motion:** Event-driven workflow (issues.closed → roadmap depletion → next roadmap). Rate limiting semaphore, roadmap parser (numbered/bulleted), auto-create issues, mark completed, refuel integration.

- **Phase 2 Safety Net:** Daily escalation-only cron (00:00 UTC). 4 detection checks: >72h inactivity, >3 build fails, >7d stuck roadmap, >5d copilot-ready without PR. Idempotent escalation creation.

- **Phase 3 (In Progress):** Dedup guard (PR #38) ✅, Azure launcher (PR #39) ✅, Review gate (PR #40) pending. Infrastructure ready for 24/7 Hub/Spoke operation.

## Learnings

- **Bicep IaC (Issue #67, PR #77):** Converted imperative `provision-vm.sh` to declarative Bicep template. Key decisions: cloud-init via `#cloud-config` YAML (not `runcmd` scripts), SSH-only NSG with explicit deny-all, Standard SKU static public IP, user-assigned managed identity for future RBAC. Deploy wrapper (`deploy.sh`) supports 5 modes: validate, what-if, deploy, teardown, smoke. Bicep params file uses `readEnvironmentVariable` for SSH key injection. All resources tagged `project:syntax-sorcery`. Cost stays ~€25-30/mo.
# Tank — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Budget:** Azure max €500/month — hard limit. Cost-first infrastructure decisions.

## Core Learnings

- **Phase 1 Ralph Hardening:** Identified 6 failure modes (session timeout, retry interval, lock check, log rotation, heartbeat, alerts). Fixed via v5: 30m timeout, exponential backoff (5→60m), 2h stale lock, 3-file rotation, hourly heartbeat, Discord+GitHub alerting. Zero Azure cost (GHA free tier).

- **Phase 1 Cost Alerting:** 3-tier escalation (€400 alert → €450 escalate → €480 auto-kill). Dry-run mode safe. Requires AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID. Deployed via GHA + Azure CLI.

- **Phase 2 Perpetual Motion:** Event-driven workflow (issues.closed → roadmap depletion → next roadmap). Rate limiting semaphore, roadmap parser (numbered/bulleted), auto-create issues, mark completed, refuel integration.

- **Phase 2 Safety Net:** Daily escalation-only cron (00:00 UTC). 4 detection checks: >72h inactivity, >3 build fails, >7d stuck roadmap, >5d copilot-ready without PR. Idempotent escalation creation.

- **Phase 3 (In Progress):** Dedup guard (PR #38) ✅, Azure launcher (PR #39) ✅, Review gate (PR #40) pending. Infrastructure ready for 24/7 Hub/Spoke operation.

## Learnings

- **Session Watchdog (#69, PR #79):** Built session-watchdog.sh for 24/7 Azure operation. Monitors 5 tmux satellite sessions every 30min via systemd timer. Checks: alive, uptime (recycles >6h), disk, memory. Tracks consecutive restart failures in /var/lib/ss-watchdog — after 3 failures, emits CRITICAL to structured JSONL log. Key pattern: systemd timer+oneshot is cleaner than cron for watchdog work on Ubuntu — gets journalctl integration for free. Pairs with existing satellites.service.

- **Azure VM Dry-Run (2026-03-14):** First live deployment of Bicep IaC template. Key findings: (1) Standard_B2s_v2 SKU has zero availability in West Europe for this subscription — entire B-series absent. Switched to North Europe where B2s_v2 is available (zone 1). RG location (westeurope) doesn't need to match resource location (northeurope). (2) Deployment succeeded in 53s — 6 resources created (VM, NIC, NSG, VNet, PIP, managed identity). VM IP: 4.210.68.157. (3) Cloud-init completed fully: all 5 repos cloned, gh/tmux/git installed. Node.js landed at v18.19.1 (Ubuntu default) instead of v20 — nodesource apt source in cloud-config may not override system packages reliably on Ubuntu 24.04. Functional but should be addressed if v20+ is required. (4) SSH works immediately with ed25519 key, gh auth needs PAT setup (expected). (5) 8GB RAM / 29GB disk — generous for 5 tmux sessions. (6) GitHub API and npm registry both reachable. **Action needed:** Update Bicep default location from `westeurope` to `northeurope`, and investigate Node.js version pinning in cloud-init.
