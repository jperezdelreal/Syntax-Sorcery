# Phase 14: Scaling & High Availability — Azure Only

**Issue:** #116  
**Status:** Feasibility Spec  
**Date:** 2026-03-24  
**Researcher:** Oracle (Product & Docs)  
**Tier:** Global Operations — scales Syntax Sorcery to 50+ satellites within Azure ecosystem

---

## TLDR

Phase 14 scales Syntax Sorcery from single-region (hub + 1 satellite) to **global multi-region operations on Azure only**. Three initiatives: (1) **Multi-Region Architecture** — Bicep-based deployment templates, Azure Traffic Manager failover, cost optimization via Reserved Instances; (2) **AKS Constellation** — Kubernetes orchestration on Azure Kubernetes Service (AKS) with KEDA auto-scaling to run 50+ satellites; (3) **Global Deployment** — multi-region replication via Cosmos DB + Managed Identities, regional compliance via Azure Policy. Maintains €500/mo budget by rightsizing compute, using Spot VMs, and limiting regions to 3-4 strategic hubs. **AWS and Google Cloud VETOED** by founder directive—Azure-only lock.

**Why now?** Phase 13 proves community governance sustainable. Phase 14 enables Syntax Sorcery to serve global teams (EMEA, APAC, Americas) from Azure regions, removing latency penalty for non-US users and creating resilience via geographic redundancy.

**Azure budget impact:** Current baseline €240/mo (Phase 13). Phase 14 adds €200-250/mo (AKS, multi-region replication, Traffic Manager), **totaling €440-490/mo** (88-98% utilization). **No additional headroom for Phase 15**—hard stop at €500/mo ceiling.

---

## 1. Problem Statement

### Current State (End of Phase 13)

- ✅ **Community foundation established:** RFC process, contributor marketplace, open-source governance shipped
- ✅ **Single-region proven:** Hub (Europe Central) + 1 satellite (FFS) running 24/7, 629+ tests passing
- ✅ **Autonomy at scale:** 50+ constellation repos manageable with current tooling (GitHub Issues, Squad agents)
- ❌ **Geographic latency:** US/APAC teams experience 150-300ms API response time to European hub
- ❌ **Single point of failure:** Hub outage breaks all 50+ satellite operations globally
- ❌ **Compliance fragmented:** GDPR enforcement in EU, but no regional data residency for US/APAC
- ❌ **Cost scaling unbounded:** Each satellite adds ~€5/mo (VM + storage); 50 satellites = €250/mo just for compute

### Constraints & Opportunities

**Problem 1: Geographic Latency & User Experience**
- Squad agents in US/APAC regions experience 150-300ms latency to European hub
- Slow decision-making = slower feature delivery for downstream companies
- **Opportunity:** Deploy regional hubs in US East, Asia Pacific (3-4 Azure regions), eliminate latency, improve UX

**Problem 2: Resilience & Disaster Recovery**
- Single hub failure = all 50+ satellites go dark (no agent decision-making possible)
- Current runbooks require manual failover (30+ minutes recovery time, unacceptable for 24/7 autonomous operation)
- **Opportunity:** Multi-region failover via Azure Traffic Manager, automatic detection + reroute (<5s), RTO <5min

**Problem 3: Compliance & Data Residency**
- GDPR requires EU data in EU; CCPA requires CA data in US-West
- FFS satellite (if in US) cannot store EU customer data on European VMs
- **Opportunity:** Regional compliance via Azure Policy (enforce region-specific VMs), Cosmos DB multi-region with compliance bounds

**Problem 4: Cost Scaling Cliff**
- Current: 2 VMs (hub + FFS) @ €120/mo
- Naive scaling: +1 VM per satellite = €5/mo each = €250+ for 50 satellites = €370/mo total (way over €500)
- **Opportunity:** AKS consolidation (many satellites per Kubernetes cluster), Spot VMs (60% discount), Reserved Instances (30% discount), reduce to €250/mo for 50 satellites

**Problem 5: Operational Complexity**
- Bicep templates not parameterized for multi-region (manual tweaks per region)
- Monitoring/alerting scattered across Azure Portal (no aggregated view)
- Deployment pipeline not battle-tested for multi-region failover
- **Opportunity:** Parameterized Bicep, Azure Monitor for global observability, chaos engineering to validate failover

### Phase 14 Goals

1. **Enable global scale** — serve US, EU, APAC teams from regional hubs without performance penalty
2. **Ensure resilience** — multi-region failover + automatic failover, zero-downtime updates
3. **Maintain budget** — scale to 50+ satellites without exceeding €500/mo ceiling
4. **Lock Azure forever** — document why multi-cloud is off the table (cost, complexity, lock-in risk)

---

## 2. Scope Boundaries

### IN SCOPE (Phase 14 Deliverables)

#### 2.1 Multi-Region Architecture via Bicep (Issue #46)

**Deliverables:**

- **Parameterized Bicep templates** for multi-region infrastructure
  - Hub template (EU Central, US East, Asia Pacific variants)
  - Satellite template (regional deployment, auto-register to hub)
  - Networking: VNet peering, Private Link for inter-region communication
  - Load balancing: Azure Load Balancer (internal), Azure Front Door (external)
  - ~1500 lines Bicep, modular parameters for region customization

- **Cost Optimization Model** (decision document)
  - Reserved Instance pricing for hub VMs (30% discount on 1-year commitment)
  - Spot VM strategy for satellite auto-scaling (60% discount, <1% eviction SLA)
  - Blob storage tiering (hot/cool/archive) for multi-region replicas
  - CDN cost estimation (Azure Front Door)
  - Savings plan recommendations (reserved capacity for Cosmos DB)
  - **Target:** 50 satellites within €500/mo ceiling (breakdown: €120 hub + €30 Cosmos DB + €150 AKS + €50 Traffic Manager + €50 storage/CDN)

- **Azure Traffic Manager failover** (runbook)
  - Monitoring endpoint health (hub response time < 500ms)
  - Geographic routing (US traffic → US East, EU → EU Central, APAC → SE Asia)
  - Automatic failover detection (5s health check interval)
  - RTO < 5 min (measured in chaos engineering tests)

- **Azure Policy enforcement** (compliance as code)
  - Enforce resource location (EU resources stay in EU, no cross-border creep)
  - Enforce encryption at rest (TLS 1.2+)
  - Enforce managed identity (no secrets in config)
  - Policy audit + remediation (auto-enforce on new deployments)

**Acceptance Criteria:**
- Bicep templates deploy hub + 3 satellites in <10 minutes
- Cost modeling spreadsheet (CSV export) shows per-satellite cost breakdown
- Traffic Manager health checks run every 5s, tested with chaos experiments
- Azure Policy enforces 5+ compliance rules (tested with policy audits)
- Failover tested in chaos engineering (manual hub shutdown → automatic reroute → healthy in <5min)
- Documentation: architecture diagram (hub + 3 regions), cost justification, compliance matrix

#### 2.2 AKS Constellation with KEDA Auto-Scaling (Issue #47)

**Deliverables:**

- **AKS cluster setup** (per region)
  - 3 node pools: system (3x Standard_B2s for control plane), compute (auto-scale 0-50 nodes), spot (auto-scale 0-100 spot nodes)
  - Network: Azure CNI (advanced networking), network policies enabled (security)
  - Ingress: NGINX ingress controller (or Application Gateway), TLS termination
  - ~400 lines Bicep, auto-remediation enabled

- **Satellite-to-AKS deployment automation** (GitHub Actions workflow)
  - Detect satellite repo creation (webhook on GitHub)
  - Generate Docker image (multi-stage build, ~200MB, includes Node.js runtime + Squad agent)
  - Push to Azure Container Registry
  - Deploy to AKS cluster in designated region via Helm
  - Register satellite with hub (API call, update CODEOWNERS)
  - ~150 lines GitHub Actions YAML

- **KEDA auto-scaling rules** (per satellite deployment)
  - Trigger 1: GitHub issue count in satellite > 10 → scale up 1 pod
  - Trigger 2: HTTP request rate > 100 req/min → scale up 1 pod
  - Trigger 3: CPU > 70% → scale up 1 pod (native Kubernetes HPA)
  - Scale down: no activity for 30min → remove pod
  - Min replicas: 1 (always-on), max replicas: 5 per satellite
  - ~50 lines YAML per satellite

