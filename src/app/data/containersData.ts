import * as VOCAB from "app/ns/vocab";

export const COUNTRIES_SLUG:string = "countries/";
export const CITIES_SLUG:string = "cities/";
export const COMPANIES_SLUG:string = "companies/";
export const INSTITUTES_SLUG:string = "institutes/";
export const WORK_LAYERS_SLUG:string = "work-layers/";
export const DESKTOP_OSS_SLUG:string = "desktop-oss/";
export const MOBILE_OSS_SLUG:string = "mobile-oss/";
export const USERS_SLUG:string = "users/";
export const BIRTH_DATE:string = "birth-dates/";
export const BIRTHDAY:string = "birthdays/";

export const CONTAINER_TYPE:Map<string, string> = new Map( [
	[ COUNTRIES_SLUG, VOCAB.Country ],
	[ CITIES_SLUG, VOCAB.City ],
	[ COMPANIES_SLUG, VOCAB.Company ],
	[ INSTITUTES_SLUG, VOCAB.Institute ],
	[ WORK_LAYERS_SLUG, VOCAB.WorkLayer ],
	[ DESKTOP_OSS_SLUG, VOCAB.DesktopOS ],
	[ MOBILE_OSS_SLUG, VOCAB.MobileOS ],
	[ USERS_SLUG, VOCAB.User ],
	[ BIRTH_DATE, VOCAB.BirthDate ],
	[ BIRTHDAY, VOCAB.Birthday ],
] );

export const TYPE_CONTAINER:Map<string, string> = new Map(
	Array.from<[ string, string ]>( CONTAINER_TYPE )
		.map( ( entry:[ string, string ] ) => entry.reverse() as [ string, string ] )
);
