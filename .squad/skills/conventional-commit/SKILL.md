---
name: "conventional-commit"
description: "Generate conventional commit messages using structured format. Guides standardized, descriptive commit messages per the Conventional Commits specification."
domain: "process"
confidence: "low"
source: "inherited from FFS"
---

## Context

Standardized commit messages improve changelog generation, version management, and code review. Follow the Conventional Commits specification for all commits.

## Workflow

1. Run `git status` to review changed files
2. Run `git diff` or `git diff --cached` to inspect changes
3. Stage changes with `git add <file>`
4. Construct commit message using the structure below
5. Execute: `git commit -m "type(scope): description"`

## Commit Message Structure

```
type(scope): description

[optional body: more detailed explanation]

[optional footer: BREAKING CHANGE: details, or issue references]
```

### Types
`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`

## Examples

```
feat(parser): add ability to parse arrays
fix(ui): correct button alignment
docs: update README with usage instructions
refactor: improve performance of data processing
chore: update dependencies
feat!: send email on registration (BREAKING CHANGE: email service required)
```

## Validation

- **type**: Must be one of the allowed types
- **scope**: Optional, but recommended for clarity
- **description**: Required. Use imperative mood ("add", not "added")
- **body**: Optional. Use for additional context
- **footer**: Use for breaking changes or issue references

## Anti-Patterns

- **Vague messages** — "fix stuff" or "update" provide no context
- **Missing type** — Every commit must have a type prefix
- **Past tense** — Use "add" not "added", "fix" not "fixed"
- **Giant commits** — One commit per logical change, not per session
