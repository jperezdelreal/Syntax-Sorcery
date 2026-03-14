# Contributing to Syntax Sorcery

Thank you for your interest in contributing to Syntax Sorcery! This guide will help you get started.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Request Workflow](#pull-request-workflow)
- [Code Style](#code-style)
- [Commit Format](#commit-format)
- [Squad Architecture Overview](#squad-architecture-overview)
- [Getting Help](#getting-help)

---

## How It Works

Syntax Sorcery is an autonomous software development company powered by AI agents. Work flows through a **perpetual motion engine** — a self-sustaining cycle where roadmap items become GitHub issues, agents build solutions, PRs pass review gates, and completed work refuels the roadmap.

Human contributors are welcome to participate alongside our AI agents. Your contributions go through the same quality gates: linked issues, CI checks, and code review.

---

## Reporting Bugs

1. **Search existing issues** — check if the bug has already been reported.
2. **Use the bug report template** — file a new issue using the [Bug Report](https://github.com/jperezdelreal/Syntax-Sorcery/issues/new?template=bug_report.yml) template.
3. **Include reproduction steps** — provide clear, minimal steps to reproduce the issue.
4. **Attach context** — include error messages, screenshots, or logs where relevant.

---

## Suggesting Features

1. **Check the roadmap** — review `roadmap.md` to see if the feature is already planned.
2. **Use the feature request template** — file a new issue using the [Feature Request](https://github.com/jperezdelreal/Syntax-Sorcery/issues/new?template=feature_request.yml) template.
3. **Describe the problem** — explain what problem the feature solves, not just the solution.

---

## Pull Request Workflow

1. **Fork the repository** and create a branch from `master`.
2. **Link an issue** — every PR must reference an existing issue (e.g., `Closes #123`).
3. **Write tests** — new functionality requires tests. We use [Vitest](https://vitest.dev/).
4. **Run the test suite** before submitting:
   ```bash
   npm install
   npm test
   ```
5. **Open a pull request** using the PR template. Fill in all checklist items.
6. **Wait for review** — PRs pass through our review gate which validates linked issues, CI status, and acceptance criteria.

### PR Requirements

- [ ] Description explains what and why
- [ ] Linked to an open issue
- [ ] Tests added or updated
- [ ] All existing tests pass
- [ ] Acceptance criteria from the issue are met
- [ ] No breaking changes (or clearly documented)

---

## Code Style

Syntax Sorcery follows these conventions:

### JavaScript

- **Module system:** CommonJS (`require` / `module.exports`)
- **Test framework:** [Vitest](https://vitest.dev/)
- **Dependency injection pattern:** All scripts use DI for testability. Functions accept their dependencies as parameters rather than importing them directly.

#### DI Pattern Example

```javascript
// ✅ Good — dependencies injected
function createReviewGate({ octokit, core } = {}) {
  return {
    async validatePR(prNumber) {
      const pr = await octokit.pulls.get({ pull_number: prNumber });
      return pr.data;
    },
  };
}

module.exports = { createReviewGate };
```

```javascript
// ❌ Avoid — hardcoded dependencies
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit();

function validatePR(prNumber) {
  return octokit.pulls.get({ pull_number: prNumber });
}
```

### General

- Use descriptive variable and function names
- Keep functions focused and small
- Comment only when the code needs clarification — avoid obvious comments

---

## Commit Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]

[optional footer]
```

### Types

| Type | Use For |
|------|---------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `ci` | CI/CD changes |
| `refactor` | Code refactoring (no behavior change) |
| `chore` | Maintenance tasks |

### Examples

```
feat: add constellation health endpoint

docs: update architecture diagram for Phase 5

fix: prevent duplicate issue creation in dedup guard

Closes #42
```

---

## Squad Architecture Overview

Syntax Sorcery is built on [Squad](https://github.com/bradygaster/squad) by Brady Gaster — an AI agent orchestration framework.

### The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| **Morpheus** | Lead / Architect | Architecture decisions, PR reviews, quality gates |
| **Trinity** | Full-Stack Developer | Pipeline scripts, core tooling, feature development |
| **Tank** | Cloud Engineer | Azure infrastructure, deployment, cost optimization |
| **Switch** | Tester / QA | Test suites, CI, review gate validation |
| **Oracle** | Product & Docs | Documentation, product strategy, research |
| **@copilot** | Coding Agent | Code generation from issues |
| **Scribe** | Session Logger | Context hygiene, log rotation |
| **Ralph** | Work Monitor | Perpetual motion engine, roadmap automation |

### Perpetual Motion Engine

The system runs autonomously through a continuous cycle:

```
Roadmap → Issue → Agent builds → PR → Review gate → Merge → Roadmap refuels
```

Ralph monitors the roadmap for pending items, creates issues, and assigns agents. The review gate validates that PRs meet quality standards (linked issue, CI passing, acceptance criteria). When the roadmap depletes, leads define the next phase — and the cycle continues.

### Key Concepts

- **Hub/spoke topology:** Syntax Sorcery (hub) governs downstream repos (spokes) like game studios and individual games.
- **Constellation:** The collection of 6 repositories managed by the hub.
- **Review gate:** Automated PR validation that checks linked issues, CI status, and file changes.
- **Dedup guard:** Prevents duplicate issue creation when the perpetual motion engine runs.

For deep dives, see:
- [Architecture](docs/architecture.md)
- [Constellation Map](docs/constellation.md)
- [Onboarding Guide](docs/onboarding.md)

---

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/jperezdelreal/Syntax-Sorcery/discussions)
- **Found a bug?** Use the [Bug Report](https://github.com/jperezdelreal/Syntax-Sorcery/issues/new?template=bug_report.yml) template
- **Have an idea?** Use the [Feature Request](https://github.com/jperezdelreal/Syntax-Sorcery/issues/new?template=feature_request.yml) template

---

*Thank you for helping make Syntax Sorcery better!*
