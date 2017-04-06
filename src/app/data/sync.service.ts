import { Injectable } from "@angular/core";

import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";

import * as Pointer from "carbonldp/Pointer";

import { DocumentEvent, DocumentEventFactory, Utils as DocumentEventUtils } from "app/data/documentEvent";
import * as DEMO from "app/ns/demo";
import { WS_HOST } from "app/config";

@Injectable()
export class SyncService {
	private connection:WebSocketSubject<string>;

	private subscription:Subscription;

	constructor() {
		this.connection = WebSocketSubject.create( {
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
			.filter( object => DocumentEventUtils.hasType( object, DEMO.DocumentEvent ) )
			.map( object => <DocumentEvent> object );
	}

	onDocumentCreated():Observable<string> {
		return this.onDocumentEvent()
			.filter( event => DocumentEventUtils.hasType( event, DEMO.DocumentCreated ) )
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
}
