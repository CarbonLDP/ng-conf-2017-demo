import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit } from "@angular/core";

import { Network, DataSet, Node, Edge, Options } from "vis";

import { CarbonDataService } from "app/data/carbonData.service";
import { User } from "app/user/userData";
import { Observable, Subscription } from "rxjs";
import { SyncService } from "app/data/sync.service";
import { BasicCarbonData } from "app/data/carbonData";
import * as VOCAB from "app/ns/vocab";

import { Class as ProtectedDocument } from "carbonldp/ProtectedDocument";
import * as Pointer from "carbonldp/Pointer";
import * as Resource from "carbonldp/Resource";

declare module "vis" {
	interface Edge {
		label?:string;
	}
	interface Node {
		size?:number;
		title?:string;
	}
}

const commonIgnoredProperties:string[] = [ "types", "id", "created", "modified", "hasMemberRelation", "member", "contains", "defaultInteractionModel", "accessControlList" ];

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
	nodes:DataSet<Node>;
	edges:DataSet<Edge>;
	options:Options;

	isProcessing:boolean;
	progressMode:string;
	progressValue:number;

	private creationSubscription:Subscription;

	// Renderer needs to be injected in order for ViewChild to be injected too
	constructor( private dataService:CarbonDataService, private syncService:SyncService ) {}

	ngAfterViewInit():void {
		this.nodes = new DataSet<Node>();
		this.edges = new DataSet<Edge>();
		this.options = {
			width: "100%",
			height: `100%`,
			interaction: {
				hover: true,
			},
			layout: {
				randomSeed: 394275,
				improvedLayout: false,
			},
			physics: {
				barnesHut: {
					gravitationalConstant: - 7500,
					centralGravity: 0,
					springLength: 210,
					springConstant: 0.1,
				},
				forceAtlas2Based: {
					gravitationalConstant: - 50,
					centralGravity: 0.005,
					springLength: 180,
					springConstant: 0.18,
				},
				maxVelocity: 75,
				solver: 'forceAtlas2Based',
				timestep: 0.35,
				stabilization: {
					enabled: true,
					iterations: 750,
					updateInterval: 25,
				},
			},
			nodes: {
				font: {
					// color: "rgba(255, 255, 255, 0.87)",
					color: "rgba(0, 0, 0, 0.87)",
				},
			},
			edges: {
				font: {
					color: "rgba(0, 0, 0, 0.87)",
				},
				arrows: {
					from: false,
					to: true,
				},
				smooth: {
					enabled: true,
					type: "dynamic",
					roundness: 0.5,
				},
			},
			groups: {
				[VOCAB.Container]: {
					color: "#607d8b",
					shape: "square",
					size: 50,
				},
				[VOCAB.User]: {
					color: "#ffb74d",
				},
				[VOCAB.Country]: {
					color: "#81d4fa",
				},
				[VOCAB.State]: {
					color: "#ffab91",
				},
				[VOCAB.City]: {
					color: "#e57373",
				},
				[VOCAB.Company]: {
					color: "#fff176",
				},
				[VOCAB.Institute]: {
					color: "#9575cd",
				},
				[VOCAB.WorkLayer]: {
					color: "#aed581",
				},
				[VOCAB.DesktopOS]: {
					color: "#f48fb1",
				},
				[VOCAB.MobileOS]: {
					color: "#80cbc4",
				},
			},
		};

		this.renderExistingData();

		this.creationSubscription = this.syncService.onDocumentCreated()
			.flatMap( document => this.dataService.resolveDocument( document ) )
			.subscribe( ( document:ProtectedDocument ) => {
				if( document.hasType( VOCAB.User ) ) {
					this.renderUser( document as User, true );
				}
			} );
	}

	ngOnInit():void {
		this.syncService.openNotificationSender();

		this.isProcessing = true;
		this.progressMode = "determinate";
		this.progressValue = 0;
	}

	ngOnDestroy():void {
		this.syncService.closeNotificationSender();
		this.creationSubscription.unsubscribe();
	}

	private renderExistingData():void {
		this.renderContainer( CarbonDataService.USERS_SLUG, GraphComponent.getContainerName( CarbonDataService.USERS_SLUG ) );

		Observable.forkJoin(
			this.dataService.getUsers()
				.map( user => this.renderUser( user ) ),

			this.dataService.getBasicData( CarbonDataService.INSTITUTES_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.Institute, CarbonDataService.INSTITUTES_SLUG )
				),

			this.dataService.getBasicData( CarbonDataService.COMPANIES_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.Company, CarbonDataService.COMPANIES_SLUG )
				),

			this.dataService.getBasicData( CarbonDataService.CITIES_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.City, CarbonDataService.CITIES_SLUG )
				),

			this.dataService.getCountriesData()
				.map( dataArray => this.renderContainerData( dataArray, VOCAB.Country, CarbonDataService.COUNTRIES_SLUG ) ),

			this.dataService.getBasicData( CarbonDataService.DESKTOP_OSS_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.DesktopOS, CarbonDataService.DESKTOP_OSS_SLUG )
				),

			this.dataService.getBasicData( CarbonDataService.MOBILE_OSS_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.MobileOS, CarbonDataService.MOBILE_OSS_SLUG )
				),

			this.dataService.getBasicData( CarbonDataService.WORK_LAYERS_SLUG )
				.map( dataArray =>
					this.renderContainerData( dataArray, VOCAB.WorkLayer, CarbonDataService.WORK_LAYERS_SLUG )
				),
		).subscribe(
			() => {
				this.graph = new Network(
					this.graphElement.nativeElement,
					{ nodes: this.nodes, edges: this.edges },
					this.options
				);

				this.graph.on( "stabilizationIterationsDone", () => {
					this.isProcessing = false;
					this.graph.setOptions( {
						physics: {
							solver: "barnesHut",
						},
					} );
				} );
				this.graph.on( "stabilizationProgress", ( params ) => {
					this.progressValue = params.iterations / params.total * 100;
				} );
			},
			error => console.log( error ),
		);
	}

	private renderUser( user:User, focus?:boolean ):void {
		this.nodes.add( {
			id: user.id,
			label: user.nickname,
			group: VOCAB.User,
			title: VOCAB.User,
		} );
		this.renderContainerEdge( CarbonDataService.USERS_SLUG, user.id );
		this.renderProperties( user );

		if( focus ) {
			this.graph.focus( user.id );
			this.graph.selectNodes( [ user.id ] );
		}
	}

	private renderBasicData( basicData:BasicCarbonData, group:string, hasChildren?:boolean ) {
		this.nodes.add( {
			id: basicData.id,
			label: basicData.name,
			group: group,
			title: group,
			shape: hasChildren ? "square" : null,
			size: hasChildren ? 40 : null,
		} );

		this.renderProperties( basicData );
	}

	private renderContainer( id:string, label:string ):void {
		this.nodes.add( {
			id: id,
			label: label,
			group: VOCAB.Container,
			title: VOCAB.Container,
		} );
	}

	private renderContainerData( dataArray:BasicCarbonData[], group:string, containerSlug:string ):void {
		this.renderContainer( containerSlug, GraphComponent.getContainerName( containerSlug ) );

		dataArray.forEach( data => {
			this.renderContainerEdge( containerSlug, data.id );
			this.renderBasicData( data, group );
		} );
	}

	private static getContainerName( containerSlug:string ):string {
		return containerSlug.charAt( 0 ).toUpperCase() + containerSlug.slice( 1, - 1 );
	}

	private renderEdge( from:string, to:string, label:string ):void {
		this.edges.add( {
			from,
			to,
			label,
		} );
	}

	private renderContainerEdge( from:string, to:string ):void {
		this.renderEdge( from, to, "contains" );
	}

	private renderProperties( pointer:Pointer.Class ):void {
		Object.keys( pointer )
			.filter( key => commonIgnoredProperties.indexOf( key ) === - 1 )
			.map( key => [ key, Array.isArray( pointer[ key ] ) ? pointer[ key ] : [ pointer[ key ] ] ] )
			.forEach( ( [ key, dataArray ]:[ string, (any | Resource.Class)[] ] ) => {
				dataArray
					.filter( data => Pointer.Factory.is( data ) )
					.forEach( ( data:Resource.Class ) => {
						if( data.id.startsWith( pointer.id ) ) {
							this.renderBasicData( data as BasicCarbonData, this.getPrincipalType( data ) );
						}
						this.renderEdge( pointer.id, data.id, key );
					} );
			} );
	}

	private getPrincipalType( resource:Resource.Class ):string {
		return Object.keys( VOCAB )
			.map( key => VOCAB[ key ] )
			.find( type => resource.hasType( type ) );
	}

}
