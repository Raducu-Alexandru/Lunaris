import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-file-card',
	templateUrl: './file-card.component.html',
	styleUrl: './file-card.component.scss',
})
export class FileCardComponent {
	@Input('file-name') fileName: string = '';
	@Input('download-url') downloadUrl: string = '';
	@Input('is-delete') isDelete = false;
	@Output('delete') delete: EventEmitter<void> = new EventEmitter<void>();

	onDeleteClick(): void {
		this.delete.emit();
	}
}
