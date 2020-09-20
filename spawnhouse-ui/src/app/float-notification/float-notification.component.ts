import { Component, Input, OnInit } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@Component({
  selector: 'sh-float-notification',
  templateUrl: './float-notification.component.html',
  styleUrls: ['./float-notification.component.scss']
})
export class FloatNotificationComponent implements OnInit {

  @Input() config: any;
  @Input() animate = true;
  currentProgress = '0';
  isVisible = false;
  constructor(private _notifService: FloatNotificationService) { }

  ngOnInit(): void {
    this._notifService.progress.asObservable().subscribe( status => {
          this.currentProgress = status;
    });
    
    this._notifService.closeOn.asObservable().subscribe( status => {
      this.isVisible = status;
    });
  }

  closeThisNotification() {
    this._notifService.closeOn.next(false);
  }
}
