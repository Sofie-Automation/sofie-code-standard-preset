import requireTypedObjectValuesAndEntries from './rules/require-typed-object-values-and-entries.mjs'

export default {
	rules: {
		'require-typed-object-values-and-entries': requireTypedObjectValuesAndEntries,
	},
	configs: {
		all: {
			rules: {
				'@sofie-automation/require-typed-object-values-and-entries': 'error',
			},
		},
	},
}
