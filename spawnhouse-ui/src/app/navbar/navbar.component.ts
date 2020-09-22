import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IPictureUploadSchema } from 'src/assets/interfaces/picture-upload-schema.interface';
import { NavbarService } from 'src/assets/services/navbar.service';
import { OverlayService } from 'src/assets/services/overlay.service';
import { HttpClient } from '@angular/common/http';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  elongate: boolean;
  selectedOption: boolean;
  options = [];
  searchSuggestions: any = [];
  hoveringOn = '';
  showSuggestions: boolean;
  dp: any;
  userSearch = '';
  user;
  showUserOptions: boolean;
  dpSubject = new Subject<any>();
  dpObservale;
  imageSchema: IPictureUploadSchema;
  noUserFound: boolean;

  @Input() imageUploadMode: string;
  
  @Output() onPicUpdate = new EventEmitter(); 
  constructor(private _storageService: StorageService,
    private _api: APIservice,
    private _dom: DomSanitizer,
    private _router: Router,
    private _navbarService: NavbarService,
    private _overlayService: OverlayService,
    private _http: HttpClient ) { }

  ngOnInit(): void {
    this.options = [
      { name: 'Home', icon: 'home', alert: 0},
      { name: 'Friends', icon: 'users', alert: 2 },
      { name: 'Streams', icon: 'display', alert: 0 },
      { name: 'Notifcations', icon: 'bell', alert: 99 },
      { name: 'Messages', icon: 'bubbles', alert: 3 }]
     // { name: 'Settings & Privacy', icon: 'cog', alert: 0 }];
      
    this.selectedOption = this.options[0].name;
    // call profile picture api
    this.user = JSON.parse(sessionStorage.getItem('user'));
    // this.dp = this._api.getDp();
    this.getDp();
    this._navbarService.getDpSubject.asObservable().subscribe( status => {
      if(status) this.getDp();
    });
    this._overlayService.closeSubject.asObservable().subscribe( closeOptions => {
      this.showUserOptions = false; this.showSuggestions = false;
    });
  }

  searchThis(event) {
    console.log(event);
    if(this.userSearch.length < 3) {
      this._overlayService.closeSubject.next();
      return;
    }
    this.noUserFound = false;
    this.showSuggestions = true;
    this.searchSuggestions = [];
    this._overlayService.configSubject.next({transparent: true, closeOnClick: true });

    setTimeout( () => {
        this._http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+this.userSearch).subscribe( res => {
          console.log(res);
          this.searchSuggestions = res['users'];
          if(this.searchSuggestions.length === 0){
            this.noUserFound = true;
          }
        });
    }, 2000);
  }

  logout() {
    this._storageService.deleteSessionData('sh_auth_token');
    this._router.navigate(['./login']);
  }

  getDp() {
    this._api.getPhotos('dp').subscribe( image => {
      console.log("get Dp called ", image);

      // if image size is less than 03 bytes
      if(image.size < 30) {
        this.onPicUpdate.emit({type: 'dp', src: null});
        return;
      }
      // convert raw image to Blob object
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.dp = this._dom.bypassSecurityTrustResourceUrl(reader.result.toString());
        this._storageService.dpLink = this.dp;
        this.onPicUpdate.emit({type: 'dp', src: this.dp});
        this._navbarService.dpUpdated.next({type: 'dp', src: this.dp});
        console.log("dp emitted ", this.dp);
      }, false);
      if (image) {
         reader.readAsDataURL(image);
      }
    });
  }

  showOverlay() {
  }

  userOptions() {
    this.showUserOptions = !this.showUserOptions; this.showSuggestions = !this.showSuggestions;
    if(!this.showUserOptions) {
      this._overlayService.closeSubject.next();
    } else {
      this._overlayService.configSubject.next({transparent: true, closeOnClick: true });
    }
  }

}
