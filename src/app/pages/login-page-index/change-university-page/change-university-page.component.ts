import { Component, OnInit } from '@angular/core';
import { CustomResponseObject, UniversitySelectDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { AuthenticateService } from '../../../custom-services/authenticate/authenticate.service';
import { ResponseObject } from '../../../services/cryptography-network.service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-change-university-page',
  templateUrl: './change-university-page.component.html',
  styleUrl: './change-university-page.component.scss'
})
export class ChangeUniversityPageComponent implements OnInit {
  allUniversitiesSelectDetails: UniversitySelectDetails[] = [];
  filteredUniversities: UniversitySelectDetails[] = [];
  searchVal: string = '';
  universityImageUrl: string = environment.cdnUrl + '/static/universities-images/';

  constructor(private _authenticateService: AuthenticateService, private _router: Router, private _activatedRoute: ActivatedRoute, private _cookieService: CookieService) { }

  async ngOnInit(): Promise<void> {
    this.allUniversitiesSelectDetails = await this._getAllUniversities();
  }

  onSearchInput(event): void {
    this.searchVal = event.target.value;
    this.filteredUniversities = [];
    for (var i = 0; i < this.allUniversitiesSelectDetails.length; i++) {
      if (this.allUniversitiesSelectDetails[i].universityName.includes(this.searchVal)) {
        this.filteredUniversities.push({
          universityLongId: this.allUniversitiesSelectDetails[i].universityLongId,
          universityName: this.allUniversitiesSelectDetails[i].universityName
        });
      }
    }
  }

  onUniversitySelect(universityLongId: string): void {
    this._cookieService.set('selected-university-long-id', universityLongId, new Date(new Date().getTime() + 100 * 24 * 60 * 60 * 1000));;
    this._router.navigate(['..'], { relativeTo: this._activatedRoute });
  }

  private async _getAllUniversities(): Promise<UniversitySelectDetails[]> {
    var response: ResponseObject = await this._authenticateService.sendGetReq(environment.loginUrl + '/get/universities');
    if (!this._authenticateService.checkResponse(response)) {
      return [];
    }
    var customResponseObject: CustomResponseObject = response.data;
    return customResponseObject.data.allUniversitiesSelectDetails;
  }
}
