# Writing @copilot-Ready Issues

Guide for creating well-defined issues that @copilot can execute autonomously.

---

## Core Principle

**@copilot reads the entire repo.** Your job is to specify **WHAT to achieve** (acceptance criteria), not **HOW to implement** (step-by-step instructions).

Trust @copilot to:
- Find relevant files and patterns
- Choose appropriate implementation approaches
- Follow existing conventions
- Write tests that match the codebase style

---

## The Template Sections

### 🎯 Objective (Required)
**One sentence.** What outcome does this achieve?

✅ **GOOD:**
- "Add validation script to detect misconfigured perpetual-motion workflows"
- "Create reusable workflow for automatic issue creation from roadmap items"

❌ **BAD:**
- "Do some stuff with workflows" *(too vague)*
- "First create a function that parses the YAML, then validate each key..." *(implementation steps, not objective)*

---

### ✅ Acceptance Criteria (Required)
**Testable checkboxes.** Define success conditions, not implementation steps.

✅ **GOOD:**
```markdown
- [ ] Script reports missing perpetual-motion.yml files with clear error messages
- [ ] Validation covers both workflow trigger and roadmap parsing logic
- [ ] All existing tests continue to pass
```

❌ **BAD:**
```markdown
- [ ] Create a function called validateWorkflow()
- [ ] Use fs.readFileSync() to read the file
- [ ] Loop through each line and check for syntax
```
**Why bad?** These are implementation instructions, not outcomes. @copilot will choose the best approach.

**Key Distinction:**
- **Acceptance Criteria:** "Script detects when roadmap.md has 0 unchecked items"
- **Implementation Instruction:** "Parse the file with regex `\[ \]` and count matches"

Let @copilot decide whether to use regex, AST parsing, or another approach.

---

### 📁 Files Involved (Required)
**Specific paths.** Tell @copilot where to focus.

✅ **GOOD:**
```markdown
**Files to modify:**
- `scripts/validate-squad.js` — Add perpetual-motion validation logic

**Files to create:**
- `scripts/check-roadmap-status.js` — New utility for depletion detection

**Files to reference:**
- `.squad/skills/perpetual-motion/SKILL.md` — Follow patterns documented here
```

❌ **BAD:**
```markdown
- Some files in the scripts directory
- Maybe create a new file somewhere
```

**Tip:** If you don't know exact paths, use the explore agent or glob to find them first, then write the issue.

---

### 🔍 Context Hints (Optional but Recommended)
**Patterns, constraints, conventions.** Help @copilot understand the environment.

