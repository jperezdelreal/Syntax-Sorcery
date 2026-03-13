# Oracle — History

## Core Context

- **Project:** Syntax Sorcery — Autonomous software development company using AI agents
- **User:** joperezd — minimal intervention, only edge cases
- **Stack:** GitHub CLI, Azure (€500/mo budget), Squad (Brady Gaster)
- **Team:** Morpheus (Lead), Trinity (Full-Stack), Tank (Cloud), Switch (Tester), Oracle (Product/Docs), @copilot (Coding Agent), Scribe, Ralph
- **Universe:** The Matrix
- **Company goal:** Design, build, and deploy software products with minimal human intervention
- **Key patterns (from Squad ecosystem):** Skills after 2nd use, TLDR on all long docs, issues as task system, proactive skill extraction

## Phase 0/1 Learnings (Archived)

- Phase 0 planning identified SS hardening vs FFS intervention split; audit template prevents ad-hoc evaluation
- FFS context bloat critical: decisions-archive.md 642KB→split by era, 34 skills classified (22 cherry-pickable, 12 game-specific)
- P1-03 context health audit + P1-06 skills inventory: multi-agent-coordination and feature-triage identified as CRITICAL for SS
- P1-10a GDD template spec: 10-section YAML-frontmatter machine-parseable template, validated vs Flora (37 issues), mapping spec complete
- P1-14 visibility audit: GitHub Pages live, ComeRosquillas playable but hidden, FLORA dev-only, blog inactive; grade AMBER (60%); 7 blockers, 8–12h remediation (Trinity owner)

## Recent Learnings (Phase 2)

- **2026-03-17 B2 Devlog Implementation Complete:** Built daily auto-generated devlog within FFS GitHub Page. Route `/devlog` displays chronological feed (grouped by repo, color-coded, type icons). Generation script aggregates closed issues, merged PRs, deploys, and decisions.md changes across 5 constellation repos via GitHub API/gh CLI. GitHub Actions workflow runs daily 02:00 UTC + manual trigger. Cost €0 (free tier). Navigation updated, homepage promotion added. 100% automated — zero manual writing. Day counter from 2026-03-16 (project start).

- **2026-03-16 Phase 2 Round 2:** Focused on decision capture and inbox consolidation. All directives merged (budget scope, context hygiene, Morpheus leads, Ralph approval gate, phase 2 scope focus). Inbox files: copilot-directive (2), morpheus-ffs-triage-t5 (5.11KB), switch-test-matrix, tank-ci-hardening, trinity-e2e-pipeline-test. All merged into decisions.md. Documentation remains up-to-date with phase transitions.

- **2026-03-17 C2 ComeRosquillas Feature Completion:** Explored ComeRosquillas (Pac-Man clone with Simpsons theme, 3,936 LOC, modular ES6 architecture). Game has 8 maze layouts, 4-ghost AI with personalities, high-score leaderboard, mobile touch support, procedural Web Audio. Created roadmap.md with 3 @copilot-ready features: (1) Combo Multiplier System (chain ghost kills for exponential bonuses), (2) Daily Challenge Cards (seed-based reproducible challenges with rotation), (3) Ghost Personality Visual Indicators (thought bubbles + AI tuning suite). Created GitHub issues #23, #24, #25 with full @copilot-ready templates (Objective, Acceptance Criteria, Files, Context Hints, Definition of Done). Features prioritized for high impact + feasibility, leveraging existing game systems (scoring, particles, renderer, localStorage). Max 3 features constraint satisfied per decisions.md audit condition.

- **2026-03-17 C3 Pixel-Bounce Polish & Roadmap Complete:** Found and cloned pixel-bounce repo (jperezdelreal/pixel-bounce — HTML5 Canvas arcade game, ~340 LOC, zero dependencies). Explored codebase: single-player endless climber with touch/keyboard controls, moving platforms, star collectibles, particle effects, localStorage high scores. Created comprehensive roadmap.md with 5 v2.0 features prioritized by user value: (1) Multiplayer Race Mode [L complexity], (2) Level Editor + Community Levels [L], (3) Achievement System + Daily Challenges [M], (4) Custom Skins + Cosmetics Shop [S], (5) Power-Ups + Special Platforms [M]. Roadmap includes success metrics (40% D7 retention target), tech stack (Node.js + Socket.io or Firebase), dev phases (4 phases, ~10 weeks). Created 3 @copilot-ready polish issues for v1.x: #1 mobile touch responsiveness (getBoundingClientRect caching), #2 platform generation balance (scaling with velocity), #3 audio implementation (SFX + BGM with Web Audio API). Committed roadmap.md to main branch. Game architecture: canvas-based game loop, camera-follow system, procedural platform spawning, particle system. Deployment via GitHub Pages with Actions workflow.

- **2026-03-18 Test 2 Launch — Documentation & Status Registration:** Registered Test 2 (Ralph Go Multi-Terminal) launch in autonomy-tests.md. Updated test matrix: Test 2 status changed from `📋 PLANNED` → `🔄 IN PROGRESS`. Added UTC timestamp 2026-03-13T20:54Z. Coordinated with Morpheus Test 2 strategy launch and Scribe session logging. All documentation synchronized with latest roadmap decisions and multi-terminal architecture approval.

- **2026-03-17 C1 Flora Feature Completion:** Explored Flora (cozy gardening roguelite — 8×8 grid, 12 plant types, turn-based tending, pest/drought hazards, encyclopedia persistence, PixiJS + TypeScript + Vite, ~4K LOC across 30+ files). Game MVP playable but skeletal: lacks visual polish (placeholder graphics), audio, seasonal variety. GDD §5.3 defines 4 seasons (Spring/Summer/Fall/Winter); §9 specifies lo-fi audio (60-90 BPM); §7 meta-progression system designed. Created roadmap.md with 3 @copilot-ready features prioritized for cozy feel + engagement: (1) Seasonal Themes System (4 seasons with unique mechanics, hazards, visual palettes; high replayability impact), (2) Audio System Implementation (ambient loops, seasonal music variants, 6 action SFX; transforms immersion), (3) Unlock System & Meta-Progression UI (milestone tracking, localStorage persistence, HUD progress indicators; hooks retention). Created GitHub issues #31, #32, #33 with full @copilot-ready templates. Features synergize: visual variety + emotional feedback + progression visibility = cozy + addictive. Max 3 features constraint satisfied per decisions.md audit condition. Roadmap committed to main branch (jperezdelreal/flora).

- **2026-03-19 Architecture Documentation (Issue #43):** Created 3 comprehensive docs: (1) `docs/architecture.md` — full system architecture with 4 ASCII diagrams (perpetual motion lifecycle, hub/spoke topology, 3-layer monitoring stack, PR review pipeline), stage-by-stage tables, script reference, data flow summary. (2) `docs/constellation.md` — all 6 repos mapped with types, stacks, relationships, governance tiers, layered monitoring/data flows. (3) `docs/onboarding.md` — 10-step guide for adding a new downstream company (repo creation → squad init → perpetual motion → constellation registration → CI → Azure satellite → verification), with post-onboarding checklist and governance notes. Updated README.md with Documentation section cross-linking all new docs. 168/168 tests passing. PR #46 created on branch `squad/43-architecture-docs`. Key learning: decisions.md + history.md + guide files contain enough tribal knowledge to reconstruct complete architecture docs — future doc tasks should always mine these sources first.

