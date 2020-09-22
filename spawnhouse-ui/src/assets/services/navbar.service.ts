import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable()
export class NavbarService {
    getDpSubject = new Subject<boolean>();
    dpUpdated = new Subject<{type: string, src: any}>();
    
    constructor() {}
}