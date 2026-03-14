# Squad MCP Server

MCP (Model Context Protocol) server for the Syntax Sorcery Squad system. Exposes squad state and operations as tools for AI assistants via stdio transport.

## Quick Start

```bash
cd mcp-server
npm install
npm run build
npm start
```

## Configuration

Add to your MCP client config (e.g. `.copilot/mcp-config.json`):

```json
{
  "mcpServers": {
    "squad": {
      "command": "node",
      "args": ["<path-to-repo>/mcp-server/dist/index.js"]
    }
  }
}
```

## Tools

### Read Operations

| Tool | Description | Parameters |
|------|-------------|------------|
| `squad_status` | Get team roster, roles, and current status | — |
| `squad_decisions` | Get recent decisions (architecture, governance) | — |
| `squad_metrics` | Run metrics engine, return KPI data as JSON | — |
| `squad_history` | Read a specific agent's history file | `agent` (string) |
| `squad_issues` | List open GitHub issues | `label` (optional string) |

### Write Operations

| Tool | Description | Parameters |
|------|-------------|------------|
| `squad_create_issue` | Create a GitHub issue | `title`, `body`, `labels` (optional) |
| `squad_close_issue` | Close a GitHub issue | `issue_number`, `reason` (optional) |
| `squad_health_check` | Constellation health — open issues & PRs per repo | — |
| `squad_list_sessions` | List tmux sessions or report OS | — |
| `squad_record_decision` | Write a decision to `.squad/decisions/inbox/` | `title`, `body`, `tier`, `author` |
| `squad_audit_report` | Read downstream audit report summary | — |

## Architecture

- **Transport:** Stdio (local use)
- **SDK:** `@modelcontextprotocol/sdk` v1.27.x
- **Runtime:** Node.js (ESM)
- **External deps:** `gh` CLI for GitHub operations

## Development

```bash
# Edit src/index.ts
npm run build    # Compile TypeScript
npm start        # Run server
```
