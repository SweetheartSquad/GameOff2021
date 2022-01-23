const webpack = require('webpack');
const { merge } = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = (env, argv) =>
	merge(base(env, argv), {
		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify('production'),
				'process.env.HASH': Date.now(),
			}),
		],
	});
