import sortImports from '@ianvs/prettier-plugin-sort-imports'

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
	importOrderTypeScriptVersion: '5.7.0',
	importOrderCaseSensitive: false,
}

export default config
