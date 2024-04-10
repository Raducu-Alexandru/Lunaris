import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, ProgramEditDetails, ProgramYearEditDetails, SchoolPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { YearSubjectPreviewDetails } from '../../../../../components/create-program-year/create-program-year.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-program-page',
  templateUrl: './create-program-page.component.html',
  styleUrl: './create-program-page.component.scss'
})
export class CreateProgramPageComponent implements OnInit {
  programEditDetails: ProgramEditDetails = {
    programName: '',
    programType: 'Bachelor',
    programShortName: '',
    archived: false,
    schoolId: null,
  }
  years: YearSubjectPreviewDetails[][] = [];
  schoolsPreviewDetails: SchoolPreviewDetails[] = [];

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _activatedRoute: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    await this._getSchoolsPreviewDetails();
    this.programEditDetails.schoolId = parseInt(this._activatedRoute.snapshot.queryParamMap.get('schoolId')) || null;
    if (!this.programEditDetails.schoolId) {
      this.programEditDetails.schoolId = this.schoolsPreviewDetails[0].schoolId;
    }
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
    if ((await this._createProgramDetails())) {
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

  async _createProgramDetails(): Promise<boolean> {
    interface CurrentBody {
      programName: string;
      programShortName: string;
      programType: string;
      schoolId: number;
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
      programName: this.programEditDetails.programName,
      programShortName: this.programEditDetails.programShortName,
      programType: this.programEditDetails.programType,
      schoolId: parseInt(String(this.programEditDetails.schoolId)),
      years: parsedYears
    };
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/program', body);
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
}
