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

## ~~16. [x] Security hardening — dependency audit, secret scanning, SBOM~~ ✅

Delivered in PR #64 (merged 2026-03-21). Issue #62 CLOSED.

---

## ~~17. [x] Community contribution kit — CONTRIBUTING, CODE_OF_CONDUCT, templates~~ ✅

Delivered in PR #65 (merged 2026-03-21). Issue #61 CLOSED.

---

## ~~18. [x] Automated site deployment pipeline to GitHub Pages~~ ✅

Delivered in PR #63 (merged 2026-03-21). Issue #60 CLOSED.

---

## ~~19. [x] Test 3 pre-flight validation script~~ ✅

Delivered in Phase 8b. Completed as #66 (infrastructure validation pre-flight).

---

## ~~20. [x] Azure Bicep template — infrastructure as code~~ ✅

Delivered in Phase 8b (Bicep IaC infrastructure).

---

## ~~21. [x] Downstream branch protection enforcement script~~ ✅

Delivered in Phase 8b. Completed branch protection enforcement across all 5 downstream repos.

---

## ~~22. [x] Session watchdog for 24/7 Azure operation~~ ✅

Delivered in Phase 8b. Session auto-restart watchdog for context management on Azure VM.

---

## ~~23. [x] Live metrics dashboard on landing site~~ ✅

Delivered in Phase 8b. Real-time KPI dashboard (velocity, throughput, quality rate, test count, autonomous streak).

---

## ~~24. [x] Auto-update test count badge in CI~~ ✅

Delivered in Phase 8b. Badge automation: 453 passing tests (auto-updated on every CI run).

---

## Phase 8c: Operational Foundation (Complete)

**25. ~~[x] Downstream Repo Audit~~ ✅** (Issue #72)
Comprehensive code quality + test coverage assessment across FFS ecosystem. Surfaces gameplay validation patterns.

**26. ~~[x] MCP Server for Squad Ops~~ ✅** (Issue #73)
Exposing squad state to Copilot ecosystem. MCP server + design doc enabling platform integration.

**27. ~~[x] Plugin Marketplace Infrastructure~~ ✅** (Issue #74)
Registry, discovery, UI PoC, examples. Squad transforms into extensible platform.

**28. ~~[x] Gameplay Testing Framework~~ ✅** (Issue #75)
Real gameplay validation vs superficial unit tests. Puppeteer/Playwright integration for FFS game satellites.

**29. ~~[x] Test 3 Launch Checklist & Runbook~~ ✅** (Issue #76)
De-risk Azure launch: pre-flight checklist, deployment procedures, operational runbooks, incident playbooks.

---

## Phase 9: Gameplay Pilot & Strategic Integration (Complete)

**30. ~~[x] Gameplay Testing Pilot~~ ✅**
End-to-end gameplay validation across flora, ComeRosquillas, pixel-bounce using gameplay framework. Verified real feature delivery.

**31. ~~[x] Squad-Watch CLI~~ ✅**
Real-time constellation health monitoring. Team dashboard integration enabling live operational visibility.

**32. ~~[x] MCP Server Enhancement~~ ✅**
Extended MCP capabilities for deeper GitHub + squad integration. Copilot ecosystem bridge.

**33. ~~[x] Downstream Ecosystem Issues~~ ✅**
Triaged and operationalized strategic issues across FFS + satellite repos. Aligns downstream work with upstream vision.

**34. ~~[x] Research: Awesome-Copilot & Marketplace~~ ✅**
Market landscape analysis. Plugin marketplace positioning and strategy documentation.

**35. ~~[x] Test 3 Verification (629 tests)~~ ✅**
Constellation-wide test validation. 629 tests passing across SS hub + 5 game satellites. Ready for Azure launch.

**36. ~~[x] Phase 9 Documentation (This Issue #95)~~ ✅**
Strategic roadmap documentation + Phase 10+ vision. Completed this document.

---

## Phase 10: Test 3 Azure Launch (Planned)

**37. [ ] Test 3 Azure VM 24/7 Operation**
Actual deployment to Azure B2s_v2 VM. Full constellation running autonomously: 629 tests passing, Bicep infrastructure, session watchdog active, metrics dashboard live. 24/7 operation with session auto-reset, GitHub Actions CI on 30-minute cadence.

**Acceptance Criteria:**
- Azure resource group provisioned via Bicep with IaC validation
- VM running Ubuntu 24.04, tmux sessions for each satellite repo
- Session watchdog auto-restarting context every 6 hours
- Ralph generating Phase 10 issues on board-clear (via Sprint Planning)
- Live metrics dashboard showing real 24/7 performance (velocity, throughput, quality rate)
- Zero manual intervention — founder monitoring only
- Pre-flight validation script passing 100%

---

## Phase 11: Gameplay Testing Rollout (Planned)

**38. [ ] Expand Gameplay Framework to All Downstreams**
Scale gameplay validation across entire FFS constellation. Real-time gameplay CI on every game update.

**39. [ ] Autonomous Game Feature Delivery**
Full gameplay pipeline: GDD → proposal → implementation → gameplay test → merge. Autonomous game development.

---

## Phase 12: Platform Evolution (Planned)

**40. [ ] Plugin Marketplace Go-Live**
Public plugin registry. Community plugins for Squad. Revenue model prototype: premium plugins, marketplace integration.

**41. [ ] Expanded MCP Ecosystem**
Enterprise MCP server exposing full squad state (metrics, decisions, skills). GitHub Copilot + enterprise integrations.

**42. [ ] Multi-Company Federation**
Governance model for multiple downstream companies (FFS Phase 2, additional studios). Shared infrastructure, independent roadmaps.

---

## Phase 13: Community & Open-Source (Planned)

**43. [ ] Public Documentation & Onboarding**
Comprehensive guides: architecture, squad operations, autonomous company playbook. Enable community AI dev teams.

**44. [ ] Skills Marketplace**
Public skills database. Community contributes reusable agent patterns. Certifications for advanced skills.

**45. [ ] Community Governance**
RFC process for major decisions. Community voting on strategic direction. Transparent roadmap.

---

## Phase 14: Multi-Cloud & Scaling (Planned)

**46. [ ] AWS + Google Cloud Support**
Expand beyond Azure. Multi-cloud IaC, cost optimization, regional failover.

**47. [ ] Kubernetes Constellation**
Scale to 50+ satellite repos. Distributed orchestration, auto-scaling, cost-aware scheduling.

**48. [ ] Global Deployment**
Multi-region satellite networks. Real-time replication, compliance per region.

---

## Phase 15: Revenue & Sustainability (Planned)

**49. [ ] Premium Plugin Marketplace**
Monetized plugins. Premium support tiers. Sustainable business model for open-source team.

**50. [ ] Enterprise Squad Licensing**
White-label Squad for enterprise teams. Per-agent pricing, compliance certifications.

**51. [ ] Autonomous Company-as-a-Service**
Turnkey service: "Bring your game, we'll autonomously develop it." SaaS pricing model.
