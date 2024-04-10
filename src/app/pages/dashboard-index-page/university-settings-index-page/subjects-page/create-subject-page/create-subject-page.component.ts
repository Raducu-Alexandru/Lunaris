import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { SubjectEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-subject-page',
  templateUrl: './create-subject-page.component.html',
  styleUrl: './create-subject-page.component.scss'
})
export class CreateSubjectPageComponent {
  subjectEditDetails: SubjectEditDetails = {
    subjectName: '',
    subjectCredits: 0,
    archived: false,
  };
  password: string = '';
  retypePassword: string = '';

  constructor(private _location: Location, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async onCreateClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      text: 'Are you sure you want to create this subject?',
      type: 'alert-confirmation'
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (this._bigLoadingFilterService.getStatus()) {
      return;
    }
    this._bigLoadingFilterService.openFilter();
    if ((await this._createSubjectDetails())) {
      this._location.back();
    }
    this._bigLoadingFilterService.closeFilter();
  }

  async _createSubjectDetails(): Promise<boolean> {
    interface CurrentBody {
      subjectName: string;
      subjectCredits: number;
    }
    var body: CurrentBody = {
      subjectName: this.subjectEditDetails.subjectName,
      subjectCredits: this.subjectEditDetails.subjectCredits,
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/create/subject', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}
