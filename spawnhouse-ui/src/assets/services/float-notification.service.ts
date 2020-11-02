import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { FloatNotificationSchema } from '../interfaces/float-notification-config.interface';
@Injectable()
export class FloatNotificationService {

    config = new Subject<FloatNotificationSchema>();
    progress = new Subject<any>();
    closeOn = new Subject<boolean>();
    
    constructor() {}

    createFloat() {
    }
}