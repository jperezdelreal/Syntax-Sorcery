# Research: returngis.net

**Author:** Gisela Torres (Microsoft, 18+ years in software development & cloud)  
**Blog Focus:** Backend, Cloud & DevOps, Containers, AI/ML, GitHub, and applied development practices  
**Audience:** Spanish-speaking developers  

## Overview

Gisela's blog is a practical technical resource documenting her hands-on experience at Microsoft and in the development community. She covers modern backend development, cloud infrastructure, containerization, and increasingly AI applied to development workflows. The blog serves as her "notebook"—sharing implementations and patterns she tests daily.

## Key Relevant Topics for Syntax Sorcery

### 1. **AI Agents & Autonomous Workflows** ⭐⭐⭐
- **GitHub Agentic Workflows**: Native workflows without writing YAML—directly relevant to SS's agent coordination patterns
- **Custom Agents as Sub-Agents**: Explains how custom agents become GitHub Copilot sub-agents (directly applicable to Squad architecture)
- **MCP Server as Proxy**: Advanced MCP patterns for multi-agent scenarios (SS uses MCP servers)
- **MCP Streamable HTTP**: Low-level server patterns for inter-agent communication

### 2. **GitHub Copilot & Extensions** ⭐⭐⭐
- GitHub Copilot Chat extensions architecture
- Docker Model Runner integration with Copilot
- Ollama model integration with GitHub Copilot
- GitHub Models with cagent (declarative multi-agent definition)
- Custom agent patterns and sub-agent delegation

### 3. **DevOps & Automation** ⭐⭐
- Pre-commit hooks in Java (pattern transferable to other stacks)
- GitHub Actions automation (changelog generation, static content serving)
- Azure Pipelines trigger workflows from work items
- GitHub Advanced Security integration with DefectDojo
- Dependabot automation across platforms

### 4. **Development Containers** ⭐⭐
- Dev Container configurations for Spring Boot, Quarkus, WordPress plugins
- Containerized development environments for consistent team workflows
- Local model hosting with Ollama in containers

### 5. **Cloud Infrastructure (Azure Focus)** ⭐⭐
- Azure Pipelines automation and integration patterns
- Azure DevOps with GitHub Actions Importer migration
- Static content serving via jsDelivr CDN (cost-free approach)

## Concrete Ideas to Adopt

### Pattern 1: Agentic Workflows
Gisela's exploration of GitHub Agentic Workflows (no YAML required) could inspire SS to expose workflow creation in the @copilot CLI—enabling agents to define their own workflows declaratively rather than through configuration files.

### Pattern 2: Sub-Agent Architecture
Her documentation on making custom agents into sub-agents directly validates SS's planned Squad architecture. This is a proven pattern at GitHub/Microsoft scale.

### Pattern 3: MCP Server Patterns
- **Proxy pattern**: MCP servers acting as proxies for other services (could centralize agent communication)
- **Streamable HTTP**: Better for real-time agent-to-agent streams vs. SSE

### Pattern 4: Dev Container Standardization
Adopting Dev Containers for each SS game/component ensures consistent development environments. This aligns with SS's emphasis on reproducibility.

### Pattern 5: Automated Changelogs & Releases
Gisela's changelog automation pattern (parsing commits → auto-generating release notes) could be integrated into SS's deployment pipeline.

## Technologies & Approaches to Explore

| Topic | Gisela's Approach | SS Relevance |
|-------|------------------|--------------|
| **Agent Composition** | Custom agents → sub-agents | Directly applicable to Squad/Copilot CLI hierarchy |
| **Local AI Models** | Ollama + GitHub Copilot integration | Could run on-premise agents locally before cloud deployment |
| **MCP Patterns** | Proxy, Streamable HTTP | Better inter-agent communication in Hub/Spoke topology |
| **CI/CD** | GitHub Actions Importer, automation | SS pipeline already uses GH Actions; learn Azure Pipelines patterns |
| **Container Dev** | Dev Containers as standard | Adopt for game repos to ensure team consistency |
| **Security** | GHAS + DefectDojo integration | Consider for supply chain security in SS products |

## Key Learnings for SS

1. **Agentic Workflows are nascent but powerful**: Gisela shows GitHub Agentic Workflows are production-ready; SS should prioritize understanding trigger patterns and sub-agent delegation.

2. **MCP is the real infrastructure**: Beyond simple tool exposure, MCP servers can be nested (proxy pattern) and handle streaming—critical for complex agent chains.

3. **Custom agents as components**: Every custom agent is already a potential sub-agent. SS's agent isolation model aligns perfectly.

4. **Dev Containers are now standard**: For distributed agent teams (Squad), containerizing the dev environment removes "works on my machine" issues.

5. **Cloud-native but not cloud-locked**: Gisela balances Azure (Microsoft) with open-source tools (Ollama, open GitHub features), validating SS's hybrid approach.

## Recommended Next Steps

- [ ] Deep-dive on GitHub Agentic Workflows course (Gisela has a course)
- [ ] Study MCP Streamable HTTP for agent-to-agent real-time communication
- [ ] Implement Dev Containers across SS game repositories
- [ ] Evaluate Ollama for on-premise agent reasoning (edge deployment)
- [ ] Adopt changelog automation in SS release pipeline

---

**Research Date:** 2026-03-20  
**Sources:**
- https://www.returngis.net/ (homepage & all categories)
- https://www.returngis.net/sobre-gisela-torres/ (author bio)
- https://www.youtube.com/@returngis (YouTube courses on MCP, GitHub Actions, Containers)
