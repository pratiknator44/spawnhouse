import { Injectable } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { FloatNotificationSchema } from '../interfaces/float-notification-config.interface';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
@Injectable()
export class FloatNotificationService {

    config = new Subject<FloatNotificationSchema>();
    progress = new Subject<any>();
    closeOn = new Subject<boolean>();
    
    showToastSubject = new Subject<boolean>();
    showToastOb = this.showToastSubject.asObservable();
    toastConfigSubject = new Subject();
    toastOkaySubject = new Subject();
    toastDismissSubject = new Subject();
    getLocationSubject = new Subject();
    constructor(private _storageService: StorageService,
        private _userService: UserService,
        private _titleService: Title) {}

    createFloat() {
    }

    configToast(text, dismiss?, okay?) {
        this.toastConfigSubject.next({
            text,
            dismiss,
            okay
        });
    }
     
    checkForLocation() {
        if(!this._storageService.getSessionData('location')) {
            this.configToast('Getting your location helps us to find people around with common interests', 'Later', 'Enable Location');
        this.showToastSubject.next(true);

        this.toastOkaySubject.asObservable().subscribe(okay => {
            this.configToast("Getting Location...", "Dismiss");
            this.getLocationToast();
        });
        }
    }

    getLocationToast() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(location => {
                console.log("new location: ", location);
                const formattedLocation = [location['coords']['latitude'], location['coords']['longitude'] ];   
        
                this._storageService.setSessionData('location', JSON.stringify(formattedLocation));

                this._userService.saveLocation(formattedLocation);
                
                this.getLocationSubject.next(formattedLocation);
                console.log("formatted location = ", formattedLocation);
                this.configToast("Getting Location... Found you :D", "Dismiss");
                setTimeout( () => {
                    this.showToastSubject.next(false);
                }, 2000);
            },
            showError => {
                this.configToast("Error getting location.  Some features might not work correctly "+showError, "Dismiss");
            // alert("Error getting location.  Some features might not work correctly");
            });
        } else {
            this.configToast("Error getting location. Some features might not work correctly", "Dismiss");
        }
    }

    setTitle(title: string) {
        this._titleService.setTitle(title);
    }
    getTitle() {
        return this._titleService.getTitle();
    }
    
}