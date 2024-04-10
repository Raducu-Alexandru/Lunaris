import { Component, Input } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-number-input-popup',
  templateUrl: './number-input-popup.component.html',
  styleUrl: './number-input-popup.component.scss'
})
export class NumberInputPopupComponent {
  inputNumber: string = '';
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  onSubmitClick(): void {
    var popupResult: PopupResult = {
      result: 'submit',
      data: {
        inputNumber: parseFloat(this.inputNumber),
      },
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }
}
