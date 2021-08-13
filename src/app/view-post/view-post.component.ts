import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { APIservice } from 'src/assets/services/api.service';
import { SocketService } from 'src/assets/services/socket.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'sh-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss'],
  animations: [trigger('fade', [
    transition('void => active', [ // using status here for transition
      style({ opacity: 0 }),
      animate(250, style({ opacity: 1 }))
    ]),
    transition('* => void', [
      animate(250, style({ height: 0 }))
    ])
  ]),
  trigger('like', [
    transition('unlike => like', [ // using status here for transition
      style({ opacity: 0 }),
      animate(500, style({ opacity: 1 }))
    ]),
    transition('like => unlike', [
      animate(250, style({ opacity: 0.25 }))
    ])
  ])
  ]
})
export class ViewPostComponent implements OnInit {

  postid: String;
  postDetails: any;
  vpflags = { loadingPost: false, loadingWhoLiked: false, mouseOverNp: false, submittingComment: false, loadingComments: false }
  currentuserid: String;
  currentusername: String;
  comment: String = '';
  comments = [];
  commentToDelete;
  domain = { dp:  APIvars.DP_DOMAIN, cover:  APIvars.COVER_DOMAIN};

  constructor(private _activeRoute: ActivatedRoute,
    private _apiService: APIservice,
    private _storageService: StorageService,
    private _socketService: SocketService,
    private _modalService: NgbModal) { }

  ngOnInit(): void {
    this.postid = this._activeRoute.snapshot.params.postid;
    this.currentusername = this._storageService.currentUser.username;
    this.currentuserid = this._storageService.currentUser._id;

    this._apiService.getPostDetails(this.postid).then(result => {
      this.postDetails = result['result'];
      // console.log("psot details ", this.postDetails);

      if (!this.postDetails || this.postDetails.length === 0) {
        this._apiService.router.navigate(['/not-found']);
      }
      this.getComments();
    }).catch(error => {
    });
  }

  deleteNpPost() {
    this._apiService.deleteNowPlayingPost(this.postDetails._id).then(result => {
      if (result['message'] === 'passed') {
        this._apiService.router.navigate(['/home']);
      }
    });
  }

  getComments(refresh?) {
    if (this.postDetails['noOfComments'] > 0 || refresh) {
      this.vpflags.loadingComments = true;
      this._apiService.getCommentsOnNp(this.postid).then(result => {
        this.comments = result['result'];
        // console.log("comments = ", this.comments);
        const l = this.comments.length;

        this.vpflags.loadingComments = false;
      });
    }

  }

  routeToProfile(_id) {
    this._apiService.router.navigate(['/' + _id]);
  }

  addPlays(npid) {
    this._apiService.addPlays(npid).then(result => {
      // console.log("result ", result);
    });
  }

  getWhoLiked(npid) {
    this.vpflags.mouseOverNp = true;
    if ('likerusers' in this.postDetails) return;
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
      if (res.result === 1) {
        ++this.postDetails.noOfLikes;
        this.postDetails.likedByUser = true;
      } else {
        --this.postDetails.noOfLikes;
        this.postDetails.likedByUser = false;
      }
    });
  }

  addComment() {
    if (this.comment.trim().length === 0 || this.vpflags.submittingComment) return;

    this.vpflags.submittingComment = true;
    this._apiService.addComment(this.postid, this.comment.substr(0, 200)).then(result => {
      // console.log("comment result => ", result);
      this.getComments(true);
      this.vpflags.submittingComment = false;
      this.comment = '';

      // send new notification request to the user of the pos
      if (result['message'] === 'passed' && this.currentuserid !== this.postDetails.userid) {
        this._socketService.pushData('new-notification', { type: 'comment', sentBy: this.currentuserid, targetid: this.postDetails.userid });
      }
    });
  }

  removeComment(npfeedid?, commentid?, i?) {

    // console.log(this.commentToDelete);
    if (!npfeedid) {
      npfeedid = this.commentToDelete.npfeedid;
      commentid = this.commentToDelete.commentid,
        i = this.commentToDelete.i;
    }

    this._apiService.deleteNpComment(npfeedid, commentid).then(result => {
      // console.log("result = ", result);
      if (result['message'] === 'passed') {
        this.comments.splice(i, 1);
      }
    });
  }

  modalopen(template) {
    this._modalService.open(template, { ariaLabelledBy: 'modal-basic-title', size: 'sm' }).result.then((result) => {
    }, (reason) => {
    });
  }

  confirmDeleteComment(template, npfeedid, commentid, i) {
    this.modalopen(template);
    this.commentToDelete = { npfeedid, commentid, i };
    // console.log(this.commentToDelete);
  }

}
