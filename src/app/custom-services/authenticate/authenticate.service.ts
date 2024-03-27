import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PopupConfig, PopupsService } from '../popup/popups.service';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { CryptographyNetworkService, ResponseObject } from '../../services/cryptography-network.service';
import { SocketService } from '../../services/socket.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticateService {
  onLogoutSubject: Subject<void> = new Subject<void>();

  constructor(
    private _router: Router,
    private _cryptographyNetworkService: CryptographyNetworkService,
    private _socketService: SocketService,
    private _popupsService: PopupsService,
    @Inject('notLoggedInRedirectPageArray') private _notLoggedInRedirectPageArray: string[],
    @Inject('loggedInRedirectPageArray') private _loggedInRedirectPageArray: string[],
    @Inject('loginUrl') private _loginUrl: string,
  ) { }

  async sendGetReq(url: string, headers: { [id: string]: string } = {}, useJson: boolean = true): Promise<ResponseObject> {
    var response: ResponseObject = await this._cryptographyNetworkService.sendGetReq(url, headers, useJson);
    var data: CustomResponseObject = response.data;
    if (data.loggedIn == false) {
      this._socketService.disconnectSocket();
      this.navigateToNotLoggedInRedirectPage();
    }
    if (data.disabled == true) {
      await this.logout();
    }
    return response;
  }

  async sendPostReq(url: string, payload: any, headers: { [id: string]: string } = {}, useJson: boolean = true): Promise<ResponseObject> {
    var response: ResponseObject = await this._cryptographyNetworkService.sendPostReq(url, payload, headers, useJson);
    var data: CustomResponseObject = response.data;
    if (data.loggedIn == false) {
      this._socketService.disconnectSocket();
      this.navigateToNotLoggedInRedirectPage();
    }
    if (data.disabled == true) {
      await this.logout();
    }
    return response;
  }

  async checkIfLoggedIn(): Promise<boolean> {
    var response: ResponseObject = await this._cryptographyNetworkService.sendGetReq(this._loginUrl + '/check-logged-in');
    var data: CustomResponseObject = response.data;
    if (data.succ == false || data.loggedIn == false) {
      console.log(data.debugMes);
      this._socketService.disconnectSocket();
      return false;
    }
    return true;
  }

  async logout(): Promise<void> {
    var response: ResponseObject = await this._cryptographyNetworkService.sendGetReq(this._loginUrl + '/logout');
    var data: CustomResponseObject = response.data;
    if (data.succ == false) {
      console.log(data.debugMes);
    }
    if (data.loggedIn == false) {
      this._socketService.disconnectSocket();
      this.navigateToNotLoggedInRedirectPage();
      this.onLogoutSubject.next();
    }
  }

  checkResponse(response: ResponseObject, showPopup: boolean = true): boolean {
    console.log(response);
    var popupConfig: PopupConfig = {
      type: 'alert',
      text: String(response.err) || 'Something went wrong!'
    }
    if (!response.succ) {
      if (showPopup) {
        this._popupsService.openPopup(popupConfig);
      }
      return false;
    }
    var payload: CustomResponseObject = response.data;
    popupConfig = {
      type: 'alert',
      text: payload.mes || payload.debugMes || 'Something went wrong!'
    }
    if (!payload.succ) {
      if (showPopup) {
        this._popupsService.openPopup(popupConfig);
      }
      return false;
    }
    return true;
  }

  navigateToNotLoggedInRedirectPage(): void {
    this._router.navigate(this._notLoggedInRedirectPageArray);
  }

  navigateToLoggedInRedirectPage(): void {
    this._router.navigate(this._loggedInRedirectPageArray);
  }
}
