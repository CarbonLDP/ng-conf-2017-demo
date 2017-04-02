import * as VOCAB from "app/ns/vocab";
import * as ContainersData  from "app/data/containersData";

export interface DefaultElementData {
	elementSlug?:string;
	data?:{
		name:string;
	};
}

export interface DefaultContainerData extends DefaultElementData {
	childTemplate?:Object;
	children:DefaultElementData[];
}

export interface DefaultNamedContainer extends DefaultContainerData {
	elementSlug:string;
}

export let defaultUsers:DefaultNamedContainer = {
	elementSlug: ContainersData.USERS_SLUG,
	childTemplate: {
		types: [ VOCAB.User ],
	},
	children: [
		{
			data: {
				name: "Admin",
				nickname: "admin",
			}
		} as DefaultElementData
	],
};

export let defaultUSStates:DefaultElementData[] = [
	{
		data: {
			name: "Alabama",
		},
	},
	{
		data: {
			name: "Alaska",
		},
	},
	{
		data: {
			name: "Arizona",
		},
	},
	{
		data: {
			name: "Arkansas",
		},
	},
	{
		data: {
			name: "California",
		},
	},
	{
		data: {
			name: "Colorado",
		},
	},
	{
		data: {
			name: "Connecticut",
		},
	},
	{
		data: {
			name: "Delaware",
		},
	},
	{
		data: {
			name: "District Of Columbia",
		},
	},
	{
		data: {
			name: "Florida",
		},
	},
	{
		data: {
			name: "Georgia",
		},
	},
	{
		data: {
			name: "Hawaii",
		},
	},
	{
		data: {
			name: "Idaho",
		},
	},
	{
		data: {
			name: "Illinois",
		},
	},
	{
		data: {
			name: "Indiana",
		},
	},
	{
		data: {
			name: "Iowa",
		},
	},
	{
		data: {
			name: "Kansas",
		},
	},
	{
		data: {
			name: "Kentucky",
		},
	},
	{
		data: {
			name: "Louisiana",
		},
	},
	{
		data: {
			name: "Maine",
		},
	},
	{
		data: {
			name: "Maryland",
		},
	},
	{
		data: {
			name: "Massachusetts",
		},
	},
	{
		data: {
			name: "Michigan",
		},
	},
	{
		data: {
			name: "Minnesota",
		},
	},
	{
		data: {
			name: "Mississippi",
		},
	},
	{
		data: {
			name: "Missouri",
		},
	},
	{
		data: {
			name: "Montana",
		},
	},
	{
		data: {
			name: "Nebraska",
		},
	},
	{
		data: {
			name: "Nevada",
		},
	},
	{
		data: {
			name: "New Hampshire",
		},
	},
	{
		data: {
			name: "New Jersey",
		},
	},
	{
		data: {
			name: "New Mexico",
		},
	},
	{
		data: {
			name: "New York",
		},
	},
	{
		data: {
			name: "North Carolina",
		},
	},
	{
		data: {
			name: "North Dakota",
		},
	},
	{
		data: {
			name: "Ohio",
		},
	},
	{
		data: {
			name: "Oklahoma",
		},
	},
	{
		data: {
			name: "Oregon",
		},
	},
	{
		data: {
			name: "Pennsylvania",
		},
	},
	{
		data: {
			name: "Rhode Island",
		},
	},
	{
		data: {
			name: "South Carolina",
		},
	},
	{
		data: {
			name: "South Dakota",
		},
	},
	{
		data: {
			name: "Tennessee",
		},
	},
	{
		data: {
			name: "Texas",
		},
	},
	{
		data: {
			name: "Utah",
		},
	},
	{
		data: {
			name: "Vermont",
		},
	},
	{
		data: {
			name: "Virginia",
		},
	},
	{
		data: {
			name: "Washington",
		},
	},
	{
		data: {
			name: "West Virginia",
		},
	},
	{
		data: {
			name: "Wisconsin",
		},
	},
	{
		data: {
			name: "Wyoming",
		},
	},
];

