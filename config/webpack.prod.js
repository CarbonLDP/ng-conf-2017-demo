// Sets process environment to production
const ENV = process.env.NODE_ENV = process.env.ENV = "production";

const webpack = require( "webpack" );
const webpackMerge = require( "webpack-merge" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const OptimizeCssAssetsPlugin = require( "optimize-css-assets-webpack-plugin" );
const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./helpers" );
const FaviconsWebpackPlugin = require( "favicons-webpack-plugin" );


module.exports = function( env ) {
	return webpackMerge.smart( commonConfig( env ), {
		devtool: "source-map",

		output: {
			path: helpers.root( "dist" ),
			publicPath: "/",
			filename: "[name].[hash].js",
			chunkFilename: "[id].[hash].chunk.js"
		},

		module: {
			rules: [
				{
					test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
					loaders: {
						loader: "image-webpack-loader",
						// tcoopman/image-webpack-loader#88
						options: {},
					},
				}
			]
		},

		plugins: [
			new webpack.NoEmitOnErrorsPlugin(),

			new webpack.optimize.UglifyJsPlugin( {
				beautify: false,
				output: {
					comments: false
				},
				mangle: {
					keep_fnames: true
				},
				sourceMap: true
			} ),

			new OptimizeCssAssetsPlugin( {
				cssProcessorOptions: { discardComments: { removeAll: true } },
				canPrint: true
			} ),

			new ExtractTextPlugin( "[name].[hash].css" ),

			new webpack.DefinePlugin( {
				"process.env": {
					"ENV": JSON.stringify( ENV ),
				}
			} ),

			new FaviconsWebpackPlugin( helpers.root( "src", "favicon.svg" ) ),
		]
	} )
};
