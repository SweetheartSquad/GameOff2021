const HtmlWebpackPlugin = require('html-webpack-plugin');
const ChunkProgressWebpackPlugin = require('chunk-progress-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const pkg = require('./package');

module.exports = (env, argv) => ({
	module: {
		rules: [
			{
				test: /\.(j|t)s?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/, // stylesheets
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									require('autoprefixer')(),
									require('postcss-clean')(),
								],
							},
						},
					},
				],
			},
			{
				test: /(?<!\.fnt)\.(png|jpg|gif|wav|ogg|mp3|glsl|xml|strand|txt)$/,
				use: {
					loader: 'file-loader',
					options: {
						outputPath: 'assets/',
						name: argv.mode === 'development' ? undefined : '[name].[ext]',
					},
				},
			},
			{
				test: /(otf|ttf|woff)$/,
				type: 'asset/inline',
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			path: false,
		},
	},
	output: {
		filename: '[name].bundle.js',
		clean: true,
	},
	plugins: [
		new ChunkProgressWebpackPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: 'assets/**/*.{png,jpg,mp3,ogg,txt,fnt}',
					context: 'src',
				},
			],
		}),
		new HtmlWebpackPlugin({
			// creates index.html
			title: pkg.description,
			template: './src/index.html',
			minify: true,
			hash: true,
			favicon: './src/assets/icon.png',
		}),
	],
});
