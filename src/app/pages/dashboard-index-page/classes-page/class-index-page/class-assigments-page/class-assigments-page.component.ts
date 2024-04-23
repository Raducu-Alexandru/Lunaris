import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { ActivatedRoute } from '@angular/router';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import { AssignmentPreviewDetails, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { UserRoleService } from '../../../../../custom-services/user-role/user-role.service';

@Component({
	selector: 'app-class-assigments-page',
	templateUrl: './class-assigments-page.component.html',
	styleUrl: './class-assigments-page.component.scss',
})
export class ClassAssigmentsPageComponent implements OnInit {
	classId: number;
	userRole: number = 0;
	assignmentsPreviewDetails: AssignmentPreviewDetails[] = [];

	constructor(private _activatedRoute: ActivatedRoute, private _authenticateService: AuthenticateService, private _userRoleService: UserRoleService) {}

	async ngOnInit(): Promise<void> {
		this.classId = parseInt(this._activatedRoute.parent.parent.snapshot.paramMap.get('classId'));
		this.userRole = await this._userRoleService.getUserRole();
		await this._getClassAssigDetails();
	}

	private async _getClassAssigDetails(): Promise<void> {
		var responseObject: ResponseObject = await this._authenticateService.sendGetReq(environment.classesUrl + `/get/class/${this.classId}/assignments`);
		if (!this._authenticateService.checkResponse(responseObject)) {
			return null;
		}
		var customResponseObject: CustomResponseObject = responseObject.data;
		this.assignmentsPreviewDetails = customResponseObject.data.assignmentsPreviewDetails;
	}
}
