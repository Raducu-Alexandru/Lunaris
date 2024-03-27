import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, UserTableDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admins-page',
  templateUrl: './admins-page.component.html',
  styleUrl: './admins-page.component.scss'
})
export class AdminsPageComponent implements OnInit {
  searchedValue: string = '';
  adminsTableDetails: UserTableDetails[] = [];
  filteredadminsTableDetails: UserTableDetails[] = [];

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getadminsTableDetails();
  }

  onEmailSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredadminsTableDetails = [];
    for (var admin of this.adminsTableDetails) {
      if (admin.email.includes(this.searchedValue)) {
        this.filteredadminsTableDetails.push(Object.assign({}, admin));
      }
    }
  }

  async _getadminsTableDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/admins');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.adminsTableDetails = customResponseObject.data.adminsTableDetails;
  }

}
