import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, SubjectPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { environment } from '../../../../../environments/environment';
import { ResponseObject } from '../../../../services/cryptography-network.service';

@Component({
  selector: 'app-subjects-page',
  templateUrl: './subjects-page.component.html',
  styleUrl: './subjects-page.component.scss'
})
export class SubjectsPageComponent implements OnInit {
  searchedValue: string = '';
  subjectsPreviewDetails: SubjectPreviewDetails[] = [];
  filteredSubjectsPreviewDetails: SubjectPreviewDetails[] = [];

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getSubjectsPreviewDetails();
  }

  onNameSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredSubjectsPreviewDetails = [];
    for (var subject of this.subjectsPreviewDetails) {
      if (subject.subjectName.toLowerCase().includes(this.searchedValue.toLowerCase())) {
        this.filteredSubjectsPreviewDetails.push(Object.assign({}, subject));
      }
    }
  }

  async _getSubjectsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/subjects');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.subjectsPreviewDetails = customResponseObject.data.subjectsPreviewDetails;
  }
}
