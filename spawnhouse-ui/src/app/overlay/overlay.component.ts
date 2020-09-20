import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sh-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  @Input() overNav: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
