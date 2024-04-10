import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, ProgramEditDetails, ProgramYearEditDetails, SchoolPreviewDetails, YearPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { YearSubjectPreviewDetails } from '../../../../../components/create-program-year/create-program-year.component';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { Location } from '@angular/common';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ActivatedRoute } from '@angular/router';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-edit-program-page',
  templateUrl: './edit-program-page.component.html',
  styleUrl: './edit-program-page.component.scss'
})
export class EditProgramPageComponent implements OnInit {
  programEditDetails: ProgramEditDetails;
  programId: number = null;
  selectedSchoolName: string = '';
  yearsPreviewDetails: YearPreviewDetails[] = [];
  years: YearSubjectPreviewDetails[][] = [];
  schoolsPreviewDetails: SchoolPreviewDetails[] = [];

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _activatedRoute: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    this.programId = parseInt(this._activatedRoute.snapshot.paramMap.get('programId'));
    await this._getSchoolsPreviewDetails();
    await this._getProgramEditDetails();
    await this._getYearPreviewDetails();
    this.selectedSchoolName = this.schoolsPreviewDetails.find((val) => {
      return val.schoolId == this.programEditDetails.schoolId
    }).schoolName;
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
    if ((await this._updateProgramDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  onAddYearClick(): void {
    this.years.push([]);
  }

  onDeleteYear(index: number): void {
    this.years = this.years.filter((val, i) => i != index);
  }

  onYearInput(value: YearSubjectPreviewDetails[], index: number): void {
    this.years[index].splice(0, this.years[index].length);
    this.years[index].push(...value);
    console.log(this.years)
  }

  onArchiveInput(isChecked: boolean): void {
    this.programEditDetails.archived = isChecked;
  }

  async _updateProgramDetails(): Promise<boolean> {
    interface CurrentBody {
      programId: number;
      programName: string;
      programShortName: string;
      programType: string;
      schoolId: number;
      archived: boolean;
      years: ProgramYearEditDetails[];
    }
    var parsedYears: ProgramYearEditDetails[] = [];
    for (var i = 0; i < this.years.length; i++) {
      parsedYears.push([]);
      for (var j = 0; j < this.years[i].length; j++) {
        parsedYears[i].push({
          subjectId: this.years[i][j].subjectId,
          semesterIndex: this.years[i][j].semesterIndex,
        });
      }
    }
    var body: CurrentBody = {
      programId: this.programId,
      programName: this.programEditDetails.programName,
      programShortName: this.programEditDetails.programShortName,
      programType: this.programEditDetails.programType,
      schoolId: parseInt(String(this.programEditDetails.schoolId)),
      years: parsedYears,
      archived: this.programEditDetails.archived
    };
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/program', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  async _getSchoolsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/schools');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.schoolsPreviewDetails = customResponseObject.data.schoolsPreviewDetails;
  }

  async _getProgramEditDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/program/${this.programId}`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.programEditDetails = customResponseObject.data.programEditDetails;
  }

  async _getYearPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/years/${this.programId}`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.yearsPreviewDetails = customResponseObject.data.yearsPreviewDetails;
  }
}
