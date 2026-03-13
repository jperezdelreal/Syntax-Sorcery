#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const gddFile = (() => {
  const idx = args.indexOf('--file');
  return idx !== -1 ? args[idx + 1] : null;
})();

if (require.main === module) {
  if (!gddFile) {
    console.error('Usage: node gdd-to-issues.js --file <path-to-gdd.md> [--dry-run]');
    process.exit(1);
  }

  if (!fs.existsSync(gddFile)) {
    console.error(`Error: GDD file not found: ${gddFile}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function kebabCase(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content };
  try {
    const meta = yaml.load(match[1]) || {};
    const body = content.slice(match[0].length).trim();
    return { meta, body };
  } catch (err) {
    console.warn(`Warning: Malformed YAML frontmatter — using defaults. (${err.message})`);
    return { meta: {}, body: content };
  }
}

function parseSections(body) {
  const sections = [];
  const lines = body.split('\n');
  let current = null;

  for (const line of lines) {
    const h3 = line.match(/^###\s+(?:\d+\.\s+)?(.+)/);
    const h4 = line.match(/^####\s+(.+)/);

    if (h3) {
      current = { title: h3[1].trim(), level: 3, content: '', subsections: [] };
      sections.push(current);
    } else if (h4 && current) {
      const sub = { title: h4[1].trim(), level: 4, content: '' };
      current.subsections.push(sub);
    } else if (current) {
      const target = current.subsections.length > 0
        ? current.subsections[current.subsections.length - 1]
        : current;
      target.content += line + '\n';
    }
  }
  return sections;
}

function extractChecklistItems(content) {
  const items = [];
  const re = /^-\s*\[[ x]\]\s*(.+)/gm;
  let m;
  while ((m = re.exec(content)) !== null) items.push(m[1].trim());
  return items;
}

function extractListItems(content) {
  const items = [];
  const re = /^-\s+(.+)/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const text = m[1].replace(/^\[[ x]\]\s*/, '').trim();
    if (text) items.push(text);
  }
  return items;
}

function hasBlockingUnknown(text) {
  return /blocking\s+unknown/i.test(text);
}

function statusLabel(status) {
  switch ((status || '').toLowerCase()) {
    case 'initial': return 'status:exploratory';
    case 'draft': case 'vision': return 'status:planning';
    case 'final': return 'status:ready';
    default: return 'status:planning';
  }
}

function scopeLabel(scope) {
  switch ((scope || '').toLowerCase()) {
    case 'high': return 'scope:large';
    case 'medium': return 'scope:medium';
    case 'low': return 'scope:small';
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------
module.exports = { slugify, kebabCase, parseFrontmatter, parseSections, extractChecklistItems, extractListItems, hasBlockingUnknown, statusLabel, scopeLabel };

// ---------------------------------------------------------------------------
// Issue creation via `gh` CLI
// ---------------------------------------------------------------------------
function createIssue(title, body, labels) {
  const labelStr = labels.filter(Boolean).join(',');
  const report = { title, labels: labels.filter(Boolean) };

  if (dryRun) {
    console.log(`[DRY-RUN] Would create issue:`);
    console.log(`  Title:  ${title}`);
    console.log(`  Labels: ${labelStr}`);
    console.log(`  Body:   (${body.length} chars)`);
    console.log('');
    return { number: `dry-${Date.now()}`, title, url: '(dry-run)' };
  }

  try {
    // Write body to temp file to avoid shell escaping issues
    const tmpFile = path.join(process.env.RUNNER_TEMP || require('os').tmpdir(), `gdd-issue-${Date.now()}.md`);
    fs.writeFileSync(tmpFile, body, 'utf8');

    const cmd = `gh issue create --title "${title.replace(/"/g, '\\"')}" --body-file "${tmpFile}" --label "${labelStr}"`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

    fs.unlinkSync(tmpFile);

    const urlMatch = result.match(/(https:\/\/github\.com\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : result;
    const numMatch = url.match(/\/issues\/(\d+)/);
    const number = numMatch ? parseInt(numMatch[1]) : null;

    console.log(`✅ Created: #${number || '?'} — ${title}`);
    return { number, title, url };
  } catch (err) {
    console.error(`❌ Failed to create issue "${title}": ${err.message}`);
    return { number: null, title, url: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
function run() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  GDD → Issue Pipeline${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`${'═'.repeat(60)}\n`);

  const raw = fs.readFileSync(gddFile, 'utf8');
  const { meta, body } = parseFrontmatter(raw);

  // Validate required fields
  if (!meta.title) {
    console.error('Error: GDD missing required "title" in YAML frontmatter.');
    process.exit(1);
  }

  const gameTitle = meta.title;
  const gameSlug = slugify(gameTitle);
  const status = meta.status || 'draft';
  const designer = meta.designer || 'unknown';
  const version = meta.version || '1.0';
  const artRequired = (meta.art_required || 'low').toLowerCase();
  const audioRequired = (meta.audio_required || 'none').toLowerCase();
  const mvpScope = meta.mvp_scope || 'medium';
  const teamSize = meta.estimated_team_size || '?';
  const genre = meta.genre || 'Unknown';
  const platforms = Array.isArray(meta.platforms) ? meta.platforms.join(', ') : (meta.platforms || 'TBD');
  const targetAudience = meta.target_audience || 'TBD';
  const coreLoopDuration = meta.core_loop_duration_minutes || '?';
  const techStack = Array.isArray(meta.tech_stack) ? meta.tech_stack.join(', ') : (meta.tech_stack || 'TBD');
  const designPillarsCount = meta.design_pillars_count || '?';
  const blockingUnknowns = meta.blocking_unknowns || 'none';

  // Common labels for all issues from this GDD
  const gameLabels = [`game:${gameSlug}`, `gdd-source:${gameSlug}`];
  const stLabel = statusLabel(status);
  const scLabel = scopeLabel(mvpScope);
  const bodyPrefix = `**GDD Version:** ${version} | **Designer:** ${designer}\n\n`;

  // Feature labels from meta
  const metaLabels = [];
  if (meta.has_combat_system) metaLabels.push('has:combat');
  if (meta.has_multiplayer) metaLabels.push('has:multiplayer');
  if (meta.requires_3d) metaLabels.push('requires:3d');
  if (artRequired === 'high') metaLabels.push('art:high-fidelity');
  if (artRequired === 'medium') metaLabels.push('art:stylized');
  if (audioRequired === 'custom') metaLabels.push('audio:custom-composition');
  if (parseInt(teamSize) > 4) metaLabels.push('needs:collaboration');

  const sections = parseSections(body);
  const createdIssues = [];
  const warnings = [];

  console.log(`📄 GDD: "${gameTitle}" (${status}) by ${designer}`);
  console.log(`   Genre: ${genre} | Platforms: ${platforms}`);
  console.log(`   Art: ${artRequired} | Audio: ${audioRequired} | MVP Scope: ${mvpScope}\n`);

  // -----------------------------------------------------------------------
  // Step 1: Find sections by name
  // -----------------------------------------------------------------------
  const findSection = (pattern) => sections.find(s => new RegExp(pattern, 'i').test(s.title));

  const highConceptSection = findSection('high\\s*concept');
  const designPillarsSection = findSection('design\\s*pillars');
  const coreMechanicsSection = findSection('core\\s*mechanics');
  const artSection = findSection('art.*visual|visual.*style');
  const audioSection = findSection('audio.*music|music.*strategy');
  const gameLoopSection = findSection('game\\s*loop|progression');
  const techArchSection = findSection('technical\\s*architecture');
  const contentScopeSection = findSection('content.*scope');
  const testingSection = findSection('success\\s*criteria|testing');
  const depsSection = findSection('dependencies.*critical|critical.*path');

  // -----------------------------------------------------------------------
  // Step 2: Create Epic from High Concept
  // -----------------------------------------------------------------------
  console.log('── Creating Epic ──────────────────────────────────────');

  const epicBody = bodyPrefix +
    `# High Concept\n\n` +
    `**Genre:** ${genre}\n` +
    `**Platforms:** ${platforms}\n` +
    `**Target Audience:** ${targetAudience}\n` +
    `**Core Loop:** ${coreLoopDuration} minutes\n\n` +
    (highConceptSection ? `**Vision:**\n${highConceptSection.content.trim()}\n\n` : '') +
    `---\n\n## Scope\n` +
    `- **MVP Scope:** ${mvpScope}\n` +
    `- **Estimated Team Size:** ${teamSize}\n` +
    `- **Tech Stack:** ${techStack}\n` +
    `- **Design Pillars:** ${designPillarsCount}\n` +
    `- **Blocking Unknowns:** ${blockingUnknowns}\n\n` +
    `---\n*Source: [GDD](${gddFile})*`;

  const epicLabels = ['type:epic', 'component:design', 'priority:p0', stLabel, scLabel, ...gameLabels, ...metaLabels].filter(Boolean);
  const epic = createIssue(`[Epic] Game: ${gameTitle}`, epicBody, epicLabels);
  createdIssues.push({ ...epic, type: 'epic' });

  if (!highConceptSection) {
    warnings.push('Missing "High Concept" section — Epic created with metadata only.');
  }

  // -----------------------------------------------------------------------
  // Step 3: Design Pillars — NO issues, just log
  // -----------------------------------------------------------------------
  if (designPillarsSection) {
    console.log('\n── Design Pillars (reference only, no issues) ────────');
    console.log(`   Found ${designPillarsSection.content.split(/^\d+\./m).length - 1} pillars — stored as metadata.`);
  }

  // -----------------------------------------------------------------------
  // Step 4: Core Mechanics → Feature issues
  // -----------------------------------------------------------------------
  if (coreMechanicsSection && coreMechanicsSection.subsections.length > 0) {
    console.log('\n── Core Mechanics ─────────────────────────────────────');
    for (const sub of coreMechanicsSection.subsections) {
      const whatMatch = sub.content.match(/\*\*What:\*\*\s*(.+)/i);
      const whyMatch = sub.content.match(/\*\*Why:\*\*\s*(.+)/i);
      const interactionMatch = sub.content.match(/\*\*Interaction:\*\*\s*(.+)/i);
      const stateMatch = sub.content.match(/\*\*State:\*\*\s*(.+)/i);
      const isBlocking = hasBlockingUnknown(sub.content);

      const issueBody = bodyPrefix +
        `## Overview\n${whatMatch ? whatMatch[1] : sub.content.trim()}\n\n` +
        `## Why This Matters\n${whyMatch ? whyMatch[1] : 'See GDD.'}\n\n` +
        `## Design Details\n` +
        `- **Interactions:** ${interactionMatch ? interactionMatch[1] : 'N/A'}\n` +
        `- **State Management:** ${stateMatch ? stateMatch[1] : 'N/A'}\n\n` +
        `## Acceptance Criteria\n` +
        `- [ ] System implemented in code\n` +
        `- [ ] Integrated with referenced mechanics\n` +
        `- [ ] Playtested (runs for ≥1 full cycle)\n` +
        `- [ ] No blocking unknowns remain\n\n` +
        (epic.number ? `Part of #${epic.number}` : '');

      const priority = isBlocking ? 'priority:p0' : 'priority:p1';
      const labels = ['type:feature', 'component:gameplay', priority, ...gameLabels];
      if (isBlocking) labels.push('needs:research');

      const issue = createIssue(`Implement ${sub.title}`, issueBody, labels);
      createdIssues.push({ ...issue, type: 'feature' });
    }
  } else if (!coreMechanicsSection) {
    warnings.push('Missing "Core Mechanics" section.');
    const placeholder = createIssue(
      `Design: Core Mechanics for ${gameTitle}`,
      bodyPrefix + `Placeholder — GDD missing Core Mechanics section.\n\nPart of #${epic.number || '?'}`,
      ['type:feature', 'component:gameplay', 'priority:p1', 'needs:research', ...gameLabels]
    );
    createdIssues.push({ ...placeholder, type: 'placeholder' });
  }

  // -----------------------------------------------------------------------
  // Step 5: Art & Visual Style
  // -----------------------------------------------------------------------
  if (artSection && artRequired !== 'none') {
    console.log('\n── Art & Visual Style ──────────────────────────────────');
    if (artRequired === 'high') {
      // Create Art Sprint epic
      const artEpicBody = bodyPrefix +
        `# Art Sprint: ${gameTitle}\n\n${artSection.content.trim()}\n` +
        artSection.subsections.map(s => `\n#### ${s.title}\n${s.content.trim()}`).join('\n') +
        `\n\nPart of #${epic.number || '?'}`;
      const artEpic = createIssue(
        `Art Sprint: ${gameTitle}`,
        artEpicBody,
        ['type:epic', 'component:art', 'priority:p1', ...gameLabels]
      );
      createdIssues.push({ ...artEpic, type: 'epic' });

      // Parse asset categories from content
      const allContent = artSection.content + artSection.subsections.map(s => s.content).join('\n');
      const assetLines = allContent.match(/^\s*-\s+(?:Tiles|Plants|Characters|NPCs|Weather|VFX|UI|Seasonal|Items|Enemies|Backgrounds|Icons).*$/gmi) || [];
      for (const line of assetLines) {
        const assetName = line.replace(/^\s*-\s+/, '').trim();
        const assetBody = bodyPrefix +
          `## Asset Details\n- ${assetName}\n\n` +
          `## Acceptance Criteria\n- [ ] Assets created per spec\n- [ ] Integrated into game\n\n` +
          `Part of #${artEpic.number || '?'}`;
        const issue = createIssue(
          `Create ${assetName}`,
          assetBody,
          ['type:asset', 'component:art', 'priority:p1', ...gameLabels]
        );
        createdIssues.push({ ...issue, type: 'asset' });
      }
    } else {
      // medium/low → single issue
      const titlePrefix = artRequired === 'low' ? 'Placeholder Art' : 'Art Specification';
      const artBody = bodyPrefix +
        `# ${titlePrefix}: ${gameTitle}\n\n` +
        artSection.content.trim() + '\n' +
        artSection.subsections.map(s => `\n#### ${s.title}\n${s.content.trim()}`).join('\n') +
        `\n\nPart of #${epic.number || '?'}`;
      const issue = createIssue(
        `${titlePrefix}: ${gameTitle}`,
        artBody,
        [artRequired === 'low' ? 'type:asset' : 'type:design', 'component:art', 'priority:p1', ...gameLabels]
      );
      createdIssues.push({ ...issue, type: 'art' });
    }
  }

  // -----------------------------------------------------------------------
  // Step 6: Audio & Music Strategy
  // -----------------------------------------------------------------------
  if (audioSection && audioRequired !== 'none') {
    console.log('\n── Audio & Music ───────────────────────────────────────');
    const allAudioContent = audioSection.content.trim() + '\n' +
      audioSection.subsections.map(s => `#### ${s.title}\n${s.content.trim()}`).join('\n');

    if (audioRequired === 'procedural') {
      const audioBody = bodyPrefix +
        `## Audio Strategy\n${allAudioContent}\n\n` +
        `## Acceptance Criteria\n` +
        `- [ ] All key SFX generated\n` +
        `- [ ] Audio loops seamlessly\n` +
        `- [ ] SFX feedback clear on gameplay events\n\n` +
        `Part of #${epic.number || '?'}`;
      const issue = createIssue(
        `Audio Design (Procedural): ${gameTitle}`,
        audioBody,
        ['type:audio', 'component:audio', 'priority:p2', ...gameLabels]
      );
      createdIssues.push({ ...issue, type: 'audio' });
    } else {
      // sample-based or custom → epic with sub-issues
      const audioEpicBody = bodyPrefix +
        `# Audio Production: ${gameTitle}\n\n${allAudioContent}\n\nPart of #${epic.number || '?'}`;
      const audioEpic = createIssue(
        `Audio Production: ${gameTitle}`,
        audioEpicBody,
        ['type:epic', 'component:audio', 'priority:p1', ...gameLabels]
      );
      createdIssues.push({ ...audioEpic, type: 'epic' });

      for (const taskName of ['Compose Music', 'Produce SFX']) {
        const issue = createIssue(
          `${taskName}: ${gameTitle}`,
          bodyPrefix + `Part of #${audioEpic.number || '?'}`,
          ['type:audio', 'component:audio', 'priority:p1', ...gameLabels]
        );
        createdIssues.push({ ...issue, type: 'audio' });
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 7: Game Loop & Progression
  // -----------------------------------------------------------------------
  if (gameLoopSection) {
    console.log('\n── Game Loop & Progression ─────────────────────────────');
    const perRunSub = gameLoopSection.subsections.find(s => /per.?run/i.test(s.title));
    const metaSub = gameLoopSection.subsections.find(s => /meta.?progression/i.test(s.title));

    const perRunBody = bodyPrefix +
      `## Loop Structure\n${perRunSub ? perRunSub.content.trim() : gameLoopSection.content.trim()}\n\n` +
      `## Acceptance Criteria\n` +
      `- [ ] Full 1 run completes end-to-end\n` +
      `- [ ] All loop steps execute in order\n` +
      `- [ ] End condition triggers correctly\n` +
      `- [ ] Results displayed to player\n\n` +
      `Part of #${epic.number || '?'}`;
    const perRunIssue = createIssue(
      `Implement Per-Run Loop: ${gameTitle}`,
      perRunBody,
      ['type:feature', 'component:gameplay', 'priority:p0', ...gameLabels]
    );
    createdIssues.push({ ...perRunIssue, type: 'feature' });

    const metaBody = bodyPrefix +
      `## Progression Model\n${metaSub ? metaSub.content.trim() : 'See GDD.'}\n\n` +
      `## Acceptance Criteria\n` +
      `- [ ] Unlocks persist across runs\n` +
      `- [ ] Unlock timing matches spec\n` +
      `- [ ] Player sees unlock notifications\n` +
      `- [ ] Progression speed feels rewarding\n\n` +
      (perRunIssue.number ? `Blocked by #${perRunIssue.number}\n` : '') +
      `Part of #${epic.number || '?'}`;
    const metaIssue = createIssue(
      `Implement Meta-Progression: ${gameTitle}`,
      metaBody,
      ['type:feature', 'component:progression', 'priority:p1', ...gameLabels]
    );
    createdIssues.push({ ...metaIssue, type: 'feature' });
  }

  // -----------------------------------------------------------------------
  // Step 8: Technical Architecture
  // -----------------------------------------------------------------------
  if (techArchSection) {
    console.log('\n── Technical Architecture ──────────────────────────────');
    const allTechContent = techArchSection.content.trim() + '\n' +
      techArchSection.subsections.map(s => `#### ${s.title}\n${s.content.trim()}`).join('\n');

    const techBody = bodyPrefix +
      `## Technology Stack\n${allTechContent}\n\n` +
      `## Acceptance Criteria\n` +
      `- [ ] Architecture document approved\n` +
      `- [ ] Technology choices tested for performance\n` +
      `- [ ] Build pipeline set up\n` +
      `- [ ] Performance targets achievable (prototype)\n\n` +
      `Part of #${epic.number || '?'}`;
    const issue = createIssue(
      `Architecture Design: ${gameTitle}`,
      techBody,
      ['type:technical', 'component:architecture', 'priority:p0', ...gameLabels]
    );
    createdIssues.push({ ...issue, type: 'technical' });
  } else {
    warnings.push('Missing "Technical Architecture" section.');
    const placeholder = createIssue(
      `Design: Technical Architecture for ${gameTitle}`,
      bodyPrefix + `Placeholder — GDD missing Technical Architecture section.\n\nPart of #${epic.number || '?'}`,
      ['type:technical', 'component:architecture', 'priority:p1', 'needs:research', ...gameLabels]
    );
    createdIssues.push({ ...placeholder, type: 'placeholder' });
  }

  // -----------------------------------------------------------------------
  // Step 9: Content & Scope
  // -----------------------------------------------------------------------
  if (contentScopeSection) {
    console.log('\n── Content & Scope ─────────────────────────────────────');
    const mvpSub = contentScopeSection.subsections.find(s => /mvp|must\s*have/i.test(s.title));
    const postMvpSub = contentScopeSection.subsections.find(s => /post.?mvp|nice\s*to\s*have/i.test(s.title));
    const stretchSub = contentScopeSection.subsections.find(s => /stretch|experimental/i.test(s.title));

    if (mvpSub) {
      for (const item of extractListItems(mvpSub.content)) {
        const issue = createIssue(
          `Feature: ${item}`,
          bodyPrefix + `## Feature\n${item}\n\n## Acceptance Criteria\n- [ ] Implemented and testable\n\nPart of #${epic.number || '?'}`,
          ['type:feature', 'priority:p0', ...gameLabels]
        );
        createdIssues.push({ ...issue, type: 'feature' });
      }
    }

    if (postMvpSub) {
      for (const item of extractListItems(postMvpSub.content)) {
        const issue = createIssue(
          `Feature (Post-MVP): ${item}`,
          bodyPrefix + `## Feature\n${item}\n\nPart of #${epic.number || '?'}`,
          ['type:feature', 'priority:p1', ...gameLabels]
        );
        createdIssues.push({ ...issue, type: 'feature' });
      }
    }

    if (stretchSub) {
      for (const item of extractListItems(stretchSub.content)) {
        const issue = createIssue(
          `Exploration: ${item}`,
          bodyPrefix + `## Exploration\n${item}\n\nPart of #${epic.number || '?'}`,
          ['type:research', 'priority:p2', ...gameLabels]
        );
        createdIssues.push({ ...issue, type: 'research' });
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 10: Success Criteria & Testing
  // -----------------------------------------------------------------------
  if (testingSection) {
    console.log('\n── Success Criteria & Testing ──────────────────────────');
    const funcReqSub = testingSection.subsections.find(s => /functional/i.test(s.title));
    const qualitySub = testingSection.subsections.find(s => /quality/i.test(s.title));
    const blockerSub = testingSection.subsections.find(s => /known|blocker/i.test(s.title));

    // Functional Requirements checklist
    const allTestContent = testingSection.content.trim() + '\n' +
      testingSection.subsections.map(s => `#### ${s.title}\n${s.content.trim()}`).join('\n');
    const checkItems = extractChecklistItems(allTestContent);

    const funcBody = bodyPrefix +
      `## Functional Requirements\n` +
      (funcReqSub ? funcReqSub.content.trim() : checkItems.map(i => `- [ ] ${i}`).join('\n')) + '\n\n' +
      `Part of #${epic.number || '?'}`;
    const funcIssue = createIssue(
      `Testing: ${gameTitle} Functional Requirements`,
      funcBody,
      ['type:qa', 'component:testing', 'priority:p0', ...gameLabels]
    );
    createdIssues.push({ ...funcIssue, type: 'qa' });

    // Quality Gates & Blockers (if blockers exist)
    if (blockerSub || qualitySub) {
      const qBody = bodyPrefix +
        (qualitySub ? `## Quality Gates\n${qualitySub.content.trim()}\n\n` : '') +
        (blockerSub ? `## Known Blocking Issues\n${blockerSub.content.trim()}\n\n` : '') +
        `Part of #${epic.number || '?'}`;
      const qIssue = createIssue(
        `Testing: ${gameTitle} Quality Gates & Blockers`,
        qBody,
        ['type:qa', 'component:testing', 'priority:p0', ...gameLabels]
      );
      createdIssues.push({ ...qIssue, type: 'qa' });
    }

    // Investigation issues for each blocking unknown
    if (blockerSub) {
      const blockerLines = blockerSub.content.match(/\*\*Blocking Unknown[^*]*\*\*[^*]*/gi) || [];
      for (const bl of blockerLines) {
        const nameMatch = bl.match(/\*\*Blocking Unknown:\s*([^.*]+)/i);
        if (nameMatch) {
          const issue = createIssue(
            `Investigation: ${nameMatch[1].trim()}`,
            bodyPrefix + `${bl.trim()}\n\nPart of #${funcIssue.number || '?'}`,
            ['type:research', 'priority:p0', 'needs:prototype', ...gameLabels]
          );
          createdIssues.push({ ...issue, type: 'research' });
        }
      }
    }
  } else {
    warnings.push('Missing "Success Criteria" section.');
    const placeholder = createIssue(
      `Testing: ${gameTitle} (requirements TBD)`,
      bodyPrefix + `Placeholder — GDD missing Success Criteria section.\n\nPart of #${epic.number || '?'}`,
      ['type:qa', 'component:testing', 'priority:p1', ...gameLabels]
    );
    createdIssues.push({ ...placeholder, type: 'placeholder' });
  }

  // -----------------------------------------------------------------------
  // Step 11: Dependencies & Critical Path
  // -----------------------------------------------------------------------
  if (depsSection) {
    console.log('\n── Dependencies & Critical Path ────────────────────────');
    const allDepsContent = depsSection.content.trim() + '\n' +
      depsSection.subsections.map(s => `#### ${s.title}\n${s.content.trim()}`).join('\n');

    // Milestone epic
    const msBody = bodyPrefix +
      `## Critical Path\n${allDepsContent}\n\n` +
      `Part of #${epic.number || '?'}`;
    const msEpic = createIssue(
      `[Milestone] ${gameTitle} Development Path`,
      msBody,
      ['type:milestone', 'priority:p0', ...gameLabels]
    );
    createdIssues.push({ ...msEpic, type: 'milestone' });

    // Phase tasks from Critical Path sub-section
    const cpSub = depsSection.subsections.find(s => /critical\s*path/i.test(s.title));
    if (cpSub) {
      const phases = cpSub.content.match(/^\d+\.\s+\*\*(.+?)\*\*/gm) || [];
      for (const phase of phases) {
        const phaseNameMatch = phase.match(/\*\*(.+?)\*\*/);
        if (phaseNameMatch) {
          const phaseName = phaseNameMatch[1].replace(/:$/, '').trim();
          const issue = createIssue(
            `Phase: ${phaseName}`,
            bodyPrefix + `Phase task for ${gameTitle}.\n\nPart of #${msEpic.number || '?'}`,
            ['type:milestone', 'priority:p0', ...gameLabels]
          );
          createdIssues.push({ ...issue, type: 'milestone' });
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Summary`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Game:    ${gameTitle}`);
  console.log(`  Issues:  ${createdIssues.length} created${dryRun ? ' (dry run)' : ''}`);
  console.log(`  Epics:   ${createdIssues.filter(i => i.type === 'epic').length}`);
  console.log(`  Features: ${createdIssues.filter(i => i.type === 'feature').length}`);
  console.log(`  Assets:  ${createdIssues.filter(i => i.type === 'asset').length}`);
  console.log(`  Audio:   ${createdIssues.filter(i => i.type === 'audio').length}`);
  console.log(`  QA:      ${createdIssues.filter(i => i.type === 'qa').length}`);
  console.log(`  Research: ${createdIssues.filter(i => i.type === 'research').length}`);
  console.log(`  Milestones: ${createdIssues.filter(i => i.type === 'milestone').length}`);

  if (warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings:`);
    for (const w of warnings) console.log(`     - ${w}`);
  }
  console.log('');

  // -----------------------------------------------------------------------
  // Pipeline integration: label epic + write issues manifest
  // -----------------------------------------------------------------------
  if (epic.number && !dryRun) {
    try {
      execSync(`gh issue edit ${epic.number} --add-label "pipeline:issues"`, {
        encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`  🏷️  Added pipeline:issues label to Epic #${epic.number}`);
    } catch (err) {
      console.warn(`  ⚠️  Could not add pipeline:issues label: ${err.message}`);
    }
  }

  // Write issues manifest to .pipeline/{slug}/issues.json
  const pipelineDir = path.join(path.dirname(gddFile), '..', '.pipeline', gameSlug);
  const manifestPath = path.join(pipelineDir, 'issues.json');
  const manifest = createdIssues.map(i => ({
    number: i.number,
    title: i.title,
    type: i.type,
    url: i.url
  }));

  try {
    if (!fs.existsSync(pipelineDir)) {
      fs.mkdirSync(pipelineDir, { recursive: true });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`  📋 Issues manifest written to: ${manifestPath}`);
  } catch (err) {
    console.warn(`  ⚠️  Could not write manifest: ${err.message}`);
  }

  // JSON report
  const report = {
    game: gameTitle,
    slug: gameSlug,
    epic_number: epic.number,
    issues_created: manifest,
    warnings
  };

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `report=${JSON.stringify(report)}\n`);
  }

  return report;
}

if (require.main === module) {
  run();
}
