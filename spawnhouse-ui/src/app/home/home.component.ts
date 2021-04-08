import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { APIservice } from 'src/assets/services/api.service';
// import { Title } from '@angular/platform-browser';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  // userSuggestions = [];
  // homeflags = {loadMoreFeeds: true, feedsEnd: false};
  // np = [];
  // currentuserid;
  // npListPageNo = 1;

  // @ViewChild('feeds') feeds: FeedsComponent;

  // @HostListener('window: scroll', ['$event']) onScroll(e: Event): void {
  //   if(
  //     (e.target['scrollingElement'].scrollTop / (e.target['scrollingElement'].scrollHeight
  //     - e.target['scrollingElement'].clientHeight)) > 0.75) {
  //       console.log("load more called");
  //       this.loadMore();
  //   }
  // }


  constructor(private _notifService: FloatNotificationService,
    // private _storageService: StorageService,
    // private _apiService: APIservice,
    // private _socketService: SocketService,
    private _navbarService: NavbarService) {
    }


  // ngOnInit(): void {
    // this._notifService.checkForLocation();
    // this._notifService.setTitle(JSON.parse(this._storageService.getSessionData('user'))['fname']+' | Home');
    // this.loadMore();
    // this.currentuserid = this._storageService.currentUser._id;
  // }

  openGamingInfo() {
    this._navbarService.showOption.next('gamebroadcast');
    // this._overlayService.configSubject.next({transparent: false, closeOnClick: false });
  }

  // loadMore(refresh?) {
  //   if(this.homeflags.feedsEnd) return;

  //   if(!this.homeflags.loadMoreFeeds) return;

  //   if(refresh) {
  //     this.npListPageNo = 1;
  //     this.np = [];
  //   }
  //   this.homeflags.loadMoreFeeds = false;
  //   this._apiService.getNowPlayingOfFollowing(this.npListPageNo).then(nowplayings => {
  //     // this.np = nowplayings['result'] || [];
  //     if(nowplayings['result'].length === 0)  this.homeflags.feedsEnd = true;   // permanant stop to feel load more
  //     //getting dp of updated entries
  //     this.getDpOfEntries(nowplayings['result']);
  //     this.npListPageNo++;
  //     // this.total.emit(this.np.length);
  //   });
  // }

  // getDpOfEntries(nowplayings) {
  //   const l = nowplayings.length;
  //   // console.log("new np data = ", nowplayings);
  //   for(let x=0; x < l; x++) {
  //     if(!nowplayings['isDead']) {
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

  // likeNp(npid, i?) {
  //   this._apiService.likeNowPlaying(npid).then(res => {
  //     console.log("np like response = ", res);
  //     if(res.result === 1) {
  //         ++this.np[i].noOfLikes;
  //         this.np[i].likedByUser = true;
  //     } else {
  //         --this.np[i].noOfLikes;
  //         this.np[i].likedByUser = false;
  //     }
  //   });
  // }

  // deleteNpPost(npid, i) {
  //   this._apiService.deleteNowPlayingPost(npid).then(result => {
  //     this.np.splice(i, 1);
  //   });
  // }

  // showNpForm() {
  //   this._navbarService.npShowSubject.next(true);
  // }

  // routeToProfile(id) {
  //   this._apiService.router.navigateByUrl('/'+id);
  // }















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
