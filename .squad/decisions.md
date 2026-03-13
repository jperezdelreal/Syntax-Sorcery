# Squad Decisions

## TLDR
Autonomous AI dev company (€500/mo Azure, minimal human intervention). Strict context hygiene (<100KB .squad/), GitHub Issues as work system. SS governs downstream companies (FFS first) via upstream/downstream model with gate-based readiness.

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

### 2026-03-13T10:12:00Z: Downstream Company Management Framework
**By:** Morpheus (Lead/Architect)
**Issue:** #3
**What:** Defined autonomous company management at `.squad/identity/downstream-management.md`: (1) upstream/downstream relationship model, (2) 5-step intervention protocol, (3) 5 health metrics, (4) upstream.json schema for inheritance/overrides.
**Why:** SS manages FFS and future companies safely. Codifies control boundaries and safety protocols for live autonomous systems.

### 2026-03-13T10:13:00Z: Phase 1 Decomposition — FFS Intervention (14 work items, 5 waves)
**By:** Morpheus (Lead/Architect)
**Tier:** T1
**Status:** PROPOSED
**Parent Issue:** #28 (Phase 1: FFS Takeover)
**What:** 14 work items across 5 waves (Wave 0–4). Critical path: Audit → Context Map → Remediation → Governance Swap → GDD Pipeline → Proposal→Prototype → Test → Self-Audit. 5 items copilot-friendly (🟢), 7 paired (🟡), 2 require human judgment (🔴). No Phase 1 blocker items—Gate 5 already cleared. Estimated 3–4 sprints.
**Artifacts:** Wave structure, parallel opportunities, @copilot fit analysis, risk mitigation in `.squad/decisions/inbox/morpheus-phase1-decomposition.md`
**Why:** Establishes clear work breakdown structure and critical path for Phase 1. Enables parallel work and risk mitigation. Identifies copilot capability ceiling (🔴 items: template trade-off decision + Proposal→Prototype architecture).

### 2026-03-13T10:14:00Z: User Directive — Full Autopilot Mode
**By:** joperezd (via Copilot)
**Tier:** T0
**What:** "Haz todo lo que consideres y en el orden que quieras, estoy en autopilot." Full autonomous execution authorized for Phase 1. Coordinator executes all waves without checking back. User reviews only edge cases.
**Why:** Reinforces foundational directive of minimal human intervention. Applies to entire Phase 1 execution.

### 2026-03-13T09:20:02Z: Full Autonomy for Tools, MCP, Skills, Installations
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** Team has total freedom to install tools, configure MCP servers, develop skills, create anything needed. No restrictions—software engineers, do what you need.
**Why:** Eliminate friction. Team doesn't need permission for dependencies or tooling.

### 2026-03-13T09:54:02Z: Founder is Non-Technical — Natural Language Only
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** Founder is non-technical engineer, doesn't code or use GitHub. Only natural language + general reasoning. SS takes all technical decisions autonomously. Founder participates only in T0 decisions (new projects, principles) in natural language. Never ask founder to execute commands, review code, or make technical decisions.
**Why:** Defines human-machine interface. SS operates without technical supervision.

### 2026-03-13T09:16:40Z: FFS Full Ownership Transfer on Takeover
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** When SS takes control of FFS (Gate 5 approved), FFS becomes SS property—end to end. "Don't touch" restriction applies ONLY while FFS runs autonomously without SS oversight. Once SS intervenes, it has full autonomy over all FFS repos.
**Why:** Clarifies ownership model. SS is not external consultant—it's the operational owner.

### 2026-03-13T10:07:17Z: FFS End-to-End Operational Control
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** SS has total FFS control end-to-end, including team decisions (agents, roles, composition). From Phase 1 onwards. Founder supports only if strictly necessary, doesn't manage.
**Why:** Clarifies ownership scope. SS is operational owner, not consultant.

### 2026-03-13T10:07:17Z: FFS Hard Requirements from Founder
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** Three non-negotiable requirements for FFS: (1) Keep GitHub Pages running, (2) Keep blog updated, (3) Games must be playable directly on GitHub Page. Everything else is SS decision.
**Why:** Only deliverables founder evaluates directly.

