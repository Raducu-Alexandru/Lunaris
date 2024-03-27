import { Component, Input } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css'],
})
export class InfoPopupComponent {
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  onOkayClick(): void {
    var popupResult: PopupResult = {
      result: 'okay',
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }
}