- **Hub orchestration service** (Node.js service on AKS)
  - Tracks satellite health (polls each satellite API every 30s)
  - Coordinates work distribution (assigns issues to least-busy satellite)
  - Metrics aggregation (satellite throughput, error rates, uptime)
  - ~500 lines Node.js, deployed as Kubernetes StatefulSet

**Acceptance Criteria:**
- AKS cluster deploys in <15 minutes (Bicep automated)
- 10+ satellite repos successfully deployed to AKS
- Auto-scaling tested: issue spike (20 new issues) triggers pod scale-up within 2 minutes
- KEDA rules enforced (issue count threshold triggers scale-up, tested with load generation)
- Hub orchestration service reports all satellites healthy (green light on dashboard)
- Chaos engineering: kill pod → auto-restart within 10s, verified
- Cost baseline: 10 satellites on AKS = €80-100/mo (vs €50/mo on VMs, but with auto-scaling saves net €20-40/mo at scale)

#### 2.3 Global Deployment & Multi-Region Replication (Issue #48)

**Deliverables:**

- **Cosmos DB multi-region setup** (with global replication)
  - Replicate write regions: EU Central (primary), US East (secondary), Asia Pacific (tertiary)
  - Conflict resolution: last-write-wins (for satellite registries, acceptable)
  - Read latency: <10ms local, <50ms cross-region
  - Failover: if EU Central unavailable, US East becomes writable (RTO <30s)
  - ~50 lines Bicep

- **Azure Storage geo-redundancy** (for artifact/log archival)
  - GRS (Geo-Redundant Storage) for satellite artifacts (auto-replicate to secondary region)
  - Read-access GRS (RA-GRS): allow reads from secondary if primary down
  - Retention: 90 days hot, 2 years cool (archive old logs)
  - ~30 lines Bicep

- **Managed Identity federation** (cross-region authentication)
  - Hub authenticates to US/APAC satellites via Azure AD (no shared credentials)
  - Satellites authenticate to Cosmos DB via Managed Identity (scoped to region)
  - Traffic Manager endpoint: regional hub SPN, scoped access
  - ~100 lines Bicep (role assignments)

- **Compliance & audit logging** (per-region compliance)
  - GDPR: EU data audit log (who accessed, when) stored in EU-Central only
  - CCPA: US data audit log stored in US-East only
  - ISO 27001: encryption key escrow (Azure Key Vault, region-locked)
  - Compliance status dashboard (Excel or JSON, summarizes per-region posture)
  - ~50 lines Azure Policy definitions

- **Replication testing runbook** (chaos engineering playbook)
  - Simulate EU-Central outage (kill primary hub VM) → verify failover to US-East → measure RTO
  - Simulate network partition (block Cosmos DB replication) → verify eventual consistency
  - Simulate region failure (unplug APAC AKS cluster) → verify no data loss
  - Automation: GitHub Actions workflow runs chaos tests daily
  - Results: published dashboard (pass/fail per test, RTO metrics)

**Acceptance Criteria:**
- Cosmos DB replication active (write to EU Central, reads from all 3 regions)
- Storage GRS tested (file written to primary, readable from secondary within 60s)
- Managed Identity federation verified (hub can auth to all 3 regional hubs)
- Failover drill: EU-Central down → US-East writable within 30s, zero data loss
- Compliance audit: <5ms to pull region-specific access log
- Chaos tests automated (daily runs in CI/CD, results published)
- Cost baseline: multi-region Cosmos DB = €40/mo (vs €30 single-region, +€10 for replication), well within budget

### EXPLICITLY OUT OF SCOPE (Phase 15+)

- **Enterprise SaaS managed hosting** (White-label Squad-as-a-Service for third parties) — Phase 15
- **Advanced rate limiting & DDoS protection** (Azure DDoS Protection Standard, WAF) — Phase 15 security hardening
- **Advanced networking** (Azure Express Route for hybrid cloud, Site-to-Site VPN) — Phase 15+
- **Quantum computing integration** — beyond scope
- **Multi-cloud satellite support** (AWS, GCP) — VETOED by founder, hard no-go
- **Advanced ML ops** (Azure ML auto-scaling) — Phase 16+

---

## 3. Technical Feasibility

### 3.1 Dependency Readiness

Phase 14 requires Phase 13 complete and Phase 12 proven:

| Phase | Target | Status | Blocker |
|-------|--------|--------|---------|
| **Phase 13** | Community governance, RFC process, public docs | Must ship before Phase 14 | None—Phase 13 proven feasible |
| **Phase 12** | Plugin marketplace, federation governance, MCP ecosystem | Must be stable | None—Phase 12 shipping Q2 2026 |
| **Phase 10-11** | 24/7 autonomous operation proven, gameplay testing framework | Dependency—Phase 14 assumes autonomy works | None—Phase 10 complete, Phase 11 in flight |

**Feasibility verdict:** ✅ **FEASIBLE** — Technically straightforward (Bicep, AKS, Cosmos DB are all well-documented Azure services). Operational complexity (chaos engineering, failover drills) is medium but manageable. Cost ceiling is the constraint, not technical feasibility.

### 3.2 Azure Budget Analysis

#### Current Baseline (Phase 13)
- **Compute:** 2× B2s_v2 VMs (hub + FFS) = €120/mo
- **Cosmos DB:** Plugin registry, federation data = €30/mo
- **API Management:** MCP rate limiting = €50/mo
- **Storage:** Audit logs, satellite disks = €15/mo
- **CDN/Auth:** Community portal = €10/mo
- **Monitoring:** Application Insights = €5/mo
- **Total Phase 13:** €230/mo

#### Phase 14 Additions

**Must-Have Services:**
- **AKS cluster** (3 node pools, auto-scaling): 
  - Control plane: managed by Azure, €0
  - Compute nodes (auto-scale 0-10): 10 × B2s_v2 @ peak = €40/mo average (auto-scaling = lower average)
  - Spot nodes (auto-scale 0-50): 30 × Spot B2s_v2 @ 60% discount = €72/mo average
  - **Subtotal: €112/mo** (assumes ~10 active nodes at steady state)

- **Cosmos DB multi-region replication:**
  - Primary (EU Central): €30/mo (as current)
  - Secondary replicas (US East + Asia Pacific): +€10/mo per replica = +€20/mo
  - **Subtotal: €50/mo** (€30 + €20)

- **Azure Traffic Manager:** €5/mo (cheap, just health checks + DNS failover)

- **Storage GRS:** +€2-3/mo (modest uplift for geo-redundancy)

- **Application Gateway (regional):** €15/mo × 3 regions = €45/mo
  - (Replaces some Azure Load Balancer functionality, enables SSL termination + WAF rules per-region)
  - Reduced to €15/mo per region if light traffic
  - **Subtotal: €45/mo**

**Optional-But-Recommended Services:**
- **Azure Monitor + Log Analytics:** +€20/mo (for global observability, multi-region dashboards)
- **Azure Key Vault:** €0.6/mo (minimal cost, but needed for compliance key escrow)

**Total Phase 14 Delta:** €112 (AKS) + €20 (Cosmos replication) + €5 (Traffic Manager) + €3 (storage) + €45 (App Gateway) + €20 (monitoring) = **€205/mo minimum**

**New Total Budget: €230 + €205 = €435/mo** (87% utilization)

**Contingency:** If AKS node count higher than modeled (burst traffic to 20 active nodes), could hit €250/mo for Phase 14 delta = €480/mo total. **Still within €500 cap.**

**Cost Optimization Strategy:**
1. **Reserved Instances (RI):** Commit to 1-year RI for hub VMs (30% discount) = save €35/mo → budget becomes €400/mo
2. **Spot VMs:** Use 80% of scaling capacity as Spot (60% discount) = save €40/mo → budget becomes €395/mo
3. **Cosmos DB savings plan:** Commit to reserved capacity (30% discount) = save €6/mo → budget becomes €389/mo
4. **Right-sizing:** If 10 satellites active at steady-state (not 50), scale back AKS allocation, can drop to €80/mo = €360/mo total

