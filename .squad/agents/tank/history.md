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
