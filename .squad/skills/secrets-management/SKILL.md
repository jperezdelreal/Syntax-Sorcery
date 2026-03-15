# SKILL: Secrets Management for Cloud Infrastructure

## Purpose

Securely inject secrets (API tokens, passwords, keys) into cloud VMs without hardcoding, using cloud-init, secure parameters, and multi-layer environment configuration.

## When to Use

- Deploying VMs that need API tokens (GitHub PAT, Azure credentials, API keys)
- Configuring authentication for automated agents
- Setting up environment variables for sensitive data
- Infrastructure-as-Code deployments requiring secrets

## Pattern

### 1. Secure Storage (Local Development)

```bash
# Store in gitignored directory with restricted permissions
mkdir -p .squad/secrets
echo "secret_value_here" > .squad/secrets/secret-name
chmod 600 .squad/secrets/secret-name

# Add to .gitignore
echo ".squad/secrets/" >> .gitignore
```

### 2. Bicep Parameter (Infrastructure)

```bicep
@description('Secret value for injection (optional)')
@secure()
param secretName string = ''

// Use in cloud-init or other resources
var cloudInitScript = '''
write_files:
  - path: /etc/profile.d/secret.sh
    permissions: '0644'
    content: |
      export SECRET_NAME="{0}"
'''

resource vm 'Microsoft.Compute/virtualMachines@2024-07-01' = {
  properties: {
    osProfile: {
      customData: base64(format(cloudInitScript, secretName))
    }
  }
}
```

**Key points:**
- Use `@secure()` decorator — prevents logging in deployment output
- Default to empty string — allows deployment without secret
- Secrets in cloud-init YAML are base64-encoded automatically by Azure

### 3. Parameter File (Injection)

```bicep
// main.bicepparam
param secretName = readEnvironmentVariable('SECRET_NAME', '')
```

### 4. Deployment Workflow

```bash
# Read secret from secure storage
export SECRET_NAME=$(cat .squad/secrets/secret-name)

# Deploy with secret injected
./deploy.sh deploy

# Secret is now available on VM via $SECRET_NAME
```

### 5. Multi-Layer Environment Setup

Set secret in multiple locations for redundancy:

```yaml
# cloud-init write_files
write_files:
  # System-wide (all users, all shells)
  - path: /etc/profile.d/secret.sh
    permissions: '0644'
    content: |
      export SECRET_NAME="secret_value"
  
  # User-specific setup script
  - path: /home/user/.config/setup-secret.sh
    permissions: '0700'
    owner: 'user:user'
    content: |
      #!/bin/bash
      # Add to ~/.bashrc if not present
      if ! grep -q "export SECRET_NAME=" ~/.bashrc; then
        echo 'export SECRET_NAME="secret_value"' >> ~/.bashrc
      fi

runcmd:
  - su - user -c '/home/user/.config/setup-secret.sh'
```

**Why multiple locations?**
- `/etc/profile.d/` — Works for interactive SSH sessions
- `~/.bashrc` — Works for non-login shells
- Tool-specific config — Works for specific CLIs (e.g., `~/.config/gh/hosts.yml`)

### 6. Verification Script

Create a script to validate secret configuration:

```bash
#!/bin/bash
# verify-secret.sh

set -euo pipefail

# Check environment variable
if [ -z "${SECRET_NAME:-}" ]; then
  echo "❌ SECRET_NAME not set"
  exit 1
fi

# Validate format (example: token must start with specific prefix)
if [[ ! "$SECRET_NAME" =~ ^expected_prefix_ ]]; then
  echo "❌ Invalid secret format"
  exit 1
fi

# Test functionality (example: authenticate with API)
if some_command --auth "$SECRET_NAME"; then
  echo "✅ Secret valid and functional"
  exit 0
else
  echo "❌ Secret authentication failed"
  exit 1
fi
```

### 7. Post-Deployment Configuration Script

Provide manual setup as fallback:

