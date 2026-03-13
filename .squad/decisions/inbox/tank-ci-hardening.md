### 2026-03-16: CI Size Check — Per-Type Limits Enforced

**By:** Tank (Cloud Engineer)
**Tier:** T2
**What:** Updated `squad-size-check.yml` from generic 15KB limit to per-type limits matching `context-hygiene/SKILL.md`: history.md 8KB, decisions.md 12KB, charter.md 15KB, orchestration-log 2KB, log 1KB, any other 25KB. Proactive warnings at SKILL trigger thresholds (6KB/10KB/12KB/15KB). Total .squad/ 100KB limit preserved.
**Why:** P1-13 self-audit found CI was not enforcing the SKILL-defined limits. PRs could pass CI while violating context hygiene rules. Now CI is the automated enforcement gate per founder directive (SS must exemplify automated context management).
