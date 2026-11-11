#!/usr/bin/env node
import { execFile } from 'child_process'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

import { format } from 'date-fns'
import meow from 'meow'
import semver from 'semver'

const cli = meow(
	// editorconfig-checker-disable -- The below string should be formatted with spaces
	`
    Usage
      $ sofie-version

    Options
      --dry-run  Simulate the version update process
      --prerelease Whether to tag a prerelease build, and the suffix to use
      --release-as Release as this version, or as a major, minor or patch bump, instead of determining it from the commits
      --lastTag Optionally specify the last tag in the existing changelog

    In a monorepo every workspace is set to the same version. Workspaces which have a CHANGELOG.md committed
    also get their own changelog, of the commits which touched that workspace.
`,
	// editorconfig-checker-enable
	{
		importMeta: import.meta,
		flags: {
			dryRun: {
				type: 'boolean',
			},
			prerelease: {
				type: 'string',
			},
			releaseAs: {
				type: 'string',
			},
			lastTag: {
				type: 'string',
			},
		},
	}
)

const START_OF_LAST_RELEASE_PATTERN = /(^#+ \[?\d+\.\d+\.\d+|<a name=)/m
const HEADER = `# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) for commit guidelines.\n\n`

const execPromise = async (file, args) =>
	(
		await promisify(execFile)(file, args, {
			shell: process.platform === 'win32',
			maxBuffer: 64 * 1024 * 1024,
		})
	).stdout

const packageFile = JSON.parse(await readFile('./package.json', { encoding: 'utf-8' }))
const isMonoRepo = !!packageFile.workspaces
const isYarnBerry = existsSync('.yarn')

if (!packageFile.homepage) {
	console.error('No repository homepage specified in the package.json, exiting...')
	process.exit(1)
}

const currentVersion = packageFile.version
const repoUrl = packageFile.homepage.split('#')[0]

// find the last release tag which is part of the history of HEAD
const lastTag =
	cli.flags.lastTag ||
	(await execPromise('git', ['tag', '--list', '--merged', 'HEAD', '--sort=-v:refname']))
		.split('\n')
		.find((tag) => semver.valid(tag)) ||
	''

/**
 * Find the conventional commits since the last tag
 * @param {string[]} [paths] Only include commits which touch these paths
 */
async function getChanges(paths) {
	const args = ['log', '--format=%x1e%s%x1f%b%x1f%h%x1f%H', lastTag ? `${lastTag}..HEAD` : 'HEAD']
	if (paths) args.push('--', ...paths)

	const breakingChanges = {}
	const changes = {}

	const conventional = /^(?<type>\w+)(?<scope>(?:\([^()\r\n]*\)|\()?(?<breaking>!)?)(?<subject>:.*)?/
	for (const rawCommit of (await execPromise('git', args)).split('\x1e')) {
		const [subject, body, short, hash] = rawCommit.split('\x1f')
		const match = subject && conventional.exec(subject)
		if (!match?.groups) continue

		const { breaking, type, subject: description, scope } = match.groups
		const toAdd = breaking ? breakingChanges : changes

		if (!toAdd[type]) toAdd[type] = []

		toAdd[type].push({
			subject,
			body,
			short,
			hash: hash.trim(),
			description: description?.slice(2) || subject,
			scope: scope,
		})
	}

	return { breakingChanges, changes }
}

const rootChanges = await getChanges()

let identifier
if (cli.flags.prerelease) {
	identifier = cli.flags.prerelease.replace(/[^a-z0-9]+/gi, '-')

	// add on a git and date suffix
	const gitHash = await execPromise('git', ['rev-parse', '--short', 'HEAD'])
	const commitDateStr = await execPromise('git', ['log', '-1', '--pretty=format:%ct', 'HEAD'])
	const commitDate = parseInt(commitDateStr.trim()) * 1000
	identifier += `-${format(commitDate, 'yyyyMMdd-HHmmss')}-${gitHash.trim()}`
}

function getNextVersion() {
	const isPrerelease = cli.flags.prerelease !== undefined
	const releaseAs = cli.flags.releaseAs

	if (releaseAs && semver.valid(releaseAs)) {
		// An explicit version
		const target = semver.clean(releaseAs)
		if (!isPrerelease) return target

		const current = semver.parse(currentVersion)
		if (
			!identifier &&
			current.prerelease.length &&
			`${current.major}.${current.minor}.${current.patch}` === target
		) {
			// Continue the prerelease series of this version
			return semver.inc(currentVersion, 'prerelease')
		}
		return identifier ? `${target}-${identifier}.0` : `${target}-0`
	}

	let bump
	if (releaseAs) {
		if (!['major', 'minor', 'patch'].includes(releaseAs)) {
			console.error(`Invalid --release-as "${releaseAs}", it must be a version or one of major, minor or patch`)
			process.exit(1)
		}
		bump = releaseAs
	} else {
		const hasBreaking = Object.keys(rootChanges.breakingChanges).length > 0
		const hasFeatures = rootChanges.changes['feat']?.length > 0
		bump = hasBreaking ? 'major' : hasFeatures ? 'minor' : 'patch'
	}

	if (!isPrerelease) return semver.inc(currentVersion, bump)

	if (!identifier && !releaseAs && semver.prerelease(currentVersion)) {
		// Continue the existing prerelease series
		return semver.inc(currentVersion, 'prerelease')
	}

	return semver.inc(currentVersion, `pre${bump}`, identifier)
}
const nextVersion = getNextVersion()

// create a markdown changelog
const groups = {
	feat: 'Features',
	fix: 'Fixes',
}
const compareUrl = lastTag ? `${repoUrl}/compare/${lastTag}...v${nextVersion}` : `${repoUrl}/commits/v${nextVersion}`

/**
 * Render the changelog entry of this release
 * @param {Awaited<ReturnType<typeof getChanges>>} changes
 * @param {string} [packageName] When set, this is the changelog of a workspace of a monorepo
 */
function renderChangelog({ breakingChanges, changes }, packageName) {
	let md = `## [${nextVersion}](${compareUrl}) (${new Date().toDateString()})\n`
	let hasEntries = false

	const renderChange = (change) =>
		`\n* ${change.scope ? `**${change.scope}** ` : ''}${change.description} [${change.short}](${repoUrl}/commit/${change.hash})`

	if (Object.keys(breakingChanges).length) {
		md += '\n## Breaking changes\n'

		for (const [type, commits] of Object.entries(breakingChanges)) {
			if (!groups[type]) continue
			md += '\n### ' + groups[type] + '\n'

			for (const change of commits) {
				md += renderChange(change)
				hasEntries = true
			}
		}
	}
	for (const [type, commits] of Object.entries(changes)) {
		if (!groups[type]) continue
		md += '\n\n### ' + groups[type] + '\n'

		for (const change of commits) {
			md += renderChange(change)
			hasEntries = true
		}
	}

	if (packageName && !hasEntries) {
		md += `\n**Note:** Version bump only for package ${packageName}\n`
	}

	return md
}

/** The changelogs to write, as [path, markdown] */
const changelogs = [['CHANGELOG.md', renderChangelog(rootChanges)]]

/** The workspaces of the monorepo, excluding the root */
let workspaces = []
if (isMonoRepo && isYarnBerry) {
	workspaces = (await execPromise('yarn', ['workspaces', 'list', '--json']))
		.split('\n')
		.filter((line) => line.trim())
		.map((line) => JSON.parse(line))
		.filter((workspace) => workspace.location !== '.')

	for (const workspace of workspaces) {
		// Only workspaces which have a changelog committed get one, so that a monorepo can choose which have one
		const changelogPath = path.posix.join(workspace.location, 'CHANGELOG.md')
		const isTracked = (await execPromise('git', ['ls-files', '--', changelogPath])).trim() !== ''
		if (!isTracked) continue

		changelogs.push([changelogPath, renderChangelog(await getChanges([workspace.location]), workspace.name)])
	}
}

async function prependToChangelog(changelogPath, md) {
	let oldContent = ''
	try {
		oldContent = await readFile(changelogPath, { encoding: 'utf-8' })
		const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN)
		if (oldContentStart !== -1) {
			oldContent = oldContent.substring(oldContentStart)
		}
	} catch (e) {
		if (e.code === 'ENOENT') {
			// File does not exist, ignore
		} else {
			throw e
		}
	}

	await writeFile(changelogPath, HEADER + md + '\n\n' + oldContent)
}

if (!cli.flags.dryRun) {
	// Write to the changelog files
	for (const [changelogPath, md] of changelogs) {
		await prependToChangelog(changelogPath, md)
	}

	// To ensure formatting, also run prettier:
	await execPromise('yarn', ['prettier', '--write', ...changelogs.map(([changelogPath]) => changelogPath)])

	// update the package.json
	if (isYarnBerry) {
		if (isMonoRepo) {
			// Update all workspaces, this also updates the dependencies between them
			await execPromise('yarn', ['workspaces', 'foreach', '--all', 'version', '-d', nextVersion])
			await execPromise('yarn', ['version', 'apply', '--all'])
		} else {
			// yarn 3 needs a different command
			await execPromise('yarn', ['version', nextVersion])
		}
	} else {
		await execPromise('yarn', ['version', '--no-git-tag-version', '--new-version', nextVersion])
	}

	// git commit
	await execPromise('git', [
		'add',
		'package.json',
		'yarn.lock',
		...workspaces.map((workspace) => path.posix.join(workspace.location, 'package.json')),
		...changelogs.map(([changelogPath]) => changelogPath),
	])

	await execPromise('git', ['commit', '--no-verify', '-m', `chore(release): v${nextVersion}`])

	// create tag
	await execPromise('git', ['tag', `v${nextVersion}`])
} else {
	for (const [changelogPath, md] of changelogs) {
		console.log(`--- ${changelogPath}\n`)
		console.log(HEADER + md)
	}
}
