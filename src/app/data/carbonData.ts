import Pointer from "carbonldp/Pointer";

export interface RawBasicData {
	name:string;
}

export interface BasicCarbonData extends Pointer, RawBasicData {}

export interface CountryCarbonData extends BasicCarbonData {
	states?:BasicCarbonData[];
}