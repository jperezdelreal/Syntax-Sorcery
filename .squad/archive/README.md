# Squad Archive

Archived `.squad/` content lives here. Old decisions, summarized history, and pruned logs.

**Agents do NOT read archive files.** This directory is for human reference only.

Files are moved here by Scribe during summarization/archival per `skills/context-hygiene/SKILL.md`.

## Templates Note

`.squad/templates/` contains **framework-provided scaffolding** from the Squad ecosystem (Brady Gaster).
These are reference files, not Syntax Sorcery content. The CI size check (`squad-size-check.yml`)
excludes `templates/` from enforcement. Large templates (e.g. `squad.agent.TEMPLATE.md` at ~73KB)
live in `templates/_reference/` to keep them clearly separated from active templates.
