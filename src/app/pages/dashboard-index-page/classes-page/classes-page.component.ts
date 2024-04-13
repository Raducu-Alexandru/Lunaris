import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { UserRoleService } from '../../../custom-services/user-role/user-role.service';
import {
	ClassPreviewDetails,
	CustomResponseObject,
} from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-classes-page',
	templateUrl: './classes-page.component.html',
	styleUrl: './classes-page.component.scss',
})
export class ClassesPageComponent implements OnInit {
	searchedValue: string = '';
	classesPreviewDetails: ClassPreviewDetails[] = [];
	filteredClassesPreviewDetails: ClassPreviewDetails[] = [];
	userRole: number = 0;

	constructor(
		private _authenticateService: AuthenticateService,
		private _userRoleService: UserRoleService
	) {}

	async ngOnInit(): Promise<void> {
		this.userRole = await this._userRoleService.getUserRole();
	}

	async onStudyYearSelectInput(studyYearId: number): Promise<void> {
		await this._getClassesPreviewDetailsByStudyYear(studyYearId);
	}

	async onStudentYearSelectInput(studentYearId: number): Promise<void> {
		await this._getClassesPreviewDetailsByStudentYearId(studentYearId);
	}

	onNameSearchInput(event): void {
		this.searchedValue = event.target.value;
		this.filteredClassesPreviewDetails = [];
		for (var classObj of this.classesPreviewDetails) {
			if (classObj.className.toLowerCase().includes(this.searchedValue.toLowerCase())) {
				this.filteredClassesPreviewDetails.push(Object.assign({}, classObj));
			}
		}
	}

	private async _getClassesPreviewDetailsByStudyYear(studyYearId: number): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(
			environment.classesUrl + `/get/classes/study-year-id/${studyYearId}`
		);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.classesPreviewDetails = customResponseObject.data.classesPreviewDetails;
	}

	private async _getClassesPreviewDetailsByStudentYearId(studentYearId: number): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(
			environment.classesUrl + `/get/classes/student-year-id/${studentYearId}`
		);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.classesPreviewDetails = customResponseObject.data.classesPreviewDetails;
	}
}
