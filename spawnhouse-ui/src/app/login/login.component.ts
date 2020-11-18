import { Component, OnInit, Renderer2, NgZone, Inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { APIvars } from '../../assets/variables/api-vars.enum';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavbarService } from 'src/assets/services/navbar.service';
import { CookieService } from 'ngx-cookie-service';
import { OverlayService } from 'src/assets/services/overlay.service';
declare var gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  fname: string;
  lname: string;
  email: string | number;
  password: string;
  gender: '' | 'f' | 'm' | 'o' = '';
  loginForm: FormGroup;
  signupForm: FormGroup;
  loginError: String = '';
  rememberMe = false;
  loginFlags = {showOTPEntry: false, otpresent: false, confirmingOTP: false, gettingOTP: false, otpErrorText: null, showForgotPassword: false, submittingPasswordRecovery: false, recoveryLinkSent: false};
  recoverPassword = {user: null, recaptchaKey: null, assocEmail: null};
  otp: String;
  constructor(private _metaService: Meta,
    private _renderer: Renderer2,
    ngZone: NgZone,
    private _http: HttpClient,
    private _storageService: StorageService,
    private _router: Router,
    private _navService: NavbarService,
    private _cookieService: CookieService,
    private _overlayService: OverlayService
    ) {
      window['onSignIn'] = user => ngZone.run( () => {
      this.onSignIn(user);
    });
  }
  
  ngOnInit(): void {
    // google script injection
    let scr = this._renderer.createElement('script');
    scr.src = APIvars.APIgoogleSignup;
    scr.defer = true;
    scr.async = true;
    this._renderer.appendChild(document.body, scr);
    this._metaService.addTags([{name: 'google-signin-client_id', content: APIvars.GOOGLE_PROVIDER}]);

    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberme: new FormControl(false)
    });

    this.signupForm = new FormGroup({
      fname: new FormControl('', Validators.required),
      lname: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      gender: new FormControl(''),
      tnc: new FormControl(''),
      signedVia: new FormControl('')
    });

    this.autoLogin();
  }

  autoLogin() {
    if(this._cookieService.get('username') && this._cookieService.get('password')) {
      this.loginForm.patchValue({
        username: this._cookieService.get('username'),
        password: this._cookieService.get('password')
      });
    }
    this.attemptLogin();
  }

  attemptLogin() {
    if(!this.loginForm.valid) {
      return;
    }
    if(this.loginForm.get('rememberme').value) {
      this._cookieService.set('username', this.loginForm.get('username').value);
      this._cookieService.set('password', this.loginForm.get('password').value);
    }
    this._http.post(APIvars.APIdomain+'/'+APIvars.APIattemptLogin, this.loginForm.value).subscribe( data => {
      if(data) {
        this.onLoginSuccess(data);
      }
    })
  }

  fbLogin() {
  }

  onSignIn(gUser) {
    let user = gUser.getBasicProfile();
    gapi.auth2.getAuthInstance().signOut().then(function () {
      console.log('Google sign out success');
    });

    // let logginUser = {'fname': user.getGivenName(), 'lname': user.getFamilyName(), 'email': user.getEmail(), 'gender': '', 'type': 'Google'};
    this.signupForm.patchValue({
      fname:  user.getGivenName(),
      lname: user.getFamilyName(),
      email: user.getEmail(),
      pass: user.getEmail(),    // email assigned to password
      gender: '',
      tnc: true,
      signedVia: 'Google'
    });

    this._http.post(APIvars.APIdomain+'/'+APIvars.APIsignup, this.signupForm.value).subscribe( data => {
        this.onLoginSuccess(data);
      });
  }

  setupOTP(resend?) {
    if(this.loginFlags.gettingOTP) return;
    this.loginError = '';
    this.loginFlags.gettingOTP = true;
    if(this.signupForm.get('fname').value.trim() !== '' && this.signupForm.get('lname').value.trim() !== ''){
      this.signupForm.patchValue({
        signedVia: 'mail'
      });
      this._http.get(APIvars.APIdomain+'/'+APIvars.APIemailOTP+'/'+(resend ? '-' : '')+this.signupForm.get('email').value).subscribe( confirmation => {
        if(confirmation['message'] === 'passed') {
          this._overlayService.configSubject.next({closeOnClick: false, transparent: false});
          this._overlayService.showSubject.next(true);
          this.otp = null;
          this.loginFlags.otpErrorText = null;
          this.loginFlags.showOTPEntry = true;
          this.loginFlags.gettingOTP = false;
        }
      });
    }
  }

  attemptSignUp() {
    console.log(this.signupForm.value);
    this._http.post(APIvars.APIdomain+'/'+APIvars.APIsignup, this.signupForm.value).subscribe( data => {
      console.log('data ', data);
      if(data['message'] === 'passed') {
        this._overlayService.showSubject.next(false);
        this.onLoginSuccess(data);
      } else {
        this.loginFlags.otpErrorText = data['error'];
      }
    }, error => {
      this.loginError = error['error']['message'];
    });
  }

  confirmOTP() {
    if(this.loginFlags.gettingOTP) return;

    this.loginFlags.confirmingOTP = true;
    this._http.get(APIvars.APIdomain+'/'+APIvars.CONFIRM_OTP+'/'+this.otp+'/'+this.signupForm.get('email').value).subscribe(confirm => {
      console.log('confirmation ', confirm);
      if(confirm['valid']) {
       this.attemptSignUp();
      }
      else {
        this.loginFlags.otpErrorText = confirm['error'];
      }
      this.loginFlags.confirmingOTP = false;
    });
  }

  onLoginSuccess(data) {
    this._storageService.setSessionData('sh_auth_token', data['auth_token']);
    sessionStorage.setItem('user', data['user']);
    this._storageService.currentUser = data['user'];
    this._storageService.setSessionData('user', JSON.stringify(data['user']));
    this._navService.isLoggedIn.next(true); 
    this._router.navigate(['/home']);
  }

  injectRecaptchaScript() {
    // inject recaptcha script the script
    let scr = this._renderer.createElement('script');
    scr.src = APIvars.APIrecaptcha;
    scr.defer = true;
    scr.async = true;
    this._renderer.appendChild(document.body, scr);

    // open overlay
    this._overlayService.configSubject.next({closeOnClick: false, transparent: false});
    this._overlayService.showSubject.next(true);
    this.loginFlags.showForgotPassword = true;
  }

  resolved(event) {
    this.recoverPassword.recaptchaKey = event;
  }

  attemptGetRecoveryLink() {
    this.loginFlags.submittingPasswordRecovery = true;
    console.log(this.recoverPassword);
    this._http.get(APIvars.APIdomain+'/'+APIvars.RECOVERY+'/'+this.recoverPassword.recaptchaKey+'/'+this.recoverPassword.user).subscribe( result => {
      if(result['message'] === 'passed') {
        this.recoverPassword.assocEmail = result['email'];
        this.loginFlags.recoveryLinkSent = true;
      }
    });
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
  }
}
