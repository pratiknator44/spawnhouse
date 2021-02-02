import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { APIservice } from 'src/assets/services/api.service';
// import { Title } from '@angular/platform-browser';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { SocketService } from 'src/assets/services/socket.service';
// import { GetServersideEventService } from 'src/assets/services/get-serverside-event.service';
import { StorageService } from 'src/assets/services/storage.service';
import { APIvars } from 'src/assets/variables/api-vars.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userSuggestions = [];
  
  constructor(private _notifService: FloatNotificationService,
    private _storageService: StorageService,
    private _apiService: APIservice,
    private _socketService: SocketService) {
    }


  ngOnInit(): void {
    this._notifService.checkForLocation();
    this._notifService.setTitle(JSON.parse(this._storageService.getSessionData('user'))['fname']+' | Home');

  }

  searchThis(wordForUser) {
    this.userSuggestions = [];

    this._apiService.http.get(APIvars.APIdomain+'/'+APIvars.SEARCH_USER+'/'+wordForUser).pipe(debounceTime(1000)).subscribe( res => {
      if(res['users'].length > 0) {
        let userid = [];
        console.log("users = ", res['users']);
        res['users'].forEach( user => {
          userid.push(user._id);
        });
      }
    });
  }

  TEST_socketBroadcast() {
    this._socketService.pushData('new-notification', {type: "broadcast", sendTo: "following", sentBy: this._storageService.currentUser._id});
  }


}
