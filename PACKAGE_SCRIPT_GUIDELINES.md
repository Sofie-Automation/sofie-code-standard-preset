# Package.json Script Guidelines

Guidelines for naming and organizing npm/yarn scripts across Sofie Automation projects. These conventions promote consistency, discoverability, and maintainability.

## Core Principles

1. **Use colons (`:`) for namespacing** related commands, not dashes (`-`)
2. **Prefix internal/helper scripts with underscore (`_`)** if they're not meant for direct use
3. **Keep script names lowercase** with hyphens for multi-word names (rare)
4. **Make `build` do the most obvious thing** - typically compile TypeScript and bundle
5. **Make `dev` the main development command** -typically start a local dev server that watches source for updates
6. **Consolidate formatting under `lint`** - formatting and linting are related concerns

## Standard Lifecycle Scripts

These scripts have special meaning in npm/yarn and should follow conventions:

```json
{
  "scripts": {
    "start": "node dist/index.js",             // Start the application
    "test": "yarn lint && yarn unit",          // Run all tests (lint + unit)
    "build": "rimraf dist && yarn build:main"  // Build for production
  }
}
```

**Key Rules:**

- `test` should run linting + unit tests as a complete check
- `start` runs the compiled application
- `build` cleans and compiles - the "default" build operation

### Git Hooks Setup (Husky)

There are two approaches for setting up git hooks in packages that may be used as libraries:

#### Option A: Use `postinstall` with `pinst` (Current atem-connection approach)

```json
{
  "scripts": {
    "postinstall": "husky",
    "prepack": "pinst --disable && yarn build:main",
    "postpack": "pinst --enable"
  },
  "devDependencies": {
    "pinst": "^3.0.0"
  }
}
```

Pros:

- Automatic setup on `yarn install`
- Works with all Yarn versions

Cons:

- Requires `pinst` dependency
- More complex script setup
- Runs husky even when installing from git (e.g., `"atem-connection": "github:Sofie-Automation/sofie-atem-connection#branch"`)

#### Option B: Call from development commands (Proposed alternative)

```json
{
  "scripts": {
    "githooks:install": "husky",
    "build": "yarn githooks:install && rimraf dist && yarn build:main",
    "build:main": "tsc -p tsconfig.build.json",
    "lint:raw": "yarn githooks:install && eslint --ext .ts --ext .js"
  }
}
```

Pros:

- Simpler - no `pinst` dependency or pack scripts
- Only runs during actual development (when building or linting)
- Doesn't run when installed as library or from git
- Idempotent - safe to call multiple times

Cons:

- Not automatic on first clone (hooks set up on first `build` or `lint`)
- Adds slight overhead to build/lint commands (though husky is fast when already installed)

**Discussion needed:** Which approach should be the standard across Sofie packages?

## Build Scripts

Build scripts should be namespaced with `build:` prefix:

```json
{
  "scripts": {
    "build": "rimraf dist && yarn build:main",
    "build:main": "tsc -p tsconfig.build.json",
    "build:blueprints": "yarn workspace blueprints build-now && yarn workspace blueprints bundle",
    "build:docs": "yarn workspace docs build"
  }
}
```

**Guidelines:**

- `build` does the primary build (usually TypeScript compilation)
- `build:main` is the core compilation step
- `build:*` variants for specialized builds (docs, blueprints, etc.)
- Don't include `build:watch` in the main `build` - watching is a separate workflow
- If using git hooks Option B (see above), `build` would call `githooks:install` first

**Special Cases:**

- Electron apps: `build` compiles, `build:binary` creates installer
- Blueprints: `build-sync-local` uploads to local Sofie (convenience exception to colon rule for frequently-used command)

## Linting Scripts

All code quality checks (linting + formatting) belong under `lint`:

```json
{
  "scripts": {
    "lint:raw": "eslint --ext .ts --ext .js --ignore-pattern dist",
    "lint": "yarn lint:raw .",
    "lint:fix": "yarn lint --fix"
  }
}
```

**Key Rules:**

- `lint:raw` is the internal helper (can be called directly by precommit hooks)
- `lint` runs the linter on the package
- `lint:fix` applies automatic fixes
- Formatting happens via `prettier` in `lint-staged`, not a separate script
- No `fmt`, `format`, or `lint-fix` (use `lint:fix`)
- If using git hooks Option B (see above), `lint:raw` would call `githooks:install` first

## Testing Scripts

```json
{
  "scripts": {
    "test": "yarn lint && yarn unit",
    "unit": "jest",
    "watch": "jest --watch",
    "cov": "jest --coverage && open-cli coverage/lcov-report/index.html",
    "cov:open": "open-cli coverage/lcov-report/index.html"
  }
}
```

**Guidelines:**

- `test` is the complete quality check (lint + unit tests)
- `unit` runs just the unit tests
- `watch` runs tests in watch mode
- `cov` generates coverage and opens report
- `cov:open` just opens existing coverage report
- Integration tests can use `test:integration`

## Watch Scripts

