import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-school-page',
  templateUrl: './create-school-page.component.html',
  styleUrl: './create-school-page.component.scss'
})
export class CreateSchoolPageComponent {
  schoolName: string = '';

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async onCreateClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to create this school?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if ((await this._createSchoolDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  async _createSchoolDetails(): Promise<boolean> {
    interface CurrentBody {
      schoolName: string;
    }
    var body: CurrentBody = {
      schoolName: this.schoolName
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/school', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}
