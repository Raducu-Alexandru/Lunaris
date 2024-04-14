import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../../../custom-services/user-role/user-role.service';

@Component({
	selector: 'app-class-index-page',
	templateUrl: './class-index-page.component.html',
	styleUrl: './class-index-page.component.scss',
})
export class ClassIndexPageComponent implements OnInit {
	userRole: number = 0;

	constructor(private _userRoleService: UserRoleService) {}

	async ngOnInit(): Promise<void> {
		this.userRole = await this._userRoleService.getUserRole();
	}
}
