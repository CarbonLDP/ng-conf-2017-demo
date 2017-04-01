import Carbon from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as NS from "carbonldp/NS";
import * as Pointer from "carbonldp/Pointer";
import Response from "carbonldp/HTTP/Response";

const WebSocket = require( "ws" );
import { Observable } from "rxjs";

import { SECURE, DOMAIN, APP_SLUG, CLEAN_APP, CARBON_USER, CARBON_PASS, WS_HOST, NO_BUILD, INJECT } from "script/config";
import { elementSlug, extractElementsData } from "script/utils";
import { DEFAULT_CONTAINERS, DefaultContainerData, DefaultNamedContainer } from "script/default-data";

import { BasicCarbonData, RawBasicData, Utils as CarbonDataUtils } from "app/data/carbonData";
import { DocumentEventFactory } from "app/data/documentEvent";
import * as VOCAB from "app/ns/vocab";
import * as DEMO from "app/ns/demo";
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";

const ora = require( "ora" );

let appContext:App.Context;
let carbon:Carbon = initCarbon( SECURE, DOMAIN );

carbon.auth.authenticate( CARBON_USER, CARBON_PASS ).then( () => {
	return getApp( APP_SLUG );
} ).then( ( _result:App.Context ) => {
	appContext = _result;
} ).then( () => {
	if( NO_BUILD ) return;
	return DEFAULT_CONTAINERS.reduce( ( promise, container ) => {
		return promise.then( () => setContainer( "/", container ) );
	}, Promise.resolve() );
} ).then( () => {
	if( INJECT )
		return createUsers();
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

async function createUsers():Promise<void> {
	let spinner:any;
	const socket:WebSocketSubject<string> = Observable.webSocket( {
		url: WS_HOST,
		WebSocketCtor: WebSocket,
		resultSelector: ( e:MessageEvent ) => e.data,
	} );
	socket.subscribe();

	spinner = ora( "Obtaining dynamic containers" ).start();
	const dynamics:{
		label:string,
		container:string,
		type:string,
		data:BasicCarbonData[],
	}[] = [
		{
			label: "birthCity",
			container: "cities/",
			type: VOCAB.City,
			data: await appContext.documents.getChildren<BasicCarbonData>( "cities/" ).then( ( [ array ] ) => array ),
		},
		{
			label: "company",
			container: "companies/",
			type: VOCAB.Company,
			data: await appContext.documents.getChildren<BasicCarbonData>( "companies/" ).then( ( [ array ] ) => array ),
		},
		{
			label: "institute",
			container: "institutes/",
			type: VOCAB.Institute,
			data: await appContext.documents.getChildren<BasicCarbonData>( "institutes/" ).then( ( [ array ] ) => array ),
		},
	];
	spinner.succeed( "Dynamic containers obtained" );

	spinner = ora( "Obtaining static containers" ).start();
	const statics:{
		label:string,
		data:BasicCarbonData[],
	}[] = [
		{
			label: "country",
			data: await appContext.documents.getChildren<BasicCarbonData>( "countries/" ).then( ( [ array ] ) => array ),
		},
		{
			label: "worksOn",
			data: await appContext.documents.getChildren<BasicCarbonData>( "work-layers/" ).then( ( [ array ] ) => array ),
		},
		{
			label: "desktopOS",
			data: await appContext.documents.getChildren<BasicCarbonData>( "desktop-oss/" ).then( ( [ array ] ) => array ),
		},
		{
			label: "mobileOD",
			data: await appContext.documents.getChildren<BasicCarbonData>( "mobile-oss/" ).then( ( [ array ] ) => array ),
		},
	];
	spinner.succeed( "Static containers obtained" );

	for( let i = 0; i < INJECT; ++ i ) {
		ora( `Creating user ${ i + 1 }/${ INJECT }` ).stopAndPersist();
		const user = {
			types: [ VOCAB.User ],
			nickname: Math.random().toString( 36 ).slice( 2 ),
		};

		for( const element of statics ) {
			let chosen:number = Math.floor( Math.random() * element.data.length );
			user[ element.label ] = element.data[ chosen ];
			if( ! ! user[ element.label ].states ) {
				chosen = Math.floor( Math.random() * user[ element.label ].states.length );
				user[ "birthState" ] = user[ element.label ].states[ chosen ];
			}
		}

		for( const element of dynamics ) {
			const createNew:boolean = Math.random() * 100 > 75;
			if( createNew ) {
				const [ document ] = await appContext.documents.createChild<RawBasicData>( element.container, {
						types: [ element.type ],
						name: Math.random().toString( 36 ).slice( 2 )
					} );
				ora( `\tCreated document: "${ document.id }"` ).succeed();

				user[ element.label ] = document;
				element.data.push( document );
				socket.next( JSON.stringify( DocumentEventFactory.create( DEMO.DocumentCreated, document ) ) );

			} else {
				let chosen:number = Math.floor( Math.random() * element.data.length );
				user[ element.label ] = element.data[ chosen ];
			}
		}

		spinner = ora( "\tPersisting the user" ).start();
		await appContext.documents.createChild( "users/", user );
		spinner.succeed( `\tUser "${ (<any> user).id }" created` );
		socket.next( JSON.stringify( DocumentEventFactory.create( DEMO.DocumentCreated, <any> user ) ) );
		await Observable.timer( 10000 ).toPromise();
	}

	ora( `Finished` ).stopAndPersist();
	setTimeout( () => socket.unsubscribe(), 1000 );
	return socket.toPromise().then( () => {} );
}
