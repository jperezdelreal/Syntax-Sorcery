---
name: "🤖 Copilot-Ready Task"
about: "Well-defined task for autonomous @copilot execution"
labels: ["copilot-ready"]
assignees: ["copilot"]
---

## 🎯 Objective

<!-- Clear one-sentence goal. What outcome does this achieve? -->

Write a single sentence describing what this task accomplishes.

---

## ✅ Acceptance Criteria

<!-- Testable requirements that define success. Focus on WHAT to achieve, not HOW. -->
<!-- @copilot reads the repo — trust it to determine implementation approach. -->

- [ ] Criterion 1: Observable outcome or behavior (e.g., "Script returns exit code 0 when all checks pass")
- [ ] Criterion 2: Testable condition (e.g., "README.md includes new section with code example")
- [ ] Criterion 3: Verifiable requirement (e.g., "All existing tests continue to pass")

---

## 📁 Files Involved

<!-- Specific paths and what changes are needed in each -->

**Files to modify:**
- `path/to/file1.js` — Add/modify X functionality
- `path/to/file2.md` — Update documentation for Y

**Files to create:**
- `path/to/new-file.js` — New utility for Z

**Files to reference:**
- `path/to/existing-pattern.js` — Follow existing pattern from this file

---

## 🔍 Context Hints

<!-- Patterns from codebase, constraints, conventions to follow -->

**Existing Patterns:**
- This repo uses X pattern for Y (see `path/to/example.js`)
- Tests are located in `scripts/__tests__/` directory with `.test.js` suffix
- Documentation follows format in `.squad/guides/` (see existing guides)

**Constraints:**
- Must work with Node.js (no additional runtime dependencies)
- Cost: €0 (use GitHub free tier tooling only)
- Must not break existing functionality

**Related Work:**
- Related to roadmap item #N
- Depends on completion of issue #123 (if applicable)
- Blocks issue #456 (if applicable)

---

## ✔️ Definition of Done

<!-- How to verify this task is complete -->

1. All acceptance criteria checkboxes are checked
2. Existing test suite passes (`npm test`)
3. New functionality has test coverage (if applicable)
4. Documentation updated to reflect changes
5. Changes committed and ready for merge

---

<!-- 
🎓 See .squad/guides/writing-copilot-issues.md for tips on writing effective @copilot issues.
Remember: @copilot reads the entire repo. Specify WHAT to achieve (acceptance criteria), not HOW to implement.
-->
