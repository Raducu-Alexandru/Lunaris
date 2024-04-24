import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomResponseObject, FileAssignmentDetails, HandedInAssignmentDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../services/cryptography-network.service';
import { environment } from '../../../environments/environment';
import { PopupResult, PopupsService } from '../../custom-services/popup/popups.service';

@Component({
	selector: 'app-assignment-hand-in-box',
	templateUrl: './assignment-hand-in-box.component.html',
	styleUrl: './assignment-hand-in-box.component.scss',
})
export class AssignmentHandInBoxComponent implements OnInit {
	isOpen: boolean = false;
	@Input('handedInAssignmentDetails') handedInAssignmentDetails: HandedInAssignmentDetails = {
		userId: 0,
		email: '',
		grade: null,
		handedInDate: 0,
		filesIds: [],
	};
	@Input('dueDate') dueDate: number = 0;
	@Output('grade-change') gradeChange: EventEmitter<number> = new EventEmitter<number>();
	userFilesAssignmentDetails: FileAssignmentDetails[] = [];
	userDownloadUrl: string = environment.filesUrl + '/assignment/user/download';

	constructor(private _authenticateService: AuthenticateService, private _popupsService: PopupsService) {}

	async ngOnInit(): Promise<void> {
		await this._getFilesDetails();
	}

	onToggleState(): void {
		this.isOpen = !this.isOpen;
	}

	async onGradeClick(): Promise<void> {
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'number-input',
			text: this.handedInAssignmentDetails.grade == null ? 'Add grade' : 'Change grade',
		});
		var grade: number = popupResult.data.inputNumber;
		if (grade > 10 || grade == 0 || isNaN(grade)) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Can not have a grade bigger than 10 or equal to 0',
			});
			return;
		}
		if (String(grade).includes('.') && grade * 100 != parseInt(String(grade).replaceAll('.', ''))) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Can not have a grade with more than 2 decimal points',
			});
			return;
		}
		this.gradeChange.emit(grade);
	}

	private async _getFilesDetails(): Promise<void> {
		interface CurrentBody {
			filesIds: number[];
		}
		var body: CurrentBody = {
			filesIds: this.handedInAssignmentDetails.filesIds,
		};
		var filesResponseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.filesUrl + '/assignment/user/details', body);
		if (!this._authenticateService.checkResponse(filesResponseObject)) {
			return null;
		}
		var filesCustomResponseObject: CustomResponseObject = filesResponseObject.data;
		this.userFilesAssignmentDetails = filesCustomResponseObject.data.filesAssignmentDetails;
	}
}
