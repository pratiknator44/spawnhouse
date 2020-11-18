import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable()
export class UserService {

    bg = ['primary', 'warning', 'success', 'theme', 'danger'];
    
    constructor(private _http: HttpClient) {
    }

    getLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(loc => {
                console.log(loc);
                return {long: loc.coords.longitude, lat: loc.coords.latitude, accuracy: loc.coords.accuracy};
            }, error => {
                console.log(error);
                return null;
            });
        } else {
            return null;
        }
    }
}