✅ **GOOD:**
```markdown
**Existing Patterns:**
- Validators follow pattern in `scripts/validate-squad.js` (see how upstream.json is validated)
- Tests use Vitest, located in `scripts/__tests__/*.test.js`

**Constraints:**
- Must work with Node.js (no Python/Go)
- Cost: €0 (GitHub free tier only)
- Must not break existing test suite
```

**Common Context to Include:**
- Testing framework and conventions
- Cost constraints (€0, Azure budget, etc.)
- Related roadmap items or dependencies
- Existing patterns to follow
- Technology stack restrictions

---

### ✔️ Definition of Done (Required)
**Verification checklist.** How do you confirm completion?

✅ **GOOD:**
```markdown
1. All acceptance criteria checked
2. `npm test` passes
3. New utility documented in `.squad/guides/`
4. Changes committed and ready for merge
```

Include steps like:
- Test suite execution
- Documentation updates
- Build verification
- Integration checks

---

## Converting Roadmap Items to Issues

Roadmap items in `roadmap.md` are structured for @copilot consumption. Use them as a starting point:

**Roadmap Item Example:**
```markdown
## 2. [ ] Create roadmap depletion detection utility

**Acceptance Criteria:**
- Utility function reads roadmap.md and counts unchecked items
- Returns true if roadmap has 0 unchecked items remaining
- Unit tests cover all scenarios

**Files:**
- `scripts/check-roadmap-status.js` (new utility)
- `scripts/__tests__/check-roadmap-status.test.js` (tests)

**Context:**
Enables perpetual-motion.yml to detect exhausted roadmaps.
```

**Becomes GitHub Issue:**
1. Copy **Objective** from roadmap item title
2. Copy **Acceptance Criteria** directly (already in checkbox format)
3. Copy **Files** to "Files Involved" section
4. Copy **Context** to "Context Hints" section
5. Add standard "Definition of Done" checklist

---

## Do's and Don'ts

### ✅ DO:
- **Write testable outcomes:** "Script returns exit code 0 when valid"
- **Specify file paths:** `scripts/validate.js`, not "the validation script"
- **Trust @copilot's judgment:** Let it choose implementation details
- **Include constraints:** Cost, dependencies, compatibility
- **Reference existing patterns:** "Follow format in file X"
- **Make it self-contained:** Issue readable without external context

### ❌ DON'T:
- **Write implementation steps:** "First do X, then Y, then Z"
- **Prescribe function names:** "Create function called validateThing()"
- **Specify algorithms:** "Use bubble sort to..." (unless there's a reason)
- **Be vague:** "Fix the thing", "Update some stuff"
- **Duplicate codebase knowledge:** @copilot already read the repo
- **Over-explain obvious patterns:** @copilot sees existing conventions

---

## Examples: Good vs Bad

### Example 1: Validation Script

❌ **BAD ISSUE:**
```markdown
## Create a validator

We need to validate workflows. Create a function that:
1. Opens each .github/workflows file
2. Checks if perpetual-motion.yml exists
3. Validates the YAML syntax
4. Checks for the triggers section
5. Makes sure it has issues.closed
6. Returns an error object with all problems

Use fs.readFileSync and yaml-parser library.
```

✅ **GOOD ISSUE:**
```markdown
## 🎯 Objective
Add validation to detect misconfigured perpetual-motion workflows across all repos.

## ✅ Acceptance Criteria
- [ ] Script identifies missing perpetual-motion.yml files in downstream repos
- [ ] Script verifies workflow has correct trigger: `on: issues: types: [closed]`
- [ ] Script reports actionable error messages for misconfigured workflows
- [ ] All existing tests continue to pass

## 📁 Files Involved
**Files to modify:**
- `scripts/validate-squad.js` — Add perpetual-motion validation

**Files to reference:**
- `.squad/skills/perpetual-motion/SKILL.md` — Documents expected workflow structure

## 🔍 Context Hints
- Existing validators in `scripts/validate-squad.js` follow pattern: load config → validate → report errors
- Perpetual motion is backbone of autonomy (see decisions.md event-driven architecture)
- Must work with Node.js standard library (no new dependencies)
```

**Why better?** Focuses on WHAT (detect problems, report errors) not HOW (which functions to call).

---

### Example 2: Documentation Update

❌ **BAD ISSUE:**
```markdown
## Update docs

Add a section to the README about the new validator. Put it after the installation section. Use markdown formatting. Include a code example showing how to run it.
```

✅ **GOOD ISSUE:**
```markdown
## 🎯 Objective
Document the perpetual-motion validator in README for downstream repo maintainers.

## ✅ Acceptance Criteria
- [ ] README.md includes new "Workflow Validation" section
- [ ] Section explains what the validator checks and why it matters
- [ ] Includes example command showing how to run validation
- [ ] Example output demonstrates both success and failure cases

## 📁 Files Involved
**Files to modify:**
- `README.md` — Add "Workflow Validation" section after "Installation"

**Files to reference:**
- `README.md` existing sections — Follow established tone and formatting

## 🔍 Context Hints
- README follows pattern: concept explanation → usage example → output sample
- Target audience: repo maintainers using perpetual-motion.yml
- Keep technical depth similar to existing "Squad Skills" section
```

**Why better?** Specifies outcomes (what information to include) without dictating exact wording or structure.

---

## @copilot Capability Profile

Not all tasks are @copilot-ready. Use this profile to assess feasibility:

### 🟢 Green (High Success Rate)
**@copilot excels at:**
- Adding new functions/modules following existing patterns
- Writing tests based on codebase conventions
- Creating documentation in established formats
- Implementing well-defined utilities with clear inputs/outputs
- Refactoring code while preserving behavior
- Updating configurations (package.json, tsconfig, etc.)

**Example tasks:**
- "Add validation function for perpetual-motion.yml"
- "Create unit tests for roadmap parser"
- "Document new workflow in .squad/guides/"

---

### 🟡 Yellow (Moderate Success — Needs Strong Context)
**@copilot can handle with good guidance:**
- Debugging issues with detailed error context
- Integrating third-party tools (with usage examples)
- Architectural changes (with clear constraints)
- Complex refactoring (with test coverage)
- Performance optimization (with metrics)

**Requirements for success:**
- Detailed acceptance criteria
- Error messages/stack traces (for debugging)
- Examples of desired patterns
- Clear constraints and boundaries

**Example tasks:**
- "Fix failing test in check-roadmap-status.test.js (see error output)"
- "Optimize validator performance (current: 5s per repo, target: <1s)"

---

### 🔴 Red (Low Success — Human Better)
**@copilot struggles with:**
- Ambiguous requirements ("make it better")
- Architectural decisions requiring trade-off analysis
- Tasks needing cross-repo coordination
- User research or stakeholder interviews
- Creative naming/branding decisions
- Security-critical code without clear specifications

**These need human judgment:**
- "Should we use polling or webhooks for monitoring?" *(trade-off decision)*
- "Design the architecture for Phase 3" *(requires strategic thinking)*
- "Fix this bug" *(without error message or repro steps)*

---

## Issue Template Workflow

1. **Start from roadmap:** Most issues originate from `roadmap.md` items
2. **Use the template:** `.github/ISSUE_TEMPLATE/copilot-ready.md`
3. **Fill all sections:** Don't skip Context Hints — it accelerates execution
4. **Test mentally:** Could someone unfamiliar with your mental model complete this?
5. **Assign to @copilot:** Add `copilot-ready` label, assign to @copilot
6. **Let it run:** Perpetual-motion.yml picks it up automatically

---

## Checklist: Is Your Issue @copilot-Ready?

Before creating the issue, verify:

- [ ] **Objective is one clear sentence** (not a paragraph)
- [ ] **Acceptance criteria are testable outcomes** (not implementation steps)
- [ ] **File paths are specific** (not "somewhere in the codebase")
- [ ] **Context includes constraints** (cost, tech stack, compatibility)
- [ ] **Definition of Done includes test verification**
- [ ] **Issue is self-contained** (no need to read 5 other documents)
- [ ] **Task is 🟢 or 🟡** (not 🔴 requiring human judgment)

---

## Questions?

- See live examples in this repo's closed issues tagged `copilot-ready`
- Reference `.squad/agents/morpheus/history.md` for project context
- Check `.squad/decisions.md` for architectural constraints
- Review `roadmap.md` for well-structured task definitions

---

**Remember:** @copilot is a senior developer who just joined your team. They read the entire codebase overnight. Tell them WHAT success looks like, not HOW to code.
