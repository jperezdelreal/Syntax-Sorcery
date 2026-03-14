# Squad Decisions Archive

**Archived:** 2026-03-13T10:57:00Z by Scribe  
**Reason:** decisions.md exceeded 15KB alert threshold. Archived audit/assessment entries (P1-01 through P1-03, P1-06) for reference; active work decisions retained in main file.

## Archived Entries

### 2026-03-13: P1-01 FFS Read-Only Audit Complete
**By:** Morpheus (Lead/Architect)
**Status:** COMPLETE
**What:** FFS constellation grades C overall (0.68). Hub context bloat critical: decisions-archive 627KB (12.5× over 50KB limit), growth-framework 55KB, new-project-playbook 45KB. Downstream repos (ComeRosquillas B, Flora C, ffs-squad-monitor B) have clean context but governance/autonomy gaps. Top 3 remediation priorities: (1) Hub context bloat, (2) triage workflow sync, (3) test infrastructure.
**Why:** Audit-first approach validates FFS maturity before intervention. C-grade is acceptable per readiness gates.

### 2026-03-14: P1-02 Template Bloat Resolution
**By:** Morpheus (Lead/Architect)
**Status:** DECIDED
**What:** Templates 65KB (31 files, largest 6.7KB) accepted as-is. Framework-provided scaffolding, on-demand loading only, CI already excludes. No individual file violates 15KB limit. Non-template .squad/ files (83.9KB) flagged as separate P1 concern.
**Why:** Templates are reference material, not operational bloat. Restructuring breaks Squad framework. Limit applies to operational files that inflate context windows.

### 2026-03-13: P1-03 FFS Context Health Map Complete
**By:** Oracle (Product & Docs)
**Status:** COMPLETE
**What:** FFS context health YELLOW (C+). Critical violations: decisions-archive.md (642KB—42× limit), aaa-gap-analysis.md (38KB—2.5× limit). Active governance files healthy (6/7 <15KB with TLDR layers). Remediation: split archives by era, index creation, domain-specific split for gap analysis. Post-remediation frees ~165K tokens/session (27% budget improvement).
**Why:** Context bloat is bottleneck. Efficient archive structure enables downstream operations at scale.

### 2026-03-13: P1-06 FFS Skills Inventory Complete
**By:** Oracle (Product & Docs)
**Status:** COMPLETE
**What:** 34 FFS skills classified: 22 domain-agnostic (→SS cherry-pick), 12 game-specific (→FFS reference), 3 overlapping (merge), 2 flagged hidden dependencies. Immediate cherry-pick: feature-triage, multi-agent-coordination (CRITICAL for SS parallel work).
**Why:** Skills classification enables efficient cherry-pick migration without game-baggage bloat.

---

### 2026-03-20T04:00Z: Decision — Phase 7 Roadmap: Elite Readiness

**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** ✅ DEFINED
**Date:** 2026-03-20

**What:** Phase 7 roadmap defined after Phase 6 completion. Strategic shift: Phases 2-3 built the engine, Phase 4 built the showroom, Phase 5 built operational intelligence, Phase 6 made the system self-proving, Phase 7 makes the system *elite-ready* — secure, community-open, and fully automated end-to-end. Three items mixing deep infrastructure + visible polish + automation completion:

1. **Security hardening — dependency audit, secret scanning, SBOM** (#62) — GitHub Actions workflow + local script for supply chain security. 
pm audit fails CI on high/critical vulns. Regex-based secret scanning catches leaked tokens. CycloneDX SBOM generation for transparency. 
pm run security + squad-cli integration. The responsible autonomy signal: 345 tests prove it works, security audit proves it's safe.
2. **Community contribution kit** (#61) — CONTRIBUTING.md (PR workflow, code style, DI pattern), CODE_OF_CONDUCT.md (Contributor Covenant v2.1), issue templates (bug, feature, squad task) with YAML form syntax, PR template with review checklist. The final showroom piece: README explains, landing page impresses, contribution kit WELCOMES.
3. **Automated site deployment pipeline** (#60) — GitHub Actions deploys Astro site to GitHub Pages on push to main. Path-filtered triggers (site/**, docs/**), build caching, concurrency control, OIDC deployment. The final automation piece: code → CI → security → deploy. Zero manual steps.

**Rationale:** The engine runs (Phase 2-3), the showroom shines (Phase 4), the system reports on itself (Phase 5), and it proves its own correctness (Phase 6). But it can't verify its supply chain is secure (no audit), can't welcome external contributors (no templates), and can't deploy without manual intervention (no CD pipeline). Phase 7 closes all three — the system becomes elite-ready. Security + Community + Automation = production-grade open-source project.

**Impact:** Roadmap items 13-15 marked done. Items 16-18 added. Issues #60, #61, #62 created with label squad. Board refueled — Ralph can assign to @copilot.
