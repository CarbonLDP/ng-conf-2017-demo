import { Class as ProtectedDocument } from "carbonldp/ProtectedDocument";

import { BasicCarbonData, CountryCarbonData } from "app/data/carbonData";
import * as VOCAB from "app/ns/vocab";

export interface UserTemplate {
	types:string[],
	nickname?:string;
	birthDate?:BasicCarbonData | string;
	birthday?:BasicCarbonData | string;
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
	birthDate?:BasicCarbonData;
	birthday?:BasicCarbonData;
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
			types: [ VOCAB.User ],
		}
	}
}