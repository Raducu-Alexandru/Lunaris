import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupResult, PopupsService } from '../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../custom-services/big-loading-filter/big-loading-filter.service';
import { CustomResponseObject, SubjectPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../services/cryptography-network.service';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { environment } from '../../../environments/environment';
import { DropdownValues } from '../popups/dropdown-select-popup/dropdown-select-popup.component';

@Component({
  selector: 'app-create-program-year',
  templateUrl: './create-program-year.component.html',
  styleUrl: './create-program-year.component.scss'
})
export class CreateProgramYearComponent {
  isOpen: boolean = false;
  subjectsPreviewDetails: SubjectPreviewDetails[] = [];
  yearSubjectsPreviewDetails: YearSubjectPreviewDetails[] = [];
  @Input('year') year: number = 1;
  @Output('custom-input') customInput: EventEmitter<YearSubjectPreviewDetails[]> = new EventEmitter<YearSubjectPreviewDetails[]>();
  @Output('delete') deleteEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _authenticateService: AuthenticateService) { }

  onToggleState(): void {
    this.isOpen = !this.isOpen;
  }

  onSemesterInput(event, index: number): void {
    var value: number = parseInt(event.target.value);
    this.yearSubjectsPreviewDetails[index].semesterIndex = value;
    this.customInput.emit(this.yearSubjectsPreviewDetails);
  }

  onDeleteYearClick(): void {
    this.deleteEvent.emit();
  }

  onDeleteSubjectClick(index: number): void {
    this.yearSubjectsPreviewDetails = this.yearSubjectsPreviewDetails.filter((val, i) => i != index);
    this.customInput.emit(this.yearSubjectsPreviewDetails);
  }

  async onAddSubjectClick(): Promise<void> {
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    await this._getSubjectsPreviewDetails();
    var dropdownValues: DropdownValues[] = [];
    for (var i = 0; i < this.subjectsPreviewDetails.length; i++) {
      if (this.yearSubjectsPreviewDetails.filter((val) => val.subjectId == this.subjectsPreviewDetails[i].subjectId).length != 0) {
        continue;
      }
      dropdownValues.push({
        value: this.subjectsPreviewDetails[i].subjectId,
        text: this.subjectsPreviewDetails[i].subjectName,
      });
    }
    this._bigLoadingFilterService.closeFilter();
    if (dropdownValues.length == 0) {
      this._popupsService.openPopup({
        type: 'alert',
        text: 'You added all the unique subjects'
      })
      return;
    }
    var popupResult: PopupResult = await this._popupsService.openPopup({
      type: 'dropdown-select',
      text: 'Select the Subject',
      data: {
        selectOptions: dropdownValues
      }
    });
    console.log(popupResult);
    if (popupResult.data.value == null || popupResult.result != 'submit') {
      return;
    }
    this.yearSubjectsPreviewDetails.push({
      subjectId: parseInt(popupResult.data.value),
      subjectName: dropdownValues.find((value) => value.value == popupResult.data.value).text,
      semesterIndex: 1,
    });
    this.customInput.emit(this.yearSubjectsPreviewDetails);
  }

  async _getSubjectsPreviewDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/subjects/0');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.subjectsPreviewDetails = customResponseObject.data.subjectsPreviewDetails;
  }
}

export interface YearSubjectPreviewDetails {
  subjectId: number;
  subjectName: string;
  semesterIndex: number;
}
