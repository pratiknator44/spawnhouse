import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { APIvars } from "../variables/api-vars.enum";
import { APIservice } from "./api.service";

@Injectable({
    providedIn: 'root'
})
export class PushNotificationsService {
    constructor(private _apiService: APIservice) { }

    addPushSubscriber(pushOb: any) {
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._apiService.http.post(APIvars.APIdomain+'/'+APIvars.SAVE_PUSH_NOTIFICATIONS_OBJECT, pushOb, {headers: headers});
    }

    send() {
        return this._apiService.http.post('/api/newsletter', null);
    }

    askForPermission() {
        Notification.requestPermission().then(response => {
            return response
        }).catch(error => {
            return error
        });
    }

    getSampleData() {
        return this._apiService.http.get('/pushnotifications/sample')
    }
}