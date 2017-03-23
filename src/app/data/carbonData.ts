import Pointer from "carbonldp/Pointer";

export interface BasicCarbonData extends Pointer {
	name:string;
}

export interface CountryCarbonData extends BasicCarbonData {
	states?:BasicCarbonData[];
}
