import * as App from "carbonldp/App";
import { Class as Pointer } from "carbonldp/Pointer";
import { Class as Response } from "carbonldp/HTTP/Response";
import { Class as SELECTResults } from "carbonldp/SPARQL/SELECTResults";
import { Class as HTTPError } from "carbonldp/HTTP/Errors/HTTPError";
import { Class as ProtectedDocument }  from "carbonldp/ProtectedDocument";
import * as PersistedDocument from "carbonldp/PersistedDocument";

import { Injectable } from "@angular/core";

import { Observable } from "rxjs/Observable";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";
import "rxjs/add/observable/fromPromise";

import { BasicCarbonData, RawBasicData, CountryCarbonData } from "app/data/carbonData";
import { dataSlug } from "app/utils";
import { UserTemplate, User } from "app/data/userData";
import { SyncService } from "app/data/sync.service";
import * as VOCAB from "app/ns/vocab";
import * as ContainersData from "app/data/containersData";

@Injectable()
export class CarbonDataService {

	constructor( protected appContext:App.Context, protected syncService:SyncService ) {}

	getBasicData( containerSlug:string ):PromiseObservable<BasicCarbonData[]> {
		let promise:Promise<BasicCarbonData[]> = this._getBasicCarbonData( containerSlug );
		return Observable.fromPromise( promise ) as PromiseObservable<BasicCarbonData[]>;
	}

	getCountriesData():PromiseObservable<CountryCarbonData[]> {
		let promise:Promise<CountryCarbonData[]> = Promise.all( [
			this._getBasicCarbonData( ContainersData.COUNTRIES_SLUG ),
			this._getStatesCarbonData()
		] ).then( ( [ countriesData ] ) => countriesData );

		return Observable.fromPromise( promise ) as PromiseObservable<CountryCarbonData[]>;
	}

	saveBasicData( containerSlug:string, data:RawBasicData ):Observable<BasicCarbonData> {
		let promise:Promise<BasicCarbonData> = this._saveBasicCarbonData( containerSlug, data );
		return Observable.fromPromise( promise );
	}

	resolveDocument<T>( id:string ):Observable<ProtectedDocument & T> {
		let promise:Promise<ProtectedDocument & T> = this._revolveDocument<T>( id );
		return Observable.fromPromise( promise );
	}

	getUsers():Observable<User[]> {
		let promise:Promise<User[]> = this._getUsers();
		return Observable.fromPromise( promise );
	}

	createUser( newUser:UserTemplate ):Observable<void> {
		let promise:Promise<void> = this._createUser( newUser );
		return Observable.fromPromise( promise );
	}

	dropData( data:BasicCarbonData ):void {
		this.appContext.documents.removePointer( data.id );
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
					const type:string = ( binding[ "type" ] as Pointer ).id;
					if( ! data.types ) {
						PersistedDocument.Factory.decorate<RawBasicData>( data, this.appContext.documents );
						data.addType( type );
						data.name = binding[ "name" ] as string;
						return data;
					}
					data.addType( type );
				} ).filter( data => ! ! data );
			} );
	}

	private _getStatesCarbonData():Promise<void> {
		return this.appContext.documents
			.sparql( ContainersData.COUNTRIES_SLUG )
			.select( "country", "state", "name" )
			.where( _ => {
				let container = _.resource( ContainersData.COUNTRIES_SLUG );
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
					const countryData:CountryCarbonData = binding[ "country" ] as any;
					if( ! countryData.states ) countryData.states = [];

					const stateData:BasicCarbonData = PersistedDocument.Factory.decorate<RawBasicData>( binding[ "state" ] as any, this.appContext.documents );
					stateData.name = binding[ "name" ] as string;
					stateData.addType( VOCAB.State );
					countryData.states.push( stateData );

					return countryData;
				} );
			} );
	}

	private _saveBasicCarbonData( containerSlug:string, data:RawBasicData ):Promise<BasicCarbonData> {
		if( PersistedDocument.Factory.is( data ) ) return Promise.resolve( data );

		let slug:string = dataSlug( data.name );
		return this.appContext.documents
			.createChild<RawBasicData>( containerSlug, data, slug )
			.then( ( [ document ]:[ BasicCarbonData, Response ] ) => {
				this.syncService.notifyDocumentCreation( document );
				return document;
			} )
			.catch( ( error:HTTPError ) => {
				if( error.statusCode !== 409 ) return Promise.reject( error );

				const document:PersistedDocument.Class = PersistedDocument.Factory.decorate(
					this.appContext.documents.getPointer( containerSlug + slug ),
					this.appContext.documents,
				);
				return Object.assign( document, data );
			} );
	}

	private _revolveDocument<T>( id:string ):Promise<ProtectedDocument & T> {
		return this.appContext.documents
			.get<T>( id )
			.then( ( [ document ]:[ ProtectedDocument, Response ] ) => document );
	}

	private _getUsers():Promise<User[]> {
		return this.appContext.documents
			.getChildren<User>( ContainersData.USERS_SLUG )
			.then( ( [ users ]:[ User[], Response ] ) => users );
	}

	private _createUser( newUser:UserTemplate ):Promise<void> {
		let slug:string = dataSlug( newUser.nickname );
		return this.appContext.documents
			.createChild( ContainersData.USERS_SLUG, newUser, slug )
			.then( ( [ document, ]:[ Pointer, Response ] ) => {
				this.syncService.notifyDocumentCreation( document );
			} );
	}

}
