import { Component, OnInit } from '@angular/core';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../custom-services/big-loading-filter/big-loading-filter.service';
import { environment } from '../../../../environments/environment';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
  selector: 'app-personal-details-page',
  templateUrl: './personal-details-page.component.html',
  styleUrl: './personal-details-page.component.scss'
})
export class PersonalDetailsPageComponent implements OnInit {
  website: string = '';
  publicEmail: string = '';
  description: string = '';

  constructor(private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }


  async ngOnInit(): Promise<void> {
    await this._getPersonalDetails();
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
    await this._savePersonalDetails();
    this._bigLoadingFilterService.closeFilter();
  }

  async _savePersonalDetails(): Promise<boolean> {
    interface CurrentBody {
      website: string;
      publicEmail: string;
      description: string;
    }
    var body: CurrentBody = {
      website: this.website,
      publicEmail: this.publicEmail,
      description: this.description,
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.userDetailsUrl + '/update/personal-details', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  async _getPersonalDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + '/get/personal-details');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.website = customResponseObject.data.website;
    this.publicEmail = customResponseObject.data.publicEmail;
    this.description = customResponseObject.data.description;
  }
}
