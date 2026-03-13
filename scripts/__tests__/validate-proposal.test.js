const path = require('path');
const { parseFrontmatter, isKebabCase, validate } = require('../validate-proposal');

const fixture = (name) => path.join(__dirname, 'fixtures', name);

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------
describe('parseFrontmatter', () => {
  it('parses valid YAML frontmatter', () => {
    const content = '---\ntitle: "Test"\nslug: "test"\n---\n\nBody text here.';
    const { meta, body, error } = parseFrontmatter(content);
    expect(error).toBeNull();
    expect(meta.title).toBe('Test');
    expect(meta.slug).toBe('test');
    expect(body).toBe('Body text here.');
  });

  it('returns error for missing frontmatter', () => {
    const content = 'No frontmatter here, just plain text.';
    const { meta, error } = parseFrontmatter(content);
    expect(error).toBe('No YAML frontmatter found');
    expect(meta).toBeNull();
  });

  it('returns error for malformed YAML', () => {
    const content = '---\ntitle: "Bad\n  - broken: [unclosed\n---\n\nBody.';
    const { meta, error } = parseFrontmatter(content);
    expect(error).toMatch(/YAML parse error/);
    expect(meta).toBeNull();
  });

  it('handles empty frontmatter block', () => {
    const content = '---\n\n---\n\nBody text.';
    const { meta, error } = parseFrontmatter(content);
    expect(error).toBeNull();
    expect(meta).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// isKebabCase
// ---------------------------------------------------------------------------
describe('isKebabCase', () => {
  it('accepts valid kebab-case slugs', () => {
    expect(isKebabCase('neon-runner')).toBe(true);
    expect(isKebabCase('chrono-tiles')).toBe(true);
    expect(isKebabCase('game')).toBe(true);
    expect(isKebabCase('a-b-c')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isKebabCase('NotKebab')).toBe(false);
    expect(isKebabCase('has_underscore')).toBe(false);
    expect(isKebabCase('has space')).toBe(false);
    expect(isKebabCase('-leading-dash')).toBe(false);
    expect(isKebabCase('trailing-dash-')).toBe(false);
    expect(isKebabCase('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validate (integration with fixture files)
// ---------------------------------------------------------------------------
describe('validate', () => {
  it('passes a valid proposal', () => {
    const result = validate(fixture('valid-proposal.md'));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.slug).toBe('neon-runner');
    expect(result.meta.genre).toBe('arcade');
  });

  it('fails on missing required fields', () => {
    const result = validate(fixture('missing-fields-proposal.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('slug'))).toBe(true);
    expect(result.errors.some(e => e.includes('platforms'))).toBe(true);
  });

  it('fails on invalid YAML', () => {
    const result = validate(fixture('invalid-yaml-proposal.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('YAML'))).toBe(true);
  });

  it('fails on body too short', () => {
    const result = validate(fixture('short-body-proposal.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('too short'))).toBe(true);
  });

  it('fails on invalid slug format', () => {
    const result = validate(fixture('bad-slug-proposal.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('kebab-case'))).toBe(true);
  });

  it('fails when no frontmatter at all', () => {
    const result = validate(fixture('no-frontmatter-proposal.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('No YAML frontmatter found'))).toBe(true);
  });

  it('warns on non-standard genre', () => {
    // The valid proposal has genre "arcade" which is standard — no warning
    const result = validate(fixture('valid-proposal.md'));
    expect(result.warnings.every(w => !w.includes('Genre'))).toBe(true);
  });
});
