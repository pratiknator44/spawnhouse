import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIvars } from '../variables/api-vars.enum';
import { Router } from '@angular/router';
import {tap} from 'rxjs/operators';
import { UserService } from './user.service';
import { FloatNotificationService } from './float-notification.service';
import { CookieService } from 'ngx-cookie-service';
import { DurationsEnum } from '../variables/toasts.enum';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private _userService: UserService,
      private _floatNotifService: FloatNotificationService,
      private _cookieService: CookieService,
      private _router: Router) {}
    
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      request = request.clone({
          setHeaders: {
            Authorization: 'Bearer '+sessionStorage.getItem('sh_auth_token') || '',
            'Access-Control-Allow-Origin': APIvars.APIallowAll,
          }
        });
        
        return next.handle(request).pipe( tap(() => {},
        err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this._floatNotifService.makeToast.next({heading: 'Logged Out', text:'Your have been logged out due to an authorized activity. If this was mistake, please contact us on help', icon: 'iconset icon-user', type: 'danger', duration: DurationsEnum.VERY_LONG});
          }
          return;
        }
      }));
  }
}