import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { NavbarService } from './navbar.service';
import { StorageService } from './storage.service';
@Injectable()
export class ProfileGuardService implements CanActivate {

    constructor(private _router: Router,
        private _storageService: StorageService,
        private _navService: NavbarService) { }

    canActivate(router: ActivatedRouteSnapshot): boolean {
        // console.log(router);
        if (sessionStorage.getItem('sh_auth_token')) {
            // if user is accessing his own profile, it should route to /profile and not /:ownUserID
            // this is handled in profile component
            this._storageService.setUserFromSession();
            this._navService.isLoggedIn.next(true);
            return true;
        }
        else if (router.url[0].path.length === 24) {
            // const userId = router.url[0].path
            this._router.navigate(['/user/' + router.url[0].path]);
            return true;
        } else {
            this._router.navigate(['/login']);
            this._navService.isLoggedIn.next(false);
            return false;
        }

    }
}