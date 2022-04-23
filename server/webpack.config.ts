import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import NodemonPlugin from 'nodemon-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

export default {
	mode: 'development',
	externalsPresets: { node: true },
	externals: [nodeExternals()],
	node: {
		global: false,
		__filename: false,
		__dirname: false,
	},
	entry: './src/server.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias: {
			'@models': path.resolve(__dirname, 'src/models/'),
		},
	},
	plugins: [
		new NodemonPlugin({
			env: {
				PORT: 8000,
			},
		}),
		new CopyPlugin({
			patterns: [{ from: 'public', to: 'public' }],
		}),
	],
};
