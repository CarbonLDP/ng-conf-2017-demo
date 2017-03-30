import * as App from "carbonldp/App";
import { Class as Pointer } from "carbonldp/Pointer";
import { Factory as ResourceFactory } from "carbonldp/Resource";
import { Class as Response } from "carbonldp/HTTP/Response";
import { Class as SELECTResults } from "carbonldp/SPARQL/SELECTResults";
import { Class as HTTPError } from "carbonldp/HTTP/Errors/HTTPError";
import { Class as ProtectedDocument }  from "carbonldp/ProtectedDocument";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";

import { BasicCarbonData, RawBasicData, CountryCarbonData } from "app/data/carbonData";
import { dataSlug } from "app/utils";
import { UserTemplate, User } from "app/user/userData";
import { SyncService } from "app/data/sync.service";
import * as VOCAB from "app/ns/vocab";


@Injectable()
export class CarbonDataService {
	public static COUNTRIES_SLUG:string = "countries/";
	public static STATES_SLUG:string = "states/";
	public static CITIES_SLUG:string = "cities/";
	public static COMPANIES_SLUG:string = "companies/";
	public static INSTITUTES_SLUG:string = "institutes/";
	public static WORK_LAYERS_SLUG:string = "work-layers/";
	public static DESKTOP_OSS_SLUG:string = "desktop-oss/";
	public static MOBILE_OSS_SLUG:string = "mobile-oss/";
	public static USERS_SLUG:string = "users/";

	public static CONTAINER_TYPE:Map<string, string> = new Map( [
		[ CarbonDataService.COUNTRIES_SLUG, VOCAB.Country ],
		[ CarbonDataService.STATES_SLUG, VOCAB.State ],
		[ CarbonDataService.CITIES_SLUG, VOCAB.City ],
		[ CarbonDataService.COMPANIES_SLUG, VOCAB.Company ],
		[ CarbonDataService.INSTITUTES_SLUG, VOCAB.Institute ],
		[ CarbonDataService.WORK_LAYERS_SLUG, VOCAB.WorkLayer ],
		[ CarbonDataService.DESKTOP_OSS_SLUG, VOCAB.DesktopOS ],
		[ CarbonDataService.MOBILE_OSS_SLUG, VOCAB.MobileOS ],
		[ CarbonDataService.USERS_SLUG, VOCAB.User ],
	] );
	public static TYPE_CONTAINER:Map<string, string> = new Map( [
		[ VOCAB.Country, CarbonDataService.COUNTRIES_SLUG ],
		[ VOCAB.State, CarbonDataService.STATES_SLUG ],
		[ VOCAB.City, CarbonDataService.CITIES_SLUG ],
		[ VOCAB.Company, CarbonDataService.COMPANIES_SLUG ],
		[ VOCAB.Institute, CarbonDataService.INSTITUTES_SLUG ],
		[ VOCAB.WorkLayer, CarbonDataService.WORK_LAYERS_SLUG ],
		[ VOCAB.DesktopOS, CarbonDataService.DESKTOP_OSS_SLUG ],
		[ VOCAB.MobileOS, CarbonDataService.MOBILE_OSS_SLUG ],
		[ VOCAB.User, CarbonDataService.USERS_SLUG ],
	] );

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
		return ResourceFactory.createFrom<RawBasicData>(
			Object.assign( pointer, data ),
			pointer.id,
			[ CarbonDataService.CONTAINER_TYPE.get( containerSlug ) ],
		);
	}

	saveBasicData( containerSlug:string, data:BasicCarbonData ):Observable<void> {
		let promise:Promise<void> = this._saveBasicCarbonData( containerSlug, data );
		return Observable.fromPromise( promise );
	}

	resolveDocument<T>( id:string ):Observable<ProtectedDocument & T> {
		let promise:Promise<ProtectedDocument & T> = this._revolveDocument<T>( id );
		return Observable.fromPromise( promise );
	}

	getUsers():Observable<User> {
		let promise:Promise<User[]> = this._getUsers();
		return Observable.fromPromise( promise ).mergeMap( user => Observable.from( user ) );
	}

	createUser( newUser:UserTemplate ):Observable<void> {
		let promise:Promise<void> = this._createUser( newUser );
		return Observable.fromPromise( promise );
	}

	private _getBasicCarbonData( containerSlug:string ):Promise<BasicCarbonData[]> {
		return this.appContext.documents
			.sparql( containerSlug )
			.select( "child", "name", "type" )
			.where( _ => {
				const container = _.resource( containerSlug );
				const child = _.var( "child" );
				const types = _.var( "type" );

				return [
					container.has( "ldp:contains", child ),
					child.has( "rdf:type", types )
						.and( "name", _.var( "name" ) )
				];
			} )
			.orderBy( "?name" )
			.execute()
			.then( ( [ _results ]:[ SELECTResults, Response ] ) => {
				return _results.bindings.map( binding => {
					let data:BasicCarbonData = binding[ "child" ] as any;
					data.name = binding[ "name" ] as string;
					if( ! data.types ) {
						ResourceFactory.createFrom<RawBasicData>( data, data.id, [ binding[ "type" ] as string ] );
						return data;
					} else {
						data.addType( binding[ "type" ] as string );
					}
				} ).filter( data => ! ! data );
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

					let stateData:BasicCarbonData = ResourceFactory.createFrom<RawBasicData>( binding[ "state" ] as any );
					stateData.name = binding[ "name" ] as string;
					stateData.addType( VOCAB.State );
					countryData.states.push( stateData );

					return countryData;
				} );
			} );
	}

	private _saveBasicCarbonData( containerSlug:string, data:BasicCarbonData ):Promise<void> {
		let slug:string = dataSlug( data.name );
		return this.appContext.documents
			.createChild( containerSlug, data, slug )
			.then( ( [ document ]:[ Pointer, Response ] ) => {
				this.syncService.notifyDocumentCreation( document );
			} )
			.catch( ( error:HTTPError ) => {
				if( error.statusCode !== 409 ) return Promise.reject( error );
			} );
	}

	private _revolveDocument<T>( id:string ):Promise<ProtectedDocument & T> {
		return this.appContext.documents
			.get<T>( id )
			.then( ( [ document ]:[ ProtectedDocument, Response ] ) => document );
	}

	private _getUsers():Promise<User[]> {
		return this.appContext.documents
			.getChildren<User>( CarbonDataService.USERS_SLUG )
			.then( ( [ users ]:[ User[], Response ] ) => users );
	}

	private _createUser( newUser:UserTemplate ):Promise<void> {
		let slug:string = dataSlug( newUser.nickname );
		return this.appContext.documents
			.createChild( CarbonDataService.USERS_SLUG, newUser, slug )
			.then( ( [ document, ]:[ Pointer, Response ] ) => {
				this.syncService.notifyDocumentCreation( document );
			} );
	}

}
