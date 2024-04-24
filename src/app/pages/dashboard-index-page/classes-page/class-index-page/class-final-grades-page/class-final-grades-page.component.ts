import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { ClassFinalGradeDetails, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
	selector: 'app-class-final-grades-page',
	templateUrl: './class-final-grades-page.component.html',
	styleUrl: './class-final-grades-page.component.scss',
})
export class ClassFinalGradesPageComponent implements OnInit {
	classId: number;
	searchedValue: string = '';
	classFinalGradesDetails: ClassFinalGradeDetails[] = [];
	filteredClassFinalGradesDetails: ClassFinalGradeDetails[] = [];

	constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService) {}

	async ngOnInit(): Promise<void> {
		this.classId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('classId'));
		await this._getClassFinalGradesDetails();
	}

	onEmailSearchInput(): void {
		this.filteredClassFinalGradesDetails = [];
		for (var student of this.classFinalGradesDetails) {
			if (student.email.toLowerCase().includes(this.searchedValue.toLowerCase())) {
				this.filteredClassFinalGradesDetails.push(Object.assign({}, student));
			}
		}
	}

	async onGradeChangeClick(index: number): Promise<void> {
		var classFinalGradeDetails: ClassFinalGradeDetails = this.searchedValue ? this.filteredClassFinalGradesDetails[index] : this.classFinalGradesDetails[index];
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'number-input',
			text: classFinalGradeDetails.grade ? 'Change the grade' : 'Add a grade',
		});
		if (popupResult.result != 'submit') {
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
		if (String(grade).includes('.') && grade * 100 != parseInt(String(grade).replaceAll('.', ''))) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Can not have a grade with more than 2 decimal points',
			});
			return;
		}
		if (await this._updateGrade(classFinalGradeDetails.userId, grade)) {
			this.searchedValue = '';
			await this._getClassFinalGradesDetails();
		}
	}

	private async _updateGrade(studentUserId: number, grade: number): Promise<boolean> {
		interface CurrentBody {
			classId: number;
			grade: number;
			studentUserId: number;
		}
		var body: CurrentBody = {
			classId: this.classId,
			grade: grade,
			studentUserId: studentUserId,
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + '/update/class/final-grade', body);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return false;
		}
		return true;
	}

	private async _getClassFinalGradesDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/class/${this.classId}/final-grades`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.classFinalGradesDetails = customResponseObject.data.classFinalGradesDetails;
	}
}
