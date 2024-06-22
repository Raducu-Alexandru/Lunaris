import { Component } from '@angular/core';
import { CustomResponseObject, SubjectScholarSituation } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-scholar-situation-page',
	templateUrl: './scholar-situation-page.component.html',
	styleUrl: './scholar-situation-page.component.scss',
})
export class ScholarSituationPageComponent {
	studentUserId: number = null;
	selectedStudentYearId: number = null;
	subjectsScholarSituationPerSemester: SubjectScholarSituation[][] = [];
	media: number = 0;
	totalCredits: number = 0;
	outOfCredits: number = 0;

	constructor(private _authenticateService: AuthenticateService) {}

	async onYearSelectInput(studentYearId: number): Promise<void> {
		this.selectedStudentYearId = studentYearId;
		await this._getStudentScholarSituation();
	}

	private async _getStudentScholarSituation(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + `/get/scholar-situation/${this.selectedStudentYearId}`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		var subjectsScholarSituation: SubjectScholarSituation[] = customResponseObject.data.subjectsScholarSituation;
		var semesterArray: SubjectScholarSituation[] = [];
		var lastSemesterIndex: number = 1;
		this.subjectsScholarSituationPerSemester = [];
		for (var i = 0; i < subjectsScholarSituation.length; i++) {
			if (lastSemesterIndex != subjectsScholarSituation[i].semesterIndex) {
				this.subjectsScholarSituationPerSemester.push(semesterArray);
				semesterArray = [];
				lastSemesterIndex++;
			}
			semesterArray.push(Object.assign({}, subjectsScholarSituation[i]));
		}
		this.subjectsScholarSituationPerSemester.push(semesterArray);
		semesterArray = [];
		this.media = customResponseObject.data.media;
		this.totalCredits = customResponseObject.data.totalCredits;
		this.outOfCredits = customResponseObject.data.outOfCredits;
	}
}
