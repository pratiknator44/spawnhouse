import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
})
export class RedirectComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit(): void {
    this._router.navigate(['/login']);
  }

}
