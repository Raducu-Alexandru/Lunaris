import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { ActivatedRoute } from '@angular/router';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';
import { AssignmentDetails, CustomResponseObject, FileAssignmentDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../../environments/environment';
import { BigLoadingFilterService } from '../../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { Location } from '@angular/common';

@Component({
	selector: 'app-edit-assignment-page',
	templateUrl: './edit-assignment-page.component.html',
	styleUrl: './edit-assignment-page.component.scss',
})
export class EditAssignmentPageComponent implements OnInit {
	assignmentDetails: AssignmentDetails = {
		classAssigName: '',
		classAssigDesc: '',
		filesIds: [],
		dueDate: 0,
		grade: null,
	};
	classAssigId: number;
	filesAssignmentDetails: FileAssignmentDetails[] = [];
	uploadedFiles: File[] = [];
	name: string = '';
	dueDate: string = '';
	description: string = '';
	currentDate: Date;
	deletedFilesIds: number[] = [];

	constructor(
		private _authenticateService: AuthenticateService,
		private _activatedRoute: ActivatedRoute,
		private _popupsService: PopupsService,
		private _bigLoadingFilterService: BigLoadingFilterService,
		private _location: Location
	) {}

	async ngOnInit(): Promise<void> {
		this.classAssigId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('classAssigId'));
		this.currentDate = new Date();
		await this._getAssigDetails();
		await this._getFilesDetails();
	}

	onFileUpload(file: File): void {
		this.uploadedFiles.push(file);
		console.log(this.uploadedFiles);
	}

	onNewFileDelete(index: number): void {
		this.uploadedFiles = this.uploadedFiles.slice(0, index);
	}

	onFileDelete(index: number): void {
		this.deletedFilesIds.push(this.filesAssignmentDetails[index].fileId);
		this.filesAssignmentDetails = this.filesAssignmentDetails.slice(0, index);
	}

	async onSaveClick(): Promise<void> {
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'alert-confirmation',
			text: 'Are you sure you want to save this assignment?',
		});
		if (popupResult.result != 'yes') {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		if (this.dueDate && new Date(this.dueDate).getTime() <= new Date().getTime()) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Please enter a valid due date',
			});
			this._bigLoadingFilterService.closeFilter();
			return;
		}
		var formData: FormData = new FormData();
		formData.append('name', this.name);
		formData.append('dueDate', String(new Date(this.dueDate).getTime() || 0));
		formData.append('description', this.description);
		formData.append('deletedFilesIds', JSON.stringify(this.deletedFilesIds));
		for (var i = 0; i < this.uploadedFiles.length; i++) {
			formData.append('files', this.uploadedFiles[i]);
		}
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + `/update/assignment/${this.classAssigId}`, formData, {}, false);
		if (this._authenticateService.checkResponse(responseObject)) {
			this._location.back();
		}
		this._bigLoadingFilterService.closeFilter();
	}

	private async _getAssigDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/assignment/${this.classAssigId}`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.assignmentDetails = customResponseObject.data.assignmentDetails;
	}

	private async _getFilesDetails(): Promise<void> {
		interface CurrentBody {
			filesIds: number[];
		}
		var body: CurrentBody = {
			filesIds: [...this.assignmentDetails.filesIds],
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.filesUrl + '/assignment/details', body);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.filesAssignmentDetails = customResponseObject.data.filesAssignmentDetails;
	}
}
