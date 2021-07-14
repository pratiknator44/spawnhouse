import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';

@Component({
  selector: 'sh-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnChanges {

  @Input() notifications;
  @Output() close = new EventEmitter();
  @Output() notificationClicked = new EventEmitter();

  constructor(private _apiService: APIservice,
    private _router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    this.notifications = changes['notifications']['currentValue'];
  }

  onNotificationClick(i) {
    // if notification is not seen, make it seen if the user clicks
    if (!this.notifications[i].seen) this.markAsRead(i);

    if (this.notifications[i].type === 'FLG' || this.notifications[i].type === 'NP') {
      this._router.navigate(['/' + this.notifications[i].userid]);
    } 
    else if(this.notifications[i].type === 'LIK' || this.notifications[i].type === 'COM') {
      this.gotoNPpost(this.notifications[i].associatednppostid);
    }
  }

  gotoNPpost(npfeedid) {
    this._router.navigate(['/view-post/' + npfeedid]);
  }

  markAsRead(i) {
    this._apiService.markNotificationRead(this.notifications[i]._id).then(res => {
      console.log("notification read success = ", res['message']);
      this.notifications[i].seen = true;
      this.notificationClicked.emit(i);
    });
  }

}
