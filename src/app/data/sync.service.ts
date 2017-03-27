import { Injectable } from "@angular/core";

import { Observable, Observer } from "rxjs";

import * as Pointer from "carbonldp/Pointer";
import * as Utils from "carbonldp/Utils";

import * as DEMO from "app/ns/demo";

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
	connection:WebSocket;
	host:string;

	isConnected():boolean {
		return this.connection !== null && this.connection.readyState === WebSocket.OPEN;
	}

	connect( host?:string, ssl?:boolean ):Observable<void> {
		if( typeof host === "undefined" ) {
			if( this.host === null ) throw new Error( "The method 'connect' was called without a host on a service that hadn't connected yet" );
			host = this.host;
		} else {
			if( ! ( host.startsWith( "ws://" ) || host.startsWith( "wss://" ) ) ) host = ssl ? `wss://${ host }` : `ws://${ host }`;

			this.host = host;
		}

		return Observable.create( ( observer:Observer<void> ) => {
			if( ! this.connection || this.connection.readyState === WebSocket.CLOSING || this.connection.readyState === WebSocket.CLOSED ) {
				try {
					this.connection = new WebSocket( host );
				} catch( error ) {
					observer.error( error );
					return;
				}
			} else if( this.connection.readyState === WebSocket.OPEN ) {
				observer.complete();
				return;
			}

			this.connection.addEventListener( "error", event => observer.error( "The connection errored before reaching an open state" ) );
			this.connection.addEventListener( "close", event => observer.error( "The connection was closed before reaching an open state" ) );
			this.connection.addEventListener( "open", event => observer.complete() );
		} );
	}

	onMessage():Observable<string> {
		return Observable.concat(
			// connect() doesn't emit data, we are only including it here so it triggers the evaluation of the next observable after the connection has been completed
			<any>this.connect(),
			Observable.create( ( observer:Observer<String> ) => {
				this.connection.addEventListener( "message", event => {
					observer.next( event.data );
				} );
				this.connection.addEventListener( "close", event => {
					observer.complete();
				} );
				this.connection.addEventListener( "error", event => {
					observer.error( event );
				} );
			} )
		);
	}

	onDocumentEvent():Observable<DocumentEvent> {
		return this.onMessage()
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

	sendMessage( message:Object ):Observable<void> {
		return Observable.concat(
			this.connect(),
			Observable.create( ( observer:Observer<void> ) => {
				try {
					this.connection.send( JSON.stringify( message ) );
				} catch( error ) {
					observer.error( error );
					return;
				}
				// TODO: Research if the message is being sent synchronously or should we verify it somehow?
				observer.complete();
			} )
		);
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
