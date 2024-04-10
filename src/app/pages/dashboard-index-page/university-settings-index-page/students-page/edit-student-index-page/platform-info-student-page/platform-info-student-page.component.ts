import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject, UserEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-platform-info-student-page',
  templateUrl: './platform-info-student-page.component.html',
  styleUrl: './platform-info-student-page.component.scss'
})
export class PlatformInfoStudentPageComponent implements OnInit {
  studentUserId: number = null;
  studentEditDetails: UserEditDetails = null;
  copyStudentEditDetails: UserEditDetails = null;
  newPassword: string = '';
  retypeNewPassword: string = '';

  constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.studentUserId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('studentUserId'));
    await this._getStudentDetails();
  }

  async onSaveClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to save?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if (this.newPassword != this.retypeNewPassword) {
      this._popupsService.openPopup({
        text: 'The password do not match',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    if (!checkIfEmailIsValid(this.studentEditDetails.email)) {
      this._popupsService.openPopup({
        text: 'Please enter a valid email',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    await this._saveStudentDetails();
    this._bigLoadingFilterService.closeFilter();
  }

  onDisableInput(isChecked: boolean): void {
    this.studentEditDetails.disabled = isChecked;
  }

  async _getStudentDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/student/${this.studentUserId}/platform-info`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studentEditDetails = customResponseObject.data.studentEditDetails;
    this.copyStudentEditDetails = Object.assign({}, this.studentEditDetails);
  }

  async _saveStudentDetails(): Promise<boolean> {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      disabled: boolean,
      studentUserId: number
    }
    var body: CurrentBody = {
      firstName: this.copyStudentEditDetails.firstName == this.studentEditDetails.firstName ? '' : this.studentEditDetails.firstName,
      lastName: this.copyStudentEditDetails.lastName == this.studentEditDetails.lastName ? '' : this.studentEditDetails.lastName,
      email: this.copyStudentEditDetails.email == this.studentEditDetails.email ? '' : this.studentEditDetails.email,
      password: this.newPassword,
      disabled: this.studentEditDetails.disabled,
      studentUserId: this.studentUserId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/student/platform-info', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}

