import { Injectable, Type } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { FloatNotificationSchema } from '../interfaces/float-notification-config.interface';
import { DurationsEnum } from "../variables/toasts.enum";
import { StorageService } from './storage.service';
import { UserService } from './user.service';
@Injectable()
export class FloatNotificationService {

    config = new Subject<FloatNotificationSchema>();
    progress = new Subject<any>();
    closeOn = new Subject<boolean>();
    showToasts = new Subject<boolean>();
    makeToast = new Subject<any>();

    getLocationSubject = new Subject();
    constructor(private _storageService: StorageService,
        private _userService: UserService,
        private _titleService: Title) {}

     
    checkForLocation() {
        this.askLocation();
        if(!this._storageService.getSessionData('location')) {
            this.askLocation();
            // this.configToast('Getting your location helps us to find people around with common interests', 'Later', 'Enable Location');
        // this.showToastSubject.next(true);
        }
    }

    askLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(location => {
                // console.log("new location: ", location);
                const formattedLocation = [location['coords']['latitude'], location['coords']['longitude'] ];   
        
                // save location in userService and session
                this._storageService.setSessionData('location', JSON.stringify(formattedLocation));
                this._userService.saveLocation(formattedLocation);

                // broadcast location to needy modules
                // console.log("formattedLocation ", formattedLocation);
                this.getLocationSubject.next(formattedLocation);

                // toast
                // this.makeToast.next({heading: 'Location', text:'Location updated', icon: 'iconset icon-location', type: 'success', duration: DurationsEnum.SHORT});
                setTimeout( () => {
                }, 2000);
            },
            showError => {
                // this.makeToast.next({heading: "error", text: "Couldn\'t get your location, please Allow"});
            });
        } else {
            this.makeToast.next({heading: "error", text: "Seems your browser doesn\'t support location sharing. Some features might not work"});
        }
    }
    

    setTitle(title: string) {
        this._titleService.setTitle(title);
    }
    getTitle() {
        return this._titleService.getTitle();
    }
    
}