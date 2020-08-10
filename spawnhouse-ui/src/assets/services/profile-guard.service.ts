import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './storage.service';
@Injectable()
export class ProfileGuardService implements CanActivate {

    constructor(private _router: Router, private _storageService: StorageService) {}

    canActivate(): boolean {
        if(sessionStorage.getItem('sh_auth_token')){
            this._storageService.setUserFromSession();
            return true;
        }
        this._router.navigate(['/login']);
        return false;
    }
}