```json
{
  "scripts": {
    "watch": "jest --watch",
    "watch:sync-local": "yarn workspace blueprints watch-sync-local",
    "watch:types": "tsc --noEmit --watch"
  }
}
```

**Guidelines:**

- `watch` runs the most common watch operation (usually tests)
- `watch:*` for specialized watch modes
- `watch-sync-local` is allowed as an exception (frequently used blueprint workflow)

## Validation Scripts

Security and license checks:

```json
{
  "scripts": {
    "validate:dependencies": "yarn npm audit --environment production && yarn validate:licenses",
    "validate:dev-dependencies": "yarn npm audit --environment development",
    "validate:licenses": "sofie-licensecheck --allowPackages \"...\""
  }
}
```

**Key Rules:**

- Use `validate:*` namespace for security/compliance checks
- Not `license-validate` - should be `validate:licenses`
- `validate:dependencies` can call `validate:licenses` to run both

## Development Scripts

```json
{
  "scripts": {
    "dev": "nodemon",
    "dev:debug": "nodemon --inspect-brk"
  }
}
```

## Workspace Scripts (Monorepos)

Root package.json in workspaces:

```json
{
  "scripts": {
    "build": "yarn build:blueprints && yarn build:docs",
    "build:blueprints": "yarn workspace blueprints build-now && yarn workspace blueprints bundle",
    "build:docs": "yarn workspace docs build",
    "test": "yarn test:blueprints",
    "test:blueprints": "yarn workspace blueprints test"
  }
}
```

**Guidelines:**

- Root `build`/`test` can orchestrate multiple workspaces
- Use `build:*` and `test:*` to target specific workspaces
- Keep convenience scripts like `build-sync-local` at workspace level

## Blueprint-Specific Scripts

From Copilot instructions:

```json
{
  "scripts": {
    "build": "yarn test && yarn build-now",
    "build-now": "blueprint-build ./blueprint-map.mjs ./dist",
    "bundle": "blueprint-bundle ./blueprint-map.mjs ./dist",
    "build-sync-local": "run build-inner --server=\"http://127.0.0.1:3000\"",
    "watch-sync-local": "run build-inner --watch --development --server=\"http://127.0.0.1:3000\"",
    "generate-schema-types": "blueprint-schema-types ./src/$schemas/ ./src/$schemas/generated/"
  }
}
```

**Special Rules:**

- `build-sync-local` and `watch-sync-local` are frequently-used blueprint workflows
- These are exceptions to the colon rule for developer convenience
- Keep these names for consistency with existing documentation

## Common Patterns to Avoid

❌ **Don't use:**

- `lint-fix` → use `lint:fix`
- `license-validate` → use `validate:licenses`
- `cov-open` → use `cov:open`
- `fmt` or `format` → formatting is part of `lint`
- `buildstart` → use `build && start` or `build:watch`
- Mixed dash/colon namespacing → pick one (prefer colons)
- `prepare` for husky → causes issues with package lifecycle (see git hooks section above for alternatives)

✅ **Do use:**

- Consistent namespace separators (colons)
- Underscore prefix for internal helpers
- Standard lifecycle script names
- Clear, descriptive names

## Package-Specific Exceptions

Some packages have domain-specific needs:

**Electron Apps:**

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "build:binary": "electron-builder"
  }
}
```

**Documentation Sites:**

```json
{
  "scripts": {
    "start": "docusaurus start --port 3030",
    "build": "docusaurus build"
  }
}
```

**TSR Packages:**

```json
{
  "scripts": {
    "generate-schema-types": "tsr-schema-types ./src/$schemas/generated ...",
    "translations:extract": "tsr-extract-translations ...",
    "translations:bundle": "tsr-bundle-translations ..."
  }
}
```

## Quick Reference

| Purpose              | Script Name              | Example                                          |
|----------------------|--------------------------|--------------------------------------------------|
| Install git hooks    | `githooks:install`       | `husky` (if using Option B)                      |
| Build TypeScript     | `build` or `build:main`  | `tsc -p tsconfig.build.json`                     |
| Run tests            | `test`                   | `yarn lint && yarn unit`                         |
| Run linter           | `lint`                   | `eslint .`                                       |
| Auto-fix lint issues | `lint:fix`               | `eslint --fix .`                                 |
| Watch tests          | `watch`                  | `jest --watch`                                   |
| Watch types          | `watch:types`            | `tsc --noEmit --watch`                           |
| Generate coverage    | `cov`                    | `jest --coverage && open-cli coverage/...`       |
| Check dependencies   | `validate:dependencies`  | `yarn npm audit --environment production`        |
| Check licenses       | `validate:licenses`      | `sofie-licensecheck ...`                         |
| Helper script        | `_helper:name`           | Internal implementation detail                   |

## Rationale

These guidelines are based on:

1. **ESLint package.json conventions** - industry best practices
2. **npm/Yarn documentation** - official lifecycle script behavior  
3. **Sofie ecosystem patterns** - consistency across 50+ packages
4. **Developer ergonomics** - frequently-used commands get shorter names

Following these guidelines makes scripts predictable, discoverable, and maintainable across the entire Sofie Automation ecosystem.
