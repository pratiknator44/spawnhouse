import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/assets/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private _storageService: StorageService,
              private _router: Router ) { }

  ngOnInit(): void {
  }

  logout() {
    this._storageService.deleteSessionData('sh_auth_token');
    this._router.navigate(['./login']);
  }
}
