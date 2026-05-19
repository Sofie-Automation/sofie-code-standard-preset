#! /usr/bin/env node
import { readFileSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'

const args = new Set(process.argv.slice(2))
const shouldFix = args.has('--fix') || args.has('-f')

function getRequiredNodeVersion() {
	const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
	const range = pkg?.engines?.node
	if (!range || typeof range !== 'string') {
		throw new Error('`package.json#engines.node` is missing or not a string')
	}

	// Keep this script dependency-free: it runs in CI before `yarn install`.
	// Prefer extracting the minimum required version (major.minor.patch) from common range shapes.
	const match =
		range.match(/>=\s*v?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/) ??
		range.match(/\bv?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?\b/)

	const major = match?.groups?.major ? Number.parseInt(match.groups.major, 10) : NaN
	const minor = match?.groups?.minor ? Number.parseInt(match.groups.minor, 10) : null
	const patch = match?.groups?.patch ? Number.parseInt(match.groups.patch, 10) : null

	if (!Number.isInteger(major) || major <= 0) {
		throw new Error(`Unable to determine required Node version from engines.node: "${range}"`)
	}
	if (minor !== null && (!Number.isInteger(minor) || minor < 0)) {
		throw new Error(`Unable to determine required Node version from engines.node: "${range}"`)
	}
	if (patch !== null && (!Number.isInteger(patch) || patch < 0)) {
		throw new Error(`Unable to determine required Node version from engines.node: "${range}"`)
	}

	// If a minor is specified in engines, we enforce it in .nvmrc too.
	// Patch defaults to 0 when omitted.
	const expected =
		minor === null ? String(major) : `${major}.${minor}.${patch === null ? 0 : patch}`

	return { expected, range }
}

function normalizeNvmrc(value) {
	const trimmed = String(value ?? '').trim()
	if (trimmed.startsWith('v')) return trimmed.slice(1)
	return trimmed
}

async function main() {
	const { expected, range } = getRequiredNodeVersion()

	let actual = null
	try {
		actual = normalizeNvmrc(await readFile(new URL('../.nvmrc', import.meta.url), 'utf-8'))
	} catch (e) {
		if (e?.code !== 'ENOENT') throw e
	}

	if (actual === expected) return

	if (shouldFix) {
		await writeFile(new URL('../.nvmrc', import.meta.url), expected + '\n', 'utf-8')
		console.log(`Wrote .nvmrc (${expected}) from package.json engines.node (${range})`)
		return
	}

	if (actual === null) {
		console.error(
			[
				'Missing .nvmrc.',
				`Expected .nvmrc to contain: ${expected}`,
				`Derived from package.json engines.node: ${range}`,
				'',
				'Fix: yarn lint:nvmrc:fix',
			].join('\n'),
		)
	} else {
		console.error(
			[
				'.nvmrc is out of sync with package.json.',
				`Found .nvmrc: ${actual}`,
				`Expected: ${expected}`,
				`Derived from package.json engines.node: ${range}`,
				'',
				'Fix: yarn lint:nvmrc:fix',
			].join('\n'),
		)
	}

	process.exitCode = 1
}

await main()
