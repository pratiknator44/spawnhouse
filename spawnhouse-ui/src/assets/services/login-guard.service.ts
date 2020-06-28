import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
@Injectable()
export class LoginGuardService implements CanActivate {

    constructor(private _router: Router) {}

    canActivate(): boolean {        // if token is present, redirect to profile page
        console.log('sessionStorage.getItem(sh_auth_token) = ', sessionStorage.getItem('sh_auth_token'));
        if(sessionStorage.getItem('sh_auth_token')){
            // check for expiry of the token as well here
            this._router.navigate(['/profile']);        
            console.log('login guard true');
            return false;
        }
        console.log('login guard false');
        return true;
    }
}