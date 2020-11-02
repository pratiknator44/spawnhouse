import { Component, Input, OnInit } from '@angular/core';
import { FloatNotificationSchema } from 'src/assets/interfaces/float-notification-config.interface';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@Component({
  selector: 'sh-float-notification',
  templateUrl: './float-notification.component.html',
  styleUrls: ['./float-notification.component.scss']
})
export class FloatNotificationComponent implements OnInit {

  @Input() config: FloatNotificationSchema;
  @Input() animate = true;
  currentProgress = '0';
  constructor(private _notifService: FloatNotificationService) { }

  ngOnInit(): void {
    this._notifService.progress.asObservable().subscribe( status => {
      this.currentProgress = status;
    });
  }

  closeThisNotification() {
    this._notifService.closeOn.next(false);
  }
}
