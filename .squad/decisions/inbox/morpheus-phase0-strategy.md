# Phase 0 Strategy — Architectural Decisions

**Date:** 2026-03-13
**By:** Morpheus (Lead/Architect)
**Status:** PROPOSED
**Issues:** #1 (epic), #2, #3, #4, #5

## Decision 1: Context Hygiene as Foundational Engineering

FFS proved that unconstrained `.squad/` files kill agent performance. SS treats this as an **engineering constraint**, not a guideline.

**Hard limits:** history.md ≤8KB, decisions.md ≤15KB, any .squad/ file ≤15KB, total .squad/ ≤100KB. Auto-archive at 80%. Enforced by GitHub Action + Ralph-watch.

## Decision 2: Upstream/Downstream Management Model

Inspired by Tamir Dresher's `upstream.json` pattern. SS is upstream backbone; managed companies (FFS first) are downstream. SS controls policies and framework; downstream owns content and domain skills. Intervention follows a 4-step protocol: Observe → Recommend → Intervene → Embed.

## Decision 3: Audit-First Approach to FFS

No ad-hoc exploration. Structured audit checklist covering: context health, architecture, squad setup, governance effectiveness, autonomy gaps. Reusable template for any future downstream company.

## Decision 4: Gate-Based Readiness

SS must prove its own competence before touching FFS. Five gates: context hygiene, autonomous operation, management framework, skills readiness, founder sign-off. All MUST gates pass + SHOULD gates at 80%.

## Decision 5: Issues as Work System

Per FFS's proven pattern, GitHub Issues are the canonical work system. No 56KB planning docs. Epic (#1) + 4 focused sub-issues. Each deliverable is independently trackable and closeable.

## Reference Architecture

- Brady Gaster: Squad framework, skills system, ralph-watch patterns
- Tamir Dresher: `upstream.json`, squad-monitor, personal demo patterns
- FFS: 21 weeks of learnings (governance, ceremonies, quality gates) — cherry-pick ~75%
