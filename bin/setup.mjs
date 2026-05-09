#!/usr/bin/env node
'use strict'

import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = process.cwd()
const force = process.argv.includes('--force')
const fixSubpackages = process.argv.includes('--fix-subpackages')
const help = process.argv.includes('--help') || process.argv.includes('-h')

if (help) {
	console.log(`
Usage: sofie-code-preset-setup [--force] [--help]

Configures the current project to use @sofie-automation/code-standard-preset.

Steps performed:
  1. Reads package.json in the current directory
  2. Verifies the project uses yarn
  3. Sets "prettier" to point to the preset's prettier.config.mjs
  4. Adds lint scripts (lint, lint:eslint, lint:prettier, lint:fix)
  5. Adds license-validate and prepare (husky) scripts
  6. Sets lint-staged config
  7. Creates eslint.config.mjs if missing
  8. Copies .editorconfig from the preset
  9. Creates .husky/pre-commit if missing
 10. Installs required devDependencies via yarn add --dev
 11. (with --fix-subpackages) Removes redundant "prettier" keys from sub-package
     package.json files (they inherit from the root package.json via walk-up)

Options:
  --force             Overwrite existing values that would otherwise be skipped
  --fix-subpackages   Remove redundant prettier config from sub-packages
  --help              Show this help message
`)
	process.exit(0)
}

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

// If there's a .prettierrc.json file, fix it rather than relying on the package.json key
// (prettier searches .prettierrc.json before the package.json "prettier" key)
const prettierrcPath = path.join(projectDir, '.prettierrc.json')
if (existsSync(prettierrcPath)) {
	let existingContent
	try {
		existingContent = JSON.parse(await readFile(prettierrcPath, 'utf-8'))
	} catch {
		existingContent = null
	}
	if (existingContent === prettierValue) {
		console.log('  - .prettierrc.json already correct, skipping')
	} else if (
		existingContent === null ||
		(typeof existingContent === 'string' &&
			existingContent.startsWith('@sofie-automation/code-standard-preset/')) ||
		force
	) {
		await writeFile(prettierrcPath, `"${prettierValue}"\n`, 'utf-8')
		console.log('  \u2714 Fixed .prettierrc.json')
	} else {
		console.log('  - Skipping .prettierrc.json (already set to an unrecognised value) — use --force to override')
	}
} else if (pkg.prettier === prettierValue) {
	// package.json prettier key already correct, nothing to do
} else if (
	!pkg.prettier ||
	(typeof pkg.prettier === 'string' && pkg.prettier.startsWith('@sofie-automation/code-standard-preset/')) ||
	force
) {
	pkg.prettier = prettierValue
	markChanged('Set prettier config')
} else {
	console.log('  - Skipping prettier config (already set to an unrecognised value) — use --force to override')
}

// scripts — skip if already set to a different value, unless --force
pkg.scripts ??= {}

const presetScripts = {
	'lint:eslint': 'eslint .',
	'lint:prettier': 'prettier --check .',
	'lint:fix': 'yarn lint:eslint --fix && yarn lint:prettier --write',
	'license-validate': 'sofie-licensecheck',
	prepare: 'husky',
}
for (const [name, cmd] of Object.entries(presetScripts)) {
	if (pkg.scripts[name] === cmd) {
		// already correct, nothing to do
	} else if (!pkg.scripts[name] || force) {
		pkg.scripts[name] = cmd
		markChanged(`Set script "${name}"`)
	} else {
		console.log(`  - Skipping script "${name}" (already set) — use --force to override`)
	}
}

// Only add the "lint" umbrella if both sub-scripts are now at the expected values
const lintUmbrella = 'yarn lint:eslint && yarn lint:prettier'
const eslintReady = pkg.scripts['lint:eslint'] === presetScripts['lint:eslint']
const prettierReady = pkg.scripts['lint:prettier'] === presetScripts['lint:prettier']
if (eslintReady && prettierReady) {
	if (pkg.scripts.lint === lintUmbrella) {
		// already correct, nothing to do
	} else if (!pkg.scripts.lint || force) {
		pkg.scripts.lint = lintUmbrella
		markChanged('Set script "lint"')
	} else {
		console.log(`  - Skipping script "lint" (already set) — use --force to override`)
	}
} else if (pkg.scripts.lint) {
	console.log('  - Skipping script "lint" (lint:eslint or lint:prettier not set to expected values)')
}

