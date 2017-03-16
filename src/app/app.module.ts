import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { }   from '@angular/forms';
import { BrowserModule }  from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { MaterialModule } from "@angular/material";

import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";

import { AppComponent } from "app/app.component";
import { FormComponent } from "app/form/form.component";

const appRoutes:Routes = [
	{ path: "form", component: FormComponent },
	{
		path: "",
		redirectTo: "/form",
		pathMatch: "full",
	},
	// { path: "**", component: PageNotFoundComponent }
];

@NgModule( {
	imports: [
		MaterialModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forRoot( appRoutes ),
	],
	declarations: [
		AppComponent,
		FormComponent,
	],
	providers: [
		CARBON_PROVIDERS,
	],
	bootstrap: [ AppComponent ]
} )
export class AppModule {
}