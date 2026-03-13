---
name: "prd"
description: "Generate high-quality Product Requirements Documents (PRDs) for software systems and AI-powered features. Includes executive summaries, user stories, technical specifications, and risk analysis."
domain: "product"
confidence: "low"
source: "inherited from FFS"
---

## Context

Design comprehensive, production-grade Product Requirements Documents (PRDs) that bridge the gap between business vision and technical execution. This skill works for modern software systems, ensuring that requirements are clearly defined.

## When to Use

- Starting a new product or feature development cycle
- Translating a vague idea into a concrete technical specification
- Defining requirements for AI-powered features
- Stakeholders need a unified "source of truth" for project scope

## Operational Workflow

### Phase 1: Discovery

Before writing a single line of the PRD, interrogate the user to fill knowledge gaps. Do not assume context. Ask about: the core problem, success metrics, and constraints (budget, tech stack, deadline).

### Phase 2: Analysis & Scoping

Synthesize the user's input. Map out user flows. Define non-goals to protect the timeline.

### Phase 3: Technical Drafting

Generate the document using the PRD Schema below.

## PRD Quality Standards

Use concrete, measurable criteria. Avoid "fast", "easy", or "intuitive".

```diff
# Vague (BAD)
- The search should be fast and return relevant results.

# Concrete (GOOD)
+ The search must return results within 200ms for a 10k record dataset.
+ The search algorithm must achieve >= 85% Precision@10 in benchmark evals.
```

## Strict PRD Schema

### 1. Executive Summary
- **Problem Statement**: 1-2 sentences on the pain point.
- **Proposed Solution**: 1-2 sentences on the fix.
- **Success Criteria**: 3-5 measurable KPIs.

### 2. User Experience & Functionality
- **User Personas**: Who is this for?
- **User Stories**: `As a [user], I want to [action] so that [benefit].`
- **Acceptance Criteria**: Bulleted "Done" definitions for each story.
- **Non-Goals**: What we are NOT building.

### 3. AI System Requirements (If Applicable)
- **Tool Requirements**: What tools and APIs are needed?
- **Evaluation Strategy**: How to measure output quality and accuracy.

### 4. Technical Specifications
- **Architecture Overview**: Data flow and component interaction.
- **Integration Points**: APIs, DBs, and Auth.
- **Security & Privacy**: Data handling and compliance.

### 5. Risks & Roadmap
- **Phased Rollout**: MVP → v1.1 → v2.0.
- **Technical Risks**: Latency, cost, or dependency failures.

## Anti-Patterns

- **Skip Discovery** — Never write a PRD without asking at least 2 clarifying questions first
- **Hallucinate Constraints** — If the user didn't specify a tech stack, ask or label it as `TBD`
