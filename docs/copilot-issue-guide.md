# Writing @Copilot-Ready Issues

## TLDR

@copilot reads your entire repository and executes tasks autonomously. **Write issues that specify WHAT to achieve (acceptance criteria), not HOW to implement.** @copilot determines implementation based on existing patterns in the codebase.

---

## Core Principle

> **Issues are task specifications, not tutorials.**
>
> @copilot is a code-reading agent that understands your repository's patterns, conventions, and architecture. Your job is to define the desired outcome with precision. @copilot's job is to figure out the best implementation path by reading your code.

---

## Three Template Types

### 1. Feature Request (`copilot-feature.yml`)
Use for new functionality that needs to be implemented.

**When to use:**
- Adding new endpoints, functions, or modules
- Implementing user-facing features
- Building integrations or connectors

**Key sections:**
- **Objective**: One-sentence goal
- **Acceptance Criteria**: 3-5 testable outcomes (NOT implementation steps)
- **Files Involved**: Which files to create/modify, with file paths
- **Scope Boundaries**: What's in/out of scope
- **Context Hints**: Patterns, constraints, and conventions to follow

**Example:**
```markdown
## 🎯 Objective
Add user authentication via JWT tokens to enable secure API access

## ✅ Acceptance Criteria
- [ ] JWT token generation endpoint created at `/auth/token` accepting username/password
- [ ] Protected endpoints validate JWT tokens before processing requests
- [ ] Expired tokens return 401 Unauthorized status
- [ ] Tokens include 1-hour default expiration
- [ ] All existing tests pass

## 📁 Files Involved
**Files to create:**
- `src/auth/jwt-handler.ts` — JWT generation and validation
- `src/routes/auth.ts` — Authentication endpoints

**Files to modify:**
- `src/middleware.ts` — Add JWT validation middleware
- `src/server.ts` — Register auth routes

**Files to reference (patterns):**
- `src/utils/validation.ts` — Follow existing validation pattern
```

---

### 2. Bug Fix (`copilot-bugfix.yml`)
Use for fixing broken functionality.

**When to use:**
- Bugs causing test failures or runtime errors
- Logic errors or unexpected behavior
- Performance or reliability issues

**Key sections:**
- **Objective**: One-sentence bug statement
- **Description**: What is broken? Observable error behavior?
- **Acceptance Criteria**: Verifiable conditions proving the bug is fixed
- **Files Involved**: Files likely containing the bug or that will be modified
- **Context Hints**: Error logs, stack traces, and patterns to follow

**Example:**
```markdown
## 🎯 Objective
Fix race condition in database connection pool causing intermittent 503 errors

## ✅ Acceptance Criteria
- [ ] Concurrent requests no longer produce undefined connection errors
- [ ] Load test (1000 concurrent requests) completes without errors
- [ ] New test case reproduces original bug and passes after fix
- [ ] All 100+ existing tests continue to pass

## 📁 Files Involved
**Likely root cause:**
- `src/db/connection-pool.ts` — Connection allocation logic (lines 45-67)

**Files to modify:**
- `src/db/connection-pool.ts` — Fix allocation logic, add synchronization
- `src/__tests__/db.test.ts` — Add concurrent request test case
```

---

### 3. Test Addition (`copilot-test.yml`)
Use for adding test coverage to existing functionality.

**When to use:**
- Code with zero or low test coverage (<80%)
- Critical paths that need regression tests
- New edge cases that should be validated

**Key sections:**
- **Objective**: What code needs testing?
- **Description**: Why is test coverage needed? What gap exists?
- **Acceptance Criteria**: Specific test cases and coverage metrics
- **Code to Test**: Files and functions requiring tests
- **Context Hints**: Testing patterns and mocking strategies in the repo

**Example:**
```markdown
## 🎯 Objective
Add comprehensive test coverage for JWT token validation middleware

## ✅ Acceptance Criteria
- [ ] Test valid JWT token acceptance and pass-through
- [ ] Test expired token rejection (401 status)
- [ ] Test malformed token rejection
- [ ] Test missing Authorization header rejection
- [ ] Coverage increases from 0% to >90% for auth.ts
- [ ] All existing tests pass

## 📁 Code to Test
**Primary Code:**
- `src/middleware/auth.ts` — JWT validation middleware

**Test File Location:**
- Create: `src/__tests__/middleware/auth.test.ts`
```

