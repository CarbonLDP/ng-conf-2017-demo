export function dataSlug( rawSlug:string ):string {
	let name:string = rawSlug
		.trim()
		.toLowerCase()
		.replace( /(?:[^A-za-z0-9]+)/g, "-" );
	return name + "/";
}