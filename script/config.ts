import yargs = require( "yargs" );

let CARBON_ENV:{ protocol:string, domain:string, slug:string, user:string, pass:string } = {
	protocol: "http",
	domain: "localhost:8083",
	slug: "demo-app/",
	user: "admin@carbonldp.com",
	pass: "hello"
};
if( process.env.CARBON && typeof process.env.CARBON === "string" )
	Object.assign( CARBON_ENV, JSON.parse( process.env.CARBON ) );

const WS_ENV:{ host:string, ssl:boolean } = {
	host: "localhost:8090",
	ssl: false,
};
if( process.env.WS && typeof process.env.WS === "string" )
	Object.assign( WS_ENV, JSON.parse( process.env.WS ) );
WS_ENV.host = ! WS_ENV.host.startsWith( "ws://" ) && ! WS_ENV.host.startsWith( "wss://" ) ?
	WS_ENV.ssl ? `wss://${ WS_ENV.host }` : `ws://${ WS_ENV.host }` :
	WS_ENV.host;

let argv = yargs
	.usage( "\nUsage: $0 [args]" )
	.describe( {
		"protocol": "Protocol of the Carbon LDP server",
		"domain": "Domain of the Carbon LDP server",
		"slug": "Slug your application will have. It is important that it end with a trailing slash",
		"user": "Email of your Carbon LDP application manager",
		"password": "Password of your Carbon LDP application manager",
		"clean": "If set, the script will reset the application data to its default values",
		"sync_host": "Domain of the synchronizer server",
		"sync_ssl": "If the synchronizer server is under a secure connection or not",
		"inject": "Creates the number of users specified",
		"inject-time": "Time in milliseconds, to wait between every new user creation",
		"built": "Omits the building of the entire application an its default data. To be used when the application already exists and only want to inject test data",
	} )
	.boolean( [
		"clean",
		"ssl",
		"built",
	] )
	.number( [
		"inject",
		"inject-time",
	] )
	.alias( {
		"h": "help",
		"p": "protocol",
		"d": "domain",
		"s": "slug",
		"u": "user",
		"pass": "password",
		"c": "clean",
		"i": "inject",
		"t": "inject-time",
		"b": "built",
	} )
	.default( {
		"protocol": CARBON_ENV.protocol,
		"domain": CARBON_ENV.domain,
		"slug": CARBON_ENV.slug,
		"user": CARBON_ENV.user,
		"pass": CARBON_ENV.pass,
		"sync_host": WS_ENV.host,
		"sync_ssl": WS_ENV.ssl,
		"inject-time": 5000,
		"built": false,
	} )
	.help()
	.argv;

export const PRODUCTION:boolean = process.env.ENV === "production";
export const SECURE:boolean = argv.protocol === "https";
export const DOMAIN:string = argv.domain;
export const APP_SLUG:string = argv.slug;
export const CLEAN_APP:boolean = ! ! argv.clean;
export const CARBON_USER:string = argv.user;
export const CARBON_PASS:string = argv.pass;

export const WS_HOST:string = argv[ "sync_host" ];
export const INJECT:number = argv.inject;
export const INJECT_TIME:number = argv[ "inject-time" ];
export const NO_BUILD:boolean = argv[ "built" ];
