import { DefaultBasicData, DefaultContainerData, DefaultData, DefaultElementData, DefaultUserData } from "script/default-data";
import { dataSlug } from "app/utils";

export function elementDataSlug( elementData:DefaultData ):string {
	const slugName:string = (elementData as DefaultBasicData).name || (elementData as DefaultUserData).username;
	return dataSlug( slugName );
}

export function extractData( container:DefaultContainerData, element:DefaultElementData ):DefaultData {
	return Object.assign( {}, container.childTemplate, element.data );
}
