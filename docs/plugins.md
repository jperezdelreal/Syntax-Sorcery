# Plugin Development Guide

A Squad plugin is a self-contained skill that can be discovered, installed, and shared across projects. Plugins live in `.squad/skills/` and follow a standard structure.

## Plugin Structure

```
my-plugin/
├── SKILL.md          # Required — the skill definition
├── metadata.json     # Optional — version, author, tags for marketplace
├── scripts/          # Optional — automation scripts
├── references/       # Optional — reference materials
└── assets/           # Optional — static assets
```

### SKILL.md (Required)

The main file that teaches agents a pattern or convention. Uses YAML frontmatter for metadata:

```yaml
---
name: "my-plugin"
description: "What this plugin teaches agents"
domain: "testing"
confidence: "low"
source: "manual"
---
```

Key sections: **Context**, **Patterns**, **Examples**, **Anti-Patterns**.

### metadata.json (Optional)

Enables marketplace features — versioning, searchability, compatibility tracking:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name",
  "tags": ["testing", "patterns"],
  "domain": "testing",
  "compatibility": { "squad": ">=0.8.0" },
  "repository": "owner/repo"
}
```

## CLI Commands

Manage plugins via the Squad CLI:

```bash
# List installed plugins
npm run plugin -- list
npm run plugin -- list --json

# Get details about a plugin
npm run plugin -- info conventional-commit

# Scaffold a new plugin
npm run plugin -- create my-new-skill

# Search GitHub for plugins (topic: squad-plugin)
npm run plugin -- search "testing patterns"

# Install from GitHub
npm run plugin -- install owner/repo

# Install from local path
npm run plugin -- install ./path/to/plugin
```

## Creating a Plugin

### 1. Scaffold

```bash
npm run plugin -- create my-skill
```

This creates `.squad/skills/my-skill/` with template `SKILL.md` and `metadata.json`.

### 2. Edit SKILL.md

Follow the template structure. Key guidelines:
- **Description** in frontmatter is the primary trigger mechanism — be specific
- Keep under 500 lines / 15KB (context hygiene)
- Use imperative form ("Use X pattern" not "You should use X")
- Include real code examples
- Document anti-patterns to prevent common mistakes

### 3. Add metadata.json

Fill in version, author, tags, and domain for marketplace discoverability.

### 4. Test

Verify the skill works by using it in agent interactions. Check that:
- The skill triggers at the right time
- Examples are accurate and runnable
- Anti-patterns are genuine mistakes agents might make

## Publishing

To make your plugin discoverable on GitHub:

1. Create a GitHub repository with your plugin files at the root
2. Add the topic `squad-plugin` to the repository
3. Include a clear README.md describing the plugin
4. Others can install it with: `npm run plugin -- install owner/repo`

## Conventions

- **Naming:** Use lowercase with hyphens (e.g., `my-plugin-name`)
- **Size:** Keep SKILL.md under 15KB per context-hygiene requirements
- **Domain:** Use standard domains: `testing`, `process`, `api-design`, `error-handling`, `security`, `performance`
- **Confidence levels:** `low` (new/unverified), `medium` (tested in practice), `high` (battle-tested)