export let defaultCountries:DefaultNamedContainer = {
	elementSlug: ContainersData.COUNTRIES_SLUG,
	childTemplate: {
		types: [ VOCAB.Country ],
		hasMemberRelation: "state"
	},
	children: [
		{
			data: {
				name: "Afghanistan",
			},
		},
		{
			data: {
				name: "Aland Islands",
			},
		},
		{
			data: {
				name: "Albania",
			},
		},
		{
			data: {
				name: "Algeria",
			},
		},
		{
			data: {
				name: "American Samoa",
			},
		},
		{
			data: {
				name: "Andorra",
			},
		},
		{
			data: {
				name: "Angola",
			},
		},
		{
			data: {
				name: "Anguilla",
			},
		},
		{
			data: {
				name: "Antigua",
			},
		},
		{
			data: {
				name: "Argentina",
			},
		},
		{
			data: {
				name: "Armenia",
			},
		},
		{
			data: {
				name: "Aruba",
			},
		},
		{
			data: {
				name: "Australia",
			},
		},
		{
			data: {
				name: "Austria",
			},
		},
		{
			data: {
				name: "Azerbaijan",
			},
		},
		{
			data: {
				name: "Bahamas",
			},
		},
		{
			data: {
				name: "Bahrain",
			},
		},
		{
			data: {
				name: "Bangladesh",
			},
		},
		{
			data: {
				name: "Barbados",
			},
		},
		{
			data: {
				name: "Belarus",
			},
		},
		{
			data: {
				name: "Belgium",
			},
		},
		{
			data: {
				name: "Belize",
			},
		},
		{
			data: {
				name: "Benin",
			},
		},
		{
			data: {
				name: "Bermuda",
			},
		},
		{
			data: {
				name: "Bhutan",
			},
		},
		{
			data: {
				name: "Bolivia",
			},
		},
		{
			data: {
				name: "Bosnia",
			},
		},
		{
			data: {
				name: "Botswana",
			},
		},
		{
			data: {
				name: "Bouvet Island",
			},
		},
		{
			data: {
				name: "Brazil",
			},
		},
		{
			data: {
				name: "British Virgin Islands",
			},
		},
		{
			data: {
				name: "Brunei",
			},
		},
		{
			data: {
				name: "Bulgaria",
			},
		},
		{
			data: {
				name: "Burkina Faso",
			},
		},
		{
			data: {
				name: "Burma",
			},
		},
		{
			data: {
				name: "Burundi",
			},
		},
		{
			data: {
				name: "Caicos Islands",
			},
		},
		{
			data: {
				name: "Cambodia",
			},
		},
		{
			data: {
				name: "Cameroon",
			},
		},
		{
			data: {
				name: "Canada",
			},
		},
		{
			data: {
				name: "Cape Verde",
			},
		},
		{
			data: {
				name: "Cayman Islands",
			},
		},
		{
			data: {
				name: "Central African Republic",
			},
		},
		{
			data: {
				name: "Chad",
			},
		},
		{
			data: {
				name: "Chile",
			},
		},
		{
			data: {
				name: "China",
			},
		},
		{
			data: {
				name: "Christmas Island",
			},
		},
		{
			data: {
				name: "Cocos Islands",
			},
		},
		{
			data: {
				name: "Colombia",
			},
		},
		{
			data: {
				name: "Comoros",
			},
		},
		{
			data: {
				name: "Congo Brazzaville",
			},
		},
		{
			data: {
				name: "Congo",
			},
		},
		{
			data: {
				name: "Cook Islands",
			},
		},
		{
			data: {
				name: "Costa Rica",
			},
		},
		{
			data: {
				name: "Cote Divoire",
			},
		},
		{
			data: {
				name: "Croatia",
			},
		},
		{
			data: {
				name: "Cuba",
			},
		},
		{
			data: {
				name: "Cyprus",
			},
		},
		{
			data: {
				name: "Czech Republic",
			},
		},
		{
			data: {
				name: "Denmark",
			},
		},
		{
			data: {
				name: "Djibouti",
			},
		},
		{
			data: {
				name: "Dominica",
			},
		},
		{
			data: {
				name: "Dominican Republic",
			},
		},
		{
			data: {
				name: "Ecuador",
			},
		},
		{
			data: {
				name: "Egypt",
			},
		},
		{
			data: {
				name: "El Salvador",
			},
		},
		{
			data: {
				name: "England",
			},
		},
		{
			data: {
				name: "Equatorial Guinea",
			},
		},
		{
			data: {
				name: "Eritrea",
			},
		},
		{
			data: {
				name: "Estonia",
			},
		},
		{
			data: {
				name: "Ethiopia",
			},
		},
		{
			data: {
				name: "European Union",
			},
		},
		{
			data: {
				name: "Falkland Islands",
			},
		},
		{
			data: {
				name: "Faroe Islands",
			},
		},
		{
			data: {
				name: "Fiji",
			},
		},
		{
			data: {
				name: "Finland",
			},
		},
		{
			data: {
				name: "France",
			},
		},
		{
			data: {
				name: "French Guiana",
			},
		},
		{
			data: {
				name: "French Polynesia",
			},
		},
		{
			data: {
				name: "French Territories",
			},
		},
		{
			data: {
				name: "Gabon",
			},
		},
		{
			data: {
				name: "Gambia",
			},
		},
		{
			data: {
				name: "Georgia",
			},
		},
		{
			data: {
				name: "Germany",
			},
		},
		{
			data: {
				name: "Ghana",
			},
		},
		{
			data: {
				name: "Gibraltar",
			},
		},
		{
			data: {
				name: "Greece",
			},
		},
		{
			data: {
				name: "Greenland",
			},
		},
		{
			data: {
				name: "Grenada",
			},
		},
		{
			data: {
				name: "Guadeloupe",
			},
		},
		{
			data: {
				name: "Guam",
			},
		},
		{
			data: {
				name: "Guatemala",
			},
		},
		{
			data: {
				name: "Guinea-Bissau",
			},
		},
		{
			data: {
				name: "Guinea",
			},
		},
		{
			data: {
				name: "Guyana",
			},
		},
		{
			data: {
				name: "Haiti",
			},
		},
		{
			data: {
				name: "Heard Island",
			},
		},
		{
			data: {
				name: "Honduras",
			},
		},
		{
			data: {
				name: "Hong Kong",
			},
		},
		{
			data: {
				name: "Hungary",
			},
		},
		{
			data: {
				name: "Iceland",
			},
		},
		{
			data: {
				name: "India",
			},
		},
		{
			data: {
				name: "Indian Ocean Territory",
			},
		},
		{
			data: {
				name: "Indonesia",
			},
		},
		{
			data: {
				name: "Iran",
			},
		},
		{
			data: {
				name: "Iraq",
			},
		},
		{
			data: {
				name: "Ireland",
			},
		},
		{
			data: {
				name: "Israel",
			},
		},
		{
			data: {
				name: "Italy",
			},
		},
		{
			data: {
				name: "Jamaica",
			},
		},
		{
			data: {
				name: "Japan",
			},
		},
		{
			data: {
				name: "Jordan",
			},
		},
		{
			data: {
				name: "Kazakhstan",
			},
		},
		{
			data: {
				name: "Kenya",
			},
		},
		{
			data: {
				name: "Kiribati",
			},
		},
		{
			data: {
				name: "Kuwait",
			},
		},
		{
			data: {
				name: "Kyrgyzstan",
			},
		},
		{
			data: {
				name: "Laos",
			},
		},
		{
			data: {
				name: "Latvia",
			},
		},
		{
			data: {
				name: "Lebanon",
			},
		},
		{
			data: {
				name: "Lesotho",
			},
		},
		{
			data: {
				name: "Liberia",
			},
		},
		{
			data: {
				name: "Libya",
			},
		},
		{
			data: {
				name: "Liechtenstein",
			},
		},
		{
			data: {
				name: "Lithuania",
			},
		},
		{
			data: {
				name: "Luxembourg",
			},
		},
		{
			data: {
				name: "Macau",
			},
		},
		{
			data: {
				name: "Macedonia",
			},
		},
		{
			data: {
				name: "Madagascar",
			},
		},
		{
			data: {
				name: "Malawi",
			},
		},
		{
			data: {
				name: "Malaysia",
			},
		},
		{
			data: {
				name: "Maldives",
			},
		},
		{
			data: {
				name: "Mali",
			},
		},
		{
			data: {
				name: "Malta",
			},
		},
		{
			data: {
				name: "Marshall Islands",
			},
		},
		{
			data: {
				name: "Martinique",
			},
		},
		{
			data: {
				name: "Mauritania",
			},
		},
		{
			data: {
				name: "Mauritius",
			},
		},
		{
			data: {
				name: "Mayotte",
			},
		},
		{
			data: {
				name: "Mexico",
			},
		},
		{
			data: {
				name: "Micronesia",
			},
		},
		{
			data: {
				name: "Moldova",
			},
		},
		{
			data: {
				name: "Monaco",
			},
		},
		{
			data: {
				name: "Mongolia",
			},
		},
		{
			data: {
				name: "Montenegro",
			},
		},
		{
			data: {
				name: "Montserrat",
			},
		},
		{
			data: {
				name: "Morocco",
			},
		},
		{
			data: {
				name: "Mozambique",
			},
		},
		{
			data: {
				name: "Namibia",
			},
		},
		{
			data: {
				name: "Nauru",
			},
		},
		{
			data: {
				name: "Nepal",
			},
		},
		{
			data: {
				name: "Netherlands Antilles",
			},
		},
		{
			data: {
				name: "Netherlands",
			},
		},
		{
			data: {
				name: "New Caledonia",
			},
		},
		{
			data: {
				name: "New Guinea",
			},
		},
		{
			data: {
				name: "New Zealand",
			},
		},
		{
			data: {
				name: "Nicaragua",
			},
		},
		{
			data: {
				name: "Niger",
			},
		},
		{
			data: {
				name: "Nigeria",
			},
		},
		{
			data: {
				name: "Niue",
			},
		},
		{
			data: {
				name: "Norfolk Island",
			},
		},
		{
			data: {
				name: "North Korea",
			},
		},
		{
			data: {
				name: "Northern Mariana Islands",
			},
		},
		{
			data: {
				name: "Norway",
			},
		},
		{
			data: {
				name: "Oman",
			},
		},
		{
			data: {
				name: "Pakistan",
			},
		},
		{
			data: {
				name: "Palau",
			},
		},
		{
			data: {
				name: "Palestine",
			},
		},
		{
			data: {
				name: "Panama",
			},
		},
		{
			data: {
				name: "Paraguay",
			},
		},
		{
			data: {
				name: "Peru",
			},
		},
		{
			data: {
				name: "Philippines",
			},
		},
		{
			data: {
				name: "Pitcairn Islands",
			},
		},
		{
			data: {
				name: "Poland",
			},
		},
		{
			data: {
				name: "Portugal",
			},
		},
		{
			data: {
				name: "Puerto Rico",
			},
		},
		{
			data: {
				name: "Qatar",
			},
		},
		{
			data: {
				name: "Reunion",
			},
		},
		{
			data: {
				name: "Romania",
			},
		},
		{
			data: {
				name: "Russia",
			},
		},
		{
			data: {
				name: "Rwanda",
			},
		},
		{
			data: {
				name: "Saint Helena",
			},
		},
		{
			data: {
				name: "Saint Kitts and Nevis",
			},
		},
		{
			data: {
				name: "Saint Lucia",
			},
		},
		{
			data: {
				name: "Saint Pierre",
			},
		},
		{
			data: {
				name: "Saint Vincent",
			},
		},
		{
			data: {
				name: "Samoa",
			},
		},
		{
			data: {
				name: "San Marino",
			},
		},
		{
			data: {
				name: "Sandwich Islands",
			},
		},
		{
			data: {
				name: "Sao Tome",
			},
		},
		{
			data: {
				name: "Saudi Arabia",
			},
		},
		{
			data: {
				name: "Senegal",
			},
		},
		{
			data: {
				name: "Serbia",
			},
		},
		{
			data: {
				name: "Seychelles",
			},
		},
		{
			data: {
				name: "Sierra Leone",
			},
		},
		{
			data: {
				name: "Singapore",
			},
		},
		{
			data: {
				name: "Slovakia",
			},
		},
		{
			data: {
				name: "Slovenia",
			},
		},
		{
			data: {
				name: "Solomon Islands",
			},
		},
		{
			data: {
				name: "Somalia",
			},
		},
		{
			data: {
				name: "South Africa",
			},
		},
		{
			data: {
				name: "South Korea",
			},
		},
		{
			data: {
				name: "Spain",
			},
		},
		{
			data: {
				name: "Sri Lanka",
			},
		},
		{
			data: {
				name: "Sudan",
			},
		},
		{
			data: {
				name: "Suriname",
			},
		},
		{
			data: {
				name: "Svalbard",
			},
		},
		{
			data: {
				name: "Swaziland",
			},
		},
		{
			data: {
				name: "Sweden",
			},
		},
		{
			data: {
				name: "Switzerland",
			},
		},
		{
			data: {
				name: "Syria",
			},
		},
		{
			data: {
				name: "Taiwan",
			},
		},
		{
			data: {
				name: "Tajikistan",
			},
		},
		{
			data: {
				name: "Tanzania",
			},
		},
		{
			data: {
				name: "Thailand",
			},
		},
		{
			data: {
				name: "Timorleste",
			},
		},
		{
			data: {
				name: "Togo",
			},
		},
		{
			data: {
				name: "Tokelau",
			},
		},
		{
			data: {
				name: "Tonga",
			},
		},
		{
			data: {
				name: "Trinidad",
			},
		},
		{
			data: {
				name: "Tunisia",
			},
		},
		{
			data: {
				name: "Turkey",
			},
		},
		{
			data: {
				name: "Turkmenistan",
			},
		},
		{
			data: {
				name: "Tuvalu",
			},
		},
		{
			data: {
				name: "Uganda",
			},
		},
		{
			data: {
				name: "Ukraine",
			},
		},
		{
			data: {
				name: "United Arab Emirates",
			},
		},
		{
			data: {
				name: "United States",
			},
			children: defaultUSStates,
			childrenTemplate: {
				types: "State"
			}
		} as DefaultElementData,
		{
			data: {
				name: "Uruguay",
			},
		},
		{
			data: {
				name: "Us Minor Islands",
			},
		},
		{
			data: {
				name: "Us Virgin Islands",
			},
		},
		{
			data: {
				name: "Uzbekistan",
			},
		},
		{
			data: {
				name: "Vanuatu",
			},
		},
		{
			data: {
				name: "Vatican City",
			},
		},
		{
			data: {
				name: "Venezuela",
			},
		},
		{
			data: {
				name: "Vietnam",
			},
		},
		{
			data: {
				name: "Wallis and Futuna",
			},
		},
		{
			data: {
				name: "Western Sahara",
			},
		},
		{
			data: {
				name: "Yemen",
			},
		},
		{
			data: {
				name: "Zambia",
			},
		},
		{
			data: {
				name: "Zimbabwe",
			},
		},
	],
};

