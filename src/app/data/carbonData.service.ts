import * as App from "carbonldp/App";
import Pointer from "carbonldp/Pointer";
import Response from "carbonldp/HTTP/Response";
import SELECTResults from "carbonldp/SPARQL/SELECTResults";
import HTTPError from "carbonldp/HTTP/Errors/HTTPError";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";

import { BasicCarbonData, RawBasicData, CountryCarbonData } from "app/data/carbonData";
import { dataSlug } from "app/utils";
import { UserTemplate, User } from "app/user/userData";
import { SyncService } from "app/data/sync.service";


@Injectable()
export class CarbonDataService {
	public static COUNTRIES_SLUG:string = "countries/";
	public static CITIES_SLUG:string = "cities/";
	public static COMPANIES_SLUG:string = "companies/";
	public static INSTITUTES_SLUG:string = "institutes/";
	public static WORK_LAYERS_SLUG:string = "work-layers/";
	public static DESKTOP_OSS_SLUG:string = "desktop-oss/";
	public static MOBILE_OSS_SLUG:string = "mobile-oss/";
	public static USERS_SLUG:string = "users/";

	constructor( protected appContext:App.Context, protected syncService:SyncService ) {}

	getBasicData( containerSlug:string ):PromiseObservable<BasicCarbonData[]> {
		let promise:Promise<BasicCarbonData[]> = this._getBasicCarbonData( containerSlug );
		return Observable.fromPromise( promise ) as PromiseObservable<BasicCarbonData[]>;
	}

	getCountriesData():Observable<CountryCarbonData[]> {
		let promise:Promise<CountryCarbonData[]> = Promise.all( [
			this._getBasicCarbonData( CarbonDataService.COUNTRIES_SLUG ),
			this._getStatesCarbonData()
		] ).then( ( [ countriesData ] ) => countriesData );

		return Observable.fromPromise( promise );
	}

	convertBasicData( containerSlug:string, data:RawBasicData ):BasicCarbonData {
		let pointer:Pointer = this.appContext.documents.getPointer( containerSlug + dataSlug( data.name ) );
		return Object.assign( pointer, data );
	}

	saveBasicData( containerSlug:string, data:BasicCarbonData ):Observable<void> {
		let promise:Promise<void> = this._saveBasicCarbonData( containerSlug, data );
		return Observable.fromPromise( promise );
	}

	getUsers():Observable<User> {
		let promise:Promise<User[]> = this._getUsers();
		return Observable.fromPromise( promise ).mergeMap( users => Observable.from( users ) );
	}

	createUser( newUser:UserTemplate ):Observable<void> {
		let promise:Promise<void> = this._createUser( newUser );
		return Observable.fromPromise( promise );
	}

	private _getBasicCarbonData( containerSlug:string ):Promise<BasicCarbonData[]> {
		return this.appContext.documents
			.sparql( containerSlug )
			.select( "child", "name" )
			.where( _ => {
				let container = _.resource( containerSlug );
				let child = _.var( "child" );

				return [
					container.has( "ldp:contains", child ),
					child.has( "name", _.var( "name" ) )
				];
			} )
			.orderBy( "?name" )
			.execute()
			.then( ( [ _results ]:[ SELECTResults, Response ] ) => {
				return _results.bindings.map( binding => {
					let data:BasicCarbonData = binding[ "child" ] as any;
					data.name = binding[ "name" ] as string;
					return data;
				} );
			} );
	}

	private _getStatesCarbonData():Promise<void> {
		return this.appContext.documents
			.sparql( CarbonDataService.COUNTRIES_SLUG )
			.select( "country", "state", "name" )
			.where( _ => {
				let container = _.resource( CarbonDataService.COUNTRIES_SLUG );
				let country = _.var( "country" );
				let state = _.var( "state" );

				return [
					container.has( "ldp:contains", country ),
					country.has( "state", state ),
					state.has( "name", _.var( "name" ) )
				];
			} )
			.orderBy( "?country ?name" )
			.execute()
			.then( ( [ _results ]:[ SELECTResults, Response ] ) => {
				_results.bindings.map( binding => {
					let countryData:CountryCarbonData = binding[ "country" ] as any;
					if( ! countryData.states ) countryData.states = [];

					let stateData:BasicCarbonData = binding[ "state" ] as any;
					stateData.name = binding[ "name" ] as string;
					countryData.states.push( stateData );

					return countryData;
				} );
			} );
	}

	private _saveBasicCarbonData( containerSlug:string, data:BasicCarbonData ):Promise<void> {
		let slug:string = dataSlug( data.name );
		return this.appContext.documents
			.createChild( containerSlug, data, slug )
			.then( () => {} )
			.catch( ( error:HTTPError ) => {
				if( error.statusCode !== 409 ) return Promise.reject( error );
			} );
	}

	private _getUsers():Promise<User[]> {
		return this.appContext.documents
			.getChildren<User>( CarbonDataService.USERS_SLUG )
			.then( ( [ users, response ]:[ User[], Response] ) => users );
	}

	private _createUser( newUser:UserTemplate ):Promise<void> {
		let slug:string = dataSlug( newUser.nickname );
		return this.appContext.documents
			.createChild( CarbonDataService.USERS_SLUG, newUser, slug )
			.then( ( [ document, response ]:[ Pointer, Response ] ) => {
				this.syncService.notifyDocumentCreation( document );
			} );
	}

}
