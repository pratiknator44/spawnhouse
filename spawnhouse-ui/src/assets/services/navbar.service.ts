import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { APIvars } from '../variables/api-vars.enum';

@Injectable()
export class NavbarService {
    getDpSubject = new Subject<boolean>();
    dpUpdated = new Subject<{type: string, src: any}>();        // update dp in navbar
    isLoggedIn = new Subject<boolean>();
    showOption = new Subject<string>();
    refreshUser = new Subject();    // update user fname in navbar
    refreshUnseenMessages = new Subject();
    selectedConvo: any;        // present a conversation during message component loading
    unseenMessagesRecord = [];
    constructor(
        private _http: HttpClient
    ) {}

    
  async getUnseenMessageCount() {
    return await this._http.get(APIvars.APIdomain+'/'+APIvars.GET_UNSEEN_MESSAGE_COUNT).toPromise().then(result => {
        console.log('count ', result);
        return result['count'] === 0 ? '': result['count']});
    }
}