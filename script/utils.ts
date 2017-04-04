import { DefaultBasicData, DefaultContainerData, DefaultData, DefaultUserData } from "script/default-data";
import { dataSlug } from "app/utils";

export function elementDataSlug( elementData:DefaultData ):string {
	const slugName:string = (elementData as DefaultBasicData).name || (elementData as DefaultUserData).username;
	return dataSlug( slugName );
}

export function extractElementsData( container:DefaultContainerData ):DefaultData[] {
	return container.children.map( element => {
		return Object.assign( {}, container.childTemplate, element.data );
	} );
}
