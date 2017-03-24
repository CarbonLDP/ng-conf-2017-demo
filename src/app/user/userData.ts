import { BasicCarbonData, CountryCarbonData } from "app/data/carbonData";

export interface UserTemplate {
	nickname?:string;
	birthDate?:Date;
	birthCountry?:CountryCarbonData;
	birthState?:BasicCarbonData;
	birthCity?:BasicCarbonData | string;
	company?:BasicCarbonData | string;
	worksOn?:BasicCarbonData;
	desktopOSPreference?:BasicCarbonData;
	mobileOSPreference?:BasicCarbonData;
	institute?:BasicCarbonData | string;
	email?:string;
}

export interface User extends UserTemplate {
	nickname:string;
	birthDate?:Date;
	birthCountry?:CountryCarbonData;
	birthState?:BasicCarbonData;
	birthCity?:BasicCarbonData;
	company?:BasicCarbonData;
	worksOn?:BasicCarbonData;
	desktopOSPreference?:BasicCarbonData;
	mobileOSPreference?:BasicCarbonData;
	institute?:BasicCarbonData;
	email?:string;
}