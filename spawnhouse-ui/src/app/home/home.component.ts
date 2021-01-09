import { Component, OnInit } from '@angular/core';
// import { Title } from '@angular/platform-browser';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
// import { GetServersideEventService } from 'src/assets/services/get-serverside-event.service';
import { StorageService } from 'src/assets/services/storage.service';
import { UserService } from 'src/assets/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  gotdata = 'gotdata';
  targerUser: String;
  constructor(private _notifService: FloatNotificationService, private _storageService: StorageService,
    // private _getsseService: GetServersideEventService,
    private _userService: UserService) {}
  ngOnInit(): void {
    this._notifService.checkForLocation();
    // console.log('getting service data');
    this._notifService.setTitle(JSON.parse(this._storageService.getSessionData('user'))['fname']+' | Home');
    // this._getsseService.getServersideEvent('http://localhost:3000/event/message').subscribe(data => {
    //   this.gotdata = this.gotdata+data['data'];
    // });
  }

  sendMessage(minimessageObject) {
    this._userService.sendMessage(minimessageObject.targetUser, minimessageObject.message);
  }
}
