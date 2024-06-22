import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../../environments/environment';
import { CustomResponseObject, SubjectScholarSituation } from '@raducualexandrumircea/lunaris-interfaces';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../../custom-services/big-loading-filter/big-loading-filter.service';

@Component({
	selector: 'app-scholar-situation-student-page',
	templateUrl: './scholar-situation-student-page.component.html',
	styleUrl: './scholar-situation-student-page.component.scss',
})
export class ScholarSituationStudentPageComponent implements OnInit {
	studentUserId: number = null;
	selectedStudentYearId: number = null;
	subjectsScholarSituationPerSemester: SubjectScholarSituation[][] = [];
	media: number = 0;
	totalCredits: number = 0;
	outOfCredits: number = 0;
	excelDownloadUrl: string;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _authenticateService: AuthenticateService,
		private _popupsService: PopupsService,
		private _bigLoadingFilterService: BigLoadingFilterService
	) {}

	async ngOnInit(): Promise<void> {
		this.studentUserId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('studentUserId'));
	}

	async onYearSelectInput(studentYearId: number): Promise<void> {
		this.selectedStudentYearId = studentYearId;
		this.excelDownloadUrl = environment.universitySettingsUrl + `/excel/student/scholar-situation/${this.selectedStudentYearId}`;
		await this._getStudentScholarSituation();
	}

	async onEditGradeClick(subjectId: number, isInserting: boolean): Promise<void> {
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'number-input',
			text: 'Change grade',
		});
		if (!(popupResult.result == 'submit' && popupResult.data.inputNumber)) {
			return;
		}
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		var grade: number = popupResult.data.inputNumber;
		if (grade > 10 || grade == 0 || isNaN(grade)) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Can not have a grade bigger than 10 or equal to 0',
			});
			return;
		}
		if (String(grade).split('.')[1]?.length > 2) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Can not have a grade with more than 2 decimal points',
			});
			return;
		}
		this._bigLoadingFilterService.openFilter();
		if (await this._changeStudentGrade(subjectId, isInserting, grade)) {
			await this._getStudentScholarSituation();
		}
		this._bigLoadingFilterService.closeFilter();
	}

	private async _changeStudentGrade(subjectId: number, isInserting: boolean, grade: number): Promise<boolean> {
		interface CurrentBody {
			studentYearId: number;
			subjectId: number;
			grade: number;
			isInserting: boolean;
		}
		var body: CurrentBody = {
			studentYearId: this.selectedStudentYearId,
			subjectId: subjectId,
			grade: grade,
			isInserting: isInserting,
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/scholar-situation', body);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return false;
		}
		return true;
	}

	private async _getStudentScholarSituation(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/scholar-situation/${this.selectedStudentYearId}`);
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
