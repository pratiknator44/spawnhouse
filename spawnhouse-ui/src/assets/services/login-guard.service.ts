import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavbarService } from './navbar.service';
@Injectable()
export class LoginGuardService implements CanActivate {

    isLoggedInSubject = new Subject;

    constructor(private _router: Router, private _navService: NavbarService) {}

    canActivate(): boolean {        // if token is present, redirect to profile page
        console.log('sessionStorage.getItem(sh_auth_token) = ', sessionStorage.getItem('sh_auth_token'));
        if(sessionStorage.getItem('sh_auth_token')){
            // check for expiry of the token as well here
            this._router.navigate(['/profile']);        
            console.log('login guard 0, going to profile');
            this._navService.isLoggedIn.next(true);      // for navbar
            return false;
        }
        console.log('login guard true');
        this._navService.isLoggedIn.next(false);
        return true;
    }
}