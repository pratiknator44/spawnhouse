import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { APIvars } from '../variables/api-vars.enum';
import { StorageService } from './storage.service';

@Injectable()
export class UserService {

    minimessageConfigSubject = new Subject();
    minimessageFiredSubject = new Subject<any>();

    bg = ['primary', 'warning', 'success', 'theme', 'danger'];    
    constructor(private _http: HttpClient,
      private _storageService: StorageService,
      private _cookieService: CookieService,
      private _router: Router) {}

    saveLocation(location) {
      this._http.post(APIvars.APIdomain+'/'+APIvars.SET_LOCATION,{location: location}).subscribe( result => {
        console.log('location saved', result);
      });
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

  sendMessage(targetUser, message) {
    this._http.post(APIvars.APIdomain+'/'+APIvars.SEND_MESSAGE, {targetUser, message}).subscribe( result => {
      console.log(result);
    });
  }

  getFollowData(type: string, id?) {
    if(type === 'Followers')
    return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOWERS+'/'+(id || '')).toPromise();

    else
    return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOWING+'/'+(id || '')).toPromise();
  }

}