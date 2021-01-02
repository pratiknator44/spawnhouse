import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { APIvars } from '../variables/api-vars.enum';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    socket;
    constructor() {
        this.socket = io('http://localhost:3000');
        this.socket.on('disconnect', () => console.log("socket disonnected"));
    }
    listen(eventName: string) {
        return new Observable( subscriber => {
            this.socket.on(eventName, data => {
                subscriber.next(data);
            });
        });
    }

    emit(eventName: string, data) {
        console.log("Sending data to socket ", this.socket.connected);
        this.socket.emit(eventName, data);
    }
}