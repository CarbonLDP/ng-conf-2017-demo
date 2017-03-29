import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Observable } from "rxjs";

import { MdAutocompleteTrigger, MdDialog } from "@angular/material";

import { CarbonDataService } from "app/data/carbonData.service";
import { SyncService } from "app/data/sync.service";

import { BasicCarbonData, CountryCarbonData, RawBasicData } from "app/data/carbonData";
import { UserTemplate, Factory as UserFactory } from "app/user/userData";
import { SuccessDialog } from "app/form/dialogs/successDialog.component";

import 'rxjs/operator/finally';
import { PromiseObservable } from "rxjs/observable/PromiseObservable";
import { FailDialog } from "app/form/dialogs/failDialog.component";

@Component( {
	selector: "app-form",
	templateUrl: "./form.component.html",
	styleUrls: [ "form.component.scss" ],
} )
export class FormComponent implements OnInit, OnDestroy {

	monthNames:string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	yearNames:number[];
	birthDate:Birth;

	countries:Observable<CountryCarbonData[]>;

	cities:PromiseObservable<BasicCarbonData[]>;
	filteredCities:Observable<BasicCarbonData[]>;

	institutes:PromiseObservable<BasicCarbonData[]>;
	filteredInstitutes:Observable<BasicCarbonData[]>;

	companies:PromiseObservable<BasicCarbonData[]>;
	filteredCompanies:Observable<BasicCarbonData[]>;

	workLayers:Observable<BasicCarbonData[]>;
	desktopOSs:Observable<BasicCarbonData[]>;
	mobileOSs:Observable<BasicCarbonData[]>;

	masks:{
		nickname:TextMaskFunction;
	};

	newUser:UserTemplate;

	private _dynamicProperties:DynamicProperty[];

	constructor( private dataService:CarbonDataService, private syncService:SyncService, private dialog:MdDialog ) {}

	ngOnInit():void {
		this.birthDate = {};
		this.initForm( true );

		this.yearNames = new Array( 90 )
			.fill( void 0 )
			.map( ( elem, index ) => new Date().getFullYear() - index );

		this.masks = {
			nickname: ( val:string ) => {
				let match:string[] = val.match( /[A-Za-z\d\-]/g );
				let length:number = match ? match.length : 0;
				return new Array( length ).fill( /[A-Za-z\d\-]/ );
			},
		};

		this.filteredCities = this.cities = this.dataService.getBasicData( CarbonDataService.CITIES_SLUG );
		this.filteredCompanies = this.companies = this.dataService.getBasicData( CarbonDataService.COMPANIES_SLUG );
		this.filteredInstitutes = this.institutes = this.dataService.getBasicData( CarbonDataService.INSTITUTES_SLUG );

		this._dynamicProperties = [
			{ property: "birthCity", containerSlug: CarbonDataService.CITIES_SLUG, observable: this.cities },
			{ property: "company", containerSlug: CarbonDataService.COMPANIES_SLUG, observable: this.companies },
			{ property: "institute", containerSlug: CarbonDataService.INSTITUTES_SLUG, observable: this.institutes },
		];

		this.countries = this.dataService.getCountriesData();

		this.workLayers = this.dataService.getBasicData( CarbonDataService.WORK_LAYERS_SLUG );
		this.desktopOSs = this.dataService.getBasicData( CarbonDataService.DESKTOP_OSS_SLUG );
		this.mobileOSs = this.dataService.getBasicData( CarbonDataService.MOBILE_OSS_SLUG );

		this.syncService.openNotificationSender();
	}

	ngOnDestroy():void {
		console.log( "Form closed" );
		this.syncService.closeNotificationSender();
	}

