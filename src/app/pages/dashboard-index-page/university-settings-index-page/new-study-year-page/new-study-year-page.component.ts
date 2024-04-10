import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { CustomResponseObject, StudyYearDetails, StudyYearStudentDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-study-year-page',
  templateUrl: './new-study-year-page.component.html',
  styleUrl: './new-study-year-page.component.scss'
})
export class NewStudyYearPageComponent implements OnInit {
  studyYearDetails: StudyYearDetails;
  selectMode: number = 0;
  studentEmail: string = '';
  studyYearStudentsDetails: StudyYearStudentDetails[] = [];

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    await this._getLastStudyYear();
  }

  onChangeSelectMode(event): void {
    this.selectMode = parseInt(event.target.value);
  }

  async onStudentSearchSubmit(event): Promise<void> {
    event.preventDefault();
    console.log(this.studentEmail);
    if (!this.studentEmail) {
      this._popupsService.openPopup({
        text: 'Please enter a student email',
        type: 'alert'
      });
      return;
    }
    await this._getUserIdFromEmail(this.studentEmail);
    this.studentEmail = '';
    console.log(this.studyYearStudentsDetails);
  }

  onStudentDelete(userId: number): void {
    console.log(userId);
    this.studyYearStudentsDetails = this.studyYearStudentsDetails.filter((val: StudyYearStudentDetails) => { val.userId == userId });
  }

  async onCreateClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to create this study year?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if (this.selectMode == 1 && this.studyYearStudentsDetails.length == 0) {
      this._popupsService.openPopup({
        text: 'Please enter at least one student to be transferred',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    if ((await this._createStudyYearDetails())) {
      this._popupsService.openPopup({
        type: 'checkmark',
        text: 'New study year created',
      });
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  private async _createStudyYearDetails(): Promise<boolean> {
    interface CurrentBody {
      fromYear: number;
      toYear: number;
      selectMode: number;
      studentUserIds: number[];
    }
    var body: CurrentBody = {
      fromYear: this.studyYearDetails.fromYear + 1,
      toYear: this.studyYearDetails.toYear + 1,
      selectMode: this.selectMode,
      studentUserIds: this.studyYearStudentsDetails.map((val: StudyYearStudentDetails) => val.userId)
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/study-year', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  private async _getUserIdFromEmail(email: string): Promise<void> {
    interface CurrentBody {
      email: string;
    }
    var body: CurrentBody = {
      email: email
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/get/student-id/from/email', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    var studyYearStudentDetails: StudyYearStudentDetails = customResponseObject.data.studyYearStudentDetails;
    if (this.studyYearStudentsDetails.find((val: StudyYearStudentDetails) => val.userId == studyYearStudentDetails.userId)) {
      return;
    }
    this.studyYearStudentsDetails.push(studyYearStudentDetails);
  }

  private async _getLastStudyYear(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/study-year');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studyYearDetails = customResponseObject.data.studyYearDetails;
  }
}
