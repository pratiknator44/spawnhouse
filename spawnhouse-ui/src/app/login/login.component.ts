import { Component, OnInit, Renderer2, NgZone, } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APIvars } from '../../assets/variables/api-vars.enum';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { NavbarService } from 'src/assets/services/navbar.service';
import { CookieService } from 'ngx-cookie-service';
declare var gapi: any;

@Component({
  selector: 'sh-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  verficationProgress: Boolean = false;
  rememberMe: Boolean = false;
  constructor(private _metaService: Meta,
    _ngZone: NgZone,
    private _storageService: StorageService,
    private _renderer: Renderer2,
    private _http: HttpClient,
    private _router: Router,
    private _navbarService:  NavbarService,
    private _cookieService: CookieService,
    private _titleService: Title
    ) {
      window['onSignIn'] = user => _ngZone.run( () => {
      this.onSignIn(user);
    });
  }

  ngOnInit() {
    this._titleService.setTitle('Spawnhouse');
    this.injectGoogleScript();
    // check for autologin
    if(this._cookieService.get('past_token')) {
      this.verifyTokenAndSignin(this._cookieService.get('past_token'));
    }
    console.log("past token: ", this._cookieService.get('past_token'));
  }

  onSignIn(gUser) {
    if(this.verficationProgress)  return;
    this.verficationProgress = true;
    const user = gUser.getBasicProfile();
    gapi.auth2.getAuthInstance().signOut().then(function () {
    });
    this.verifyTokenAndSignin(gUser.getAuthResponse().id_token);
  }

  verifyTokenAndSignin(token) {
    this._http.get(APIvars.APIdomain+'/signup/verification/'+token).toPromise().then(res => {
      if(this.rememberMe) {
        this._cookieService.set('past_token', token)
      }
      this._storageService.setSessionData('sh_auth_token', res['auth_token']);
      this._storageService.currentUser = res['user'];
      this._storageService.setSessionData('user', JSON.stringify(res['user']));
      this._navbarService.isLoggedIn.next(true);
      

      this.verficationProgress = false;

      if('newUser' in res && res['newUser'])
        this._router.navigate(['/profile']);
      else
      this._router.navigate(['/home']);
    });
  }

  injectGoogleScript() {
    let scr = this._renderer.createElement('script');
    scr.src = APIvars.APIgoogleSignup;
    scr.defer = true;
    scr.async = true;
    this._renderer.appendChild(document.body, scr);
    this._metaService.addTags([{name: 'google-signin-client_id', content: APIvars.GOOGLE_PROVIDER}]);
  }
}
