const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = (env, argv) =>
	merge(base(env, argv), {
		devtool: 'inline-source-map',

		// watcher
		devServer: {
			static: {
				directory: './dist',
			},
			hot: true,
		},
	});