**Decision:** Phase 14 feasible at €435/mo (baseline). With RIs + Spot optimization, achievable at €380-400/mo, leaving €100-120/mo headroom for Phase 15.

### 3.3 Azure-Only Lock: Why Multi-Cloud Is Off The Table

**Founder Directive:** AWS and Google Cloud support VETOED. This is non-negotiable. Here's why:

#### Financial Argument
- AWS: Equivalent architecture (EC2, RDS, ELB) costs ~15-20% more due to higher per-unit pricing in US regions
- GCP: More favorable pricing, but minimal customer overlap (no customer demand for GCP)
- **Decision:** Single cloud reduces complexity, billing, vendor relationships. €500/mo on Azure = €575-600/mo on multi-cloud.

#### Technical Argument
- **Lock-in risk:** Different cloud APIs (AWS CloudFormation vs Azure Bicep vs Terraform) = harder to migrate later
- **Skill consolidation:** Squad agents already trained on Azure (VMs, Cosmos DB, AKS, Policy, Bicep)
- **Operational complexity:** Monitoring, alerting, disaster recovery must coordinate across clouds (nightmare)
- **Decision:** Stick with Azure, master it deeply, become experts. Multi-cloud = jack-of-all-trades, master of none.

#### Strategic Argument
- Syntax Sorcery's value is **autonomous AI development practices**, not cloud infrastructure
- If we support all clouds, customers expect "cloud doesn't matter" abstraction layer (Terraform, Kubernetes everywhere)
- We can't provide that abstraction at current scale
- **Decision:** Be the "Azure expert autonomous AI company". Customers who need multi-cloud hire DevOps firms; SS focuses on autonomy.

#### Compliance Argument
- GDPR/CCPA have regional data residency requirements
- Azure regional architecture (EU Central, US East, Asia Pacific) maps directly to regulations
- AWS multi-region strategy is less clear (more regulatory risk)
- **Decision:** Azure's regional structure maps natively to compliance zones. Stick with it.

**Lock-In Duration:** This decision is locked in for Phases 14-20 minimum (5+ years). Revisit only if:
1. Customer demand for AWS/GCP overwhelms Azure demand (unlikely)
2. Azure pricing increases >30% vs competitors (unlikely)
3. Founder decision to expand to multi-cloud (requires T0 override)

---

## 4. Key Components

### 4.1 Multi-Region Architecture via Bicep

#### Deliverable: Parameterized Bicep Templates

**File structure:**
```
infra/bicep/
├── main.bicep (orchestrator, calls modules)
├── parameters.json (parameters for each region)
├── modules/
│   ├── hub.bicep (EU Central hub VM)
│   ├── satellite.bicep (regional satellite template, parameterized)
│   ├── networking.bicep (VNet, peering, Private Link)
│   ├── traffic-manager.bicep (Azure Traffic Manager setup)
│   ├── cosmos-db.bicep (multi-region Cosmos DB)
│   └── storage.bicep (GRS blob storage)
├── parameters/
│   ├── eu-central.json (EU hub config)
│   ├── us-east.json (US hub config)
│   └── asia-southeast.json (APAC hub config)
└── chaos/
    ├── failover-test.sh (simulate outage, validate failover)
    └── replication-test.sh (test Cosmos DB sync)
```

**Example Bicep parameter (for regionalization):**
```bicep
@description('Azure region for deployment')
param location string = 'eastus'

@description('Satellite count (0 for hub, 1-10 for regional)')
param satelliteCount int = 0

@description('VM size (Standard_B2s for hub, Standard_B2s for satellite)')
param vmSize string = 'Standard_B2s'

@description('Whether to use Spot VMs (true for scale-up, false for always-on)')
param useSpotVms bool = satelliteCount > 3

resource vmHub 'Microsoft.Compute/virtualMachines@2021-07-01' = if (satelliteCount == 0) {
  name: 'vm-squad-hub-${location}'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    // ... reserved instance config if hub
  }
}

resource vmSatellites 'Microsoft.Compute/virtualMachines@2021-07-01' = [for i in range(0, satelliteCount): {
  name: 'vm-satellite-${location}-${i}'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    // ... spot VM config if scaling
  }
}]
```

**Cost Optimization Decision Document (CSV breakdown):**

| Component | Phase 12 (1 Hub + 1 Sat) | Phase 14 (3 Hubs + 50 Sat) | Optimization |
|-----------|-----------|-----------|-----------|
| Compute (VMs) | €120 | €180 (3 hubs @ €40, spot nodes on AKS) | AKS consolidation + Spot |
| AKS Clusters | €0 | €112 | 3× clusters, auto-scaling |
| Cosmos DB | €30 | €50 | Multi-region replication +€20 |
| Storage (GRS) | €15 | €17 | Geo-redundancy +€2 |
| Traffic Manager | €0 | €5 | Failover +€5 |
| App Gateway | €0 | €45 | 3× regional gateways |
| Monitoring | €5 | €25 | Global observability +€20 |
| **TOTAL** | **€170** | **€434** | **Within €500 cap** |

**Acceptance Criteria:**
- Bicep templates deploy hub + 3 satellite VMs in <10 minutes (parallel Bicep deployment)
- Parameters.json allows customization per region (validation: parameter values checked, no hardcoded IPs)
- Cost model spreadsheet validated against Azure pricing calculator (monthly cost estimate matches +/- 5%)
- Traffic Manager health endpoint (hub API) returns 200 OK in <500ms (5s health check interval)
- Azure Policy enforces 5+ compliance rules (tested: illegal resource creation blocked)

#### Deliverable: Azure Traffic Manager Failover Runbook

**Health check configuration:**
```
Endpoint: https://<hub-ip>:443/health
Method: HTTPS GET
Path: /health
Interval: 5 seconds
Timeout: 3 seconds
Failure threshold: 3 (3 failed checks = endpoint marked unhealthy)
Expected status: 200
```

**Routing policy:**
```
Performance routing: Send user traffic to geographically closest hub
- US client → US-East hub (lowest latency)
- EU client → EU-Central hub
- APAC client → Southeast Asia hub

Failover: If closest hub fails 3 health checks (15 seconds):
- Automatic failover to next-closest hub (within 5 seconds)
- Dashboard alert (Slack notification)
- Log event to Application Insights
```

**Manual failover drill (runbook):**
1. Identify hub to simulate failure (e.g., EU-Central)
2. Shut down hub VM (via Azure Portal or `az vm deallocate`)
3. Monitor Traffic Manager: should detect unhealthy within 15 seconds
4. Verify failover: traffic rerouted to US-East hub within 5 seconds
5. Check satellite logs: confirm all satellites reconnected to US-East hub
6. Measure RTO (Recovery Time Objective): target <5 minutes
7. Restore hub VM, verify failback within 5 minutes

**Acceptance Criteria:**
- Failover drill completes in <10 minutes, RTO <5 min
- Zero data loss during failover (log rotation checkpoints)
- Satellites auto-reconnect to new hub without manual intervention
- Health check interval adjusted if <5s threshold proves too aggressive

#### Deliverable: Azure Policy Enforcement

**5+ compliance rules:**

1. **Region lock:** Resources must stay in designated region
   ```
   Effect: Deny
   Condition: resource.location NOT IN ['eastus', 'westeurope', 'southeastasia']
   Scope: RG-squad-production
   ```

2. **Encryption enforcement:** All storage must be encrypted at rest
   ```
   Effect: Deny
   Condition: storage.encryption == null OR storage.encryptionVersion < TLS1.2
   ```

3. **Managed Identity required:** No secrets in config, all auth via Managed Identity
   ```
   Effect: Deny
   Condition: deployment has hardcoded password OR plaintext API key
   ```

4. **Tagging requirement:** All resources must have 'team: squad' and 'phase: 14' tags
   ```
   Effect: Deny
   Condition: resource.tags['team'] != 'squad' OR resource.tags['phase'] != '14'
   ```

5. **Network isolation:** Resources must use Private Link or VNet injection
   ```
   Effect: Deny
   Condition: public IP assigned to Cosmos DB OR no VNet endpoint
   ```

