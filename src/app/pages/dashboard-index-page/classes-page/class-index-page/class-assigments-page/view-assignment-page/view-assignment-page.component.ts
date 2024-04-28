import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssignmentDetails, CustomResponseObject, FileAssignmentDetails, HandInAssignmentDetails, HandedInAssignmentDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../../environments/environment';
import { UserRoleService } from '../../../../../../custom-services/user-role/user-role.service';
import { BigLoadingFilterService } from '../../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';

@Component({
	selector: 'app-view-assignment-page',
	templateUrl: './view-assignment-page.component.html',
	styleUrl: './view-assignment-page.component.scss',
})
export class ViewAssignmentPageComponent implements OnInit {
	assignmentDetails: AssignmentDetails = {
		classAssigName: '',
		classAssigDesc: '',
		filesIds: [],
		dueDate: 0,
		grade: null,
	};
	classAssigId: number;
	currentTimestamp: number;
	userRole: number = 0;
	filesAssignmentDetails: FileAssignmentDetails[] = [];
	downloadUrl: string = environment.filesUrl + '/assignment/download';
	userDownloadUrl: string = environment.filesUrl + '/assignment/user/download';
	excelDownloadUrl: string = environment.classesUrl;
	userAllDownloadUrl: string = environment.filesUrl;
	userFilesAssignmentDetails: FileAssignmentDetails[] = [];
	handInAssignmentDetails: HandInAssignmentDetails = {
		handedInDate: null,
		filesIds: [],
	};
	handedInsAssignmentDetails: HandedInAssignmentDetails[] = [];
	filteredHandedInsAssignmentDetails: HandedInAssignmentDetails[] = [];
	searchedValue: string = '';

	constructor(
		private _authenticateService: AuthenticateService,
		private _activatedRoute: ActivatedRoute,
		private _userRoleService: UserRoleService,
		private _bigLoadingFilterService: BigLoadingFilterService,
		private _popupsService: PopupsService
	) {}

	async ngOnInit(): Promise<void> {
		this.classAssigId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('classAssigId'));
		this.userAllDownloadUrl += `/assignment/${this.classAssigId}/user/download/all`;
		this.excelDownloadUrl += `/excel/assignment/${this.classAssigId}/grades`;
		this.currentTimestamp = new Date().getTime();
		this.userRole = await this._userRoleService.getUserRole();
		await this._getAssigDetails();
		await this._getFilesDetails();
		if (this.userRole == 1) {
			await this._getAssigHandInDetails();
		} else {
			await this._getAssigHandedInsDetails();
		}
	}

	onEmailSearchInput(event): void {
		this.searchedValue = event.target.value;
		this.filteredHandedInsAssignmentDetails = [];
		for (var student of this.handedInsAssignmentDetails) {
			if (student.email.toLowerCase().includes(this.searchedValue.toLowerCase())) {
				this.filteredHandedInsAssignmentDetails.push(Object.assign({}, student));
			}
		}
	}

	async onChangeGrade(userId: number, grade: number): Promise<void> {
		interface CurrentBody {
			userId: number;
			grade: number;
		}
		var body: CurrentBody = {
			userId: userId,
			grade: grade,
		};
		var filesResponseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + `/update/assignment/${this.classAssigId}/grade`, body);
		if (this._authenticateService.checkResponse(filesResponseObject)) {
			try {
				this.handedInsAssignmentDetails.find((handIn) => handIn.userId == userId).grade = grade;
			} catch (err) {
				console.log(err);
			}
			try {
				this.filteredHandedInsAssignmentDetails.find((handIn) => handIn.userId == userId).grade = grade;
			} catch (err) {
				console.log(err);
			}
		}
	}

	async onHandInClick(): Promise<void> {
		if (this.assignmentDetails.grade != null) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'You can not undo the hand in after the assignment has been graded',
			});
			return;
		}
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'alert-confirmation',
			text: this.handInAssignmentDetails.handedInDate == null ? 'Are you sure you want to hand in?' : 'Are you sure you want to undo hand in?',
		});
		if (popupResult.result != 'yes') {
			return;
		}
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		interface CurrentBody {
			handIn: boolean;
		}
		var body: CurrentBody = {
			handIn: this.handInAssignmentDetails.handedInDate == null ? true : false,
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + `/update/assignment/${this.classAssigId}/hand-in`, body);
		if (this._authenticateService.checkResponse(responseObject)) {
			var customResponseObject: CustomResponseObject = responseObject.data;
			this.handInAssignmentDetails.handedInDate = customResponseObject.data.handedInDate;
		}
		this._bigLoadingFilterService.closeFilter();
	}

	async onFileUpload(file: File): Promise<void> {
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		var formData: FormData = new FormData();
		formData.append('file', file);
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + `/upload/assignment/${this.classAssigId}/user-file`, formData, {}, false);
		if (this._authenticateService.checkResponse(responseObject)) {
			var customResponseObject: CustomResponseObject = responseObject.data;
			this.userFilesAssignmentDetails.push(customResponseObject.data.fileAssignmentDetails);
		}
		this._bigLoadingFilterService.closeFilter();
	}

	async onFileDelete(index: number): Promise<void> {
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'alert-confirmation',
			text: 'Are you sure you want to delete this file?',
		});
		if (popupResult.result != 'yes') {
			return;
		}
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(
			environment.classesUrl + `/delete/assignment/${this.classAssigId}/user-file/${this.userFilesAssignmentDetails[index].fileId}`
		);
		if (this._authenticateService.checkResponse(responseObject)) {
			this.userFilesAssignmentDetails = this.userFilesAssignmentDetails.filter((val, i) => i !== index);
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

	private async _getAssigHandedInsDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/assignment/${this.classAssigId}/handed-ins`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.handedInsAssignmentDetails = customResponseObject.data.handedInsAssignmentDetails;
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

	private async _getAssigHandInDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/assignment/${this.classAssigId}/hand-in-details`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.handInAssignmentDetails = customResponseObject.data.handInAssignmentDetails;
		if (this.handInAssignmentDetails.filesIds.length == 0) {
			return;
		}
		interface CurrentBody {
			filesIds: number[];
		}
		var body: CurrentBody = {
			filesIds: this.handInAssignmentDetails.filesIds,
		};
		var filesResponseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.filesUrl + '/assignment/user/details', body);
		if (!this._authenticateService.checkResponse(filesResponseObject)) {
			return null;
		}
		var filesCustomResponseObject: CustomResponseObject = filesResponseObject.data;
		this.userFilesAssignmentDetails = filesCustomResponseObject.data.filesAssignmentDetails;
	}
}
