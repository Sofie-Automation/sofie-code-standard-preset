import { generateEslintConfig } from './eslint/main.mjs'

const config = await generateEslintConfig({
	disableNodeRules: false,
})

config.push({
	files: ['bin/**'],
	rules: {
		'n/no-process-exit': 'off',
		'n/no-unpublished-bin': 'off',
	},
})

export default config