**Acceptance Criteria:**
- Deploy resource that violates policy → deployment blocked with clear error
- Audit mode logs violations without blocking (for reporting)
- Remediation: auto-fix non-compliant resources (e.g., auto-tag resources)

### 4.2 AKS Constellation with KEDA Auto-Scaling

#### Deliverable: AKS Cluster Setup (Per Region)

**Bicep template structure:**
```bicep
resource aksCluster 'Microsoft.ContainerService/managedClusters@2022-07-01' = {
  name: 'aks-squad-${location}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    kubernetesVersion: '1.27'
    dnsPrefix: 'squad-${location}'
    agentPoolProfiles: [
      {
        name: 'system'
        count: 3
        vmSize: 'Standard_B2s'
        mode: 'System'
        nodeLabels: {
          workload: 'system'
        }
      }
      {
        name: 'compute'
        count: 2
        vmSize: 'Standard_B2s'
        mode: 'User'
        enableAutoScaling: true
        minCount: 1
        maxCount: 20
        nodeLabels: {
          workload: 'compute'
        }
      }
      {
        name: 'spot'
        count: 0
        vmSize: 'Standard_B2s'
        mode: 'User'
        enableAutoScaling: true
        minCount: 0
        maxCount: 50
        scaleSetPriority: 'Spot'
        scaleSetEvictionPolicy: 'Delete'
        nodeLabels: {
          workload: 'spot'
        }
      }
    ]
    networkProfile: {
      networkPlugin: 'azure'
      networkPolicy: 'azure'
      dockerBridgeCidr: '172.17.0.1/16'
      serviceCidr: '10.0.0.0/16'
      dnsServiceIP: '10.0.0.10'
    }
    addonProfiles: {
      azurePolicy: {
        enabled: true
      }
      omsAgent: {
        enabled: true
        config: {
          logAnalyticsWorkspaceResourceID: logAnalyticsWorkspace.id
        }
      }
    }
  }
}
```

**Node pools:**
- **System:** 3 always-on B2s_v2 VMs, Kubernetes control plane workloads
- **Compute:** 1-20 auto-scaling B2s_v2 VMs, regular satellite pods
- **Spot:** 0-50 auto-scaling Spot B2s_v2 VMs, batch/background jobs (60% discount, <1% eviction)

**Acceptance Criteria:**
- Bicep deploys AKS in <15 minutes (parallel resource creation)
- 3 node pools present, autoscaling enabled (verified via `kubectl get nodepool`)
- Network policy enforced (pod-to-pod communication restricted by labels)
- Monitoring enabled (metrics visible in Azure Portal)

#### Deliverable: Satellite-to-AKS Deployment Automation

**GitHub Actions workflow (.github/workflows/deploy-satellite-to-aks.yml):**

```yaml
name: Deploy Satellite to AKS

on:
  repository_dispatch:
    types: [new-satellite-created]
  workflow_dispatch:
    inputs:
      satellite_repo: { required: true, type: string }
      region: { required: true, type: choice, options: ['eastus', 'westeurope', 'southeastasia'] }

env:
  ACR_REGISTRY: syntaxsorceryacr.azurecr.io
  AKS_CLUSTER: aks-squad-${{ github.event.inputs.region }}
  AKS_RG: rg-squad-${{ github.event.inputs.region }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Check out satellite repo
        uses: actions/checkout@v3
        with:
          repository: ${{ github.event.inputs.satellite_repo }}
          ref: main

      - name: Build Docker image
        run: |
          docker build -t ${{ env.ACR_REGISTRY }}/${{ github.event.inputs.satellite_repo }}:${{ github.sha }} .
          docker tag ... :latest

      - name: Login to ACR
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.ACR_REGISTRY }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Push image to ACR
        run: docker push ${{ env.ACR_REGISTRY }}/... :latest

      - name: Deploy to AKS via Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.12'
      - run: |
          helm repo add squad https://charts.syntaxsorcery.dev
          helm install ${{ github.event.inputs.satellite_repo }} squad/satellite \
            --namespace squad-satellites \
            --set image.repository=${{ env.ACR_REGISTRY }}/${{ github.event.inputs.satellite_repo }} \
            --set image.tag=${{ github.sha }} \
            --set region=${{ github.event.inputs.region }}

      - name: Register satellite with hub
        run: |
          curl -X POST https://hub-${{ github.event.inputs.region }}.syntaxsorcery.dev/api/satellites \
            -H "Authorization: Bearer ${{ secrets.HUB_API_TOKEN }}" \
            -d '{
              "repo": "${{ github.event.inputs.satellite_repo }}",
              "podName": "satellite-${{ github.event.inputs.satellite_repo }}",
              "region": "${{ github.event.inputs.region }}",
              "status": "healthy"
            }'
```

**Acceptance Criteria:**
- Workflow triggers on new satellite creation
- Docker image built in <3 minutes
- Image pushed to ACR in <1 minute
- Helm deployment succeeds, pod ready in <2 minutes
- Satellite auto-registers with hub (curl succeeds, hub acknowledges)

#### Deliverable: KEDA Auto-Scaling Rules

**Helm values (per satellite):**

```yaml
# chart: squad-satellite/values.yaml

autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 5

keda:
  scaledObjects:
    - name: satellite-github-issues
      triggers:
        - type: github
          metadata:
            org: syntax-sorcery
            repo: ${{ .Values.satellite.repo }}
            issuesCount: "10"  # Scale up if >10 open issues
          authModes:
            - bearer
          secretRef:
            name: github-token

    - name: satellite-http-requests
      triggers:
        - type: external
          metadata:
            scalerAddress: prometheus:8080
            query: 'rate(http_requests_total{job="satellite"}[1m]) > 100'

    - name: satellite-cpu
      triggers:
        - type: cpu
          metadata:
            type: Utilization
            value: "70"  # HPA: scale if CPU >70%

    - name: satellite-memory
      triggers:
        - type: memory
          metadata:
            type: Utilization
            value: "80"  # Scale if memory >80%
```

**Scale-down policy:**

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 1800  # Wait 30 min before scaling down
    policies:
    - type: Percent
      value: 50  # Scale down 50% of replicas
      periodSeconds: 60
```

**Acceptance Criteria:**
- KEDA detects GitHub issue spike (create 15 issues in satellite repo)
- Pod count increases from 1 to 2-3 within 2 minutes
- CPU threshold trigger works (generate load → scale up)
- Idle timeout scales down after 30 minutes (verified in logs)

#### Deliverable: Hub Orchestration Service

**Node.js service (src/hub-orchestrator/index.js):**

```javascript
const express = require('express');
const axios = require('axios');
const { CosmosClient } = require('@azure/cosmos');

const app = express();

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  aadCredentials: new DefaultAzureCredential()
});

