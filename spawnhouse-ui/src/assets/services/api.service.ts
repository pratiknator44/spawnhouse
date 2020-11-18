import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { APIvars } from '../variables/api-vars.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { StorageService } from './storage.service';
@Injectable()
export class APIservice {


  dpUrl: any; // contains the local address of the current user dp
  coverUrl: any;
  coverPictureSubject = new Subject<any>();
  dpObservable;
  dpSubject = new Subject<any>();
  coverPictureObservable;
  user: IUser;

  constructor(private _http: HttpClient, private _dom: DomSanitizer, private _storageService: StorageService) {}

  getPhotos(type?) {
    if(type === 'dp') {
        return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_DP,  { responseType: 'blob' });
    }
    else if(type === 'cover') {
      return this._http.get(APIvars.APIdomain+'/'+APIvars.GET_COVER,  { responseType: 'blob' });
    }
  }
  
  getCover() {      // get cover picture
    this.getPhotos('cover').subscribe( image => {

      if(image.size < 30) {
        this.coverPictureSubject.next( {coverurl: null});
        this.coverPictureObservable = this.coverPictureSubject.asObservable();
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.coverUrl = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        // this.onPicUpdate.emit({type: 'dp', src: this.dp});
        // console.log("dp emitted");
        this.coverPictureSubject.next({ coverurl: this.coverUrl});
        this.coverPictureObservable = this.coverPictureSubject.asObservable();
      }, false);
  
      if (image) {
         reader.readAsDataURL(image);
      }
    });
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
}