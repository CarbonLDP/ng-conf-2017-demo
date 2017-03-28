const webpack = require( "webpack" );
const webpackMerge = require( "webpack-merge" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./helpers" );

module.exports = function( env ) {
	return webpackMerge( commonConfig( env ), {
		devtool: "cheap-module-eval-source-map",

		output: {
			path: helpers.root( "dist" ),
			publicPath: "http://localhost:8080/",
			filename: "[name].js",
			chunkFilename: "[id].chunk.js"
		},

		plugins: [
			new ExtractTextPlugin( "[name].css" ),
		],

		devServer: {
			historyApiFallback: true,
			stats: "minimal",
			compress: true,
			watchOptions: {
				poll: 1000,
			}
		}
	} );
};