const database = cosmosClient.database('squad-federation');
const satelliteRegistry = database.container('satellites');
const metricsContainer = database.container('metrics');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Satellite health check (called every 30s)
app.post('/api/satellites/sync', async (req, res) => {
  try {
    const satellites = await satelliteRegistry.items.readAll().fetchAll();
    
    for (const satellite of satellites.resources) {
      try {
        const health = await axios.get(`${satellite.apiEndpoint}/health`, { timeout: 5000 });
        
        // Update satellite health in Cosmos DB
        await satelliteRegistry.item(satellite.id, satellite.id).replace({
          ...satellite,
          lastHeartbeat: new Date(),
          status: health.status === 'ok' ? 'healthy' : 'degraded'
        });
        
        // Log metric
        await metricsContainer.items.create({
          type: 'satellite-health',
          satelliteId: satellite.id,
          status: health.status === 'ok' ? 'healthy' : 'degraded',
          timestamp: new Date(),
          responseTime: health.responseTime
        });
      } catch (error) {
        // Mark satellite unhealthy
        await satelliteRegistry.item(satellite.id, satellite.id).replace({
          ...satellite,
          lastHeartbeat: new Date(),
          status: 'unhealthy',
          lastError: error.message
        });
      }
    }
    
    res.json({ success: true, satellites: satellites.resources.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Work distribution (assign issue to least-busy satellite)
app.post('/api/work/assign', async (req, res) => {
  const { issue } = req.body;
  
  try {
    const satellites = await satelliteRegistry.items
      .query('SELECT * FROM c WHERE c.status = "healthy" ORDER BY c.currentWorkload ASC')
      .fetchAll();
    
    if (satellites.resources.length === 0) {
      return res.status(503).json({ error: 'No healthy satellites available' });
    }
    
    const target = satellites.resources[0]; // Least-busy satellite
    
    // Assign issue to satellite
    await axios.post(`${target.apiEndpoint}/api/issues`, {
      issue,
      assignedAt: new Date()
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SATELLITE_API_TOKEN}`
      }
    });
    
    // Update metrics
    await metricsContainer.items.create({
      type: 'issue-assigned',
      satelliteId: target.id,
      issueId: issue.id,
      timestamp: new Date()
    });
    
    res.json({ success: true, assignedTo: target.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Metrics aggregation endpoint
app.get('/api/metrics/dashboard', async (req, res) => {
  try {
    const metrics = await metricsContainer.items
      .query(`
        SELECT
          c.satelliteId,
          COUNT(1) as issues_assigned,
          AVG(c.responseTime) as avg_response_time,
          MAX(c.timestamp) as last_activity
        FROM c
        WHERE c.type = 'issue-assigned'
          AND c.timestamp > DateTimeAdd('hour', -1, GetCurrentTimestamp())
        GROUP BY c.satelliteId
      `)
      .fetchAll();
    
    res.json(metrics.resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hub Orchestrator listening on port ${PORT}`);
});
```

**Deployment (Helm chart):**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: hub-orchestrator
spec:
  serviceName: hub-orchestrator
  replicas: 3  # High availability
  selector:
    matchLabels:
      app: hub-orchestrator
  template:
    metadata:
      labels:
        app: hub-orchestrator
    spec:
      containers:
      - name: orchestrator
        image: syntaxsorceryacr.azurecr.io/hub-orchestrator:latest
        ports:
        - containerPort: 3000
        env:
        - name: COSMOS_ENDPOINT
          value: https://cosmos-squad.documents.azure.com:443/
        - name: AZURE_CLIENT_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['azure.workload.identity/client-id']
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
```

**Acceptance Criteria:**
- Service deploys as StatefulSet with 3 replicas
- Health check polls all satellites every 30 seconds
- Metrics aggregation works (dashboard returns last 1-hour stats)
- Work assignment algorithm routes issue to least-busy satellite

### 4.3 Global Deployment & Multi-Region Replication

#### Deliverable: Cosmos DB Multi-Region Setup

**Bicep template:**

```bicep
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: 'cosmos-squad'
  location: 'eastus'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: 'eastus'
        isZoneRedundant: true
        failoverPriority: 0
      }
      {
        locationName: 'westeurope'
        isZoneRedundant: true
        failoverPriority: 1
      }
      {
        locationName: 'southeastasia'
        isZoneRedundant: true
        failoverPriority: 2
      }
    ]
    multipleWriteLocationsEnabled: false  // Single write, multi-read
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'  // Strong consistency within region, eventual cross-region
      maxStalenessPrefix: 100
      maxIntervalInSeconds: 5
    }
    createMode: 'Default'
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosDbAccount
  name: 'squad-federation'
  properties: {
    resource: {
      id: 'squad-federation'
    }
  }
}

// Containers with global indexes
resource satelliteRegistry 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'satellites'
  properties: {
    resource: {
      id: 'satellites'
      partitionKey: {
        paths: ['/region']
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
        compositeIndexes: [
          [
            { path: '/status', order: 'ascending' },
            { path: '/region', order: 'ascending' }
          ]
        ]
      }
    }
    options: {
      throughput: 400  // Shared across regions
    }
  }
}

// Global distribution enabled automatically with multi-location setup
```

**Replication behavior:**
- Write to EU Central (primary) → replicate to US East (secondary) + Asia Pacific (tertiary) in <5 seconds
- Reads can happen from any region (local read <10ms)
- If EU Central unavailable: automatic failover to US East (RTO <30s), US East becomes writable
- Conflict resolution: last-write-wins (satellite registrations, acceptable for this use case)

**Acceptance Criteria:**
- Cosmos DB account created with 3 writable regions
- Multi-region replication enabled (verified via Azure Portal)
- Test write to EU Central → read from US East within 5 seconds
- Failover test: disable EU Central → US East becomes writable within 30s

#### Deliverable: Azure Storage GRS

**Bicep template:**

```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'squadstorage${uniqueString(resourceGroup().id)}'
  location: 'westeurope'
  kind: 'StorageV2'
  sku: {
    name: 'Standard_GRS'  // Geo-Redundant Storage
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource artifactsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'artifacts'
  properties: {
    publicAccess: 'None'
  }
}

// Blob tier policy: hot → cool after 30 days, cool → archive after 90 days
resource managementPolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'archiveRule'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: ['blockBlob']
              prefixMatch: ['artifacts/']
            }
            actions: {
              baseBlob: {
                tierToCool: {
                  daysAfterModificationGreaterThan: 30
                }
                tierToArchive: {
                  daysAfterModificationGreaterThan: 90
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

**Acceptance Criteria:**
- GRS storage account created (primary + secondary region auto-configured)
- Read-access GRS (RA-GRS) enabled (reads from secondary if primary down)
- Lifecycle policy created (automatic tiering after 30/90 days)
- Test: upload blob to primary → read from secondary within 60 seconds

#### Deliverable: Managed Identity Federation

**Bicep setup for cross-region auth:**

```bicep
// Hub system-assigned identity
resource hubIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-hub-${location}'
  location: location
}

// Grant hub identity access to Cosmos DB (scoped by region)
resource cosmosRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: cosmosDbAccount
  name: guid(cosmosDbAccount.id, hubIdentity.id, 'DocumentDB Account Contributor')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '9b7fa8fe-3cdc-4bde-a1f9-3baf143f80db')  // Cosmos DB data contributor
    principalId: hubIdentity.properties.principalObjectId
    principalType: 'ServicePrincipal'
  }
}

// Grant hub identity access to regional Key Vault (for compliance key escrow)
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, hubIdentity.id, 'Key Vault Secrets Officer')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')  // Key Vault Secrets Officer
    principalId: hubIdentity.properties.principalObjectId
    principalType: 'ServicePrincipal'
  }
}

// Hub VM uses system-assigned identity
resource vmHub 'Microsoft.Compute/virtualMachines@2021-07-01' = {
  name: 'vm-squad-hub-${location}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  // ... VM properties
}

// Satellites authenticate to hub via Managed Identity
// Each satellite has its own service principal (auto-created by AKS)
// Hub trusts satellite via Azure AD (OAuth 2.0 on-behalf-of flow)
```

**Authentication flow (Satellite → Hub):**
1. Satellite pod gets access token via Managed Identity (Azure AD integration in AKS)
2. Satellite includes token in API request to Hub: `Authorization: Bearer <token>`
3. Hub validates token via Azure AD (signature verification, scopes check)
4. Hub responds with work assignment
5. No credentials stored in config, pure identity-based auth

**Acceptance Criteria:**
- Managed Identity assigned to hub VM
- Role assignments created (Cosmos DB, Key Vault)
- Satellite pod can authenticate to hub without API keys in config
- Cross-region requests succeed (satellite in US-East queries Cosmos DB primary in EU-Central)

#### Deliverable: Compliance & Audit Logging

**Azure Policy definitions:**

```bicep
resource policyDefinitionGdpr 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'enforce-eu-data-residency'
  properties: {
    displayName: 'Enforce GDPR Data Residency (EU only)'
    description: 'Block creation of resources outside EU regions'
    mode: 'All'
    policyRule: {
      if: {
        field: 'location'
        notIn: ['westeurope', 'northeurope', 'germanywestcentral', 'switzerlandnorth']
      }
      then: {
        effect: 'Deny'
      }
    }
    parameters: {}
  }
}

resource policyDefinitionCcpa 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'enforce-us-data-residency'
  description: 'Block creation of resources outside US regions'
  properties: {
    displayName: 'Enforce CCPA Data Residency (US only)'
    mode: 'All'
    policyRule: {
      if: {
        field: 'location'
        notIn: ['eastus', 'westus2', 'westus3']
      }
      then: {
        effect: 'Deny'
      }
    }
    parameters: {}
  }
}