	autoCompleteChange( value:string | BasicCarbonData, autoComplete:"birthCity" | "company" | "institute", element?:HTMLInputElement ):void {
		if( typeof value === "object" && value !== null ) return;

		if( value && element ) {
			value = (value as string).replace( /[^a-zA-Z0-9\- ]/g, "" );
			if( value !== this.newUser[ autoComplete ] ) {
				this.newUser[ autoComplete ] = value;
				element.value = value;
			}
		}

		switch( autoComplete ) {
			case "birthCity":
				this.filteredCities = this.filterCarbonData( value as string, this.cities );
				break;
			case "company":
				this.filteredCompanies = this.filterCarbonData( value as string, this.companies );
				break;
			case "institute":
				this.filteredInstitutes = this.filterCarbonData( value as string, this.institutes );
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
		let maxDay = new Date( year, month + 1, 0 ).getDate();
		return new Array( maxDay );
	}

	isStateDisabled():boolean {
		return ! this.newUser.birthCountry || ! this.newUser.birthCountry.states;
	}

	// angular/material2#645
	@ViewChildren( MdAutocompleteTrigger ) autoCompleteTriggers:QueryList<MdAutocompleteTrigger>;

	preventSubmit( $event:Event ):void {
		if( this._isAnyAutoCompleteOpen() )
			$event.preventDefault();
	}

	private _isAnyAutoCompleteOpen():boolean {
		return this.autoCompleteTriggers.reduce( ( isOpen:boolean, trigger:MdAutocompleteTrigger ) => isOpen || trigger.panelOpen && ! ! trigger.activeOption, false )
	}

	private closeAutoCompletePanels( $event:KeyboardEvent ) {
		this.autoCompleteTriggers.forEach( trigger => trigger.closePanel() );
	}

	@ViewChild( "appForm" ) appForm:NgForm;
	@ViewChild( "nicknameInput" ) nicknameInput:ElementRef;

	initForm( alreadyClear?:boolean ):void {
		this.newUser = UserFactory.createTemplate();
		if( ! alreadyClear ) this.appForm.resetForm();
		setTimeout( () => {
			this.nicknameInput.nativeElement.focus();
		} );
	}

	onSubmit():void {
		if( this._isValidBirthDate() )
			this.newUser.birthDate = new Date( this.birthDate.year, this.birthDate.month, this.birthDate.day, 0, 0, 0, 0 );

		this._cleanNewUser();

		let savingDynamicData:Observable<void>[] = this._dynamicProperties
			.filter( dynamic => typeof this.newUser[ dynamic.property ] === "string" )
			.map( dynamic => {
				let data:RawBasicData = {
					types:[ CarbonDataService.CONTAINER_TYPES.get( dynamic.containerSlug ) ],
					name: this.newUser[ dynamic.property as string ],
				};
				let carbonData:BasicCarbonData = this.dataService.convertBasicData( dynamic.containerSlug, data );
				this.newUser[ dynamic.property ] = carbonData;

				// TODO: remove when web sockets
				dynamic.observable.value.push( carbonData );
				dynamic.observable.value.sort( ( data1:BasicCarbonData, data2:BasicCarbonData ) => data1.name.localeCompare( data2.name ) );
				this.autoCompleteChange( carbonData.name, dynamic.property );

				return this.dataService.saveBasicData( dynamic.containerSlug, carbonData );
			} );

		Observable.forkJoin( ...savingDynamicData, Promise.resolve() ).flatMap( () => {
			return this.dataService.createUser( this.newUser );
		} ).subscribe( () => {
				this.dialog.open( SuccessDialog )
					.afterClosed()
					.subscribe( () => this.initForm() );
			}, ( error:Error ) => {
				this.dialog.open( FailDialog, { data: { error: error.message } } );
			}
		);
	}

	private _isValidBirthDate():boolean {
		return ! ! this.birthDate.year
			&& ( this.birthDate.month || this.birthDate.month === 0 )
			&& ! ! this.birthDate.day
			;
	}

	private _cleanNewUser():void {
		let keys:string[] = Object.keys( this.newUser );

		for( let key of keys ) {
			if( typeof this.newUser[ key ] === "string" )
				this.newUser[ key ] = this.newUser[ key ].trim();

			if( ! this.newUser[ key ] )
				delete this.newUser[ key ]
		}
	}

}

interface DynamicProperty {
	property:"birthCity" | "company" | "institute";
	containerSlug:string;
	observable:PromiseObservable<BasicCarbonData[]>;
}

interface TextMask {
	[ index:number ]:RegExp | string;
}
interface TextMaskFunction {
	( rawValue:string ):TextMask;
}

interface Birth {
	year?:number
	month?:number;
	day?:number;
}
