import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthenticateService } from '../../custom-services/authenticate/authenticate.service';

@Injectable({
  providedIn: 'root',
})
export class CheckLoginGuard implements CanActivate {
  constructor(
    private _authenticateService: AuthenticateService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    var page: string = route.data['page'];
    var loggedIn: boolean = await this._authenticateService.checkIfLoggedIn();
    if (page == 'login' && loggedIn) {
      this._authenticateService.navigateToLoggedInRedirectPage();
      return false;
    }
    if (page == '') {
      if (loggedIn) {
        this._authenticateService.navigateToLoggedInRedirectPage();
      } else {
        this._authenticateService.navigateToNotLoggedInRedirectPage();
      }
      return false;
    }
    if (page == 'dashboard' && !loggedIn) {
      this._authenticateService.navigateToNotLoggedInRedirectPage();
      return false;
    }
    return true;
  }
}
