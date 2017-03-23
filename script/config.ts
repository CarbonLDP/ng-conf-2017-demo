const argv = require( "minimist" )( process.argv.slice( 2 ) );

let CARBON:{ protocol:string, domain:string, slug:string } = {
	protocol: "https",
	domain: "localhost:8083",
	slug: "demo-app/",
};

if( process.env.CARBON && typeof process.env.CARBON === "string" )
	Object.assign( CARBON, JSON.parse( process.env.CARBON ) );

if( argv.protocol )
	CARBON.protocol = argv.protocol;
if( argv.domain )
	CARBON.domain = argv.domain;
if( argv.elementSlug )
	CARBON.slug = argv.elementSlug;

export const PRODUCTION:boolean = process.env.ENV === "production";
export const SECURE:boolean = CARBON.protocol === "https";
export const DOMAIN:string = CARBON.domain;
export const APP_SLUG:string = CARBON.slug;
export const CLEAN_APP:boolean = process.env.SCRIPT_CLEAN_APP || argv.clean || false;
