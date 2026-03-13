# Decision: Downstream Company Management Framework

**Date:** 2026-03-13
**By:** Morpheus (Lead/Architect)
**Status:** PROPOSED
**Issue:** #3

## What
Defined the Autonomous Company Management Framework at `.squad/identity/downstream-management.md`. Establishes: (1) upstream/downstream relationship model — SS controls policies, gates, infra; downstream owns domain, projects, team, (2) 5-step intervention protocol for modifying live autonomous systems (announce → pause → intervene → validate → resume), (3) health monitoring via 5 metrics (issue throughput, file sizes, ralph-watch uptime, error rate, context window size), (4) `upstream.json` schema for downstream repos to declare inheritance and overrides.

## Why
SS must manage FFS (and future companies) without breaking them. This framework codifies the control boundaries and safety protocols needed for upstream governance of live autonomous systems. Inspired by Tamir Dresher's `upstream.json` pattern and FFS's Zone A/B/C model.
