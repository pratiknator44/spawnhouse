import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { APIvars } from '../variables/api-vars.enum';
import { SocketService } from './socket.service';
import { StorageService } from './storage.service';

@Injectable()
export class NavbarService {
    getDpSubject = new Subject<boolean>();
    dpUpdated = new Subject<{type: string, src: any}>();        // update dp in navbar
    isLoggedIn = new Subject<boolean>();
    showOption = new Subject<string>();
    refreshUser = new Subject();    // update user fname in navbar
    refreshUnseenMessages = new Subject();
    npShowSubject = new Subject();
    selectedConvo: any;        // present a conversation during message component loading
    unseenMessagesRecord = [];
    audio: any;
    nppwdOb;        // observable to get data for np password
    selectedOption = new Subject<string>();
    constructor(
        private _http: HttpClient,
        private _socketService: SocketService,
        private _storageService: StorageService
    ) {
        this.audio = new Audio();
        this.audio.src = '../../assets/notification-sound.mp3';
        this.audio.load();
    }

    startSocketConnection() {
        // console.log("calling user online via socket");
            this._socketService.startConnection();
            this._socketService.pushData('user-online', this._storageService.currentUser._id.toString());
    }

    async getUnseenMessageCount() {
        return await this._http.get(APIvars.APIdomain+'/'+APIvars.GET_UNSEEN_MESSAGE_COUNT).toPromise().then(result => {
            console.log('count ', result);
            return result['count'] === 0 ? '': result['count']});
    }

    playNotificationSound() {
        this.audio.play();
    }
}