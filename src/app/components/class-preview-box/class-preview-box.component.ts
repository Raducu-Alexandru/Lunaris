import { Component, Input } from '@angular/core';
import { ClassPreviewDetails } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
	selector: 'app-class-preview-box',
	templateUrl: './class-preview-box.component.html',
	styleUrl: './class-preview-box.component.scss',
})
export class ClassPreviewBoxComponent {
	@Input('class-preview-details') classPreviewDetails: ClassPreviewDetails = {
		classId: 0,
		classLongId: '',
		className: '',
		classCredits: null,
		classFinalGrade: null,
	};
}
