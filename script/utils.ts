import { DefaultElementData } from "script/default-data";

export function elementSlug( element:DefaultElementData ):string {
	let name:string = element.name
		.trim()
		.toLowerCase()
		.replace( /\s+/g, "-" );
	return encodeURI( name );
}
