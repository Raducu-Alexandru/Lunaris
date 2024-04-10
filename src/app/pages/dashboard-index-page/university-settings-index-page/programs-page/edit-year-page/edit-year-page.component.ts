import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ActivatedRoute } from '@angular/router';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { CustomResponseObject, YearEditDetails } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
  selector: 'app-edit-year-page',
  templateUrl: './edit-year-page.component.html',
  styleUrl: './edit-year-page.component.scss'
})
export class EditYearPageComponent implements OnInit {
  programId: number;
  yearId: number;
  yearEditDetails: YearEditDetails[];
  yearIndex: number = 0;

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _activatedRoute: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    this.yearId = parseInt(this._activatedRoute.snapshot.paramMap.get('yearId'));
    await this._getYearEditDetails();
  }

  onGoBackClick() {
    this._location.back();
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
    if ((await this._updateYearDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  private async _updateYearDetails(): Promise<boolean> {
    interface CurrentBody {
      yearId: number;
      year: YearEditDetails[]
    }
    var body: CurrentBody = {
      yearId: this.yearId,
      year: this.yearEditDetails
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/year', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  private async _getYearEditDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/year/${this.yearId}`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.yearEditDetails = customResponseObject.data.yearEditDetails;
    this.yearIndex = customResponseObject.data.yearIndex;
  }

}
