import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject, SubjectEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-subject-page',
  templateUrl: './edit-subject-page.component.html',
  styleUrl: './edit-subject-page.component.scss'
})
export class EditSubjectPageComponent implements OnInit {
  subjectId: number = null;
  subjectEditDetails: SubjectEditDetails = null;
  copySubjectEditDetails: SubjectEditDetails = null;
  newPassword: string = '';
  retypeNewPassword: string = '';
  archived: boolean = false;

  constructor(private _loacation: Location, private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.subjectId = parseInt(this._activatedRoute.snapshot.paramMap.get('subjectId'));
    await this._getSubjectDetails();
  }

  async onSaveClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to save?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if ((await this._saveSubjectDetails())) {
      this._loacation.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  onArchivedInput(isChecked: boolean): void {
    this.archived = isChecked;
  }

  async _getSubjectDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/subject/' + this.subjectId);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.subjectEditDetails = customResponseObject.data.subjectEditDetails;
    this.copySubjectEditDetails = Object.assign({}, this.subjectEditDetails);
    this.archived = this.subjectEditDetails.archived;
  }

  async _saveSubjectDetails(): Promise<boolean> {
    interface CurrentBody {
      subjectId: number;
      subjectName: string;
      subjectCredits: number;
      archived: boolean;
    }
    var body: CurrentBody = {
      subjectName: this.copySubjectEditDetails.subjectName == this.subjectEditDetails.subjectName ? '' : this.subjectEditDetails.subjectName,
      subjectCredits: this.copySubjectEditDetails.subjectCredits == this.subjectEditDetails.subjectCredits ? null : this.subjectEditDetails.subjectCredits,
      archived: this.archived,
      subjectId: this.subjectId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/subject', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}

