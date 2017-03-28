import { Class as ProtectedDocument } from "carbonldp/ProtectedDocument";

import { BasicCarbonData, CountryCarbonData } from "app/data/carbonData";
import { CarbonDataService } from "app/data/carbonData.service";

export interface UserTemplate {
	types: string[],
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

export interface User extends UserTemplate, ProtectedDocument {
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

export class Factory {
	static createTemplate():UserTemplate {
		return {
			types: [ CarbonDataService.CONTAINER_TYPES.get( CarbonDataService.USERS_SLUG ) ],
		}
	}
}