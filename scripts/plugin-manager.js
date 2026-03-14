#!/usr/bin/env node
'use strict';

/**
 * Plugin Manager — CLI tool for managing Squad plugins/skills.
 *
 * Usage:
 *   node scripts/plugin-manager.js <command> [args] [options]
 *
 * Commands:
 *   list                 List installed plugins from .squad/skills/
 *   install <source>     Install a plugin from GitHub repo or local path
 *   search <query>       Search for plugins on GitHub (topic: squad-plugin)
 *   create <name>        Scaffold a new plugin from template
 *   info <name>          Show details of an installed plugin
 *   help                 Show this help message
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SQUAD_ROOT = path.resolve(__dirname, '..', '.squad');
const SKILLS_DIR = path.join(SQUAD_ROOT, 'skills');
const TEMPLATE_DIR = path.join(SQUAD_ROOT, 'templates', 'plugin-template');

const COMMANDS = ['list', 'install', 'search', 'create', 'info', 'help'];

const HELP_TEXT = `
Plugin Manager — CLI tool for managing Squad plugins/skills

Usage:
  npm run plugin -- <command> [args] [options]

Commands:
  list                 List installed plugins from .squad/skills/
  install <source>     Install a plugin from GitHub repo or local path
  search <query>       Search for plugins on GitHub (topic: squad-plugin)
  create <name>        Scaffold a new plugin from template
  info <name>          Show details of an installed plugin
  help                 Show this help message

Flags:
  --json               Machine-readable JSON output

Examples:
  npm run plugin -- list
  npm run plugin -- list --json
  npm run plugin -- install owner/repo
  npm run plugin -- install ./path/to/local/plugin
  npm run plugin -- search "testing patterns"
  npm run plugin -- create my-new-skill
  npm run plugin -- info conventional-commit
`.trim();

// ---------------------------------------------------------------------------
// Dependency Injection defaults
// ---------------------------------------------------------------------------

function defaultDeps() {
  return {
    readDir: (dir) => fs.readdirSync(dir),
    readFile: (filePath) => fs.readFileSync(filePath, 'utf8'),
    writeFile: (filePath, content) => fs.writeFileSync(filePath, content, 'utf8'),
    mkdirSync: (dir, opts) => fs.mkdirSync(dir, opts),
    existsSync: (p) => fs.existsSync(p),
    statSync: (p) => fs.statSync(p),
    execSync: (cmd, opts) => execSync(cmd, opts),
    log: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    skillsDir: SKILLS_DIR,
    templateDir: TEMPLATE_DIR,
    squadRoot: SQUAD_ROOT,
  };
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const target = args[1] || null;
  const flags = args.slice(1);
  const jsonMode = flags.includes('--json');
  return { command, target, flags, jsonMode };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSkillFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const meta = {};
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*"?([^"]*)"?\s*$/);
    if (kv) {
      meta[kv[1]] = kv[2].trim();
    }
  }
  return meta;
}

function readMetadataJson(pluginDir, deps) {
  const metaPath = path.join(pluginDir, 'metadata.json');
  if (deps.existsSync(metaPath)) {
    try {
      return JSON.parse(deps.readFile(metaPath));
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Command: list
// ---------------------------------------------------------------------------

function cmdList(jsonMode, deps) {
  const d = deps || defaultDeps();

  if (!d.existsSync(d.skillsDir)) {
    if (jsonMode) {
      d.log(JSON.stringify({ plugins: [] }));
    } else {
      d.log('No plugins installed (skills directory not found).');
    }
    return 0;
  }

  const entries = d.readDir(d.skillsDir);
  const plugins = [];

  for (const entry of entries) {
    const skillPath = path.join(d.skillsDir, entry, 'SKILL.md');
    if (!d.existsSync(skillPath)) continue;

    const content = d.readFile(skillPath);
    const meta = parseSkillFrontmatter(content);
    const jsonMeta = readMetadataJson(path.join(d.skillsDir, entry), d);

    plugins.push({
      name: entry,
      description: meta.description || jsonMeta?.description || '',
      domain: meta.domain || jsonMeta?.domain || '',
      confidence: meta.confidence || '',
      version: jsonMeta?.version || '',
    });
  }

  if (jsonMode) {
    d.log(JSON.stringify({ plugins }, null, 2));
    return 0;
  }

  if (plugins.length === 0) {
    d.log('No plugins installed.');
    return 0;
  }

  d.log(`\nInstalled Plugins (${plugins.length}):\n`);
  for (const p of plugins) {
    const ver = p.version ? ` v${p.version}` : '';
    d.log(`  📦 ${p.name}${ver}`);
    if (p.description) d.log(`     ${p.description}`);
    if (p.domain) d.log(`     Domain: ${p.domain}`);
  }
  d.log('');

  return 0;
}

// ---------------------------------------------------------------------------
// Command: info
// ---------------------------------------------------------------------------

function cmdInfo(name, jsonMode, deps) {
  const d = deps || defaultDeps();

  if (!name) {
    d.error('Error: info command requires a plugin name.');
    d.error('Usage: npm run plugin -- info <name>');
    return 1;
  }

  const pluginDir = path.join(d.skillsDir, name);
  const skillPath = path.join(pluginDir, 'SKILL.md');

  if (!d.existsSync(skillPath)) {
    d.error(`Error: plugin "${name}" not found.`);
    return 1;
  }

  const content = d.readFile(skillPath);
  const meta = parseSkillFrontmatter(content);
  const jsonMeta = readMetadataJson(pluginDir, d);

  // Collect files in plugin directory
  let files = [];
  try {
    files = d.readDir(pluginDir);
  } catch {
    // directory read may fail
  }

  const info = {
    name,
    ...meta,
    ...(jsonMeta || {}),
    files,
    path: pluginDir,
  };

  if (jsonMode) {
    d.log(JSON.stringify(info, null, 2));
    return 0;
  }

  d.log(`\n📦 Plugin: ${name}`);
  if (meta.description) d.log(`   Description: ${meta.description}`);
  if (meta.domain) d.log(`   Domain: ${meta.domain}`);
  if (meta.confidence) d.log(`   Confidence: ${meta.confidence}`);
  if (meta.source) d.log(`   Source: ${meta.source}`);
  if (jsonMeta?.version) d.log(`   Version: ${jsonMeta.version}`);
  if (jsonMeta?.author) d.log(`   Author: ${jsonMeta.author}`);
  if (jsonMeta?.tags) d.log(`   Tags: ${jsonMeta.tags.join(', ')}`);
  d.log(`   Files: ${files.join(', ')}`);
  d.log(`   Path: ${pluginDir}`);
  d.log('');

  return 0;
}

// ---------------------------------------------------------------------------
// Command: search
// ---------------------------------------------------------------------------

function cmdSearch(query, jsonMode, deps) {
  const d = deps || defaultDeps();

  if (!query) {
    d.error('Error: search command requires a query.');
    d.error('Usage: npm run plugin -- search <query>');
    return 1;
  }

  try {
    const cmd = `gh search repos --topic squad-plugin "${query}" --json name,owner,description,url --limit 10`;
    const raw = d.execSync(cmd, {
      encoding: 'utf8',
      timeout: 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const results = JSON.parse(raw);

    if (jsonMode) {
      d.log(JSON.stringify({ query, results }, null, 2));
      return 0;
    }

    if (results.length === 0) {
      d.log(`No plugins found for "${query}".`);
      return 0;
    }

    d.log(`\nSearch Results for "${query}":\n`);
    for (const r of results) {
      const owner = r.owner?.login || r.owner || '';
      d.log(`  🔍 ${owner}/${r.name}`);
      if (r.description) d.log(`     ${r.description}`);
      if (r.url) d.log(`     ${r.url}`);
    }
    d.log('');

    return 0;
  } catch (err) {
    d.error(`Search error: ${err.message}`);
    return 1;
  }
}

// ---------------------------------------------------------------------------
// Command: install
// ---------------------------------------------------------------------------

function cmdInstall(source, jsonMode, deps) {
  const d = deps || defaultDeps();

  if (!source) {
    d.error('Error: install command requires a source (GitHub repo or local path).');
    d.error('Usage: npm run plugin -- install owner/repo');
    return 1;
  }

  // Detect local path vs GitHub repo
  const isLocal = source.startsWith('.') || source.startsWith('/') || source.startsWith('\\') || /^[A-Z]:\\/i.test(source);

  try {
    if (isLocal) {
      return installFromLocal(source, jsonMode, d);
    } else {
      return installFromGitHub(source, jsonMode, d);
    }
  } catch (err) {
    d.error(`Install error: ${err.message}`);
    return 1;
  }
}

function installFromLocal(localPath, jsonMode, d) {
  const resolved = path.resolve(localPath);
  const skillFile = path.join(resolved, 'SKILL.md');

  if (!d.existsSync(skillFile)) {
    d.error(`Error: no SKILL.md found at "${resolved}".`);
    return 1;
  }

  const pluginName = path.basename(resolved);
  const targetDir = path.join(d.skillsDir, pluginName);

  if (d.existsSync(targetDir)) {
    d.error(`Error: plugin "${pluginName}" already installed. Remove it first.`);
    return 1;
  }

  d.mkdirSync(targetDir, { recursive: true });

  // Copy all files from source to target
  const files = d.readDir(resolved);
  for (const file of files) {
    const srcFile = path.join(resolved, file);
    const stat = d.statSync(srcFile);
    if (stat.isFile()) {
      const content = d.readFile(srcFile);
      d.writeFile(path.join(targetDir, file), content);
    }
  }

  if (jsonMode) {
    d.log(JSON.stringify({ installed: pluginName, source: localPath, type: 'local' }));
  } else {
    d.log(`✅ Plugin "${pluginName}" installed from local path.`);
  }

  return 0;
}

function installFromGitHub(repoSlug, jsonMode, d) {
  // Expects owner/repo format
  if (!repoSlug.includes('/')) {
    d.error('Error: GitHub source must be in owner/repo format.');
    return 1;
  }

  const [owner, repo] = repoSlug.split('/');
  const pluginName = repo;
  const targetDir = path.join(d.skillsDir, pluginName);

  if (d.existsSync(targetDir)) {
    d.error(`Error: plugin "${pluginName}" already installed. Remove it first.`);
    return 1;
  }

  // Use gh CLI to clone the repo contents
  const tmpDir = path.join(d.squadRoot, '.plugin-tmp');
  try {
    d.mkdirSync(tmpDir, { recursive: true });
    d.execSync(`gh repo clone ${owner}/${repo} "${tmpDir}/${repo}" -- --depth 1`, {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const clonedDir = path.join(tmpDir, repo);
    const skillFile = path.join(clonedDir, 'SKILL.md');

    if (!d.existsSync(skillFile)) {
      d.error(`Error: no SKILL.md found in ${owner}/${repo}.`);
      return 1;
    }

    d.mkdirSync(targetDir, { recursive: true });
    const files = d.readDir(clonedDir);
    for (const file of files) {
      if (file === '.git') continue;
      const srcFile = path.join(clonedDir, file);
      const stat = d.statSync(srcFile);
      if (stat.isFile()) {
        const content = d.readFile(srcFile);
        d.writeFile(path.join(targetDir, file), content);
      }
    }

    if (jsonMode) {
      d.log(JSON.stringify({ installed: pluginName, source: repoSlug, type: 'github' }));
    } else {
      d.log(`✅ Plugin "${pluginName}" installed from GitHub (${owner}/${repo}).`);
    }

    return 0;
  } finally {
    // Clean up temp directory
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // cleanup failure is non-fatal
    }
  }
}

// ---------------------------------------------------------------------------
// Command: create
// ---------------------------------------------------------------------------

function cmdCreate(name, jsonMode, deps) {
  const d = deps || defaultDeps();

  if (!name) {
    d.error('Error: create command requires a plugin name.');
    d.error('Usage: npm run plugin -- create <name>');
    return 1;
  }

  // Validate name format
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    d.error('Error: plugin name must be lowercase, start with a letter, and use hyphens (e.g., my-plugin).');
    return 1;
  }

  const targetDir = path.join(d.skillsDir, name);
  if (d.existsSync(targetDir)) {
    d.error(`Error: plugin "${name}" already exists.`);
    return 1;
  }

  // Read templates
  const skillTemplatePath = path.join(d.templateDir, 'SKILL.md');
  const metaTemplatePath = path.join(d.templateDir, 'metadata.json');

  if (!d.existsSync(skillTemplatePath)) {
    d.error('Error: plugin template not found. Expected at .squad/templates/plugin-template/SKILL.md');
    return 1;
  }

  let skillContent = d.readFile(skillTemplatePath);
  skillContent = skillContent.replace(/\{plugin-name\}/g, name);

  let metaContent = '';
  if (d.existsSync(metaTemplatePath)) {
    metaContent = d.readFile(metaTemplatePath);
    metaContent = metaContent.replace(/\{plugin-name\}/g, name);
  }

  // Create plugin directory and files
  d.mkdirSync(targetDir, { recursive: true });
  d.writeFile(path.join(targetDir, 'SKILL.md'), skillContent);
  if (metaContent) {
    d.writeFile(path.join(targetDir, 'metadata.json'), metaContent);
  }

  if (jsonMode) {
    d.log(JSON.stringify({ created: name, path: targetDir }));
  } else {
    d.log(`✅ Plugin "${name}" scaffolded at ${targetDir}`);
    d.log('   Edit SKILL.md and metadata.json to customize your plugin.');
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Command: help
// ---------------------------------------------------------------------------

function cmdHelp(deps) {
  const d = deps || defaultDeps();
  d.log(HELP_TEXT);
  return 0;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function route(parsed, deps) {
  const { command, target, jsonMode } = parsed;

  if (!command) {
    const d = deps || defaultDeps();
    d.log(HELP_TEXT);
    d.error('Error: no command specified.');
    return 1;
  }

  if (!COMMANDS.includes(command)) {
    const d = deps || defaultDeps();
    d.log(HELP_TEXT);
    d.error(`Error: unknown command "${command}".`);
    return 1;
  }

  switch (command) {
    case 'list':
      return cmdList(jsonMode, deps);
    case 'info':
      return cmdInfo(target, jsonMode, deps);
    case 'search':
      return cmdSearch(target, jsonMode, deps);
    case 'install':
      return cmdInstall(target, jsonMode, deps);
    case 'create':
      return cmdCreate(target, jsonMode, deps);
    case 'help':
      return cmdHelp(deps);
    default:
      return 1;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(argv) {
  const parsed = parseArgs(argv || process.argv);
  return route(parsed);
}

if (require.main === module) {
  const code = main();
  process.exit(code);
}

module.exports = {
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
  defaultDeps,
};
