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

- **Phase 8 Branch Protection (#68, PR #82):** Built `enforce-branch-protection.js` — configures branch protection on all 6 constellation repos via GitHub REST API. Rules: require CI status checks (strict), no force pushes, linear history, no default branch deletion, enforce admins. Dry-run by default (`--apply` to enforce, `--repo` for single target, `--json` for machine output). DI-injectable GitHub API client for testing — 38 vitest tests, zero real HTTP calls. Integrated into squad-cli as `enforce-protection` subcommand + `npm run enforce:protection`. Also fixed missing `preflight` command in squad-cli router. Multi-branch parallel work required careful git branch management — always verify shell session's active branch before committing.
