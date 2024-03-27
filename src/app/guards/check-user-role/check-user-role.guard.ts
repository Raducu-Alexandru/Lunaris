import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';
import { UserRoleService } from '../../custom-services/user-role/user-role.service';

@Injectable({
  providedIn: 'root',
})
export class CheckUserRoleGuard implements CanActivate {
  constructor(
    private _authenticateService: AuthenticateService,
    private _userRoleService: UserRoleService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    var checkRole: number = parseInt(route.data['checkRole']);
    var userRole: number = await this._userRoleService.getUserRole();
    return checkRole == userRole;
  }
}
