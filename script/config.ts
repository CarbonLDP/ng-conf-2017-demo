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

let argv = yargs
	.usage( "\nUsage: $0 [args]" )
	.describe( {
		"protocol": "Protocol of the Carbon LDP server",
		"domain": "Domain of the Carbon LDP server",
		"slug": "Slug your application will have. It is important that it end with a trailing slash",
		"user": "Email of your Carbon LDP application manager",
		"password": "Password of your Carbon LDP application manager",
		"clean": "If set, the script will reset the application data to its default values"
	} )
	.boolean( "clean" )
	.alias( {
		"h": "help",
		"p": "protocol",
		"d": "domain",
		"s": "slug",
		"u": "user",
		"pass": "password",
		"c": "clean",
	} )
	.default( {
		"protocol": CARBON_ENV.protocol,
		"domain": CARBON_ENV.domain,
		"slug": CARBON_ENV.slug,
		"user": CARBON_ENV.user,
		"pass": CARBON_ENV.pass,
	} )
	.help()
	.argv;

export const PRODUCTION:boolean = process.env.ENV === "production";
export const SECURE:boolean = argv.protocol === "https";
export const DOMAIN:string = argv.domain;
export const APP_SLUG:string = argv.slug;
export const CLEAN_APP:boolean = !! argv.clean;
export const CARBON_USER:string = argv.user;
export const CARBON_PASS:string = argv.pass;
