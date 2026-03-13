const path = require('path');
const fs = require('fs');
const {
  slugify,
  kebabCase,
  parseFrontmatter,
  parseSections,
  extractChecklistItems,
  extractListItems,
  hasBlockingUnknown,
  statusLabel,
  scopeLabel
} = require('../gdd-to-issues');

const fixture = (name) => path.join(__dirname, 'fixtures', name);
const readFixture = (name) => fs.readFileSync(fixture(name), 'utf8');

// ---------------------------------------------------------------------------
// slugify / kebabCase
// ---------------------------------------------------------------------------
describe('slugify', () => {
  it('converts titles to kebab-case slugs', () => {
    expect(slugify('Chrono Tiles')).toBe('chrono-tiles');
    expect(slugify('My Awesome Game!')).toBe('my-awesome-game');
    expect(slugify('UPPER CASE')).toBe('upper-case');
  });

  it('handles edge cases', () => {
    expect(slugify('---dashes---')).toBe('dashes');
    expect(slugify('a')).toBe('a');
  });
});

describe('kebabCase', () => {
  it('behaves identically to slugify', () => {
    expect(kebabCase('Test Game')).toBe(slugify('Test Game'));
    expect(kebabCase('Another One!')).toBe(slugify('Another One!'));
  });
});

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------
describe('parseFrontmatter', () => {
  it('parses valid GDD frontmatter', () => {
    const raw = readFixture('valid-gdd.md');
    const { meta, body } = parseFrontmatter(raw);
    expect(meta.title).toBe('Test Game');
    expect(meta.status).toBe('draft');
    expect(meta.genre).toBe('Puzzle');
    expect(body).toContain('### 1. High Concept');
  });

  it('returns empty meta for files with no frontmatter', () => {
    const { meta, body } = parseFrontmatter('Just plain text, no YAML.');
    expect(meta).toEqual({});
    expect(body).toBe('Just plain text, no YAML.');
  });

  it('handles empty files gracefully', () => {
    const raw = readFixture('empty-gdd.md');
    const { meta, body } = parseFrontmatter(raw);
    expect(meta).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// parseSections
// ---------------------------------------------------------------------------
describe('parseSections', () => {
  it('extracts all 10 sections from valid GDD', () => {
    const raw = readFixture('valid-gdd.md');
    const { body } = parseFrontmatter(raw);
    const sections = parseSections(body);
    expect(sections.length).toBe(10);
    expect(sections[0].title).toContain('High Concept');
  });

  it('extracts subsections (h4) within sections', () => {
    const raw = readFixture('valid-gdd.md');
    const { body } = parseFrontmatter(raw);
    const sections = parseSections(body);
    const coreMechanics = sections.find(s => /core\s*mechanics/i.test(s.title));
    expect(coreMechanics).toBeDefined();
    expect(coreMechanics.subsections.length).toBeGreaterThanOrEqual(1);
    expect(coreMechanics.subsections[0].title).toBe('Tile Matching');
  });

  it('handles minimal GDD with only 1 section', () => {
    const raw = readFixture('minimal-gdd.md');
    const { body } = parseFrontmatter(raw);
    const sections = parseSections(body);
    expect(sections.length).toBe(1);
    expect(sections[0].title).toContain('High Concept');
  });

  it('returns empty array for empty body', () => {
    const sections = parseSections('');
    expect(sections).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// extractChecklistItems
// ---------------------------------------------------------------------------
describe('extractChecklistItems', () => {
  it('extracts unchecked items', () => {
    const content = '- [ ] First item\n- [ ] Second item\n- [x] Done item';
    const items = extractChecklistItems(content);
    expect(items).toEqual(['First item', 'Second item', 'Done item']);
  });

  it('returns empty for content with no checklists', () => {
    const items = extractChecklistItems('Just regular text, no checkboxes.');
    expect(items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// extractListItems
// ---------------------------------------------------------------------------
describe('extractListItems', () => {
  it('extracts markdown list items', () => {
    const content = '- First\n- Second\n- Third';
    const items = extractListItems(content);
    expect(items).toEqual(['First', 'Second', 'Third']);
  });

  it('strips checkbox prefixes from list items', () => {
    const content = '- [ ] Unchecked\n- [x] Checked';
    const items = extractListItems(content);
    expect(items).toEqual(['Unchecked', 'Checked']);
  });

  it('returns empty for non-list content', () => {
    const items = extractListItems('No list items here.');
    expect(items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// hasBlockingUnknown
// ---------------------------------------------------------------------------
describe('hasBlockingUnknown', () => {
  it('detects blocking unknown text', () => {
    expect(hasBlockingUnknown('This has a blocking unknown issue')).toBe(true);
    expect(hasBlockingUnknown('BLOCKING UNKNOWN: memory cost')).toBe(true);
  });

  it('returns false for normal text', () => {
    expect(hasBlockingUnknown('No issues here')).toBe(false);
    expect(hasBlockingUnknown('blocking something else')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// statusLabel / scopeLabel
// ---------------------------------------------------------------------------
describe('statusLabel', () => {
  it('maps GDD status to issue labels', () => {
    expect(statusLabel('initial')).toBe('status:exploratory');
    expect(statusLabel('draft')).toBe('status:planning');
    expect(statusLabel('vision')).toBe('status:planning');
    expect(statusLabel('final')).toBe('status:ready');
  });

  it('defaults to planning for unknown status', () => {
    expect(statusLabel('foo')).toBe('status:planning');
    expect(statusLabel(null)).toBe('status:planning');
    expect(statusLabel(undefined)).toBe('status:planning');
  });
});

describe('scopeLabel', () => {
  it('maps scope strings to labels', () => {
    expect(scopeLabel('high')).toBe('scope:large');
    expect(scopeLabel('medium')).toBe('scope:medium');
    expect(scopeLabel('low')).toBe('scope:small');
  });

  it('returns null for unknown scope', () => {
    expect(scopeLabel('unknown')).toBeNull();
    expect(scopeLabel(null)).toBeNull();
    expect(scopeLabel(undefined)).toBeNull();
  });
});
