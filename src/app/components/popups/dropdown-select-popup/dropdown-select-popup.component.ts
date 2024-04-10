import { Component, Input, OnInit } from '@angular/core';
import { PopupConfig, PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-dropdown-select-popup',
  templateUrl: './dropdown-select-popup.component.html',
  styleUrl: './dropdown-select-popup.component.scss'
})
export class DropdownSelectPopupComponent implements OnInit {
  value: string = null;
  @Input('popup-config') popupConfigObj: PopupConfig;

  constructor(private _popupService: PopupsService) { }

  ngOnInit(): void {
    this.value = this.popupConfigObj.data.selectOptions[0].value;
  }

  onSubmitClick(): void {
    var popupResult: PopupResult = {
      result: 'submit',
      data: {
        value: this.value,
      },
    };
    this._popupService.sendPopupResult(popupResult);
    this.onCloseClick();
  }

  onCloseClick(): void {
    this._popupService.closePopup();
  }
}

export interface DropdownValues {
  value: string | number;
  text: string;
}