### 2026-03-13T10:07:17Z: Visibility & Showcase is Priority
**By:** joperezdelreal (via Copilot)
**Tier:** T0
**What:** Most important to founder: visibility of what happens—achievements, problems, progress. Show the world the team's autonomous work. Includes dashboards, updated blogs, GitHub Pages as showcase, visible metrics. This is marketing necessity, not vanity. Applies to both SS and FFS.
**Why:** Public showcase is proof that autonomy works. Without visibility, project has no external impact.

### 2026-03-13: SS Self-Audit Results
**By:** Switch (Tester/QA)
**Status:** BLOCKER
**What:** SS grades D (0.43/1.0). Critical gaps: #11 no README, #12 minimal .gitignore, #13 72.6KB template violates 25KB limit. Must remediate before credibly auditing FFS.
**Why:** Can't audit C-grade FFS while SS is D-grade. Fix house first.

### 2026-03-14: P1-04 FFS Context Remediation Complete
**By:** Trinity (Full-Stack Developer)
**Status:** COMPLETE
**Tier:** T2
**What:** FFS operational .squad/ reduced 2618KB → 126KB (95% reduction). decisions-archive.md (639KB) split into yearly archive files with TLDR quick-index tables. 30+ identity/analysis files compressed, all now <15KB. governance.md streamlined to 3.6KB (SS-aligned). 70 orchestration + 24 session logs archived; 5 most recent kept per tier. All operational files respect 15KB hard limit.
**Why:** Context bloat was primary bottleneck (27% of session tokens). Efficient archive structure enables downstream operations at FFS scale without context window penalties.
**Artifacts:** Draft PR jperezdelreal/FirstFrameStudios#197

### 2026-03-14: P1-05 Governance Swap Complete
**By:** Trinity (Full-Stack Developer)
**Status:** COMPLETE
**Tier:** T2
**What:** SS T0-T3 tier definitions installed in FFS decisions.md. Tier mapping: T0=Founder (new companies, principles), T1=Lead/Solo (architecture, gates, skills), T2=Agent (implementation), T3=Auto (logs, history, typos). upstream.json created linking FFS → Syntax Sorcery with inheritance of policy/skills/governance. TLDR added to decisions.md referencing upstream contract.
**Why:** FFS governance now aligned with SS. Clear authority/scope boundaries prevent autonomous decision conflicts. Upstream link enables efficient governance scaling to future downstream companies.
**Artifacts:** PR jperezdelreal/FirstFrameStudios#197

### 2026-03-14: P1-08 Ralph-Watch Hardened for Autonomous Operation
**By:** Tank (Cloud Engineer)
**Status:** COMPLETE
**Tier:** T2
**What:** Ralph-watch upgraded v4→v5 with six hardening measures for 24h unattended operation: (1) session timeout 30m (kills hung copilot), (2) exponential backoff 5m→60m (prevents retry storms), (3) stale lock detection 2h (handles crashes), (4) 3-file log rotation (preserves diagnostics), (5) pre-round health checks (graceful degradation), (6) hourly heartbeat with Discord + auto P0 GitHub issue on critical failures. Zero additional Azure cost (GitHub Actions free tier).
**Why:** Ralph is the autonomous execution engine. Silent failures stop entire squad. v4 had no session timeout (could hang forever), fixed retry intervals (wasteful on persistent failures), 4h heartbeat (too slow). v5 enables 24h unattended operation with early failure detection.
**Artifacts:** PR jperezdelreal/FirstFrameStudios#196, reusable SKILL at .squad/skills/ralph-hardening/SKILL.md

## Governance

| Tier | Authority | Scope | Examples |
|------|-----------|-------|----------|
| T0 | Founder only | New downstream companies, principles changes, critical `.squad/` structural changes | Adding FFS, changing autonomy model |
| T1 | Lead (Morpheus) | Architecture, quality gates, skills, ceremonies, routing | New agent roles, gate criteria, routing rules |
| T2 | Agent authority | Implementation details, test strategies, doc updates | Code patterns, test plans, README edits |
| T3 | Auto-approved | Scribe ops, history updates, log entries | Session logs, history.md appends, orchestration logs |
