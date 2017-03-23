import Carbon from "carbonldp/Carbon";

import * as App from "carbonldp/App";
import * as NS from "carbonldp/NS";
import Response from "carbonldp/HTTP/Response";

import { SECURE, DOMAIN, APP_SLUG, CLEAN_APP } from "script/config";
import { elementSlug, extractElementsData } from "script/utils";
import { DEFAULT_CONTAINERS, DefaultContainerData, DefaultNamedContainer } from "script/default-data";

let appContext:App.Context;
let carbon:Carbon = initCarbon( SECURE, DOMAIN );

carbon.auth.authenticate( "admin@carbonldp.com", "hello" ).then( () => {
	return getApp( APP_SLUG );
} ).then( ( _result:App.Context ) => {
	appContext = _result;
} ).then( () => {
	DEFAULT_CONTAINERS.forEach( container => setContainer( "/", container ) );
} ).catch( console.error );

function initCarbon( isSecure:boolean, domain:string ):Carbon {
	let carbon:Carbon = new Carbon( {
		"http.ssl": isSecure,
		domain: domain,
	} );

	carbon.extendObjectSchema( {
		"ldp": "http://www.w3.org/ns/ldp#",
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

async function setContainer( parentSlug:string, container:DefaultNamedContainer ):Promise<void> {
	let [ exists ]:[ boolean, Response ] = await appContext.documents.exists( container.elementSlug );

	if( exists && CLEAN_APP ) {
		await appContext.documents.delete( container.elementSlug );
		exists = false;
	}

	if( ! exists ) {
		await appContext.documents.createChild( parentSlug, {}, container.elementSlug );
		await setChildren( parentSlug + container.elementSlug, container );
	}
}

async function setChildren( containerSlug:string, container:DefaultContainerData ):Promise<void> {
	await appContext.documents.createChildren( containerSlug, extractElementsData( container ), container.children.map( elementSlug ) );
	for( let element of container.children ) {
		if( ! (  "children" in element ) ) continue;

		let childContainer:DefaultContainerData = element as DefaultContainerData;
		await setChildren( containerSlug + elementSlug( element ), childContainer );
	}
}
