import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BigLoadingFilterService } from '../../../../../../custom-services/big-loading-filter/big-loading-filter.service';
import { PopupResult, PopupsService } from '../../../../../../custom-services/popup/popups.service';
import { ResponseObject } from '../../../../../../services/cryptography-network.service';
import { AuthenticateService } from '../../../../../../custom-services/authenticate/authenticate.service';
import { environment } from '../../../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-create-assignment-page',
	templateUrl: './create-assignment-page.component.html',
	styleUrl: './create-assignment-page.component.scss',
})
export class CreateAssignmentPageComponent implements OnInit {
	name: string = '';
	dueDate: string = '';
	description: string = '';
	currentDate: Date;
	uploadedFiles: File[] = [];
	classId: number;

	constructor(
		private _datePipe: DatePipe,
		private _bigLoadingFilterService: BigLoadingFilterService,
		private _popupsService: PopupsService,
		private _authenticateService: AuthenticateService,
		private _location: Location,
		private _activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.classId = parseInt(this._activatedRoute.parent.parent.snapshot.paramMap.get('classId'));
		this.currentDate = new Date();
		this.dueDate = this._datePipe.transform(this.currentDate, 'YYYY-MM-ddTHH:mm:ss');
	}

	onFileUpload(file: File): void {
		this.uploadedFiles.push(file);
		console.log(this.uploadedFiles);
	}

	onFileDelete(index: number): void {
		this.uploadedFiles = this.uploadedFiles.filter((val, i) => i !== index);
	}

	async onCreateClick(): Promise<void> {
		if (this._bigLoadingFilterService.getStatus()) {
			return;
		}
		var popupResult: PopupResult = await this._popupsService.openPopup({
			type: 'alert-confirmation',
			text: 'Are you sure you want to create this assignment?',
		});
		if (popupResult.result != 'yes') {
			return;
		}
		this._bigLoadingFilterService.openFilter();
		if (this.name == '') {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Please enter a valid name',
			});
			this._bigLoadingFilterService.closeFilter();
			return;
		}
		if (this.dueDate == '' || new Date(this.dueDate).getTime() <= new Date().getTime()) {
			this._popupsService.openPopup({
				type: 'alert',
				text: 'Please enter a valid due date',
			});
			this._bigLoadingFilterService.closeFilter();
			return;
		}
		var formData: FormData = new FormData();
		formData.append('name', this.name);
		formData.append('dueDate', String(new Date(this.dueDate).getTime()));
		formData.append('description', this.description);
		for (var i = 0; i < this.uploadedFiles.length; i++) {
			formData.append('files', this.uploadedFiles[i]);
		}
		var responseObject: ResponseObject = await this._authenticateService.sendPostReq(environment.classesUrl + `/create/assignment/${this.classId}`, formData, {}, false);
		if (this._authenticateService.checkResponse(responseObject)) {
			this._location.back();
		}
		this._bigLoadingFilterService.closeFilter();
	}
}
