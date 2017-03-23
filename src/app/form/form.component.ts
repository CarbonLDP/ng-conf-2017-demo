import { Component, QueryList, ViewChildren } from "@angular/core";
import { Observable } from "rxjs";

import { MdAutocompleteTrigger } from "@angular/material";

import { CarbonDataService } from "../data/carbonData.service";
import { BasicCarbonData, CountryCarbonData } from "app/data/carbonData";

@Component( {
	selector: "app-form",
	providers: [
		CarbonDataService,
	],
	templateUrl: "./form.component.html",
	styleUrls: [ "form.component.scss" ]
} )
export class FormComponent {

	monthNames:string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	yearNames:number[];
	birthDate:Birth;

	countries:Observable<CountryCarbonData[]>;

	cities:Observable<BasicCarbonData[]>;
	filteredCities:Observable<BasicCarbonData[]>;

	institutes:Observable<BasicCarbonData[]>;
	filteredInstitutes:Observable<BasicCarbonData[]>;

	companies:Observable<BasicCarbonData[]>;
	filteredCompanies:Observable<BasicCarbonData[]>;

	workLayers:Observable<BasicCarbonData[]>;
	desktopOSs:Observable<BasicCarbonData[]>;
	mobileOSs:Observable<BasicCarbonData[]>;

	masks:{
		nickname:TextMaskFunction;
	};

	user:NewUser;

	constructor( private dataService:CarbonDataService ) {
		this.birthDate = { year: void 0, month: void 0, day: void 0 };
		this.yearNames = new Array( 90 )
			.fill( void 0 )
			.map( ( elem, index ) => new Date().getFullYear() - index );

		this.filteredCities = this.cities = dataService.getBasicData( "cities/" );
		this.filteredCompanies = this.companies = dataService.getBasicData( "companies/" );
		this.filteredInstitutes = this.institutes = dataService.getBasicData( "institutes/" );

		this.countries = dataService.getCountriesData();

		this.workLayers = dataService.getBasicData( "work-layers/" );
		this.desktopOSs = dataService.getBasicData( "desktop-oss/" );
		this.mobileOSs = dataService.getBasicData( "mobile-oss/" );

		this.masks = {
			nickname: ( val:string ) => {
				let match:string[] = val.match( /[A-Za-z\d\-]/g );
				let length:number = match ? match.length : 0;
				return new Array( length ).fill( /[A-Za-z\d\-]/ );
			},
		};

		this.user = {};
	}

	autoCompleteChange( value:string | BasicCarbonData, autoComplete:"cities" | "companies" | "institutes" ):void {
		if( typeof value === "object" ) return;

		switch( autoComplete ) {
			case "cities":
				this.filteredCities = this.filterCarbonData( value, this.cities );
				break;
			case "companies":
				this.filteredCompanies = this.filterCarbonData( value, this.companies );
				break;
			case "institutes":
				this.filteredInstitutes = this.filterCarbonData( value, this.institutes );
				break;
		}

	}

	filterCarbonData( data:string, observable:Observable<BasicCarbonData[]> ):Observable<BasicCarbonData[]> {
		if( ! data ) return observable;
		return observable.map( elements => elements.filter( element => FormComponent.dataMatches( data, element ) ) );
	}

	static dataMatches( data:string, element:BasicCarbonData ):boolean {
		return new RegExp( data, 'gi' ).test( element.name );
	}

	displayDataName( data:BasicCarbonData ):string {
		if( ! data ) return null;
		return data.name;
	}

	getDaysOf( month:number = new Date().getMonth(), year:number = new Date().getFullYear() ):number[] {
		if( month === void 0 ) return [];

		let maxDay = new Date( year, month + 1, 0 ).getDate();
		return new Array( maxDay );
	}

	isStateDisabled():boolean {
		return ! this.user.birthCountry || ! this.user.birthCountry.states;
	}

	// angular/material2#645
	@ViewChildren( MdAutocompleteTrigger ) autoCompleteTriggers:QueryList<MdAutocompleteTrigger>;

	preventSubmit( $event:Event ):void {
		if( this.autoCompleteTriggers.reduce( ( isOpen:boolean, trigger:MdAutocompleteTrigger ) => isOpen || trigger.panelOpen, false ) )
			$event.preventDefault();
	}

	onSubmit():void {
		if( this.isValidBirthDate() )
			this.user.birthDate = new Date( this.birthDate.year, this.birthDate.month, this.birthDate.day );

		console.log( "TODO: Submit the user %o!", this.user );
	}

	private isValidBirthDate():boolean {
		return this.birthDate.year !== void 0
			&& this.birthDate.month !== void 0
			&& this.birthDate.day !== void 0
			;
	}

}

interface TextMask {
	[ index:number ]:RegExp | string;
}
interface TextMaskFunction {
	( rawValue:string ):TextMask;
}

interface Birth {
	year:number
	month:number;
	day:number;
}

interface NewUser {
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