---

## Golden Rules

### ✅ DO

1. **Specify the outcome, not the path**
   - ✅ GOOD: "API endpoint returns paginated results with page number and size parameters"
   - ❌ BAD: "Add pagination to the API by modifying lines 45-67 in handlers.ts to use offset/limit"

2. **List every acceptance criterion as a checkbox**
   - @copilot knows work is done when ALL checkboxes are checked
   - Each criterion should be independently verifiable

3. **Provide file paths**
   - ✅ GOOD: "`src/auth/jwt-handler.ts` — JWT token logic"
   - ❌ BAD: "Handle JWT tokens somewhere in the codebase"

4. **Include file references for patterns**
   - Show @copilot which existing code to learn from
   - "Follow the pattern in `src/cache/request-queue.ts`"

5. **Define scope boundaries explicitly**
   - State what IS in scope
   - State what is NOT in scope (defer to future issues)
   - Prevents scope creep

6. **Mention constraints and conventions**
   - Node version requirements, dependency restrictions
   - Cost limits (€0 for free-tier-only work)
   - Breaking changes vs. backwards compatibility
   - Naming conventions, code style, testing framework

7. **Add test expectations**
   - How should @copilot verify success?
   - "Run `npm test` — all tests should pass"
   - "Check coverage report — target >90%"

### ❌ DON'T

1. **Don't specify HOW to implement**
   - ❌ BAD: "Use a mutex to synchronize access"
   - ✅ GOOD: "Concurrent requests must not cause race conditions"
   - @copilot will find the right synchronization mechanism

2. **Don't debate architecture in the issue**
   - ❌ BAD: "Should we use a cache layer or optimize the query?"
   - ✅ GOOD: "Endpoint response time should be <100ms"
   - Save architecture discussions for decision documents

3. **Don't leave scope ambiguous**
   - ❌ BAD: "Fix all database issues"
   - ✅ GOOD: "Fix race condition in connection pool allocation. Performance optimization deferred to issue #888."

4. **Don't assume @copilot knows context**
   - Include error messages, stack traces, and logs
   - Explain why the task matters
   - Link to related issues

5. **Don't create vague "clean up" tasks**
   - ❌ BAD: "Improve code quality in src/api/"
   - ✅ GOOD: "Add test coverage to src/api/handlers.ts (currently 0%, target >90%)"

6. **Don't mix unrelated work**
   - ❌ BAD: "Add JWT auth AND implement refresh tokens AND add rate limiting"
   - ✅ GOOD: Create separate issues, use issue dependencies to order work

---

## Structure Template

Use this template when creating issues:

```markdown
## 🎯 Objective
[ONE SENTENCE — Clear outcome]

## 📝 Description
[WHY is this needed? What problem does it solve? 2-3 sentences max]

## ✅ Acceptance Criteria
- [ ] Verifiable outcome #1
- [ ] Verifiable outcome #2
- [ ] Verifiable outcome #3
- [ ] All existing tests pass

## 📁 Files Involved
**Files to create:**
- `path/to/new-file.ts` — Brief description

**Files to modify:**
- `path/to/existing-file.ts` — What changes

**Files to reference:**
- `path/to/pattern-file.ts` — Existing pattern to follow

## 🔍 Scope Boundaries
**In Scope:**
- Specific feature/fix

**Out of Scope:**
- What's deferred
- Future enhancements

## 💡 Context Hints
**Patterns:**
- Reference from codebase

**Constraints:**
- Dependencies, cost, version requirements

**Related Issues:**
- Issue dependencies, blocking issues
```

---

## Common Mistakes & Fixes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| "Add error handling" | "Add try-catch blocks to API endpoints; return 500 with error message; all existing tests pass" |
| "Improve performance" | "Reduce endpoint latency from 500ms to <100ms p99; use caching for X" |
| "Better code organization" | "Move utility functions from `server.ts` to `src/utils/helpers.ts` following pattern in `src/utils/validation.ts`" |
| "Fix the database" | "Fix race condition in connection pool; concurrent requests no longer return undefined connections" |
| "Add validation" | "Validate email format in signup endpoint; reject with 400 Bad Request if format invalid; add tests" |

