import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';

@Component({
  selector: 'sh-all-notifications',
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.scss']
})
export class AllNotificationsComponent implements OnInit {

  constructor(private _storageService: StorageService) { }

  ngOnInit(): void {
  }

}
