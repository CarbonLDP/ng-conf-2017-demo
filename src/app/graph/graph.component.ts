import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit } from "@angular/core";

import { Network, DataSet, Node, Edge, Options, Properties } from "vis";

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
		physics?:boolean;
		value?:number;
		relatedNodes?:string[];
		mass?:number;
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

	private toFocus:string;

	private creationSubscription:Subscription;

	constructor( private dataService:CarbonDataService, private syncService:SyncService ) {}

	ngAfterViewInit():void {
		this.nodes = new DataSet<Node>();
		this.edges = new DataSet<Edge>();

		this.graph = new Network( this.graphElement.nativeElement, {}, {
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
					springConstant: 0.10,
					avoidOverlap: 0,
				},
				maxVelocity: 75,
				solver: 'forceAtlas2Based',
				timestep: 0.35,
				stabilization: {
					enabled: true,
					iterations: 500,
					updateInterval: 25,
				},
			},
			nodes: {
				font: {
					color: "rgba(0, 0, 0, 0.87)",
				},
				scaling: {
					customScalingFunction: ( min, max, total, value ) => {
						if( ! value ) return 5 / 150;
						return value / 150;
					},
					label: {
						enabled: true,
						min: 10,
						max: 150,
					}
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
				selectionWidth: 5,
			},
			groups: {
				[VOCAB.Container]: {
					color: "#607d8b",
					shape: "square",
					size: 50,
				},
				[VOCAB.User]: {
					color: "#ffb74d",
					shape: "box",
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
		} );

		this.graph.on( "stabilizationIterationsDone", () => {
			this.isProcessing = false;
			this.progressValue = 0;
			if( this.toFocus ) {
				this._focusOnNode( this.toFocus );
				this.toFocus = null;
			}
		} );
		this.graph.on( "stabilizationProgress", ( params ) => {
			this.progressValue = params.iterations / params.total * 100;
		} );

		this.graph.on( "selectNode", ( params:Properties ) => {
			this._focusOnNode( params.nodes[ 0 ] );
		} );
		this.graph.on( "deselectNode", ( params:Properties ):void => {
			if( params.previousSelection ) this._updateDeselectNodes( params.previousSelection.nodes );
		} );

		this.renderExistingData();

		this.creationSubscription = this.syncService.onDocumentCreated()
			.flatMap( document => this.dataService.resolveDocument( document ) )
			.subscribe( ( document:ProtectedDocument ) => {
				if( document.hasType( VOCAB.User ) ) {
					this.renderUser( document as User );

					this.isProcessing = true;
					this._updateDeselectNodes( this.graph.getSelectedNodes() as string[] );
					this.toFocus = document.id;
					this.graph.stabilize( 100 );
				} else {
					const type:string = this.getPrincipalType( document );
					if( ! type ) return;

					this.renderBasicData( <any> document, type, CarbonDataService.TYPE_CONTAINER.get( type ), "container" );
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
				this.graph.setData( {
					nodes: this.nodes,
					edges: this.edges,
				} );
			},
			error => console.log( error ),
		);
	}

	private renderUser( user:User ):void {
		this.nodes.add( {
			id: user.id,
			label: user.nickname,
			group: VOCAB.User,
			relatedNodes: this.renderProperties( user ),
		} );
		this.renderEdge( CarbonDataService.USERS_SLUG, user.id, "contains" );
	}

	private _focusOnNode( nodeID:string ) {
		const relatedNodes:string[] = ( this.graph
			.getConnectedNodes( nodeID ) as string[] )
			.filter( relatedNodeID => ! CarbonDataService.CONTAINER_TYPE.has( relatedNodeID ) );

		if( ! CarbonDataService.CONTAINER_TYPE.has( nodeID ) ) {
			this.nodes.update( {
				id: nodeID,
				value: 35,
			} );
		}

		relatedNodes.forEach( relatedNodeID => {
			this.nodes.update( {
				id: relatedNodeID,
				value: 20,
			} );
		} );
		this.graph.selectNodes( [ nodeID, ...relatedNodes ] );
		this.graph.fit( {
			nodes: [ nodeID, ...relatedNodes ],
			animation: true,
		} );
	}

	private renderBasicData( basicData:BasicCarbonData, group:string, container:string, edgeName:string ) {
		this.nodes.add( {
			id: basicData.id,
			label: basicData.name,
			group: group,
			relatedNodes: this.renderProperties( basicData ),
		} );
		this.renderEdge( container, basicData.id, edgeName );
	}

	private renderEdge( from:string, to:string, label:string ):void {
		this.edges.add( {
			from,
			to,
			label,
		} );
	}

	private renderContainer( id:string, label:string ):void {
		this.nodes.add( {
			id: id,
			label: label,
			group: VOCAB.Container,
		} );
	}

	private renderContainerData( dataArray:BasicCarbonData[], group:string, containerSlug:string ):void {
		this.renderContainer( containerSlug, GraphComponent.getContainerName( containerSlug ) );

		dataArray.forEach( data => this.renderBasicData( data, group, containerSlug, "contains" ) );
	}

	private static getContainerName( containerSlug:string ):string {
		return containerSlug.charAt( 0 ).toUpperCase() + containerSlug.slice( 1, - 1 );
	}

	private renderProperties( pointer:Pointer.Class ):string[] {
		const relatedNodes:string[] = [];

		Object.keys( pointer )
			.filter( key => commonIgnoredProperties.indexOf( key ) === - 1 )
			.map( key => [ key, Array.isArray( pointer[ key ] ) ? pointer[ key ] : [ pointer[ key ] ] ] )
			.forEach( ( [ key, dataArray ]:[ string, (any | Resource.Class)[] ] ) => {
				dataArray
					.filter( data => Pointer.Factory.is( data ) )
					.forEach( ( data:Resource.Class ) => {
						if( data.id.startsWith( pointer.id ) ) {
							this.renderBasicData( data as BasicCarbonData, this.getPrincipalType( data ), pointer.id, key );
						} else {
							this.renderEdge( pointer.id, data.id, key );
						}
						relatedNodes.push( data.id );
					} );
			} );

		return relatedNodes;
	}

	private getPrincipalType( resource:Resource.Class ):string {
		return Object.keys( VOCAB )
			.map( key => VOCAB[ key ] )
			.find( type => resource.hasType( type ) );
	}

	private _updateDeselectNodes( nodes:string[] ):void {
		nodes.forEach( nodeID => {
			if( CarbonDataService.CONTAINER_TYPE.has( nodeID ) ) return;

			this.nodes.update( {
				id: nodeID,
				value: null,
			} );
		} )
	}

}
