import { Injectable } from "@angular/core";

import { Observable, Observer, Subscription } from "rxjs";
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";

import * as Pointer from "carbonldp/Pointer";
import * as Utils from "carbonldp/Utils";

import * as DEMO from "app/ns/demo";
import { WS_HOST } from "app/config";

export interface DocumentEvent {
	"@context":"https://carbonldp.com/ns/demo";
	"@type":string[];
	document:string;
}

export class DocumentEventFactory {
	static create( type:string, document:string | Pointer.Class ):DocumentEvent {
		let id:string = ! Utils.isString( document ) ? (<Pointer.Class> document).id : <string> document;

		return {
			"@context": "https://carbonldp.com/ns/demo",
			"@type": [ DEMO.DocumentEvent, type ],
			document: id
		};
	}
}

@Injectable()
export class SyncService {
	private connection:WebSocketSubject<string>;

	private subscription:Subscription;

	constructor() {
		this.connection = Observable.webSocket( {
			url: WS_HOST,
			resultSelector: ( e:MessageEvent ) => e.data,
			openObserver: {
				next: () => {
					console.log( "WebSocket opened" );
				}
			},
			closeObserver: {
				next: () => {
					console.log( "WebSocket closed" );
					this.subscription = null;
				}
			}
		} );
	}

	openNotificationSender():void {
		if( ! ! this.subscription ) {
			return;
		}

		console.log( "Subscribe" );
		this.subscription = this.connection.subscribe();
	}

	closeNotificationSender():void {
		if( ! this.subscription ) {
			return;
		}

		console.log( "UNSubscribe" );
		this.subscription.unsubscribe();
	}

	onDocumentEvent():Observable<DocumentEvent> {
		return this.connection
			.map( data => {
				try {
					return JSON.parse( data );
				} catch( error ) {
					return null;
				}
			} )
			.filter( object => object !== null )
			.filter( object => this.hasType( object, DEMO.DocumentEvent ) )
			.map( object => <DocumentEvent> object );
	}

	onDocumentCreated():Observable<string> {
		return this.onDocumentEvent()
			.filter( event => this.hasType( event, DEMO.DocumentCreated ) )
			.map( event => event.document );
	}

	sendMessage( message:Object ):void {
		try {
			this.connection.next( JSON.stringify( message ) );
		} catch( error ) {
			this.connection.error( error );
		}
	}

	notifyDocumentCreation( document:string | Pointer.Class ):void {
		let documentEvent:DocumentEvent = DocumentEventFactory.create( DEMO.DocumentCreated, document );
		this.sendMessage( documentEvent );
	}

	private hasType( object:Object, type:string ):boolean {
		if( ! Utils.isObject( object ) ) return false;
		if( ! ( "@type" in object ) ) return false;

		if( Utils.isArray( object[ "@type" ] ) ) return object[ "@type" ].indexOf( type ) !== - 1;
		else if( Utils.isString( object[ "@type" ] ) ) return object[ "@type" ] === type;
		else return false;
	}
}
