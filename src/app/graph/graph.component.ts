import { Component, AfterViewInit, Renderer, ViewChild, ElementRef } from "@angular/core";

import { Network, DataSet, Node as NetworkNode, Edge as NetworkEdge } from "vis";

import { CarbonDataService } from "app/data/carbonData.service";
import { User } from "app/user/userData";
import { Observable } from "rxjs";
import { SyncService } from "app/data/sync.service";


@Component( {
	selector: "app-graph",
	providers: [
		CarbonDataService,
	],
	templateUrl: "./graph.component.html",
	styleUrls: [ "./graph.component.scss" ],
} )
export class GraphComponent implements AfterViewInit {
	@ViewChild( "graph" ) graphElement:ElementRef;

	graph:Network;
	nodes:DataSet<NetworkNode>;
	edges:DataSet<NetworkEdge>;

	// Renderer needs to be injected in order for ViewChild to be injected too
	constructor( private renderer:Renderer, private dataService:CarbonDataService, private syncService:SyncService ) {}

	ngAfterViewInit():void {
		this.nodes = new DataSet<NetworkNode>();
		this.edges = new DataSet<NetworkEdge>();

		this.graph = new Network( this.graphElement.nativeElement, {
			nodes: this.nodes,
			edges: this.edges
		}, {
			width: "100%",
			height: `${ this.graphElement.nativeElement.clientHeight}px`
		} );

		this.renderExistingData().subscribe(
			() => {},
			( error ) => console.error( error )
		);

		this.syncService.onDocumentCreated().subscribe( document => console.log( document ) );
	}

	private renderExistingData():Observable<void> {
		return Observable.from(
			this.dataService.getUsers().do( this.renderUser.bind( this ) ).last().map( () => null )
		);
	}

	private renderUser( user:User ):void {
		this.nodes.add( {
			id: user.id,
			label: user.nickname
		} );
	}


}
