const webpack = require('webpack');
const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = (env, argv) =>
	merge(base(env, argv), {
		devtool: 'inline-source-map',
		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify('development'),
				'process.env.HASH': Date.now(),
			}),
		],

		// watcher
		devServer: {
			static: {
				directory: './dist',
			},
			hot: true,
		},
	});
