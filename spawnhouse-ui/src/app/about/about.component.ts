import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() { }
  option = 'about';
  ngOnInit(): void {
  }

  openOption(op) {
    this.option = op;
  }

}
