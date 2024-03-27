import { Component, Input } from '@angular/core';
import { PopupConfig, PopupsService } from '../../custom-services/popup/popups.service';

@Component({
  selector: 'app-general-popup',
  templateUrl: './general-popup.component.html',
  styleUrls: ['./general-popup.component.css'],
})
export class GeneralPopupComponent {
  preventDefaultBack: string;
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  onFilterClick(): void {
    this._popupService.closePopup();
  }
}
