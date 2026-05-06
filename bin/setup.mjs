#!/usr/bin/env node
'use strict'

import { existsSync } from 'fs'
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = process.cwd()

// ── 1. Find and parse the project's package.json ──────────────────────────────

const pkgPath = path.join(projectDir, 'package.json')
if (!existsSync(pkgPath)) {
	console.error('Error: No package.json found in the current directory.')
	process.exit(1)
}

let pkgText
try {
	pkgText = await readFile(pkgPath, 'utf-8')
} catch (e) {
	console.error(`Error reading package.json: ${e.message}`)
	process.exit(1)
}

let pkg
try {
	pkg = JSON.parse(pkgText)
} catch (e) {
	console.error(`Error parsing package.json: ${e.message}`)
	process.exit(1)
}

// ── 2. Require yarn ────────────────────────────────────────────────────────────

const pmField = pkg.packageManager ?? ''
if (pmField && !pmField.startsWith('yarn')) {
	console.error(`Error: package.json declares packageManager "${pmField}". This tool requires yarn.`)
	process.exit(1)
}
if (!pmField) {
	if (existsSync(path.join(projectDir, 'package-lock.json'))) {
		console.error('Error: Found a package-lock.json. This tool requires yarn.')
		process.exit(1)
	}
	if (existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) {
		console.error('Error: Found a pnpm-lock.yaml. This tool requires yarn.')
		process.exit(1)
	}
}

// ── 3. Update package.json ────────────────────────────────────────────────────

let pkgChanged = false
// Preserve the original indentation style
const indent = pkgText.match(/^\t/m) ? '\t' : '  '

function markChanged(label) {
	pkgChanged = true
	console.log(`  \u2714 ${label}`)
}

// prettier config
const prettierValue = '@sofie-automation/code-standard-preset/prettier.config.mjs'
if (pkg.prettier !== prettierValue) {
	pkg.prettier = prettierValue
	markChanged('Set prettier config')
}

// lint scripts — always update preset-owned scripts; add "prepare" only if absent
pkg.scripts ??= {}
const presetScripts = {
	'lint:eslint': 'eslint .',
	'lint:prettier': 'prettier --check .',
	lint: 'yarn lint:eslint && yarn lint:prettier',
	'lint:fix': 'yarn lint:eslint --fix && yarn lint:prettier --write',
	'license-validate': 'sofie-licensecheck',
}
for (const [name, cmd] of Object.entries(presetScripts)) {
	if (pkg.scripts[name] !== cmd) {
		pkg.scripts[name] = cmd
		markChanged(`Set script "${name}"`)
	}
}
if (!pkg.scripts.prepare) {
	pkg.scripts.prepare = 'husky'
	markChanged('Set script "prepare" (husky)')
}

// lint-staged
const targetLintStaged = {
	'*.{css,json,md,scss}': ['prettier --write'],
	'*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix'],
}
if (JSON.stringify(pkg['lint-staged']) !== JSON.stringify(targetLintStaged)) {
	pkg['lint-staged'] = targetLintStaged
	markChanged('Set lint-staged config')
}

if (pkgChanged) {
	await writeFile(pkgPath, JSON.stringify(pkg, null, indent) + '\n', 'utf-8')
	console.log('  \u2714 Wrote package.json')
} else {
	console.log('  - package.json already up to date')
}

// ── 4. Create eslint.config.mjs if missing ────────────────────────────────────

const eslintConfigPath = path.join(projectDir, 'eslint.config.mjs')
if (!existsSync(eslintConfigPath)) {
	await writeFile(
		eslintConfigPath,
		[
			"import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'",
			'',
			'export default await generateEslintConfig({})',
			'',
		].join('\n'),
		'utf-8'
	)
	console.log('  \u2714 Created eslint.config.mjs')
} else {
	console.log('  - eslint.config.mjs already exists, skipping')
}

// ── 5. Copy .editorconfig ─────────────────────────────────────────────────────

const srcEditorconfig = path.join(scriptDir, '..', '.editorconfig')
const destEditorconfig = path.join(projectDir, '.editorconfig')
await copyFile(srcEditorconfig, destEditorconfig)
console.log('  \u2714 Copied .editorconfig')

// ── 6. Create .husky/pre-commit if missing ────────────────────────────────────

const preCommitPath = path.join(projectDir, '.husky', 'pre-commit')
if (!existsSync(preCommitPath)) {
	await mkdir(path.join(projectDir, '.husky'), { recursive: true })
	await writeFile(preCommitPath, 'lint-staged\n', { encoding: 'utf-8', mode: 0o755 })
	console.log('  \u2714 Created .husky/pre-commit')
} else {
	console.log('  - .husky/pre-commit already exists, skipping')
}

// ── Done ──────────────────────────────────────────────────────────────────────

console.log('\nDone. Next steps:')
console.log('  1. yarn add --dev eslint typescript husky lint-staged prettier')
console.log('  2. yarn install   (to initialize husky via the prepare script)')
console.log('  3. Review and commit the changes')
