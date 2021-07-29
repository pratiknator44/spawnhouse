import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
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
import { INavbarMessage } from 'src/assets/interfaces/MsgNotif.interface';
import { SocketService } from 'src/assets/services/socket.service';
import { NowplayingService } from 'src/assets/services/now-playing.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { animate, style, transition, trigger } from '@angular/animations';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
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
  showConsoleList = false;
  consolePipe;
  selectedConsole: string;
  navbarFlags = { messagelistLoading: false, notificationsLoading: false, notificationsEnd: false, lockGameName: false };
  activeOption: string;
  messages: INavbarMessage[] | any = [];
  notifications = [];  //INotification[] = [];
  pageNo: number = 1;
  searchedGame = '';
  gameApiTimeout;
  searchword;
  alerts = { notifications: 0, messages: 0 };
  nowplayingForm: FormGroup;
  gameSuggestions = [];
  eula: String;
  domain = {dp: APIvars.DP_DOMAIN, cover: APIvars.COVER_DOMAIN};

  @Input() imageUploadMode: string;
  @Output() onPicUpdate = new EventEmitter();

  constructor(
    private _storageService: StorageService,
    private _apiService: APIservice,
    private _navbarService: NavbarService,
    private _notifService: FloatNotificationService,
    private _overlayService: OverlayService,
    private _socketService: SocketService,
    private _nowplayingService: NowplayingService,
    private _modalService: NgbModal,
    private _titleService: Title) { }

  ngOnInit(): void {
    this._navbarService.startSocketConnection();
    this.options = [
      { name: 'Home', icon: 'home', alert: 0 },
      { name: 'Friends', icon: 'users', alert: 2 },
      { name: 'Streams', icon: 'display', alert: 0, showSubmenu: false, submenu: { options: ['Story', 'Status', 'Now Playingaaaaa'], triggerFunction: this.update(event) } },
      { name: 'Notifications', icon: 'bell', alert: 1 },
      { name: 'Messages', icon: 'bubbles', alert: 0 }];
    // { name: 'Settings & Privacy', icon: 'cog', alert: 0 }];

    this._navbarService.refreshUnseenMessages.subscribe(res => { this.getUnseenMessageCount(); });


    this.selectedOption = this.options[0].name;
    // call profile picture api
    this.user = JSON.parse(this._storageService.getSessionData('user'));
    this.getDp();
    this._navbarService.getDpSubject.asObservable().subscribe(status => {
      if (status) this.getDp();
    });
    this._overlayService.closeSubject.asObservable().subscribe(closeOptions => {
      this.activeOption = null;
    });

    setTimeout(() => {
      this._navbarService.refreshUser.asObservable().subscribe(data => {
        this.refreshUserVar();
      });
    }, 3000);
    this.getNotificationCount();
    this.getUnseenMessageCount();
    this.startNotificationMessageSockets();
    this.getNotifications(true);

    // if nppwd is present in the memory, start the password listener;
    if (this._storageService.getSessionData('nppwd')) {
      this._nowplayingService.startListeningNPpwdRequests();
    }
  }

  update(event) { }

  notifScroll(e: Event) {
    // console.log(e['target']['scrollTop']);
    if (
      (e['target']['scrollTop'] / (e['target']['scrollHeight']
        - e['target']['clientHeight'])) > 0.95) {
      // console.log("hello trigger scroll");
      this.getNotifications(false);
    }
  }

  getNotificationCount() {
    this._apiService.getNewNotificationCount().then(result => {

      this.alerts.notifications = result['count'];
    });
  }

  startNotificationMessageSockets() {
    // message
    this._socketService.getMessageCountOb().subscribe(count => {
      // console.log("got data => via new-message-count ", count);
      ++this.alerts.messages;
      this.getUnseenMessageCount();
      // console.log("this.alerts.messages = ", this.alerts.messages);
      this._navbarService.playNotificationSound();
    });

    // notification
    this._socketService.getData('new-notification').subscribe(count => {
      // console.log("got new notification ");
      this.getNotifications();
      ++this.alerts.notifications;
      this._navbarService.playNotificationSound();
    });

    // like for posts
    // this._socketService.getData('new-like').subscribe(likeData => {
    //   console.log("got a new like data = ", likeData);
    // });

    // like for NP
    this._socketService.getData('new-np-like').subscribe(likeData => {
      this._notifService.makeToast.next({ heading: 'like', text: '<strong>' + likeData.likerUsername + '</strong> liked your post' });
    });
  }

  getNotifications(refresh?) {
    if (this.navbarFlags.notificationsLoading) return;

    if (refresh) this.pageNo = 1;
    this.navbarFlags.notificationsLoading = true;
    this._apiService.getNotifications(this.pageNo).then(result => {
      // console.log("detailed notification ", result);
      let temp = result['result'];
      const l = temp.length;

      if (l === 0) {
        this.navbarFlags.notificationsLoading = false;
        this.navbarFlags.notificationsEnd = true;
        return;
      };

      // for (let x = 0; x < l; x++) {
      //   temp[x].dp = this._apiService.getUserImageById('dp', temp[x].userid);
      // }

      this.navbarFlags.notificationsLoading = false;
      if (refresh) {
        this.notifications = temp;
      } else {
        this.notifications.push(...temp);
      }
      ++this.pageNo;
    });
  }

  searchThis(event) {
    if (event.length < 3) {
      this._overlayService.showSubject.next(false);
      return;
    }

    this.showUserSuggestions = true;
    this.searchSuggestions = [];
    this.userSearch = event;

    this.noUserFound = false;
    this.showSuggestions = true;
    this.searchSuggestions = [];
    // this._overlayService.configSubject.next({transparent: true, closeOnClick: true });
    // this._overlayService.showSubject.next(true);

    if (this.gameApiTimeout) {
      clearTimeout(this.gameApiTimeout);
    }

    this.gameApiTimeout = setTimeout(() => {
      this._apiService.searchUser(this.userSearch).then(res => {
        if (res['users'].length > 0) {
          let userid = [];
          res['users'].forEach(user => {
            userid.push(user._id);
          });
        }
        this.searchSuggestions = res['users'];
        // getting user photos
        const l = this.searchSuggestions.length;
        if (l > 0) {
          for (let x = 0; x < l; x++) {
            if (!this.searchSuggestions[x].dp) continue;
            this.searchSuggestions[x]['dpaddress'] = this._apiService.getUserImageById('dp', this.searchSuggestions[x]._id);
          }
        }

        if (this.searchSuggestions.length === 0) {
          this.noUserFound = true;
        }
      }).catch(error => {
        this._notifService.makeToast.next({ header: 'Something went wrong', text: 'Some error occured while searching' });
        this.searchSuggestions = [];
        this.noUserFound = true;
      }).finally(() => { this.gameApiTimeout = null; });
    }, 1500);


  }

  logout() {
    this._overlayService.showSubject.next(false);
    this._apiService.logout();
  }

  getDp() {
    this.dp  = APIvars.DP_DOMAIN+this._storageService.getCurrentUserProperty('dp');
    // this._apiService.getPhotos('dp').then(image => {

    //   // if image size is less than 30 bytes
    //   if (image.size < 30) {
    //     this.onPicUpdate.emit({ type: 'dp', src: null });

    //     // means if dp is null, dissociate from memory as well:
    //     this._storageService.deleteSessionData(this.user._id);
    //     this._navbarService.dpUpdated.next({ type: 'dp', src: null });
    //     this.dp = null;
    //     return null;
    //   }
    //   // convert raw image to Blob object
    //   let reader = new FileReader();
    //   reader.addEventListener('load', () => {
    //     const unsafeValue = reader.result.toString();
    //     this.dp = this._apiService.dom.bypassSecurityTrustResourceUrl(unsafeValue);
    //     this._storageService.setSessionData(this._storageService.currentUser._id, unsafeValue);
    //     this._storageService.dpLink = this.dp;
    //     this.onPicUpdate.emit({ type: 'dp', src: this.dp });
    //     this._navbarService.dpUpdated.next({ type: 'dp', src: this.dp });
    //     // console.log("dp emitted ", this.dp);
    //   }, false);
    //   if (image) {
    //     reader.readAsDataURL(image);
    //   }
    // });
  }

  updateOptions() {
    this.showUpdateOptions = !this.showUpdateOptions;
    if (!this.showUpdateOptions) {
      this.closeOverlay();
    } else {
      this._overlayService.configSubject.next({ transparent: true, closeOnClick: true });
    }
  }

 
  closeOverlay() {
    this._overlayService.showSubject.next(false);
    this._overlayService.closeSubject.next(true);
  }

  routeTo(place) {
    this.closeOverlay();
    this._apiService.router.navigate(['./' + place]);
  }

  refreshUserVar() {
    this.user = JSON.parse(sessionStorage.getItem('user'));
  }

  gotoProfile(suggestion) {
    this.closeOverlay();
    this.showUserSuggestions = false;
    this.searchSuggestions = [];
    this._apiService.router.navigate(['/', suggestion._id]);
  }

  navOptionSelected(option) {
    this._overlayService.showSubject.next(true);
    switch (option) {
      case 'msg':
        if (this.activeOption === 'msg') { this.activeOption = null; this.closeOverlay(); return; }

        this.activeOption = 'msg';
        this.navbarFlags.messagelistLoading = true;
        this.briefmessages();
        break;
      case 'notif':
        if (this.activeOption === 'notif') { this.activeOption = null; this.closeOverlay(); return; }

        this.activeOption = 'notif';
        this.getNotifications(true);
        break;

      case 'all-notif':
        this.activeOption = null;
        this.routeTo('all-notifications');
        break;
        
      case 'userop':
        if (this.activeOption === 'userop') { this.activeOption = null; this.closeOverlay(); return; }
        this.activeOption = 'userop';
        break;
    }
    this._overlayService.configSubject.next({ closeOnClick: true, transparent: true });
    this._overlayService.showSubject.next(true);
  }

  briefmessages() {
    return this._apiService.http.get(APIvars.APIdomain + '/' + APIvars.GET_BRIEF_MESSAGES).toPromise().then(result => {
      // console.log("ungrouped messages: ", result);
      this.groupMessages(result['result']);
    });
  }

  getUnseenMessageCount() {
    this._apiService.http.get(APIvars.APIdomain + '/' + APIvars.GET_UNSEEN_MESSAGE_COUNT).toPromise().then(result => {
      // console.log('count ', result);
      this.alerts.messages = result['count'] || 0;
    });
  }


  // transforming the object
  groupMessages(messages) {
    const l = messages.length;
    if (l === 0) {
      this.navbarFlags.messagelistLoading = null;
      return;
    }
    this.messages = [];

    // trandforming array 
    for (let x = 0; x < l; x++) {
      this.messages.push({
        _id: messages[x].id,
        userid: messages[x]['senderid'],
        username: messages[x]['username'],
        text: messages[x]['text'],
        time: messages[x]['time'],
        seen: messages[x]['seen'],
        lastSender: messages[x].lastSender,
        dp: messages[x]['dp'],      //this._apiService.getUserImageById('dp', messages[x]['senderid'])
      });

      if (!messages[x]['seen'] && messages[x]['lastSender'] != this.user._id)
        this._navbarService.unseenMessagesRecord.push(this.messages[x]._id);

    }

    this.messages.sort((m1, m2) => {
      return m1.time > m2.time ? -1 : 1;
    });
    this.navbarFlags.messagelistLoading = false;
  }

  async getUserdataById(userid: string, fields?: string, index?: any) {
    if (!userid) return;
    return await this._apiService.http.post(APIvars.APIdomain + "/" + APIvars.GET_USERDATA_BY_ID, { id: userid, fields }).toPromise();
  }

  routeToMessaging(convoID?) {
    // this.closeOverlay();
    if (convoID) this._navbarService.selectedConvo = convoID;
    this._apiService.router.navigate(['./messaging']);
  }

  markAllNotificationsRead() {
    this._apiService.markAllNotificationsRead().then(result => {
      this.activeOption = null;
      if (result['message'] === 'passed') {
        this.getNotifications();
        this.getNotificationCount();
      }
    });
  }

  refreshNotification(type) {
    // console.log("doing operation in notification ", type);
    if (type === 'count') {
      this.alerts.notifications = 0;
      this.getNotificationCount();
    }
  }

  closeNotificationOverlay(refreshSomething?) {
    // console.log("closing notification overlay ", refreshSomething);
    if (refreshSomething) this.refreshNotification(refreshSomething);
    this.activeOption = null;
    this._overlayService.showSubject.next(false);
  }

  markAsRead(i) {
    // console.log("event ", this.notifications[i]);
    this.getNotificationCount();
    // this._apiService.markNotificationRead(this.notifications[i]._id).then(res => {
    //   console.log("notification read success = ", res['message']);
    //   this.notifications[i].seen = true;
    //   this.getNotificationCount();
    // });
  }

  modalOpen(content, size?) {
    this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size || 'lg' }).result.then((result) => {
    }, (reason) => {
    });
  }

  showEula() {
    this._apiService.getEula().then(data => {
      if (data['message'] === 'passed') {
        this.eula = data['data'];
      } else {
        this.eula = data['error'];
      }
    });
  }

  showFeedback(template) {
    this.modalOpen(template, 'small');
  }

  // async pasteLink() {
  //   const text = await navigator.clipboard.readText().then(text => text); 
  //   this.nowplayingForm.patchValue({
  //     stream: text
  //   });
  // }
}
