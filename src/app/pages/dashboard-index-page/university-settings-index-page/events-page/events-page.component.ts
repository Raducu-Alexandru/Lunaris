import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { environment } from '../../../../../environments/environment';
import { AdminEventDetails, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { ResponseObject } from '../../../../services/cryptography-network.service';

@Component({
	selector: 'app-events-page',
	templateUrl: './events-page.component.html',
	styleUrl: './events-page.component.scss',
})
export class EventsPageComponent implements OnInit {
	adminEventsDetails: AdminEventDetails[] = [];
	filteredAdminEventsDetails: AdminEventDetails[] = [];
	fromSearchedValue: string = '';
	toSearchedValue: string = '';
	emailSearchedValue: string = '';

	constructor(private _authenticateService: AuthenticateService) {}

	async ngOnInit(): Promise<void> {
		await this._getAdminEventsTableDetails();
	}

	onClearDateSearch(): void {
		this.fromSearchedValue = '';
		this.toSearchedValue = '';
		this.emailSearchedValue = '';
	}

	onDateSearchInput(): void {
		this._onFilterAdminEvents();
	}

	onEmailSearchInput(): void {
		this._onFilterAdminEvents();
	}

	_onFilterAdminEvents(): void {
		var fromSearchedValue = new Date(this.fromSearchedValue).getTime() || null;
		var toSearchedValue = new Date(this.toSearchedValue).getTime() || null;
		this.filteredAdminEventsDetails = [];
		if (fromSearchedValue == null && toSearchedValue == null && this.emailSearchedValue == '') {
			return;
		}
		for (var i = 0; i < this.adminEventsDetails.length; i++) {
			if (toSearchedValue != null && this.adminEventsDetails[i].createdDate > toSearchedValue) {
				break;
			}
			if (fromSearchedValue != null && this.adminEventsDetails[i].createdDate < fromSearchedValue) {
				continue;
			}
			if (this.emailSearchedValue != '' && !this.adminEventsDetails[i].email.toLowerCase().includes(this.emailSearchedValue.toLowerCase())) {
				continue;
			}
			this.filteredAdminEventsDetails.push(Object.assign({}, this.adminEventsDetails[i]));
		}
	}

	async _getAdminEventsTableDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.universitySettingsUrl + '/get/admin-events');
		if (!this._authenticateService.checkResponse(responseObject)) {
			return;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.adminEventsDetails = customResponseObject.data.adminEventsDetails;
	}
}
