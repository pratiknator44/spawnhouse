import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';

@Injectable()

export class WildcardGuardService implements CanActivate {
    constructor(private _router: Router) { }

    canActivate(): boolean {        // if token is present, redirect to profile page
        if(sessionStorage.getItem('sh_auth_token')){
            // check for expiry of the token as well here
            this._router.navigate(['/not-found']);
            return true;
        }
        this._router.navigate(['/login']);        // navigate to profile if token is present and hasnt expired yet
        return false;
    }
}