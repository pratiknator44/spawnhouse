import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { APIservice } from 'src/assets/services/api.service';
import { Subject } from 'rxjs';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SuggestionsComponent } from '../suggestions/suggestions.component';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { GameGenrePipe } from 'src/assets/pipes/gamegenre.pipe';
import { UserService } from 'src/assets/services/user.service';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { INavbarMessage, INotification } from 'src/assets/interfaces/MsgNotif.interface';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  elongate: boolean;
  selectedOption: string;
  options = [];
  searchSuggestions: any = [];
  showSuggestions: boolean;
  dp: any;
  userSearch = '';
  user;
  searchingGame: boolean;
  showUserOptions: boolean;
  showUserSuggestions: boolean = true;
  dpSubject = new Subject<any>();
  dpObservale;
  imageSchema: IPictureUploadSchema;
  noUserFound: boolean;
  showUpdateOptions = false;
  showGameBroadcast = false;
  showConsoleList = false;
  consolePipe;
  selectedConsole: string;
  navbarFlags = {showMessages: false, messagelistLoading: false, showNotification: false, notificationLoaded: false};
  messages: INavbarMessage[] | any= [];
  notifications = [];  //INotification[] = [];
  // dpLinks = []; // cuz sanetized links cant be binded to object properties of messages.dpLink

  consoles = [
    {icon: 'android', id: 'm'},
    {icon: 'windows8', id: 'pc'},
    {icon: 'playstation3', id: 'ps3' },
    {icon: 'playstation4', id: 'ps4' },
    {icon: 'playstation5', id: 'ps5' },
    {icon: 'xbox', id: 'xb360' },
    {icon: 'xbox', id: 'xb1' },
    {icon: 'xbox', id: 'xbx' },
    {icon: 'xbox', id: 'xbsx17' },
    {icon: 'xbox', id: 'xbsx20' },
    {icon: 'wii', id: 'wii' },
    {icon: 'appleinc', id: 'mac' },
    {icon: 'appleinc', id: 'ios' },
    {icon: '', id: 'ot'},
  ];
  alerts = {notifications: null, messages: null};
  nowplayingForm: FormGroup;
  @Input() imageUploadMode: string;
  @Output() onPicUpdate = new EventEmitter(); 
  @ViewChild('gameSuggestComp') gameSuggestComp: SuggestionsComponent;
  
  constructor(
    private _storageService: StorageService,
    private _apiService: APIservice,
    private _navbarService: NavbarService,
    private _notifService: FloatNotificationService,
    private _overlayService: OverlayService,
    private _userService: UserService) { }

  ngOnInit(): void {
    this.options = [
      { name: 'Home', icon: 'home', alert: 0},
      { name: 'Friends', icon: 'users', alert: 2 },
      { name: 'Streams', icon: 'display', alert: 0, showSubmenu: false, submenu: { options: ['Story', 'Status', 'Now Playingaaaaa'], triggerFunction: this.update(event) }},
      { name: 'Notifications', icon: 'bell', alert: 1 },
      { name: 'Messages', icon: 'bubbles', alert: 0 }];
     // { name: 'Settings & Privacy', icon: 'cog', alert: 0 }];
      
    this._navbarService.refreshUnseenMessages.subscribe(res => {
      this.getUnseenMessageCount();
    });


    this.selectedOption = this.options[0].name;
    // call profile picture api
    this.user = JSON.parse(this._storageService.getSessionData('user'));
    // this.dp = this._api.getDp();
    this.getDp();
    this._navbarService.getDpSubject.asObservable().subscribe( status => {
      if(status) this.getDp();
    });
    this._overlayService.closeSubject.asObservable().subscribe( closeOptions => {
      this.falseAllFlags();
    });

    this._navbarService.showOption.asObservable().subscribe( option => {
      if(option === 'gamebroadcast') {
        this.gameBroadcast();
      }
    });

    setTimeout(() => {
      this._navbarService.refreshUser.asObservable().subscribe( data => {
        this.refreshUserVar();
    });
    }, 3000);

    this.getUnseenMessageCount();
    this._apiService.getNewNotificationCount().then(result => {
      // console.log("new notifications : ", result['count']);
      this.alerts.notifications = result['count'];
    });
    this._apiService.getNotifications().then( result => {
      console.log("detailed notification ", result);
      this.notifications = result['result'];
      const l = this.notifications.length;
      for(let x = 0; x < l; x++) {
        this.getUserImageById(this.notifications[x].userid, 'dp', x, 'notification');
        this._apiService.getUserdataById(this.notifications[x].userid, 'fname username'+(this.notifications['type'] == 2 ? ' nowplaying' : '')).then( userdata => {
          Object.assign(this.notifications[x], userdata['data']); // concat object properties
        });
      }

    });
  }

  update(event) { }

  searchThis(event) {
    this.showUserSuggestions = true;
    this.searchSuggestions = [];
    this.userSearch = event;
    if(this.userSearch.length < 3) {
      this._overlayService.showSubject.next(false);
      return;
    }
    this.noUserFound = false;
    this.showSuggestions = true;
    this.searchSuggestions = [];
    // this._overlayService.configSubject.next({transparent: true, closeOnClick: true });
    // this._overlayService.showSubject.next(true);
    
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+this.userSearch).pipe(debounceTime(1000), distinctUntilChanged()).subscribe( res => {
      if(res['users'].length > 0) {
        let userid = [];
        res['users'].forEach( user => {
          userid.push(user._id);
        });
      }
      this.searchSuggestions = res['users'];
      // getting user photos
      const l = this.searchSuggestions.length;
      if(l > 0) {
        for( let x=0; x<l; x++) {
          if(!this.searchSuggestions[x].dp) continue;
          this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+this.searchSuggestions[x]._id, { responseType: 'blob' }).subscribe(image => {
            let reader = new FileReader();
            reader.addEventListener('load', () => {
              this.searchSuggestions[x]['dpaddress']= this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
            }, false);
            if (image) {
               reader.readAsDataURL(image as Blob);
            }
          });
        }
      }


      if(this.searchSuggestions.length === 0){
        this.noUserFound = true;
      }
    });
  }

  logout() {
    this._userService.logout();
  }

  getDp() {
    this._apiService.getPhotos('dp').subscribe( image => {

      // if image size is less than 30 bytes
      if(image.size < 30) {
        this.onPicUpdate.emit({type: 'dp', src: null});
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dp = this._apiService.dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        this._storageService.dpLink = this.dp;
        this.onPicUpdate.emit({type: 'dp', src: this.dp});
        this._navbarService.dpUpdated.next({type: 'dp', src: this.dp});
        // console.log("dp emitted ", this.dp);
      }, false);
      if (image) {
         reader.readAsDataURL(image);
      }
    });
  }

  showOverlay() {
  }

  userOptions() {
    this.showUserOptions = !this.showUserOptions;
    this.showSuggestions = !this.showSuggestions;
    this.showUserOptions ?
      this._overlayService.configSubject.next({transparent: true, closeOnClick: true })
      : 
      this.closeOverlay();
  }

  updateOptions() {
    this.showUpdateOptions = !this.showUpdateOptions;
    if(!this.showUpdateOptions) {
      this.closeOverlay();
    } else {
      this._overlayService.configSubject.next({transparent: true, closeOnClick: true });
    }
  }

  gameBroadcast() {
    this.showGameBroadcast = !this.showGameBroadcast;
    this.gameSuggestions = [];
    if(this.showGameBroadcast) {
      
      this.nowplayingForm = new FormGroup({
        game: new FormControl('', Validators.required),
        username: new FormControl(),
        audience: new FormControl(),
        stream: new FormControl(),
        console: new FormControl(),
        hasPrivateRoom: new FormControl(),
        roomid: new FormControl(),
        password: new FormControl(),
        privatepassword: new FormControl(),
        desc: new FormControl()
      });
      this.nowplayingForm.patchValue({
        audience: '0',
        console: '',
        hasPrivateRoom: false,
        privatepassword: true
      });

      this._overlayService.configSubject.next({transparent: false, closeOnClick: false });
    }
  }

  saveNowPlaying() {
    console.log(this.nowplayingForm.value);
    this.showGameBroadcast = false;
    this.closeOverlay();
    this._notifService.config.next({text: 'Saving and broadcasting', icon: 'users'});
    this._notifService.progress.next(null);
    this._notifService.closeOn.next(true); // close notification

    if(this.nowplayingForm.get('console').value.length > 0) {
      this.nowplayingForm.patchValue({
        console: this.selectedConsole
      });
      this.showConsoleList = false;
    }

    if(!this.nowplayingForm.get('hasPrivateRoom').value) {
      this.nowplayingForm.removeControl('roomid');
      this.nowplayingForm.removeControl('password');
      this.nowplayingForm.removeControl('privatepassword');
    }
    this.nowplayingForm.removeControl('hasPrivateRoom');
    this._apiService.http.post(APIvars.APIdomain+'/'+APIvars.NOW_PLAYING, this.nowplayingForm.value).subscribe(result => {
      // console.log(result);
      this._notifService.closeOn.next(false); // close notification
      this.showGameBroadcast = false;
      setTimeout(() => {
        this._apiService.getNowPlaying();
      },500);
    });
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
    this._overlayService.closeSubject.next(true);
  }

  gameSuggestions = [];

  searchGame(searchword) {
    this.searchingGame = true;
    if(searchword < 2) {
      return;
    }

    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_GAMEDATA+'/'+searchword).pipe(debounceTime(1000)).subscribe(res => {
      this.gameSuggestions = res['gamedata'];
      this.searchingGame = false;
    });
  }

  gameSelect(game) {
    this.gameSuggestComp.searchInput = game.label;
    this.nowplayingForm.patchValue({game: game.label});
    this.gameSuggestions = [];
  }

  routeTo(place) {
    this.closeOverlay();
    this._apiService.router.navigate(['./'+place]);
  }

  refreshUserVar() {
    this.user = JSON.parse(sessionStorage.getItem('user'));
  }

  gotoProfile(suggestion){
    this.closeOverlay();
    this.showUserSuggestions = false;
    this.searchSuggestions = [];
    this._apiService.router.navigate(['/', suggestion._id]);
  }

  selectConsole(console) {
    this.nowplayingForm.patchValue({
      console: new GameGenrePipe().transform(console.id,true)
    });
    this.selectedConsole = console.id;
    this.showConsoleList = false;
  }

  navOptionSelected(option) {
    // if(option === this.selectedOption.toLocaleLowerCase()) this.closeOverlay();
    this.falseAllFlags();
    this._overlayService.showSubject.next(true);
    switch (option) {
      case 'messages':
        if(this.navbarFlags.showMessages) { this.navbarFlags.showMessages = false; this.closeOverlay(); return; }
        this.navbarFlags.showMessages = true;
        this.navbarFlags.messagelistLoading = true;
        // this.messages = [];
        this.briefmessages();
        break;
      case 'notifications':
        this.navbarFlags.showNotification = !this.navbarFlags.showNotification;
        if(this.navbarFlags.showNotification) this._overlayService.showSubject.next();
        else this.falseAllFlags();
    }
    this._overlayService.configSubject.next({closeOnClick: true, transparent: true});
    this._overlayService.showSubject.next(true);
  }

  briefmessages() {
    return this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_BRIEF_MESSAGES).toPromise().then(result => {
      console.log(result);
      this.groupMessages(result['result']);
    });
  }

  getUnseenMessageCount() {
    this.alerts.messages = this._navbarService.getUnseenMessageCount();
  }

  groupMessages(messages) {
    const l = messages.length;
    if( l === 0) {
      this.navbarFlags.messagelistLoading = null;
      return;
    }
    this.messages = []
    // this.dpLinks = [];
    // seen is already sorted

    for(let x=0; x<l; x++) {
      this.messages.push({
        _id: messages[x].id,
        userid: messages[x]['senderid'],
        username: this.getUserdataById(messages[x]['senderid'], 'username fname lname').then(res => {return (res['data']['username'] || res['data']['fname']+' '+res['data']['lname']);}),
        text: messages[x]['text'],
        time: messages[x]['time'],
        seen: messages[x]['seen'],
        lastSender: messages[x].lastSender,
        dp: null
      });
      if(!messages[x]['seen'] && messages[x]['lastSender'] != this.user._id)  this._navbarService.unseenMessagesRecord.push(this.messages[x]._id);
      this.getUserImageById(messages[x]['senderid'], 'dp');
    }

    this.messages.sort((m1, m2) => {
      return m1.time > m2.time ? -1 : 1;
    });
    this.navbarFlags.messagelistLoading = false;
    console.log(this._navbarService.unseenMessagesRecord);
  }

  async getUserdataById(userid: string, fields?: string, index?: any) {
    if(!userid) return;
    return await this._apiService.http.post(APIvars.APIdomain+"/"+APIvars.GET_USERDATA_BY_ID, {id: userid, fields}).toPromise();
  }
  getUserImageById(userid: string, type: string, index?: any, assignVar?: any) {
    if(!userid) return;
    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+userid, { responseType: 'blob' }).subscribe( image => {
      if(image['type'] === 'application/json')  {
        // this.dpLinks[index] = null;
        return;
      }

      let reader = new FileReader();

      reader.addEventListener('load', () => {
        if(assignVar === 'notification') {
          this.notifications[index]['dp'] = this._apiService.dom.bypassSecurityTrustUrl(reader.result.toString());
          return;;
        }
        const i = this.messages.findIndex( message => message.userid === userid);
        this.messages[i].dp = this._apiService.dom.bypassSecurityTrustUrl(reader.result.toString());
      }, false);
      if (image) {
         reader.readAsDataURL(image as Blob);
      }
    });
  }

  routeToMessaging( convoID?) {
    // this.closeOverlay();
    if(convoID) this._navbarService.selectedConvo = convoID;
    this._apiService.router.navigate(['./messaging']);
  }

  falseAllFlags() {
    this.showUserOptions = false; this.showSuggestions = false; this.showUpdateOptions = false;
      this.navbarFlags.showMessages = false; this.navbarFlags.showNotification = false;
  }
}
