module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'airbnb-base',
		'airbnb-typescript/base',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	env: {
		browser: true,
	},
	parserOptions: {
		project: './tsconfig.json',
		ecmaVersion: 2017,
		sourceType: 'module',
		ecmaFeatures: {
			modules: true,
		},
	},
	rules: {
		'max-len': 'off', // just apply common-sense
		'no-param-reassign': 'off',
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // all dev deps
		'no-bitwise': 'off', // for physics masks

		// prefer named
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'error',

		'import/no-cycle': 'off', // fix + re-enable

		// stylistic preferences
		'@typescript-eslint/ban-ts-comment': 'warn',
		'no-console': 'warn',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'class-methods-use-this': 'warn',

		// tabs instead of spaces
		'no-tabs': 'off',
		indent: ['error', 'tab', { SwitchCase: 1 }],

		'import/extensions': ['error', 'never'],
		'no-multi-assign': 'off',
		'no-plusplus': 'off',
		'no-continue': 'off',
		'lines-between-class-members': 'off',
	},
};
