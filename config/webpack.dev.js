const webpack = require( "webpack" );
const webpackMerge = require( "webpack-merge" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./helpers" );

const CARBON = { protocol: "http", domain: "localhost:8083" };
if( process.env.CARBON && typeof process.env.CARBON === "string" )
	Object.assign( CARBON, JSON.parse( process.env.CARBON ) );

module.exports = webpackMerge( commonConfig, {
	devtool: "cheap-module-eval-source-map",

	output: {
		path: helpers.root( "dist" ),
		publicPath: "http://localhost:8080/",
		filename: "[name].js",
		chunkFilename: "[id].chunk.js"
	},

	plugins: [
		new ExtractTextPlugin( "[name].css" ),
		new webpack.DefinePlugin( {
			"process.env.CARBON": {
				protocol: JSON.stringify( CARBON.protocol ),
				domain: JSON.stringify( CARBON.domain ),
			}
		} ),
	],

	devServer: {
		historyApiFallback: true,
		stats: "minimal"
	}
} );