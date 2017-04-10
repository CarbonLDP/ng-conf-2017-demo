import { Component, Inject } from "@angular/core";
import { MD_DIALOG_DATA } from "@angular/material";

interface FailDialogData {
	error:string;
}

@Component( {
	selector: 'app-form-fail-dialog',
	templateUrl: './failDialog.component.html',
	styleUrls: [ "./commonDialog.component.scss" ]
} )
export class FailDialog {

	error:string;

	constructor( @Inject( MD_DIALOG_DATA ) data:FailDialogData ) {
		this.error = data.error;
	}

}