export let defaultCities:DefaultNamedContainer = {
	elementSlug: ContainersData.CITIES_SLUG,
	childTemplate: {
		types: [ VOCAB.City ],
	},
	children: [
		{
			data: {
				name: "Monterrey",
			},
		},
	],
};

export let defaultCompanies:DefaultNamedContainer = {
	elementSlug: ContainersData.COMPANIES_SLUG,
	childTemplate: {
		types: [ VOCAB.Company ],
	},
	children: [
		{
			data: {
				name: "Base22",
			},
		},
		{
			data: {
				name: "Google",
			},
		},
		{
			data: {
				name: "W3C",
			},
		},
	],
};

export let defaultWorkLayers:DefaultNamedContainer = {
	elementSlug: ContainersData.WORK_LAYERS_SLUG,
	childTemplate: {
		types: [ VOCAB.WorkLayer ],
	},
	children: [
		{
			data: {
				name: "FrontEnd",
			},
		},
		{
			data: {
				name: "BackEnd",
			},
		},
		{
			data: {
				name: "Full-Stack",
			},
		},
	],
};

export let defaultDesktopOSs:DefaultNamedContainer = {
	elementSlug: ContainersData.DESKTOP_OSS_SLUG,
	childTemplate: {
		types: [ VOCAB.DesktopOS ],
	},
	children: [
		{
			data: {
				name: "Linux",
			},
		},
		{
			data: {
				name: "MacOS",
			},
		},
		{
			data: {
				name: "Windows",
			},
		},
	],
};

export let defaultMobileOSs:DefaultNamedContainer = {
	elementSlug: ContainersData.MOBILE_OSS_SLUG,
	childTemplate: {
		types: [ VOCAB.MobileOS ],
	},
	children: [
		{
			data: {
				name: "Android"
			},
		},
		{
			data: {
				name: "Windows Phone"
			},
		},
		{
			data: {
				name: "iOS"
			},
		},
	],
};

export let defaultInstitutes:DefaultNamedContainer = {
	elementSlug: ContainersData.INSTITUTES_SLUG,
	childTemplate: {
		types: [ VOCAB.Institute ],
	},
	children: [
		{
			data: {
				name: "ITESM",
			},
		},
		{
			data: {
				name: "University of Florida",
			},
		},
		{
			data: {
				name: "Berkely",
			},
		},
	],
};

export const DEFAULT_CONTAINERS:DefaultNamedContainer[] = [
	defaultUsers,
	defaultCountries,
	defaultCities,
	defaultCompanies,
	defaultWorkLayers,
	defaultDesktopOSs,
	defaultMobileOSs,
	defaultInstitutes,
];
