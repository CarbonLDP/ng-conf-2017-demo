import { DefaultContainerData, DefaultElementData } from "script/default-data";

export function elementSlug( element:DefaultElementData ):string {
	let name:string = element.data.name
		.trim()
		.toLowerCase()
		.replace( /\s+/g, "-" );
	return encodeURI( name ) + "/";
}

export function extractElementsData( container:DefaultContainerData ):Object[] {
	return container.children.map( element => {
		return Object.assign( {}, container.childTemplate, element.data );
	} );
}
