#!/usr/bin/env node
/**
 * Syntax Sorcery Squad MCP Server
 *
 * Exposes Squad state (team, decisions, metrics, agent history, issues)
 * as MCP tools for AI assistants. Includes both read and write operations.
 * Stdio transport for local use.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const SQUAD_DIR = resolve(PROJECT_ROOT, '.squad');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readSquadFile(relativePath: string): Promise<string> {
  const fullPath = resolve(SQUAD_DIR, relativePath);
  return readFile(fullPath, 'utf-8');
}

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error running command: ${message}`;
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: 'squad-mcp-server',
  version: '0.2.0',
});

// ===========================================================================
// READ TOOLS (existing)
// ===========================================================================

// --- Tool: squad_status ---------------------------------------------------
server.tool(
  'squad_status',
  'Get the Squad team roster, roles, and current status',
  {},
  async () => {
    const content = await readSquadFile('team.md');
    return { content: [{ type: 'text', text: content }] };
  },
);

// --- Tool: squad_decisions ------------------------------------------------
server.tool(
  'squad_decisions',
  'Get recent Squad decisions (architecture, governance, directives)',
  {},
  async () => {
    const content = await readSquadFile('decisions.md');
    return { content: [{ type: 'text', text: content }] };
  },
);

// --- Tool: squad_metrics --------------------------------------------------
server.tool(
  'squad_metrics',
  'Run the metrics engine and return KPI data as JSON',
  {},
  async () => {
    const output = runCommand('node scripts/metrics-engine.js --json');
    return { content: [{ type: 'text', text: output }] };
  },
);

// --- Tool: squad_history --------------------------------------------------
server.tool(
  'squad_history',
  "Read a specific agent's history/learnings file",
  {
    agent: z
      .string()
      .describe(
        'Agent name (lowercase): morpheus, trinity, tank, switch, oracle, mouse',
      ),
  },
  async ({ agent }) => {
    const safeName = agent.toLowerCase().replace(/[^a-z]/g, '');
    try {
      const content = await readSquadFile(`agents/${safeName}/history.md`);
      return { content: [{ type: 'text', text: content }] };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: `Agent "${safeName}" not found or has no history.md`,
          },
        ],
        isError: true,
      };
    }
  },
);

// --- Tool: squad_issues ---------------------------------------------------
server.tool(
  'squad_issues',
  'List open GitHub issues (optionally filtered by label)',
  {
    label: z
      .string()
      .optional()
      .describe('Filter issues by label (e.g. "squad", "squad:trinity")'),
  },
  async ({ label }) => {
    const labelFlag = label ? ` --label "${label}"` : '';
    const output = runCommand(
      `gh issue list --state open --limit 25 --json number,title,labels,assignees${labelFlag}`,
    );
    return { content: [{ type: 'text', text: output }] };
  },
);

// ===========================================================================
// WRITE TOOLS (new — Issue #92)
// ===========================================================================

// --- Tool: squad_create_issue ---------------------------------------------
server.tool(
  'squad_create_issue',
  'Create a new GitHub issue with title, body, and optional labels',
  {
    title: z.string().describe('Issue title'),
    body: z.string().describe('Issue body (Markdown supported)'),
    labels: z
      .string()
      .optional()
      .describe('Comma-separated labels (e.g. "squad,squad:trinity")'),
  },
  async ({ title, body, labels }) => {
    const labelFlag = labels ? ` --label "${labels}"` : '';
    const output = runCommand(
      `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"${labelFlag}`,
    );
    return { content: [{ type: 'text', text: output }] };
  },
);

// --- Tool: squad_close_issue ----------------------------------------------
server.tool(
  'squad_close_issue',
  'Close a GitHub issue by number with an optional reason',
  {
    issue_number: z.number().describe('Issue number to close'),
    reason: z
      .enum(['completed', 'not planned'])
      .optional()
      .describe('Close reason: "completed" (default) or "not planned"'),
  },
  async ({ issue_number, reason }) => {
    const reasonFlag = reason ? ` --reason "${reason}"` : '';
    const output = runCommand(
      `gh issue close ${issue_number}${reasonFlag}`,
    );
    return { content: [{ type: 'text', text: output }] };
  },
);

// --- Tool: squad_health_check ---------------------------------------------
server.tool(
  'squad_health_check',
  'Run constellation health check — open issues and PRs per repo',
  {},
  async () => {
    const repos = [
      'jperezdelreal/Syntax-Sorcery',
      'jperezdelreal/FirstFrameStudios',
      'jperezdelreal/pixel-bounce',
      'jperezdelreal/flora',
      'jperezdelreal/ComeRosquillas',
      'jperezdelreal/ffs-squad-monitor',
    ];

    const lines: string[] = ['# Constellation Health Check', ''];
    for (const repo of repos) {
      const issues = runCommand(
        `gh issue list --repo ${repo} --state open --json number --jq "length"`,
      );
      const prs = runCommand(
        `gh pr list --repo ${repo} --state open --json number --jq "length"`,
      );
      lines.push(`**${repo}** — ${issues} open issues, ${prs} open PRs`);
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// --- Tool: squad_list_sessions --------------------------------------------
server.tool(
  'squad_list_sessions',
  'List active tmux sessions (Linux/Mac) or report OS if unavailable',
  {},
  async () => {
    const os = platform();
    if (os === 'win32') {
      return {
        content: [
          {
            type: 'text',
            text: `OS: Windows (${os}). tmux not available. Use Windows Terminal or SSH to a Linux host for session management.`,
          },
        ],
      };
    }
    const output = runCommand('tmux list-sessions 2>/dev/null || echo "No tmux sessions running"');
    return {
      content: [{ type: 'text', text: `OS: ${os}\n\n${output}` }],
    };
  },
);

// --- Tool: squad_record_decision ------------------------------------------
server.tool(
  'squad_record_decision',
  'Record a decision to .squad/decisions/inbox/ for later triage',
  {
    title: z.string().describe('Short decision title'),
    body: z.string().describe('Decision body with context and rationale'),
    tier: z
      .enum(['T0', 'T1', 'T2', 'T3'])
      .describe('Decision tier: T0 (founder), T1 (lead), T2 (agent), T3 (auto)'),
    author: z.string().describe('Author agent name (e.g. "trinity", "morpheus")'),
  },
  async ({ title, body, tier, author }) => {
    const inboxDir = resolve(SQUAD_DIR, 'decisions', 'inbox');
    await mkdir(inboxDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);
    const filename = `${timestamp}-${slug}.md`;
    const filepath = resolve(inboxDir, filename);

    const content = [
      `# ${title}`,
      '',
      `**Tier:** ${tier}`,
      `**Author:** ${author}`,
      `**Date:** ${new Date().toISOString()}`,
      `**Status:** 📥 INBOX`,
      '',
      '---',
      '',
      body,
    ].join('\n');

    await writeFile(filepath, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Decision recorded: ${filename}\nPath: .squad/decisions/inbox/${filename}`,
        },
      ],
    };
  },
);

// --- Tool: squad_audit_report ---------------------------------------------
server.tool(
  'squad_audit_report',
  'Read the downstream audit report and return a summary',
  {},
  async () => {
    try {
      const fullPath = resolve(PROJECT_ROOT, 'docs', 'downstream-audit.md');
      const content = await readFile(fullPath, 'utf-8');

      // Extract executive summary (between first --- markers)
      const sections = content.split('---');
      const summarySection = sections.length >= 3 ? sections[2].trim() : '';

      // Extract the scorecard table
      const tableMatch = content.match(
        /\| Repo[\s\S]*?\|\n(?:\|[-\s|]*\n)?(?:\|[\s\S]*?\|\n)*/,
      );
      const table = tableMatch ? tableMatch[0].trim() : '';

      const summary = [
        '# Downstream Audit Summary',
        '',
        summarySection,
        '',
        table ? `## Scorecard\n\n${table}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      return { content: [{ type: 'text', text: summary }] };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: 'Audit report not found at docs/downstream-audit.md',
          },
        ],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
