# PRD: FFS Autonomy — Syntax Sorcery Phase 0-1

## TLDR
FirstFrameStudios (FFS) runs semi-autonomously today but needs engineering discipline to become fully autonomous. Syntax Sorcery will mature internally (Phase 0), then intervene surgically in FFS governance, skills, and monitoring loops (Phase 1) — without breaking the live pipeline.

## Problem

**Current state:** FFS operates with manual game creation. Issues are filed manually, GDDs are written manually, quality gates exist but require oversight.

**What's missing:**
- No autonomy signal: founder must decide when to greenlight new games
- Ralph-watch (24h monitoring loop) is prototype; not hardened for production
- Skills are domain-heavy (19 game-specific) mixed with reusable (13 domain-agnostic)
- Decisions archive is bloated (642KB) — kills context efficiency
- No clear handoff between proposal → playable prototype

**Impact:** Founder can't "wake up and see new games created." Games are greenlit but not autonomously spun up.

## Success Criteria

- ✅ **GDD→Issue autonomy**: FFS generates game design issues from PRDs autonomously (zero human input)
- ✅ **Ralph durability**: ralph-watch runs 24h without failure or human intervention
- ✅ **Context hygiene**: No .squad/ file exceeds 15KB; decisions archive < 100KB
- ✅ **Proposal→Prototype**: New game from text proposal → playable prototype (Git repo + working build) autonomously
- ✅ **Founder velocity**: Founder reviews ≤2 decisions/week (was ~5/week)
- ✅ **Infrastructure reuse**: 13 domain-agnostic skills cleanly separated from game logic

## Scope

### Phase 0: Syntax Sorcery Maturation (Weeks 1-3)
In scope:
- Extract 13 reusable skills from FFS playbook
- Build skill-confidence system (low→medium→high)
- Define governance tiers (T0-T3) and priorities (P0-P3)
- Harden ralph-watch + cost alerting
- Enforce decision hygiene (< 15KB per file)

Out of scope:
- FFS repos, game-specific skills, new features

### Phase 1: FFS Intervention (Weeks 4+)
In scope (with FFS founder coordination):
- Swap FFS governance for Syntax Sorcery's tier system
- Integrate ralph-watch + cost alerting
- Route GDD→Issue creation autonomously
- Establish Proposal→Prototype workflow
- Cherry-pick 13 skills into FFS

Out of scope:
- Rewriting game logic, UX changes, new genres

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **FFS breakage** | Live pipeline stops; founder loses games in flight | Pause FFS before Phase 1. Test on copy first. Grandfather existing games. |
| **Context bloat** | Skills get forgotten; overhead kills velocity | < 15KB per file. Archive quarterly. Proactive extraction on 2nd use. |
| **Skill rot** | Confidence degrades; autonomy breaks | Log every decision. Run monthly review. Retest high-risk skills quarterly. |
| **Budget creep** | Azure cost exceeds €500/mo | Tank monitors at 80% (€400). Kill idle infrastructure. Favor batch over streaming. |
| **Overcomplexity** | More governance = slower decisions | Keep T0-T3 simple. Default to T2 (team consensus). Review quarterly. |

## References

- **FFS repo:** github.com/jperezdelreal/FirstFrameStudios
- **Brady Gaster's Squad:** github.com/bradygaster/squad (skills system, Ralph pattern)
- **Tamir Dresher (power user):** Known for TLDR pattern + proactive skill extraction
- **Azure cost tracking:** Tank owns; alerts at €400 of €500 budget
- **Syntax Sorcery repo:** github.com/joperezdelreal/Syntax-Sorcery (this repo, .squad/decisions)
