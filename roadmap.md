# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## ~~1. [x] Configure CI checks and branch protection~~ ✅

Delivered in PR #32 (merged 2026-03-18). Issue #30 CLOSED.

---

## ~~2. [x] Add constellation-wide health monitoring~~ ✅

Delivered in PR #33 (merged 2026-03-18). Issue #31 CLOSED.

---

## ~~3. [x] Create ralph-watch.ps1 monitoring dashboard~~ ✅

Delivered in PR #34 (merged 2026-03-18). Issue #29 CLOSED.

---

## ~~4. [x] Issue dedup guard for perpetual motion~~ ✅

Delivered in PR #38 (merged 2026-03-19). Issue #36 CLOSED.

---

## ~~5. [x] Azure satellite launcher scripts~~ ✅

Delivered in PR #39 (merged 2026-03-19). Issue #35 CLOSED.

---

## ~~6. [x] Autonomous PR review gate~~ ✅

Delivered in PR #40 (merged 2026-03-19). Issue #37 CLOSED.

---

## ~~7. [x] README premium overhaul — company-grade presentation~~ ✅

Delivered in PR #44 (merged 2026-03-19). Issue #41 CLOSED.

---

## ~~8. [x] Landing page visual upgrade — Matrix-themed premium design~~ ✅

Delivered in PR #47 (merged 2026-03-19). Issue #42 CLOSED.

---

## ~~9. [x] Architecture documentation with visual system diagrams~~ ✅

Delivered in PR #46 (merged 2026-03-19). Issue #43 CLOSED.

---

## ~~10. [x] Automated session report generator~~ ✅

Delivered in PR #54 (merged 2026-03-19). Issue #48 CLOSED.

---

## ~~11. [x] Unified developer CLI for all squad operations~~ ✅

Delivered in PR #55 (merged 2026-03-19). Issue #49 CLOSED.

---

## ~~12. [x] Constellation status page on landing site~~ ✅

Delivered in PR #53 (merged 2026-03-19). Issue #50 CLOSED.

---

## ~~13. [x] E2E integration test suite for the autonomous pipeline~~ ✅

Delivered in PR #57 (merged 2026-03-20). Issue #54 CLOSED.

---

## ~~14. [x] Autonomous performance metrics engine~~ ✅

Delivered in PR #58 (merged 2026-03-20). Issue #55 CLOSED.

---

## ~~15. [x] One-command developer bootstrap~~ ✅

Delivered in PR #59 (merged 2026-03-20). Issue #56 CLOSED.

---

## 16. [ ] Security hardening — dependency audit, secret scanning, SBOM (#62)

**Acceptance Criteria:**
- GitHub Actions workflow `.github/workflows/security-audit.yml` runs on push to main and on PRs
- Step 1: `npm audit --audit-level=high` — fails CI if high/critical vulnerabilities found
- Step 2: Secret scanning check — uses `git log --diff-filter=A` patterns to detect common secret formats (API keys, tokens, private keys) in staged files. Regex patterns for AWS, Azure, GitHub, generic tokens
- Step 3: SBOM generation — produces CycloneDX-format Software Bill of Materials from package.json + package-lock.json (use built-in `npm sbom` or lightweight script)
- Script `scripts/security-audit.js` for local execution: `npm run security` runs the same checks locally
- CLI flags: `--fix` (run `npm audit fix` for auto-remediation), `--sbom-only` (generate SBOM without full audit), `--json` (machine-readable output)
- Add `security` subcommand to squad-cli.js (routes to security-audit.js)
- Add `npm run security` script to package.json
- Unit tests (vitest) with DI-mocked exec calls — test each check independently, test combined report, test failure thresholds
- SBOM output saved to `docs/security/sbom-YYYY-MM-DD.json` when `--save` flag used
- No new dependencies — uses npm built-ins and regex-based scanning

**Files:**
- `.github/workflows/security-audit.yml` (create)
- `scripts/security-audit.js` (create)
- `scripts/__tests__/security-audit.test.js` (create)
- `scripts/squad-cli.js` (add `security` command routing)
- `package.json` (add npm script)
- `docs/security/` (directory created on first `--save`)

