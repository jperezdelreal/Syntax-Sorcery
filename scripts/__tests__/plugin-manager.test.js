/**
 * Tests for scripts/plugin-manager.js
 *
 * Uses DI pattern — all external dependencies are injected via deps object.
 * No module-level mocking required.
 */

const path = require('path');

const {
  COMMANDS,
  HELP_TEXT,
  parseArgs,
  parseSkillFrontmatter,
  cmdList,
  cmdInfo,
  cmdSearch,
  cmdInstall,
  cmdCreate,
  cmdHelp,
  route,
  main,
} = require('../plugin-manager');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDeps(overrides = {}) {
  return {
    readDir: vi.fn(() => []),
    readFile: vi.fn(() => ''),
    writeFile: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => false),
    statSync: vi.fn(() => ({ isFile: () => true })),
    execSync: vi.fn(() => '[]'),
    log: vi.fn(),
    error: vi.fn(),
    skillsDir: '/mock/.squad/skills',
    templateDir: '/mock/.squad/templates/plugin-template',
    squadRoot: '/mock/.squad',
    ...overrides,
  };
}

const SAMPLE_SKILL_MD = `---
name: "test-skill"
description: "A test skill for testing"
domain: "testing"
confidence: "high"
source: "manual"
---

## Context
Test skill context.
`;

