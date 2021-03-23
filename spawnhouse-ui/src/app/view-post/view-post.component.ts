import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {

  postid: String;
  postDetails: any;
  vpflags = {loadingPost: false, loadingWhoLiked: false, mouseOverNp: false, submittingComment: false}
  currentuserid: String;
  currentusername: String;
  comment: String = '';
  comments = [];
  constructor(private _activeRoute: ActivatedRoute,
    private _apiService: APIservice,
    private _storageService: StorageService) { }

  ngOnInit(): void {
    this.postid = this._activeRoute.snapshot.params.postid;
    this.currentusername = this._storageService.currentUser.username;
    this._apiService.getPostDetails(this.postid).then( result => {
      this.postDetails = result['result'];
      console.log(this.postDetails);

      this.postDetails.userdata['dpLink'] = this._apiService.getUserImageById('dp', this.postDetails.userdata._id);
      this.getComments();
    }).catch( error => {
      this.postDetails = error;
    });

    this.currentuserid = this._storageService.currentUser._id;

  }

  deleteNpPost(npid) {
    // this._apiService.deleteNowPlayingPost(npid).then(result => {
    //   this.pos.splice(i, 1);
    // });
  }

  getComments(refresh?) {
    if(this.postDetails['noOfComments'] > 0 || refresh)
        this._apiService.getCommentsOnNp(this.postid).then( result => {
          this.comments = result['result'];
          // console.log("comments = ", this.comments);
          const l = this.comments.length;
          
          for(let x=0; x<l; x++) {
            this.comments[x]['commenterdata']['dpLink'] = this._apiService.getUserImageById('dp', this.comments[x]['commenterdata']._id);
          }
        });

  }

  routeToProfile(_id) {}

  addPlays(npid) {
    this._apiService.addPlays(npid).then(result => {
      console.log("result ", result);
    });
  }

  getWhoLiked(npid) {
    this.vpflags.mouseOverNp = true;
    if('likerusers' in this.postDetails)  return;
    this.vpflags.loadingWhoLiked = true;
    this._apiService.getWhoLiked(npid).then(result => {
      // console.log("people who liked pos id ", npid, " ", result);
      this.postDetails['likerusers'] = result.result;
      this.vpflags.loadingWhoLiked = false;
    });
  }

  likeNp(npid, i?) {
    this.postDetails.likedByUser = !this.postDetails.likedByUser;
    this._apiService.likeNowPlaying(npid).then(res => {
      // console.log("np like response = ", res);
      if(res.result === 1) {
          ++this.postDetails.noOfLikes;
          this.postDetails.likedByUser = true;
      } else {
          --this.postDetails.noOfLikes;
          this.postDetails.likedByUser = false;
      }
    });
  }

  addComment() {
    if(this.comment.trim().length === 0 || this.vpflags.submittingComment) return;

    this.vpflags.submittingComment = true;
    this._apiService.addComment(this.postid, this.comment.substr(0,200)).then(result => {
      // console.log("comment result => ", result);
      this.getComments(true);
      this.vpflags.submittingComment = false;
      this.comment = '';
    });
  }

}