**Context:**
An autonomous system that handles GitHub tokens, deploys to Azure, and runs CI pipelines MUST have security foundations. 345 tests prove correctness; security audit proves responsibility. The supply chain is the attack surface — dependency vulnerabilities and leaked secrets are the #1 and #2 risks for any automated system. SBOM provides transparency into what the system depends on. This is the difference between an autonomous system you trust and one you worry about. Combined with CI integration, every PR gets security-checked before merge. The responsible autonomy signal.

---

## 17. [ ] Community contribution kit — CONTRIBUTING, CODE_OF_CONDUCT, templates (#61)

**Acceptance Criteria:**
- `CONTRIBUTING.md` at project root — comprehensive contributor guide covering: how to report bugs, how to suggest features, PR workflow (fork → branch → PR → review), code style (CommonJS, vitest, DI pattern), commit message format, squad architecture overview for contributors, how the perpetual motion cycle works
- `CODE_OF_CONDUCT.md` at project root — Contributor Covenant v2.1 adapted for Syntax Sorcery
- Issue templates in `.github/ISSUE_TEMPLATE/`:
  - `bug_report.yml` — structured bug report (description, steps to reproduce, expected vs actual, environment)
  - `feature_request.yml` — structured feature request (problem statement, proposed solution, alternatives considered)
  - `squad_task.yml` — internal squad task template (acceptance criteria, files, context — mirrors roadmap format)
  - `config.yml` — template chooser configuration with links to discussions
- PR template `.github/PULL_REQUEST_TEMPLATE.md` — checklist: description, related issue, test coverage, acceptance criteria met, breaking changes
- README.md updated: add Contributing section with link to CONTRIBUTING.md, add Code of Conduct badge
- All templates use GitHub's YAML form syntax for structured input
- No code changes, no new dependencies — documentation and templates only

**Files:**
- `CONTRIBUTING.md` (create)
- `CODE_OF_CONDUCT.md` (create)
- `.github/ISSUE_TEMPLATE/bug_report.yml` (create)
- `.github/ISSUE_TEMPLATE/feature_request.yml` (create)
- `.github/ISSUE_TEMPLATE/squad_task.yml` (create)
- `.github/ISSUE_TEMPLATE/config.yml` (create)
- `.github/PULL_REQUEST_TEMPLATE.md` (create)
- `README.md` (update — add Contributing section + badge)

**Context:**
The showroom is built (Phase 4), the system proves itself (Phase 6), but an outsider cannot contribute. No CONTRIBUTING.md means no one knows the workflow. No CODE_OF_CONDUCT means no safety guarantees. No issue templates means unstructured reports that waste agent time. No PR template means PRs arrive without context for the review gate. Community readiness is the difference between "a cool project" and "a professional open-source project." When the founder shares SS publicly, external contributors should find a clear, welcoming, structured path to participate. This is the final showroom piece.

---

## 18. [ ] Automated site deployment pipeline to GitHub Pages (#60)

**Acceptance Criteria:**
- GitHub Actions workflow `.github/workflows/deploy-site.yml` triggers on push to main (path filter: `site/**`, `docs/**`)
- Build step: `cd site && npm ci && npm run build` — produces static output in `site/dist/`
- Deploy step: uses `actions/deploy-pages@v4` to deploy to GitHub Pages
- Environment: `github-pages` with URL output
- Permissions: `pages: write`, `id-token: write` for OIDC deployment
- Concurrency group: `pages` — prevents simultaneous deployments, cancels in-progress on new push
- Build caching: cache `node_modules` and `.astro` build cache for faster rebuilds
- Status badge: add deployment status badge to README.md
- Smoke test: after deploy, `curl` the Pages URL and verify 200 response (or skip gracefully if URL not yet configured)
- Manual trigger: `workflow_dispatch` for on-demand deployments
- No new dependencies — uses official GitHub Actions (`actions/checkout`, `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`)

**Files:**
- `.github/workflows/deploy-site.yml` (create)
- `README.md` (update — add deployment status badge)

**Context:**
The landing page exists (Phase 4), the status page shows live data (Phase 5), but deploying requires manual steps. An autonomous company should deploy autonomously. Every push to main that touches site files should auto-build and auto-deploy to GitHub Pages. This completes the automation loop: code → CI → deploy. The founder pushes, the site updates. No human intervention. Combined with the security audit (PR checks) and community kit (contribution workflow), this creates a fully automated pipeline from contribution to production. The final automation piece.
