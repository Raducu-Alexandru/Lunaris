import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { PopupResult, PopupsService } from '../../../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject, UserEditDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';

@Component({
  selector: 'app-edit-professor-page',
  templateUrl: './edit-professor-page.component.html',
  styleUrl: './edit-professor-page.component.scss'
})
export class EditProfessorPageComponent implements OnInit {
  professorUserId: number = null;
  professorEditDetails: UserEditDetails = null;
  copyProfessorEditDetails: UserEditDetails = null;
  newPassword: string = '';
  retypeNewPassword: string = '';
  disabled: boolean = false;

  constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService) { }

  async ngOnInit(): Promise<void> {
    this.professorUserId = parseInt(this._activatedRoute.snapshot.paramMap.get('professorUserId'));
    await this._getProfessorDetails();
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
    if (this.newPassword != this.retypeNewPassword) {
      this._popupsService.openPopup({
        text: 'The password do not match',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    if (!checkIfEmailIsValid(this.professorEditDetails.email)) {
      this._popupsService.openPopup({
        text: 'Please enter a valid email',
        type: 'alert'
      });
      this._bigLoadingFilterService.closeFilter();
      return;
    }
    await this._saveProfessorDetails();
    this._bigLoadingFilterService.closeFilter();
  }

  onDisableInput(isChecked: boolean): void {
    this.disabled = isChecked;
  }

  async _getProfessorDetails(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/professor/' + this.professorUserId);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.professorEditDetails = customResponseObject.data.professorEditDetails;
    this.copyProfessorEditDetails = Object.assign({}, this.professorEditDetails);
    this.disabled = this.professorEditDetails.disabled;
  }

  async _saveProfessorDetails(): Promise<boolean> {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      disabled: boolean,
      professorUserId: number
    }
    var body: CurrentBody = {
      firstName: this.copyProfessorEditDetails.firstName == this.professorEditDetails.firstName ? '' : this.professorEditDetails.firstName,
      lastName: this.copyProfessorEditDetails.lastName == this.professorEditDetails.lastName ? '' : this.professorEditDetails.lastName,
      email: this.copyProfessorEditDetails.email == this.professorEditDetails.email ? '' : this.professorEditDetails.email,
      password: this.newPassword,
      disabled: this.disabled,
      professorUserId: this.professorUserId
    }
    var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.universitySettingsUrl + '/update/professor', body);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }
}
