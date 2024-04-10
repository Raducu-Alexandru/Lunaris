import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ProgamPreviewDetails, StudentProgramPreviewDetails, UserEditDetails, YearPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { environment } from '../../../../../../environments/environment';
import { ResponseObject } from '../../../../../services/cryptography-network.service';

@Component({
  selector: 'app-create-student-page',
  templateUrl: './create-student-page.component.html',
  styleUrl: './create-student-page.component.scss'
})
export class CreateStudentPageComponent {
  studentEditDetails: UserEditDetails = {
    firstName: '',
    lastName: '',
    email: '',
    disabled: false
  };
  password: string = '';
  retypePassword: string = '';
  studentProgramsPreviewDetails: StudentProgramPreviewDetails[] = [];
  yearIds: number[] = [];

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async onCreateClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to create this account?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if (this.password != this.retypePassword) {
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
    if (this.yearIds.length == 0) {
      this._popupsService.openPopup({
        text: 'Please select at least one program',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    if ((await this._createStudentDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  async onAddProgramClick(): Promise<void> {
    var ignoreProgramIds: number[] = [];
    for (var i = 0; i < this.studentProgramsPreviewDetails.length; i++) {
      ignoreProgramIds.push(this.studentProgramsPreviewDetails[i].programId);
    }
    console.log(ignoreProgramIds);
    var popupResult: PopupResult = await this._popupsService.openPopup({
      type: 'select-program-year',
      text: 'Select the program and year to add',
      data: {
        ignoreProgramIds: ignoreProgramIds
      }
    });
    console.log(popupResult);
    if (popupResult.result != 'submit') {
      return;
    }
    var selectedProgram: ProgamPreviewDetails = popupResult.data.selectedProgram;
    var selectedYear: YearPreviewDetails = popupResult.data.selectedYear;
    this.studentProgramsPreviewDetails.push({
      programId: selectedProgram.programId,
      programName: selectedProgram.programName + ` (${selectedProgram.programType})`,
      yearIndex: selectedYear.yearIndex
    });
    this.yearIds.push(selectedYear.yearId);
  }

  async _createStudentDetails(): Promise<boolean> {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      yearIds: number[];
    }
    var body: CurrentBody = {
      firstName: this.studentEditDetails.firstName,
      lastName: this.studentEditDetails.lastName,
      email: this.studentEditDetails.email,
      password: this.password,
      yearIds: this.yearIds
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/student', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}


