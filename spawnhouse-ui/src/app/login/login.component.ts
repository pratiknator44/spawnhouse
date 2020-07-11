import { Component, OnInit, Renderer2, NgZone, Inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { APIvars } from '../../assets/variables/api-vars.enum';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
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
  gender: '' | 'f' | 'm' | 'o' = '';

  constructor(private _metaService: Meta,
    private _renderer: Renderer2,
    ngZone: NgZone,
    private _http: HttpClient,
    private _storageService: StorageService,
    private _router: Router,
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
  }

  fbLogin() {
  }

  onSignIn(gUser) {
    let user = gUser.getBasicProfile();
    gapi.auth2.getAuthInstance().signOut().then(function () {
      console.log('User signed out.');
    });


    let newUser = JSON.stringify({'fname': user.getGivenName(), 'lname': user.getFamilyName(), 'email': user.getEmail(), 'gender': ''});

    this._http.post(APIvars.APIdomain+'/'+APIvars.APIlogin,
      {newUser}).subscribe( data => {
        console.log(data);
        this._storageService.setSessionData('sh_auth_token', data['auth_token']);
        this._router.navigate(['/profile']);
      });
  }

  submitForm() {
    if(this.fname.trim() !== '' && this.lname.trim() !== '') {
      this._http.post(APIvars.APIdomain+'/'+APIvars.APIlogin,
      {fname: this.fname, lname: this.lname, email:this.email, gender: this.gender}).subscribe( data => {
        this._storageService.setSessionData('sh_auth_token', data['auth_token']);
        this._router.navigate(['/profile']);
      });
    }
  }
}