// Audit logging: all Cosmos DB reads/writes logged to Log Analytics
resource auditPolicy 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'enable-cosmos-audit-logging'
  properties: {
    displayName: 'Enable Cosmos DB Audit Logging'
    description: 'Route all Cosmos DB operations to Log Analytics'
    mode: 'Indexed'
    policyRule: {
      if: {
        field: 'type'
        equals: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers'
      }
      then: {
        effect: 'AuditIfNotExists'
        details: {
          type: 'Microsoft.Insights/diagnosticSettings'
          existenceCondition: {
            allOf: [
              {
                field: 'Microsoft.Insights/diagnosticSettings/logs.enabled'
                equals: 'true'
              }
            ]
          }
        }
      }
    }
  }
}
```

**Audit log schema (Log Analytics):**

```sql
// Query: Who accessed EU data in last 7 days?
CosmosDBDataPlaneRequests
| where TimeGenerated > ago(7d)
| where database_name == 'squad-federation'
| where region_name == 'westeurope'  // EU-Central
| project TimeGenerated, Principal, Operation, DocumentCount, DurationMs
| summarize AccessCount=count() by Principal, Operation
| sort by AccessCount desc
```

**Compliance dashboard (Excel or JSON):**

```json
{
  "compliance_report": {
    "date": "2026-03-24",
    "regions": {
      "westeurope": {
        "gdpr_compliant": true,
        "data_residency_check": "All EU data in westeurope region ✅",
        "audit_log_retention": "90 days",
        "last_audit": "2026-03-24T10:00:00Z",
        "violations": 0
      },
      "eastus": {
        "ccpa_compliant": true,
        "data_residency_check": "All US customer data in eastus region ✅",
        "audit_log_retention": "90 days",
        "last_audit": "2026-03-24T10:00:00Z",
        "violations": 0
      },
      "southeastasia": {
        "compliance_status": "Non-EU, non-US (APAC region)",
        "data_residency_check": "No customer data stored ✅",
        "audit_log_retention": "90 days",
        "violations": 0
      }
    }
  }
}
```

**Acceptance Criteria:**
- Compliance policies deployed (5+ rules enforced)
- Audit logging enabled (Cosmos DB operations logged to Log Analytics)
- Dashboard generated (JSON/Excel export shows 0 violations)
- Query time: <5 seconds to pull region-specific access log

#### Deliverable: Chaos Engineering Runbook

**GitHub Actions workflow (.github/workflows/chaos-tests.yml):**

```yaml
name: Daily Chaos Engineering Tests

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  failover-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Test 1: Simulate EU-Central hub outage
        run: |
          # Scale down hub to 0 replicas (simulate outage)
          az container instance delete \
            --resource-group rg-squad-production \
            --name hub-eu-central \
            --yes

          # Wait 15 seconds for health check to detect failure
          sleep 15

          # Verify Traffic Manager detected unhealthy
          traffic_manager_status=$(az network traffic-manager endpoint show \
            --name hub-eu-central \
            --profile-name tm-squad \
            --resource-group rg-squad-production \
            --query properties.endpointStatus)
          
          if [ "$traffic_manager_status" != "Degraded" ]; then
            echo "FAIL: Traffic Manager did not detect endpoint failure"
            exit 1
          fi

          # Verify failover occurred (US-East is now primary)
          response=$(curl -s https://api.squad.dev/health)
          if ! echo "$response" | grep -q "us-east"; then
            echo "FAIL: Traffic not routed to US-East backup"
            exit 1
          fi

          # Restore hub
          az container instance create \
            --resource-group rg-squad-production \
            --name hub-eu-central \
            ... (restore parameters)

          echo "PASS: EU-Central failover successful (RTO <30s)"

      - name: Test 2: Cosmos DB replication lag
        run: |
          # Write to EU-Central
          curl -X POST https://cosmos-squad.documents.azure.com/dbs/squad-federation/colls/satellites/docs \
            -H "Authorization: Bearer ${{ secrets.COSMOS_WRITE_TOKEN }}" \
            -d '{"id":"test-replication-$(date +%s)", "test": true}'

          # Poll US-East for replication
          max_attempts=10
          attempt=0
          while [ $attempt -lt $max_attempts ]; do
            response=$(curl -s https://cosmos-squad-useast.documents.azure.com/dbs/squad-federation/colls/satellites/docs \
              -H "Authorization: Bearer ${{ secrets.COSMOS_READ_TOKEN }}")
            
            if echo "$response" | grep -q "test-replication"; then
              echo "PASS: Replication lag: $((attempt * 500))ms"
              break
            fi

            sleep 0.5
            ((attempt++))
          done

          if [ $attempt -eq $max_attempts ]; then
            echo "FAIL: Replication did not complete within 5 seconds"
            exit 1
          fi

      - name: Publish results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: chaos-test-results
          path: chaos-results.json

      - name: Report to Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Daily Chaos Tests: ${{ job.status }}",
              "details": "${{ steps.failover-test.outcome }}"
            }
