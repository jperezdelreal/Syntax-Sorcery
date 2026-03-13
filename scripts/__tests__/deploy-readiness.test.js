const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const fixture = (name) => path.join(__dirname, 'fixtures', name);
const WORKFLOW_PATH = path.join(__dirname, '..', 'game-repo-templates', 'build-deploy.yml');

// ---------------------------------------------------------------------------
// Stage 5: index.html validation
// ---------------------------------------------------------------------------
describe('deploy readiness — index.html', () => {
  it('valid index.html exists and is non-empty', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    expect(html.length).toBeGreaterThan(0);
  });

  it('valid index.html contains a <canvas> element', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    expect(html).toMatch(/<canvas[\s>]/i);
  });

  it('valid index.html contains a <script> tag', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    expect(html).toMatch(/<script[\s>]/i);
  });

  it('valid index.html references game.js', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    expect(html).toContain('game.js');
  });

  it('valid index.html has DOCTYPE', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    expect(html).toMatch(/<!DOCTYPE html>/i);
  });

  it('valid index.html has a <title>', () => {
    const html = fs.readFileSync(fixture('valid-index.html'), 'utf8');
    const titleMatch = html.match(/<title>(.+?)<\/title>/i);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch[1].trim().length).toBeGreaterThan(0);
  });

  it('missing-canvas index.html has no <canvas> element', () => {
    const html = fs.readFileSync(fixture('missing-canvas-index.html'), 'utf8');
    expect(html).not.toMatch(/<canvas[\s>]/i);
  });

  it('missing-script index.html has no <script> tag', () => {
    const html = fs.readFileSync(fixture('missing-script-index.html'), 'utf8');
    expect(html).not.toMatch(/<script[\s>]/i);
  });
});

// ---------------------------------------------------------------------------
// Stage 5: game.js validation (syntax check via acorn)
// ---------------------------------------------------------------------------
describe('deploy readiness — game.js syntax', () => {
  let acorn;

  beforeAll(() => {
    acorn = require('acorn');
  });

  it('valid game.js parses without errors', () => {
    const code = fs.readFileSync(fixture('valid-game.js'), 'utf8');
    expect(() => {
      acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' });
    }).not.toThrow();
  });

  it('invalid game.js throws parse error', () => {
    const code = fs.readFileSync(fixture('invalid-game.js'), 'utf8');
    expect(() => {
      acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' });
    }).toThrow();
  });

  it('valid game.js is non-empty', () => {
    const code = fs.readFileSync(fixture('valid-game.js'), 'utf8');
    expect(code.trim().length).toBeGreaterThan(0);
  });

  it('valid game.js contains game loop function', () => {
    const code = fs.readFileSync(fixture('valid-game.js'), 'utf8');
    expect(code).toMatch(/function\s+(gameLoop|update|render|tick|animate)/);
  });
});

// ---------------------------------------------------------------------------
// Stage 5: Deploy workflow permissions
// ---------------------------------------------------------------------------
describe('deploy readiness — workflow permissions', () => {
  let workflow;

  beforeAll(() => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    workflow = yaml.load(raw);
  });

  it('has pages:write permission for GitHub Pages deployment', () => {
    expect(workflow.permissions.pages).toBe('write');
  });

  it('has id-token:write permission for OIDC', () => {
    expect(workflow.permissions['id-token']).toBe('write');
  });

  it('has contents:read permission for checkout', () => {
    expect(workflow.permissions.contents).toBe('read');
  });

  it('does not have overly permissive write-all', () => {
    // permissions should be specific, not write-all
    expect(workflow.permissions).not.toBe('write-all');
    expect(typeof workflow.permissions).toBe('object');
  });

  it('deploy job targets github-pages environment', () => {
    expect(workflow.jobs.deploy.environment.name).toBe('github-pages');
  });

  it('deploy job exposes page_url output', () => {
    const envUrl = workflow.jobs.deploy.environment.url;
    expect(envUrl).toBeDefined();
    expect(envUrl).toContain('page_url');
  });
});

// ---------------------------------------------------------------------------
// Stage 5: Full deploy readiness check (integration-style)
// ---------------------------------------------------------------------------
describe('deploy readiness — full validation', () => {
  function checkDeployReady(distDir) {
    const errors = [];

    // Check index.html exists
    const indexPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      errors.push('index.html not found');
    } else {
      const html = fs.readFileSync(indexPath, 'utf8');
      if (!html.match(/<canvas[\s>]/i)) errors.push('No <canvas> element in index.html');
      if (!html.match(/<script[\s>]/i)) errors.push('No <script> tag in index.html');
    }

    // Check game.js exists and has valid syntax
    const gamePath = path.join(distDir, 'game.js');
    if (!fs.existsSync(gamePath)) {
      errors.push('game.js not found');
    } else {
      try {
        const acorn = require('acorn');
        const code = fs.readFileSync(gamePath, 'utf8');
        acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' });
      } catch (e) {
        errors.push(`game.js syntax error: ${e.message}`);
      }
    }

    return { ready: errors.length === 0, errors };
  }

  it('reports ready for fixture dir with valid files', () => {
    // fixtures dir has valid-index.html and valid-game.js but not as index.html/game.js
    // We test the function logic by pointing to a temp dir
    const os = require('os');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ready-'));
    fs.copyFileSync(fixture('valid-index.html'), path.join(tmpDir, 'index.html'));
    fs.copyFileSync(fixture('valid-game.js'), path.join(tmpDir, 'game.js'));

    const result = checkDeployReady(tmpDir);
    expect(result.ready).toBe(true);
    expect(result.errors).toHaveLength(0);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports not ready when index.html is missing', () => {
    const os = require('os');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ready-'));
    fs.copyFileSync(fixture('valid-game.js'), path.join(tmpDir, 'game.js'));

    const result = checkDeployReady(tmpDir);
    expect(result.ready).toBe(false);
    expect(result.errors).toContain('index.html not found');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports not ready when game.js is missing', () => {
    const os = require('os');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ready-'));
    fs.copyFileSync(fixture('valid-index.html'), path.join(tmpDir, 'index.html'));

    const result = checkDeployReady(tmpDir);
    expect(result.ready).toBe(false);
    expect(result.errors).toContain('game.js not found');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports not ready when game.js has syntax errors', () => {
    const os = require('os');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ready-'));
    fs.copyFileSync(fixture('valid-index.html'), path.join(tmpDir, 'index.html'));
    fs.copyFileSync(fixture('invalid-game.js'), path.join(tmpDir, 'game.js'));

    const result = checkDeployReady(tmpDir);
    expect(result.ready).toBe(false);
    expect(result.errors.some(e => e.includes('syntax error'))).toBe(true);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports not ready when index.html lacks canvas', () => {
    const os = require('os');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ready-'));
    fs.copyFileSync(fixture('missing-canvas-index.html'), path.join(tmpDir, 'index.html'));
    fs.copyFileSync(fixture('valid-game.js'), path.join(tmpDir, 'game.js'));

    const result = checkDeployReady(tmpDir);
    expect(result.ready).toBe(false);
    expect(result.errors.some(e => e.includes('canvas'))).toBe(true);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
