# Syntax Sorcery Roadmap

## TLDR
Refine autonomy infrastructure, strengthen perpetual motion engine, establish visibility patterns for downstream repos. Max 3 features. Scope: infrastructure only, no new products.

---

## Feature 1: [ ] Enhance perpetual-motion.yml with failure recovery
Improve the perpetual motion workflow to gracefully handle GitHub API rate limits and transient failures with exponential backoff.

- Implement exponential backoff on failed GitHub API calls (2s, 4s, 8s, 16s)
- Log all retries and failures to motor-log with retry count
- Skip issue creation on rate limit, but don't fail workflow
- Verify workflow recovers correctly with 5 sequential test runs
- Files: `.github/workflows/perpetual-motion.yml`
- Context: Prevents workflow cascade failures when GitHub API is flaky

## Feature 2: [ ] Create squad watch CLI autonomous mode
Extend squad-watch to operate fully autonomously, detecting roadmap exhaustion and auto-triggering roadmap definition.

- Add `--autonomous` flag to squad-watch that runs continuously (5 min polling)
- Detect "Define next roadmap" issues via label scanning
- Auto-trigger roadmap definition workflow without user input
- Log autonomy decisions to .squad/autonomy-log
- Files: `scripts/squad-watch.sh`, `.squad/autonomy-log/`
- Context: Closes the autonomy loop — no human intervention needed for refueling

## Feature 3: [ ] Document perpetual motion architecture for new maintainers
Create comprehensive guide explaining how the perpetual motion engine works, troubleshooting, and extension patterns.

- Architecture overview (event-driven design, rate limiting strategy)
- Roadmap format specification with examples
- Troubleshooting guide (workflow stuck, rate limit exceeded, roadmap parsing errors)
- Extension guide (custom issue templates, custom fields, chaining workflows)
- Diagrams: workflow state machine, data flow
- Files: `docs/perpetual-motion-guide.md`
- Context: Enables other repos to adopt perpetual motion independently
