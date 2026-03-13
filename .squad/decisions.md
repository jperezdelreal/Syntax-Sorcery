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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