```

**Test scenarios:**
1. **Hub outage simulation:** Kill primary hub VM, verify failover to secondary within 30s
2. **Cosmos DB replication lag:** Write to primary, measure time for read from secondary (target: <5s)
3. **AKS node failure:** Terminate node, verify pod auto-restart within 10s
4. **Network partition:** Block replication traffic, verify eventual consistency on reconnection
5. **Cost anomaly detection:** Monitor Azure spend, alert if >5% variance from baseline

**Acceptance Criteria:**
- Failover drill completes daily without manual intervention
- All 5 chaos tests pass (published results available)
- RTO validated <5 minutes for failover
- Zero data loss in any scenario

---

## 5. Dependencies

### Must Complete Before Phase 14 Start

- ✅ **Phase 13 — Community & Open-Source** (Issues #43-45)
  - Public documentation (playbook, ops manual, governance FAQ)
  - Skills marketplace with certification tiers
  - RFC governance + community voting
  - **Blocker if:** Phase 13 not stable — Phase 14 assumes ecosystem governance in place

- ✅ **Phase 12 — Platform Evolution** (Issues #40-42)
  - Plugin marketplace
  - MCP ecosystem
  - Federation governance model
  - **Blocker if:** Phase 12 incomplete — Phase 14 orchestration depends on federation model

- ✅ **Phase 10-11 — Autonomous Operation** (Issues #35-39)
  - 24/7 Azure operation proven (100+ days uptime)
  - Gameplay testing framework
  - Autonomous decision-making
  - **Blocker if:** Autonomy not proven — no point scaling something that's not stable

### External Dependencies

| Dependency | Risk | Mitigation |
|------------|------|-----------|
| **AKS service limits:** Cluster max 5000 nodes | 🟢 Low | AKS scales to 5000 nodes; we plan for 50-100 nodes max |
| **Cosmos DB failover latency:** RTO 30-60s | 🟢 Low | Acceptable for autonomous systems (agents don't need <5s failover) |
| **Azure Traffic Manager:** Endpoint health check interval | 🟢 Low | 5s interval sufficient for our use case |
| **Spot VM eviction:** 1-2% chance per day | 🟡 Medium | Mitigated via mixed node pool (80% spot, 20% on-demand for critical workloads) |
| **Regional capacity constraints:** Azure may have capacity limits | 🟡 Medium | Monitor via Azure Quotas; request increases 30 days in advance |

---

## 6. Risks & Open Questions

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Chaos tests false negatives:** Test infrastructure fails, but production OK | 🟡 Medium | 🟡 Medium | Run chaos tests weekly (not daily), require 3 passes before declaring "healthy" |
| **Cosmos DB cross-region latency:** Replication >5s | 🟡 Medium | 🟡 Medium | Implement caching layer (Redis) for frequently accessed data (satellite registry) |
| **AKS networking overhead:** Pod-to-pod latency between regions | 🟡 Medium | 🟡 Medium | Use Azure Private Link for cross-region AKS communication (dedicated network path) |
| **Spot VM eviction cascade:** 10+ nodes evicted simultaneously | 🟡 Medium | 🟡 Medium | Limit spot pool to 50% of total capacity; on-demand nodes take overflow |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Cost overrun:** AKS + multi-region exceeds €500/mo | 🟡 Medium | 🔴 High | **Daily cost monitoring:** Set Azure budget alerts at €400/mo, auto-scale down if triggered |
| **Regional quota exhaustion:** No capacity in target region | 🟡 Medium | 🟡 Medium | Pre-reserve capacity (Azure Quotas); maintain fallback regions (US West, Canada) |
| **Compliance violation:** GDPR data misplaced (data leakage from EU to US) | 🟢 Low | 🔴 High | Enforce Azure Policy (region locks); audit quarterly; test compliance quarterly |
| **Multi-region synchronization bugs:** Satellites in US/APAC get stale Cosmos DB data | 🟡 Medium | 🟡 Medium | Implement circuit breaker (if Cosmos DB lag >10s, read from local cache) |

### Open Questions

**Q1: Should we replicate to 3 regions (EU, US, APAC) or 5 (add Canada, Australia)?**
- 3 regions: €435/mo (baseline)
- 5 regions: €550+/mo (over budget)
- **Decision:** Start with 3 regions (EU Central, US East, Southeast Asia). Add Australia/Canada in Phase 15 if customer demand justifies.

**Q2: Spot VM risk tolerance: 50% Spot / 50% On-Demand, or 80% / 20%?**
- 80/20: €30/mo savings, but 2% daily eviction risk
- 50/50: €15/mo savings, but safer
- **Decision:** Start 50/50. Measure real eviction rates for 1 month. If <0.5% eviction, upgrade to 80/20 in Phase 14.2.

**Q3: AKS node size: Standard_B2s (current) or Standard_D2s_v3 (better CPU for agent workloads)?**
- B2s: €30/mo per node, burstable (fine for light workloads)
- D2s_v3: €60/mo per node, guaranteed CPU (better for agent decision-making)
- **Decision:** Use B2s for now (satellite workloads are I/O bound, not CPU). Upgrade to D2s_v3 in Phase 14.2 if agents report slow decision times.

**Q4: Should we implement active-active multi-region (writes to all 3 regions) or active-passive (single write hub)?**
- Active-active: Lower latency for satellites, but conflict resolution complexity
- Active-passive: Simple, durable, acceptable latency (satellites write to nearest hub, hub syncs)
- **Decision:** Active-passive (single write). Simpler, proven pattern. Revisit in Phase 15 if latency becomes problem.

**Q5: Can we skip Chaos Engineering and just do manual failover drills quarterly?**
- Manual: Slower, easier to mess up, less reliable
- Chaos automation: Daily validation, catches edge cases early
- **Decision:** Implement chaos tests. Required for 24/7 autonomous operation (no humans awake to fix failures).

---

## 7. Proposed Sub-Issues (Breakdown of Epic #116)

### Phase 14 Epic Breakdown

**#46 — Multi-Region Architecture & Cost Optimization** (Assigned: Tank / squad:morpheus)
- **Complexity:** 🟢 Medium (3-4 weeks)
- **Acceptance Criteria:**
  - Bicep templates deploy hub + 3 satellites in <10 minutes
  - Cost modeling spreadsheet validated (within €500/mo)
  - Traffic Manager failover tested (RTO <5 min)
  - Azure Policy enforces 5+ compliance rules
  - Failover drill runbook documented + tested
- **Dependencies:** Phase 12-13 stable
- **Owner:** Tank (Cloud/IaC expertise)

**#47 — AKS Constellation with KEDA Auto-Scaling** (Assigned: Trinity / squad:morpheus)
- **Complexity:** 🟡 Medium-High (4-5 weeks)
- **Acceptance Criteria:**
  - AKS cluster deploys in <15 minutes
  - 10+ satellite repos deployed to AKS successfully
  - Auto-scaling tested (issue spike → pod scale-up within 2 min)
  - Hub orchestration service running on 3 replicas
  - Satellite health dashboard shows all pods healthy
  - Chaos tests: pod kill → auto-restart <10s
- **Dependencies:** Phase 12 federation model, Phase 13 governance
- **Owner:** Trinity (full-stack orchestration)

**#48 — Global Deployment & Multi-Region Replication** (Assigned: @copilot / squad:tank)
- **Complexity:** 🟢 Medium (3-4 weeks)
- **Acceptance Criteria:**
  - Cosmos DB multi-region replication active (3 regions)
  - Storage GRS tested (file sync <60s cross-region)
  - Managed Identity federation verified (no secrets in config)
  - Compliance audit dashboard published (region-specific access logs)
  - Chaos tests automated (failover drill + replication test daily)
  - RTO validated <5 minutes
- **Dependencies:** #46 + #47 (infrastructure + orchestration)
- **Owner:** Tank (cloud infrastructure)

**#116-documentation — Phase 14 Specification Review** (Assigned: Oracle)
- **Complexity:** 🟢 Low (1 week)
- **Acceptance Criteria:**
  - This spec reviewed + approved (T1)
  - Spec linked in issue #116 + roadmap.md Phase 14
  - Cost justification document published
  - Azure-only lock decision documented (why multi-cloud is vetoed)
  - Success metrics defined (€500/mo adherence, 50+ satellite scale)

---

## 8. Cost Analysis & Budget Adherence

### Detailed Cost Breakdown (Phase 14)

| Component | Baseline (Phase 13) | Phase 14 Addition | Total | Notes |
|-----------|-----------|-----------|-----------|-----------|
| **COMPUTE** | | | | |
| Hub VMs (3 regions × B2s_v2) | €40 | +€40 | €80 | 1 VM per region (always-on), no discount |
| Reserved Instances discount (1-yr) | - | -€24 | -€24 | 30% discount on 3 hub VMs |
| Subtotal compute | €40 | **€16** | **€56** | |
| **KUBERNETES** | | | | |
| AKS Managed Service | €0 | €0 | €0 | No charge for AKS control plane |
| AKS Compute Nodes (auto-scale 1-20) | €0 | €40 | €40 | Average ~8 nodes, B2s_v2, shared across 10+ satellites |
| AKS Spot Nodes (auto-scale 0-50) | €0 | €72 | €72 | Average ~30 nodes, Spot VMs, 60% discount |
| Subtotal K8s | **€0** | **€112** | **€112** | |
| **DATABASE & STORAGE** | | | | |
| Cosmos DB Single-Region | €30 | - | €30 | Phase 13 baseline |
| Cosmos DB Multi-Region (add 2 read replicas) | - | +€20 | +€20 | Secondary EU/US/APAC = €10 per replica |
| Blob Storage (GRS) | €15 | +€2 | €17 | Geo-redundancy +€2/mo |
| Subtotal DB/Storage | **€45** | **€22** | **€67** | |
| **NETWORKING & LOAD BALANCING** | | | | |
| Azure Traffic Manager | €0 | +€5 | €5 | Health checks + geo-routing |
| Application Gateway (3 regional) | €0 | +€45 | €45 | €15/mo each, SSL termination, WAF rules |
| Data Transfer (cross-region replication) | €5 | +€10 | €15 | EU ↔ US ↔ APAC data sync (~100GB/mo) |
| Subtotal Networking | **€5** | **€60** | **€65** | |
| **MONITORING & COMPLIANCE** | | | | |
| Application Insights | €5 | +€15 | €20 | Multi-region metrics + distributed traces |
| Log Analytics | €0 | +€5 | €5 | Cosmos DB audit logging, compliance queries |
| Key Vault | €1 | €0 | €1 | Compliance key escrow (minimal) |
| Subtotal Monitoring | **€6** | **€20** | **€26** | |
| **TOTAL MONTHLY** | **€96** | **€230** | **€326** | 65% budget utilization |

**Wait, actual Phase 13 was €230/mo, not €96. Let me recalculate:**

#### Corrected Budget Analysis

**Phase 13 Total (from decisions.md):** €240/mo
- Compute: €120 (2 VMs)
- Cosmos DB: €30
- API Mgmt: €50
- Storage: €15
- CDN/Auth: €10
- Monitoring: €5

**Phase 14 Additions:**
- AKS: €112 (compute + spot nodes)
- Cosmos replication: €20
- Additional storage: €2
- Traffic Manager: €5
- App Gateway: €45
- Enhanced monitoring: €15
- **Subtotal additions: €199/mo**

**Phase 14 Total: €240 + €199 = €439/mo (88% utilization)**

**Cost Optimizations Available:**
1. **Reserved Instances (1-year commit on 3 hub VMs):** -€24/mo → €415/mo
2. **Spot VM aggressive policy (90% spot capacity):** -€20/mo → €395/mo
3. **Cosmos DB savings plan (1-year reservation):** -€6/mo → €389/mo
4. **With all optimizations: €389/mo (78% utilization, €111/mo headroom for Phase 15)**

**Decision:** Phase 14 feasible within €500/mo cap. Baseline €439/mo, optimized €389/mo. Recommend implementing RIs + Spot policy for cost control.

---

## 9. Timeline & Milestones

### Phase 14 Roadmap (Assuming Phase 13 Complete by August 2026)

```
Week 1-2: Sprint 1 — Multi-Region Infrastructure
├─ Issue #46: Bicep templates for hub + 3 regions
├─ Issue #46: Traffic Manager setup + failover rules
├─ Issue #46: Azure Policy enforcement (5+ rules)
└─ Target: Infrastructure deployed, manual failover drill successful

