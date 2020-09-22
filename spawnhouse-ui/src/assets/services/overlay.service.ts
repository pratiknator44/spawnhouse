import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable()
export class OverlayService {

    showSubject = new Subject<boolean>();
    clickedSubject = new Subject<MouseEvent>();
    configSubject = new Subject<any>();
    closeSubject = new Subject();
    constructor() {}
}