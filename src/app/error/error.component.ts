import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

import { activeContext } from "angular2-carbonldp/boot";

@Component( {
	selector: "app-error",
	templateUrl: "./error.component.html",
} )
export class ErrorComponent implements OnInit, AfterViewInit {
	error:any;
	errorType:string;

	constructor( private router:Router ) {}

	ngOnInit():void {
		activeContext.promise.then( () => {
			// The active context was successfully loaded, the user must have landed here by visiting the direct URL
			// Let's redirect him to the home page
			this.router.navigate( [ "/" ] );
		} );
	}

	ngAfterViewInit():void {
		activeContext.promise.catch( ( error ) => {
			this.error = error;
			this.errorType = "requestID" in this.error ? this.error.name : null;

			console.error( this.error );
		} );
	}
}