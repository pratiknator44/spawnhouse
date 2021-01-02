import { Injectable, NgZone } from "@angular/core";
import { Observable } from 'rxjs';
import { ServersideEventService } from './serverside-event.service';

@Injectable({
    providedIn: 'root'
})
export class GetServersideEventService {
    constructor(private _ngZone: NgZone, private _sseService: ServersideEventService) { }

    // importing ngzone cuz it alerts angular that something has happened outside the framework

    getServersideEvent(url: string) {
        console.log('inside the getServersideEvent() ');
        return new Observable(ob => {
            
            const eventSource = new EventSource(url, {withCredentials: false});
            console.log('event Source ', eventSource);

            // eventSource.onopen = () => {console.log('connection opened'); ob.next('opened')};

            eventSource.addEventListener('open', data => {
                console.log('got open ', data.type);
                this._ngZone.run( () => {
                ob.next(data.type);
                });
            });
            eventSource.addEventListener('message', data => {
                console.log('got message ', data);
                ob.next(data);

                this._ngZone.run( () => {
                    ob.next(data);
                });
                console.log('event zonejs ', event);
            });

            eventSource.onerror = error => {
                console.error('some erro in messages ', error);
                this._ngZone.run( () => {ob.error; eventSource.close();});
            };
        });
    }
}