import { Component, AfterViewInit, Renderer, ViewChild, ElementRef, OnDestroy, OnInit } from "@angular/core";

import { Network, DataSet, Node as NetworkNode, Edge as NetworkEdge } from "vis";

import { CarbonDataService } from "app/data/carbonData.service";
import { User } from "app/user/userData";
import { Observable, Subscription } from "rxjs";
import { SyncService } from "app/data/sync.service";

import { Class as ProtectedDocument } from "carbonldp/ProtectedDocument";

@Component( {
	selector: "app-graph",
	providers: [
		CarbonDataService,
	],
	templateUrl: "./graph.component.html",
	styleUrls: [ "./graph.component.scss" ],
} )
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild( "graph" ) graphElement:ElementRef;

	graph:Network;
	nodes:DataSet<NetworkNode>;
	edges:DataSet<NetworkEdge>;

	private creationSubscription:Subscription;

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
			height: `${ this.graphElement.nativeElement.clientHeight }px`,
			interaction: {
				hover: true
			},
			nodes: {
				font: {
					// color: "rgba(255, 255, 255, 0.87)",
					color: "rgba(0, 0, 0, 0.87)",
				},
			},
			groups: {
				"users": {
					color: "#ffb74d",
				},
			},
		} );
		this.graph.stabilize();

		this.renderExistingData();

		this.creationSubscription = this.syncService.onDocumentCreated()
			.flatMap( document => this.dataService.resolveDocument( document ) )
			.subscribe( ( document:ProtectedDocument ) => {
				if( document.hasType( "User" ) ) {
					this.renderUser( document as User, true );
				}
			} );
	}

	ngOnInit():void {
		this.syncService.openNotificationSender();
	}

	ngOnDestroy():void {
		this.syncService.closeNotificationSender();
		this.creationSubscription.unsubscribe();
	}

	private renderExistingData():void {
		Observable.forkJoin(
			this.dataService.getUsers().map( user => this.renderUser( user ) )
		).subscribe(
			() => {},
			error => console.log( error ),
		);
	}

	private renderUser( user:User, focus?:boolean ):void {
		this.nodes.add( {
			id: user.id,
			label: user.nickname,
			group: "users",
		} );

		if( focus ) {
			this.graph.focus( user.id );
			this.graph.selectNodes( [ user.id ] );
		}
	}


}
