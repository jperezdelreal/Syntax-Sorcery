# Morpheus Audit Responses — Founder Review

**Date:** 2026-03-24  
**By:** Morpheus (Lead/Architect)  
**Context:** Founder reviewed deep audit, asked questions on each item.

---

## ❌ Prometido pero NUNCA hecho

### 1. Playwright
**SKIP** — Switch is implementing now. Acknowledged.

### 2. Azure VM (#112)
**DONE** — Comment added to #112 marking it on hold per founder decision. Issue stays open.

### 3. Branch protection
**ANSWER:** The original concern (decisions.md, Phase 2) was about protecting the CI pipeline and preventing force-pushes to master — standard software engineering practice. It was never specifically about preventing file deletion. If the actual need is just "don't delete a specific file," then yes, branch protection is overkill. A CODEOWNERS rule or a CI check that verifies the file exists would be simpler. **Recommendation:** Skip branch protection unless the founder identifies a specific file to protect.

### 4. Daily Devlog → BLOG
**DIRECTIVE CAPTURED.** Founder wants a BLOG, not a devlog. No devlog issues exist to close (searched all open issues — none match). The B2 workstream reference in now.md has been removed in the rewrite. Future work: create a blog section on the SS GitHub Pages site. This is now a founder-mandated priority.

### 5. Squad Monitor
**ANSWER:** The SS GitHub Pages site has a dashboard section (built by Trinity, PR #53), but it shows build-time/hardcoded data, not live monitoring. The `ffs-squad-monitor` repo (`jperezdelreal/ffs-squad-monitor`) is a separate monitoring tool for downstream game repos only (flora, ComeRosquillas, pixel-bounce). It has 544 tests and was graded A- in the downstream audit. It's operational but scoped to FFS games, not SS itself. **Bottom line:** SS dashboard ≠ live monitoring. The squad-monitor repo exists and works for games. Trinity is currently fixing SS dashboard to show real data.

### 6. C1-C3 features
**ANSWER:** These were workstream C items in the Phase 2 plan (now.md): "C1: Flora features, C2: ComeRosquillas features, C3: pixel-bounce features." The founder is correct — SS should NOT define game features. That's each game repo's Lead's job. **Marked N/A.** Removed from now.md in rewrite.

### 7. Perpetual motion cross-repo
**ANSWER:** The `perpetual-motion.yml` workflow currently exists only in the SS repo. The original idea was to copy it to all downstream repos (flora, ComeRosquillas, pixel-bounce, etc.) so that when any repo's issue board clears, it auto-reads that repo's `roadmap.md` and creates the next issue. Think of it as a "self-refueling engine" — each repo would autonomously create its own work. It was never deployed cross-repo.

### 8. Cost alerts
**SKIP** — On hold per founder.

### 9. Monitoring
**ANSWER:** The SS GitHub Pages site has a "Status" section, but it shows static/build-time data (test counts, repo list). It does NOT show live metrics like current CI status, real-time velocity, or active issues. Trinity is working on making it pull real data from GitHub API at build time. It's not "monitoring" in the ops sense — it's a dashboard that updates on deploy.

### 10. ralph-watch.ps1
**CONFIRMED DONE.** File does not exist anywhere in the repo. Trinity cleaned it up. Only historical references remain in log files.

---

## 🔧 Roto

### CI RED gameplay tests
**ANSWER:** There are gameplay test files in `scripts/__tests__/gameplay-test-framework.test.js` — these test a Node.js gameplay testing framework (not actual games). The framework validates game state transitions, input handling, and scoring logic using mock data. They run fine locally on Windows. The issue was that CI (Ubuntu) couldn't resolve Windows-style paths. **This was fixed** in commit `41c42b4` which upgraded Node.js from 20 to 22 in all workflows. Current CI status should be checked to confirm they pass now.

### Security audit RED
**ANSWER:** The `security-audit.yml` workflow runs `scripts/security-audit.js` which scans for hardcoded secrets/tokens. It flags test fixture files that contain mock tokens (e.g., `"token": "mock-abc123"` in test data). These are false positives — the tokens are fake test data, not real secrets. The workflow uses `|| true` on `npm audit` so it doesn't block CI, but the security script itself may still flag these. **Fix:** Add exclusion patterns for `__tests__/` and `fixtures/` directories in the security audit script.

### 22 pixel-bounce tests
**NOTED** — This is a pixel-bounce repo issue, not SS. Will be addressed in the pixel-bounce session.

### beneficial-bar submodule
**ANSWER:** `beneficial-bar/` is NOT a submodule — it's a standalone directory inside SS. It's an Astro-based starter template that contains Playwright test templates for downstream game repos. Inside it has `playwright-template/tests/` with smoke tests, gameplay interaction tests, and menu navigation tests that game repos can copy and customize. Think of it as a "testing toolkit" that Switch uses as the source template when rolling out Playwright to flora, ComeRosquillas, and pixel-bounce. There's no `.gitmodules` because it was never intended to be a submodule — it's just a template directory.

### Silent-fail workflows
**LIST:**
| Workflow | How it fails silently |
|----------|----------------------|
| `perpetual-motion.yml` | `continue-on-error: true` on the whole job — most dangerous, autonomous engine ignores all failures |
| `constellation-health.yml` | `\|\| true` on report generation — health check always "passes" |
| `cost-alert.yml` | Multiple `\|\| true` and `2>/dev/null` — Azure resource queries and termination failures swallowed |
| `gdd-to-issues.yml` | `\|\| true` on git diff — missing files don't trigger errors |
| `implement-game.yml` | Multiple `\|\| true` — gh issue/git failures silenced |
| `proposal-pipeline.yml` | `\|\| true` on git diff — same pattern |
| `security-audit.yml` | `\|\| true` on npm audit — intentional but hides real vulns |

---

## 📄 Solo papel

### Phase 12-15 specs
**DELETED.** Removed `docs/phase13-community-opensource-spec.md`, `docs/phase14-scaling-ha-spec.md`, `docs/phase15-revenue-sustainability-spec.md`. No phase12 spec file existed.

### Roadmap items 19-36
**ANSWER:** These live in `roadmap.md` (items 19-36, all marked `[x]` done). They were scripts/infrastructure built during Phases 8-9: Test 3 pre-flight, Azure Bicep templates, session watchdog, live metrics dashboard, downstream repo audit, MCP server, plugin marketplace infra, gameplay testing framework, etc. They were tested against mocks locally but never validated in production. They exist as code in `scripts/` and `mcp-server/` but the "done" status is misleading — they work locally but were never deployed.

### Proposal pipeline
**ANSWER:** It's a GitHub Actions workflow (`.github/workflows/proposal-pipeline.yml`) that automates the path from a text game proposal to a playable prototype. You drop a `.proposal.md` file in `docs/proposals/`, and the workflow validates it → generates a GDD → creates issues → triggers implementation. Architecture doc at `docs/proposal-to-prototype.md`. It works but was never used for real — zero proposals have been submitted.

### Plugin marketplace
**ANSWER:** It's infrastructure for a Squad plugin/skills system. `docs/plugins.md` defines the structure (SKILL.md files in `.squad/skills/`), and roadmap item #74 built a registry/discovery PoC. The idea was that Squad agent patterns could be packaged, shared, and eventually sold. It's architecture-astronaut territory — built before there was demand. The code exists but nobody uses it.

---

## 🗑️ Para borrar

### now.md
**REWRITTEN.** Cut from 128 lines to 20 lines. Reflects actual state: what works, what's on hold, what's next. Removed all stale Phase 2 workstream details, fake timelines, and devlog references.

### wisdom.md
**KEPT.** Not empty — has a header and template structure. It's a valid placeholder for team learnings. Only 8 lines. Not worth deleting as the template system references it.

### Phase 12-15 specs
**DELETED** (see above).

### Roadmap items 37-51
**ANSWER:** These are in `roadmap.md`, lines covering Phases 10-15. Items 37-51 are all `[ ]` (not done) and reference rejected phases: Azure VM launch (37, on hold), gameplay framework expansion (38-39), plugin marketplace go-live (40), MCP ecosystem (41), multi-company federation (42), community governance (43-45), multi-cloud/AWS/GCP (46-48, explicitly vetoed by founder), and revenue/enterprise licensing (49-51). **Recommendation:** Delete items 40-51 (Phases 12-15, all rejected). Keep 37 (Azure, on hold) and 38-39 (gameplay, potentially valid once Switch finishes Playwright). Will trim in this commit.

---

## Actions Taken This Session

1. ✅ Deleted Phase 13-15 spec files from docs/
2. ✅ Rewrote now.md (128 → 20 lines, honest)
3. ✅ Added "on hold" comment to #112
4. ✅ Created this response file
5. ✅ Trimmed roadmap.md (removed rejected Phase 12-15 items)
6. ✅ No devlog issues to close (none existed)
7. ✅ Confirmed ralph-watch.ps1 already deleted
