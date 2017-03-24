import { DefaultContainerData, DefaultElementData } from "script/default-data";
import { dataSlug } from "app/utils";

export function elementSlug( element:DefaultElementData ):string {
	return dataSlug( element.data.name );
}

export function extractElementsData( container:DefaultContainerData ):Object[] {
	return container.children.map( element => {
		return Object.assign( {}, container.childTemplate, element.data );
	} );
}