const SAMPLE_METADATA = JSON.stringify({
  name: 'test-skill',
  version: '2.0.0',
  description: 'A test skill',
  author: 'Test Author',
  tags: ['test', 'example'],
  domain: 'testing',
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses command and target', () => {
    const result = parseArgs(['node', 'plugin-manager.js', 'install', 'owner/repo']);
    expect(result.command).toBe('install');
    expect(result.target).toBe('owner/repo');
  });

  it('parses --json flag', () => {
    const result = parseArgs(['node', 'plugin-manager.js', 'list', '--json']);
    expect(result.jsonMode).toBe(true);
  });

  it('returns null for no command', () => {
    const result = parseArgs(['node', 'plugin-manager.js']);
    expect(result.command).toBeNull();
    expect(result.target).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseSkillFrontmatter
// ---------------------------------------------------------------------------

describe('parseSkillFrontmatter', () => {
  it('extracts frontmatter fields', () => {
    const meta = parseSkillFrontmatter(SAMPLE_SKILL_MD);
    expect(meta.name).toBe('test-skill');
    expect(meta.description).toBe('A test skill for testing');
    expect(meta.domain).toBe('testing');
    expect(meta.confidence).toBe('high');
  });

  it('returns empty object for no frontmatter', () => {
    const meta = parseSkillFrontmatter('# No frontmatter here');
    expect(meta).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// COMMANDS constant
// ---------------------------------------------------------------------------

describe('COMMANDS', () => {
  it('includes all expected commands', () => {
    expect(COMMANDS).toEqual(['list', 'install', 'search', 'create', 'info', 'help']);
  });
});

// ---------------------------------------------------------------------------
// cmdList
// ---------------------------------------------------------------------------

describe('cmdList', () => {
  it('shows empty message when skills dir does not exist', () => {
    const deps = makeDeps({ existsSync: vi.fn(() => false) });
    const code = cmdList(false, deps);
    expect(code).toBe(0);
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('No plugins'));
  });

  it('lists installed plugins in human format', () => {
    const deps = makeDeps({
      existsSync: vi.fn((p) => true),
      readDir: vi.fn((dir) => ['test-skill']),
      readFile: vi.fn((p) => {
        if (p.includes('SKILL.md')) return SAMPLE_SKILL_MD;
        if (p.includes('metadata.json')) return SAMPLE_METADATA;
        return '';
      }),
    });

    const code = cmdList(false, deps);
    expect(code).toBe(0);
    const allOutput = deps.log.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('test-skill');
    expect(allOutput).toContain('Installed Plugins (1)');
  });

  it('outputs JSON when --json flag is set', () => {
    const deps = makeDeps({
      existsSync: vi.fn(() => true),
      readDir: vi.fn(() => ['test-skill']),
      readFile: vi.fn((p) => {
        if (p.includes('SKILL.md')) return SAMPLE_SKILL_MD;
        if (p.includes('metadata.json')) return SAMPLE_METADATA;
        return '';
      }),
    });

    const code = cmdList(true, deps);
    expect(code).toBe(0);
    const output = JSON.parse(deps.log.mock.calls[0][0]);
    expect(output.plugins).toHaveLength(1);
    expect(output.plugins[0].name).toBe('test-skill');
  });

  it('skips directories without SKILL.md', () => {
    const deps = makeDeps({
      existsSync: vi.fn((p) => {
        if (p.includes('SKILL.md')) return false;
        return true; // skills dir exists
      }),
      readDir: vi.fn(() => ['not-a-plugin']),
    });

    const code = cmdList(true, deps);
    expect(code).toBe(0);
    const output = JSON.parse(deps.log.mock.calls[0][0]);
    expect(output.plugins).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// cmdInfo
// ---------------------------------------------------------------------------

describe('cmdInfo', () => {
  it('returns 1 when no name provided', () => {
    const deps = makeDeps();
    const code = cmdInfo(null, false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('requires a plugin name'));
  });

  it('returns 1 when plugin not found', () => {
    const deps = makeDeps({ existsSync: vi.fn(() => false) });
    const code = cmdInfo('nonexistent', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('displays plugin info in human format', () => {
    const deps = makeDeps({
      existsSync: vi.fn(() => true),
      readFile: vi.fn((p) => {
        if (p.includes('SKILL.md')) return SAMPLE_SKILL_MD;
        if (p.includes('metadata.json')) return SAMPLE_METADATA;
        return '';
      }),
      readDir: vi.fn(() => ['SKILL.md', 'metadata.json']),
    });

    const code = cmdInfo('test-skill', false, deps);
    expect(code).toBe(0);
    const allOutput = deps.log.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('test-skill');
    expect(allOutput).toContain('testing');
  });

  it('outputs JSON when --json flag is set', () => {
    const deps = makeDeps({
      existsSync: vi.fn(() => true),
      readFile: vi.fn((p) => {
        if (p.includes('SKILL.md')) return SAMPLE_SKILL_MD;
        if (p.includes('metadata.json')) return SAMPLE_METADATA;
        return '';
      }),
      readDir: vi.fn(() => ['SKILL.md', 'metadata.json']),
    });

    const code = cmdInfo('test-skill', true, deps);
    expect(code).toBe(0);
    const output = JSON.parse(deps.log.mock.calls[0][0]);
    expect(output.name).toBe('test-skill');
    expect(output.files).toContain('SKILL.md');
  });
});

// ---------------------------------------------------------------------------
// cmdSearch
// ---------------------------------------------------------------------------

describe('cmdSearch', () => {
  it('returns 1 when no query provided', () => {
    const deps = makeDeps();
    const code = cmdSearch(null, false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('requires a query'));
  });

  it('searches GitHub and displays results', () => {
    const mockResults = [
      { name: 'cool-plugin', owner: { login: 'devuser' }, description: 'A cool plugin', url: 'https://github.com/devuser/cool-plugin' },
    ];
    const deps = makeDeps({
      execSync: vi.fn(() => JSON.stringify(mockResults)),
    });

    const code = cmdSearch('cool', false, deps);
    expect(code).toBe(0);
    const allOutput = deps.log.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('cool-plugin');
    expect(allOutput).toContain('devuser');
  });

  it('outputs JSON search results', () => {
    const mockResults = [
      { name: 'my-plugin', owner: { login: 'org' }, description: 'Desc' },
    ];
    const deps = makeDeps({
      execSync: vi.fn(() => JSON.stringify(mockResults)),
    });

    const code = cmdSearch('testing', true, deps);
    expect(code).toBe(0);
    const output = JSON.parse(deps.log.mock.calls[0][0]);
    expect(output.query).toBe('testing');
    expect(output.results).toHaveLength(1);
  });

  it('handles empty search results', () => {
    const deps = makeDeps({
      execSync: vi.fn(() => '[]'),
    });

    const code = cmdSearch('nonexistent', false, deps);
    expect(code).toBe(0);
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('No plugins found'));
  });

  it('returns 1 on exec error', () => {
    const deps = makeDeps({
      execSync: vi.fn(() => { throw new Error('gh not found'); }),
    });

    const code = cmdSearch('test', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('Search error'));
  });
});

// ---------------------------------------------------------------------------
// cmdInstall
// ---------------------------------------------------------------------------

describe('cmdInstall', () => {
  it('returns 1 when no source provided', () => {
    const deps = makeDeps();
    const code = cmdInstall(null, false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('requires a source'));
  });

  it('installs from local path', () => {
    const deps = makeDeps({
      existsSync: vi.fn((p) => {
        if (p.includes('SKILL.md')) return true;
        // Target dir should not exist yet
        if (p.includes(path.join('skills', 'my-plugin'))) return false;
        return true;
      }),
      readDir: vi.fn(() => ['SKILL.md', 'metadata.json']),
      readFile: vi.fn(() => 'file content'),
      statSync: vi.fn(() => ({ isFile: () => true })),
    });

    const code = cmdInstall('./path/to/my-plugin', false, deps);
    expect(code).toBe(0);
    expect(deps.mkdirSync).toHaveBeenCalled();
    expect(deps.writeFile).toHaveBeenCalled();
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('installed'));
  });

  it('returns 1 for local path without SKILL.md', () => {
    const deps = makeDeps({
      existsSync: vi.fn(() => false),
    });

    const code = cmdInstall('./no-skill-here', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('no SKILL.md'));
  });

  it('returns 1 for invalid GitHub slug', () => {
    const deps = makeDeps();
    const code = cmdInstall('no-slash', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('owner/repo'));
  });

  it('returns 1 when plugin already installed', () => {
    const deps = makeDeps({
      existsSync: vi.fn(() => true),
    });

    const code = cmdInstall('./path/to/existing', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('already installed'));
  });
});

// ---------------------------------------------------------------------------
// cmdCreate
// ---------------------------------------------------------------------------

describe('cmdCreate', () => {
  it('returns 1 when no name provided', () => {
    const deps = makeDeps();
    const code = cmdCreate(null, false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('requires a plugin name'));
  });

  it('returns 1 for invalid name format', () => {
    const deps = makeDeps();
    const code = cmdCreate('InvalidName', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('lowercase'));
  });

  it('returns 1 when plugin already exists', () => {
    const deps = makeDeps({ existsSync: vi.fn(() => true) });
    const code = cmdCreate('existing-plugin', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  });

  it('scaffolds a new plugin from template', () => {
    const callCount = { n: 0 };
    const deps = makeDeps({
      existsSync: vi.fn((p) => {
        // Target dir: does not exist (first call)
        // Template SKILL.md: exists
        // Template metadata.json: exists
        if (p.includes('plugin-template')) return true;
        return false;
      }),
      readFile: vi.fn((p) => {
        if (p.includes('SKILL.md')) return '---\nname: "{plugin-name}"\n---\n## Context\n';
        if (p.includes('metadata.json')) return '{"name": "{plugin-name}"}';
        return '';
      }),
    });

    const code = cmdCreate('my-new-skill', false, deps);
    expect(code).toBe(0);
    expect(deps.mkdirSync).toHaveBeenCalled();
    expect(deps.writeFile).toHaveBeenCalledTimes(2);

    // Check that template placeholders were replaced
    const skillWrite = deps.writeFile.mock.calls.find(c => c[0].includes('SKILL.md'));
    expect(skillWrite[1]).toContain('my-new-skill');
    expect(skillWrite[1]).not.toContain('{plugin-name}');
  });

  it('outputs JSON on create', () => {
    const deps = makeDeps({
      existsSync: vi.fn((p) => {
        if (p.includes('plugin-template')) return true;
        return false;
      }),
      readFile: vi.fn(() => '---\nname: "{plugin-name}"\n---'),
    });

    const code = cmdCreate('json-test', true, deps);
    expect(code).toBe(0);
    const output = JSON.parse(deps.log.mock.calls[0][0]);
    expect(output.created).toBe('json-test');
  });

  it('returns 1 when template not found', () => {
    const deps = makeDeps({ existsSync: vi.fn(() => false) });
    const code = cmdCreate('no-template', false, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('template not found'));
  });
});

// ---------------------------------------------------------------------------
// cmdHelp
// ---------------------------------------------------------------------------

describe('cmdHelp', () => {
  it('prints help text and returns 0', () => {
    const deps = makeDeps();
    const code = cmdHelp(deps);
    expect(code).toBe(0);
    expect(deps.log).toHaveBeenCalledWith(HELP_TEXT);
  });
});

// ---------------------------------------------------------------------------
// route
// ---------------------------------------------------------------------------

describe('route', () => {
  it('shows help and returns 1 for no command', () => {
    const deps = makeDeps();
    const code = route({ command: null, target: null, jsonMode: false }, deps);
    expect(code).toBe(1);
    expect(deps.log).toHaveBeenCalledWith(HELP_TEXT);
  });

  it('returns 1 for unknown command', () => {
    const deps = makeDeps();
    const code = route({ command: 'foobar', target: null, jsonMode: false }, deps);
    expect(code).toBe(1);
    expect(deps.error).toHaveBeenCalledWith(expect.stringContaining('unknown command'));
  });

  it('routes help command', () => {
    const deps = makeDeps();
    const code = route({ command: 'help', target: null, jsonMode: false }, deps);
    expect(code).toBe(0);
  });

  it('routes list command', () => {
    const deps = makeDeps({ existsSync: vi.fn(() => false) });
    const code = route({ command: 'list', target: null, jsonMode: false }, deps);
    expect(code).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// main — end-to-end wiring
// ---------------------------------------------------------------------------

describe('main', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('returns 1 with no args', () => {
    const code = main(['node', 'plugin-manager.js']);
    expect(code).toBe(1);
  });

  it('routes help from argv', () => {
    const code = main(['node', 'plugin-manager.js', 'help']);
    expect(code).toBe(0);
  });

  it('returns 1 for unknown command', () => {
    const code = main(['node', 'plugin-manager.js', 'nope']);
    expect(code).toBe(1);
  });
});
