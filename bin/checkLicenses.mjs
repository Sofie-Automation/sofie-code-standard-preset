#!/usr/bin/env node
'use strict'

import fs from 'fs'
import path from 'path'

import { asCSV, asMarkDown, asPlainVertical, init } from 'license-checker-rseidelsohn'
import meow from 'meow'
import { readPackageUpSync } from 'read-package-up'

const outFormats = {
	json: (packages) => `${JSON.stringify(packages, null, '\t')}\n`,
	csv: (packages) => asCSV(packages),
	markdown: (packages) => asMarkDown(packages),
	plainVertical: (packages) => asPlainVertical(packages),
}

const cli = meow(
	// editorconfig-checker-disable -- The below string should be formatted with spaces
	`
    Usage
      $ sofie-licensecheck
      $ sofie-licensecheck --allowPackages "package-name@1.2.3;other-package@1.2.3"
      $ sofie-licensecheck --out licenses.json

    Options
      --debug  Show full packages list
      --allowPackages Semi-colon separated list of packages to ignore (eg cycle@1.0.3;underscore@1.12.0)
      --allowList Which default list of licenses to use. Possible values: "MIT", "none". Defaults to "MIT"
      --allowLicenses Semi-colon separated list of licenses to allow in addition to the default list (eg GPL-3.0-only;MIT)
      --out Write the list of found packages and their licenses to this file. Only written when the check passes
      --format Format of the --out file. Possible values: ${Object.keys(outFormats).join(', ')}. Defaults to "json"

    The check fails if any of the dependencies or devDependencies declared in package.json are not found.
    This happens when run inside a workspace whose dependencies are hoisted to the root node_modules;
    run the check from the root of the repository instead.
`,
	// editorconfig-checker-enable
	{
		importMeta: import.meta,
		flags: {
			debug: {
				type: 'boolean',
			},
			allowPackages: {
				type: 'string',
			},
			allowList: {
				type: 'string',
			},
			allowLicenses: {
				type: 'string',
			},
			out: {
				type: 'string',
			},
			format: {
				type: 'string',
				default: 'json',
			},
		},
	}
)

const formatOutput = outFormats[cli.flags.format]
if (!formatOutput) {
	console.error(
		`Invalid argument value: --format: ${cli.flags.format} (possible values: ${Object.keys(outFormats).join(', ')})`
	)
	process.exit(1)
}

// This is so that when used in a private project it validates
const pkgInfo = readPackageUpSync()
const projectNameAndVersion = `${pkgInfo.packageJson.name}@${pkgInfo.packageJson.version}`

const allowLists = {
	MIT: 'MIT;BSD;ISC;Apache-2.0;CC0;CC-BY-3.0;CC-BY-4.0;Unlicense;Artistic-2.0;Python-2.0;BlueOak-1.0.0',
	none: '',
	// TODO - Add allowList with a list for GPL projects
}

const useAllowList = cli.flags.allowList || 'MIT'
let allowList = ''
if (useAllowList === 'none') {
	allowList = allowLists.none
} else if (useAllowList === 'MIT') {
	allowList = allowLists.MIT
} else {
	console.error(`Invalid argument value: --allowList: ${useAllowList} (possible values: "MIT", "none")`)
	process.exit(1)
}
if (cli.flags.allowLicenses) {
	allowList += `;${cli.flags.allowLicenses}`
}

let excludePackages = projectNameAndVersion
if (cli.flags.allowPackages) {
	excludePackages += `;${cli.flags.allowPackages}`
}

if (cli.flags.debug) {
	console.log('CLI flags', cli.flags)
	console.log('excludePackages', excludePackages)
	console.log('allowList', allowList)
}

const nameFromId = (id) => id.slice(0, id.lastIndexOf('@'))

/**
 * Find the declared dependencies that the checker did not find installed.
 * If any are missing, the checker is not seeing the real dependency tree (eg run inside a hoisted workspace),
 * so the check would pass without checking anything.
 */
function findMissingDependencies(packages) {
	const foundNames = new Set([
		...Object.keys(packages).map(nameFromId),
		// Packages excluded via --allowPackages are removed from the results, but were still found
		...excludePackages.split(';').filter(Boolean).map(nameFromId),
	])

	const declaredNames = Object.keys({
		...pkgInfo.packageJson.dependencies,
		...pkgInfo.packageJson.devDependencies,
	})

	return declaredNames.filter((name) => !foundNames.has(name))
}

init(
	{
		start: path.resolve('.'),
		onlyAllow: allowList,
		excludePackages: excludePackages,
		relativeLicensePath: !!cli.flags.out,
	},
	(err, packages) => {
		if (err) {
			//Handle error
			console.error(err)
			process.exit(1)
		}

		if (cli.flags.debug) {
			console.log(packages)
		}

		const missingDependencies = findMissingDependencies(packages)
		if (missingDependencies.length > 0) {
			console.error(
				`${missingDependencies.length} dependencies declared in package.json were not found in ${path.resolve('.')}, so their licenses could not be checked:\n` +
					missingDependencies.map((name) => `  - ${name}`).join('\n') +
					`\nIf this is a workspace in a monorepo, its dependencies are likely hoisted to the root node_modules. Run the license check from the root of the repository instead.`
			)
			process.exit(1)
		}

		if (cli.flags.out) {
			// Avoid machine specific absolute paths in the output (licenseFile is made relative by relativeLicensePath)
			for (const info of Object.values(packages)) {
				if (info.path) info.path = path.relative(path.resolve('.'), info.path)
			}

			fs.mkdirSync(path.dirname(path.resolve(cli.flags.out)), { recursive: true })
			fs.writeFileSync(cli.flags.out, formatOutput(packages), 'utf8')
			console.log(`Wrote license list for ${Object.keys(packages).length} packages to ${cli.flags.out}`)
		}

		process.exit(0)
	}
)
