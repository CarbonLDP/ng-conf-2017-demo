import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode, NgModuleRef } from "@angular/core";

import { appInjector, activeContext } from "angular2-carbonldp/boot";
import Carbon from "carbonldp/Carbon";

import { PRODUCTION, SECURE, DOMAIN, APP_SLUG, CARBON_USER, CARBON_PASS } from "app/config";

import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon( {
	"http.ssl": SECURE,
	domain: DOMAIN,
} );

carbon.extendObjectSchema( {
	"ldp": "http://www.w3.org/ns/ldp#",
	"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
} );

if( PRODUCTION ) {
	enableProdMode();
}

// TODO: Fix
carbon.auth.authenticate( CARBON_USER, CARBON_PASS ).then( () =>
	activeContext.initialize( carbon, APP_SLUG )
).then( () =>
	platformBrowserDynamic().bootstrapModule( AppModule )
).then( ( appRef:NgModuleRef<AppModule> ) =>
	appInjector( appRef.injector )
).catch( ( error:Error ) => {
	console.error( error.stack );
} );
