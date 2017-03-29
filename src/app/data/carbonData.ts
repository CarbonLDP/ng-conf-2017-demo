import { Class as Resource } from "carbonldp/Resource";

export interface RawBasicData {
	types:string[];
	name:string;
}

export interface BasicCarbonData extends Resource, RawBasicData {
}

export interface CountryCarbonData extends BasicCarbonData {
	states?:BasicCarbonData[];
}
