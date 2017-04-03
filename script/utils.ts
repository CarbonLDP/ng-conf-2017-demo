import { DefaultBasicData, DefaultContainerData, DefaultElementData, DefaultUserData } from "script/default-data";
import { dataSlug } from "app/utils";

export function elementSlug( element:DefaultElementData ):string {
	const slugName:string = (element.data as DefaultBasicData).name || (element.data as DefaultUserData).username;
	return dataSlug( slugName );
}

export function extractElementsData( container:DefaultContainerData ):Object[] {
	return container.children.map( element => {
		return Object.assign( {}, container.childTemplate, element.data );
	} );
}
