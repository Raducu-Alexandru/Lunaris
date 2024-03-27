import { Injectable } from '@angular/core';
import { AuthenticateService } from '../authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  userRole: number = null;
  onLogoutSubscription: Subscription;

  constructor(private _authenticateService: AuthenticateService) {
    this.onLogoutSubscription = this._authenticateService.onLogoutSubject.subscribe({
      next: () => {
        this.clearUserRole();
      }
    })
  }

  async getUserRole(): Promise<number> {
    if (this.userRole == null) {
      this.userRole = await this._getUserRole();
    }
    return this.userRole;
  }

  clearUserRole(): void {
    this.userRole = null;
  }

  destroy(): void {
    this.onLogoutSubscription.unsubscribe();
  }

  private async _getUserRole(): Promise<number> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + '/get/user-role');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return null;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    return customResponseObject.data.userRole;
  }
}
