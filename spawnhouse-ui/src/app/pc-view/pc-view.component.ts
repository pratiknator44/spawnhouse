import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FloatNotificationSchema } from 'src/assets/interfaces/float-notification-config.interface';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { UserService } from 'src/assets/services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'pc-view',
  templateUrl: './pc-view.component.html',
  styleUrls: ['./pc-view.component.scss']
})
export class PcViewComponent implements AfterViewInit, AfterContentInit {
  
  // title = 'spawnhouse-ui';
  isNotifVisible: boolean;
  config: {closeOnClick: boolean, transparent: boolean} = {closeOnClick: false, transparent: false};
  floatNotifConfig: FloatNotificationSchema;
  showOverlay: boolean;
  isLoggedIn: boolean;
  minimessage; // {show: false, userdata: {}};
  showLoginStrip: boolean;
  showNpSidedock = false;
  totalActiveNowPlayingUsers = 0;
  @ViewChild('navbar') navbar: NavbarComponent;

  constructor(private _floatNoteService: FloatNotificationService,
    private _overlayService: OverlayService,
    private _navbarService: NavbarService,
    private _userService: UserService)
  {}
  
  // make this true for all routes except login
  ngAfterContentInit() {
    if(window.location.href.split("/").splice(-1).pop().toLowerCase() === 'login')  this.showLoginStrip = false;
  }
  ngAfterViewInit() {
    // this.floatNotifConfig = {text: '', icon: ''};
    this._floatNoteService.closeOn.asObservable().subscribe( close => {
      this.isNotifVisible = close;
    });

    this._overlayService.configSubject.asObservable().subscribe( config => {
      this.config = config;
      this.showOverlay = true;
    });

    this._navbarService.isLoggedIn.asObservable().subscribe( status => {
      // console.log('login status = ', status);
      this.isLoggedIn = status;
      if(status) {
        return;
      }
    });
    
    this._floatNoteService.config.asObservable().subscribe(config => {
      this.floatNotifConfig = config;
      // console.log('got config as ', config);
    });

    // this._floatNoteService.showToastOb.subscribe( show => {
    //   this.showToast = show;
    // });

    this._overlayService.showSubject.asObservable().subscribe( show => {
      this.showOverlay = show;
    });

    this._userService.minimessageConfigSubject.asObservable().subscribe( result => {
      this.minimessage = result;
    });

  }
  overlayClicked(event) {
    this.showOverlay = !this.config.closeOnClick
    this._overlayService.closeSubject.next();
  }

  sendMessage(event) {
    console.log("inside pc view ", event);
    this._userService.minimessageFiredSubject.next(event);
  }

  closeMinimessage(status) {
    this.minimessage = {show: false, userdata: null};
    this._overlayService.showSubject.next(false);
  }

}
