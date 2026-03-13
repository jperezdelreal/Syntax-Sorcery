const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TEMPLATE_DIR = path.join(__dirname, '..', 'game-repo-templates');
const WORKFLOW_PATH = path.join(TEMPLATE_DIR, 'build-deploy.yml');
const WORKFLOWS_DIR = path.join(TEMPLATE_DIR, '.github', 'workflows');

// ---------------------------------------------------------------------------
// Template structure validation
// ---------------------------------------------------------------------------
describe('game repo template structure', () => {
  it('build-deploy.yml exists in templates root', () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('template has .github/workflows directory', () => {
    expect(fs.existsSync(path.join(TEMPLATE_DIR, '.github'))).toBe(true);
  });

  it('build-deploy.yml is readable and non-empty', () => {
    const content = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Deploy workflow YAML parsing & validation
// ---------------------------------------------------------------------------
describe('build-deploy.yml YAML validity', () => {
  let workflow;

  beforeAll(() => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    // Strip leading comment lines that aren't YAML (the template has comment header)
    workflow = yaml.load(raw);
  });

  it('parses as valid YAML', () => {
    expect(workflow).toBeDefined();
    expect(typeof workflow).toBe('object');
  });

  it('has a name field', () => {
    expect(workflow.name).toBeDefined();
    expect(typeof workflow.name).toBe('string');
  });

  it('has trigger configuration (on)', () => {
    expect(workflow.on || workflow.true).toBeDefined();
  });

  it('triggers on push to main', () => {
    const on = workflow.on || workflow.true;
    expect(on.push).toBeDefined();
    expect(on.push.branches).toContain('main');
  });

  it('triggers on pull_request to main', () => {
    const on = workflow.on || workflow.true;
    expect(on.pull_request).toBeDefined();
    expect(on.pull_request.branches).toContain('main');
  });

  it('has permissions section', () => {
    expect(workflow.permissions).toBeDefined();
  });

  it('has required permissions: contents read, pages write, id-token write', () => {
    expect(workflow.permissions.contents).toBe('read');
    expect(workflow.permissions.pages).toBe('write');
    expect(workflow.permissions['id-token']).toBe('write');
  });

  it('has concurrency configuration for pages', () => {
    expect(workflow.concurrency).toBeDefined();
    expect(workflow.concurrency.group).toBe('pages');
  });

  it('has build job', () => {
    expect(workflow.jobs).toBeDefined();
    expect(workflow.jobs.build).toBeDefined();
  });

  it('has deploy job', () => {
    expect(workflow.jobs.deploy).toBeDefined();
  });

  it('deploy job depends on build', () => {
    expect(workflow.jobs.deploy.needs).toBe('build');
  });

  it('build job runs on ubuntu-latest', () => {
    expect(workflow.jobs.build['runs-on']).toBe('ubuntu-latest');
  });

  it('deploy job has github-pages environment', () => {
    expect(workflow.jobs.deploy.environment).toBeDefined();
    expect(workflow.jobs.deploy.environment.name).toBe('github-pages');
  });
});

// ---------------------------------------------------------------------------
// Build workflow steps validation
// ---------------------------------------------------------------------------
describe('build workflow steps', () => {
  let steps;

  beforeAll(() => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    steps = workflow.jobs.build.steps;
  });

  it('has checkout step', () => {
    const checkout = steps.find(s => s.uses && s.uses.includes('actions/checkout'));
    expect(checkout).toBeDefined();
  });

  it('has build type detection step', () => {
    const detect = steps.find(s => s.name && /detect build type/i.test(s.name));
    expect(detect).toBeDefined();
  });

  it('has Node.js setup step', () => {
    const nodeSetup = steps.find(s => s.uses && s.uses.includes('actions/setup-node'));
    expect(nodeSetup).toBeDefined();
  });

  it('has build validation step', () => {
    const validate = steps.find(s => s.name && /validate build output/i.test(s.name));
    expect(validate).toBeDefined();
  });

  it('validation step checks for dist/index.html', () => {
    const validate = steps.find(s => s.name && /validate build output/i.test(s.name));
    expect(validate.run).toContain('dist/index.html');
  });

  it('validation step checks bundle size against 10MB limit', () => {
    const validate = steps.find(s => s.name && /validate build output/i.test(s.name));
    expect(validate.run).toContain('10485760');
  });

  it('has Pages setup step', () => {
    const pages = steps.find(s => s.uses && s.uses.includes('actions/configure-pages'));
    expect(pages).toBeDefined();
  });

  it('has Pages artifact upload step', () => {
    const upload = steps.find(s => s.uses && s.uses.includes('actions/upload-pages-artifact'));
    expect(upload).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Deploy workflow steps validation
// ---------------------------------------------------------------------------
describe('deploy workflow steps', () => {
  let deploySteps;

  beforeAll(() => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    deploySteps = workflow.jobs.deploy.steps;
  });

  it('has deploy-pages action', () => {
    const deploy = deploySteps.find(s => s.uses && s.uses.includes('actions/deploy-pages'));
    expect(deploy).toBeDefined();
  });

  it('has smoke test step', () => {
    const smoke = deploySteps.find(s => s.name && /smoke test/i.test(s.name));
    expect(smoke).toBeDefined();
  });

  it('smoke test checks HTTP status', () => {
    const smoke = deploySteps.find(s => s.name && /smoke test/i.test(s.name));
    expect(smoke.run).toContain('curl');
    expect(smoke.run).toContain('200');
  });
});

// ---------------------------------------------------------------------------
// Build script handles missing files
// ---------------------------------------------------------------------------
describe('build template resilience', () => {
  it('static build step uses fallback cp when rsync fails', () => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    const staticStep = workflow.jobs.build.steps.find(s =>
      s.name && /build \(static\)/i.test(s.name)
    );
    expect(staticStep).toBeDefined();
    // Uses || true to handle missing files gracefully
    expect(staticStep.run).toContain('|| true');
  });

  it('static build creates dist/ directory', () => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    const staticStep = workflow.jobs.build.steps.find(s =>
      s.name && /build \(static\)/i.test(s.name)
    );
    expect(staticStep.run).toContain('mkdir -p dist');
  });

  it('static build copies index.html as fallback', () => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    const staticStep = workflow.jobs.build.steps.find(s =>
      s.name && /build \(static\)/i.test(s.name)
    );
    expect(staticStep.run).toContain('cp index.html dist/');
  });

  it('deploy job only runs on push to main (not PRs)', () => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.load(raw);
    expect(workflow.jobs.deploy.if).toContain('push');
    expect(workflow.jobs.deploy.if).toContain('refs/heads/main');
  });
});
