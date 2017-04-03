import { NgModule } from "@angular/core";
import { FormsModule }   from '@angular/forms';
import { BrowserModule }  from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { MaterialModule } from "@angular/material";

import { CARBON_PROVIDERS } from "angular-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular-carbonldp/services";
import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular-carbonldp/guards";

import { TextMaskModule } from 'angular2-text-mask';

import { AppComponent } from "app/app.component";
import { FormComponent } from "app/form/form.component";
import { ErrorComponent } from "app/error/error.component";
import { UniqueNicknameDirective } from "app/form/validators/uniqueNickname.directive";
import { SuccessDialog } from "app/form/dialogs/successDialog.component";
import { FailDialog } from "app/form/dialogs/failDialog.component";
import { GraphComponent } from "app/graph/graph.component";
import { CarbonDataService } from "app/data/carbonData.service";
import { SyncService } from "app/data/sync.service";

const appRoutes:Routes = [
	{
		path: "",
		redirectTo: "/form",
		pathMatch: "full",
	},
	{
		path: "form",
		component: FormComponent,
		canActivate: [ AuthenticatedGuard ],
		data: {
			// AuthenticatedGuard cases
			onReject: [ "/" ],
			onError: [ "/error" ],
		}
	},
	{
		path: "graph",
		component: GraphComponent,
		canActivate: [ AuthenticatedGuard ],
		data: {
			// AuthenticatedGuard cases
			onReject: [ "/" ],
			onError: [ "/error" ],
		}
	},
	{
		path: "error",
		component: ErrorComponent,
	},
	// { path: "**", component: PageNotFoundComponent }
];

@NgModule( {
	imports: [
		MaterialModule,
		BrowserModule,
		FormsModule,
		RouterModule.forRoot( appRoutes ),
		TextMaskModule,
	],
	declarations: [
		AppComponent,
		FormComponent,
		GraphComponent,
		ErrorComponent,
		UniqueNicknameDirective,
		SuccessDialog,
		FailDialog,
	],
	providers: [
		CARBON_PROVIDERS,
		CARBON_SERVICES_PROVIDERS,
		AuthenticatedGuard, NotAuthenticatedGuard,

		CarbonDataService, SyncService,
	],
	entryComponents: [
		SuccessDialog,
		FailDialog,
	],
	bootstrap: [ AppComponent ]
} )
export class AppModule {
}