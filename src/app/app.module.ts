import { NgModule } from "@angular/core";
import { FormsModule }   from '@angular/forms';
import { BrowserModule }  from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { MaterialModule } from "@angular/material";

import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular2-carbonldp/services";
import { ActiveContextResolver } from "angular2-carbonldp/resolvers";
import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular2-carbonldp/guards";

import { TextMaskModule } from 'angular2-text-mask';

import { AppComponent } from "app/app.component";
import { FormComponent } from "app/form/form.component";
import { ErrorComponent } from "app/error/error.component";
import { UniqueNicknameDirective } from "app/form/validators/uniqueNickname.directive";

const appRoutes:Routes = [
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
		path: "",
		redirectTo: "/form",
		pathMatch: "full",
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
		ErrorComponent,
		UniqueNicknameDirective,
	],
	providers: [
		CARBON_PROVIDERS,
		CARBON_SERVICES_PROVIDERS,
		ActiveContextResolver,
		AuthenticatedGuard, NotAuthenticatedGuard,
	],
	bootstrap: [ AppComponent ]
} )
export class AppModule {
}