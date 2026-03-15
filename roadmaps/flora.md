# Flora Roadmap

## TLDR
Seasonal gameplay features: spring planting mechanics, weather system, harvest animations. Max 3 features. Scope: finish existing seasonal loop, no new plant types.

---

## Feature 1: [ ] Implement spring planting mechanics with soil preparation
Add interactive planting phase where players prepare soil, plant seeds, and set initial conditions for growth.

- Soil preparation state (tilling, adding nutrients, checking pH)
- Seed selection UI (3 plant varieties, visual previews)
- Placement system (drag-drop into grid cells)
- Watering initialization (set base moisture level)
- Persistence (save planted state to localStorage)
- Files: `src/gameplay/planting.js`, `src/ui/PlantSelector.jsx`, `tests/planting.test.js`
- Context: Opens core seasonal loop; required before growth mechanics

## Feature 2: [ ] Add procedural weather system affecting plant growth rates
Create dynamic weather that impacts growth speed, water needs, and harvest timing.

- Weather generator (daily random or predictable seed-based)
- Conditions: sunny (faster growth), rainy (water overflow risk), cloudy (neutral)
- Visual effects (cloud coverage, rain animation, sun intensity)
- Gameplay impact (growth multipliers: 0.8-1.2x based on conditions)
- Weather UI (forecast for next 7 days)
- Files: `src/gameplay/weather.js`, `src/graphics/weather-renderer.js`, `tests/weather.test.js`
- Context: Adds strategic depth — players plan around weather

## Feature 3: [ ] Create harvest sequence with animations and reward feedback
Design satisfying harvest moment with animations, reward calculation, and season completion.

- Harvest detection (when plant reaches maturity)
- Pick animation (60fps, 0.8s duration, particle effects)
- Reward calculation (yield amount based on growth conditions, timing)
- End-of-season summary screen (total harvest, stats, new season prompt)
- Audio feedback (harvest success chime, season transition music)
- Files: `src/gameplay/harvest.js`, `src/graphics/harvest-animator.js`, `src/audio/harvest-sfx.js`
- Context: Completes spring→harvest loop; enables seasonal progression tracking
