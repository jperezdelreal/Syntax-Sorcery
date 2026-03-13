# CI Checks Guide

## What Runs

The `.github/workflows/ci.yml` workflow runs on every **pull request** and **push** to `master`/`main`. It performs two checks:

| Step | Command | Purpose |
|------|---------|---------|
| Install dependencies | `npm ci` | Validates `package-lock.json` is in sync and installs cleanly |
| Run tests | `npm test` | Executes `vitest run` — all tests in `scripts/__tests__/` |

**What does NOT run:** Linting is not included because ESLint is not configured in this project. If ESLint is added in the future, add a lint step (see below).

## How to Add New Checks

### Add a lint step

1. Install ESLint: `npm install --save-dev eslint`
2. Create config: `npx eslint --init`
3. Add script to `package.json`:
   ```json
   "scripts": {
     "lint": "eslint scripts/ site/"
   }
   ```
4. Add step to `ci.yml` after "Install dependencies":
   ```yaml
   - name: Lint
     run: npm run lint
   ```

### Add a build step

If a build process is introduced:

1. Add a `build` script to `package.json`
2. Add step to `ci.yml`:
   ```yaml
   - name: Build
     run: npm run build
   ```

### Add another test suite

1. Create test files matching the vitest config pattern (`scripts/__tests__/**/*.test.js`)
2. They will be picked up automatically by `npm test`

## Branch Protection

To require CI to pass before merging PRs, configure branch protection on `master`:

1. Go to **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `master`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Search for and add: **Build & Test**
   - ✅ Require branches to be up to date before merging
4. Save changes

> **Note:** Branch protection requires admin access to the repository.

Alternatively, use the GitHub CLI:

```bash
gh api repos/{owner}/{repo}/branches/master/protection \
  --method PUT \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Build & Test"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null
}
EOF
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm ci` fails | Run `npm install` locally and commit the updated `package-lock.json` |
| Tests fail in CI but pass locally | Check Node.js version matches (CI uses Node 20) |
| New test file not picked up | Ensure it matches `scripts/__tests__/**/*.test.js` pattern |
