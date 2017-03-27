import Carbon from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as NS from "carbonldp/NS";
import * as Pointer from "carbonldp/Pointer";
import Response from "carbonldp/HTTP/Response";

import { SECURE, DOMAIN, APP_SLUG, CLEAN_APP, CARBON_USER, CARBON_PASS } from "script/config";
import { elementSlug, extractElementsData } from "script/utils";
import { DEFAULT_CONTAINERS, DefaultContainerData, DefaultNamedContainer } from "script/default-data";

const ora = require( "ora" );

let appContext:App.Context;
let carbon:Carbon = initCarbon( SECURE, DOMAIN );

carbon.auth.authenticate( CARBON_USER, CARBON_PASS ).then( () => {
	return getApp( APP_SLUG );
} ).then( ( _result:App.Context ) => {
	appContext = _result;
} ).then( () => {
	return DEFAULT_CONTAINERS.reduce( ( promise, container ) => {
		return promise.then( () => setContainer( "/", container ) );
	}, Promise.resolve() );
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
	let spinner = ora( "Loading app" ).stopAndPersist();
	let [ exists ]:[ boolean, Response ] = await carbon.documents.exists( "apps/" + appSlug );

	if( ! exists ) {
		spinner = ora( "\tCreating app" ).start();
		let memoryApp:App.Class = App.Factory.create( "Demo app", "NG-Conf demo app" );
		memoryApp.allowsOrigins = [ Pointer.Factory.create( NS.CS.Class.AllOrigins ) ];
		await carbon.apps.create( memoryApp, appSlug ).then( () => {
			spinner.succeed( "\tApp context created" );
		}, ( error:Error ) => {
			spinner.fail( "App creation error: " + error.message );
			return Promise.reject( error );
		} );
	}

	spinner = ora( "\tRetrieving app context" ).start();
	return carbon.apps.getContext( appSlug ).then( _appContext => {
		spinner.succeed( "\tApp context retrieved" );
		return _appContext;
	} );
}

async function setContainer( parentSlug:string, container:DefaultNamedContainer ):Promise<void> {
	let spinner = ora( `Setting container: "${ container.elementSlug }"` ).stopAndPersist();
	let [ exists ]:[ boolean, Response ] = await appContext.documents.exists( container.elementSlug );

	if( exists && CLEAN_APP ) {
		spinner = ora( "\tCleaning container" ).start();
		await appContext.documents.delete( container.elementSlug ).then( () => {
			spinner.succeed( "\tContainer cleaned" );
		} );
		exists = false;
	}

	if( ! exists ) {
		spinner = ora( "\tCreating container" ).start();
		await appContext.documents.createChild( parentSlug, {}, container.elementSlug ).then( () => {
			spinner.succeed( "\tContainer created" );
		}, ( error:Error ) => {
			spinner.fail( "\tContainer creation error: " + error.message );
		} );

		spinner = ora( `\t\tCreating children` ).start();
		await setChildren( parentSlug + container.elementSlug, container ).then( () => {
			spinner.succeed( "\t\tChildren created" );
		}, ( error:Error ) => {
			console.error( (<any>error).response );
			spinner.fail( "\t\tChildren creation error: " + error.message );
		} );
	} else {
		spinner.info( "\tContainer already exists" );
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
