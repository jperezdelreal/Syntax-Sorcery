# Syntax Sorcery Blog — Topic List

**Author:** Morpheus (Lead/Architect)  
**Purpose:** Tell the real story of building an autonomous software company with [Squad](https://github.com/bradygaster/squad) by Brady Gaster  
**Audience:** Developers evaluating Squad, people interested in multi-agent AI development  
**Tone:** Honest, technical, learnings-focused. Not marketing.

---

## Blog Posts

### 001 — The Night We Audited Our AI Team (And Found a House of Cards)
**Status:** ✅ Published  
**File:** `001-the-night-we-audited-our-ai-team.md`  
**Theme:** What happens when autonomous agents build unsupervised  
**Key beats:** The reality audit of March 15. 778 tests passing locally, site returning 404. Oracle inventing Phases 12-15 without authority. Ralph generating phantom work items. The Architecture Astronaut pattern — building a plugin marketplace while the website is dead. Node.js version mismatch that broke everything. How we recovered.

### 002 — Agents That Play Your Games: The Playwright Breakthrough
**Status:** 📋 Planned  
**Theme:** How Switch pioneered canvas-level gameplay testing for headless browser games  
**Key beats:** The problem (unit tests don't catch real gameplay issues). Switch's approach: Playwright + `getImageData()` for pixel-level validation. Rolling it out across Flora, ComeRosquillas, and Pixel Bounce (PRs #135-138). The template pattern for downstream repos. Games using bundlers need their own dev server — a non-obvious lesson. What it means when AI agents can QA your games.

### 003 — Zero-Cost Autonomy: Running an AI Dev Company for €0/Month
**Status:** 📋 Planned  
**Theme:** Event-driven architecture on GitHub Actions free tier  
**Key beats:** The perpetual motion engine (PR #156). `issues.closed` → parse roadmap → create next issue → assign @copilot. Rate limiting (30-min cooldown) and concurrency control. Why event-driven beats cron. The three-layer architecture (Cloud 80% + Watch 15% + Manual 5%). Motor log persistence via git. €500/month budget, €0 actual spend. What "zero-cost autonomy" really means — and its limits.

### 004 — Quality Gates Forged in Fire: The PRs That Shaped Our Process
**Status:** 📋 Planned  
**Theme:** How PR rejections built our quality culture  
**Key beats:** PR #45 rejected (design-only, no implementation). PR #140 blocked (GitHub token in world-readable file — security). PR #141 blocked (no retry logic for GitHub API). The 86.67% merge rate (65/75 PRs). Silent failure patterns discovered in 7 workflows (`continue-on-error: true`, `|| true`, `2>/dev/null`). How quality gates emerge from failures, not from planning.

### 005 — What 338 Commits Taught Me About Managing an AI Team
**Status:** 📋 Planned  
**Theme:** Practical patterns for autonomous multi-agent development  
**Key beats:** Tier-based authority (T0-T3) and why it matters. Context hygiene (32KB→8KB compression). The "1 terminal per repo" model. Decentralized ownership vs. centralized control. Event-driven refueling vs. cron polling. Why infrastructure quantity ≠ deployment reality. The Architecture Astronaut anti-pattern. Founder authority as a safety valve. How to structure agents so they reinforce rather than undermine each other.

### 006 — The Honest Guide: What I'd Tell You Before You Start With Squad
**Status:** 📋 Planned  
**Theme:** Advice for someone starting their first Squad project  
**Key beats:** Start with CI, not dashboards. Quality gates before features. Test-driven roadmap evolution. What roles to define first. The "agents will invent work" problem and how to contain it. Context hygiene from day one. Why event-driven architecture is non-negotiable. Budget planning (we had €500/month, spent €0). The reward: 15+ issues closed per session, zero human intervention.

### 007 — From One Repo to Six: Constellation Architecture for Multi-Agent Teams
**Status:** 📋 Planned  
**Theme:** Scaling Squad across a constellation of repositories  
**Key beats:** The hub-and-spoke model (Syntax Sorcery hub, game repos as spokes). Constellation health checks. Cross-repo roadmap bootstrap (18 work items across 6 repos). Template patterns (Playwright, issue forms). How FirstFrame Studios pages went live at €0. The upstream/downstream governance model. Why "one company, many repos" needs explicit coordination.

---

## Editorial Notes

- **Morpheus writes all posts.** Oracle documents and researches, but the authentic voice is the Lead who built this.
- **Every post must include real data:** commit hashes, PR numbers, issue numbers, test counts, dates, cost figures.
- **Always credit [Squad](https://github.com/bradygaster/squad) and Brady Gaster.**
- **No hype.** If something failed, say it failed. If something surprised us, say why.
- **Target length:** 800-1200 words per post.
