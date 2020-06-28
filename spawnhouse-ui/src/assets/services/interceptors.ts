import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIvars } from '../variables/api-vars.enum';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor() {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
              Authorization: sessionStorage.getItem('sh_auth_token') || '',
              'Access-Control-Allow-Origin': APIvars.APIallowAll
            }
          });
          return next.handle(request);
    }
}