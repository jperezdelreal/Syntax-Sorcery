# VIGÍA — npm Publish Checklist

## Pre-Publish

1. **Verify version** in `package.json` — bump if needed:
   ```bash
   npm version patch   # or minor / major
   ```

2. **Run tests** to confirm everything passes:
   ```bash
   npm test
   ```

3. **Dry-run pack** to inspect what will be published:
   ```bash
   npm pack --dry-run
   ```
   Verify: ~12 files, ~30 kB packed. Should include:
   - `vigia.js` (main CLI entry)
   - `lib/` (core modules)
   - `tools/` (browser, reporter)
   - `README.md`, `CHANGELOG.md`, `LICENSE`
   - No tests, screenshots, or reports.

4. **Create tarball** and inspect:
   ```bash
   npm pack
   tar tzf vigia-*.tgz   # or on Windows: npm pack && npx tar -tzf vigia-*.tgz
   ```

## Publish

5. **Log in to npm** (if not already):
   ```bash
   npm login
   ```

6. **Publish**:
   ```bash
   npm publish
   ```
   > The `prepublishOnly` script will auto-run tests before publish.

7. **Verify on npmjs.com**:
   - https://www.npmjs.com/package/vigia
   - Check README renders, version is correct, files list looks right.

8. **Test install from registry**:
   ```bash
   npx vigia --help
   # or
   npm install -g vigia && vigia --help
   ```

## Post-Publish

9. **Tag the release** in git:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

10. **Announce** in the team channel / issue tracker.
