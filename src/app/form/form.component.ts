import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { NgForm } from "@angular/forms";

import { MdAutocompleteTrigger, MdDialog, MdSelect } from "@angular/material";

import { CarbonDataService } from "app/data/carbonData.service";
import { SyncService } from "app/data/sync.service";
import * as ContainersData from "app/data/containersData";

import { BasicCarbonData, CountryCarbonData, RawBasicData, Utils as CarbonDataUtils } from "app/data/carbonData";
import { UserTemplate, Factory as UserFactory } from "app/data/userData";
import { SuccessDialog } from "app/form/dialogs/successDialog.component";
import { FailDialog } from "app/form/dialogs/failDialog.component";

import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";

import { Class as ProtectedDocument } from "carbonldp/ProtectedDocument";

@Component( {
	selector: "app-form",
	templateUrl: "./form.component.html",
	styleUrls: [ "form.component.scss" ],
} )
export class FormComponent implements OnInit, AfterViewInit, OnDestroy {

	monthNames:string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	yearNames:number[];
	birthDate:Birth;

	countries:PromiseObservable<CountryCarbonData[]>;

	cities:PromiseObservable<BasicCarbonData[]>;
	filteredCities:Observable<BasicCarbonData[]>;

	institutes:PromiseObservable<BasicCarbonData[]>;
	filteredInstitutes:Observable<BasicCarbonData[]>;

	companies:PromiseObservable<BasicCarbonData[]>;
	filteredCompanies:Observable<BasicCarbonData[]>;

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

				if( ! match ) return [];
				return new Array( match.length ).fill( /[A-Za-z\d\-]/ );
			},
		};

		this.filteredCities = this.cities = this.dataService.getBasicData( ContainersData.CITIES_SLUG );
		this.filteredCompanies = this.companies = this.dataService.getBasicData( ContainersData.COMPANIES_SLUG );
		this.filteredInstitutes = this.institutes = this.dataService.getBasicData( ContainersData.INSTITUTES_SLUG );

		this._dynamicProperties = [
			{ property: "birthCity", containerSlug: ContainersData.CITIES_SLUG, observable: this.cities },
			{ property: "company", containerSlug: ContainersData.COMPANIES_SLUG, observable: this.companies },
			{ property: "institute", containerSlug: ContainersData.INSTITUTES_SLUG, observable: this.institutes },
			{ property: "birthDate", containerSlug: ContainersData.BIRTH_DATE },
			{ property: "birthday", containerSlug: ContainersData.BIRTHDAY },
		];

		this.countries = this.dataService.getCountriesData();

		this.syncService.openNotificationSender();
	}


	private newDocumentsSubscription:Subscription;

	ngAfterViewInit():void {
		this.newDocumentsSubscription = this.syncService.onDocumentCreated()
			.switchMap( document => this.dataService.resolveDocument( document ) )
			.subscribe( ( document:ProtectedDocument & BasicCarbonData ) => {
				const type:string = CarbonDataUtils.getMainType( document );
				if( ! type ) {
					this.dataService.dropData( document );
					return;
				}

				const dynamic:DynamicProperty = this._dynamicProperties
					.find( dynamic => dynamic.containerSlug === ContainersData.TYPE_CONTAINER.get( type ) );

				if( ! dynamic ) {
					this.dataService.dropData( document );
					return;
				}
				this._addDynamicData( dynamic, document );
			} );
	}

	ngOnDestroy():void {
		this.syncService.closeNotificationSender();
		this.newDocumentsSubscription.unsubscribe();
	}

	// Workaround to more native select behaviour
	private _pressedInputKeys:number[] = [];
	private _pressedTimer:any;

	selectOptionFromKey( $event:KeyboardEvent, mdSelect:MdSelect, isMainSelect?:boolean ):void {
		if( isMainSelect && ( $event.keyCode === 40 || $event.keyCode === 38 ) ) {
			mdSelect.open();
			$event.preventDefault();
			return;
		}

		if( $event.keyCode !== 32
			&& ( $event.keyCode < 65 || $event.keyCode > 90 )
			&& ( $event.keyCode < 48 || $event.keyCode > 57 ) )
			return;

		if( $event.keyCode === 32 ) {
			$event.preventDefault();
			if( ! isMainSelect && ! this._pressedInputKeys.length ) {
				mdSelect.close();
				return;
			}
			if( this._pressedTimer ) {
				mdSelect.writeValue( null );
				mdSelect.open();
			}
		}
		if( isMainSelect && ! mdSelect.panelOpen ) {
			mdSelect.open();
		}

		if( this._pressedTimer ) clearTimeout( this._pressedTimer );

		this._pressedInputKeys.push( $event.keyCode );

		const label:string = String.fromCharCode( ...this._pressedInputKeys ).toLowerCase();
		const index:number = mdSelect.options.toArray().findIndex( options => options.viewValue.toLowerCase().startsWith( label ) );

		if( index !== - 1 ) setTimeout( () => mdSelect._keyManager.setActiveItem( index ), 0 );

		this._pressedTimer = setTimeout( () => {
			this._pressedInputKeys.length = 0;
			this._pressedTimer = null;
		}, 500 );
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

	closeAutoCompletePanels() {
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
		if( this._isValidBirthDate() ) {
			this.newUser.birthday = `${ this.monthNames[ this.birthDate.month ] } ${ this.birthDate.day }${ this.birthDate.day === 1 ? "st" : this.birthDate.day === 2 ? "nd" : this.birthDate.day === 3 ? "rd" : "th" }`;
			this.newUser.birthDate = `${ this.newUser.birthday }, ${ this.birthDate.year }`;
		}

		this._cleanNewUser();

		let savingDynamicData:Observable<void>[] = this._dynamicProperties
			.filter( dynamic => typeof this.newUser[ dynamic.property ] === "string" )
			.map( dynamic => {
				let data:RawBasicData = {
					types: [ ContainersData.CONTAINER_TYPE.get( dynamic.containerSlug ) ],
					name: this.newUser[ dynamic.property as string ],
				};
				return this.dataService.saveBasicData( dynamic.containerSlug, data )
					.map( ( carbonData ) => {
						this.newUser[ dynamic.property ] = carbonData;
						this._addDynamicData( dynamic, carbonData );
					} );
			} );

		Observable.forkJoin( ...savingDynamicData, Promise.resolve() )
			.switchMap( () => this.dataService.createUser( this.newUser ) )
			.subscribe( () => {
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

	private _addDynamicData( dynamicProperty:DynamicProperty, carbonData:BasicCarbonData ):void {
		if( ! dynamicProperty.observable ) return;
		if( dynamicProperty.observable.value.find( element => element.name === carbonData.name ) ) return;

		dynamicProperty.observable.value.push( carbonData );
		dynamicProperty.observable.value.sort( ( data1:BasicCarbonData, data2:BasicCarbonData ) => data1.name.localeCompare( data2.name ) );
		this.autoCompleteChange( this.newUser[ dynamicProperty.property ], dynamicProperty.property as "birthCity" | "company" | "institute" );
	}

}

interface DynamicProperty {
	property:"birthCity" | "company" | "institute" | "birthDate" | "birthday" ;
	containerSlug:string;
	observable?:PromiseObservable<BasicCarbonData[]>;
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
