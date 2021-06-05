import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { APIvars } from '../variables/api-vars.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { StorageService } from './storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
@Injectable({
  providedIn: 'root'
})
export class APIservice {


  dpUrl: any; // contains the local address of the current user dp
  coverUrl: any;
  coverPictureSubject = new Subject<any>();
  dpObservable;
  dpSubject = new Subject<any>();
  coverPictureObservable;
  user: IUser;
  http; router; dom; activatedRoute;
  refreshPosts = new Subject<any>();
  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _dom: DomSanitizer,
    private _activeRoute: ActivatedRoute,
    private _storageService: StorageService,
    private _cookieService: CookieService) {
    this.http = this._http;
    this.router = this._router;
    this.dom = this._dom;
    this.activatedRoute = this._activeRoute;
  }


  logout() {
    this.relogin();
    this._cookieService.deleteAll('');
  }

  relogin() {
    this._storageService.reset();
    this._router.navigate(['./login']);
  }

  getPhotos(type?) {
    if (type === 'dp') {
      return this._http.get(APIvars.APIdomain + '/' + APIvars.GET_DP, { responseType: 'blob' }).toPromise();
    }
    else if (type === 'cover') {
      return this._http.get(APIvars.APIdomain + '/' + APIvars.GET_COVER, { responseType: 'blob' }).toPromise();
    }
  }

  async getCover() {
    const image = await this._http.get(APIvars.APIdomain + '/' + APIvars.GET_COVER, { responseType: 'blob' }).toPromise();
    if (image['type'] === 'application/json')
      return null;

    const readerResult: any = await this.readAsDataURL(image);
    return this._dom.bypassSecurityTrustResourceUrl(readerResult);
  }

  async getUserImageById(type: string, id: string, refresh?: boolean) {
    if (!id) return null;
    let image = null;
    // console.log("getting ", type, 'for id ', id);
    if (type === 'dp') {
      if (!refresh) {
        if (this._storageService.getSessionData(id)) {
          // console.log("dp already present for user", id);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const safeLink = this.dom.bypassSecurityTrustResourceUrl(this._storageService.getSessionData(id));
              resolve(safeLink);
            }, 0);
          });
        }
      }

      image = await this._http.get(APIvars.APIdomain + '/' + APIvars.GET_DP_OF_USER + '/' + id, { responseType: 'blob' }).toPromise().then(res => res);
    }
    else if (type === 'cover') {
      // console.log("Calling url ", APIvars.APIdomain+'/'+APIvars.GET_COVER_OF_USER+'/'+id);
      if (!refresh) {
        if (this._storageService.getSessionData('cover_'+id)) {
          // console.log("dp already present for user", id);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const safeLink = this.dom.bypassSecurityTrustResourceUrl(this._storageService.getSessionData('cover_'+id));
              resolve(safeLink);
            }, 0);
          });
        }
      }
      image = await this._http.get(APIvars.APIdomain + '/' + APIvars.GET_COVER_OF_USER + '/' + id, { responseType: 'blob' }).toPromise().then(res => res);
    }
    // other image categories
    else {
      return null;
    }

    // console.log("image =  ",type, image);
    if (image['type'] === 'application/json') {
      this._storageService.setSessionData(id, null);
      return null;
    }

    const readerResult: any = await this.readAsDataURL(image);

    const domParsed = this._dom.bypassSecurityTrustResourceUrl(readerResult);

    // save dp for future references:
    if (type === 'dp')
      this._storageService.setSessionData(id, readerResult);
    else if (type === "cover")
      this._storageService.setSessionData('cover_'+id, readerResult);
    return domParsed;
  }


  // return a promise that resolves on the 'load' event of FileReader
  async readAsDataURL(image) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result.toString());
      });
      // consider adding an error handler that calls reject
      reader.readAsDataURL(image);
    });
  }

  // called after user updates his dp, to reflect changes in navbar as well.
  getDp() {
    this.getPhotos('dp').then(image => {
      this.dpObservable = this.dpSubject.asObservable();

      if (image.size < 30) {
        this.dpSubject.next({ dpUrl: null });
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dpUrl = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        // this.onPicUpdate.emit({type: 'dp', src: this.dp});
        // console.log("dp emitted");
        this.dpSubject.next({ dpUrl: this.dpUrl });
        // this.dpObservable = this.dpSubject.asObservable();
      }, false);

      if (image) {
        reader.readAsDataURL(image);
      }
    });
  }


  getNowPlaying() {
    this._http.get(APIvars.APIdomain + '/' + APIvars.NOW_PLAYING).toPromise().then(np => {
      // console.log('***now playing', np);
      this._storageService.nowplaying = np['np'];
      this._storageService.currentUser['nowplaying'] = np['np'];
    });
  }

  async getNowPlayingOfCurrentUser() {
    return await this._http.get(APIvars.APIdomain + '/' + APIvars.NOW_PLAYING).toPromise();
  }

  async getGamedata() {
    return await this._http.get(APIvars.APIdomain + '/' + APIvars.SET_USER_GAMEDATA).toPromise();
    // .then(resolve => {return resolve['result']});
  }

  async addRemoveFollower(currentFollowStatus, userid) {
    const operation = currentFollowStatus === 'Follow' ? 'add' : 'sub';
    return this._http.get(APIvars.APIdomain + '/' + APIvars.SET_FOLLOWING + '/' + operation + '/' + userid).toPromise();
  }

  getMessagesByChatid(chatid) {
    if (chatid)
      return this._http.get(APIvars.APIdomain + '/' + APIvars.GET_MESSAGES_BY_ID + '/' + chatid).toPromise();
  }

  getFollowDataById(id) {
    // const id = id ? '' : id;
    return this._http.get(APIvars.APIdomain + '/' + APIvars.GET_FOLLOWDATA + '/' + id).toPromise();
  }

  removeNowPlaying() {
    return this._http.delete(APIvars.APIdomain + '/' + APIvars.REMOVE_NOW_PLAYING).toPromise()
  }

  updatePlayerType(playerType) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.SET_USER_GAMEDATA, { playerType }).toPromise();
  }

  getUsersAround(location, distance?: number, page?: number) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.GET_USERS_AROUND, { location, distance, page }).toPromise();
  }

  checkUsername(username: string) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.GET_USERDATA + '/' + username).toPromise();
  }

  getNotifications(pageNo?) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.NOTIFICATIONS, { pageNo }).toPromise();
  }

  getNewNotificationCount() {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.NOTIFICATIONS + '/' + APIvars.NEW_NOTIFICATION_COUNT).toPromise();
  }

  getUserdataById(id, fields?) {
    return this.http.post(APIvars.APIdomain + "/" + APIvars.GET_USERDATA_BY_ID, { id, fields: fields ? fields : null }).toPromise();
  }

  exists(field, value) {
    return this.http.post(APIvars.APIdomain + "/" + APIvars.EXISTS, { field, value }).toPromise();
  }

  markNotificationRead(id) {
    // const query = typeof id === 'string' ? [id] : id;  
    return this.http.post(APIvars.APIdomain + '/' + APIvars.SET_NOTIFICATION_SEEN, { notifid: typeof id === 'string' ? [id] : id }).toPromise();
  }

  markAllNotificationsRead() {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.READ_ALL_NOTIFICATIONS).toPromise();
  }

  getUserByMention(searchword) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.SEARCH_USER_FOR_MENTION + '/' + searchword).toPromise();
  }

  savePost(post) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.ADD_POST, { post }).toPromise();
  }

  getPosts(pageNo?, author?) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.GET_POSTS, { pageNo, userid: author }).toPromise();
  }

  deletePostById(id) {
    return this.http.delete(APIvars.APIdomain + '/' + APIvars.DELETE_POST_BY_ID + '/' + id).toPromise();
  }

  addRemoveLike(postid) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.ADD_REMOVE_LIKE, { postid }).toPromise();
  }

  setPostImage(encodedImageForm) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.SET_POST_IMAGE, encodedImageForm, { reportProgress: true, observe: 'events' });
  }

  async getMediaFromPostId(postid, imageName?) {
    let image = null;
    // console.log("getting ", type, 'for id ', id);
    if (postid) {
      image = await this._http.post(APIvars.APIdomain + '/' + APIvars.GET_POST_MEDIA_BY_ID, { postid }, { responseType: 'blob' }).toPromise();
    }

    // console.log("image =  ",type, image);
    if (image['type'] === 'application/json') return null;

    const readerResult: any = await this.readAsDataURL(image);
    const domParsed = this._dom.bypassSecurityTrustResourceUrl(readerResult);
    // save dp for future references:
    return domParsed;
  }

  removeUserImage(type) {
    return this.http.get(APIvars.APIdomain + "/" + APIvars.DELETE_DP_OR_COVER + "/" + type).toPromise();
  }

  getSimilarUsers(location, attributes?, pageNo?) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.GET_SUGGESTED_USERS, { location, attributes, pageNo }).toPromise();
  }

  getNowPlayingOfFollowing(pageNo?: Number, userlist?) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.GET_NP_OF_FOLLOWERS, { pageNo, userlist }).toPromise();
  }

  removeFollowing(userid) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.REMOVE_FOLLOWER + '/' + userid).toPromise();
  }

  likeNowPlaying(npid) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.LIKE_NP, { npid }).toPromise();
  }

  deleteNowPlayingPost(npid) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.DELETE_NP_POST, { npid }).toPromise();
  }

  getWhoLiked(npid) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.GET_WHO_LIKED + '/' + npid).toPromise();
  }

  addPlays(npid) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.ADD_PLAYS + '/' + npid).toPromise();
  }

  getPostDetails(npid) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.NP_POST_WITH_DETAILS + '/' + npid).toPromise();
  }

  addComment(npfeedid, comment) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.ADD_COMMENT, { npfeedid, comment }).toPromise();
  }

  getCommentsOnNp(npfeedid) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.GET_COMMENTS_ON_NP, { npfeedid }).toPromise();
  }

  deleteNpComment(npfeedid, commentid) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.NP_DELETE_COMMENT, { npfeedid, commentid }).toPromise();
  }

  deleteAccount(reasonsAndRate) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.DELETE_ACCOUNT, reasonsAndRate).toPromise();
  }

  getEula() {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.GET_EULA).toPromise();
  }

  getActiveNPusers(pageNo?) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.ACTIVE_NOW_PLAYING_USERS, { pageNo }).toPromise();
  }

  saveFeedback(rating, text) {
    return this.http.post(APIvars.APIdomain + '/' + APIvars.FEEDBACK, { rating, text }).toPromise();
  }

  getUserProfileData(userid) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.APIsignup + '/' + userid).toPromise();
  }

  getGameName(searchword) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.GET_GAMEDATA + '/' + searchword).toPromise();
  }

  searchUser(searchword) {
    return this.http.get(APIvars.APIdomain + '/' + APIvars.SEARCH_USER + '/' + searchword).toPromise();
  }

  getLastActive(userid) {
    return this._http.get(APIvars.APIdomain + '/' + APIvars.LAST_ACTIVE + '/' + userid).toPromise();
  }
}