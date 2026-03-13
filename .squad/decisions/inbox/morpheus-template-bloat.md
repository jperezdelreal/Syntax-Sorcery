### 2026-03-14: P1-02 Template Bloat Resolution — Accept As-Is
**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** DECIDED

**What:** Templates directory (65KB across 31 files) accepted as-is. No restructuring needed.

**Analysis:**
- 31 files, largest 6.7KB — no individual file violates 15KB per-file limit
- Workflows (9 files, 31.7KB) are the biggest category — Squad ecosystem CI/CD scaffolding
- Templates are framework-provided scaffolding from Brady Gaster's Squad ecosystem, not SS-authored content
- CI enforcement (`squad-size-check.yml`) already excludes `templates/` per Trinity's design
- On-demand loading only — templates never bulk-loaded into context windows

**Why Option A over B/C:**
- **Not B (trim):** Content is framework-provided, not ours to trim. Removing Squad templates risks compatibility.
- **Not C (restructure):** Moving templates outside `.squad/` breaks Squad framework's expected directory structure. The framework discovers templates at `.squad/templates/`.
- **A is correct because:** The 15KB per-file rule targets operational files that inflate context windows. Templates are reference scaffolding, loaded one-at-a-time on-demand. The CI check already exempts them. This is a documented, intentional exception — not a violation.

**Risk:** Total `.squad/` is 149.3KB (non-template: 83.9KB). Template size is not the bloat driver — operational files are. Separate remediation needed for non-template .squad/ files.

**Action items:** None for templates. Flag non-template .squad/ size (83.9KB) as separate P1 concern.
