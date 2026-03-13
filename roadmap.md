# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## ~~1. [x] Configure CI checks and branch protection~~ ✅

Delivered in PR #32 (merged 2026-03-18). Issue #30 CLOSED.

---

## ~~2. [x] Add constellation-wide health monitoring~~ ✅

Delivered in PR #33 (merged 2026-03-18). Issue #31 CLOSED.

---

## ~~3. [x] Create ralph-watch.ps1 monitoring dashboard~~ ✅

Delivered in PR #34 (merged 2026-03-18). Issue #29 CLOSED.

---

## ~~4. [x] Issue dedup guard for perpetual motion~~ ✅

Delivered in PR #38 (merged 2026-03-19). Issue #36 CLOSED.

---

## ~~5. [x] Azure satellite launcher scripts~~ ✅

Delivered in PR #39 (merged 2026-03-19). Issue #35 CLOSED.

---

## ~~6. [x] Autonomous PR review gate~~ ✅

Delivered in PR #40 (merged 2026-03-19). Issue #37 CLOSED.

---

## 7. [ ] README premium overhaul — company-grade presentation

**Acceptance Criteria:**
- GitHub badges at top: CI status, test count (168+), license, Node version
- Accurate current status: Phase 3 complete, 6 repos in constellation, 168 tests, 6 PRs merged autonomously
- ASCII architecture diagram showing the perpetual motion engine cycle (issue → agent → PR → review gate → merge → roadmap depletion → refuel)
- Constellation overview: table of all 6 downstream repos with status, description, and links
- "How It Works" section: 3-step explanation of autonomous operation
- Quick start guide: clone → npm install → npm test → run constellation health check
- Professional tone, concise, scannable — befitting a company that builds autonomous software
- Remove outdated "Phase 0 complete / Phase 1 preparing" content

**Files:**
- `README.md` (rewrite)

**Context:**
The README is the most visible artifact of the entire company. Every visitor, contributor, and potential collaborator sees it first. Currently it says "Phase 0 complete, Phase 1 preparing" — 3 phases behind reality. The founder asked for marketing and aesthetics: this is marketing item #1. A premium README signals engineering maturity and autonomous capability.

---

## 8. [ ] Landing page visual upgrade — Matrix-themed premium design

**Acceptance Criteria:**
- Matrix-inspired CSS digital rain animation in hero background (pure CSS/JS, no dependencies)
- Animated typing effect for the company tagline
- "How It Works" section with 3-step visual flow: perpetual motion engine explained for visitors
- Constellation live status: build-time GitHub API data showing real repo stats (stars, last activity, open issues) instead of hardcoded placeholders
- Open Graph meta tags (og:title, og:description, og:image) for professional social media sharing
- Improved micro-interactions: hover effects on cards, smooth scroll, fade-in animations on scroll
- Mobile-optimized: all animations respect `prefers-reduced-motion`
- Footer with links to GitHub org, documentation, and constellation repos

**Files:**
- `site/src/pages/index.astro` (major update)
- `site/src/styles/global.css` (add animations)
- `site/src/components/MatrixRain.astro` (create — hero background effect)
- `site/src/components/TypeWriter.astro` (create — animated tagline)
- `site/src/components/HowItWorks.astro` (create — 3-step flow)
- `site/src/utils/data.ts` (update — add GitHub API constellation stats)
- `site/src/layouts/Layout.astro` (update — add OG meta tags)

**Context:**
The founder specifically requested "marketing y estética." The landing page is the public face of Syntax Sorcery — the first thing investors, collaborators, and the Squad community see. Current page is functional but static with hardcoded metrics. A Matrix-themed visual upgrade aligns with the team's universe, creates memorability, and demonstrates that autonomous AI can produce beautiful, not just functional, output. Mouse (UI/UX) is available for this task.

---

## 9. [ ] Architecture documentation with visual system diagrams

**Acceptance Criteria:**
- `docs/architecture.md`: Complete system architecture document covering 3-layer monitoring model, perpetual motion engine lifecycle, hub/spoke topology, and quality gate pipeline
- ASCII diagrams for: (1) perpetual motion cycle, (2) hub/spoke deployment (PC hub ↔ Azure VM satellites), (3) 3-layer monitoring stack, (4) PR review pipeline flow
- `docs/onboarding.md`: Step-by-step guide for adding a new downstream company to the constellation — from repo creation to perpetual-motion integration
- `docs/constellation.md`: Map of all repos, their relationships, data flows, and responsibilities
- Cross-linked from README and landing page
- Professional formatting: table of contents, numbered sections, consistent heading hierarchy
- All diagrams use ASCII art (no external image dependencies)

**Files:**
- `docs/architecture.md` (create)
- `docs/onboarding.md` (create)
- `docs/constellation.md` (create)
- `README.md` (add links to new docs)

**Context:**
Engineering maturity is visible through documentation quality. SS has sophisticated architecture (3-layer monitoring, perpetual motion, hub/spoke, review gates) but it's scattered across decisions.md, history files, and tribal knowledge. Consolidating into professional architecture docs transforms SS from "a repo with scripts" into "a documented autonomous system." Oracle (Product & Docs) is available for this task. This also enables future contributors and the Squad community to understand and adopt the patterns.
