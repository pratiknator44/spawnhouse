import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'app-aroundyou',
  templateUrl: './aroundyou.component.html',
  styleUrls: ['./aroundyou.component.scss']
})
export class AroundyouComponent implements OnInit {

  location;
  sessionLocation: any;
  dpLinks = []; // temp
  loadingUsers: boolean = true;

  userSuggestions = []; // {_id: <userid>, username: <username>, name: <name>, isFollower: <true/false>};
  constructor(
    private _storageService: StorageService,
    private _floatNotifService: FloatNotificationService,
    private _apiService: APIservice,
    private _router: Router) { }

  ngOnInit(): void {

    this.userSuggestions = [];
    this._floatNotifService.getLocationToast();
    this.sessionLocation = this._storageService.getSessionData('location');

    if(this.sessionLocation) this.getUsers(this.sessionLocation);
    this.getLocation();
  }

  getUsers(location) {
    this._apiService.getUsersAround(location).then( result => {
      this.userSuggestions = result['result'] || [];
      const l = result['result'].length;
      this.loadingUsers = false;
      for(let x=0; x < l; x++) {
        this.getDpById(this.userSuggestions[x]._id, x);
      }
    });
  }

  getDpById(id, x) {
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).subscribe( image => {
      if(image['type'] === 'application/json')  {
        this.dpLinks[x] = null;
        return;
      }
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dpLinks[x] = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }
  
  removeByIndex(i: number) {
    this.userSuggestions.splice(i,1);
    this.dpLinks.splice(i, 1);
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
    console.log("lets get location");
    this._floatNotifService.getLocationToast();
    this._floatNotifService.getLocationSubject.asObservable().subscribe(data => {
      console.log("got data");
      this.location = data;
      this._storageService.setSessionData('location', data);
      this.getUsers(data);
    })
  }

}
