import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sh-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  @Input() progress = 0;
  @Input() text: string;
  constructor() { }
  ngOnInit(): void {
  }

}
