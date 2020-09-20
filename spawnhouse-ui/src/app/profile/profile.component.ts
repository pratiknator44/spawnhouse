import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';
import { NavbarComponent } from '../navbar/navbar.component';
import { APIservice } from 'src/assets/services/api.service';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  onlineStatus = 2;
  basicInfoToggle = false;
  mymediaToggle = false;
  imageSchema: IPictureUploadSchema;
  uploadMode: string;
  mediaArray = [
                {name: 'All', value: 'all', total: 0},
                {name: 'Photos', value: 'pics', total: 0},
                {name: 'Videos', value: 'vids', total: 0},
                {name: 'Text & Audio', value: 'tna', total: 0},
                {name: 'Saved', value: 'saved', total: 0},
                {name: 'Liked', value: 'liked', total: 0}
              ];
  selectedMedia = this.mediaArray[0].value;
  user;
  userdp: any;
  usercover: any;
  showOverlay: boolean;
  newDpCoverForm: FormGroup;
  disableImageUpload: boolean = false;
  @ViewChild('overlay') overlay: ElementRef;
  @ViewChild('navbar', {static: true}) navbar: NavbarComponent;

  constructor( private _storageService : StorageService, private http: HttpClient, private _apiService: APIservice, private _notifService: FloatNotificationService) { }
  
  ngOnInit(): void {
    this.user = this._storageService.currentUser;
    console.log('current user = ', this.user);
    this.onlineStatus = 1;
    console.log(this._storageService.dpLink);
    this.userdp = this._storageService.dpLink;

    this._apiService.getCover();
    this._apiService.coverPictureSubject.subscribe( coverurl => {
      console.log("event ", coverurl);
      this.usercover = coverurl.coverurl;
    })
    console.log('userdp ', this.userdp);
    console.log('usercover ', this.usercover);
  }

  getMedia(mediaType:string) {
    this.selectedMedia = mediaType;
  }

  updateNewDpCover() {
    
  }

  checktoken() {
    this.http.post('http://localhost:3000/login/testtoken', {}).subscribe( data => {
      console.log('from token check api ', data);
    })
  }
  getuploadUI() {
    this.http.get('http://localhost:3000/ssr/dpUploadUI').subscribe( data => {
      this.overlay.nativeElement.innerHTML = data['DOM'];
    });
  }

  submitNewImage(fd) {
    let imageApi: string;
    this.disableImageUpload = true;
    if ( this.uploadMode === 'dp') 
    {
      imageApi = APIvars.APIdomain+'/'+ APIvars.SET_DP;
    } else if ( this.uploadMode === 'cover') {
      imageApi = APIvars.APIdomain+'/'+APIvars.SET_COVER;
    }
    let isOpenFlag = true;    // if false, the subject to keep open floating notice is not triggered
    this.http.post(imageApi, fd, {reportProgress: true, observe: 'events'}).subscribe( result => {
      if(isOpenFlag) {
        this._notifService.closeOn.next(true);
        isOpenFlag = false;
      }
      if(result.type === HttpEventType.UploadProgress) {
        this.showOverlay = false;
        this._notifService.progress.next(Math.round(result['loaded']*100/result['total'])+'%');
      }
      else if (result.type === HttpEventType.Response) {
        console.log('event done ', result['message']);
        this._notifService.closeOn.next(false);
      }
      console.log('result.message ', result["message"]);
      if((result as HttpResponse<any>).body?.message === 'passed') {
        this.disableImageUpload = false;
        setTimeout(() => {
          this.uploadMode === 'dp' ? this.navbar.getDp() : this._apiService.getCover();
          this.showOverlay = false;
        }, 1000);
      }
      console.log(result);
    });
  }

  updatePic(event) {
    console.log("update dp in profile ", event);
    if(event.type === 'dp') {
      this.userdp = event.src;
      this.showOverlay = false;
      // console.log('userdp', this.userdp);
    }
  }

  setupImageUpload(isDp?) {
    if( isDp) {
      this.imageSchema = {
        aspectRatio: 1/1,
        format: 'jpg',
        resizeToWidth: '300',
        maintainAspectRatio: true
      }
      this.uploadMode = 'dp';
    }
    else {
      this.imageSchema =
      {
        aspectRatio: 1139/240,
        format: 'jpg',
        resizeToWidth: '1000',
        maintainAspectRatio: true
      }
      this.uploadMode = 'cover';
    }
    this.showOverlay = true;
  }

  setupCoverPhotoUpload() {
    this.showOverlay = true;
  }

  refreshImage() {
    console.log('upload mode ', this.uploadMode);
    if(this.uploadMode === 'dp') {
      this.navbar.getDp();
    } else if(this.uploadMode === 'cover') {
      this._apiService.getCover();
      this.showOverlay = false;
    }
  }

  getCover() {      // get cover picture
  //   this._apiService.getPhotos('cover').subscribe( image => {
  //     console.log("get cover called")
  //     // convert raw image to Blob object
  //     let reader = new FileReader();
  //     reader.addEventListener('load', () => {
  //       this.usercover = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
  //       this._storageService.dpLink = this.dp;
  //       this.onPicUpdate.emit({type: 'dp', src: this.dp});
  //       console.log("dp emitted");
  //     }, false);
  
  //     if (image) {
  //        reader.readAsDataURL(image);
  //     }
  //     console.log("dp url = ", this.dp);
  //   });
  // }
  }
}
