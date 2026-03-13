# Work Routing

## TLDR
Work routes by domain: Morpheus (architecture), Trinity (full-stack code), Tank (infra/CI), Switch (testing/QA), Oracle (docs/research), @copilot (well-defined async tasks). Issues triaged via `squad` label → `squad:{member}` assignment.

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture & design | Morpheus | System design, technical decisions, architecture proposals |
| Frontend code | Trinity | React/Next.js components, UI, client-side logic |
| Backend code | Trinity | APIs, services, database schemas, server logic |
| Full-stack features | Trinity | End-to-end implementation, feature development |
| Azure infrastructure | Tank | Container Apps, Functions, Storage, Key Vault, networking |
| CI/CD & deployment | Tank | GitHub Actions workflows, deployment automation, IaC |
| Cost optimization | Tank | Azure budget monitoring, resource right-sizing |
| Testing & QA | Switch | Unit tests, integration tests, E2E tests, quality gates |
| Code review (quality) | Switch | PR review for correctness, edge cases, test coverage |
| Code review (architecture) | Morpheus | PR review for design patterns, separation of concerns |
| Product specs & PRDs | Oracle | Requirements, acceptance criteria, user stories |
| Documentation | Oracle | README, API docs, guides, architecture docs |
| Research & analysis | Oracle | Technology evaluation, competitive analysis, feasibility |
| Skill extraction | Oracle | Identify and document reusable patterns from work |
| UI/UX design, aesthetics, branding | Mouse | Visual polish, CSS, responsive design, animations, color palettes |
| Async issue work (bugs, tests, small features) | @copilot 🤖 | Well-defined tasks matching capability profile |
| Session logging | Scribe | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, evaluate @copilot fit, assign `squad:{member}` label | Morpheus |
| `squad:morpheus` | Architecture decisions, cross-functional coordination | Morpheus |
| `squad:trinity` | Application code — frontend, backend, APIs, features | Trinity |
| `squad:tank` | Infrastructure, CI/CD, Azure, deployment | Tank |
| `squad:switch` | Testing, quality gates, code review | Switch |
| `squad:oracle` | Documentation, specs, research, skill extraction | Oracle |
| `squad:copilot` | Assign to @copilot for autonomous work (if enabled) | @copilot 🤖 |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, the **Lead** triages it — analyzing content, evaluating @copilot's capability profile, assigning the right `squad:{member}` label, and commenting with triage notes.
2. **@copilot evaluation:** The Lead checks if the issue matches @copilot's capability profile (🟢 good fit / 🟡 needs review / 🔴 not suitable). If it's a good fit, the Lead may route to `squad:copilot` instead of a squad member.
3. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
4. When `squad:copilot` is applied and auto-assign is enabled, `@copilot` is assigned on the issue and picks it up autonomously.
5. Members can reassign by removing their label and adding another member's label.
6. The `squad` label is the "inbox" — untriaged issues waiting for Lead review.

### Lead Triage Guidance for @copilot

When triaging, the Lead should ask:

1. **Is this well-defined?** Clear title, reproduction steps or acceptance criteria, bounded scope → likely 🟢
2. **Does it follow existing patterns?** Adding a test, fixing a known bug, updating a dependency → likely 🟢
3. **Does it need design judgment?** Architecture, API design, UX decisions → likely 🔴
4. **Is it security-sensitive?** Auth, encryption, access control → always 🔴
5. **Is it medium complexity with specs?** Feature with clear requirements, refactoring with tests → likely 🟡

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
8. **@copilot routing** — when evaluating issues, check @copilot's capability profile in `team.md`. Route 🟢 good-fit tasks to `squad:copilot`. Flag 🟡 needs-review tasks for PR review. Keep 🔴 not-suitable tasks with squad members.
