import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@Component({
  selector: 'sh-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  @Input() text: {text: String, dismiss?: String, okay?: String, } | any;
  @Input() template;
  @Input() type: 'success' | 'warning' | 'danger' | 'default' | 'info' = 'info';
  @Output() okay = new EventEmitter();
  @Output() dismiss = new EventEmitter();

  showToast: boolean;
  constructor(private _notifService: FloatNotificationService) { }

  ngOnInit() {
    this._notifService.toastConfigSubject.asObservable().subscribe(config => {
      this.text = config;
    });

    this._notifService.showToastOb.subscribe( show => {
      this.showToast = show;
    })
  }

  okayClicked() {
    this.okay.emit();
    this._notifService.toastOkaySubject.next();
  }

  dismissClicked() {
    this.dismiss.emit();
    this._notifService.toastDismissSubject.next();
    this.showToast = false;
  }
}
