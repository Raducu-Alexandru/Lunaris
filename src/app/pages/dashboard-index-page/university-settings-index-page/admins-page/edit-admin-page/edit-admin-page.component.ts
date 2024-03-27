import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject, UserEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';

@Component({
  selector: 'app-edit-admin-page',
  templateUrl: './edit-admin-page.component.html',
  styleUrl: './edit-admin-page.component.scss'
})
export class EditAdminPageComponent implements OnInit {
  adminUserId: number = null;
  adminEditDetails: UserEditDetails = null;
  copyadminEditDetails: UserEditDetails = null;
  newPassword: string = '';
  retypeNewPassword: string = '';
  disabled: boolean = false;

  constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.adminUserId = parseInt(this._activatedRoute.snapshot.paramMap.get('adminUserId'));
    await this._getadminDetails();
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
    if (this.newPassword != this.retypeNewPassword) {
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
    await this._saveadminDetails();
    this._bigLoadingFilterService.closeFilter();
  }

  onDisableInput(isChecked: boolean): void {
    this.disabled = isChecked;
  }

  async _getadminDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/admin/' + this.adminUserId);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.adminEditDetails = customResponseObject.data.adminEditDetails;
    this.copyadminEditDetails = Object.assign({}, this.adminEditDetails);
    this.disabled = this.adminEditDetails.disabled;
  }

  async _saveadminDetails(): Promise<boolean> {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      disabled: boolean,
      adminUserId: number
    }
    var body: CurrentBody = {
      firstName: this.copyadminEditDetails.firstName == this.adminEditDetails.firstName ? '' : this.adminEditDetails.firstName,
      lastName: this.copyadminEditDetails.lastName == this.adminEditDetails.lastName ? '' : this.adminEditDetails.lastName,
      email: this.copyadminEditDetails.email == this.adminEditDetails.email ? '' : this.adminEditDetails.email,
      password: this.newPassword,
      disabled: this.disabled,
      adminUserId: this.adminUserId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/admin', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}
