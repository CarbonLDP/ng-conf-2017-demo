"use strict";

const WebSocket = require( "ws" );

const argv = require( "yargs" )
	.usage( "Usage: $o --port [port]" )
	.describe( "port", "Port for the server to listen to" )
	.number( "port" )
	.alias( "p", "port" )
	.default( "port", 8090 )
	.argv;

if( Number.isNaN( argv.port ) ) {
	console.log( "--port must be a valid number" );
	process.exit( 1 );
}
const app = {
	webSocketServer: null,
	connectedClients: new Set()
};

Promise.resolve()
	.then( startServer )
	.then( manageConnections )
	.catch( error => {
		console.log( error );
		process.exit( 1 );
	} );

function startServer() {
	return new Promise( ( resolve, reject ) => {
		app.wss = new WebSocket.Server( {
			port: argv.port,
			perMessageDeflate: false // Disable message compression. Adds unnecessary overhead
		}, ( error ) => {
			if( ! error ) {
				console.log( `Server listening on port ${ argv.port }` );
				resolve( app.wss );
			} else {
				console.log( "Failed to initialize server" );
				reject( error );
			}
		} );
	} );
}

function manageConnections() {
	return Promise.resolve().then( () => {
		app.wss.on( "connection", ( connectedClient ) => {
			const clientID = generateUUID();
			console.log( `Client '${ clientID }' connected!` );

			app.connectedClients.add( connectedClient );

			connectedClient.on( "close", ( code, reason ) => {
				console.log( `Client '${ clientID }' disconnected. Code: ${ code }, reason: '${ reason }'` );
				app.connectedClients.delete( connectedClient );
			} );

			connectedClient.on( "error", ( error ) => {
				console.log( `There was an error with a client. Error:`, error );
				// TODO: What should be done?
			} );

			connectedClient.on( "message", ( message ) => {
				console.log( `Received message from '${ clientID }'. Broadcasting...` );

				app.connectedClients.forEach( ( client ) => {
					if( client === connectedClient ) return;
					if( client.readyState !== WebSocket.OPEN ) return;

					client.send( message );
				} );
			} );
		} );
	} );
}

function generateUUID() {
	function s4() {
		return Math.floor( (1 + Math.random()) * 0x10000 ).toString( 16 ).substring( 1 );
	}

	return `${ s4() }${ s4() }-${ s4() }-${ s4() }-${ s4() }-${ s4() }${ s4() }${ s4() }`;
}