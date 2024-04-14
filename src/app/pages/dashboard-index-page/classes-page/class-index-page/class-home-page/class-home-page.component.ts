import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../../../services/socket.service';
import { ActivatedRoute } from '@angular/router';
import { SocketConnectionService } from '../../../../../custom-services/socket-connection/socket-connection.service';
import { SocketData } from '@raducualexandrumircea/socket.service';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { ClassDetails, ClassMessageDetails, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { PopupsService } from '../../../../../custom-services/popup/popups.service';

@Component({
	selector: 'app-class-home-page',
	templateUrl: './class-home-page.component.html',
	styleUrl: './class-home-page.component.scss',
})
export class ClassHomePageComponent implements OnInit, OnDestroy {
	classId: number;
	socketConnectionSubscription: Subscription;
	onNewMessageEventListenerId: string;
	classDetails: ClassDetails = {
		className: '',
		classDescription: '',
		classCredits: 0,
	};
	classMessagesDetails: ClassMessageDetails[] = [];
	newMessage: string = '';

	constructor(
		private _socketService: SocketService,
		private _activatedRoute: ActivatedRoute,
		private _socketConnectionService: SocketConnectionService,
		private _authenticateService: AuthenticateService,
		private _popupsService: PopupsService
	) {}

	async ngOnInit(): Promise<void> {
		this.classId = parseInt(this._activatedRoute.parent.snapshot.paramMap.get('classId'));
		if (this._socketConnectionService.getSocketState()) {
			await this._enterClassSocketRoom();
		} else {
			this.socketConnectionSubscription = this._socketConnectionService.onSocketChangeStateSubject.subscribe({
				next: async (connectionState: boolean) => {
					if (!connectionState) {
						return;
					}
					await this._enterClassSocketRoom();
				},
			});
		}
		this.onNewMessageEventListenerId = this._socketService.onCallback({
			eventName: 'on-new-class-message',
			callback: (socketData: SocketData) => {
				console.log(socketData);
				this.classMessagesDetails.push(socketData.data);
			},
		});
		await this._getClassDetails();
		await this._getClassMessageDetails();
	}

	async ngOnDestroy(): Promise<void> {
		try {
			this.socketConnectionSubscription.unsubscribe();
		} catch (err) {
			console.log(err);
		}
		this._socketService.clearEventListener(this.onNewMessageEventListenerId);
		await this._socketService.emit({
			eventName: 'leave-class',
			data: {
				classId: this.classId,
			},
		});
	}

	async onSendMessage(event): Promise<void> {
		event.preventDefault();
		if (this.newMessage == '') {
			return;
		}
		var messageResponse: SocketData = await this._socketService.emit({
			eventName: 'send-class-message',
			data: {
				classId: this.classId,
				content: this.newMessage,
			},
			ackTimeoutSec: 10,
		}).promise;
		if (messageResponse.data.succ) {
			this.newMessage = '';
			var newMessage: ClassMessageDetails = messageResponse.data.data.socketSendObject;
			this.classMessagesDetails.push(newMessage);
		} else {
			this._popupsService.openPopup({
				type: 'alert',
				text: messageResponse.data.statusText,
			});
		}
	}

	private async _getClassDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/class/${this.classId}/details`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.classDetails = customResponseObject.data.classDetails;
	}

	private async _getClassMessageDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.messagesUrl + `/get/class/${this.classId}/messages`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.classMessagesDetails = customResponseObject.data.classMessagesDetails;
	}

	private async _enterClassSocketRoom(): Promise<void> {
		await this._socketService.emit({
			eventName: 'enter-class',
			data: {
				classId: this.classId,
			},
		});
	}
}
