import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';

@Component({
  selector: 'sh-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  animations: [trigger('fade', [
    transition('void => active', [ // using status here for transition
      style({ opacity: 0 }),
      animate(250, style({ opacity: 1 }))
    ]),
    transition('* => void', [
      animate(250, style({ opacity: 0 }))
    ])
  ])
  ]
})
export class UserCardComponent {

  @Input() carddata;
  @Output() userClicked = new EventEmitter();
  @Output() loadmore = new EventEmitter();

  @HostListener('window: scroll', ['$event']) onScroll(e: Event): void {
    if (
      (e.target['scrollingElement'].scrollTop / (e.target['scrollingElement'].scrollHeight
        - e.target['scrollingElement'].clientHeight)) > 0.75) {
      this.loadMoreUsers();
    }
  }
  constructor(private _apiService: APIservice) { }

  addRemoveUser(id, index) {
    this._apiService.addRemoveFollower(this.carddata[index]['isFollowing'] ? '' : 'Follow', id).then(resolve => {
      if (resolve['message'] === "passed") {
        this.carddata[index]['isFollowing'] = !this.carddata[index]['isFollowing'];
      }
    });
  }

  usernameClicked(_id) {
    this.userClicked.emit(_id);
  }

  removeByIndex(i) {
    this.carddata.splice(i, 1);
  }

  loadMoreUsers() {
    // console.log("load more fired...");
    this.loadmore.emit('users');
  }


}
