import { Directive } from "@angular/core";
import { AbstractControl, NG_ASYNC_VALIDATORS, Validator } from "@angular/forms";

import * as App from "carbonldp/App";
import Response from "carbonldp/HTTP/Response";
import SELECTResults from "carbonldp/SPARQL/SELECTResults";

@Directive( {
	selector: '[uniqueNickname]',
	providers: [ { provide: NG_ASYNC_VALIDATORS, useExisting: UniqueNicknameDirective, multi: true } ]
} )
export class UniqueNicknameDirective implements Validator {

	constructor( private appContext:App.Context ) {}

	validate( control:AbstractControl ):Promise<{ [key:string]:any }> {
		return this.appContext.documents.sparql( "users/" )
			.select( "user" )
			.where( _ => [
				_.resource( "users/" ).has( "ldp:contains", _.var( "user" ) ),
				_.var( "user" ).has( "nickname", control.value )
			] )
			.execute()
			.then( ( [ results ]:[ SELECTResults, Response ] ) => {
				return results.bindings.length === 0 ? null
					: { uniqueNickname: true }
			} );
	}
}