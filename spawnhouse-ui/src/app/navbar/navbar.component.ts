import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';
import { APIservice } from 'src/assets/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  elongate: boolean;
  selectedOption: boolean;
  options = [];
  searchSuggestions = [];
  ishover = '';
  showSuggestions: boolean;
  dp: any;
  user;
  showUserOptions: boolean;
  dpSubject = new Subject<any>();
  dpObservale;

  @Output() onPicUpdate = new EventEmitter(); 
  constructor(private _storageService: StorageService, private _api: APIservice, private _dom: DomSanitizer,  private _router: Router ) { }

  ngOnInit(): void {
    this.options = [
      { name: 'Home', icon: 'home', alert: 0},
      { name: 'Friends', icon: 'users', alert: 2 },
      { name: 'Streams', icon: 'display', alert: 0 },
      { name: 'Notifcations', icon: 'bell', alert: 99 },
      { name: 'Messages', icon: 'bubbles', alert: 3 }]
     // { name: 'Settings & Privacy', icon: 'cog', alert: 0 }];
      
    this.selectedOption = this.options[0].name;
    this.searchSuggestions =  [
      { name: 'Pratik Agarwal', username: 'accesspratik' },
      { name: 'Pragya Agarwal', username: 'supercoolprags' },
      { name: 'Ayush Mittal', username: 'ayushm2004' },
      { name: 'Shivam Singh', username: 'shivamsvm' }
    ];

    // call profile picture api
    this.user = this._storageService.currentUser;
    // this.dp = this._api.getDp();
    this.getDp();
  }

  searchThis(event) {
    console.log(event);
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
        console.log("dp emitted ", this.dp);
      }, false);
      if (image) {
         reader.readAsDataURL(image);
      }
    });
  }
}
