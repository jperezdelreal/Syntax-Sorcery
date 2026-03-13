# Squad Decisions

## Active Decisions

### 2026-03-13: Foundational Directive — Minimal Human Intervention
**By:** joperezd (via Coordinator)
**What:** La intervención humana será mínima tendiendo a nula, salvo edge cases. El equipo debe operar de forma autónoma: diseñar, construir, testear y desplegar sin esperar aprobación humana excepto para decisiones críticas de seguridad o arquitectura que afecten significativamente al producto.
**Why:** Principio fundacional de Syntax Sorcery — empresa autónoma de desarrollo de software.

### 2026-03-13: Azure Budget Hard Limit — €500/month
**By:** joperezd (via Coordinator)
**What:** El presupuesto máximo de Azure es €500/mes. Tank debe monitorear costes y alertar al 80% (€400). Todas las decisiones de infraestructura deben considerar el coste como factor prioritario.
**Why:** Constraint operativo de la empresa.

### 2026-03-13: Squad Knowledge — Brady Gaster & Tamir Dresher patterns
**By:** joperezd (via Coordinator)
**What:** El equipo debe conocer y aplicar los patrones del ecosistema Squad: skills system (low→medium→high confidence), Ralph loop para operación autónoma, GitHub Issues como sistema de tareas, TLDRs en documentos largos, proactive skill extraction, commits referenciando issues, conventional commits.
**Why:** Maximizar el potencial de Squad basándose en las mejores prácticas de Brady (creator) y Tamir (power user).

### 2026-03-13T08:27:55Z: FFS Evaluation — Partial Adoption
**By:** Morpheus + Oracle (Coordinator)
**What:** FirstFrameStudios (jperezdelreal/FirstFrameStudios) evaluated for adoption by Syntax Sorcery. Verdict: PARTIAL — cherry-pick governance (T0-T3 tiers, P0-P3 priorities), ceremonies (sprint planning, closeout), 13+ domain-agnostic skills, autonomy model (Zone A/B/C), quality gates framework, and ralph-watch core loop. Leave behind game-specific skills (19), Star Wars theming, 642KB decisions archive, and speculative docs (56KB growth-framework).
**Why:** FFS is a mature Squad setup (~21 weeks of learnings) but domain-specific to game dev. ~75% reusable infrastructure, ~25% game baggage we don't need.

### 2026-03-13T08:41:34Z: Strategic Vision — Syntax Sorcery as FFS's AI backbone
**By:** joperezdelreal (Copilot directive)
**What:** Syntax Sorcery as software AI enterprise managing FirstFrameStudios and future autonomous projects. FFS should operate as autonomous gaming AI company without human intervention—founder's minimal intervention transitions to Syntax Sorcery oversight. Vision: wake up to new games self-created. Leverage Syntax Sorcery expertise rather than FFS ideas alone.
**Why:** Directiva fundacional—defines Syntax Sorcery ↔ FFS relationship and long-term operational model.

### 2026-03-13T08:48:46Z: Context Window Hygiene is Critical Engineering Requirement
**By:** joperezdelreal (Copilot directive)
**What:** FFS proved unconstrained `.squad/` files cause massive context windows and slow performance. Syntax Sorcery MUST prevent this via strict size limits, aggressive summarization, proactive archival. Non-negotiable engineering requirement.
**Why:** Lesson from first project—agent system quality directly depends on lean file architecture.

### 2026-03-13T08:41:34Z: FFS is Live — Safety Protocol Required
**By:** joperezdelreal (Copilot directive)
**What:** FirstFrameStudios running autonomously now. Before touching any FFS repos (FirstFrameStudios, ComeRosquillas, Flora, ffs-squad-monitor): WARN founder to pause execution. No FFS repo modifications without explicit authorization. Syntax Sorcery must mature first (team readiness, approach definition).
**Why:** Operational safety—FFS in autonomous production. Uncoordinated changes break pipeline.

### 2026-03-13: Phase 0 Strategy — Architectural Decisions
**By:** Morpheus (Lead/Architect)
**Status:** PROPOSED
**Issues:** #1 (epic), #2–#5 sub-issues
**What:** Five core decisions:
1. **Context Hygiene as Engineering Constraint:** hard limits (history ≤8KB, decisions ≤15KB, .squad/* ≤15KB). Auto-archive at 80%.
2. **Upstream/Downstream Model** (Tamir Dresher pattern): SS is backbone; downstream (FFS, others) own domain. 4-step intervention: Observe → Recommend → Intervene → Embed.
3. **Audit-First to FFS:** Structured checklist (context health, architecture, squad setup, governance, autonomy gaps). Reusable template.
4. **Gate-Based Readiness:** Five gates before FFS touchpoint: context hygiene, autonomous operation, management framework, skills readiness, founder sign-off.
5. **Issues as Work System:** GitHub Issues canonical (Epic #1 + focused sub-issues). No 56KB planning docs.
**Why:** Learned from FFS 21-week cycle. Brady Gaster/Tamir Dresher patterns + cherry-picked ~75% FFS infrastructure.

### 2026-03-13T09:51:00Z: Context Hygiene is Hard Gate for Merges
**By:** Switch (Tester/QA)
**What:** All `.squad/` files must respect limits (skills/context-hygiene/SKILL.md). Violations block merges. Scribe enforces on every run; Switch audits periodically.
**Why:** Prevent FFS-style bloat. Proactive limits replace reactive cleanup—#1 engineering lesson from founder's first project.

### 2026-03-13: Brady Gaster & Tamir Dresher Repos as Permanent Reference
**By:** joperezdelreal (Copilot directive)
**What:** Brady Gaster (github.com/bradygaster/squad) and Tamir Dresher (github.com/tamirdresher/squad-personal-demo, tamirdresher.com/blog) are permanent reference sources. Weekly releases. Consult before Squad architecture decisions.
**Why:** Source of truth for Squad best practices. Ecosystem evolves weekly.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
