import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from './storage.service';

@Injectable()
export class UserService {

    bg = ['primary', 'warning', 'success', 'theme', 'danger'];
    
    constructor(private _http: HttpClient, private _storageService: StorageService, private _cookieService: CookieService, private _router: Router) {
    }

    getLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(loc => {
                console.log(loc);
                return {long: loc.coords.longitude, lat: loc.coords.latitude, accuracy: loc.coords.accuracy};
            }, error => {
                console.log(error);
                return null;
            });
        } else {
            return null;
        }
    }


  logout() {
    this.relogin();
    this._cookieService.deleteAll('');
  }

  relogin() {
    this._storageService.reset();
    // this._cookieService.deleteAll('');
    this._router.navigate(['./login']);
  }
}