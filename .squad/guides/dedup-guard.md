# Dedup Guard — Preventing Duplicate Planning Issues

## Purpose

The perpetual-motion workflow creates "Define next roadmap" issues when all roadmap items close. If multiple issues close in quick succession, the workflow can fire multiple times before the first new issue is created — resulting in duplicate planning issues.

`scripts/dedup-guard.js` is a lightweight pre-check that queries GitHub for existing open issues matching the planning issue pattern before creating a new one.

## How It Works

1. Queries `gh issue list` for open issues with label `squad` and title containing "roadmap"
2. If a match is found: logs the existing issue number and exits cleanly (code 0)
3. If no match: logs "safe to create" and exits cleanly (code 0)
4. On API error: exits with code 1

## Usage

### CLI

```bash
# Uses current repo context from gh CLI
npm run dedup:check

# Explicit owner/repo
node scripts/dedup-guard.js --owner jperezdelreal --repo Syntax-Sorcery
```

### In Perpetual-Motion Workflows

Add the dedup check as a step **before** the issue creation step in your workflow:

```yaml
- name: Check for existing planning issue
  id: dedup
  run: node scripts/dedup-guard.js --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}

- name: Create planning issue
  if: steps.dedup.outputs.duplicate != 'true'
  run: |
    gh issue create --title "Define next roadmap cycle" --label squad ...
```

Alternatively, capture the script output and parse it:

```yaml
- name: Check for duplicate
  id: dedup
  run: |
    OUTPUT=$(node scripts/dedup-guard.js)
    echo "$OUTPUT"
    if echo "$OUTPUT" | grep -q "skipping"; then
      echo "skip=true" >> $GITHUB_OUTPUT
    fi

- name: Create issue
  if: steps.dedup.outputs.skip != 'true'
  run: gh issue create ...
```

### Programmatic (Node.js)

```js
const { run } = require('./scripts/dedup-guard');

const result = run(['node', 'script.js', '--owner', 'alice', '--repo', 'my-repo']);
// result = { exitCode: 0, duplicate: true, issueNumber: 42 }
```

## Testing

```bash
npm test -- scripts/__tests__/dedup-guard.test.js
```

Tests mock `execSync` / `gh CLI` calls — no network access required. Covers:

- Duplicate exists → skip
- No duplicate → safe to create
- API error → exitCode 1
- Argument parsing (`--owner`, `--repo`)

## Dependencies

- **gh CLI** — must be installed and authenticated with `repo` scope
- **Node.js** — CommonJS, no external dependencies
