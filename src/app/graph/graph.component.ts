import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit } from "@angular/core";

import { Network, DataSet, Node, Edge, Options, Properties } from "vis";

import { CarbonDataService } from "app/data/carbonData.service";
import { User } from "app/data/userData";
import { Observable, Subscription } from "rxjs";
import { SyncService } from "app/data/sync.service";
import { BasicCarbonData, Utils as CarbonDataUtils } from "app/data/carbonData";
import * as VOCAB from "app/ns/vocab";
import * as ContainersData from "app/data/containersData";

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
				arrowStrikethrough: false,
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
				[VOCAB.BirthDate]: {
					color: "#b0bec5",
				},
				[VOCAB.Birthday]: {
					color: "#42a5f5",
				},
			},
		} );

		this.graph.on( "stabilizationIterationsDone", () => {
			this.isProcessing = false;
			this.progressValue = 0;
		} );
		this.graph.on( "stabilizationProgress", ( params ) => {
			this.progressValue = params.iterations / params.total * 100;
		} );

		this.graph.on( "selectNode", ( params:Properties ) => {
			this._focusOnNode( params.nodes[ 0 ] );
		} );
		this.graph.on( "deselectNode", ( params:Properties ):void => {
			if( params.previousSelection ) this._updateDeselectedNode( params.previousSelection.nodes[ 0 ] );
		} );

		this.renderExistingData();

		this.creationSubscription = this.syncService.onDocumentCreated()
			.flatMap( document => this.dataService.resolveDocument( document ) )
			.subscribe( ( document:ProtectedDocument & ( User | BasicCarbonData ) ) => {
				if( document.hasType( VOCAB.User ) ) {
					this.renderUser( document as User );

					this._updateDeselectedNode( this.graph.getSelectedNodes()[ 0 ] as string );
					const focusedNodes:string[] = this._focusOnNode( document.id );
					let ref = setInterval( () => this.graph.fit( { nodes: focusedNodes, animation: false, } ), 1 );
					setTimeout( () => clearInterval( ref ), 5000 );
				} else {
					const type:string = CarbonDataUtils.getPrincipalType( document );
					if( ! type ) return;

					this.renderBasicData( document as BasicCarbonData, type, ContainersData.TYPE_CONTAINER.get( type ), "container" );
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
		this.renderContainer( ContainersData.USERS_SLUG, GraphComponent.getContainerName( ContainersData.USERS_SLUG ) );

		Observable.forkJoin(
			this.dataService.getUsers()
				.map( user => this.renderUser( user ) ),

			...Array.from( ContainersData.CONTAINER_TYPE.keys() )
				.filter( containerSlug =>
					containerSlug !== ContainersData.USERS_SLUG
				)
				.map( ( containerSlug ):[ string, Observable<BasicCarbonData[]> ] => {
					let observable:Observable<BasicCarbonData[]> =
						containerSlug === ContainersData.COUNTRIES_SLUG ? this.dataService.getCountriesData()
							: this.dataService.getBasicData( containerSlug );
					return [ containerSlug, observable ];
				} )
				.map( ( [ containerSlug, observable ]:[ string, Observable<BasicCarbonData[]> ] ) => observable.map( dataArray =>
					this.renderContainerData( dataArray, ContainersData.CONTAINER_TYPE.get( containerSlug ), containerSlug )
				) )
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
		} );
		this.renderEdge( ContainersData.USERS_SLUG, user.id, "contains" );
		this.renderProperties( user );
	}

	private _focusOnNode( nodeID:string ):string[] {
		const relatedNodes:string[] = this._getRelatedNodes( nodeID );

		if( ! ContainersData.CONTAINER_TYPE.has( nodeID ) ) {
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
		this.graph.selectNodes( [ nodeID ] );

		relatedNodes.push( nodeID );
		this.graph.fit( {
			nodes: relatedNodes,
			animation: true,
		} );

		return relatedNodes;
	}

	private renderBasicData( basicData:BasicCarbonData, group:string, container:string, edgeName:string ) {
		this.nodes.add( {
			id: basicData.id,
			label: basicData.name,
			group: group,
		} );
		this.renderEdge( container, basicData.id, edgeName );
		this.renderProperties( basicData );
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
			size: 50,
		} );
	}

	private renderContainerData( dataArray:BasicCarbonData[], group:string, containerSlug:string ):void {
		this.renderContainer( containerSlug, GraphComponent.getContainerName( containerSlug ) );

		dataArray.forEach( data => this.renderBasicData( data, group, containerSlug, "contains" ) );
	}

	private static getContainerName( containerSlug:string ):string {
		return containerSlug.charAt( 0 ).toUpperCase() + containerSlug.slice( 1, - 1 );
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
							this.renderBasicData( data as BasicCarbonData, CarbonDataUtils.getPrincipalType( data ), pointer.id, key );
						} else {
							this.renderEdge( pointer.id, data.id, key );
						}
					} );
			} );
	}

	private _getRelatedNodes( nodeID:string ):string[] {
		return ( this.graph.getConnectedNodes( nodeID ) as string[] )
			.filter( relatedNodeID => ! ContainersData.CONTAINER_TYPE.has( relatedNodeID ) );
	}

	private _updateDeselectedNode( nodeID:string ):void {
		if( ! nodeID ) return;

		const relatedNodes:string[] = this._getRelatedNodes( nodeID );
		if( ! ContainersData.CONTAINER_TYPE.has( nodeID ) ) relatedNodes.push( nodeID );

		relatedNodes.forEach( relatedNodeID => {
			this.nodes.update( { id: relatedNodeID, value: 0 } );
			this.nodes.update( { id: relatedNodeID, value: undefined } );
		} )
	}

}
