import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { AnnouncementInfo, AssignmentPreviewDetails, CustomResponseObject, UpcommingDeadlinePreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { environment } from '../../../../environments/environment';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { PopupResult, PopupsService } from '../../../custom-services/popup/popups.service';
import { BigLoadingFilterService } from '../../../custom-services/big-loading-filter/big-loading-filter.service';
import { UserRoleService } from '../../../custom-services/user-role/user-role.service';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
	userRole: number = null;
	announcementsInfo: AnnouncementInfo[] = [];
	upcommingDeadlinePreviewDetails: UpcommingDeadlinePreviewDetails[] = [];

	constructor(
		private _authenticateService: AuthenticateService,
		private _popupsService: PopupsService,
		private _bigLoadingFilterService: BigLoadingFilterService,
		private _userRoleService: UserRoleService
	) {}

	async ngOnInit(): Promise<void> {
		this.userRole = await this._userRoleService.getUserRole();
		await this._getAnnouncements();
		await this._getUpcommingDetailsDetails();
	}

	async onAnnouncementAddClick(): Promise<void> {
		var popupResult: PopupResult = await this._popupsService.openPopup({
			text: 'Announcement text',
			type: 'text-input',
		});
		if (popupResult.result != 'submit') {
			return;
		}
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		if (await this._addAnnouncement(popupResult.data.reason)) {
			await this._getAnnouncements();
		}
		this._bigLoadingFilterService.closeFilter();
	}

	async onRemovenAnnouncement(announcementId: number): Promise<void> {
		var popupResult: PopupResult = await this._popupsService.openPopup({
			text: 'Are you sure you want to delete this announcement?',
			type: 'alert-confirmation',
		});
		if (popupResult.result != 'yes') {
			return;
		}
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		if (await this._removeAnnouncement(announcementId)) {
			await this._getAnnouncements();
		}
		this._bigLoadingFilterService.closeFilter();
	}

	private async _getAnnouncements(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.messagesUrl + '/get/announcements');
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.announcementsInfo = customResponseObject.data.announcementsInfo;
	}

	private async _addAnnouncement(content: string): Promise<boolean> {
		interface CurrentBody {
			content: string;
		}
		var body: CurrentBody = {
			content: content,
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.messagesUrl + '/add/announcement', body);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return false;
		}
		return true;
	}

	private async _removeAnnouncement(announcementId: number): Promise<boolean> {
		interface CurrentBody {
			announcementId: number;
		}
		var body: CurrentBody = {
			announcementId: announcementId,
		};
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.messagesUrl + '/delete/announcement', body);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return false;
		}
		return true;
	}

	private async _getUpcommingDetailsDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + '/upcomming-deadlines');
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.upcommingDeadlinePreviewDetails = customResponseObject.data.upcommingDeadlinePreviewDetails;
	}
}
