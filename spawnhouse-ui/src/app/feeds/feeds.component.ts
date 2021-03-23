import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss']
})
export class FeedsComponent implements OnInit, OnChanges {
  posts = [];
  pageNo = 1;
  optionsMenuId;
  @Input() loadMore: boolean;
  @Input() userSpecific: boolean;
  @Input() user;    // shows posts only by the userid provided
  @Output() endOfFeeds = new EventEmitter<boolean>();
  lastFeedTimestamp: Number | String;
  feedFlags = {feedsLoading: false, endOfFeeds: false};
  // endOfFeeds = true if the last time the no. of posts got are 0, so apis are not hit uselessly

  @HostListener('window: scroll', ['$event']) onScroll(e: Event): void {
    if(
      (e.target['scrollingElement'].scrollTop / (e.target['scrollingElement'].scrollHeight
      - e.target['scrollingElement'].clientHeight)) > 0.75) {
        this.getPosts(false);
    }
  }

  constructor(private _apiService: APIservice,
    private _router: Router,
    private _storageServer: StorageService,
    private _socketService: SocketService) { }

  ngOnInit(): void {

    if(!this.user)
      this.user = this._storageServer.currentUser;
    
    this.getPosts(true);
    // refresh posts after posting etc.
    this._apiService.refreshPosts.asObservable().subscribe( ref => {
      ref['dp'] = this._apiService.getUserImageById('dp', this.user._id);
      this.posts.push(ref)});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.userSpecific)  return;
    if('user' in changes) {
      this.reset();
      this.user = changes['user']['currentValue'];
      this.getPosts(true);
    }
  }
  getPosts(refresh?: boolean) {
    if(this.feedFlags.feedsLoading || this.feedFlags.endOfFeeds) return;
    // save
    this.feedFlags.feedsLoading = true;
    this._apiService.getPosts(refresh ? null : this.pageNo, this.userSpecific ?  this.user._id : null).then( result => {

      if(result['message'] === 'passed') this.pageNo++;
      // console.log("new posts = ", result.result);
      const l = result.result.length || 0;
      let tempPosts = result.result;
      // let upperLimit = 0, lowerLimit = 0;
      // if(l > 0) {
      //   lowerLimit = result.result.findIndex(post => post._id === result.result[0]._id);
      //   upperLimit = lowerLimit + l - 1;
      // }

      // refresh ? this.posts = result.result : this.posts.push(...result.result);
      
      // console.log(lowerLimit, " to ", upperLimit);
      // for(let x = lowerLimit; x < upperLimit; x++) {
      //   this.posts[x]['dp'] = this._apiService.getUserImageById('dp', this.posts[x].userid);

      //   // get associated media
      //   if(this.posts[x]['type'] === 2) {
      //     this.posts[x]['mediafile'] = this._apiService.getMediaFromPostId(this.posts[x]._id);          
      //   }
      // }


      for(let x = 0; x < l; x++) {
        tempPosts[x]['dp'] = this._apiService.getUserImageById('dp', tempPosts[x].userid);

        // get associated media
        if(tempPosts[x]['type'] === 2) {
          tempPosts[x]['mediafile'] = this._apiService.getMediaFromPostId(tempPosts[x]._id);          
        }
      }

      refresh ? this.posts = tempPosts : this.posts.push(...tempPosts);
      this.feedFlags.feedsLoading = false;

      if( l === 0) {
        this.feedFlags.endOfFeeds = true;
        this.endOfFeeds.emit(true);
      }
    });
  }

  postAction(actionType, postid) {
    switch(actionType) {
      case 'delete':
        this._apiService.deletePostById(postid).then(result => {
          if(result.message === "passed") {
            // this.getPosts(true);
            const i = this.posts.findIndex(post => post._id === postid);
            this.posts.splice(i, 1);
          }
        });
      break;
    }
  }

  routeToProfile(userid) {
    this._router.navigate(['/'+userid]);
  }

  like(postid, index?) {
    if(index > -1) {
      this.posts[index].likedByUser = !this.posts[index].likedByUser;
      this.posts[index].likedByUser ? ++this.posts[index].likes : --this.posts[index].likes;
    }
    this._apiService.addRemoveLike(postid).then(result => {
      console.log("like result = ", result);
      if(result.liked)    // dont send socket data if disliked
        this._socketService.pushData("like", {postid, userid: this._storageServer.currentUser._id});
    });
  }

  reset() {
    this.posts = [];
    this.feedFlags.endOfFeeds = false;
    this.feedFlags.feedsLoading = false;
    this.pageNo = 1;
  }

}
