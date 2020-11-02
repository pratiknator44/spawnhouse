import { Component, OnInit, Renderer2, NgZone, Inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { APIvars } from '../../assets/variables/api-vars.enum';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavbarService } from 'src/assets/services/navbar.service';
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
  showForgotPassword: boolean;
  loginError: String = '';

  constructor(private _metaService: Meta,
    private _renderer: Renderer2,
    ngZone: NgZone,
    private _http: HttpClient,
    private _storageService: StorageService,
    private _router: Router,
    private _navService: NavbarService
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

  }

  attemptLogin() {
    if(!this.loginForm.valid) {
      return;
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
    console.log(user.getGivenName());
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

  attemptSignUp() {
    this.loginError = '';
    if(this.signupForm.get('fname').value.trim() !== '' && this.signupForm.get('lname').value.trim() !== ''){
      this.signupForm.patchValue({
        signedVia: 'mail'
      });
      console.log(this.signupForm.value);
      this._http.post(APIvars.APIdomain+'/'+APIvars.APIsignup, this.signupForm.value).subscribe( data => {
        console.log('data     ', data);
        this.onLoginSuccess(data);
      }, error => {
        this.loginError = error['error']['message'];
      });
    }
  }

  onLoginSuccess(data) {
    this._storageService.setSessionData('sh_auth_token', data['auth_token']);
    sessionStorage.setItem('user', data['user']);
    this._storageService.currentUser = data['user'];
    this._storageService.setSessionData('user', JSON.stringify(data['user']));
    this._navService.isLoggedIn.next(true); 
    this._router.navigate(['/home']);
  }

  forgotPassword() {
    // inject the script

    let scr = this._renderer.createElement('script');
    scr.src = APIvars.APIrecaptcha;
    scr.defer = true;
    scr.async = true;
    this._renderer.appendChild(document.body, scr);
  }

  resolved(event) {
    console.log(event);
  }
}
