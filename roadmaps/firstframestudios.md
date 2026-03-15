# FirstFrameStudios Roadmap

## TLDR
Build visibility infrastructure for FFS constellation. Deploy shareable game page with live embeds. Max 3 features. Scope: finish ecosystem integration, no new game features.

---

## Feature 1: [ ] Deploy FFS GitHub Pages site with embedded game previews
Create landing page showcasing all 3 FFS games (Flora, ComeRosquillas, pixel-bounce) with live playable embeds and share links.

- Build Astro SSG site structure (layout, components, styling)
- Embed Flora, ComeRosquillas, pixel-bounce iframes with game preview data
- Add share buttons for each game (Twitter, Discord, email)
- Include game stats dashboard (hours played, high scores, leaderboard placeholders)
- Responsive design (mobile, tablet, desktop)
- Files: `src/pages/index.astro`, `src/components/GameCard.astro`, `src/components/EmbedFrame.astro`
- Context: Day 3 delivery target; enables friends/investors to try games instantly

## Feature 2: [ ] Auto-generate daily devlog from Squad decisions
Create automation that publishes a daily digest of what the team shipped, parsed from decisions.md timestamps.

- Parse `decisions.md` entries from last 24 hours
- Extract title, tier, status, key outcomes
- Generate markdown devlog post
- Commit to blog directory automatically at 02:00 UTC
- Include GitHub links (PRs, issues, commits)
- Files: `.github/workflows/daily-devlog.yml`, `blog/[DATE].md`
- Context: Transparent operations — community sees daily progress; shows autonomy in action

## Feature 3: [ ] Create Squad Monitor UI with live status dashboard
Build real-time monitoring panel showing agent status, issue burn rate, autonomy metrics, and phase progress.

- Display current agent assignments (Morpheus, Tank, Trinity, Switch, @copilot)
- Show open issues by repo, issue age, and queue depth
- Display perpetual motion metrics (issues closed/day, roadmap items created, rate limit status)
- Phase progress visualization (current phase, estimated days remaining)
- Auto-refresh data every 60 seconds via GitHub API polling
- Files: `src/pages/monitor.astro`, `src/components/AgentStatus.astro`, `src/components/Metrics.astro`
- Context: Internal tool for team transparency; basis for future investor dashboards
