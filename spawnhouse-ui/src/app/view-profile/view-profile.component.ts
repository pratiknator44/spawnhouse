import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { FormGroup } from '@angular/forms';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { ActivatedRoute } from '@angular/router';
import { DurationsEnum } from 'src/assets/variables/toasts.enum';

@Component({
  selector: 'view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {

  basicInfoToggle = false;
  user;
  userdp: any;    // stores cover and dp link
  usercover: any;
  newDpCoverForm: FormGroup;
  nowPlayingForm: FormGroup;
  disableImageUpload: boolean = false;;
  showImageUpload: boolean;
  isUserProfile = true;    // if user accesses someone else's profile, this is false;
  followStatus: String;
  followUsers;
  bg = ['danger', 'warning', 'success', 'theme', 'danger'];
  tempFavGamesArray = []; // used to show before user clicks 'show all' option
  profileFlags = { loadingCover: true, loadingGamingInfo: true, showFeeds: false};
  homeflags = {loadMoreFeeds: true, feedsEnd: false, loadingWhoLiked: false};
  constructor(private _storageService: StorageService,
    private _apiService: APIservice,
    private _notifService: FloatNotificationService,
    private _navbarService: NavbarService,
    private _overlayService: OverlayService,
    private _activeRoute: ActivatedRoute) {

    this._activeRoute.params.subscribe(val => {
      if (this._activeRoute.snapshot.params.username)
        this.ngOnInit();
    })
  }

  ngOnInit(): void {
    this.user = {};
    this.userdp = null;
    this.usercover = null;

    this.profileFlags.showFeeds = false;
    // console.log("current user ", this._storageService.currentUser);
    if (this._activeRoute.snapshot.params.username) {

      this.isUserProfile = false;
      this._apiService.getUserProfileData(this._activeRoute.snapshot.params.username).then(result => {
        // console.log("this user ", result);
        this._notifService.setTitle(result['user'].username || result['user'].fname + ' ' + result['user'].lname);
        if (!result || result['error']) {
          // console.log('user not found should route');
          this._apiService.router.navigate(['../not-found']);
          return;
        }

        this.user = result['user'];
        this.user['nowplaying'] = result['nowplaying'];

        this.user['gamedata'] = result['gamedata'];

        this.tempFavGamesArray = result['gamedata'] ? result['gamedata']['fav'] : [];
        this.getFollowData();
        this.profileFlags.loadingGamingInfo = false;

      }).catch(error => {
        this._apiService.router.navigate(['../not-found']);
      });

      // getting dp of the user
      this.getDpOfUser(this._activeRoute.snapshot.params.username);
      this.getCoverOfUser(this._activeRoute.snapshot.params.username);
      // this.getGamedata()
    }
    this._notifService.setTitle(this.user.username || this.user.fname + ' ' + this.user.lname);
    this.getCoverOfUser(this.user._id);

  }



  getGamedata() {
    this.user['gamedata'] = null;
    const operation = this.followStatus === 'Follow' ? 'add' : 'sub';
    this.tempFavGamesArray = [];
    this._apiService.http.get(APIvars.APIdomain + '/' + APIvars.SET_USER_GAMEDATA).toPromise().then(result => {
      this.user['gamedata'] = result['result'];
      this.profileFlags.loadingGamingInfo = false;

      if (!result['result']) return;
      this._storageService.setSessionData('gamedata', JSON.stringify(result['result']));
      this.tempFavGamesArray = 'fav' in result['result'] ? result['result']['fav'].slice(0, 5) : [];
    });
  }


  getDpOfUser(id) {
    this.userdp = this._apiService.getUserImageById('dp', id, true);
  }

  getCoverOfUser(id) {
    if (!id) return;
    this.usercover = this._apiService.getUserImageById('cover', id, true);
    this.profileFlags.loadingCover = false;
  }

  getFollowData(id?) {
    const param = this.isUserProfile ? '' : this._activeRoute.snapshot.params.username;
    this._apiService.getFollowDataById(id || this.user._id).then(followdata => {
      // console.log("followdata ", followdata);  
      this.user['followdata'] = followdata['data'];
    });
  }

  openGamingInfo() {
    this._navbarService.showOption.next('gamebroadcast');
    // this._overlayService.configSubject.next({transparent: false, closeOnClick: false });
    this._notifService.makeToast.next('feedback');
  }

  routeToProfile(id) {
    if (id === this._storageService.currentUser._id) id = 'profile';
    this._apiService.router.navigateByUrl('/' + id);
    this.ngOnInit();
  }

  gotoWebsite(url) {
    if (url)
      window.open(url, '__blank');
  }

  // modalOpen(content, size?) {
  //   this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size || 'md' }).result.then((result) => {
  //   }, (reason) => {
  //   });
  // }

  showAllFavourites() {
    this.tempFavGamesArray = this.user.gamedata.fav;
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
  }

  copyProfileUrl() {
    const el = document.createElement('textarea');
    el.value = "https://www.thespawnhouse.com/#/" + this.user._id;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this._notifService.makeToast.next({ type: 'success', text: 'Profile link copied', duration: DurationsEnum.SHORT });
  }


  // loadMore(refresh?) {
  //   if(this.homeflags.feedsEnd) return;

  //   if(!this.homeflags.loadMoreFeeds) return;

  //   if(refresh) {
  //     this.npListPageNo = 1;
  //     this.np = [];
  //   }
  //   this.homeflags.loadMoreFeeds = false;
  //   this._apiService.getNowPlayingOfFollowing(this.npListPageNo,['60bb308ec612912464891645']).then(nowplayings => {
  //     this.np = nowplayings['result'] || [];
  //     if(nowplayings['result'].length === 0)  this.homeflags.feedsEnd = true;   // permanant stop to feel load more
  //     //getting dp of updated entries
  //     this.getDpOfEntries(nowplayings['result']);
  //     this.npListPageNo++;
  //     // this.total.emit(this.np.length);
  //   });
  // }

  // getDpOfEntries(nowplayings) {
  //   const l = nowplayings.length;
  //   for(let x=0; x < l; x++) {
  //     if(!nowplayings[x]['isDead']) {
  //       try {
  //         nowplayings[x]['stillplaying'] = (3600000 * nowplayings[x]['nowplaying']['estplaytime']) > (new Date().getTime() - nowplayings[x]['nowplaying']['time']);
  //       } catch(e) {
  //         nowplayings[x]['stillplaying'] = true;
  //       }
  //     } else {
  //       nowplayings[x]['stillplaying'] = false;
  //     }
  //     nowplayings[x]['dp'] = this._apiService.getUserImageById('dp', nowplayings[x].userid);
  //   }
  //   this.np.push(...nowplayings);
  //   this.np.sort( (a, b) => b.stillplaying ?  1 : -1);
  //   this.homeflags.loadMoreFeeds = true;
  // }

  routeToLogin() {
    this._apiService.router.navigate(['/login']);
  }

}
