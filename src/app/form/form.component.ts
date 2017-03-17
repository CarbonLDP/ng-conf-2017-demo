import { Component } from "@angular/core";

import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";

@Component( {
	templateUrl: "./form.component.html",
	styleUrls: [ "form.component.scss" ]
} )
export class FormComponent {

	monthNames:string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	yearNames:number[];
	birthDate:Birth;

	countries:string[] = [
		"Afghanistan",
		"Aland Islands",
		"Albania",
		"Algeria",
		"American Samoa",
		"Andorra",
		"Angola",
		"Anguilla",
		"Antigua",
		"Argentina",
		"Armenia",
		"Aruba",
		"Australia",
		"Austria",
		"Azerbaijan",
		"Bahamas",
		"Bahrain",
		"Bangladesh",
		"Barbados",
		"Belarus",
		"Belgium",
		"Belize",
		"Benin",
		"Bermuda",
		"Bhutan",
		"Bolivia",
		"Bosnia",
		"Botswana",
		"Bouvet Island",
		"Brazil",
		"British Virgin Islands",
		"Brunei",
		"Bulgaria",
		"Burkina Faso",
		"Burma",
		"Burundi",
		"Caicos Islands",
		"Cambodia",
		"Cameroon",
		"Canada",
		"Cape Verde",
		"Cayman Islands",
		"Central African Republic",
		"Chad",
		"Chile",
		"China",
		"Christmas Island",
		"Cocos Islands",
		"Colombia",
		"Comoros",
		"Congo Brazzaville",
		"Congo",
		"Cook Islands",
		"Costa Rica",
		"Cote Divoire",
		"Croatia",
		"Cuba",
		"Cyprus",
		"Czech Republic",
		"Denmark",
		"Djibouti",
		"Dominica",
		"Dominican Republic",
		"Ecuador",
		"Egypt",
		"El Salvador",
		"England",
		"Equatorial Guinea",
		"Eritrea",
		"Estonia",
		"Ethiopia",
		"European Union",
		"Falkland Islands",
		"Faroe Islands",
		"Fiji",
		"Finland",
		"France",
		"French Guiana",
		"French Polynesia",
		"French Territories",
		"Gabon",
		"Gambia",
		"Georgia",
		"Germany",
		"Ghana",
		"Gibraltar",
		"Greece",
		"Greenland",
		"Grenada",
		"Guadeloupe",
		"Guam",
		"Guatemala",
		"Guinea-Bissau",
		"Guinea",
		"Guyana",
		"Haiti",
		"Heard Island",
		"Honduras",
		"Hong Kong",
		"Hungary",
		"Iceland",
		"India",
		"Indian Ocean Territory",
		"Indonesia",
		"Iran",
		"Iraq",
		"Ireland",
		"Israel",
		"Italy",
		"Jamaica",
		"Japan",
		"Jordan",
		"Kazakhstan",
		"Kenya",
		"Kiribati",
		"Kuwait",
		"Kyrgyzstan",
		"Laos",
		"Latvia",
		"Lebanon",
		"Lesotho",
		"Liberia",
		"Libya",
		"Liechtenstein",
		"Lithuania",
		"Luxembourg",
		"Macau",
		"Macedonia",
		"Madagascar",
		"Malawi",
		"Malaysia",
		"Maldives",
		"Mali",
		"Malta",
		"Marshall Islands",
		"Martinique",
		"Mauritania",
		"Mauritius",
		"Mayotte",
		"Mexico",
		"Micronesia",
		"Moldova",
		"Monaco",
		"Mongolia",
		"Montenegro",
		"Montserrat",
		"Morocco",
		"Mozambique",
		"Namibia",
		"Nauru",
		"Nepal",
		"Netherlands Antilles",
		"Netherlands",
		"New Caledonia",
		"New Guinea",
		"New Zealand",
		"Nicaragua",
		"Niger",
		"Nigeria",
		"Niue",
		"Norfolk Island",
		"North Korea",
		"Northern Mariana Islands",
		"Norway",
		"Oman",
		"Pakistan",
		"Palau",
		"Palestine",
		"Panama",
		"Paraguay",
		"Peru",
		"Philippines",
		"Pitcairn Islands",
		"Poland",
		"Portugal",
		"Puerto Rico",
		"Qatar",
		"Reunion",
		"Romania",
		"Russia",
		"Rwanda",
		"Saint Helena",
		"Saint Kitts and Nevis",
		"Saint Lucia",
		"Saint Pierre",
		"Saint Vincent",
		"Samoa",
		"San Marino",
		"Sandwich Islands",
		"Sao Tome",
		"Saudi Arabia",
		"Senegal",
		"Serbia",
		"Serbia",
		"Seychelles",
		"Sierra Leone",
		"Singapore",
		"Slovakia",
		"Slovenia",
		"Solomon Islands",
		"Somalia",
		"South Africa",
		"South Korea",
		"Spain",
		"Sri Lanka",
		"Sudan",
		"Suriname",
		"Svalbard",
		"Swaziland",
		"Sweden",
		"Switzerland",
		"Syria",
		"Taiwan",
		"Tajikistan",
		"Tanzania",
		"Thailand",
		"Timorleste",
		"Togo",
		"Tokelau",
		"Tonga",
		"Trinidad",
		"Tunisia",
		"Turkey",
		"Turkmenistan",
		"Tuvalu",
		"Uganda",
		"Ukraine",
		"United Arab Emirates",
		"United States",
		"Uruguay",
		"Us Minor Islands",
		"Us Virgin Islands",
		"Uzbekistan",
		"Vanuatu",
		"Vatican City",
		"Venezuela",
		"Vietnam",
		"Wallis and Futuna",
		"Western Sahara",
		"Yemen",
		"Zambia",
		"Zimbabwe",
	];
	states:string[] = [
		"Alabama",
		"Alaska",
		"Arizona",
		"Arkansas",
		"California",
		"Colorado",
		"Connecticut",
		"Delaware",
		"District Of Columbia",
		"Florida",
		"Georgia",
		"Hawaii",
		"Idaho",
		"Illinois",
		"Indiana",
		"Iowa",
		"Kansas",
		"Kentucky",
		"Louisiana",
		"Maine",
		"Maryland",
		"Massachusetts",
		"Michigan",
		"Minnesota",
		"Mississippi",
		"Missouri",
		"Montana",
		"Nebraska",
		"Nevada",
		"New Hampshire",
		"New Jersey",
		"New Mexico",
		"New York",
		"North Carolina",
		"North Dakota",
		"Ohio",
		"Oklahoma",
		"Oregon",
		"Pennsylvania",
		"Rhode Island",
		"South Carolina",
		"South Dakota",
		"Tennessee",
		"Texas",
		"Utah",
		"Vermont",
		"Virginia",
		"Washington",
		"West Virginia",
		"Wisconsin",
		"Wyoming",
	];

