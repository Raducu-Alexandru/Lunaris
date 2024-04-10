import { Component, Input, OnInit } from '@angular/core';
import { CustomResponseObject, ProgamPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-preview-university-programs',
  templateUrl: './preview-university-programs.component.html',
  styleUrl: './preview-university-programs.component.scss'
})
export class PreviewUniversityProgramsComponent implements OnInit {
  progamsPreviewDetails: ProgamPreviewDetails[] = [];
  filteredProgamsPreviewDetails: ProgamPreviewDetails[] = [];
  searchedValue: string = '';
  @Input('schoolId') schoolId: number = null;
  @Input('createProgramLink') createProgramLink: string = 'create';
  @Input('editProgramLink') editProgramLink: string = 'edit';

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getProgramsDetails();
  }

  onNameSearchInput(event): void {
    this.searchedValue = event.target.value;
    this.filteredProgamsPreviewDetails = [];
    for (var program of this.progamsPreviewDetails) {
      if (program.programName.includes(this.searchedValue)) {
        this.filteredProgamsPreviewDetails.push(Object.assign({}, program));
      }
    }
  }

  async _getProgramsDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(this.schoolId ? environment.universitySettingsUrl + '/get/programs/' + this.schoolId : environment.universitySettingsUrl + '/get/programs');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.progamsPreviewDetails = customResponseObject.data.progamsPreviewDetails;
  }
}
