---
name: "skill-creator"
description: "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy."
domain: "process"
confidence: "low"
source: "inherited from FFS"
---

## Context

Use this skill when creating a new skill from scratch, improving an existing skill, running evaluations to benchmark skill quality, or optimizing a skill's description for better triggering. The core loop is: understand intent → draft skill → test with evals → review → iterate.

## Core Patterns

### 1. Capture Intent
- Understand what the skill should do, when it should trigger, and expected output format
- If the conversation already contains a workflow, extract answers from history first
- Ask: What should it do? When should it trigger? What's the output format? Should we set up test cases?

### 2. Interview and Research
- Ask about edge cases, input/output formats, example files, success criteria, dependencies
- Check available tools for research; come prepared to reduce burden on the user

### 3. Write the SKILL.md
- **Frontmatter**: `name` + `description` (description is the primary trigger mechanism — make it slightly "pushy" to combat undertriggering)
- **Body**: Keep under 500 lines; use progressive disclosure (SKILL.md → reference files → scripts)
- **Style**: Use imperative form, explain the *why* behind instructions, avoid heavy-handed MUSTs
- **Structure**: `skill-name/` with `SKILL.md` (required), plus optional `scripts/`, `references/`, `assets/`
- **Size**: Must stay under 15KB per context-hygiene skill

### 4. Test and Evaluate
- Write 2-3 realistic test prompts; confirm with user
- Run with-skill AND baseline tests in parallel
- Grade results quantitatively
- Present results for qualitative review

### 5. Iterate
- Read feedback; generalize improvements (don't overfit to test cases)
- Keep the skill lean — remove what isn't pulling its weight
- Look for repeated work across test runs → bundle into `scripts/`
- Repeat until feedback is all empty

## Key Examples

**Skill directory layout:**
```
skill-name/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

## Anti-Patterns

- **Don't overfit** — Skills will be used across many prompts; avoid fiddly changes that only fix specific test cases
- **Don't use rigid ALWAYS/NEVER rules** — Explain reasoning instead so the model understands *why*
- **Don't forget baselines** — Always run without-skill baseline alongside with-skill runs for comparison
- **Don't skip size checks** — Skills must stay under 15KB (context-hygiene requirement)
