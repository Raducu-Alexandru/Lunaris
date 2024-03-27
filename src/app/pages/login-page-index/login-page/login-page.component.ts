import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { checkIfEmailIsValid, checkIfPasswordIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { PopupsService } from '../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../custom-services/big-loading-filter/big-loading-filter.service';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { CustomResponseObject, DeviceTypes } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  universityLongId: string = '';
  universityImageUrl: string = environment.cdnUrl + '/static/universities-images/';
  email: string = '';
  password: string = '';
  isSending: boolean = false;

  constructor(private _cookieService: CookieService, private _router: Router, private _activatedRoute: ActivatedRoute, private _popupService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _authenticateService: AuthenticateService) { }
  ngOnInit(): void {
    this.universityLongId = this._cookieService.get('selected-university-long-id');
    console.log(this.universityLongId);
    if (!this.universityLongId) {
      this._router.navigate(['change-university'], { relativeTo: this._activatedRoute });
    }
  }

  async onFormSubmit(event): Promise<void> {
    event.preventDefault();
    if (!checkIfEmailIsValid(this.email)) {
      this._popupService.openPopup({
        type: 'alert',
        text: 'Please enter a valid email address'
      });
      return;
    }
    if (!checkIfPasswordIsValid(this.password)) {
      this._popupService.openPopup({
        type: 'alert',
        text: 'Please enter a valid password'
      });
      return;
    }
    if (this.isSending) {
      return;
    }
    this.isSending = true;
    this._bigLoadingFilterService.openFilter();
    if ((await this._sendCredentials())) {
      this._authenticateService.navigateToLoggedInRedirectPage();
    }
    this.isSending = false;
    this._bigLoadingFilterService.closeFilter();
  }

  private async _sendCredentials(): Promise<boolean> {
    interface CurrentBody {
      email: string;
      password: string;
      universityLongId: string;
      deviceType: DeviceTypes;
      deviceToken: string;
    }
    var body: CurrentBody = {
      email: this.email,
      password: this.password,
      universityLongId: this.universityLongId,
      deviceType: 'web',
      deviceToken: null
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.loginUrl + '/credentials', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    return customResponseObject.loggedIn ? true : false;
  }
}
