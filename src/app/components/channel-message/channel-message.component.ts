import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnnouncementInfo } from '@raducualexandrumircea/lunaris-interfaces';
import { PopupsService } from '../../custom-services/popup/popups.service';

@Component({
	selector: 'app-channel-message',
	templateUrl: './channel-message.component.html',
	styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
	@Input('data') data: AnnouncementInfo = {
		userId: null,
		announcementId: null,
		announcementName: '',
		announcementText: '',
	};
	@Input('show-delete-options') showDeleteOptions: boolean = false;
	@Output('delete') emitDelete: EventEmitter<number> = new EventEmitter();

	constructor(private _popupsService: PopupsService) {}

	onOpenContactPopupClick(): void {
		if (!this.data.userId) {
			return;
		}
		this._popupsService.openPopup({
			type: 'user-contact',
			data: {
				userId: this.data.userId,
			},
		});
	}

	onDeleteClick(): void {
		this.emitDelete.emit(this.data.announcementId);
	}
}
