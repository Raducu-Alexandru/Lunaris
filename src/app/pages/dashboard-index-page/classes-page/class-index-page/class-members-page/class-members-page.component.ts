import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../../../../custom-services/user-role/user-role.service';
import { AuthenticateService } from '../../../../../custom-services/authenticate/authenticate.service';
import { ActivatedRoute } from '@angular/router';
import { ResponseObject } from '../../../../../services/cryptography-network.service';
import { environment } from '../../../../../../environments/environment';
import {
  CustomResponseObject,
  StudyYearStudentDetails,
  UserTableDetails,
} from '@raducualexandrumircea/lunaris-interfaces';
import {
  PopupResult,
  PopupsService,
} from '../../../../../custom-services/popup/popups.service';

@Component({
  selector: 'app-class-members-page',
  templateUrl: './class-members-page.component.html',
  styleUrl: './class-members-page.component.scss',
})
export class ClassMembersPageComponent implements OnInit {
  userRole: number = 0;
  classId: number;
  classMembersDetails: UserTableDetails[] = [];
  studyYearStudentsDetails: StudyYearStudentDetails[] = [];
  userEmail: string = '';

  constructor(
    private _popupsService: PopupsService,
    private _activatedRoute: ActivatedRoute,
    private _authenticateService: AuthenticateService,
    private _userRoleService: UserRoleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.classId = parseInt(
      this._activatedRoute.parent.snapshot.paramMap.get('classId')
    );
    this.userRole = await this._userRoleService.getUserRole();
    await this._getClassMembersDetails();
  }

  async onSaveClick(): Promise<void> {
    var popupResult: PopupResult = await this._popupsService.openPopup({
      type: 'alert-confirmation',
      text: 'Are you sure you want to add these members?',
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (await this._addMembers()) {
      this.studyYearStudentsDetails = [];
      await this._getClassMembersDetails();
    }
  }

  async onEmailSearchSubmit(event): Promise<void> {
    event.preventDefault();
    console.log(this.userEmail);
    if (!this.userEmail) {
      this._popupsService.openPopup({
        text: 'Please enter a student email',
        type: 'alert',
      });
      return;
    }
    await this._getUserIdFromEmail(this.userEmail);
    this.userEmail = '';
    console.log(this.studyYearStudentsDetails);
  }

  onStudentDelete(userId: number): void {
    console.log(userId);
    this.studyYearStudentsDetails = this.studyYearStudentsDetails.filter(
      (val: StudyYearStudentDetails) => val.userId != userId
    );
  }

  async onMemberDelete(memberUserId: number): Promise<void> {
    console.log(memberUserId);
    var popupResult: PopupResult = await this._popupsService.openPopup({
      type: 'alert-confirmation',
      text: 'Are you sure you want to delete this member?',
    });
    if (popupResult.result != 'yes') {
      return;
    }
    if (await this._deleteMember(memberUserId)) {
      console.log(this.classMembersDetails);
      this.classMembersDetails = this.classMembersDetails.filter(
        (val: UserTableDetails) => val.userId != memberUserId
      );
      console.log(this.classMembersDetails);
    }
  }

  private async _addMembers(): Promise<boolean> {
    interface CurrentBody {
      classId: number;
      usersIds: number[];
    }
    var body: CurrentBody = {
      classId: this.classId,
      usersIds: this.studyYearStudentsDetails.map((val) => val.userId),
    };
    var responseObject: ResponseObject =
      await this._authenticateService.sendPostReq(
        environment.classesUrl + '/add/members',
        body
      );
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  private async _deleteMember(memberUserId: number): Promise<boolean> {
    interface CurrentBody {
      classId: number;
      memberUserId: number;
    }
    var body: CurrentBody = {
      classId: this.classId,
      memberUserId: memberUserId,
    };
    var responseObject: ResponseObject =
      await this._authenticateService.sendPostReq(
        environment.classesUrl + '/delete/member',
        body
      );
    if (!this._authenticateService.checkResponse(responseObject)) {
      return false;
    }
    return true;
  }

  private async _getClassMembersDetails(): Promise<void> {
    var responseObject: ResponseObject =
      await this._authenticateService.sendGetReq(
        environment.classesUrl + `/get/members/${this.classId}`
      );
    if (!this._authenticateService.checkResponse(responseObject)) {
      return null;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    this.classMembersDetails = customResponseObject.data.classMembersDetails;
  }

  private async _getUserIdFromEmail(email: string): Promise<void> {
    interface CurrentBody {
      email: string;
    }
    var body: CurrentBody = {
      email: email,
    };
    var responseObject: ResponseObject =
      await this._authenticateService.sendPostReq(
        environment.classesUrl + '/get/user-id/from/email',
        body
      );
    if (!this._authenticateService.checkResponse(responseObject)) {
      return;
    }
    var customResponseObject: CustomResponseObject = responseObject.data;
    var studyYearStudentDetails: StudyYearStudentDetails =
      customResponseObject.data.studyYearStudentDetails;
    if (
      this.studyYearStudentsDetails.find(
        (val: StudyYearStudentDetails) =>
          val.userId == studyYearStudentDetails.userId
      ) ||
      this.classMembersDetails.find(
        (val: UserTableDetails) => val.userId == studyYearStudentDetails.userId
      )
    ) {
      this._popupsService.openPopup({
        type: 'alert',
        text: 'The user is already in the class',
      });
      return;
    }
    this.studyYearStudentsDetails.push(studyYearStudentDetails);
  }
}
