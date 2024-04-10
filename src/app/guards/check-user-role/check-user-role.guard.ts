import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserRoleService } from '../../custom-services/user-role/user-role.service';

@Injectable({
  providedIn: 'root',
})
export class CheckUserRoleGuard implements CanActivate {
  constructor(
    private _userRoleService: UserRoleService,
    private _router: Router
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    var checkRole: number[] = route.data['checkRole'];
    var userRole: number = await this._userRoleService.getUserRole();
    if (checkRole.includes(userRole)) {
      return true;
    }
    this._router.navigate([]);
    return false;
  }
}
