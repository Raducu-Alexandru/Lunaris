import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { BigLoadingFilterService } from '../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { PopupResult, PopupsService } from '../../../../custom-services/popup/popups.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { AddPhotoEventData } from '../../../../components/image-input/image-input.component';

@Component({
  selector: 'app-general-page',
  templateUrl: './general-page.component.html',
  styleUrl: './general-page.component.scss'
})
export class GeneralPageComponent implements OnInit {
  universityLongId: string = '';
  universityName: string = '';
  universityLogoData: AddPhotoEventData = null;
  universityImageUrl: string = environment.cdnUrl + '/static/universities-images/';

  constructor(private _cookieService: CookieService, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.universityLongId = this._cookieService.get('selected-university-long-id');
    if (!this.universityLongId) {
      await this._getUniversityLongId();
    }
    await this._getUniversityName();
  }

  onUniversityLogoInput(data: AddPhotoEventData): void {
    this.universityLogoData = data;
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
    await this._saveUniversitySettings();
    this._bigLoadingFilterService.closeFilter();
  }

  async _saveUniversitySettings(): Promise<boolean> {
    var formData: FormData = new FormData();
    formData.append('universityName', JSON.stringify(this.universityName));
    if (this.universityLogoData) {
      formData.append('universityLogo', this.universityLogoData.blob);
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/university-settings', formData, {}, false);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  async _getUniversityLongId(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/university-long-id');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.universityLongId = customResponseObject.data.universityLongId
  }

  async _getUniversityName(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/university-name');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.universityName = customResponseObject.data.universityName
  }

}
