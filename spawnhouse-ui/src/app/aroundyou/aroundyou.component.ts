import { Component, OnInit } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'app-aroundyou',
  templateUrl: './aroundyou.component.html',
  styleUrls: ['./aroundyou.component.scss']
})
export class AroundyouComponent implements OnInit {

  location: any= 'afae';

  dpLink; // temp
  userSuggestions = [];
  constructor(private _storageService: StorageService, private _floatNotifService: FloatNotificationService) { }

  ngOnInit(): void {

    this.userSuggestions = [
      {_id: '123478', username: 'flashborne', fname: 'Mohit', basis: 'within 5km', youFollow: false},
      {_id: '568', username: 'hulk614', fname: 'Ayush', basis: 'also plays PUBG', youFollow: false},
      {_id: 'ad', username: 'atherocks', fname: 'Arunabh', basis: 'also plays Valorant', youFollow: true},
      {_id: 'advad', username: 'assassinator', fname: 'Shivam', basis: 'likes Racing games', youFollow: false},
      {_id: '123brws478', username: 'hawkeye', fname: 'Sudama', basis: 'plays GTA V', youFollow: false},
    ]

    // this.location = JSON.parse(this._storageService.getSessionData('location'));
    // console.log(this.location);
    // this._floatNotifService.checkForLocation();
    // this._floatNotifService.getLocationSubject.asObservable().subscribe(location => {
    //   this.location = location;
    // });
    this.location = '@@@@@';
    this._floatNotifService.getLocationToast();

    this.dpLink = this._storageService.dpLink;
  }
  
  removeByIndex(i: number) {
    this.userSuggestions.splice(i,1);
  }

}
