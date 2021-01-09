import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { FormGroup } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { APIservice } from 'src/assets/services/api.service';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { UserService } from 'src/assets/services/user.service';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

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
  followUsers; showFollow: boolean;
  bg = ['danger', 'warning', 'success', 'theme', 'danger'];
  tempFavGamesArray = []; // used to show before user clicks 'show all' option
  profileFlags = {loadingFollow: true, loadingCover: true, loadingGamingInfo: true};

  constructor( private _storageService : StorageService,
    private _apiService: APIservice,
    private _notifService: FloatNotificationService,
    private _navbarService: NavbarService,
    private _overlayService: OverlayService,
    private _userService: UserService,
    private _activeRoute: ActivatedRoute) {

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
      this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.APIsignup+'/'+this._activeRoute.snapshot.params.username).subscribe( result => {
        this._notifService.setTitle(result['user'].username || result['user'].fname + ' ' + result['user'].lname);
        if(!result || result['error']) {
          console.log('user not found should route');
          this._apiService.router.navigate(['../not-found']);
          return;
        }
        
        this.user = result['user'];
        this.user['nowplaying'] = result['nowplaying'];
        console.log("user now playing ", this.user['nowplaying']);  
        this.user['gamedata'] = result['gamedata'];
        
        this.tempFavGamesArray = result['gamedata']? result['gamedata']['fav']: [];
        this.getFollowData();
        this.profileFlags.loadingGamingInfo = false;
      });

      // getting dp of the user
      this.getDpOfUser(this._activeRoute.snapshot.params.username);
      this.getCoverOfUser(this._activeRoute.snapshot.params.username);
      this.getFollowStatus(this._activeRoute.snapshot.params.username);
      this.getGamedata()
      addusername = this._activeRoute.snapshot.params.username;

    } else {
      // if logged in user's profile
      this.isUserProfile = true;
      this.user = this._storageService.currentUser;
      this.getFollowData();
      console.log(this.user);
      this.userdp = this._storageService.dpLink;

      if(!this._storageService.coverLink) {
        this.getCoverOfUser(this.user._id);
      } else {
        this.usercover = this._storageService.coverLink;
        this.profileFlags.loadingCover = false;
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
    this._notifService.setTitle(this.user.username || this.user.fname+' '+this.user.lname);
    
    this.getCoverOfUser(this.user._id)
    
  }

  getFollowStatus(id: String) {
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOW_STATUS_OF+'/'+id).subscribe(result => {
      this.followStatus = result['status'];
    });
  }

  getGamedata() {
    this.user['gamedata'] = null;
    const operation = this.followStatus === 'Follow' ? 'add' : 'sub';
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA).subscribe( result => {
      this.user['gamedata'] = result['result'];
      this._storageService.setSessionData('gamedata', JSON.stringify(result['result']));
      this.tempFavGamesArray = result['result']['fav'] ? result['result']['fav'].slice(0, 5) : [];

      this.profileFlags.loadingGamingInfo = false;
    });
  }

  // add or remove
  setFollowStatus() {
    // const operation = this.followStatus === 'Follow' ? 'add' : 'sub';
    this._apiService.addRemoveFollower(this.followStatus, this.user._id).then(resolve => {
      this.followStatus = resolve['status'] || '+Follow';
      this.user.followdata.followerCount = resolve['followerCount'];
    });

    // this.http.get(APIvars.APIdomain+'/'+APIvars.SET_FOLLOWING+'/'+operation+'/'+this.user._id).subscribe(result => {
    //   this.followStatus = result['status'];
    //   this.user.followdata.followerCount = result['followerCount'];
    // });
  }

  getDpOfUser(id) {
    this._apiService.getImagePromise('dp', id).then( image => {
      
    if(image['type'] === 'application/json') {
      this._storageService.setDp(null);
      this.userdp = null;
      return;
    };
        let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.userdp = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        console.log(this.userdp);
        if(this.isUserProfile) this._storageService.setDp(this.userdp);
      }, false);
  
      if (image) {
          reader.readAsDataURL(image);
      }
    });

    // this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).subscribe( image => {
    //   if(image['type'] === 'application/json')  {
    //     this.userdp = null;
    //     return;
    //   }

    //   let reader = new FileReader();
    //   reader.addEventListener('load', () => {
    //     this.userdp = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
    //   }, false);
    //   if (image) {
    //      reader.readAsDataURL(image as Blob);
    //   }
    // });
  }

  getCoverOfUser(id) {
    id = id ? id : this.user._id;  // for user accessing own profile or not
    if(!id) return;
    
    this._apiService.getImagePromise('cover', id).then( image => {
      this.profileFlags.loadingCover = false;
      if(image['type'] === 'application/json')  {
        this.usercover = null;
        this._storageService.setCover(null);
        return;
      }

      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.usercover = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        if(this.isUserProfile) this._storageService.setCover(this.usercover);
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }

  getFollowData(id?) {
    const param = this.isUserProfile ? '' : this._activeRoute.snapshot.params.username;
    this._apiService.getFollowDataById( id || this.user._id).then(followdata => {
      console.log("followdata ", followdata);  
      this.user['followdata'] = followdata['data'];
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
    this._apiService.http.post(imageApi, fd, {reportProgress: true, observe: 'events'}).subscribe( result => {
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
          this.uploadMode === 'dp' ? this._navbarService.getDpSubject.next(true) : this.getCoverOfUser(this.user._id);
          // this.uploadMode === 'dp' ? this.navbar.getDp() : this._apiService.getImage('cover');;
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
      this.getCoverOfUser(this.user._id);
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

  routeToEditProfile() {
    this._apiService.router.navigateByUrl('/manage');
  }

  routeToProfile(id) {
    console.log("routing to profile user ", id);
    this._apiService.router.navigateByUrl('/'+id);
    this.ngOnInit();
  }

  gotoWebsite(url) {
    if(url)
      window.open(url, '__blank');
  }

  nowPlayingFlags = {showDeleteNowPlaying: false, showAddToFavs: false};
  removeNowPlaying() {
    this.nowPlayingFlags.showDeleteNowPlaying = false;
    const conf: any = this._apiService.removeNowPlaying().then( result => {
      if(result['message'] === 'passed') {
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
      this._apiService.http.patch(APIvars.APIdomain+'/'+ APIvars.SET_NEW_FAV, {newFavs: [favgame, favgame]}).subscribe( result => {
        this.user['gamedata'] = null;
        if(result['message']=== 'passed') {
          this.getGamedata();
        }
      });
    }
  }

  initMinimessage() {
    console.log(this.user);
    const userdata = {
      _id: this.user._id,
      fname: this.user.fname,
      lname: this.user.lname,
      gamedata: { fav: {}, genres: {}},
      dpLink: this.userdp,
      location: 'some location',
    }

    userdata.gamedata.fav = this.getCommonFavs();
    userdata.gamedata.genres = this.getCommonGenres();
    console.log(userdata.gamedata.fav);

    this._overlayService.configSubject.next({show: true, closeOnClick: false});
    this._overlayService.showSubject.next(true);
    this._userService.minimessageConfigSubject.next({show: true, userdata});

    this._userService.minimessageFiredSubject.asObservable().pipe(take(1)).subscribe( messagedata => {
      //getting previous convo id, if not, create new.
      this._apiService.http.post(APIvars.APIdomain+'/'+APIvars.GET_CHATROOM_ID_BY_USERS, {users: [this.user._id, JSON.parse(this._storageService.getSessionData('user'))['_id']]}).toPromise().then(result => {
        console.log("chat room id = ", result)
        const resbody = result['id'] ? {_cid: result['id'], receiverid: this.user._id, text: messagedata.message} :
        {receiverid: this.user._id, text: messagedata.message};
        console.log(resbody);
        this._apiService.http.post(APIvars.APIdomain+'/'+APIvars.SAVE_MESSAGE, resbody).subscribe(result => {
          console.log("message saved? ", result);
          // this._userService.minimessageConfigSubject.next({show: false, userdata: null});
          this._overlayService.showSubject.next(false);
        });
      });
    });
  }

  getCommonFavs() {
    if(this.user['gamedata'].fav === [] || this.user['gamedata'].genres === []) return null;
    
    const currentUserFavs = JSON.parse(this._storageService.getSessionData('gamedata'))['fav'];

    return this.user['gamedata']['fav'].filter(function(fav) { return currentUserFavs.indexOf(fav) == -1; });
  }

  getCommonGenres() {
    if(this.user['gamedata'].fav === [] || this.user['gamedata'].genres === []) return null;
    const currentUserGenres = JSON.parse(this._storageService.getSessionData('gamedata'))['genres'];

    return this.user['gamedata']['genres'].filter(function(genre) { return currentUserGenres.indexOf(genre) == -1; });
  }
  selectedFollowType;
  followDpLinks = [];

  getFollow(type: string){
    this.showFollow = true;
    this.profileFlags.loadingFollow = true;
    this.followUsers = null;
    this.selectedFollowType = type;
    this._overlayService.configSubject.next({transparent: false, closeOnClick: false});
    this._overlayService.showSubject.next(true);
    this._userService.getFollowData(type, this.user._id).then(result => {
      console.log("followers ", result);
      this.followUsers =  result['result'];
      this.profileFlags.loadingFollow = false;
      const l = this.followUsers.length;
      for(let x=0; x<l; x++) {
        this.getDpById(this.followUsers[x]._id, x);
      }
    });

  }

  getDpById(id, x) {
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).subscribe( image => {
      if(image['type'] === 'application/json')  {
        this.followDpLinks[x] = null;
        return;
      }
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.followDpLinks[x] = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }
}
