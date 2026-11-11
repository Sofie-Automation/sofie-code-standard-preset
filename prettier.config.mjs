import sortImportsPlugin from '@ianvs/prettier-plugin-sort-imports'

/**
 * The plugin exposes its ember and oxc parsers and printers as getters, which throw when their optional peer
 * dependency (prettier-plugin-ember-template-tag / @prettier/plugin-oxc) is not installed.
 * Prettier reads all of them while resolving the config, so a project without those peers fails to format
 * anything. Only expose the ones which can actually be loaded.
 */
function withoutUnloadable(entries) {
	return Object.fromEntries(
		Object.keys(entries).flatMap((name) => {
			try {
				return [[name, entries[name]]]
			} catch {
				return []
			}
		})
	)
}
const sortImports = {
	...sortImportsPlugin,
	parsers: withoutUnloadable(sortImportsPlugin.parsers),
	printers: withoutUnloadable(sortImportsPlugin.printers),
}

/** @type {import('prettier').Config} */
const config = {
	arrowParens: 'always',
	bracketSpacing: true,
	printWidth: 120,
	semi: false,
	singleQuote: true,
	useTabs: true,
	tabWidth: 4,
	endOfLine: 'lf',
	trailingComma: 'es5',
	plugins: [sortImports],
	importOrder: [
		'<BUILTIN_MODULES>',
		'<TYPES>^(node:)',
		'',
		'<THIRD_PARTY_MODULES>',
		'<TYPES>',
		'',
		'^@sofie-automation',
		'<TYPES>^@sofie-automation',
		'',
		'^[./]',
		'<TYPES>^[./]',
	],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderTypeScriptVersion: '6.0.0',
	overrides: [
		{
			files: ['*.yaml', '*.yml'],
			options: {
				// YAML files should always use 2 spaces for indentation
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
}

export default config
