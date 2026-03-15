using './main.bicep'

// Syntax Sorcery Test 3 — VM Parameters
// Customize these values for your deployment

// Azure region — North Europe (B-series VM availability)
param location = 'northeurope'

// VM size — B2s_v2: 2 vCPU, 4 GB RAM, ~€25-30/month
// Cost-optimal for running 5 satellite tmux sessions
param vmSize = 'Standard_B2s_v2'

// Admin username for SSH access
param adminUsername = 'ssadmin'

// SSH public key — read from file at deploy time
// Override via CLI: --parameters sshPublicKey="$(cat ~/.ssh/id_rsa.pub)"
param sshPublicKey = readEnvironmentVariable('SSH_PUBLIC_KEY', '')

// GitHub Personal Access Token — read from environment variable at deploy time
// Override via CLI: --parameters githubToken="ghp_..."
// Leave empty to skip token injection (can be configured manually later)
param githubToken = readEnvironmentVariable('GITHUB_TOKEN', '')

// Environment tag
param environment = 'prod'
