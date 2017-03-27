const webpack = require( "webpack" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const helpers = require( "./helpers" );
const { TsConfigPathsPlugin } = require( "awesome-typescript-loader" );

const isProd = process.env.ENV === "production" || process.env.ENV === "prod";

let CARBON = { protocol: "http", domain: "localhost:8083" };
if( process.env.CARBON && typeof process.env.CARBON === "string" )
	Object.assign( CARBON, JSON.parse( process.env.CARBON ) );

module.exports = {
	entry: {
		"polyfills": "./src/polyfills.ts",
		"vendor": "./src/vendor.ts",
		"app": "./src/main.ts"
	},

	resolve: {
		extensions: [ ".ts", ".js" ],
		plugins: [
			new TsConfigPathsPlugin()
		]
	},

	node: {
		Buffer: false,
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loaders: [
					"awesome-typescript-loader",
					"angular2-template-loader"
				]
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			},
			{
				test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
				loader: "file-loader?name=assets/[name].[hash].[ext]"
			},
			{
				test: /\.css$/,
				exclude: helpers.root( "src", "app" ),
				loader: ExtractTextPlugin.extract( { fallbackLoader: "style-loader", loader: "css-loader?sourceMap" } )
			},
			{
				test: /\.scss$/,
				exclude: helpers.root( "src", "app" ),
				loader: ExtractTextPlugin.extract( {
					fallbackLoader: "style-loader",
					loader: [
						"css-loader?sourceMap",
						"sass-loader?sourceMap",
					],
				} )
			},
			{
				test: /\.css$/,
				include: helpers.root( "src", "app" ),
				loader: "raw-loader"
			},
			{
				test: /\.scss$/,
				include: helpers.root( "src", "app" ),
				loaders: [
					"raw-loader",
					"sass-loader"
				]
			}
		]
	},

	plugins: [
		// Workaround for angular/angular#11580
		new webpack.ContextReplacementPlugin(
			// The (\\|\/) piece accounts for path separators in *nix and Windows
			/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
			helpers.root( "src" ), // location of your src
			{} // a map of your routes
		),
		// For Angular 4.0.x
		new webpack.ContextReplacementPlugin(
			/angular(\\|\/)core(\\|\/)@angular/,
			helpers.root( "src" )
		),

		new webpack.optimize.CommonsChunkPlugin( {
			name: [ "app", "vendor", "polyfills" ]
		} ),

		new HtmlWebpackPlugin( {
			template: "ejs-loader!src/index.ejs",
			minify: isProd ? {
					removeComments: true,
					removeAttributeQuotes: true,
					collapseWhitespace: true,
					minifyCSS: true,
					minifyJS: true,
				} : false,
		} ),

		new webpack.DefinePlugin( {
			"process.env.CARBON": {
				protocol: JSON.stringify( CARBON.protocol ),
				domain: JSON.stringify( CARBON.domain ),
			}
		} ),

		// Ignore node dependencies in Carbon LDP SDK
		new webpack.IgnorePlugin( /^(http|https|url|file-type)$/, /carbonldp/ ),
	]
};