import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
@Injectable()
export class FloatNotificationService {

    progress = new Subject<any>();
    closeOn = new Subject<boolean>(); 
    constructor() {}

    createFloat() {
    }
}