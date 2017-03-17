import Carbon from "carbonldp/Carbon";

import * as App from "carbonldp/App";
import * as NS from "carbonldp/NS";
import Response from "carbonldp/HTTP/Response";

import { SECURE, DOMAIN, APP_SLUG, CLEAN_APP } from "script/config";
import { elementSlug } from "script/utils";
import { DEFAULT_CONTAINERS, DefaultContainerData } from "script/default-data";

let appContext:App.Context;
let carbon:Carbon = initCarbon( SECURE, DOMAIN );

carbon.auth.authenticate( "admin@carbonldp.com", "hello" ).then( () => {
	return getApp( APP_SLUG );
} ).then( ( _result:App.Context ) => {
	appContext = _result;
} ).then( () => {
	DEFAULT_CONTAINERS.forEach( setContainer );
} ).catch( console.error );

function initCarbon( isSecure:boolean, domain:string ):Carbon {
	let carbon:Carbon = new Carbon( {
		"http.ssl": isSecure,
		domain: domain,
	} );

	return carbon;
}

async function getApp( appSlug:string ):Promise<App.Context> {
	let [ exists ]:[ boolean, Response ] = await carbon.documents.exists( "apps/" + appSlug );

	if( ! exists ) {
		let memoryApp:App.Class = App.Factory.create( "Demo app", "NG-Conf demo app" );
		memoryApp.allowsOrigins = [ NS.CS.Class.AllOrigins ];
		await carbon.apps.create( memoryApp, appSlug );
	}

	return carbon.apps.getContext( appSlug );
}

async function setContainer( container:DefaultContainerData ):Promise<void> {
	let [ exists ]:[ boolean, Response ] = await appContext.documents.exists( container.slug );

	if( exists && CLEAN_APP ) {
		await appContext.documents.delete( container.slug );
		exists = false;
	}

	if( ! exists ) {
		await appContext.documents.createChild( "/", {}, container.slug );
		await appContext.documents.createChildren( container.slug, container.elements, container.elements.map( elementSlug ) );
	}
}

