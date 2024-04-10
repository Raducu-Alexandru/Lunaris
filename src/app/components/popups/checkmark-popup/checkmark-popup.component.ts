import { Component, Input } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-checkmark-popup',
  templateUrl: './checkmark-popup.component.html',
  styleUrl: './checkmark-popup.component.scss'
})
export class CheckmarkPopupComponent {
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
