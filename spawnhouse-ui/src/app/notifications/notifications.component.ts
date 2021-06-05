import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';

@Component({
  selector: 'sh-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements AfterViewInit, OnChanges {

  @Input() notifications;
  @Output() close = new EventEmitter();
  @Output() notificationClicked = new EventEmitter();

  constructor( private _apiService: APIservice,
    private _router: Router ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.notifications = changes['notifications']['currentValue'];
    this.getUserdata();
  }

  ngAfterViewInit(): void {
    this.getUserdata();
  }

  getUserdata() {
    const l = this.notifications.length;
    for(let x = 0; x < l; x++) {
      this.notifications[x]['dpLink'] = this._apiService.getUserImageById('dp', this.notifications[x].userid);
    }
  }

  onNotificationClick(i) {

    // if notification is not seen, make it seen if the user clicks
    if(!this.notifications[i].seen) this.markAsRead(i);

    if(this.notifications[i].type === 'FLG') {
      this._router.navigate(['/'+this.notifications[i].userid]);
    }
  }

  gotoNPpost(npfeedid) {
    this._router.navigate(['/view-post/'+npfeedid]);
  }

  markAsRead(i) {
    this._apiService.markNotificationRead(this.notifications[i]._id).then(res => {
      console.log("notification read success = ", res['message']);
      this.notifications[i].seen = true;
      this.notificationClicked.emit(i);
    });
  }

}
