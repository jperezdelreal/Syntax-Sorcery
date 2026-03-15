// main.bicep — Syntax Sorcery Test 3 VM Infrastructure
// Deploys: B2s_v2 Ubuntu 24.04 VM with SSH-only NSG, public IP, managed identity
// Budget: ~€25-30/month | Region: North Europe
// Cloud-init installs: tmux, git, Node.js 20, gh CLI, clones 5 downstream repos

@description('Azure region for all resources')
param location string = 'northeurope'

@description('VM size — B2s_v2 is the cost-optimal choice (~€25-30/mo)')
param vmSize string = 'Standard_B2s_v2'

@description('Admin username for SSH access')
param adminUsername string = 'ssadmin'

@description('SSH public key for admin user authentication')
@secure()
param sshPublicKey string

@description('Environment tag (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('GitHub Personal Access Token for autonomous operations (optional)')
@secure()
param githubToken string = ''

// Resource naming
var prefix = 'ss-satellite'
var vmName = '${prefix}-vm'
var nsgName = '${prefix}-nsg'
var vnetName = '${prefix}-vnet'
var subnetName = '${prefix}-subnet'
var publicIpName = '${prefix}-pip'
var nicName = '${prefix}-nic'
var identityName = '${prefix}-identity'

// Standard tags for all resources
var tags = {
  project: 'syntax-sorcery'
  environment: environment
  'managed-by': 'bicep'
}

// Cloud-init script: installs dependencies and clones all 5 downstream repos
// If githubToken is provided, it's injected as GH_TOKEN environment variable
var cloudInitScript = '''
#cloud-config
package_update: true
package_upgrade: false

apt:
  sources:
    github-cli:
      source: "deb [arch=amd64 signed-by=$KEY_FILE] https://cli.github.com/packages stable main"
      keyid: "23F3D4EA75716059"

packages:
  - tmux
  - git
  - curl
  - jq
  - gh

write_files:
  - path: /etc/profile.d/github-token.sh
    permissions: '0644'
    content: |
      # GitHub Personal Access Token for autonomous operations
      # Injected via cloud-init during VM provisioning
      export GH_TOKEN="{1}"
  - path: /home/{0}/.config/gh/setup-token.sh
    permissions: '0700'
    owner: '{0}:{0}'
    content: |
      #!/bin/bash
      # Auto-configure gh auth if GH_TOKEN is set
      if [ -n "$GH_TOKEN" ] && [ "$GH_TOKEN" != "" ]; then
        echo "$GH_TOKEN" | gh auth login --with-token 2>/dev/null
      fi

runcmd:
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs
  - mkdir -p /home/{0}/repos
  - cd /home/{0}/repos
  - for repo in flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios; do git clone "https://github.com/jperezdelreal/$repo.git" || true; done
  - chown -R {0}:{0} /home/{0}/repos
  - mkdir -p /home/{0}/.config/gh
  - chown -R {0}:{0} /home/{0}/.config
  - su - {0} -c '/home/{0}/.config/gh/setup-token.sh' || true

final_message: "Syntax Sorcery satellite VM ready after $UPTIME seconds"
'''

// Network Security Group — SSH only (port 22)
resource nsg 'Microsoft.Network/networkSecurityGroups@2024-05-01' = {
  name: nsgName
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowSSH'
        properties: {
          priority: 1000
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '22'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      {
        name: 'DenyAllInbound'
        properties: {
          priority: 4096
          direction: 'Inbound'
          access: 'Deny'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: subnetName
        properties: {
          addressPrefix: '10.0.1.0/24'
          networkSecurityGroup: {
            id: nsg.id
          }
        }
      }
    ]
  }
}

// Public IP
resource publicIp 'Microsoft.Network/publicIPAddresses@2024-05-01' = {
  name: publicIpName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
  }
}

// Network Interface
resource nic 'Microsoft.Network/networkInterfaces@2024-05-01' = {
  name: nicName
  location: location
  tags: tags
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          subnet: {
            id: vnet.properties.subnets[0].id
          }
          publicIPAddress: {
            id: publicIp.id
          }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}

// User-assigned managed identity
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

// Virtual Machine — B2s_v2, Ubuntu 24.04 LTS
resource vm 'Microsoft.Compute/virtualMachines@2024-07-01' = {
  name: vmName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
      customData: base64(format(cloudInitScript, adminUsername, githubToken))
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: 'ubuntu-24_04-lts'
        sku: 'server'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        managedDisk: {
          storageAccountType: 'Standard_LRS'
        }
        diskSizeGB: 30
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: nic.id
          properties: {
            primary: true
          }
        }
      ]
    }
  }
}

// Outputs
@description('Public IP address of the VM')
output vmPublicIp string = publicIp.properties.ipAddress

@description('SSH command to connect to the VM')
output sshCommand string = 'ssh ${adminUsername}@${publicIp.properties.ipAddress}'

@description('VM resource ID')
output vmResourceId string = vm.id

@description('Managed Identity resource ID')
output managedIdentityId string = managedIdentity.id

@description('Managed Identity principal ID')
output managedIdentityPrincipalId string = managedIdentity.properties.principalId

@description('NSG resource ID')
output nsgResourceId string = nsg.id

@description('Public IP resource ID')
output publicIpResourceId string = publicIp.id
