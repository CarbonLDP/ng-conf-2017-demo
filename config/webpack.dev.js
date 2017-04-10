const webpack = require( "webpack" );
const webpackMerge = require( "webpack-merge" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./helpers" );

module.exports = function( env ) {

	let host = ( env && env.host ) || "http://localhost";
	if( ! host.startsWith( "http" ) )
		host = "http://" + host;
	host = host + ":8080/";

	return webpackMerge( commonConfig( env ), {
		devtool: "cheap-module-eval-source-map",

		output: {
			path: helpers.root( "dist" ),
			publicPath: host,
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
			},
			// Added so other machines can connect to the server
			host: "0.0.0.0"
		}
	} );
};