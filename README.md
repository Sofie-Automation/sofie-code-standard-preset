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

This readme assumes you are using yarn v4. For other package managers the steps should be similar but may vary a little from what is written here.

`yarn add --dev @sofie-automation/code-standard-preset eslint typescript husky lint-staged prettier`

### Packages

**Add** the following information to your `package.json`:

```json
{
	...,
	"scripts": {
		...,
		"prepare": "husky",
		"lint:raw": "eslint",
		"lint": "run lint:raw .",
		"lint-fix": "run lint --fix",
		"license-validate": "sofie-licensecheck"
	},
	"prettier": "@sofie-automation/code-standard-preset/.prettierrc.json",
	"lint-staged": {
		"*.{css,json,md,scss}": [
			"prettier --write"
		],
		"*.{ts,tsx,js,jsx}": [
			"run lint:raw --fix"
		]
	},
	...
}
```

**Create** the husky hook file `.husky/pre-commit`

```sh
lint-staged
```

**Adjust** build script references to make sure they use `tsconfig.build.json`, e.g. `tsc -p tsconfig.build.json`.

**Ensure** the following development dependencies are present:

- `@types\node` and `@types\jest` (if using)
- Typescript 5.7 or above, e.g. `~5.7` with an up-to-date `tslib`
- `jest` and `ts-jest`, if using

### Files

**Add** the following files:

_eslint.config.mjs_

```mjs
import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

export default await generateEslintConfig({})
```

The parameter to the `generateEslintConfig` contains various option fields that can be configured.

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

If you need to add additional rules, you can do so by building off the generated config, such as:

```mjs
import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'
import pluginYaml from 'eslint-plugin-yml'

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

_Note: replace the {{PACKAGE-NAME}} with the correct package name, i.e. `hyperdeck-connection`_

**Optionally include** a _.gitattributes_ file:

```
* text=auto eol=lf
```

Also copy the `.editorconfig` file from this repository if you want to use it.

**Adjust** jest configuration files to use `tsconfig.json`. For example, update the start of `jest.config.js` ...

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

**Remove** any other old linting or tsconfig files and refernces to them, for example a `config` folder containing `tsconfig...` files. These are no longer required.

## Upgrade

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
