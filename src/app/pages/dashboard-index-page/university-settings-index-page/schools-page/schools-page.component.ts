import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, SchoolPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-schools-page',
  templateUrl: './schools-page.component.html',
  styleUrl: './schools-page.component.scss'
})
export class SchoolsPageComponent implements OnInit {
  searchedValue: string = '';
  schoolsPreviewDetails: SchoolPreviewDetails[] = [];
  filteredschoolsPreviewDetails: SchoolPreviewDetails[] = [];

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getschoolsPreviewDetails();
  }

  onNameSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredschoolsPreviewDetails = [];
    for (var school of this.schoolsPreviewDetails) {
      if (school.schoolName.toLowerCase().includes(this.searchedValue.toLowerCase())) {
        this.filteredschoolsPreviewDetails.push(Object.assign({}, school));
      }
    }
  }

  async _getschoolsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/schools');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.schoolsPreviewDetails = customResponseObject.data.schoolsPreviewDetails;
  }
}
