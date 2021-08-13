import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'loader2',
  templateUrl: './loader2.component.html',
  styleUrls: ['./loader2.component.scss']
})
export class Loader2Component implements OnInit {
  @Input() type: Number | String;
  constructor() { }

  ngOnInit(): void {
  }

}