	companyCtrl:FormControl;
	companies:string[] = [ "Base22", "Google", "W3C" ];
	filteredCompanies:Observable<string[]>;

	workLayers:string[] = [ "FrontEnd", "BackEnd", "Full-Stack" ];
	desktopOSs:string[] = [ "Linux", "MacOS", "Windows" ];
	mobileOSs:string[] = [ "Android", "iOS", "Windows Phone" ];

	institutionCtrl:FormControl;
	institutions:string[] = [ "ITESM", "University of Florida", "Berkely" ];
	filteredInstitutions:Observable<string[]>;

	user:NewUser = {
		company: null,
		institution: null,
	};

	constructor() {
		let today:Date = new Date();
		this.birthDate = {
			year: today.getFullYear(),
			month: today.getMonth(),
			day: today.getDate(),
		};
		this.yearNames = new Array( 90 )
			.fill( void 0 )
			.map( ( elem, index ) => this.birthDate.year - 89 + index );

		this.companyCtrl = new FormControl();
		this.filteredCompanies = this.companyCtrl.valueChanges
			.startWith( null )
			.map( name => this.filterCompanies( name ) );

		this.institutionCtrl = new FormControl();
		this.filteredInstitutions = this.institutionCtrl.valueChanges
			.startWith( null )
			.map( name => this.filterInstitutions( name ) );
	}

	filterCompanies( val:string ) {
		return val ? this.companies.filter( s => new RegExp( val, 'gi' ).test( s ) ) : this.companies;
	}

	filterInstitutions( val:string ) {
		return val ? this.institutions.filter( s => new RegExp( val, 'gi' ).test( s ) ) : this.institutions;
	}

	getDaysOf( month:number ):number[] {
		let maxDay = new Date( this.birthDate.year, month + 1, 0 ).getDate();
		return new Array( maxDay );
	}

	isStateDisabled():boolean {
		return false;
		// return this.user.birthCountry !== "United States";
	}

}

interface Birth {
	year:number
	month:number;
	day:number;
}

interface NewUser {
	nickname?:string;
	birthDate?:Date;
	birthCountry?:string;
	birthState?:string;
	birthCity?:string;
	company?:string;
	worksOn?:string;
	desktopOSPreference?:string;
	mobileOSPreference?:string;
	institution?:string;
	email?:string;
}