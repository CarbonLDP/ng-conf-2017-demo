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

carbon.extendObjectSchema( {
	"ldp": "http://www.w3.org/ns/ldp#",
} );

if( PRODUCTION ) {
	enableProdMode();
}

// TODO: Fix
carbon.auth.authenticate( "admin@carbonldp.com", "hello" ).then( () =>
	activeContext.initialize( carbon, "demo-app/" )
).then( () =>
	platformBrowserDynamic().bootstrapModule( AppModule )
).then( ( appRef:NgModuleRef<AppModule> ) =>
	appInjector( appRef.injector )
).catch( ( error:Error ) => {
	console.error( error.stack );
} );
