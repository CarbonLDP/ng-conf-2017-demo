import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode, NgModuleRef } from "@angular/core";

import { appInjector, activeContext } from "angular2-carbonldp/boot";
import Carbon from "carbonldp/Carbon";

import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon( {
	"http.ssl": process.env.CARBON.protocol === "https",
	domain: process.env.CARBON.domain,
} );

if( process.env.ENV === "production" ) {
	enableProdMode();
}

activeContext.initialize( carbon, "test-app/" ).then( () => {
	return platformBrowserDynamic().bootstrapModule( AppModule );

} ) .then( ( appRef:NgModuleRef<AppModule> ) => {
	return appInjector( appRef.injector );

} ).catch( ( error ) => {
	console.error( error );
} );

