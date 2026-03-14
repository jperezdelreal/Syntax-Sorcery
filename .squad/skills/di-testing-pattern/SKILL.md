---
name: "di-testing-pattern"
description: "Dependency injection testing pattern for writing testable Node.js code. Inject external dependencies (fs, exec, console) as parameters with production defaults."
domain: "testing"
confidence: "high"
source: "observed from Syntax Sorcery codebase"
---

## Context

When writing Node.js scripts that interact with the filesystem, external processes, or produce console output, use dependency injection to make them testable without mocking module internals. This pattern is used throughout the Syntax Sorcery codebase.

## Patterns

### Pattern 1: Injectable Dependencies with Defaults

Pass a `deps` object as the last parameter of every public function. Provide production defaults so callers don't need to inject anything in normal usage.

```javascript
function defaultDeps() {
  return {
    readFile: (p) => fs.readFileSync(p, 'utf8'),
    writeFile: (p, c) => fs.writeFileSync(p, c, 'utf8'),
    execSync: (cmd, opts) => execSync(cmd, opts),
    log: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
  };
}

function myCommand(args, jsonMode, deps) {
  const d = deps || defaultDeps();
  // Use d.readFile(), d.log(), etc.
}
```

### Pattern 2: Test with Mock Dependencies

In tests, inject mock functions instead of the real ones. No module-level mocking required.

```javascript
describe('myCommand', () => {
  it('reads and processes a file', () => {
    const mockDeps = {
      readFile: vi.fn(() => 'file content'),
      log: vi.fn(),
      error: vi.fn(),
      existsSync: vi.fn(() => true),
    };

    const code = myCommand('test-arg', false, mockDeps);
    expect(code).toBe(0);
    expect(mockDeps.readFile).toHaveBeenCalled();
    expect(mockDeps.log).toHaveBeenCalledWith(expect.stringContaining('success'));
  });
});
```

### Pattern 3: Console Spies for Non-DI Functions

For functions that use console directly (e.g., top-level help), spy on console methods.

```javascript
it('prints help text', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const code = cmdHelp();
  expect(code).toBe(0);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  spy.mockRestore();
});
```

## Examples

**Real-world usage from squad-cli.js:**
```javascript
// Production: cmdStatus(true) uses execSync internally
// Test: cmdStatus(true, mockExecFn) uses injected mock
function cmdStatus(jsonMode, execFn) {
  const exec = execFn || execSync;
  const issuesRaw = exec('gh issue list ...', { encoding: 'utf8' });
  // ...
}
```

**Test for the above:**
```javascript
it('outputs JSON when --json flag is set', () => {
  const mockExec = vi.fn((cmd) => {
    if (cmd.includes('issue list')) return JSON.stringify([{ number: 1 }]);
    return '[]';
  });
  const code = cmdStatus(true, mockExec);
  expect(code).toBe(0);
});
```

## Anti-Patterns

- **Module-level mocking** — Avoid `vi.mock('fs')` when DI is available; it's fragile and couples tests to implementation
- **Global state mutation** — Don't modify `process.env` or global objects in tests; inject config values instead
- **Testing implementation details** — Test behavior (return values, output), not internal function calls
- **Missing defaults** — Always provide production defaults so the DI parameter is optional for callers
