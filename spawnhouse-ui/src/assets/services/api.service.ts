import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { APIvars } from '../variables/api-vars.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { StorageService } from './storage.service';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _dom: DomSanitizer,
    private _activeRoute: ActivatedRoute,
    private _storageService: StorageService) {
      this.http = this._http;
      this.router = this._router;
      this.dom = this._dom;
      this.activatedRoute = this._activeRoute;
    }

  getPhotos(type?) {
    if(type === 'dp') {
        return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_DP,  { responseType: 'blob' });
    }
    else if(type === 'cover') {
      return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER,  { responseType: 'blob' });
    }
  }
  
  // getCover() {      // get cover picture
  //   this.getPhotos('cover').subscribe( image => {

  //     if(image.size < 30) {
  //       this.coverPictureSubject.next( {coverurl: null});
  //       this.coverPictureObservable = this.coverPictureSubject.asObservable();
  //       return;
  //     }
  //     // convert raw image to Blob object
  //     let reader = new FileReader();
  //     reader.addEventListener('load', () => {
  //       this.coverUrl = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
  //       // this.onPicUpdate.emit({type: 'dp', src: this.dp});
  //       // console.log("dp emitted");
  //       this.coverPictureSubject.next({ coverurl: this.coverUrl});
  //       this.coverPictureObservable = this.coverPictureSubject.asObservable();
  //     }, false);
  
  //     if (image) {
  //        reader.readAsDataURL(image);
  //     }
  //   });
  // }

  async getCover() {
    const image =  await this._http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER,  { responseType: 'blob' }).toPromise();
    if(image['type'] === 'application/json')
      return null;
    
    const readerResult: any = await this.readAsDataURL(image);
    return this._dom.bypassSecurityTrustResourceUrl(readerResult);
  }

  async getUserImageById(type: string, id: string) {
    let image = null;
    console.log("getting ", type, 'for id ', id);
    if(type === 'dp')
      image = await this._http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).toPromise();
    else if(type === 'cover') {
      console.log("Calling url ", APIvars.APIdomain+'/'+APIvars.GET_COVER_OF_USER+'/'+id);
      image = await this._http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER_OF_USER+'/'+id,  { responseType: 'blob' }).toPromise();
    }
    else return null;

    console.log("image =  ",type, image);
    if(image['type'] === 'application/json') return null;
    
    const readerResult: any = await this.readAsDataURL(image);
    return this._dom.bypassSecurityTrustResourceUrl(readerResult);
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

  getImagePromise(type, id) {
    if(type === 'dp')
      return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_DP_OF_USER+'/'+id, { responseType: 'blob' }).toPromise();
    else if(type === 'cover') {
      return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER_OF_USER+'/'+id,  { responseType: 'blob' }).toPromise()
    }
  }

  async geturl(image) {
    const reader = new FileReader();
    return await
    reader.addEventListener('load', () => {
      // this.coverUrl = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      console.log("image loaded ", this.coverUrl);
      // this.onPicUpdate.emit({type: 'dp', src: this.dp});
      // console.log("dp emitted");
      return this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
      this.coverPictureSubject.next({ coverurl: this.coverUrl});
      this.coverPictureObservable = this.coverPictureSubject.asObservable();
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  

  getDp() {
    this.getPhotos('dp').subscribe( image => {

      if(image.size < 30) {
        this.dpSubject.next( {dpUrl: null});
        this.dpObservable = this.dpSubject.asObservable();
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dpUrl = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        // this.onPicUpdate.emit({type: 'dp', src: this.dp});
        // console.log("dp emitted");
        this.dpSubject.next({ dpUrl: this.dpUrl});
        this.dpObservable = this.dpSubject.asObservable();
      }, false);
  
      if (image) {
         reader.readAsDataURL(image);
      }
    });
  }

      
  getNowPlaying() {
    this._http.get(APIvars.APIdomain+'/'+APIvars.NOW_PLAYING).subscribe( np => {
      // console.log('***now playing', np);
      this._storageService.nowplaying = np['np'][0];
      this._storageService.currentUser['nowplaying'] = np['np'][0];
    });
  }

  async getGamedata() {
    return await this._http.get(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA).toPromise()
    // .then(resolve => {return resolve['result']});
  }

  async addRemoveFollower(currentFollowStatus, userid) {
    const operation = currentFollowStatus === 'Follow' ? 'add' : 'sub';
    console.log("seinding to ... ", APIvars.APIdomain+'/'+APIvars.SET_FOLLOWING+'/'+operation+'/'+userid);
    return this._http.get(APIvars.APIdomain+'/'+APIvars.SET_FOLLOWING+'/'+operation+'/'+userid).toPromise();
    // subscribe(result => {
      // this.followStatus = result['status'];
      // this.user.followdata.followerCount = result['followerCount'];  
  }  

  getMessagesByChatid(chatid) {
    if(chatid)
      return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_MESSAGES_BY_ID+'/'+chatid);
  }

  getFollowDataById(id) {
    // const id = id ? '' : id;
    return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_FOLLOWDATA+'/'+id).toPromise();
  }

  removeNowPlaying() {
    return this._http.delete(APIvars.APIdomain+'/'+APIvars.REMOVE_NOW_PLAYING).toPromise()
  }

  updatePlayerType(playerType) {
    return this.http.post(APIvars.APIdomain+'/'+APIvars.SET_USER_GAMEDATA, {playerType}).toPromise();
  }
  
  getUsersAround(location, distance?: number) {
    return this.http.post(APIvars.APIdomain+'/'+APIvars.GET_USERS_AROUND, {location, distance}).toPromise();
  }

}