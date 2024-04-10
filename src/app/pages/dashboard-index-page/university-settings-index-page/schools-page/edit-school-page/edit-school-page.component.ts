import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject, SchoolEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-edit-school-page',
  templateUrl: './edit-school-page.component.html',
  styleUrl: './edit-school-page.component.scss'
})
export class EditSchoolPageComponent implements OnInit {
  schoolId: number = null;
  schoolEditDetails: SchoolEditDetails = null;

  constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.schoolId = parseInt(this._activatedRoute.snapshot.paramMap.get('schoolId'));
    await this._getSchoolDetails();
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
    await this._saveSchoolDetails();
    this._bigLoadingFilterService.closeFilter();
  }

  async _getSchoolDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/school/' + this.schoolId);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.schoolEditDetails = customResponseObject.data.schoolEditDetails;
  }

  async _saveSchoolDetails(): Promise<boolean> {
    interface CurrentBody {
      schoolName: string;
      schoolId: number
    }
    var body: CurrentBody = {
      schoolName: this.schoolEditDetails.schoolName,
      schoolId: this.schoolId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/school', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}

