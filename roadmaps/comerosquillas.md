# ComeRosquillas Roadmap

## TLDR
Core gameplay loop completion: procedural level generation, enemy AI pathfinding, scoring/progression system. Max 3 features. Scope: finish existing game, no new modes.

---

## Feature 1: [ ] Implement procedural level generation with difficulty scaling
Create algorithm that generates unique donkey obstacle courses with increasing challenge based on level number.

- Tile-based level layout (8x12 grid, spawned from seed)
- Obstacle variety (walls, gaps, moving platforms, rolling obstacles)
- Difficulty curve (levels 1-10 easy, 11-25 medium, 26+ hard)
- Balanced spawning (guarantee safe path exists, 60/40 obstacle ratio)
- Load time <200ms per level
- Files: `src/level-gen.js`, `src/obstacles.js`, `tests/level-gen.test.js`
- Context: Enables infinite replayability; core loop progression

## Feature 2: [ ] Add donkey enemy spawning and basic pathfinding AI
Introduce antagonist donkeys that chase the player using A* pathfinding.

- Spawn system (1-3 donkeys per level, based on difficulty)
- A* pathfinding implementation (update every 0.5s, 8-cell lookahead)
- Chase behavior (follow player with speed scaling)
- Collision detection (catch player = game over)
- Performance: 60 FPS with 3 enemies on-screen
- Files: `src/enemy-ai.js`, `src/pathfinding.js`, `tests/pathfinding.test.js`
- Context: Creates tension; transforms level exploration into survival challenge

## Feature 3: [ ] Create scoring and progression system with leaderboard UI
Track player performance, enable unlockable levels, and display top scores.

- Points calculation (obstacles avoided, time bonus, danger bonus)
- Persistence (save scores per level to localStorage)
- Unlock system (complete level N to unlock level N+1)
- Leaderboard display (top 10 local scores with timestamps)
- Progression UI (show next milestone, current rank)
- Files: `src/scoring.js`, `src/ui/Leaderboard.jsx`, `tests/scoring.test.js`
- Context: Adds replayability and progression goals; completion felt
