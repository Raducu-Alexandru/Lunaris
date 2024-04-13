import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../custom-services/user-role/user-role.service';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { SocketService } from '../../services/socket.service';
import { SocketConnectionService } from '../../custom-services/socket-connection/socket-connection.service';

@Component({
  selector: 'app-dashboard-index-page',
  templateUrl: './dashboard-index-page.component.html',
  styleUrl: './dashboard-index-page.component.scss',
})
export class DashboardIndexPageComponent implements OnInit {
  userRole: number = null;
  userEmail: string = null;

  constructor(
    private _userRoleService: UserRoleService,
    private _authenticateService: AuthenticateService,
    private _socketConnectionService: SocketConnectionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userRole = await this._userRoleService.getUserRole();
    this.userEmail = await this._getUserEmail();
    await this._socketConnectionService.connectSocket();
  }

  async onLogoutClick(): Promise<void> {
    await this._authenticateService.logout();
  }

  private async _getUserEmail(): Promise<string> {
    var responseObject: ResponseObject =
      await this._authenticateService.sendGetReq(
        environment.userDetailsUrl + '/get/user-email'
      );
    if (!this._authenticateService.checkResponse(responseObject)) {
      return null;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    return customResponseObject.data.userEmail;
  }
}
