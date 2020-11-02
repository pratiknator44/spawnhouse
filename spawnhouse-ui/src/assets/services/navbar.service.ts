import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable()
export class NavbarService {
    getDpSubject = new Subject<boolean>();
    dpUpdated = new Subject<{type: string, src: any}>();        // update dp in navbar
    isLoggedIn = new Subject<boolean>();
    showOption = new Subject<string>();
    refreshUser = new Subject();    // update user fname in navbar
    constructor() {}
}