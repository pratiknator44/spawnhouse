import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-aroundyou',
  templateUrl: './aroundyou.component.html',
  styleUrls: ['./aroundyou.component.scss']
})
export class AroundyouComponent implements OnInit {

  location;
  sessionLocation: any;
  radius: number;
  loadingText = 'Getting Suggestions...';
  pageNo = 1;
  userSuggestions = []; // {_id: <userid>, username: <username>, name: <name>, isFollower: <true/false>};
  ayFlags = {loadingContent: false, noMoreUsers: false};
  constructor(
    private _storageService: StorageService,
    private _floatNotifService: FloatNotificationService,
    private _apiService: APIservice,
    private _router: Router) {
    }

  ngOnInit(): void {

    this.userSuggestions = [];
    this.location = JSON.parse(this._storageService.getSessionData('location'));
    console.log("session location = ", this.sessionLocation);
    
    if(!this.location) {
      this.getLocation();
      return;
    }
    this.getSimilarUsers();
  }

  getSimilarUsers() {
    if(this.ayFlags.noMoreUsers)  return;
    if(this.ayFlags.loadingContent) return;
    // console.log("this.loadingUsers ", this.ayFlags.loadingContent);
    // if(this.loadingUsers)  return;
    this.ayFlags.loadingContent = true;
    // console.log("pageNo = ", this.pageNo, " locatin = ", this.location);
    this._apiService.getSimilarUsers(this.sessionLocation || this.location, null, this.pageNo).then(result => {
      // console.log("suggested users => ", result);
      const l = result.result.length;
      if( l === 0) { this.ayFlags.noMoreUsers = true; return }
      // this.pageNo === 1 ? this.userSuggestions = result.result : this.userSuggestions.;
      for(let x=0; x<l; x++) {
        result.result[x]['dp'] = this._apiService.getUserImageById('dp', result.result[x]._id);
        result.result[x]['distance'] = this.location && result.result[x].location ? this.getDistance(this.location, result.result[x].location) : null;
      }
      this.pageNo === 1 ? this.userSuggestions = result.result : this.userSuggestions.push(...result.result);
      // this.userSuggestions.push(...result.result, ...result.result, ...result.result, ...result.result);
      
      
      if(result.result.length > 0) this.pageNo++;
      this.ayFlags.loadingContent = false;
    });
  }

  removeByIndex(i: number) {
    this.userSuggestions.splice(i,1);
  }

  addRemoveUser(id, index) {
    this._apiService.addRemoveFollower(this.userSuggestions[index]['isFollowing'] ? '' : 'Follow', id).then(resolve => {
      if(resolve['message'] === "passed") {
        this.userSuggestions[index]['isFollowing'] = !this.userSuggestions[index]['isFollowing'];
      }
    });
  }

  routeToProfile(id) {
    this._router.navigate(['/'+id]);
  }

  getLocation() {
    // console.log("getLocation called");
    this._floatNotifService.getLocationToast();
    // this.loadingUsers = true;
    this._floatNotifService.getLocationSubject.asObservable().subscribe(data => {
      // console.log("got data ", data);
      this.location = data;
      this.pageNo = 1;
      this.getSimilarUsers();
    });
    this.location = this._storageService.currentUser.location;
    // this.getUsers(this.location);

  }

  globalStatusChanged(event) {
    // console.log("event ", event);
    this.ayFlags.loadingContent = true;
    this.loadingText = 'Refreshing Suggestions...';
    this.radius = event ? 1200 : null;
    this.pageNo = 1;
    // this.getUsers(this.location || this.sessionLocation);
  }

  /* getting distance from user's current location
   * triggered only when user shares his LIVE location
  */

  getDistance([x1, y1], [x2, y2]):Number {
    return Math.sqrt(Math.abs(Math.pow(x1-x2, 2) + Math.pow(y1-y2,2)));
  }

  loadmore($event) {
    // console.log("getting similar users");
    this.getSimilarUsers();
  }
}
