# Git Hooks Guidelines

> **Status: RFC needed.** The standard approach for Husky setup across Sofie packages has not yet been decided. An RFC should be raised to settle this.

Guidelines for setting up git hooks (via Husky) in Sofie Automation packages that may be used as libraries.

## The Problem

Packages that are published to npm and also developed locally need git hooks during development, but should **not** run Husky when installed as a dependency (e.g. via `yarn install` in a consumer project, or when installed directly from git with `"atem-connection": "github:Sofie-Automation/sofie-atem-connection#branch"`).

## Option A: Use `postinstall` with `pinst` (Current atem-connection approach)

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

## Option B: Call from development commands (Proposed alternative)

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

- Simpler — no `pinst` dependency or pack scripts
- Only runs during actual development (when building or linting)
- Doesn't run when installed as library or from git
- Idempotent — safe to call multiple times

Cons:

- Not automatic on first clone (hooks set up on first `build` or `lint`)
- Adds slight overhead to build/lint commands (though husky is fast when already installed)

## Decision Needed

An RFC should be raised to decide which option becomes the standard across all Sofie packages. Until then, follow the approach already used in the package you're working on.
