# Sofie Code Standard Preset

[![Node CI](https://github.com/Sofie-Automation/sofie-code-standard-preset/actions/workflows/node.yaml/badge.svg)](https://github.com/Sofie-Automation/sofie-code-standard-preset/actions/workflows/node.yaml)
[![npm](https://img.shields.io/npm/v/@sofie-automation/code-standard-preset)](https://www.npmjs.com/package/@sofie-automation/code-standard-preset)

This is the _Sofie_ code standard preset library used in the [_**Sofie** TV Automation System_](https://github.com/Sofie-Automation/Sofie-TV-automation/) for defining a code standard preset through [_ESLint_](https://github.com/Sofie-Automation/sofie-eslint-plugin/) and [_Prettier_](https://prettier.io/).

A script for checking compatible licenses is included.

## General Sofie System Information

- [_Sofie_ Documentation](https://sofie-automation.github.io/sofie-core//)
- [_Sofie_ Releases](https://sofie-automation.github.io/sofie-core//releases)
- [Contribution Guidelines](CONTRIBUTING.md)
- [License](LICENSE)

---

## Installation

This preset requires yarn v4. The setup script enforces this, and the generated lint scripts use `yarn` directly.

First, install the package:

```sh
yarn add --dev @sofie-automation/code-standard-preset
```

Then either use the setup script or follow the manual steps below.

### Using the setup script

Run the setup CLI, which will install all required devDependencies and configure the project automatically:

```sh
yarn sofie-code-standard-preset-setup
```

This will:

1. Delete `.prettierrc.json` if present (it takes precedence over `package.json` and would shadow the preset config), then set the `prettier` field in `package.json` to use the preset's config
2. Add `lint`, `lint:eslint`, `lint:prettier`, `lint:prettier:fix`, `lint:fix`, `license-validate` and `prepare` scripts to `package.json`
3. Set `lint-staged` config in `package.json`
4. Create `eslint.config.mjs` if missing
5. Copy `.editorconfig` from the preset (always overwrites — the preset's copy is always canonical, since there was no standard version to update from in older releases)
6. Create `.husky/pre-commit` if missing
7. Install required devDependencies: `@eslint/js`, `eslint`, `husky`, `lint-staged`, `prettier`, `typescript`

If any of the above items are already configured to a different value, they will be skipped with a warning. Pass `--force` to overwrite existing values:

```sh
yarn sofie-code-standard-preset-setup --force
```

For monorepos, also pass `--fix-subpackages` to remove redundant prettier config keys and files from sub-packages, remove legacy ESLint config files (`.eslintrc.*`) from sub-packages, and report any flat `eslint.config.mjs` files in sub-packages for manual review.

Then continue with [Next steps](#next-steps) below.

### Manual setup

If you prefer to configure manually, or if the setup script does not work for your project, follow these steps.

**Install** the required devDependencies:

```sh
yarn add --dev @eslint/js eslint@^9 husky@^9 lint-staged@^17 prettier@^3 typescript@~6.0
```

**Add** the following to your `package.json`:

```json
{
	...,
	"scripts": {
		...,
		"prepare": "husky",
		"lint:eslint": "eslint .",
		"lint:prettier": "prettier --check .",
		"lint:prettier:fix": "prettier --write .",
		"lint": "yarn lint:eslint && yarn lint:prettier",
		"lint:fix": "yarn lint:eslint --fix && yarn lint:prettier:fix",
		"license-validate": "sofie-licensecheck"
	},
	"prettier": "@sofie-automation/code-standard-preset/prettier.config.mjs",
	"lint-staged": {
		"*.{css,json,md,scss}": [
			"prettier --check"
		],
		"*.{ts,tsx,js,jsx,mjs,cjs}": [
			"eslint"
		]
	},
	...
}
```

If you have an existing `.prettierrc.json`, remove it — Prettier finds `.prettierrc.json` before the `package.json` `prettier` key, so it must be removed to avoid it shadowing the preset config.

**Create** the husky hook file `.husky/pre-commit`:

```sh
lint-staged
```

**Create** `eslint.config.mjs`:

```mjs
import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

export default await generateEslintConfig({})
```

**Copy** the `.editorconfig` file from this package into the root of your project.

### Next steps

Whether you used the setup script or configured manually, commit your changes, run `yarn lint:fix` to apply any formatting or import-order changes, and commit again:

```sh
git add -A && git commit -m "chore: add sofie code standard preset"
yarn lint:fix
git add -A && git commit -m "chore: apply lint fixes"
```

The following steps are project-specific and cannot be automated.

#### Customising ESLint config

The `generateEslintConfig` function accepts options to adjust the config for your project:

```ts
{
	/** Any extra paths to be ignored by eslint */
	ignores?: string[]
	/** If you need eslint to use a non-default tsconfig, provide the path. When not set it uses the default search behaviour */
	tsconfigName?: string | string[]
	/** If the project is browser based instead of node based, you can disable the node runtime rules */
	disableNodeRules?: boolean
}
```

If you need to add additional rules, you can extend the generated config:

```mjs
import pluginYaml from 'eslint-plugin-yml'

import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

const extendedRules = await generateEslintConfig({
	ignores: ['client', 'server'],
})
extendedRules.push(...pluginYaml.configs['flat/recommended'], {
	files: ['**/*.yaml'],

	rules: {
		'yml/quotes': ['error', { prefer: 'single' }],
		'yml/spaced-comment': ['error'],
		'spaced-comment': ['off'],
	},
})

export default extendedRules
```

#### TypeScript config

**Create** the following TypeScript config files if they don't exist:

_tsconfig.json_

```json
{
	"extends": "./tsconfig.build.json",
	"exclude": ["node_modules/**"],
	"compilerOptions": {
		"types": ["jest", "node"]
	}
}
```

_tsconfig.build.json_

```json
{
	"extends": "@sofie-automation/code-standard-preset/ts/tsconfig.lib",
	"include": ["src/**/*.ts"],
	"exclude": ["node_modules/**", "src/**/*spec.ts", "src/**/__tests__/*", "src/**/__mocks__/*"],
	"compilerOptions": {
		"outDir": "./dist",
		"baseUrl": "./",
		"paths": {
			"*": ["./node_modules/*"],
			"{{PACKAGE-NAME}}": ["./src/index.ts"]
		},
		"types": ["node"]
	}
}
```

_Note: If you are using this in a 'binary' package, then you should use `tsconfig.bin` instead of `tsconfig.lib`. This adjusts the build and output slightly._

_Note: replace `{{PACKAGE-NAME}}` with the correct package name, e.g. `hyperdeck-connection`_

**Adjust** build script references to make sure they use `tsconfig.build.json`, e.g. `tsc -p tsconfig.build.json`.

#### Test runner

**Vitest** is the recommended test runner for new projects. Install it with:

```sh
yarn add --dev vitest
```

Then pass `testRunner: 'vitest'` to `generateEslintConfig` in your `eslint.config.mjs`:

```mjs
export default await generateEslintConfig({ testRunner: 'vitest' })
```

This enables the `@vitest/eslint-plugin` rules on your test files.

**Jest** is still fully supported. If using jest, adjust jest configuration files to use `tsconfig.json`. For example, update the start of `jest.config.js`:

```javascript
module.exports = {
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
			},
		],
	},
	// ...
```

Ensure the following devDependencies are present if using jest:

- `@types/node`, `@types/jest`
- `jest`, `ts-jest`

#### Clean up old files

**Remove** any old linting or tsconfig files and references to them, for example a `config` folder containing `tsconfig...` files. These are no longer required.

#### .gitattributes

**Optionally** add a `.gitattributes` file to ensure consistent line endings:

```
* text=auto eol=lf
```

## Upgrade

### v3.x to v4.0

#### Node 22 minimum

Node 22 is now the minimum supported version (up from Node 20). Update your `package.json` engines field:

```json
"engines": { "node": ">= 22.12" }
```

#### TypeScript ~6.0 required

TypeScript ~6.0 is now required. Update your `package.json` devDependency:

```sh
yarn add --dev typescript@~6.0
```

#### Updated peerDependencies

husky@^9 and lint-staged@^17 are now required. If you need to update them:

```sh
yarn add --dev husky@^9 lint-staged@^17
```

#### Prettier config: switch to `prettier.config.mjs`

Import sorting via `@ianvs/prettier-plugin-sort-imports` is now bundled with this package. You must switch your prettier config reference from `.prettierrc.json` to `prettier.config.mjs`:

In `package.json`, change:

```json
"prettier": "@sofie-automation/code-standard-preset/.prettierrc.json",
```

to:

```json
"prettier": "@sofie-automation/code-standard-preset/prettier.config.mjs",
```

This is necessary because Prettier resolves plugin names in JSON configs relative to the consumer project, whereas an `.mjs` config resolves imports from its own location inside the package.

After switching, run `yarn lint:fix` to apply any import order changes across your codebase.

#### Updated lint scripts and lint-staged config

The lint script names have been standardised. In `package.json`, replace any old-style scripts:

```json
"lint:raw": "eslint",
"lint": "run lint:raw .",
"lint-fix": "run lint --fix",
```

with:

```json
"lint:eslint": "eslint .",
"lint:prettier": "prettier --check .",
"lint:prettier:fix": "prettier --write .",
"lint": "yarn lint:eslint && yarn lint:prettier",
"lint:fix": "yarn lint:eslint --fix && yarn lint:prettier:fix",
```

Also update `lint-staged` to use check-only commands (pre-commit hooks should fail loudly rather than silently auto-fix) and to cover `.mjs`/`.cjs` files:

```json
"lint-staged": {
	"*.{css,json,md,scss}": ["prettier --check"],
	"*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint"]
}
```

You can automate all of the above with the setup CLI:

```sh
yarn sofie-code-standard-preset-setup --force
```

### v2 to v3.0

If not already, the project should be updated to yarn v4 instead of yarn v1. yarn v1 was EOL a few years ago, and v4 is working for us quite nicely.

1. Make sure that you are ready to do a semver major bump, with a new minimum nodejs version of v20.
1. Update your package.json engines to require node 20
1. Install the updated `@sofie-automation/code-standard-preset` package
1. Install tools that used to be included by the preset package: `yarn add --dev eslint husky lint-staged prettier`, any you do not need can be omitted.
1. Check the package.json scripts;
   - Change `husky install` to `husky`
   - Change the `lint:raw` to simply `eslint`
   - Check if any `yarn X` can be made simply `X` or `run X`
1. In `.husky/pre-commit`, replace the contents to be simply `lint-staged`
1. Ensure the project has an updated typescript
   - This may require updating other tools, be sure to check jest/compiling later
1. Remove the existing `.eslintrc.json` and replace with the new `eslint.config.mjs` example above. If you have modified your file from the default, you will need to translate that across.
1. In your code, any references to eslint rules `node/*` have been renamed to `n/*`
1. Due to the rules requiring conforming to ESM import syntax, you may need to update many file imports. You can use `npx fix-esm-import-path src` as an easy way of updating all the imports in the project
1. Make sure that everything is working. You will likely have a bunch of linter failures due to updated formatting and linting rules, which will need resolving.

### v2.0 to v2.1

This release introduces a simple replacement for `standard-version`

Steps:

- Remove the `standard-version` config block in your package.json
- Remove the devDependency on `standard-version`
- Update any scripts using `standard-version` to use `sofie-version`, if there are any parameters, they will likely all need removing.
- Update the prerelease workflow to change `yarn release --prerelease $PRERELEASE_TAG-$COMMIT_DATE-$GIT_HASH --skip.changelog --skip.tag --skip.commit` into `yarn release --prerelease $PRERELEASE_TAG`
- Remove the unused `COMMIT_DATE`, `GIT_HASH` and `COMMIT_TIMESTAMP` definitions above
- Change the variable `PRERELEASE_TAG=nightly-$(echo "${{ steps.prerelease-tag.outputs.tag }}" | sed -r 's/[^a-z0-9]+/-/gi')` to `PRERELEASE_TAG=nightly-${{ steps.prerelease-tag.outputs.tag }}`
- Make sure there aren't any other usages of `standard-version` or the release script, if there are they will need updating.
- Below any `yarn publish ....` lines, add `echo "**Published:** $NEW_VERSION" >> $GITHUB_STEP_SUMMARY` to log the publish in the github action workflow

While you are here, try to update any `uses:` lines in the actions workflows, common ones that need updating:

- `actions/checkout@v3`
- `actions/setup-node@v3`

### v0.4 to v0.5

This updates husky, and the config that goes with it.

Steps:

- Create the `.husky/pre-commit` file
- Remove the old husky config from `package.json`
- Update the scripts and lint-staged config in `package.json`

---

_The NRK logo is a registered trademark of Norsk rikskringkasting AS. The license does not grant any right to use, in any way, any trademarks, service marks or logos of Norsk rikskringkasting AS._
