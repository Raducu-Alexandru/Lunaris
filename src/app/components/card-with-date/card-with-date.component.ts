import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-card-with-date',
	templateUrl: './card-with-date.component.html',
	styleUrl: './card-with-date.component.scss',
})
export class CardWithDateComponent implements OnInit {
	@Input('timestamp') timestamp: number = 0;
	@Input('name') name: string = '';
	@Input('description') description: string = '';
	@Input('show-late-date') showLateDate: boolean = false;
	@Input('grade') grade: number = null;
	currentTimestamp: number = -1;

	ngOnInit(): void {
		this.currentTimestamp = new Date().getTime();
	}
}
