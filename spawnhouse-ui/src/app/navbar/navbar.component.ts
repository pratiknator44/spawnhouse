import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { HttpClient } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SuggestionsComponent } from '../suggestions/suggestions.component';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { GameGenrePipe } from 'src/assets/pipes/gamegenre.pipe';
import { CookieService } from 'ngx-cookie-service';

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
  hoveringOn = '';
  showSuggestions: boolean;
  dp: any;
  userSearch = '';
  user;
  searchingGame: boolean;
  showUserOptions: boolean;
  dpSubject = new Subject<any>();
  dpObservale;
  imageSchema: IPictureUploadSchema;
  noUserFound: boolean;
  showUpdateOptions = false;
  showGameBroadcast = false;
  showConsoleList = false;
  consolePipe;
  selectedConsole: string;
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
  
  nowplayingForm: FormGroup;
  @Input() imageUploadMode: string;
  @ViewChild('gameSuggestComp') gameSuggestComp: SuggestionsComponent;

  
  @Output() onPicUpdate = new EventEmitter(); 
  constructor(private _storageService: StorageService,
    private _api: APIservice,
    private _dom: DomSanitizer,
    private _router: Router,
    private _navbarService: NavbarService,
    private _notifService: FloatNotificationService,
    private _overlayService: OverlayService,
    private _http: HttpClient,
    private _cookieService: CookieService) { }

  ngOnInit(): void {
    this.options = [
      { name: 'Home', icon: 'home', alert: 0},
      { name: 'Friends', icon: 'users', alert: 2 },
      { name: 'Streams', icon: 'display', alert: 0, showSubmenu: false, submenu: { options: ['Story', 'Status', 'Now Playingaaaaa'], triggerFunction: this.update(event) }},
      { name: 'Notifcations', icon: 'bell', alert: 99 },
      { name: 'Messages', icon: 'bubbles', alert: 3 }]
     // { name: 'Settings & Privacy', icon: 'cog', alert: 0 }];
      
    this.selectedOption = this.options[0].name;
    // call profile picture api
    this.user = JSON.parse(sessionStorage.getItem('user'));
    // this.dp = this._api.getDp();
    this.getDp();
    this._navbarService.getDpSubject.asObservable().subscribe( status => {
      if(status) this.getDp();
    });
    this._overlayService.closeSubject.asObservable().subscribe( closeOptions => {
      this.showUserOptions = false; this.showSuggestions = false; this.showUpdateOptions = false;
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
  }

  update(event) {
    // console.log('event = ', event);
  }

  searchThis(event) {
    // console.log(event);
    this.searchSuggestions = [];
    this.userSearch = event;
    if(this.userSearch.length < 3) {
      this._overlayService.closeSubject.next();
      return;
    }
    this.noUserFound = false;
    this.showSuggestions = true;
    this.searchSuggestions = [];
    this._overlayService.configSubject.next({transparent: true, closeOnClick: true });
    
    this._http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+this.userSearch).subscribe( res => {
      if(res['users'].length > 0) {
        let userid = [];
        res['users'].forEach( user => {
          userid.push(user._id);
        });
      }
      this.searchSuggestions = res['users'];
      if(this.searchSuggestions.length === 0){
        this.noUserFound = true;
      }
    });
  }

  logout() {
    this._storageService.reset();
    this._cookieService.deleteAll('');
    this._router.navigate(['./login']);
  }

  getDp() {
    this._api.getPhotos('dp').subscribe( image => {

      // if image size is less than 30 bytes
      if(image.size < 30) {
        this.onPicUpdate.emit({type: 'dp', src: null});
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dp = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
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
      this._overlayService.closeSubject.next();
  }

  updateOptions() {
    this.showUpdateOptions = !this.showUpdateOptions;
    if(!this.showUpdateOptions) {
      this._overlayService.closeSubject.next();
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
        exposepassword: new FormControl(),
        desc: new FormControl()
      });
      this.nowplayingForm.patchValue({
        audience: '0',
        console: '',
        hasPrivateRoom: false
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
      this.nowplayingForm.removeControl('exposepassword');
    }
    this.nowplayingForm.removeControl('hasPrivateRoom');
    this._http.post(APIvars.APIdomain+'/'+APIvars.NOW_PLAYING, this.nowplayingForm.value).subscribe(result => {
      // console.log(result);
      this._notifService.closeOn.next(false); // close notification
      this.showGameBroadcast = false;
      setTimeout(() => {
        this._api.getNowPlaying();
      },500);
    });
  }

  closeOverlay() {
    this._overlayService.showSubject.next(false);
  }

  gameSuggestions = [];

  searchGame(searchword) {
    this.searchingGame = true;
    if(searchword < 2) {
      return;
    }

    this._http.get(APIvars.APIdomain+'/'+APIvars.GET_GAMEDATA+'/'+searchword).subscribe(res => {
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
    this._router.navigate(['./'+place]);
  }

  refreshUserVar() {
    this.user = JSON.parse(sessionStorage.getItem('user'));
  }

  
  gotoProfile(suggestion){
    this._overlayService.closeSubject.next();
    this._router.navigate(['/', suggestion._id]);
  }

  selectConsole(console) {
    this.nowplayingForm.patchValue({
      console: new GameGenrePipe().transform(console.id,true)
    });
    this.selectedConsole = console.id;
    this.showConsoleList = false;
  }
}