Week 3-4: Sprint 2 — AKS Provisioning
├─ Issue #47: AKS cluster templates (3 regional clusters)
├─ Issue #47: NGINX ingress controller + TLS termination
├─ Issue #47: KEDA auto-scaling rules (GitHub issues trigger)
└─ Target: AKS clusters online, ready for satellite deployments

Week 5-6: Sprint 3 — Satellite Orchestration
├─ Issue #47: Hub orchestration service (Node.js, Cosmos DB queries)
├─ Issue #47: GitHub Actions deployment workflow
├─ Issue #47: 10+ test satellite repos deployed to AKS
└─ Target: Satellites running on AKS, health checks passing

Week 7-8: Sprint 4 — Multi-Region Replication
├─ Issue #48: Cosmos DB multi-region replication setup
├─ Issue #48: Storage GRS + lifecycle policies
├─ Issue #48: Managed Identity federation
└─ Target: Cross-region replication tested, failover drill successful

Week 9-10: Sprint 5 — Compliance & Chaos Engineering
├─ Issue #48: Azure Policy compliance audits
├─ Issue #48: Chaos test automation (GitHub Actions)
├─ Issue #48: Compliance dashboard (region-specific audit logs)
└─ Target: Daily chaos tests passing, compliance audit <5ms

Week 11-12: Sprint 6 — Integration & Optimization
├─ All components working together (multi-region end-to-end)
├─ Cost optimization: Reserved Instances + Spot VM policies
├─ Phase 14 epic #116 CLOSED
├─ Blog: "Scaling to the Globe with Azure"
└─ Target: 50-satellite scale tested, budget <€440/mo

**Contingency:** +1-2 weeks if AKS learning curve steeper than expected
**Success criteria:** All 3 issues (#46-48) shipped + merged to master, chaos tests passing daily
```

---

## 10. Success Metrics & KPIs

### Phase 14 Is DONE When

1. ✅ Issue #46 CLOSED: Multi-region infrastructure deployed, cost model validated, failover tested (RTO <5 min)
2. ✅ Issue #47 CLOSED: 10+ satellites running on AKS, auto-scaling verified, hub orchestration healthy
3. ✅ Issue #48 CLOSED: Multi-region replication tested, compliance audit clean, chaos tests automated
4. ✅ Phase 14 epic #116 CLOSED: €500/mo budget maintained, 50-satellite scale simulated, zero regressions

### Phase 14 Success Metrics

**Scalability:**
- ✅ 50+ satellites orchestrated by single hub (tested via load simulation)
- ✅ AKS auto-scaling triggered by GitHub issue volume (20 issues → 2-3 pods within 2 minutes)
- ✅ Cosmos DB multi-region replication latency <5 seconds (measured across all region pairs)

**Resilience:**
- ✅ Failover RTO <5 minutes (measured in chaos drills)
- ✅ Zero data loss during failover (Cosmos DB consistency verified)
- ✅ Pod auto-restart within 10 seconds of node failure (chaos test automated)

**Cost Efficiency:**
- ✅ 50-satellite constellation within €500/mo budget (with optimizations: €389-440/mo)
- ✅ Spot VM cost savings >30% (measured via Azure Cost Management)
- ✅ Reserved Instance discount applied (1-year commitment)

**Compliance:**
- ✅ GDPR audit: 0 violations (EU data in EU-Central only)
- ✅ CCPA audit: 0 violations (US data in US-East only)
- ✅ Compliance dashboard auto-generated daily (<5ms query time)

**Operational:**
- ✅ Chaos tests automated (daily runs, 100% pass rate for 4+ weeks)
- ✅ No manual intervention required for failover (automatic detection + reroute)
- ✅ Monitoring dashboard shows all regions healthy (single pane of glass)

---

## 11. Related Documentation & Standards

### Specifications Referenced

- `docs/phase12-platform-evolution-spec.md` — Federation governance, plugin marketplace
- `docs/phase13-community-opensource-spec.md` — Community governance, RFC process
- `.squad/decisions.md` — Azure-only lock decision (no multi-cloud)
- `infra/bicep/` — Current Bicep templates (Phase 10 hub deployment)

### Architecture Standards Applied

- **High Availability:** Active-passive failover (not active-active, for simplicity)
- **Data Consistency:** Session-level consistency (Cosmos DB), eventual consistency cross-region
- **Security:** Managed Identity federation (no shared credentials), Azure Policy enforcement
- **Observability:** Structured logging (JSON), distributed tracing (Application Insights), alerting (Azure Monitor)

---

## 12. Conclusion: Why Phase 14 Matters

Phase 13 opens Syntax Sorcery to the community. Phase 14 **scales that community globally**.

By deploying multi-region infrastructure on Azure, Syntax Sorcery:
- **Eliminates geographic latency** for US/APAC teams
- **Ensures resilience** via automatic failover + multi-region replication
- **Maintains budget discipline** (€389-440/mo within €500 cap)
- **Locks in Azure** (no multi-cloud complexity or cost overhead)

External development teams can now:
- **Operate globally** — satellites in any Azure region
- **Scale autonomously** — 50+ repos on single hub infrastructure
- **Comply regionally** — GDPR/CCPA audit trails per region
- **Plan for sustainability** — predictable costs via RI + Spot optimization

Phase 14 plants the seed for **infinite scalability within a fixed budget**.

---

**Spec Status:** 🟢 READY FOR REVIEW  
**Next Step:** Oracle submits spec to issue #116, requests feedback, begins Phase 14 planning

---

## Appendix: Azure-Only Strategic Rationale

### Why Not AWS?

**Cost:** EC2 + RDS equivalent costs 15-20% more than Azure in US East region. Multi-region pushes cost to €600+/mo.

**Governance:** AWS CloudFormation more verbose than Bicep; harder to maintain templates across 3 regions.

**Services:** AWS EKS (Kubernetes) + EC2 (compute) + DynamoDB (NoSQL) requires different operational mindset than Azure AKS + VMs + Cosmos DB.

**Conclusion:** Stick with Azure for cost + operational consistency.

### Why Not Google Cloud?

**Customer Demand:** Zero Syntax Sorcery customers requesting GCP. FFS satellite (Phase 2) is Azure-only. No market need.

**Cost:** GCP pricing favorable in Europe/APAC, but worse in US. No consistent advantage globally.

**Lock-in Risk:** Different APIs (Cloud Run vs AKS, Firestore vs Cosmos DB). Harder to migrate workloads.

**Conclusion:** GCP not justified by demand or cost.

### Why Not Terraform for IaC?

**Standardization:** Syntax Sorcery already uses Bicep (Phase 10). Introducing Terraform adds skill debt.

**Azure-native:** Bicep designed for Azure, maps directly to Azure resource models. No abstraction loss.

**Learning Curve:** Agents already trained on Bicep. Terraform would require re-training.

**Conclusion:** Bicep + Azure-only simplifies operations, reduces cognitive load on agents.

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-24  
**Status:** DRAFT — Awaiting T1 Review (Morpheus)
