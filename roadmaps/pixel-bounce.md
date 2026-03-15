# Pixel-Bounce Roadmap

## TLDR
Refine core physics, add particle effects and visual feedback, implement game modes (Zen/Challenge). Max 3 features. Scope: finish existing game, no new mechanics.

---

## Feature 1: [ ] Polish ball physics and collision response with realistic bounce
Fine-tune ball velocity damping, corner handling, and surface reactions for satisfying gameplay feel.

- Implement coefficient of restitution (COR) by surface type (0.8 wood, 0.6 rubber, 0.4 soft)
- Fix corner collision edge cases (prevent ball sticking)
- Add friction simulation (velocity reduction after bounces)
- Spin mechanics (angular velocity affects trajectory)
- Validate with 100+ manual test cases (angles 0-360°, velocities 1-100 px/s)
- Files: `src/physics/ball.js`, `src/physics/collision.js`, `tests/physics.test.js`
- Context: Tight physics feel separates casual from satisfying game

## Feature 2: [ ] Add visual feedback with particle effects and screen shake
Create celebratory particle bursts, combo indicators, and physics-based screen shake on big impacts.

- Particle system (velocity, lifetime, color fade, gravity)
- Combo multiplier display (x1, x2, x3... x10 cap)
- Screen shake on impact (amplitude scales with collision energy)
- Trail renderer (ball path history, fade over time)
- 60+ concurrent particles without frame drops
- Files: `src/graphics/particles.js`, `src/graphics/screen-shake.js`, `src/ui/combo-display.jsx`
- Context: Gives visual impact to physics; increases satisfaction

## Feature 3: [ ] Implement dual-mode gameplay: Zen and Challenge modes
Add progression and challenge variety without changing core mechanics.

- **Zen Mode:** Infinite play, no scoring, relaxation focus, ambient music
- **Challenge Mode:** 3-minute rounds, combo tracking, leaderboard integration
- Mode selection UI (menu screen with mode descriptions)
- Stats tracking (best combo, survival time, high score)
- Persist mode preferences and top scores
- Files: `src/modes/zen.js`, `src/modes/challenge.js`, `src/ui/ModeSelector.jsx`
- Context: Accommodates different player goals; extends game lifespan
