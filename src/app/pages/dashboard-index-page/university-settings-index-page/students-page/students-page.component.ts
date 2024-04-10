import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, UserTableDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-students-page',
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.scss'
})
export class StudentsPageComponent implements OnInit {
  searchedValue: string = '';
  studentsTableDetails: UserTableDetails[] = [];
  filteredStudentsTableDetails: UserTableDetails[] = [];

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getStudentsTableDetails();
    console.log(this.studentsTableDetails);
  }

  onEmailSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredStudentsTableDetails = [];
    for (var student of this.studentsTableDetails) {
      if (student.email.toLowerCase().includes(this.searchedValue.toLowerCase())) {
        this.filteredStudentsTableDetails.push(Object.assign({}, student));
      }
    }
  }

  async _getStudentsTableDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/students');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studentsTableDetails = customResponseObject.data.studentsTableDetails;
  }
}
