import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';

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
  constructor(private _storageService: StorageService,
              private _router: Router ) { }

  ngOnInit(): void {
    this.options = [
      { name: 'Home', icon: 'home' },
      { name: 'Friends', icon: 'users' },
      { name: 'Streams', icon: 'display' },
      { name: 'Notifcations', icon: 'bell' },
      { name: 'Messages', icon: 'bubbles' },
      { name: 'Settings & Privacy', icon: 'cog' }];
      
    this.selectedOption = this.options[0];
    this.searchSuggestions =  [
      { name: 'Pratik Agarwal', username: 'accesspratik' },
      { name: 'Pragya Agarwal', username: 'supercoolprags' },
      { name: 'Ayush Mittal', username: 'ayushm2004' },
      { name: 'Shivam Singh', username: 'shivamsvm' }
    ];
  }

  searchThis(event) {
    console.log(event);
  }

  logout() {
    this._storageService.deleteSessionData('sh_auth_token');
    this._router.navigate(['./login']);
  }
}