---

## Labels & Assignees

All @copilot issues should have:

- **Labels**: `squad:copilot`, `copilot-ready` (auto-applied by template)
- **Additional labels** (suggested):
  - `enhancement` — For features
  - `bug` — For bug fixes
  - `testing` — For test additions
- **Assignee**: Leave unassigned (or assign to @copilot if GitHub org configured)

---

## For Cross-Repo Use

These templates are designed to be **copy-paste deployable** to satellite repositories:

1. Copy `.github/ISSUE_TEMPLATE/copilot-*.yml` to satellite repo
2. Update `Files Involved` paths to match satellite repo structure
3. Update `Context Hints` to reference satellite repo patterns
4. No changes needed to template structure — it's universal

**Satellite Repos Using These Templates:**
- Flora
- ComeRosquillas
- Pixel-Bounce

---

## Examples from Production

### Example 1: Feature Request ✅ (Well-written)
```yaml
Objective: Add WebSocket support to enable real-time game updates

Acceptance Criteria:
- [ ] WebSocket connection handler accepts connections at /ws
- [ ] Client receives game state updates within 100ms of server-side changes
- [ ] Disconnected clients are cleaned up after 30 seconds inactivity
- [ ] All existing HTTP tests continue to pass

Files Involved:
- Create: src/websocket/handler.ts (connection, message routing, cleanup)
- Create: src/__tests__/websocket.test.ts
- Modify: src/server.ts (register WebSocket handler)
```

### Example 2: Bug Fix ✅ (Well-written)
```yaml
Objective: Fix null pointer exception in user profile endpoint

Description: 
Endpoint /api/users/:id crashes with NullPointerException when user_role is null in database.
Observed in production logs: 5-10 times per hour during peak traffic.

Acceptance Criteria:
- [ ] Endpoint handles null user_role gracefully (returns 404 or empty role)
- [ ] New test case covers null role scenario
- [ ] All 120+ existing tests pass
- [ ] Production error rate for this endpoint drops to 0%
```

### Example 3: Test Addition ✅ (Well-written)
```yaml
Objective: Add test coverage for authentication middleware

Code to Test:
- src/middleware/auth.ts (validateToken, authRequired)

Acceptance Criteria:
- [ ] Test valid token acceptance
- [ ] Test expired token rejection (401)
- [ ] Test missing Authorization header (401)
- [ ] Coverage: 0% → >90%
- [ ] All tests pass
```

---

## FAQ

**Q: What if I don't know which files will be modified?**
A: That's OK! Write "Files likely involved" with your best guess. @copilot will find the right files by reading the codebase.

**Q: Can I ask for implementation advice in the issue?**
A: No. Save debates for the PR review. The issue is a specification, not a discussion.

**Q: What if the work spans multiple features?**
A: Create separate issues. Use GitHub issue dependencies (e.g., "blocks #456") to order work.

**Q: How detailed should acceptance criteria be?**
A: Detailed enough that @copilot can verify completion without guessing. Each criterion should be independently checkable.

**Q: Can I link to external resources?**
A: Yes, but prefer linking to patterns in your own codebase. External links may break or change.

---

## Success Metrics

A well-written @copilot issue typically:

- ✅ Can be completed in 1-4 hours of autonomous work
- ✅ Has 3-5 testable acceptance criteria
- ✅ Specifies files to modify with paths
- ✅ Includes existing code patterns to follow
- ✅ @copilot opens a PR without asking clarifying questions

---

## Need Help?

See the templates in `.github/ISSUE_TEMPLATE/`:
- `copilot-feature.yml` — For new functionality
- `copilot-bugfix.yml` — For bug fixes
- `copilot-test.yml` — For test coverage
- `copilot-ready.md` — Legacy markdown template (reference only)

**Questions?** Open an issue with the `question` label or ask in team sync.

---

**Last Updated:** 2026-03-22  
**Author:** Oracle (Product & Docs)
