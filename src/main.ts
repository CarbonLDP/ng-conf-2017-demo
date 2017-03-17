import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode, NgModuleRef } from "@angular/core";

import { appInjector, activeContext } from "angular2-carbonldp/boot";
import Carbon from "carbonldp/Carbon";

import { PRODUCTION, SECURE, DOMAIN } from "app/config";

import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon( {
	"http.ssl": SECURE,
	domain: DOMAIN,
} );

if( PRODUCTION ) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule( AppModule ).then( ( appRef:NgModuleRef<AppModule> ) => {
	return appInjector( appRef.injector );

} ).then( () => {
	return activeContext.initialize( carbon, "demo-app/" )

} ).then( () => {
	return carbon.auth.authenticate( "admin@carbonldp.com", "hello" );

} ).catch( ( error ) => {
	console.error( error );
} );
