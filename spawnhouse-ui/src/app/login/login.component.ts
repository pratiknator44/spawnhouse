import { Component, OnInit, Renderer2, NgZone, ViewChild, AfterViewInit, } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APIvars } from '../../assets/variables/api-vars.enum';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { NavbarService } from 'src/assets/services/navbar.service';
import { CookieService } from 'ngx-cookie-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var gapi: any;

@Component({
  selector: 'sh-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  verficationProgress: Boolean = false;
  rememberMe: Boolean = true;
  hasLoggedOut: Boolean = false;
  eula = {greetText: 'Hi', eula: ''};
  loginFlags = {showAcceptTnCButton: true};
  errorText = null;
  email = ''; password = '';
  @ViewChild('eulaTemplate') eulaTemplate;

  constructor(private _metaService: Meta,
    _ngZone: NgZone,
    private _storageService: StorageService,
    private _renderer: Renderer2,
    private _http: HttpClient,
    private _router: Router,
    private _navbarService:  NavbarService,
    private _cookieService: CookieService,
    private _titleService: Title,
    private _modalService: NgbModal
    ) {
      window['onSignIn'] = user => _ngZone.run( () => {
      this.onSignIn(user);
    });
  }

  ngOnInit() {
    this._titleService.setTitle('Spawnhouse - showcase, team up and share your play');
    this.injectGoogleScript();
    // check for autologin
    if(this._cookieService.get('past_token')) {
      this.verifyTokenAndSignin(this._cookieService.get('past_token'));
    }
    // console.log("past token: ", this._cookieService.get('past_token'));
    // this.hasLoggedOut = true;

    // if user logs out, dont count it as a hit
    if(sessionStorage.getItem("addhit")) sessionStorage.removeItem("addhit");
    else  this._http.get(APIvars.APIdomain+'/'+APIvars.HITS).toPromise();
  }


  onSignIn(gUser) {
    if(this.verficationProgress)  return;
    this.verficationProgress = true;
    this.eula.greetText =  'Hi ' + gUser.getBasicProfile().getGivenName();
    gapi.auth2.getAuthInstance().signOut().then(function () {
    });
    this.verifyTokenAndSignin(gUser.getAuthResponse().id_token);
  }

  verifyTokenAndSignin(token) {
    this.errorText = null;
    this._http.get(APIvars.APIdomain+'/signup/verification/'+token).toPromise().then(res => {
      if(this.rememberMe) {
        this._cookieService.set('past_token', token);
        this._storageService.setLocalData('sh_auth_token', token);
      }
      this._storageService.setSessionData('sh_auth_token', res['auth_token']);
      this._storageService.currentUser = res['user'];
      this._storageService.setSessionData('user', JSON.stringify(res['user']));
      this._storageService.setLocalData('user', JSON.stringify(res['user']));
      this._navbarService.isLoggedIn.next(true);
      this.verficationProgress = false;

      if('newUser' in res && res['newUser']) {
        this.showEula();
        this.loginFlags.showAcceptTnCButton = true;
      }
      else {}
      this._router.navigate(['/home']);
    }).catch(error => {
      this.errorText = error['message'];
    });
  }

  injectGoogleScript() {
    let scr = this._renderer.createElement('script');
    scr.src = APIvars.APIgoogleSignup;
    scr.defer = true;
    scr.async = true;
    this._renderer.appendChild(document.body, scr);
    // check if the
    let token = APIvars.OAUTH_PUBLIC_KEY_WEB;
    // if(navigator.userAgent.toLowerCase().includes('android')) {
    //   this._metaService.addTag({'http-equiv': "Content-Security-Policy",
    //   content:"default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"});
    //   token = APIvars.OAUTH_PUBLIC_KEY_ANDROID;
    // }
    this._metaService.addTags([{name: 'google-signin-client_id', content: token}]);
  }

  routeToProfile() {
    this._router.navigate(['/profile']);
  }

  showEula() {
    this._modalService.open(this.eulaTemplate, { ariaLabelledBy: 'modal-basic-title', size: 'lg', backdrop: 'static'}).result.then((result) => {
    }, (reason) => {
    });

    this._http.get(APIvars.APIdomain+'/'+APIvars.GET_EULA).toPromise().then(data => {
      // console.log("data = ", data);
      if(data['message'] === 'passed') {
        this.eula.eula = data['eula'];
      } else {
        this.eula.eula = data['error'];
      }
    });
  }

  updateTnCAcceptance() {
    this._http.post(APIvars.APIdomain+'/'+APIvars.EULA_CONFIRM, {tnc: true, cookies: []}).toPromise().then(result => {
      console.log(result);
    });
  }

  showWhyGoogle(template) {
    this._modalService.open(template, { ariaLabelledBy: 'modal-basic-title', size: 'md'}).result.then((result) => {
    }, (reason) => {
    });
  }

  submitCreds() {
    if(this.email.trim().length === 0 && this.password.length === 0)  return;

    const creds = atob(this.email+' '+this.password);



  }
}
