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
