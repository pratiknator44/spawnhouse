import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { APIservice } from 'src/assets/services/api.service';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { NavbarService } from 'src/assets/services/navbar.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-np-feeds',
  templateUrl: './np-feeds.component.html',
  styleUrls: ['./np-feeds.component.scss']
})
export class NpFeedsComponent implements OnInit {

  userSuggestions = [];
  homeflags = {loadMoreFeeds: true, feedsEnd: false, loadingWhoLiked: false};
  np = [];
  currentuserid;
  npListPageNo = 1;
  mouseOverNp: number;    // used to show and hide liker users
  postToDelete;
  
  @Input() userlist: Array<string> = null;
  @HostListener('window: scroll', ['$event']) onScroll(e: Event): void {
    if(
      (e.target['scrollingElement'].scrollTop / (e.target['scrollingElement'].scrollHeight
      - e.target['scrollingElement'].clientHeight)) > 0.75) {
        this.loadMore();
    }
  }


  constructor(private _notifService: FloatNotificationService,
    private _storageService: StorageService,
    private _apiService: APIservice,
    private _navbarService: NavbarService,
    private _modalService: NgbModal,
    private _socketService: SocketService) {
    }


  ngOnInit(): void {
    this._notifService.checkForLocation();
    this._notifService.setTitle(JSON.parse(this._storageService.getSessionData('user'))['fname']+' | Home');
    this.loadMore();
    this.currentuserid = this._storageService.currentUser._id;
  }

  loadMore(refresh?) {
    if(this.homeflags.feedsEnd) return;

    if(!this.homeflags.loadMoreFeeds) return;

    if(refresh) {
      this.npListPageNo = 1;
      this.np = [];
    }
    this.homeflags.loadMoreFeeds = false;
    this._apiService.getNowPlayingOfFollowing(this.npListPageNo, this.userlist).then(nowplayings => {
      // this.np = nowplayings['result'] || [];
      if(nowplayings['result'].length === 0)  this.homeflags.feedsEnd = true;   // permanant stop to feel load more
      //getting dp of updated entries
      this.getDpOfEntries(nowplayings['result']);
      this.npListPageNo++;
      // this.total.emit(this.np.length);
    });
  }

  getDpOfEntries(nowplayings) {
    const l = nowplayings.length;
    for(let x=0; x < l; x++) {
      if(!nowplayings[x]['isDead']) {
        try {
          nowplayings[x]['stillplaying'] = (3600000 * nowplayings[x]['nowplaying']['estplaytime']) > (new Date().getTime() - nowplayings[x]['nowplaying']['time']);
        } catch(e) {
          nowplayings[x]['stillplaying'] = true;
        }
      } else {
        nowplayings[x]['stillplaying'] = false;
      }
      nowplayings[x]['dp'] = this._apiService.getUserImageById('dp', nowplayings[x].userid);
    }
    this.np.push(...nowplayings);
    this.np.sort( (a, b) => b.stillplaying ?  1 : -1);
    this.homeflags.loadMoreFeeds = true;
  }

  likeNp(usernp, i?) {
    const npid = usernp._id;
    // console.log(npid);
    this.np[i].likedByUser = !this.np[i].likedByUser;
    this._apiService.likeNowPlaying(npid).then(res => {
      // console.log("np like response = ", res.result);
      if(res.result === 1) {
          ++this.np[i].noOfLikes;
          this.np[i].likedByUser = true;

          this._socketService.pushData("new-np-like", {author: usernp.userid, likerUsername: this._storageService.currentUser.username, npid, likerid: this._storageService.currentUser._id});
          
      } else {
          --this.np[i].noOfLikes;
          this.np[i].likedByUser = false;
      }
    });
    // this._notifService.makeToast.next('feedback');
  }


  getWhoLiked(npid, index) {
    this.mouseOverNp = index;
    if('likerusers' in this.np[index])  return;
    this.homeflags.loadingWhoLiked = true;
    this._apiService.getWhoLiked(npid).then(result => {
      // console.log("people who liked pos id ", npid, " ", result);
      this.np[index]['likerusers'] = result.result;
      this.homeflags.loadingWhoLiked = false;
    });
  }

  deleteNpPost(npid?, i?) {
    if(!npid) {
      npid = this.postToDelete.postid;
      i = this.postToDelete.i;
    }
    this._apiService.deleteNowPlayingPost(npid).then(result => {
      this.np.splice(i, 1);
    });

    this._notifService.makeToast.next('feedback');
  }

  routeToPost(npid) {
    // console.log("routing to... ", npid);
    this._apiService.router.navigateByUrl('/view-post/'+npid);
  }

  addPlays(npid, i) {
    this._apiService.addPlays(npid).then(result => {
      // console.log("result ", result);
    });
  }

  showNpForm() {
    this._navbarService.npShowSubject.next(true);
  }

  routeToProfile(id) {
    this._apiService.router.navigateByUrl('/'+id);
  }

  
  modalopen(template) {
    this._modalService.open(template, {ariaLabelledBy: 'modal-basic-title', size: 'sm'}).result.then((result) => {
    }, (reason) => {
    });  
  }

  confirmDeletePost(template, postid, i) {
    this.modalopen(template);
    this.postToDelete = {postid, i};
    this._notifService.makeToast.next('feedback');
  }

}
