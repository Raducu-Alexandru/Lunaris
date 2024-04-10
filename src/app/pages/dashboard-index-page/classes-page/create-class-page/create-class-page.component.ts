import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../custom-services/popup/popups.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';
import { CustomResponseObject, StudyYearStudentDetails, SubjectPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { BigLoadingFilterService } from '../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-class-page',
  templateUrl: './create-class-page.component.html',
  styleUrl: './create-class-page.component.scss'
})
export class CreateClassPageComponent implements OnInit {
  subjectsPreviewDetails: SubjectPreviewDetails[] = [];
  classForSubject: boolean = true;
  studyYearId: number = null;
  classSuffix: string = '';
  classPrefix: string = '';
  className: string = '';
  subjectId: number = null;
  userEmail: string = '';
  description: string = '';
  studyYearStudentsDetails: StudyYearStudentDetails[] = [];

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    await this._getSubjectsPreviewDetails();
    this.subjectId = this.subjectsPreviewDetails[0].subjectId;
  }

  async onCreateClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to create this program?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if ((await this._createClass())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  onCheckboxInput(isChecked: boolean): void {
    this.classForSubject = isChecked;
  }

  onStudyYearSelectInput(studyYearId: number): void {
    this.studyYearId = studyYearId;
  }

  async onEmailSearchSubmit(event): Promise<void> {
    event.preventDefault();
    console.log(this.userEmail);
    if (!this.userEmail) {
      this._popupsService.openPopup({
        text: 'Please enter a student email',
        type: 'alert'
      });
      return;
    }
    await this._getUserIdFromEmail(this.userEmail);
    this.userEmail = '';
    console.log(this.studyYearStudentsDetails);
  }

  onStudentDelete(userId: number): void {
    console.log(userId);
    this.studyYearStudentsDetails = this.studyYearStudentsDetails.filter((val: StudyYearStudentDetails) => { val.userId == userId });
  }

  private async _createClass(): Promise<boolean> {
    interface CurrentBody {
      studyYearId: number;
      classSuffix: string;
      classPrefix: string;
      className: string;
      subjectId: number;
      description: string;
      usersIds: number[];
    }
    var usersIds: number[] = [];
    for (var i = 0; i < this.studyYearStudentsDetails.length; i++) {
      usersIds.push(this.studyYearStudentsDetails[i].userId);
    }
    var body: CurrentBody = {
      studyYearId: this.studyYearId,
      classSuffix: this.classSuffix,
      classPrefix: this.classPrefix,
      className: this.className,
      subjectId: this.subjectId,
      description: this.description,
      usersIds: usersIds
    };
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + '/create/class', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  private async _getSubjectsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + '/get/subjects/0');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.subjectsPreviewDetails = customResponseObject.data.subjectsPreviewDetails;
  }

  private async _getUserIdFromEmail(email: string): Promise<void> {
    interface CurrentBody {
      email: string;
    }
    var body: CurrentBody = {
      email: email
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + '/get/user-id/from/email', body);
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
}
