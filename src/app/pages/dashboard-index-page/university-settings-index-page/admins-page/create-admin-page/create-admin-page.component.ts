import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { UserEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-admin-page',
  templateUrl: './create-admin-page.component.html',
  styleUrl: './create-admin-page.component.scss'
})
export class CreateAdminPageComponent {
  adminEditDetails: UserEditDetails = {
    firstName: '',
    lastName: '',
    email: '',
    disabled: false
  };
  password: string = '';
  retypePassword: string = '';

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
    if (!checkIfEmailIsValid(this.adminEditDetails.email)) {
      this._popupsService.openPopup({
        text: 'Please enter a valid email',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    if ((await this._createadminDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  async _createadminDetails(): Promise<boolean> {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string
    }
    var body: CurrentBody = {
      firstName: this.adminEditDetails.firstName,
      lastName: this.adminEditDetails.lastName,
      email: this.adminEditDetails.email,
      password: this.password
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/admin', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}

