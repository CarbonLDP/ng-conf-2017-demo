import { Class as Pointer } from "carbonldp/Pointer";
import * as CarbonUtils from "carbonldp/Utils";

import * as DEMO from "app/ns/demo";

export interface DocumentEvent {
	"@context":"https://carbonldp.com/ns/demo";
	"@type":string[];
	document:string;
}

export class DocumentEventFactory {
	static create( type:string, document:string | Pointer ):DocumentEvent {
		let id:string = ! CarbonUtils.isString( document ) ? (<Pointer> document).id : <string> document;

		return {
			"@context": "https://carbonldp.com/ns/demo",
			"@type": [ DEMO.DocumentEvent, type ],
			document: id
		};
	}
}

export class Utils {
	static hasType( object:Object, type:string ):boolean {
		if( ! CarbonUtils.isObject( object ) ) return false;
		if( ! ( "@type" in object ) ) return false;

		if( CarbonUtils.isArray( object[ "@type" ] ) ) return object[ "@type" ].indexOf( type ) !== - 1;
		else if( CarbonUtils.isString( object[ "@type" ] ) ) return object[ "@type" ] === type;
		else return false;
	}
}