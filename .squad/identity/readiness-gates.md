# SS Internal Readiness Gates

## TLDR
Five gates must pass before SS intervenes in any downstream company (FFS first).
Gates 1–4 are automated and verifiable. Gate 5 is a human approval checkpoint.
All gates must be GREEN before Phase 1 begins.

## Gate 1: Context Hygiene Proven

**What:** SS's own `.squad/` files are under size limits, CI enforces them, Scribe archives proactively.

**Evidence required:**
- `Squad Size Check` GitHub Action passes on all PRs
- No operational `.squad/` file exceeds 15KB
- `skills/context-hygiene/SKILL.md` exists with hard limits defined
- Total operational `.squad/` size < 100KB

**How to verify:**
```bash
gh run list --workflow="Squad Size Check" --limit 3  # all ✓
```

## Gate 2: Downstream Framework Documented

**What:** `downstream-management.md` defines how SS governs downstream companies, including intervention protocol.

**Evidence required:**
- `.squad/identity/downstream-management.md` exists and is < 5KB
- Contains: relationship model, intervention protocol (5 steps), health monitoring metrics, upstream.json schema

**How to verify:**
```bash
wc -c .squad/identity/downstream-management.md  # < 5120 bytes
grep -c "Intervene\|Pause\|Resume" .squad/identity/downstream-management.md  # ≥ 3
```

## Gate 3: Audit Capability Ready

**What:** Reusable audit checklist exists for evaluating downstream companies.

**Evidence required:**
- `.squad/skills/downstream-audit/SKILL.md` exists
- Covers 5 categories: context health, architecture, squad setup, governance, autonomy
- Scoring rubric defined (A–F grades)

**How to verify:**
```bash
test -f .squad/skills/downstream-audit/SKILL.md && echo "PASS"
grep -c "Pass.*Warning.*Fail" .squad/skills/downstream-audit/SKILL.md  # ≥ 5
```

## Gate 4: Team Operational

**What:** SS team has completed at least 3 issues with proper branch → PR → merge lifecycle.

**Evidence required:**
- 3+ merged PRs with `Closes #N` in the body
- Each PR used a feature branch (not direct-to-master)
- Issues #2, #3, #4 are CLOSED

**How to verify:**
```bash
gh pr list --state merged --json number,title,body --limit 10
gh issue list --state closed --json number,title
```

## Gate 5: Founder Approval ⚠️ HUMAN GATE

**What:** Founder explicitly authorizes SS to intervene in FFS.

**Evidence required:**
- Comment or issue from `jperezdelreal` stating approval
- FFS execution paused or coordinated with SS schedule

**This gate CANNOT be automated.** It exists because FFS is live and running autonomously. Uncoordinated intervention breaks the pipeline.

## Gate Status Protocol

When all automated gates (1–4) pass:
1. Comment on epic #1 with gate assessment
2. Request Gate 5 approval from founder
3. Do NOT proceed to Phase 1 until Gate 5 is explicitly granted
