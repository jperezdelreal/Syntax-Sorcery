# GitHub Token Provisioning — Manual Steps

This document describes the **manual steps** required by the human user (jperezdelreal) to create and secure the GitHub Personal Access Token (PAT) for autonomous operations.

## Overview

Test 3 requires a GitHub PAT with `repo` scope to enable Ralph and constellation agents to work autonomously on satellite repositories. The infrastructure automation handles token injection and configuration, but token creation must be done manually through GitHub settings.

## Prerequisites

- GitHub account: jperezdelreal
- Access to GitHub Settings → Developer settings
- `.squad/secrets/` directory (created automatically, gitignored)

## Step 1: Create GitHub Personal Access Token

### Option A: Classic Token (Recommended for Test 3)

1. **Navigate to GitHub Settings**
   - Go to: https://github.com/settings/tokens
   - Click: "Generate new token" → "Generate new token (classic)"

2. **Configure Token**
   - **Note**: `Syntax Sorcery Test 3 - Autonomous Operations`
   - **Expiration**: 
     - For Test 3: Choose "No expiration" OR "1 year"
     - Set calendar reminder 11 months out if using expiration
   - **Scopes**: Select the following:
     - ✅ `repo` (Full control of private repositories)
       - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
     - ⚠️ **Do NOT select other scopes unless specifically needed**

3. **Generate and Copy Token**
   - Click "Generate token"
   - **CRITICAL**: Copy the token immediately (starts with `ghp_`)
   - You will not be able to see it again

### Option B: Fine-Grained Token (Advanced)

1. **Navigate to Fine-Grained Tokens**
   - Go to: https://github.com/settings/tokens?type=beta
   - Click: "Generate new token"

2. **Configure Token**
   - **Token name**: `Syntax Sorcery Test 3 - Autonomous Operations`
   - **Expiration**: No expiration OR 1 year
   - **Repository access**: 
     - Select "All repositories" (for jperezdelreal account)
   - **Permissions**:
     - Repository permissions:
       - ✅ Contents: Read and write
       - ✅ Issues: Read and write
       - ✅ Pull requests: Read and write
       - ✅ Metadata: Read-only (automatically selected)
       - ✅ Workflows: Read and write (for GitHub Actions)

3. **Generate and Copy Token**
   - Click "Generate token"
   - **CRITICAL**: Copy the token (starts with `github_pat_`)

## Step 2: Store Token Securely (Local Machine)

```bash
# Create secrets directory (already gitignored)
mkdir -p .squad/secrets

# Store token in file with restricted permissions
echo "ghp_YOUR_TOKEN_HERE" > .squad/secrets/github-token
chmod 600 .squad/secrets/github-token

# Verify file is gitignored
git status  # Should NOT show .squad/secrets/
```

## Step 3: Inject Token into Azure VM

### Method A: Deploy with Token (Recommended)

Deploy the VM with the token injected via cloud-init:

```bash
# Set token in environment
export GITHUB_TOKEN=$(cat .squad/secrets/github-token)

# Deploy VM with token
cd scripts/azure
./deploy.sh deploy
```

The token will be:
- Injected via cloud-init
- Set as `GH_TOKEN` environment variable system-wide
- Automatically configured with `gh auth login`

### Method B: Configure Token Post-Deployment

If VM is already deployed, configure token manually:

```bash
# SSH into VM
ssh ssadmin@<VM_PUBLIC_IP>

# Run setup script
./scripts/setup-github-token.sh ghp_YOUR_TOKEN_HERE

# Or pipe from stdin
echo "ghp_YOUR_TOKEN_HERE" | ./scripts/setup-github-token.sh

# Or use environment variable
GH_TOKEN="ghp_YOUR_TOKEN_HERE" ./scripts/setup-github-token.sh
```

## Step 4: Verify Token

On the Azure VM, verify token configuration:

```bash
# Check authentication status
gh auth status

# Comprehensive verification
./scripts/verify-github-token.sh
```

Expected output:
```
✅ GitHub CLI is authenticated
✅ 'repo' scope present (full repository access)
✅ Push (write) access confirmed
✅ Token verification complete
```

## Security Considerations

### Token Storage Locations

After setup, the token will be stored in:
- **Local machine**: `.squad/secrets/github-token` (chmod 600, gitignored)
- **Azure VM**: 
  - `/etc/profile.d/github-token.sh` (exported as GH_TOKEN)
  - `~/.config/gh/hosts.yml` (gh CLI config)
  - `~/.bashrc` (user environment)

### Token Capabilities

The `repo` scope grants:
- ✅ Read/write access to all code
- ✅ Create/edit/close issues
- ✅ Create/merge/close pull requests
- ✅ Manage deployments
- ✅ Trigger GitHub Actions workflows

**This is necessary for autonomous operations but should be treated as highly sensitive.**

### Access Restrictions

⚠️ **GitHub does NOT support IP-based token restrictions for Personal Access Tokens**

Mitigation strategies:
1. **Monitor token usage**: Check https://github.com/settings/security-log regularly
2. **Rotate immediately if compromised**
3. **Use fine-grained tokens** (if possible) for better permission control
4. **Limit token to specific repositories** (fine-grained only)

### Rotation Plan

If token has expiration:
1. Set calendar reminder 11 months out
2. Generate new token before expiration
3. Update on both local machine and Azure VM:
   ```bash
   # Local machine
   echo "ghp_NEW_TOKEN" > .squad/secrets/github-token
   
   # Azure VM
   ssh ssadmin@<VM_IP> "./scripts/setup-github-token.sh ghp_NEW_TOKEN"
   ```

If token is compromised:
1. **Immediately revoke** at https://github.com/settings/tokens
2. Generate new token (follow Step 1)
3. Update all locations (follow Step 2-3)
4. Review GitHub security logs for unauthorized activity

## Verification Checklist

- [ ] Token created with `repo` scope
- [ ] Token copied and stored in `.squad/secrets/github-token`
- [ ] File permissions set to `chmod 600`
- [ ] `.squad/secrets/` confirmed in `.gitignore`
- [ ] Token injected into Azure VM (via cloud-init or manual setup)
- [ ] `gh auth status` succeeds on VM
- [ ] `./scripts/verify-github-token.sh` passes all checks
- [ ] Token expiration reminder set (if applicable)
- [ ] Security monitoring enabled (GitHub security log)

## Troubleshooting

### "Token invalid" error

```bash
# Verify token format
cat .squad/secrets/github-token  # Should start with ghp_ or github_pat_

# Test token directly
curl -H "Authorization: token $(cat .squad/secrets/github-token)" https://api.github.com/user
```

### "Permission denied" on repository operations

```bash
# Check token scopes
./scripts/verify-github-token.sh

# Verify 'repo' scope is present
# If missing, create new token with correct scopes
```

### Token not available in tmux sessions

```bash
# Update all tmux sessions
tmux setenv -g GH_TOKEN "$(cat .squad/secrets/github-token)"

# Or re-run setup script
./scripts/setup-github-token.sh "$(cat .squad/secrets/github-token)"
```

## Next Steps

After completing these manual steps:
1. Run infrastructure validation: `./scripts/verify-deployment.sh`
2. Proceed to Phase 10.4: Dry-run validation (Issue #115)
3. Begin Test 3 autonomous operations

## References

- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Fine-Grained Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)
- [Token Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
