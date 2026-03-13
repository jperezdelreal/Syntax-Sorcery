---
name: "what-context-needed"
description: "Ask what files are needed before answering a question — prevents blind answers"
domain: "process"
confidence: "low"
source: "inherited from FFS"
---

## Context

Before answering complex questions about a codebase, identify what files are needed for an accurate answer. This prevents hallucinated responses based on assumptions.

## Instructions

1. Based on the question, list the files you would need to examine
2. Explain why each file is relevant
3. Note any files already seen in the conversation
4. Identify uncertainties

## Output Format

```markdown
## Files I Need

### Must See (required for accurate answer)
- `path/to/file` — [why needed]

### Should See (helpful for complete answer)
- `path/to/file` — [why helpful]

### Already Have
- `path/to/file` — [from earlier in conversation]

### Uncertainties
- [What I'm not sure about without seeing the code]
```

## Anti-Patterns

- **Answering without context** — Guessing at implementation details
- **Requesting everything** — Only ask for files directly relevant to the question
- **Not explaining relevance** — Each file request should have a clear reason
