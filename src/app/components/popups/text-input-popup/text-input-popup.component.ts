import { Component, Input } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-text-input-popup',
  templateUrl: './text-input-popup.component.html',
  styleUrl: './text-input-popup.component.scss'
})
export class TextInputPopupComponent {
  text: string = '';
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  onSubmitClick(): void {
    var popupResult: PopupResult = {
      result: 'submit',
      data: {
        reason: this.text,
      },
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }
}
