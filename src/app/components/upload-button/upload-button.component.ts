import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { PopupConfig, PopupsService } from '../../custom-services/popup/popups.service';
import * as mime from 'mime-types';

@Component({
	selector: 'app-upload-button',
	templateUrl: './upload-button.component.html',
	styleUrl: './upload-button.component.scss',
})
export class UploadButtonComponent {
	@ViewChild('fileInput') input: ElementRef;
	@Output('file-upload') fileUpload: EventEmitter<File> = new EventEmitter<File>();

	constructor(private _popupService: PopupsService) {}

	onUploadClick(): void {
		this.input.nativeElement.value = '';
		this.input.nativeElement.click();
	}

	async onFileOpen(event: any): Promise<void> {
		if (event.target.files[0] == undefined) {
			return;
		}
		var file: File = event.target.files[0];
		var size: number = parseInt((file.size / 1024 / 1024).toFixed(2));
		var popupConfig: PopupConfig = {
			type: 'alert',
			text: '',
		};
		if (size >= 50) {
			popupConfig.text = 'File too big, please upload a smaller one < 50MB';
			this._popupService.openPopup(popupConfig);
			this.input.nativeElement.value = '';
			return;
		}
		/* 		if (!mime.lookup(file.type)) {
			popupConfig.text = 'File type not supported';
			this._popupService.openPopup(popupConfig);
			this.input.nativeElement.value = '';
			return;
		} */
		this.fileUpload.emit(file);
	}
}
