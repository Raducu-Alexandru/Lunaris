import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, StudentProgramPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../../environments/environment';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { ActivatedRoute } from '@angular/router';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-programs-student-page',
  templateUrl: './programs-student-page.component.html',
  styleUrl: './programs-student-page.component.scss'
})
export class ProgramsStudentPageComponent implements OnInit {
  studentUserId: number;
  searchedValue: string = '';
  studentProgramsPreviewDetails: StudentProgramPreviewDetails[] = [];
  filteredStudentProgramsPreviewDetails: StudentProgramPreviewDetails[] = [];

  constructor(private _authenticateService: AuthenticateService, private _activatedRoute: ActivatedRoute, private _popupsService: PopupsService) { }

  async ngOnInit(): Promise<void> {
    this.studentUserId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('studentUserId'));
    await this._getStudentProgramsPreviewDetails();
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
    if (popupResult.result == 'submit' && popupResult.data.selectedYear) {
      if ((await this._addStudentProgram(popupResult.data.selectedYear.yearId))) {
        await this._getStudentProgramsPreviewDetails();
      }
    }
  }

  onNameSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredStudentProgramsPreviewDetails = [];
    for (var program of this.studentProgramsPreviewDetails) {
      if (program.programName.toLowerCase().includes(this.searchedValue.toLowerCase())) {
        this.filteredStudentProgramsPreviewDetails.push(Object.assign({}, program));
      }
    }
  }

  async _addStudentProgram(yearId: number): Promise<boolean> {
    interface CurrentBody {
      yearId: number;
      studentUserId: number;
    }
    var body: CurrentBody = {
      yearId: yearId,
      studentUserId: this.studentUserId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/student/program', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  async _getStudentProgramsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/student/${this.studentUserId}/programs`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studentProgramsPreviewDetails = customResponseObject.data.studentProgramsPreviewDetails;
  }
}
