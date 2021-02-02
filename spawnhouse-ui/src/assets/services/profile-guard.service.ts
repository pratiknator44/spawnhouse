import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
import { NavbarService } from './navbar.service';
import { SocketService } from "./socket.service";
import { StorageService } from './storage.service';
@Injectable()
export class ProfileGuardService implements CanActivate {

    constructor(private _router: Router,
        private _storageService: StorageService,
        private _navService: NavbarService) {}

    canActivate(): boolean {
        if(sessionStorage.getItem('sh_auth_token')){
            this._storageService.setUserFromSession();
            this._navService.isLoggedIn.next(true);
            return true;
        }
        this._router.navigate(['/login']);
        this._navService.isLoggedIn.next(false);
        return false;
    }
}