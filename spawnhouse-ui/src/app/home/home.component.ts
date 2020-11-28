import { Component, OnInit } from '@angular/core';
import { FloatNotificationService } from 'src/assets/services/float-notification.service';
import { StorageService } from 'src/assets/services/storage.service';
import { UserService } from 'src/assets/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private _notifService: FloatNotificationService, private _storageService: StorageService) { }

  ngOnInit(): void {
    this._notifService.checkForLocation();
  }

}
