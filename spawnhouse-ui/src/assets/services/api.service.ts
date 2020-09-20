import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { APIvars } from '../variables/api-vars.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
@Injectable()
export class APIservice {


  dpUrl: any; // contains the local address of the current user dp
  coverUrl: any;
  coverPictureSubject = new Subject<any>();
  coverPictureObservable;
  // dpSubject = new Subject<any>();
  // dpObservale;

  constructor(private _http: HttpClient, private _dom: DomSanitizer) {}

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
      console.log("get cover called ", image);

      // remove blank img tag border if size is less than 30 bytes
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
      console.log("dp url = ");
    });
  }
}