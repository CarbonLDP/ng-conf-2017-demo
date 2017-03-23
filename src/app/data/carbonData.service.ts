import * as App from "carbonldp/App";
import Response from "carbonldp/HTTP/Response";
import SELECTResults from "carbonldp/SPARQL/SELECTResults";

import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { BasicCarbonData, CountryCarbonData } from "app/data/carbonData";

@Injectable()
export class CarbonDataService {
	private static _countriesSlug:string = "countries/";

	constructor( protected appContext:App.Context ) {}

	getBasicData( containerSlug:string ):Observable<BasicCarbonData[]> {
		let promise:Promise<BasicCarbonData[]> = this._getBasicCarbonData( containerSlug );
		return Observable.fromPromise( promise );
	}

	getCountriesData():Observable<CountryCarbonData[]> {
		let promise:Promise<CountryCarbonData[]> = Promise.all( [
			this._getBasicCarbonData( CarbonDataService._countriesSlug ),
			this._getCountriesCarbonData()
		] ).then( ( [ countriesData ] ) => countriesData );

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

	private _getCountriesCarbonData():Promise<void> {
		return this.appContext.documents
			.sparql( CarbonDataService._countriesSlug )
			.select( "country", "state", "name" )
			.where( _ => {
				let container = _.resource( CarbonDataService._countriesSlug );
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

}
