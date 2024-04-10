import { Component, EventEmitter, Output } from '@angular/core';
import { CustomResponseObject, StudyYearDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-study-year-dropdown',
  templateUrl: './study-year-dropdown.component.html',
  styleUrl: './study-year-dropdown.component.scss'
})
export class StudyYearDropdownComponent {
  studyYearsDetails: StudyYearDetails[] = [];
  @Output('custom-input') customInput: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    await this._getStudyYears();
    if (this.studyYearsDetails.length > 0) {
      this.customInput.emit(this.studyYearsDetails[0].studyYearId);
    }
  }

  onSelectChange(event): void {
    var studyYearId: number = parseInt(event.target.value);
    this.customInput.emit(studyYearId);
  }

  private async _getStudyYears(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + '/get/study-years');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studyYearsDetails = customResponseObject.data.studyYearsDetails;
  }
}
