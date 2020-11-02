import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable()
export class UserService {

    bg = ['primary', 'warning', 'success', 'theme', 'danger'];
    
    constructor(private _http: HttpClient) {
    }
}