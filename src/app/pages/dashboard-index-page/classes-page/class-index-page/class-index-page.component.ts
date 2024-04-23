import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../../../custom-services/user-role/user-role.service';
import { AuthenticateService } from '../../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../../services/cryptography-network.service';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';

@Component({
	selector: 'app-class-index-page',
	templateUrl: './class-index-page.component.html',
	styleUrl: './class-index-page.component.scss',
})
export class ClassIndexPageComponent implements OnInit {
	userRole: number = 0;
	classId: number = 0;
	yearSubjectId: number = null;

	constructor(private _userRoleService: UserRoleService, private _authenticateService: AuthenticateService, private _activatedRoute: ActivatedRoute) {}

	async ngOnInit(): Promise<void> {
		this.classId = parseInt(this._activatedRoute.snapshot.paramMap.get('classId'));
		this.userRole = await this._userRoleService.getUserRole();
		await this._getClassYearSubjectId();
	}

	private async _getClassYearSubjectId(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/class/${this.classId}/year-subject-id`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.yearSubjectId = customResponseObject.data.yearSubjectId;
	}
}
