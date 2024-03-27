import { Component, Input } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.css'],
})
export class ConfirmationPopupComponent {
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  onYesClick(): void {
    var popupResult: PopupResult = {
      result: 'yes',
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onNoClick(): void {
    var popupResult: PopupResult = {
      result: 'no',
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }
}
