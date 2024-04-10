import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomResponseObject, StudentYearsDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-years-dropdown',
  templateUrl: './student-years-dropdown.component.html',
  styleUrl: './student-years-dropdown.component.scss'
})
export class StudentYearsDropdownComponent implements OnInit {
  studentYearsDetails: StudentYearsDetails[] = [];
  @Input('student-id') studentId: number = null;
  @Output('custom-input') customInput: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _authenticateService: AuthenticateService) { }

  async ngOnInit(): Promise<void> {
    if (this.studentId) {
      await this._getStudentYearsDetailsAdmin();
    } else {
      await this._getStudentYearsDetails();
    }
    if (this.studentYearsDetails.length > 0) {
      this.customInput.emit(this.studentYearsDetails[0].studentYearId);
    }
  }

  onSelectChange(event): void {
    var studentYearId: number = parseInt(event.target.value);
    this.customInput.emit(studentYearId);
  }

  private async _getStudentYearsDetailsAdmin(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/student/${this.studentId}/student-years`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studentYearsDetails = customResponseObject.data.studentYearsDetails;
  }

  private async _getStudentYearsDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + `/get/student/student-years`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.studentYearsDetails = customResponseObject.data.studentYearsDetails;
  }
}
