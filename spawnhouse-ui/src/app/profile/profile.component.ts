import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { APIservice } from 'src/assets/services/api.service';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'sh-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  onlineStatus = 2;
  basicInfoToggle = false;
  imageSchema: IPictureUploadSchema;
  uploadMode: string;
  user;
  userdp: any;    // stores cover and dp link
  usercover: any;
  newDpCoverForm: FormGroup;
  nowPlayingForm: FormGroup;
  disableImageUpload: boolean = false;;
  showImageUpload: boolean;
  isUserProfile = true;    // if user accesses someone else's profile, this is false;
  followStatus: String;
  bg = ['danger', 'warning', 'success', 'theme', 'danger'];
  tempFavGamesArray = []; // used to show before user clicks 'show all' option
  constructor( private _storageService : StorageService,
    private http: HttpClient,
    private _apiService: APIservice,
    private _notifService: FloatNotificationService,
    private _navbarService: NavbarService,
    private _overlayService: OverlayService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private _dom: DomSanitizer) {
      this._activeRoute.params.subscribe( val => {
        if(this._activeRoute.snapshot.params.username)
        this.ngOnInit();
      })
    }
  
  ngOnInit(): void {
    this.user = {};
    let addusername;
    if(this._activeRoute.snapshot.params.username) {
      this.isUserProfile = false;
      this.http.get(APIvars.APIdomain+'/'+APIvars.APIsignup+'/'+this._activeRoute.snapshot.params.username).subscribe( result => {
        console.log("guest user", result);
        if(!result || result['error']) {
          console.log('user not found should route');
          this._router.navigate(['../not-found']);
          return;
        }
        
        this.user = result['user'];
        this.user['nowplaying'] = result['nowplaying'];
        this.user['gamedata'] = result['gamedata'];
        this.tempFavGamesArray = result['gamedata']? result['gamedata']['fav']: [];
        console.log("logged in user ", this.user);
        this.getFollowData();
      });

      // getting dp of the user
      this.getDpOfUser(this._activeRoute.snapshot.params.username);
      this.getCoverOfUser(this._activeRoute.snapshot.params.username);
      this.getFollowStatus(this._activeRoute.snapshot.params.username);
      addusername = this._activeRoute.snapshot.params.username;

    } else {
      // if logged in user's profile
      this.isUserProfile = true;
      this.user = this._storageService.currentUser;
      this.getFollowData();
      console.log(this.user);
      this.userdp = this._storageService.dpLink;

      if(!this._storageService.coverLink) {
        this._apiService.getCover();

        this._apiService.coverPictureSubject.subscribe( coverurl => {
          this.usercover = coverurl.coverurl;
          this._storageService.coverLink = coverurl.coverurl;
        });

      } else {
        this.usercover = this._storageService.coverLink;
      }

      this._navbarService.getDpSubject.next(true);
      this.onlineStatus = 1;
      this._apiService.dpSubject.subscribe(dpUrl => {
        this.userdp = dpUrl.dpUrl;
      });

      this._navbarService.dpUpdated.asObservable().subscribe( updatedDp => {
        this.updatePic(updatedDp);
      });
      // this.openGamingInfo();
      this._apiService.getNowPlaying();
      addusername = '';
      this.getGamedata();
    }

  }

  getFollowStatus(id: String) {
    this.http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOW_STATUS_OF+'/'+id).subscribe(result => {
      this.followStatus = result['status'];
    });
  }

  getGamedata() {
    this.user['gamedata'] = null;
    // this.user['gamedata'] = this._apiService.getGamedata().then(resolve => {
      // this.tempFavGamesArray = resolve['result'] ? resolve['result']['fav'].slice(0, 5) : [];
      // return resolve['result'];});
    
    const operation = this.followStatus === 'Follow' ? 'add' : 'sub';
    this.http.get(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA).subscribe( result => {
      this.user['gamedata'] = result['result'];
      this.tempFavGamesArray = result['result'] ? result['result']['fav'].slice(0, 5) : [];
    });
  }

  // add or remove
  setFollowStatus() {
    // const operation = this.followStatus === 'Follow' ? 'add' : 'sub';
    this._apiService.addRemoveFollower(this.followStatus, this.user._id).then(resolve => {
      console.log("resulrr   ", resolve);
      this.followStatus = resolve['status'] || '+Follow';
      this.user.followdata.followerCount = resolve['followerCount'];
    });

    // this.http.get(APIvars.APIdomain+'/'+APIvars.SET_FOLLOWING+'/'+operation+'/'+this.user._id).subscribe(result => {
    //   this.followStatus = result['status'];
    //   this.user.followdata.followerCount = result['followerCount'];
    // });
  }

  getDpOfUser(id) {
    this.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).subscribe( image => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.userdp = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }

  getCoverOfUser(id) {
    this.http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER_OF_USER+'/'+id, { responseType: 'blob' }).subscribe( image => {
      if(image['size'] <= 44) {
        console.log('image errr')
        this.usercover = null;
        return;
      }
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.usercover = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }

  getFollowData() {
    const param = this.isUserProfile ? '' : this._activeRoute.snapshot.params.username;
    this.http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOWDATA+param).subscribe( followdata => {
      this.user['followdata'] = followdata['data'];
      console.log('after follow data ', this.user);
    });
  }
  
  submitNewImage(fd) {
    let imageApi: string;
    this.disableImageUpload = true;
    this._notifService.config.next({text: 'Upading picture', icon: 'image'});
    if ( this.uploadMode === 'dp') 
    {
      imageApi = APIvars.APIdomain+'/'+ APIvars.SET_DP;
    } else if ( this.uploadMode === 'cover') {
      imageApi = APIvars.APIdomain+'/'+APIvars.SET_COVER;
    }
    let isOpenFlag = true;    // if false, the subject to keep open floating notice is not triggered
    this.http.post(imageApi, fd, {reportProgress: true, observe: 'events'}).subscribe( result => {
      if(isOpenFlag) {
        this._notifService.closeOn.next(true);
        isOpenFlag = false;
      }
      if(result.type === HttpEventType.UploadProgress) {
        this.setVisibilityImageOverlay(false);
        // console.log('sent config ');
        this._notifService.config.next({text: 'Upading picture', icon: 'image'});
        this._notifService.progress.next(Math.round(result['loaded']*100/result['total'])+'%');
      }
      else if (result.type === HttpEventType.Response) {
        // console.log('event done ', result['message']);
        this._notifService.closeOn.next(false);
      }
      if((result as HttpResponse<any>).body?.message === 'passed') {
        this.disableImageUpload = false;
        setTimeout(() => {
          this.uploadMode === 'dp' ? this._navbarService.getDpSubject.next(true) : this._apiService.getCover();
          // this.uploadMode === 'dp' ? this.navbar.getDp() : this._apiService.getCover();
          this.setVisibilityImageOverlay(false);
        }, 1000);
      }
      // console.log(result);
    });
  }

  updatePic(event) {
    if(event.type === 'dp') {
      this.userdp = event.src;
      this.setVisibilityImageOverlay(false);
    }
  }

  setupImageUpload(isDp?) {
    if( isDp) {
      this.imageSchema = {
        aspectRatio: 1/1,
        format: 'jpg',
        resizeToWidth: '300',
        maintainAspectRatio: true
      }
      this.uploadMode = 'dp';
    }
    else {
      this.imageSchema =
      {
        aspectRatio: 1920/400,
        format: 'jpg',
        resizeToWidth: '1080',
        maintainAspectRatio: true
      }
      this.uploadMode = 'cover';
    }
    // this.showOverlay = true;
    this.setVisibilityImageOverlay(true);
  }

  setupCoverPhotoUpload() {
    this.setVisibilityImageOverlay(true);
  }

  refreshImage() {
    if(this.uploadMode === 'dp') {
      this._apiService.getDp();
      this._navbarService.getDpSubject.next(true);
    } else if(this.uploadMode === 'cover') {
      this._apiService.getCover();
    }
    this.setVisibilityImageOverlay(false);
  }

  setVisibilityImageOverlay( visibility: boolean) {
    if(visibility)
      this._overlayService.configSubject.next({closeOnClick: false, transparent: false});
    
    this._overlayService.showSubject.next(visibility);
    this.showImageUpload = visibility;
  }

  openGamingInfo() {
    this._navbarService.showOption.next('gamebroadcast');
    this._overlayService.configSubject.next({transparent: false, closeOnClick: false });
  }
  
  updateNowPlaying() {

  }

  routeToEditProfile() {
    this._router.navigateByUrl('/manage');
  }

  gotoWebsite(url) {
    if(url)
      window.open(url, '__blank');
  }

  nowPlayingFlags = {showDeleteNowPlaying: false, showAddToFavs: false};
  removeNowPlaying() {
    this.nowPlayingFlags.showDeleteNowPlaying = false;
    this.http.delete(APIvars.APIdomain+'/'+APIvars.REMOVE_NOW_PLAYING).subscribe( result => {
      if(result['message']=== 'passed') {
        this._apiService.getNowPlaying();
      }
    });
    this.closeOverlay();
    this.nowPlayingFlags.showAddToFavs = false;
  }

  showAddToFavWarning() {
    this._overlayService.configSubject.next({transparent: false, closeOnClick: false });
    this.nowPlayingFlags.showAddToFavs = true;
    this.nowPlayingFlags.showDeleteNowPlaying = false;
  }
  showAllFavourites() {
    console.log("ulalala mu me lo", this.user.gamedata.fav);
    this.tempFavGamesArray  = this.user.gamedata.fav;
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
  }

  addFavgame(nowplaying, setFav?: boolean) {
    console.log(nowplaying);
    const favgame =  {label: nowplaying.game, value: setFav ? 'fav': ''};
    nowplaying.game ? favgame['username'] = nowplaying.username : '';
    if(nowplaying.game) {
      this.http.patch(APIvars.APIdomain+'/'+ APIvars.SET_NEW_FAV, {newFavs: [favgame, favgame]}).subscribe( result => {
        this.user['gamedata'] = null;
        if(result['message']=== 'passed') {
          this.getGamedata();
        }
      });
    }
  }

}