// lint-staged
// Use check-only commands: pre-commit should notify and fail, not silently
// auto-fix (lint-staged doesn't re-add modified files to the commit index)
const targetLintStaged = {
	'*.{css,json,md,scss}': ['prettier --check'],
	'*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint'],
}
if (JSON.stringify(pkg['lint-staged']) === JSON.stringify(targetLintStaged)) {
	// already correct, nothing to do
} else if (!pkg['lint-staged'] || force) {
	pkg['lint-staged'] = targetLintStaged
	markChanged('Set lint-staged config')
} else {
	console.log('  - Skipping lint-staged config (already set) — use --force to override')
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

// ── 7. Install devDependencies ───────────────────────────────────────────────

// Read the peer dependency versions from this preset's package.json so that
// we install compatible versions (e.g. eslint@^9 not the latest eslint@^10).
const presetPkgPath = path.join(scriptDir, '..', 'package.json')
let presetPkg = {}
try {
	presetPkg = JSON.parse(await readFile(presetPkgPath, 'utf-8'))
} catch {
	// Ignore – fall back to unversioned installs
}
const peerDeps = presetPkg.peerDependencies ?? {}

function depWithVersion(name) {
	return peerDeps[name] ? `${name}@${peerDeps[name]}` : name
}

const devDeps = ['eslint', 'husky', 'lint-staged', 'prettier', 'typescript'].map(depWithVersion)
console.log(`\nInstalling devDependencies: ${devDeps.join(', ')} ...`)
try {
	execFileSync('yarn', ['add', '--dev', ...devDeps], { stdio: 'inherit', cwd: projectDir })
} catch (e) {
	console.error(`Error installing devDependencies: ${e.message}`)
	console.error(`  Run manually: yarn add --dev ${devDeps.join(' ')}`)
}

// ── 8. Fix sub-package config files ─────────────────────────────────────────

// In a monorepo, config files in sub-packages shadow the root config.
// Sub-packages typically don't need their own prettier or legacy eslint configs.
console.log('\n── Sub-package config files ──')

const prettierConfigFileNames = [
	'.prettierrc',
	'.prettierrc.json',
	'.prettierrc.js',
	'.prettierrc.cjs',
	'.prettierrc.mjs',
	'.prettierrc.yaml',
	'.prettierrc.yml',
	'.prettierrc.toml',
	'prettier.config.js',
	'prettier.config.cjs',
	'prettier.config.mjs',
]
const eslintLegacyConfigFileNames = [
	'.eslintrc',
	'.eslintrc.js',
	'.eslintrc.cjs',
	'.eslintrc.json',
	'.eslintrc.yaml',
	'.eslintrc.yml',
]

const subPkgWarnings = []
try {
	const entries = await readdir(projectDir, { withFileTypes: true })
	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		const subDir = path.join(projectDir, entry.name)

		// package.json "prettier" key
		const subPkgPath = path.join(subDir, 'package.json')
		if (existsSync(subPkgPath)) {
			let subPkg, subPkgText
			try {
				subPkgText = await readFile(subPkgPath, 'utf-8')
				subPkg = JSON.parse(subPkgText)
			} catch {
				subPkg = null
			}
			if (subPkg?.prettier) {
				const rel = path.join(entry.name, 'package.json')
				if (fixSubpackages) {
					const subIndent = subPkgText.match(/^\t/m) ? '\t' : '  '
					delete subPkg.prettier
					await writeFile(subPkgPath, JSON.stringify(subPkg, null, subIndent) + '\n', 'utf-8')
					console.log(`  ✔ Removed "prettier" key from ${rel}`)
				} else {
					subPkgWarnings.push(`${rel}: has "prettier" key`)
				}
			}
		}

		// Prettier config files
		for (const file of prettierConfigFileNames) {
			const filePath = path.join(subDir, file)
			if (!existsSync(filePath)) continue
			const rel = path.join(entry.name, file)
			if (fixSubpackages) {
				let content = null
				try {
					content = await readFile(filePath, 'utf-8')
				} catch {
					/* ignore */
				}
				let parsed
				try {
					parsed = JSON.parse(content)
				} catch {
					parsed = content
				}
				if (typeof parsed === 'string' && parsed.startsWith('@sofie-automation/code-standard-preset/')) {
					await unlink(filePath)
					console.log(`  ✔ Removed ${rel} (preset reference — root config handles this)`)
				} else {
					console.log(`  - Skipping ${rel} (unrecognised content) — review manually`)
				}
			} else {
				subPkgWarnings.push(`${rel}: prettier config file`)
			}
		}

		// Legacy ESLint config files (conflict with flat config at root)
		for (const file of eslintLegacyConfigFileNames) {
			const filePath = path.join(subDir, file)
			if (!existsSync(filePath)) continue
			const rel = path.join(entry.name, file)
			if (fixSubpackages) {
				await unlink(filePath)
				console.log(`  ✔ Removed ${rel} (legacy ESLint config — flat config at root handles this)`)
			} else {
				subPkgWarnings.push(`${rel}: legacy ESLint config`)
			}
		}

		// New-style flat ESLint config in a sub-package — don't auto-remove, just note it
		const subEslintFlat = path.join(subDir, 'eslint.config.mjs')
		if (existsSync(subEslintFlat)) {
			console.log(`  - Note: ${path.join(entry.name, 'eslint.config.mjs')} exists — review if intentional`)
		}
	}
} catch (e) {
	console.error(`  Warning: could not scan sub-packages: ${e.message}`)
}

if (subPkgWarnings.length > 0) {
	console.log(
		`  - Found ${subPkgWarnings.length} item(s) in sub-packages — run with --fix-subpackages to fix them:\n` +
			subPkgWarnings.map((f) => `      ${f}`).join('\n')
	)
} else if (!fixSubpackages) {
	console.log('  - No sub-package config issues found')
}

// ── Done ──────────────────────────────────────────────────────────────────────

console.log('\nDone. Review and commit the changes.')
