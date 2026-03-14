# Onboarding Guide — Adding a New Downstream Company

> Step-by-step guide for expanding the Syntax Sorcery constellation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Create the Repository](#3-step-1-create-the-repository)
4. [Step 2: Initialize Squad Structure](#4-step-2-initialize-squad-structure)
5. [Step 3: Add Perpetual Motion Workflow](#5-step-3-add-perpetual-motion-workflow)
6. [Step 4: Create the Roadmap](#6-step-4-create-the-roadmap)
7. [Step 5: Register in Constellation](#7-step-5-register-in-constellation)
8. [Step 6: Add CI Pipeline](#8-step-6-add-ci-pipeline)
9. [Step 7: Configure Azure Satellite](#9-step-7-configure-azure-satellite)
10. [Step 8: Activate and Verify](#10-step-8-activate-and-verify)
11. [Post-Onboarding Checklist](#11-post-onboarding-checklist)
12. [Governance Notes](#12-governance-notes)
13. [Related Documentation](#13-related-documentation)

---

## 1. Overview

Adding a new downstream company (or repo) to the Syntax Sorcery constellation involves:

1. Creating the GitHub repository
2. Setting up Squad agent infrastructure
3. Adding perpetual motion automation
4. Registering the repo in SS's constellation
5. Configuring monitoring and satellite execution

**Time estimate:** 30-60 minutes  
**Authority required:** T0 (Founder) — creating new downstream companies is a structural decision

---

## Quick Start — Developer Bootstrap

For new developers, a single command validates all prerequisites, installs dependencies, checks structure health, and runs tests:

```bash
npm run setup
```

Options:

| Flag | Effect |
|------|--------|
| `--skip-tests` | Skip test validation |
| `--skip-health` | Skip constellation health check |
| `--verbose` | Show full command output |

If `gh` CLI is not installed, GitHub-dependent steps are skipped automatically.

---

## 2. Prerequisites

Before starting, ensure you have:

- [ ] GitHub CLI (`gh`) authenticated with `repo` scope
- [ ] Node.js 20+ installed
- [ ] Access to the `jperezdelreal` GitHub account
- [ ] Azure CLI (`az`) if configuring a satellite VM
- [ ] Founder approval (T0 decision) for the new company/repo

---

## 3. Step 1: Create the Repository

```bash
# Create the repo on GitHub
gh repo create jperezdelreal/<repo-name> --public --description "<description>"

# Clone locally
git clone https://github.com/jperezdelreal/<repo-name>.git
cd <repo-name>
```

Initialize with a README:

```bash
echo "# <Repo Name>" > README.md
git add README.md
git commit -m "Initial commit"
git push origin main
```

---

## 4. Step 2: Initialize Squad Structure

Create the `.squad/` directory with minimal required files:

```bash
mkdir -p .squad/agents
mkdir -p .squad/guides
mkdir -p .squad/sessions
```

Create `.squad/config.json`:

```json
{
  "name": "<repo-name>",
  "owner": "jperezdelreal",
  "upstream": "jperezdelreal/Syntax-Sorcery",
  "agents": [],
  "created": "<ISO-8601-date>"
}
```

Create `.squad/decisions.md`:

```markdown
# Squad Decisions

## TLDR

<Brief description of the repo and its purpose.>

## Active Decisions

(No decisions yet)
```

Commit the structure:

```bash
git add .squad/
git commit -m "chore: initialize squad structure"
git push origin main
```

---

## 5. Step 3: Add Perpetual Motion Workflow

Create `.github/workflows/perpetual-motion.yml`:

```yaml
name: Perpetual Motion

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

permissions:
  contents: read
  issues: write

jobs:
  create-issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Find next roadmap item
        id: roadmap
        run: |
          # Parse roadmap.md for the first unchecked item
          ITEM=$(grep -m1 '## [0-9]*\. \[ \]' roadmap.md | sed 's/## [0-9]*\. \[ \] //')
          echo "item=$ITEM" >> $GITHUB_OUTPUT
      - name: Check for duplicates
        if: steps.roadmap.outputs.item != ''
        run: |
          DUPES=$(gh issue list --label squad --search "${{ steps.roadmap.outputs.item }}" --state open --json number --jq length)
          if [ "$DUPES" -gt "0" ]; then
            echo "Duplicate issue found, skipping"
            exit 0
          fi
      - name: Create issue
        if: steps.roadmap.outputs.item != ''
        run: |
          gh issue create \
            --title "${{ steps.roadmap.outputs.item }}" \
            --label "squad" \
            --assignee "@copilot"
```

> **Note:** This is a minimal template. Adapt the roadmap parsing logic to match your repo's roadmap format. Use SS's `scripts/dedup-guard.js` as reference for robust dedup.

---

## 6. Step 4: Create the Roadmap

Create `roadmap.md` with ordered work items:

```markdown
# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

---

## 1. [ ] <First work item>

**Acceptance Criteria:**
- <Criterion 1>
- <Criterion 2>

**Files:**
- `path/to/file.js` (create/update)

**Context:**
<Why this item matters and any hints for @copilot>

---

## 2. [ ] <Second work item>

...
```

**Key rules for roadmap items:**

- Max 3 active items per audit cycle (SS governance constraint)
- Include `## Files` section for review gate compatibility
- Provide enough context for `@copilot` to implement autonomously
- Order by priority (top = next)

---

## 7. Step 5: Register in Constellation

Update SS's constellation registry to include the new repo.

**File:** `Syntax-Sorcery/.squad/constellation.json`

```json
{
  "repos": [
    "jperezdelreal/Syntax-Sorcery",
    "jperezdelreal/FirstFrameStudios",
    "jperezdelreal/flora",
    "jperezdelreal/ComeRosquillas",
    "jperezdelreal/pixel-bounce",
    "jperezdelreal/ffs-squad-monitor",
    "jperezdelreal/<new-repo>"
  ],
  "metadata": {
    "description": "Repository constellation monitored by safety-net workflow",
    "updated": "<today's date>",
    "owner": "jperezdelreal"
  }
}
```

Then update `constellation-health.js` if it hardcodes repo lists (check the script).

Commit in SS:

```bash
cd Syntax-Sorcery
git add .squad/constellation.json
git commit -m "chore: add <new-repo> to constellation"
git push origin master
```

---

## 8. Step 6: Add CI Pipeline

Create `.github/workflows/ci.yml` in the new repo:

```yaml
name: CI

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

If the repo doesn't use npm, adapt to the appropriate test runner. The CI gate is mandatory for autonomous quality control.

---

## 9. Step 7: Configure Azure Satellite

If the repo should run autonomously on the Azure VM, add a satellite session.

### 9.1 Clone the repo on the VM

```bash
ssh ssadmin@<VM_IP>
cd ~/repos
git clone https://github.com/jperezdelreal/<new-repo>.git
```

### 9.2 Update start-satellites.sh

Add the new repo to `scripts/azure/start-satellites.sh` in SS:

```bash
REPOS=(
  "flora"
  "ComeRosquillas"
  "pixel-bounce"
  "ffs-squad-monitor"
  "FirstFrameStudios"
  "<new-repo>"
)
```

### 9.3 Deploy and restart

```bash
# Copy updated script to VM
scp scripts/azure/start-satellites.sh ssadmin@<VM_IP>:~/scripts/azure/

# Restart the satellite service
ssh ssadmin@<VM_IP> "sudo systemctl restart satellites.service"

# Verify
ssh ssadmin@<VM_IP> "tmux list-sessions"
```

---

## 10. Step 8: Activate and Verify

### 10.1 Verify perpetual motion

```bash
# Manually trigger the workflow
gh workflow run perpetual-motion.yml --repo jperezdelreal/<new-repo>

# Check it created an issue
gh issue list --repo jperezdelreal/<new-repo> --label squad
```

### 10.2 Verify constellation health

```bash
# From SS root
npm run check:constellation
```

### 10.3 Verify CI

```bash
# Create a test PR to trigger CI
git checkout -b test/ci-check
echo "test" >> test-ci.md
git add test-ci.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-check
gh pr create --title "test: CI verification" --body "Testing CI pipeline"

# Check workflow status
gh run list --repo jperezdelreal/<new-repo>

# Clean up
gh pr close <pr-number>
git checkout main
git branch -D test/ci-check
```

---

## 11. Post-Onboarding Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Repository created on GitHub | ☐ |
| 2 | `.squad/` structure initialized | ☐ |
| 3 | `perpetual-motion.yml` workflow added | ☐ |
| 4 | `roadmap.md` created with ≤3 items | ☐ |
| 5 | Registered in `.squad/constellation.json` | ☐ |
| 6 | CI pipeline (`ci.yml`) configured | ☐ |
| 7 | Azure satellite session added (if applicable) | ☐ |
| 8 | Perpetual motion manually triggered and verified | ☐ |
| 9 | Constellation health check passes | ☐ |
| 10 | README updated with constellation table (if changed) | ☐ |

---

## 12. Governance Notes

- **T0 Decision Required:** Adding a new downstream company is a T0 (Founder-only) decision. Do not proceed without explicit founder approval.
- **Max 3 Features:** Each downstream repo starts with a maximum of 3 roadmap features per SS governance policy.
- **Monitoring Layer:** Decide which monitoring layer covers the new repo:
  - If it's a game under FFS → add to `ffs-squad-monitor` (Layer 3)
  - If it's a new company → SS Layer 2 monitors directly via `constellation-health.js`
- **Upstream Link:** The new repo's `.squad/config.json` should reference SS as upstream for governance traceability.

---

## 13. Related Documentation

- **[System Architecture](architecture.md)** — full architecture with diagrams
- **[Constellation Map](constellation.md)** — all repos and relationships
- **[Activation Guide](activation-guide.md)** — full system activation walkthrough
- **[Azure Launcher README](../scripts/azure/README.md)** — satellite VM setup details
- **[Review Gate Guide](../.squad/guides/review-gate.md)** — PR validation setup

---

*Document maintained by Oracle (Product & Docs) · Last updated: 2026-03-19*
