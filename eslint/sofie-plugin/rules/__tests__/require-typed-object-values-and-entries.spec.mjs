/* eslint-disable n/no-unpublished-import, n/no-extraneous-import, n/no-missing-import */
import * as parser from '@typescript-eslint/parser'
import { RuleTester } from '@typescript-eslint/rule-tester'
import * as vitest from 'vitest'

// eslint-disable-next-line n/file-extension-in-import
import rule from '../require-typed-object-values-and-entries'

RuleTester.afterAll = vitest.afterAll
RuleTester.it = vitest.it
RuleTester.itOnly = vitest.it.only
RuleTester.describe = vitest.describe

const ruleTester = new RuleTester({
	// @ts-ignore Typescript in vscode insists this is valid, but ts-jest insists it is invalid
	languageOptions: {
		parser: parser,
		parserOptions: {
			project: '../../../tsconfig.json',
			tsconfigRootDir: __dirname,
		},
	},
})

ruleTester.run('object-things-require-generic', rule, {
	valid: [
		{
			code: 'const a = Object.values<string>(b)',
			options: [],
		},
		{
			code: 'const a = Object.keys(b)',
			options: [],
		},
		{
			code: 'const a = Object.entries<string>(b)',
			options: [],
		},
	],
	invalid: [
		{
			code: 'const a = Object.values(b)',
			errors: [{ messageId: 'useGenericValues' }],
		},
		{
			code: 'const a = Object.entries(b)',
			errors: [{ messageId: 'useGenericEntries' }],
		},
	],
})
