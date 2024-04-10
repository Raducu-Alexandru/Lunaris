import { Component, Input, OnInit } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { CustomResponseObject, ProgamPreviewDetails, YearPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-select-program-year',
  templateUrl: './select-program-year.component.html',
  styleUrl: './select-program-year.component.scss'
})
export class SelectProgramYear implements OnInit {
  progamsPreviewDetails: ProgamPreviewDetails[] = [];
  yearsPreviewDetails: YearPreviewDetails[] = [];
  selectedYearId: string = null;
  selectedProgramId: number = null;
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _authenticateService: AuthenticateService, private _popupService: PopupsService) { }

  async ngOnInit(): Promise<void> {
    await this._getPrograms();
    this.selectedProgramId = this.progamsPreviewDetails[0].programId;
    await this._getProgramYears(this.progamsPreviewDetails[0].programId);
    this.selectedYearId = String(this.yearsPreviewDetails[0].yearId);
  }

  onSubmitClick(): void {
    var popupResult: PopupResult = {
      result: 'submit',
      data: {
        selectedYear: this.yearsPreviewDetails.find((val: YearPreviewDetails) => val.yearId == parseInt(this.selectedYearId)),
        selectedProgram: this.progamsPreviewDetails.find((val: ProgamPreviewDetails) => val.programId == this.selectedProgramId),
      },
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }

  async onProgramSelect(event): Promise<void> {
    this.selectedProgramId = parseInt(event.target.value);
    await this._getProgramYears(this.selectedProgramId);
    this.selectedYearId = String(this.yearsPreviewDetails[0].yearId);
  }

  private async _getPrograms(): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/programs');
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    if (this.popupConfigObj.data.ignoreProgramIds) {
      for (var i = 0; i < customResponseObject.data.progamsPreviewDetails.length; i++) {
        if (!this.popupConfigObj.data.ignoreProgramIds.includes(customResponseObject.data.progamsPreviewDetails[i].programId)) {
          this.progamsPreviewDetails.push(customResponseObject.data.progamsPreviewDetails[i]);
        }
      }
    } else {
      this.progamsPreviewDetails = customResponseObject.data.progamsPreviewDetails;
    }
  }

  private async _getProgramYears(programId: number): Promise<void> {
    var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + `/get/years/${programId}`);
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.yearsPreviewDetails = customResponseObject.data.yearsPreviewDetails;
  }
}
