import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ServersideEventService {

    getEventSource(url: string): EventSource {
        return new EventSource(url);
    }
}