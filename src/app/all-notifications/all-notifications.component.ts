import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { NavbarService } from 'src/assets/services/navbar.service';

@Component({
  selector: 'sh-all-notifications',
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.scss']
})
export class AllNotificationsComponent implements OnInit {

  notifications = [];
  flags = { notificationsLoading: false, notificationsEnd: false };
  pageNo = 1;

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    if (window.scrollY/(document.body.scrollHeight-window.innerHeight)  >= 1 ) {
      console.log("hello trigger scroll");
      this.getNotifications(false);
    }
  }

  constructor(private _apiService: APIservice,
    private _router: Router,
    private _navbarService: NavbarService) { }

  ngOnInit(): void {
    this._navbarService.selectedOption.next(null);
    this.getNotifications(true);
  }


  getNotifications(refresh?) {
    // if(this.flags.notificationsEnd) return;
    if (this.flags.notificationsLoading || this.flags.notificationsEnd) return;

    if (refresh) this.pageNo = 1;
    this.flags.notificationsLoading = true;
    this._apiService.getNotifications(this.pageNo).then(result => {
      let temp = result['result'];

      const l = temp.length;

      if (l === 0) {
        this.flags.notificationsLoading = false;
        this.flags.notificationsEnd = true;
        return;
      };

      for (let x = 0; x < l; x++) {
        temp[x]['dpLink'] = this._apiService.getUserImageById('dp', temp[x].userid);
      }
      this.flags.notificationsLoading = false;
      if (refresh) {
        this.notifications = temp;
      } else {
        this.notifications.push(...temp);
      }
      ++this.pageNo;
    });
  }

  // getUserdata() {
  //   const l = this.notifications.length;
  //   for(let x = 0; x < l; x++) {
  //     this.notifications[x]['dpLink'] = this._apiService.getUserImageById('dp', this.notifications[x].userid);
  //   }
  // }

  onNotificationClick(i) {
    if (!this.notifications[i].seen) this.markAsRead(i);

    if (this.notifications[i].type === 'FLG') {
      this._router.navigate(['/' + this.notifications[i].userid]);
    }
  }

  gotoNPpost(npfeedid) {
    this._router.navigate(['/view-post/' + npfeedid]);
  }

  markAsRead(i) {
    this._apiService.markNotificationRead(this.notifications[i]._id).then(res => {
      this.notifications[i].seen = true;
    });
  }
}