```bash
#!/bin/bash
# setup-secret.sh

set -euo pipefail

# Accept secret via multiple methods
SECRET=""
if [ $# -eq 1 ]; then
  SECRET="$1"
elif [ ! -t 0 ]; then
  SECRET=$(cat)  # stdin
elif [ -n "${SECRET_NAME:-}" ]; then
  SECRET="$SECRET_NAME"  # environment
else
  echo "Usage: ./setup-secret.sh <secret>"
  echo "   OR: echo '<secret>' | ./setup-secret.sh"
  echo "   OR: SECRET_NAME='<secret>' ./setup-secret.sh"
  exit 1
fi

# Validate format
if [[ ! "$SECRET" =~ ^expected_format$ ]]; then
  echo "❌ Invalid secret format"
  exit 1
fi

# Configure system-wide
echo "export SECRET_NAME=$SECRET" | sudo tee /etc/environment > /dev/null

# Configure user-specific
echo "export SECRET_NAME=$SECRET" >> ~/.bashrc

# Configure tool-specific (example: gh CLI)
some_command auth login --with-token <<< "$SECRET"

echo "✅ Secret configured successfully"
```

## Anti-Patterns

❌ **DON'T hardcode secrets in code:**
```bicep
param apiToken string = 'ghp_hardcoded_token_here'  // NEVER DO THIS
```

❌ **DON'T log secrets:**
```bash
echo "Token: $SECRET_NAME"  // Will appear in logs
```

❌ **DON'T commit secrets:**
```bash
git add .env  // If .env contains secrets
```

❌ **DON'T use world-readable permissions:**
```bash
chmod 644 .squad/secrets/token  // Others can read
```

## Cost Implications

### Free (This Pattern)
- Cloud-init injection: No cost
- Environment variables: No cost
- Bicep secure parameters: No cost

### Paid (Alternatives)
- **Azure Key Vault**: ~€0.03/10k operations + €0.025/secret/month
  - Use when: Multiple VMs need same secret, secret rotation automation
  - Budget: ~€1-5/month for typical usage
  
- **GitHub Secrets**: Free for GitHub Actions
  - Use when: Secret only needed in CI/CD workflows
  - Limitation: Not accessible from SSH sessions

## Security Checklist

- [ ] Secret stored in gitignored directory
- [ ] File permissions set to `chmod 600`
- [ ] Bicep parameter marked `@secure()`
- [ ] Secret NOT logged in deployment output
- [ ] Secret NOT committed to git
- [ ] Verification script created
- [ ] Manual setup fallback documented
- [ ] Rotation procedure documented
- [ ] Monitoring/audit logging enabled

## Example: GitHub PAT Injection

See Issue #125, PR #140 for complete implementation:

```bash
# 1. Store locally
mkdir -p .squad/secrets
echo "ghp_..." > .squad/secrets/github-token
chmod 600 .squad/secrets/github-token

# 2. Deploy with injection
export GITHUB_TOKEN=$(cat .squad/secrets/github-token)
cd scripts/azure
./deploy.sh deploy

# 3. Verify on VM
ssh ssadmin@<VM_IP>
gh auth status  # Should be authenticated
```

## Files

- `.squad/secrets/` — Local storage (gitignored, chmod 600)
- `scripts/setup-{secret}.sh` — Manual configuration script
- `scripts/verify-{secret}.sh` — Validation script
- `docs/MANUAL-{SECRET}-SETUP.md` — Human instructions
- `main.bicep` — Secure parameter definition
- `main.bicepparam` — Environment variable injection

## References

- Issue #125: GitHub Token Provisioning
- PR #140: Implementation example
- [Azure Bicep secure parameters](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters#secure-parameters)
- [Cloud-init write_files](https://cloudinit.readthedocs.io/en/latest/reference/modules.html#write-files)
- [Azure Key Vault pricing](https://azure.microsoft.com/pricing/details/key-vault/)

## Related Skills

- `cost-alerting` — Monitor Azure spending
- `ralph-hardening` — Secure automation patterns
- `engineering-craft` — Production-ready infrastructure
