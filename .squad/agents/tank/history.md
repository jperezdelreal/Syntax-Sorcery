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

- **GitHub Token Provisioning (#125, PR #140, 2026-03-14):** Built complete infrastructure for GitHub PAT injection. Key decisions: (1) Token injected via cloud-init `write_files` directive — creates `/etc/profile.d/github-token.sh` with `export GH_TOKEN="{token}"` at boot time. More reliable than `runcmd` scripts. (2) Created `setup-github-token.sh` script accepting token via 3 methods: CLI arg, stdin pipe, or $GH_TOKEN env var. Validates format (ghp_* or github_pat_*), configures gh auth, updates /etc/environment + ~/.bashrc + tmux global env. (3) Created `verify-github-token.sh` for 6-check validation: auth status, scopes (must have 'repo'), rate limit, user info, repo access test, expiration check. Exit 0 = ready, 1 = issues. (4) Bicep template updated with optional `githubToken` secure param. Empty by default — can deploy without token and configure manually later. (5) Token storage: `.squad/secrets/github-token` (chmod 600, gitignored). Pattern: Secrets in cloud-init YAML are base64-encoded automatically by Azure — no manual encoding needed. (6) Documentation split: `MANUAL-GITHUB-TOKEN-SETUP.md` for human steps (PAT creation), scripts README for automation workflow. Human must create PAT manually — cannot be automated. Infrastructure ready for token injection at deploy time or post-deployment configuration.

- **Perpetual Motion Enhancements (#149, PR #156, 2026-03-22):** Enhanced existing perpetual motion workflow with event logging and time-based rate limiting. Key additions: (1) Time-based rate limiting (30 min cooldown) — checks `.squad/motor-log/YYYY-MM-DD.json` for last run timestamp, prevents runaway costs. (2) Structured JSON event logging — logs both `issue_created` and `roadmap_exhausted` actions with timestamps, trigger issue, created issue, repo, and workflow run ID. (3) Comprehensive architecture documentation header — 40+ line comment explaining purpose, architecture, safety mechanisms, cross-repo deployment scope, and roadmap format. (4) Concurrency control — `concurrency.group` ensures only 1 workflow per repo runs at a time. (5) Dual rate limiting strategy: semaphore (max 1 open copilot-ready issue) + time-based (30 min). Pattern: Event logs provide full audit trail without external services. Time-based limiting prevents GitHub Actions abuse while preserving event-driven responsiveness. Non-breaking enhancement to already-deployed workflow — backward compatible, creates motor-log directory on first run. Cost: €0 (GitHub Actions free tier). Critical path item for Phase 2 autonomous operation.

- **Ralph-Watch Layer 2 Refueling (#153, PR #161, 2026-03-24):** Built complete Layer 2 refueling automation for perpetual motion architecture. ralph-watch.ps1 is a hardened PowerShell watchdog that monitors all 6 constellation repos every 10 minutes, detects "Define next roadmap" issues, and autonomously refuels via Squad CLI sessions. Key features: (1) 10min polling cycle with exponential backoff (5m → 60m on failures). (2) Squad CLI integration — launches `copilot --mode session` with 30min timeout per repo. (3) Roadmap cycle limit — max 3 consecutive auto-refuelings without human review, creates escalation issue if exceeded. (4) Comprehensive hardening from ralph-hardening SKILL: session timeout, exponential backoff, stale lock detection (>2h), log rotation (3-file depth, 7-day retention), pre-round health checks, alert mechanism. (5) Structured logging to `.squad/ralph-watch/YYYY-MM-DD.log` with heartbeat tracking. (6) Configuration via `ralph-watch-config.json` — customizable intervals, timeouts, limits. (7) Complete documentation in `README-ralph-watch.md` — quick start, deployment scenarios (local + Azure VM), troubleshooting. Pattern: 3-layer autonomy architecture — Layer 1 (perpetual-motion.yml = Cloud, event-driven), Layer 2 (ralph-watch.ps1 = Watch, polling), Layer 3 (Ralph sessions = Manual fallback). Together: Zero-cost (€0) perpetual motion with <15min/week human intervention. Completes Phase 2-A5 autonomy workstream.
