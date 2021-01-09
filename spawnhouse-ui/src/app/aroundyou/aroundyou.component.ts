import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-aroundyou',
  templateUrl: './aroundyou.component.html',
  styleUrls: ['./aroundyou.component.scss']
})
export class AroundyouComponent implements OnInit {

  location;
  sessionLocation: any;
  dpLinks = []; // temp
  loadingUsers: boolean = true;
  radius: number;
  loadingText = 'Getting Suggestions...';
  pageNo = 0;
  userSuggestions = []; // {_id: <userid>, username: <username>, name: <name>, isFollower: <true/false>};
  @ViewChild('container') container: ElementRef;
  @HostListener('window:scroll', ['$event'])
  handleScroll(event) {
    console.log(this.container.nativeElement.offsetHeight,' ',this.container.nativeElement.scrollTop, ' ',this.container.nativeElement.scrollHeight);
  }

  constructor(
    private _storageService: StorageService,
    private _floatNotifService: FloatNotificationService,
    private _apiService: APIservice,
    private _router: Router) {
    }
  ngOnInit(): void {

    this.userSuggestions = [];
    this._floatNotifService.getLocationToast();
    this.sessionLocation = JSON.parse(this._storageService.getSessionData('location'));

    if(this.sessionLocation) this.getUsers(this.sessionLocation);
    else this.getLocation();
  }

  getUsers(location, refresh?: boolean) {
    console.log("sending for page no ", this.pageNo);
    this._apiService.getUsersAround(location, this.radius, this.pageNo).then( result => {
      this.radius = result['radius'];

      let startIndex = 0;
      if(refresh) {
        this.userSuggestions.push(...result['result']);
        startIndex = result['result'].length;
        startIndex = this.userSuggestions.length - startIndex;
      }
      else this.userSuggestions = result['result'] || [];

      const l = this.userSuggestions.length;
      this.loadingUsers = false;
      this.pageNo++;
      console.log("start index = ", startIndex, "uptoLen", l);

      for(let x=startIndex; x < l; x++) {
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
    // console.log("updating location");
    this._floatNotifService.getLocationToast();
    this.loadingUsers = true;
    this._floatNotifService.getLocationSubject.asObservable().subscribe(data => {
      console.log("got data ", data);
      this.location = data;
      this.getUsers(data);
    });
  }

  globalStatusChanged(event) {
    console.log("event ", event);
    this.loadingUsers = true;
    this.loadingText = 'Refreshing Suggestions...';
    this.radius = event ? 1200 : null;
    this.pageNo = 0;
    this.getUsers(this.location || this.sessionLocation);
  }

}
