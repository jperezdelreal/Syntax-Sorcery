/**
 * Flora Gameplay Tests
 *
 * Proves the Syntax Sorcery gameplay testing framework can instantiate and
 * validate a REAL downstream game — flora (botanical simulation/puzzle) —
 * without any browser.  Uses esbuild to on-the-fly bundle flora's TypeScript
 * modules into Node-compatible JS, then tests real game logic: plant lifecycle,
 * resource management, player interactions, scoring, and state transitions.
 *
 * Issue: #130 — Apply headless gameplay tests to flora
 */

const { GameTestRunner } = require('../framework');
const esbuild = require('esbuild');
const path = require('path');
const Module = require('module');

const FLORA_SRC = path.resolve('C:/Users/joperezd/GitHub Repos/flora/src');

// ---------------------------------------------------------------------------
// Bundle flora's TypeScript game modules at test time via esbuild
// ---------------------------------------------------------------------------

let Flora;

beforeAll(() => {
  const entryCode = `
    export { Plant, GrowthStage, WaterState } from './entities/Plant';
    export { Tile, TileState } from './entities/Tile';
    export { GardenGrid } from './entities/GardenGrid';
    export { Player, ToolType } from './entities/Player';
    export { Hazard, HazardType, PestState } from './entities/Hazard';
    export { PlantSystem } from './systems/PlantSystem';
    export { ScoringSystem, } from './systems/ScoringSystem';
    export { EventBus, eventBus } from './core/EventBus';
    export {
      TOMATO, LETTUCE, CARROT, SUNFLOWER, LAVENDER,
      HEIRLOOM_SQUASH, ALL_PLANTS, PLANT_BY_ID,
    } from './config/plants';
    export { Season } from './config/seasons';
    export { SCORE_CONFIG, MILESTONE_THRESHOLDS } from './config/scoring';
  `;

  const result = esbuild.buildSync({
    stdin: {
      contents: entryCode,
      resolveDir: FLORA_SRC,
      loader: 'ts',
    },
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    external: ['pixi.js'],
    logLevel: 'silent',
  });

  // Load the bundled CJS code into a module
  const bundledCode = result.outputFiles[0].text;
  const tempModule = new Module('flora-bundle');
  tempModule.paths = Module._nodeModulePaths(__dirname);
  tempModule._compile(bundledCode, path.join(__dirname, 'flora-bundle.js'));
  Flora = tempModule.exports;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Flora — Gameplay Tests', () => {
  let runner;

  beforeEach(() => {
    runner = new GameTestRunner({ width: 800, height: 600, fps: 60 });
    runner.setup();
    // Reset the event bus to avoid listener leak across tests
    Flora.eventBus.clear();
  });

  afterEach(() => {
    runner.teardown();
  });

  // ── 1. Game Initialization ─────────────────────────────────────────

  describe('Game Initialization', () => {
    it('Plant starts in SEED stage with 100% health', () => {
      const plant = new Flora.Plant('p1', Flora.TOMATO, 0, 0);

      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.SEED);
      expect(plant.getHealth()).toBe(100);
      expect(plant.active).toBe(true);
    });

    it('GardenGrid initialises with correct 8×8 dimensions', () => {
      const grid = new Flora.GardenGrid({ rows: 8, cols: 8, tileSize: 48, padding: 4 });
      const dims = grid.getGridDimensions();

      expect(dims.width).toBe(8 * 48);
      expect(dims.height).toBe(8 * 48);
      expect(grid.getAllTiles()).toHaveLength(64);
    });

    it('Player starts with max actions on day 1', () => {
      const player = new Flora.Player('player1', { startRow: 0, startCol: 0, actionsPerDay: 8 });
      const state = player.getState();

      expect(state.currentDay).toBe(1);
      expect(state.actionsRemaining).toBe(8);
      expect(state.maxActions).toBe(8);
    });
  });

  // ── 2. Plant Lifecycle (seed → sprout → mature) ────────────────────

  describe('Plant Lifecycle', () => {
    it('progresses from SEED → SPROUT at ~33% growth', () => {
      // Lettuce: growthTime = 3 days → SPROUT at 1 day (33%)
      const plant = new Flora.Plant('p1', Flora.LETTUCE, 0, 0);
      plant.water();
      plant.advanceDay();

      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.SPROUT);
    });

    it('progresses from SPROUT → GROWING at ~66% growth', () => {
      // Lettuce: growthTime = 3 → GROWING at 2 days (66%)
      const plant = new Flora.Plant('p1', Flora.LETTUCE, 0, 0);
      for (let d = 0; d < 2; d++) {
        plant.water();
        plant.advanceDay();
      }

      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.GROWING);
    });

    it('reaches MATURE stage and becomes harvestable', () => {
      // Lettuce: growthTime = 3 → MATURE at 3 days
      const plant = new Flora.Plant('p1', Flora.LETTUCE, 0, 0);
      for (let d = 0; d < 3; d++) {
        plant.water();
        plant.advanceDay();
      }

      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.MATURE);
      expect(plant.canHarvest()).toBe(true);
    });

    it('enters WILTING when health drops below 40%', () => {
      const plant = new Flora.Plant('p1', Flora.TOMATO, 0, 0);
      // Advance several days well-watered to get past seed stage
      for (let d = 0; d < 2; d++) {
        plant.water();
        plant.advanceDay();
      }
      // Now apply damage to drop health below 40%
      plant.takeDamage(65);
      // Re-evaluate stage on next day
      plant.water();
      plant.advanceDay();

      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.WILTING);
    });
  });

  // ── 3. Resource Management (water, health) ─────────────────────────

  describe('Resource Management', () => {
    it('watering changes plant state from DRY to WET', () => {
      const plant = new Flora.Plant('p1', Flora.TOMATO, 0, 0);
      const before = plant.getState();
      expect(before.waterState).toBe(Flora.WaterState.DRY);

      plant.water();
      const after = plant.getState();
      expect(after.waterState).toBe(Flora.WaterState.WET);
    });

    it('unwatered high-need plants lose health over multiple days', () => {
      // Tomato has waterNeedPerDay = 1.0 (daily watering)
      const plant = new Flora.Plant('p1', Flora.TOMATO, 0, 0);
      const startHealth = plant.getHealth();

      // Advance several days without watering
      for (let d = 0; d < 4; d++) {
        plant.advanceDay();
      }

      expect(plant.getHealth()).toBeLessThan(startHealth);
    });

    it('drought-tolerant plants survive longer without water', () => {
      // Carrot: waterNeedPerDay = 0.14 (very drought-tolerant)
      const carrot = new Flora.Plant('p1', Flora.CARROT, 0, 0);

      for (let d = 0; d < 4; d++) {
        carrot.advanceDay();
      }

      expect(carrot.getHealth()).toBe(100);
    });

    it('tile tracks soil quality and moisture independently', () => {
      const tile = new Flora.Tile(2, 3);

      expect(tile.soilQuality).toBe(75);
      expect(tile.moisture).toBe(50);

      tile.setSoilQuality(90);
      tile.setMoisture(80);

      expect(tile.soilQuality).toBe(90);
      expect(tile.moisture).toBe(80);
    });
  });

  // ── 4. Player Interactions (planting, watering, harvesting) ────────

  describe('Player Interactions', () => {
    it('PlantSystem.createPlant() adds a real plant instance', () => {
      const ps = new Flora.PlantSystem({ framesPerDay: 360 });
      const plant = ps.createPlant('tomato', 2, 3);

      expect(plant).not.toBeNull();
      expect(plant.getGrowthStage()).toBe(Flora.GrowthStage.SEED);
      expect(ps.getActivePlants()).toHaveLength(1);
    });

    it('PlantSystem.waterPlant() waters an existing plant', () => {
      const ps = new Flora.PlantSystem({ framesPerDay: 360 });
      const plant = ps.createPlant('tomato', 2, 3);

      const watered = ps.waterPlant(2, 3);
      expect(watered).toBe(true);
      expect(plant.getState().waterState).toBe(Flora.WaterState.WET);
    });

    it('harvesting a mature plant returns seed yield', () => {
      const ps = new Flora.PlantSystem({ framesPerDay: 360 });
      const plant = ps.createPlant('lettuce', 0, 0);

      // Grow lettuce to maturity (3 days)
      for (let d = 0; d < 3; d++) {
        ps.waterPlant(0, 0);
        // Manually advance days by updating enough frames
        for (let f = 0; f < 360; f++) ps.update(1 / 60);
      }

      expect(plant.canHarvest()).toBe(true);

      const result = ps.harvestPlant(0, 0);
      expect(result.success).toBe(true);
      expect(result.seeds).toBe(Flora.LETTUCE.yieldSeeds);
    });

    it('player actions are consumed and reset on new day', () => {
      const player = new Flora.Player('player1', { startRow: 0, startCol: 0, actionsPerDay: 6 });

      player.consumeAction();
      player.consumeAction();
      expect(player.getActionsRemaining()).toBe(4);

      player.advanceDay();
      expect(player.getActionsRemaining()).toBe(6);
      expect(player.getCurrentDay()).toBe(2);
    });
  });

  // ── 5. Game State Transitions ──────────────────────────────────────

  describe('Game State Transitions', () => {
    it('PlantSystem advances day after framesPerDay frames', () => {
      const ps = new Flora.PlantSystem({ framesPerDay: 60 });
      ps.createPlant('tomato', 0, 0);

      expect(ps.getCurrentDay()).toBe(0);

      // Run 60 frames (= 1 in-game day)
      for (let f = 0; f < 60; f++) ps.update(1 / 60);

      expect(ps.getCurrentDay()).toBe(1);
    });

    it('grid tiles track state changes (EMPTY → OCCUPIED)', () => {
      const tile = new Flora.Tile(0, 0);
      expect(tile.isEmpty()).toBe(true);

      tile.state = Flora.TileState.OCCUPIED;
      expect(tile.isOccupied()).toBe(true);
      expect(tile.isEmpty()).toBe(false);
    });

    it('dead plants are removed from PlantSystem after day advancement', () => {
      const ps = new Flora.PlantSystem({ framesPerDay: 1 });
      const plant = ps.createPlant('tomato', 0, 0);

      // Kill the plant
      plant.takeDamage(100);
      expect(plant.active).toBe(false);

      // Advance a day — dead plants should be cleaned up
      ps.update(1 / 60);

      expect(ps.getActivePlants()).toHaveLength(0);
    });
  });

  // ── 6. Scoring & Progression ───────────────────────────────────────

  describe('Scoring & Progression', () => {
    it('ScoringSystem awards harvest points based on rarity', () => {
      const scoring = new Flora.ScoringSystem();

      // Simulate a common plant harvest
      Flora.eventBus.emit('plant:harvested', {
        plantId: 'tomato',
        seeds: 2,
        isNewDiscovery: false,
      });

      const breakdown = scoring.getScoreBreakdown();
      const expectedBase = Flora.SCORE_CONFIG.harvest.base;
      expect(breakdown.harvests).toBe(expectedBase * 1.0); // common multiplier
    });

    it('diversity bonus increases with unique plant types', () => {
      const scoring = new Flora.ScoringSystem();

      // Harvest two different plants
      Flora.eventBus.emit('plant:harvested', {
        plantId: 'tomato',
        seeds: 2,
        isNewDiscovery: false,
      });
      Flora.eventBus.emit('plant:harvested', {
        plantId: 'sunflower',
        seeds: 3,
        isNewDiscovery: false,
      });

      const breakdown = scoring.getScoreBreakdown();
      expect(breakdown.diversity).toBe(2 * Flora.SCORE_CONFIG.diversity.pointsPerUniqueType);
    });

    it('perfect run bonus awarded when no plants die', () => {
      const scoring = new Flora.ScoringSystem();

      Flora.eventBus.emit('plant:harvested', {
        plantId: 'tomato',
        seeds: 2,
        isNewDiscovery: false,
      });

      expect(scoring.isPerfectRun()).toBe(true);

      const breakdown = scoring.getScoreBreakdown();
      expect(breakdown.perfection).toBeGreaterThanOrEqual(Flora.SCORE_CONFIG.perfection.perfectRun);
    });

    it('perfect run revoked when a plant dies', () => {
      const scoring = new Flora.ScoringSystem();

      Flora.eventBus.emit('plant:harvested', {
        plantId: 'tomato',
        seeds: 2,
        isNewDiscovery: false,
      });
      Flora.eventBus.emit('plant:died', {
        plantId: 'p1',
        reason: 'neglect',
      });

      expect(scoring.isPerfectRun()).toBe(false);
    });
  });

  // ── 7. Save/Load via localStorage ──────────────────────────────────

  describe('Save / Load', () => {
    it('high scores persist to localStorage via framework', () => {
      runner.seedStorage({
        flora_high_scores: JSON.stringify([
          { score: 500, milestone: 'Gold', date: Date.now(), breakdown: { harvests: 300, diversity: 100, perfection: 0, hazards: 100, total: 500 } },
          { score: 250, milestone: 'Silver', date: Date.now(), breakdown: { harvests: 150, diversity: 50, perfection: 0, hazards: 50, total: 250 } },
        ]),
      });

      const stored = JSON.parse(runner.readStorage('flora_high_scores'));
      expect(stored).toHaveLength(2);
      expect(stored[0].score).toBe(500);
      expect(stored[0].milestone).toBe('Gold');
    });
  });

  // ── 8. Rendering Validation (canvas mock) ──────────────────────────

  describe('Rendering Validation', () => {
    it('canvas context is usable for draw operations', () => {
      const ctx = runner.getContext();
      expect(ctx.fillRect).toBeTypeOf('function');
      expect(ctx.strokeRect).toBeTypeOf('function');
      expect(ctx.fillText).toBeTypeOf('function');
    });
  });
});
