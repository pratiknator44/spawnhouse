import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
@Injectable()
export class ProfileGuardService implements CanActivate {

    constructor(private _router: Router) {}

    canActivate(): boolean {
        if(sessionStorage.getItem('sh_auth_token')){
            // check for expiry of the token as well here
            return true;
        }
        this._router.navigate(['/login']);
        return false;
    }
}