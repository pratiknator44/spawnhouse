import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';
// import { Title } from '@angular/platform-browser';
import { NavbarService } from 'src/assets/services/navbar.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  homeFlags = { loadingLiveUsers: false };
  activeUsers = [];
  activeUsersPageNo = 1;
  nowplaying: any;
  domain = {dp: APIvars.DP_DOMAIN, cover: APIvars.COVER_DOMAIN};

  constructor(
    private _apiService: APIservice,
    private _storageService: StorageService,
    private _navbarService: NavbarService) {
  }


  ngOnInit(): void {
    this._navbarService.selectedOption.next('Home');
    this.getNp();
  }

  loadLiveUsers(refresh?) {
    if (refresh) {
      this.activeUsers = [];
      this.activeUsersPageNo = 0;
    }

    this._apiService.getActiveNPusers().then(data => {
      this.activeUsers.push(...data['result']);
      // console.log(this.activeUsers);
    });
  }

  openGamingInfo() {
    this._apiService.router.navigate(['/create']);
  }

  getNp() {
    try {
      this._apiService.getNowPlayingOfCurrentUser().then(data => {
        if(('np' in data && data['np']) && ( 360000 * data['np']['estplaytime'] > (new Date().getTime() - data['np']['time'])  )) {
          this.activeUsers.splice(0, 0, data['np']);
          this.activeUsers[0]['username'] = 'You';  // this._storageService.currentUser.username;
          this.activeUsers[0]['userid'] = this._storageService.currentUser._id;
          this.nowplaying = true;
        }
        this.loadLiveUsers();
      });
    } catch (e) {
      this.nowplaying = null;
    }
  }

  gotoProfile(_id) {
    if(this._storageService.currentUser._id == _id) {
      _id = 'profile';
    }
    this._apiService.router.navigate(['/'+_id]);
  }

  gotoWebsite(url) {
    window.open(url, '__blank');
  }


  // *************************** do not erase *********************************
  // searchThis(wordForUser) {
  //   this.userSuggestions = [];

  //   this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+wordForUser).pipe(debounceTime(1000)).subscribe( res => {
  //     if(res['users'].length > 0) {
  //       let userid = [];
  //       console.log("users = ", res['users']);
  //       res['users'].forEach( user => {
  //         userid.push(user._id);
  //       });
  //     }
  //   });
  // }

  // triggerLoadMore() {
  //   console.log("trigger load more");
  //   this.feeds.getPosts(false);
  // }

  // TEST_socketBroadcast() {
  // this._socketService.pushData('new-notification', {type: "broadcast", sendTo: "following", sentBy: this._storageService.currentUser._id});
  // }


  // *************************** do not erase  till here*********************************

}
