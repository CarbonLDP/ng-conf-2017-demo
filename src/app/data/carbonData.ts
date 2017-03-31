import { Class as Resource } from "carbonldp/Resource";

import * as VOCAB from "app/ns/vocab";

export interface RawBasicData {
	types:string[];
	name:string;
}

export interface BasicCarbonData extends Resource, RawBasicData {
}

export interface CountryCarbonData extends BasicCarbonData {
	states?:BasicCarbonData[];
}



export class Utils {
	static getPrincipalType( resource:Resource ):string {
		return Object.keys( VOCAB )
			.map( key => VOCAB[ key ] )
			.find( type => resource.hasType( type ) );
	}
}