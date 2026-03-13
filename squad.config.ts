import {
  defineSquad,
  defineTeam,
  defineAgent,
  defineRouting,
  defineCasting,
} from '@bradygaster/squad-sdk';

export default defineSquad({
  version: '1.0.0',

  team: defineTeam({
    name: 'syntax-sorcery',
    description: 'Autonomous software development company using AI agents.',
    projectContext:
      '- **Owner:** joperezd\n' +
      '- **Stack:** GitHub CLI, Azure (€500/mo), Squad (Brady Gaster)\n' +
      '- **Universe:** The Matrix\n' +
      '- **Created:** 2026-03-13',
    members: ['morpheus', 'trinity', 'tank', 'switch', 'oracle'],
  }),

  agents: [
    defineAgent({ name: 'morpheus', role: 'Lead/Architect', description: 'Architecture, scope, cross-functional coordination.', status: 'active' }),
    defineAgent({ name: 'trinity', role: 'Full-Stack Developer', description: 'Frontend, backend, APIs, feature development.', status: 'active' }),
    defineAgent({ name: 'tank', role: 'Cloud Engineer', description: 'Azure infra, CI/CD, deployment, cost optimization.', status: 'active' }),
    defineAgent({ name: 'switch', role: 'Tester/QA', description: 'Testing, quality gates, code review.', status: 'active' }),
    defineAgent({ name: 'oracle', role: 'Product & Docs', description: 'Specs, documentation, research, skill extraction.', status: 'active' }),
  ],

  routing: defineRouting({
    rules: [
      { pattern: 'architecture', agents: ['@morpheus'], description: 'System design, technical decisions, code review' },
      { pattern: 'application', agents: ['@trinity'], description: 'Full-stack features, APIs, UI, server logic' },
      { pattern: 'infrastructure', agents: ['@tank'], description: 'Azure, CI/CD, deployment, cost monitoring' },
      { pattern: 'testing', agents: ['@switch'], description: 'Tests, quality gates, PR review' },
      { pattern: 'documentation', agents: ['@oracle'], description: 'Specs, docs, research, skills' },
    ],
    defaultAgent: '@morpheus',
    fallback: 'coordinator',
  }),

  casting: defineCasting({
    allowlistUniverses: ['The Matrix'],
    overflowStrategy: 'generic',
  }),
});
