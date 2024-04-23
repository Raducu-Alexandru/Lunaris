import { Component, Input, OnInit } from '@angular/core';
import { PopupConfig, PopupsService } from '../../../custom-services/popup/popups.service';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { CustomResponseObject, UserContactInfo } from '@raducualexandrumircea/lunaris-interfaces';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-user-contact-popup',
	templateUrl: './user-contact-popup.component.html',
	styleUrl: './user-contact-popup.component.scss',
})
export class UserContactPopupComponent implements OnInit {
	@Input('popup-config') popupConfigObj: PopupConfig;
	userContactInfo: UserContactInfo = {
		fullname: '',
		description: '',
		website: '',
		publicEmail: '',
	};

	constructor(private _popupService: PopupsService, private _authenticateService: AuthenticateService) {}

	async ngOnInit(): Promise<void> {
		await this._getUserContactInfo();
	}

	onCloseClick(): void {
		this._popupService.closePopup();
	}

	private async _getUserContactInfo(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.userDetailsUrl + `/get/user-contact-info/${this.popupConfigObj.data.userId}`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.userContactInfo = customResponseObject.data.userContactInfo;
	}
}
