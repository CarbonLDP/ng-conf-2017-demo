export function dataSlug( rawSlug:string ):string {
	let name:string = rawSlug
		.trim()
		.toLowerCase()
		.replace( /(?:\s+)|(?:\/)/g, "-" );
	return encodeURI( name ) + "/";
}