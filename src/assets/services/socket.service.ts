import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';
import * as io from 'socket.io-client';
import { APIvars } from '../variables/api-vars.enum';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  observable: Rx.Observable<string>;
  socket;
  obList;
  msgCountOb;
  disconnectionListener;

  constructor( private _storageService: StorageService) {
    // this.socket = io(APIvars.APIdomain);
    this.obList = {
      'new-message': null,
      'new-message-count': null,
      'notification': null,
      'new-notification-count': null
    }
  }

  startConnection() {
    this.socket = io(APIvars.APIdomain, { query: "userid="+this._storageService.currentUser._id});
    console.log("**socket connection successful**");

    // registering socket:
    this.pushData('register-socket', {userid: this._storageService.currentUser._id.toString()})
  }

  getData(eventName): any {  // Rx.Observable<string> {
    this.observable = new Rx.Observable((observer) => 
      this.socket.on(eventName, data => observer.next(data))
    );
    return this.observable;
  }

  getMessageCountOb(): Rx.Observable<any> {
    this.msgCountOb = new Rx.Observable((observer) => 
      this.socket.on('new-message-count', (data) => {
        observer.next(data)
    }));
    return this.msgCountOb;
  }

  // This one is for sending data from angular to node 
  pushData(eventName, data) {
    this.socket.emit(eventName, data);
  }

  // listenToDisconnect() {
  //   console.log("started listneing to disconnect");
  //   this.disconnectionListener = new Rx.Observable(o => {
  //     this.socket.on('disconnect', () => {
  //       console.log("You have been disconnected ", this.socket.connected);
  //     });
  //   });
  // }
}