import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  onlineStatus = 2;
  basicInfoToggle = false;
  mymediaToggle = false;
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
  constructor( private _storageService : StorageService) { }
  
  ngOnInit(): void {
    this.user = this._storageService.currentUser;
    console.log('current user = ', this.user);
    this.onlineStatus = 1;
  }

  getMedia(mediaType:string) {
    this.selectedMedia = mediaType;
  }
}
