import { Component, OnInit } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component( {
	selector: 'app-form-fail-dialog',
	templateUrl: './failDialog.component.html',
	styleUrls: [ "commonDialog.component.scss" ]
} )
export class FailDialog implements OnInit {

	error:string;

	constructor( private dialogRef:MdDialogRef<FailDialog> ) {}

	ngOnInit() {
		this.error = this.dialogRef.config.data.error;
	}

}
