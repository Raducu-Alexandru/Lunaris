import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';
import { CustomResponseObject, UserTableDetails } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
  selector: 'app-professors-page',
  templateUrl: './professors-page.component.html',
  styleUrl: './professors-page.component.scss'
})
export class ProfessorsPageComponent implements OnInit {
  searchedValue: string = '';
  professorsTableDetails: UserTableDetails[] = [];
  filteredProfessorsTableDetails: UserTableDetails[] = [];

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getProfessorsTableDetails();
  }

  onEmailSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredProfessorsTableDetails = [];
    for (var professor of this.professorsTableDetails) {
      if (professor.email.includes(this.searchedValue)) {
        this.filteredProfessorsTableDetails.push(Object.assign({}, professor));
      }
    }
  }

  async _getProfessorsTableDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/professors');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.professorsTableDetails = customResponseObject.data.professorsTableDetails;
  }

}
