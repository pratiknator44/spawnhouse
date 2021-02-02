import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss']
})
export class FeedsComponent implements OnInit {
  posts = [];
  pageNo = 1;
  user;
  optionsMenuId;
  constructor(private _apiService: APIservice,
    private _router: Router,
    private _storageServer: StorageService) { }
  ngOnInit(): void {

    this.getPosts();
    this.user = this._storageServer.currentUser;

    // refresh posts after posting etc.
    this._apiService.refreshPosts.asObservable().subscribe( ref => {
      ref['dp'] = this._apiService.getUserImageById('dp', this.user._id);
      this.posts.push(ref)});

  }

  getPosts(refresh?: boolean) {
    this._apiService.getPosts(refresh ? this.pageNo : --this.pageNo).then( result => {
      if(result['message'] === 'passed') this.pageNo++;
      const l = result.result.length || 0;
      refresh ? this.posts = result.result : this.posts.push(...result.result);

      for(let x = 0; x < l; x++) {
        this.posts[x]['dp'] = this._apiService.getUserImageById('dp', this.posts[x].userid);
      }
      console.log("posts = ", this.posts);
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
      console.log("Result = ", result);
    });
  }

}
