import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})
export class PasswordresetComponent implements OnInit {

  password: String = '';
  confirm: String = '';
  passwordMatch: boolean
  submitting: boolean;
  success: boolean;
  constructor( private _activeRoute: ActivatedRoute, private _http: HttpClient, private _router: Router) {
    window.onload = () => {
      document.getElementById('confirm').onpaste = e => e.preventDefault();
    }
  }

  ngOnInit(): void {
    const token = this._activeRoute.snapshot.params.token;
    console.log(token);
  }

  submitNewPassword() {
    if(this.submitting) return;
    this.submitting = true;
    if(this.passwordMatch) {
      this._http.post(APIvars.APIdomain+'/'+APIvars.CHANGE_PASSWORD, {p: this.confirm, token: this._activeRoute.snapshot.params.token}).subscribe( result => {
        console.log(result);
        this.submitting = false;
        if(result['message'] === 'passed') {
          this.success = true;
        }
      })
    }
  }

  gotoLogin() {
    this._router.navigate(['/login']);
  }
}
